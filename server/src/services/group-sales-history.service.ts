import prisma from "../utils/prisma.utils";

type Input = {
  producttype: string;
  startDate?: Date;
  endDate?: Date;
};

const endOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};

const groupSalesHistoryService = {
  getByProductType: async ({ producttype, startDate, endDate }: Input) => {
    // 1. Build WHERE for order_item joined to order + product
    const where: any = {
      product: { producttype },
      // Only include PAID orders to match dashboard total sales
      order: {
        status: 'PAID'
      }
    };

    if (startDate || endDate) {
      // If dates provided, add date filter to existing order filter
      where.order.date = {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endOfDay(endDate) } : {}),
      };
    }

    // 2. Pull raw order_items with full order details
    // We'll grab: order_id, product_id, quantity, product info, order status/date/total_amount
    const items = await prisma.order_item.findMany({
      where,
      select: {
        order_id: true,
        product_id: true,
        quantity: true,
        order: {
          select: {
            order_id: true,
            date: true,
            status: true,
            total_amount: true,  // Get actual order total
            total_price: true,   // Get actual price
          },
        },
        product: {
          select: {
            product_id: true,
            product_name: true,
            brand: true,
            producttype: true,
          },
        },
      },
      orderBy: { order_id: "desc" },
    });

    // short circuit
    if (items.length === 0) {
      return {
        status: true,
        orders: [],
        products: [],
        summary: {
          order_count: 0,
          total_products: 0,
          total_quantity: 0,
          total_revenue: 0,
        },
      };
    }

    // 3. Get latest lot.sell_price per product_id
    // We'll fetch lots for all product_ids involved, ordered by added_date desc
    const productIds = Array.from(new Set(items.map((i) => i.product_id)));

    // pull all lots for these product_ids, newest first
    const lots = await prisma.lot.findMany({
      where: { product_id: { in: productIds } },
      orderBy: { added_date: "desc" },
      select: {
        product_id: true,
        sell_price: true,
        added_date: true,
      },
    });

    // build product -> unit_price map using the most recent lot
    // (first lot we see in 'lots' for that product_id since it's desc by added_date)
    const priceByProduct = new Map<number, number>();
    for (const lot of lots) {
      const pid = lot.product_id ?? null;
      if (pid == null) continue;
      if (!priceByProduct.has(pid)) {
        const unitPrice = Number(lot.sell_price ?? 0);
        priceByProduct.set(pid, unitPrice);
      }
    }

    // 4. Build per-order output (mostly for reference / drilldown in UI if needed)
    type OrderOut = {
      order_id: number;
      date: Date | null;
      status: string | null;
      items: Array<{
        product_id: number;
        product_name: string | null;
        brand: string | null;
        quantity: number;
        unit_price: number;     // from lot
        line_total: number;     // quantity * unit_price
      }>;
    };

    const orderMap = new Map<number, OrderOut>();

    // 5. Build per-product aggregation
    type ProductAgg = {
      product_id: number;
      product_name: string | null;
      brand: string | null;
      total_quantity: number;
      unit_price: number;     // assumed selling price per unit
      total_revenue: number;  // total_quantity * unit_price
      sale_count: number;     // distinct orders containing this product
    };
    const productAgg = new Map<number, ProductAgg>();
    const productOrderSet = new Map<number, Set<number>>();

    let summary_total_qty = 0;
    let summary_total_revenue = 0;
    
    // Track unique order totals for accurate summary
    const orderTotalsMap = new Map<number, number>();

    for (const it of items) {
      const pid = it.product_id;
      const qty = Number(it.quantity ?? 0);
      const orderId = it.order_id;
      
      // Collect actual order total_amount for summary calculation
      if (!orderTotalsMap.has(orderId)) {
        const actualOrderTotal = Number(it.order?.total_amount ?? 0);
        orderTotalsMap.set(orderId, actualOrderTotal);
      }

      // find unit price from latest lot for this product
      const unitPrice = priceByProduct.get(pid) ?? 0;
      const lineTotal = unitPrice * qty;

      // ensure order bucket
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          order_id: orderId,
          date: it.order?.date ?? null,
          status: it.order?.status ?? null,
          items: [],
        });
      }
      const outOrder = orderMap.get(orderId)!;
      outOrder.items.push({
        product_id: pid,
        product_name: it.product?.product_name ?? null,
        brand: it.product?.brand ?? null,
        quantity: qty,
        unit_price: unitPrice,
        line_total: lineTotal,
      });

      // per-product agg
      if (!productAgg.has(pid)) {
        productAgg.set(pid, {
          product_id: pid,
          product_name: it.product?.product_name ?? null,
          brand: it.product?.brand ?? null,
          total_quantity: 0,
          unit_price: unitPrice,
          total_revenue: 0,
          sale_count: 0,
        });
        productOrderSet.set(pid, new Set<number>());
      }

      const agg = productAgg.get(pid)!;
      const seenOrders = productOrderSet.get(pid)!;

      agg.total_quantity += qty;
      agg.total_revenue += lineTotal;

      // keep last known unit_price for that product (if lots changed mid-range,
      // this uses the newest price we saw, which is fine for now)
      agg.unit_price = unitPrice;

      summary_total_qty += qty;
      summary_total_revenue += lineTotal;

      if (!seenOrders.has(orderId)) {
        seenOrders.add(orderId);
        agg.sale_count += 1;
      }
    }

    // 6. Sort outputs for frontend
    const orders = Array.from(orderMap.values()).sort((a, b) => b.order_id - a.order_id);

    const products = Array.from(productAgg.values())
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .map((p) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.brand,
        total_quantity: p.total_quantity,
        unit_price: p.unit_price,
        total_revenue: p.total_revenue,
        sale_count: p.sale_count,
      }));

    // Calculate actual total revenue from order totals (not recalculated from lot prices)
    const actualTotalRevenue = Array.from(orderTotalsMap.values()).reduce((sum, orderTotal) => sum + orderTotal, 0);

    const summary = {
      order_count: orders.length,
      total_products: products.length,
      total_quantity: summary_total_qty,
      total_revenue: actualTotalRevenue,  // Use actual order totals, not calculated from lot prices
    };

    return {
      status: true,
      orders,
      products,
      summary,
    };
  },
};

export default groupSalesHistoryService;
