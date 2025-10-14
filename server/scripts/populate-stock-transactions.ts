import prisma from "../src/utils/prisma.utils";

async function populateStockTransactions() {
  try {
    console.log('🔍 Finding lots without stock transactions...');
    
    // Get all lots that don't have any stock transactions
    const lotsWithoutTransactions = await prisma.lot.findMany({
      where: {
        stock_transaction: {
          none: {}
        }
      },
      include: {
        product: true
      }
    });

    console.log(`📦 Found ${lotsWithoutTransactions.length} lots without stock transactions`);

    if (lotsWithoutTransactions.length === 0) {
      console.log('✅ All lots already have stock transactions!');
      return;
    }

    // Create initial stock transactions for each lot
    for (const lot of lotsWithoutTransactions) {
      console.log(`📝 Creating stock transaction for lot: ${lot.lot_no} (ID: ${lot.lot_id})`);
      
      const stockTransaction = await prisma.stock_transaction.create({
        data: {
          trans_type: 'IN',
          qty: lot.init_amount,
          trans_date: lot.added_date,
          ref_no: `LOT-${lot.lot_no}`,
          note: `Initial stock for lot ${lot.lot_no}`,
          lot_id_fk: lot.lot_id
        }
      });

      console.log(`✅ Created transaction ID: ${stockTransaction.stock_trans_id}`);
    }

    console.log('🎉 Successfully created stock transactions for all lots!');
    
    // Verify results
    const totalTransactions = await prisma.stock_transaction.count();
    console.log(`📊 Total stock transactions in database: ${totalTransactions}`);

  } catch (error) {
    console.error('❌ Error populating stock transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateStockTransactions();
