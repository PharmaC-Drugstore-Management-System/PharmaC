import prisma from "../utils/prisma.utils";

const orderService = {
    create: async(items: any[], employee_id: number, point:number,customer_id: number, total_amount: number, total_price: number) => {
        try {
            // Step 1: Create cart items with full details
            const cartItems = await prisma.cart.createMany({
                data: items.map(item => ({
                    product_id: item.product_id,
                    amount: item.quantity, // Store quantity in amount field
                    unit_price: item.price
                }))
            });

            console.log(`Created ${cartItems.count} cart items`);

            // Step 2: Get the created cart items (since createMany doesn't return the records)
            const createdCartItems = await prisma.cart.findMany({
                where: {
                    product_id: { in: items.map(item => item.product_id) }
                },
                orderBy: { cart_id: 'desc' },
                take: items.length,
                include: {
                    product: true
                }
            });

            // Step 3: Extract cart IDs for the order
            const cartIds = createdCartItems.map(cart => cart.cart_id);

            // Step 4: Create single order first
            const order = await prisma.order.create({
                data: {
                    employee_id: employee_id,
                    customer_id:customer_id,
                    total_amount: total_amount,
                    total_price: total_price,
                    date: new Date(), // ใช้ timestamp แทน time+date แยก
                    status: 'PENDING'
                }
            });

            // Step 5: Update cart items to link them to the created order
            await prisma.cart.updateMany({
                where: {
                    cart_id: { in: cartIds }
                },
                data: {
                    order_id: order.order_id
                }
            });

            // Step 6: Get the complete order with linked carts and customer
            const completeOrder = await prisma.order.findUnique({
                where: { order_id: order.order_id },
                include: {
                    carts: {
                        include: {
                            product: true
                        }
                    },
                    customer: {
                        select: {
                            customer_id: true,
                            name: true,
                            phone_number: true,
                        }
                    }
                }
            });

            return {
                order: completeOrder,
                cart_items: createdCartItems,
                summary: {
                    total_items: items.length,
                    total_cart_items: cartItems.count,
                    cart_ids: cartIds,
                    order_id: order.order_id
                }
            };
            
        } catch (error) {
            console.error("Service error:", error);
            throw error;
        }
    },
    list : async () => {
        try {
            const data = await prisma.order.findMany({
                include: {
                    customer: {
                        select: {
                            customer_id: true,
                            name: true,
                            phone_number: true,
                            citizen_id: true
                        }
                    }
                },
                orderBy: {
                    order_id: 'desc'
                }
            })
            return data;
        } catch (error) {
             console.error("Service error get list order:", error);
            throw error;
        }
    },

    getRecentOrders: async (sinceDate: Date) => {
        try {
            console.log('🔍 Fetching recent orders since:', sinceDate);
            
            const data = await prisma.order.findMany({
                where: {
                    date: {
                        gte: sinceDate
                    }
                },
                include: {
                    customer: {
                        select: {
                            customer_id: true,
                            name: true,
                            phone_number: true,
                        }
                    },
                    carts: {
                        include: {
                            product: {
                                select: {
                                    product_name: true,
                                    brand: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    order_id: 'desc'  // เรียงตาม order_id แทน date
                },
                take: 20  // จำกัดผลลัพธ์
            });
            
            console.log('📊 Found orders:', data.length);
            console.log('🏆 Latest order ID:', data[0]?.order_id);
            console.log('📋 All order IDs:', data.map(o => o.order_id));
            
            return data;
        } catch (error) {
            console.error("Service error get recent orders:", error);
            throw error;
        }
    },

    // เพิ่มฟังก์ชันใหม่เพื่อดึง orders ล่าสุดโดยไม่จำกัดวันที่
    getLatestOrders: async (limit: number = 20) => {
        try {
            console.log('🔍 Fetching latest orders, limit:', limit);
            
            const data = await prisma.order.findMany({
                include: {
                    customer: {
                        select: {
                            customer_id: true,
                            name: true,
                            phone_number: true,
                        }
                    },
                    carts: {
                        include: {
                            product: {
                                select: {
                                    product_name: true,
                                    brand: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    order_id: 'desc'
                },
                take: limit
            });
            
            console.log('📊 Found latest orders:', data.length);
            console.log('🏆 Latest order ID:', data[0]?.order_id);
            console.log('📋 Latest order IDs:', data.slice(0, 5).map(o => o.order_id));
            
            return data;
        } catch (error) {
            console.error("Service error get latest orders:", error);
            throw error;
        }
    }
}

export default orderService;