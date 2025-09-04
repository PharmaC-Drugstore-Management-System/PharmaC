import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RotateCcw, Box, Search } from 'lucide-react';

type StockTransaction = {
    stock_trans_id: number;
    trans_type: 'IN' | 'OUT' | 'ADJUST';
    qty: number;
    trans_date: string;
    ref_no: string;
    note: string;
    lot_id_fk: number;
    lot?: {
        lot_id: number;
        lot_no: string;
        product_id: number;
        added_date: string;
        expired_date: string;
        cost: number;
        init_amount: number;
    };
};

// Stock Transactions Component
function StockTransactionsTab({ lotId }: { lotId: string }) {
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch stock transactions from API
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                setError(null);

                // Call the API endpoint to get stock transactions by lot ID
                const response = await fetch(`http://localhost:5000/stock/lot/${lotId}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Fetched transactions:', data);
                setTransactions(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
                console.error('Error fetching stock transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        if (lotId) {
            fetchTransactions();
        }
    }, [lotId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                        Loading stock transactions...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <Box className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-medium">Error loading transactions</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const getTransactionTypeIcon = (type: string) => {
        switch (type) {
            case 'IN':
                return <TrendingUp className="w-4 h-4" />;
            case 'OUT':
                return <TrendingDown className="w-4 h-4" />;
            case 'ADJUST':
                return <RotateCcw className="w-4 h-4" />;
            default:
                return <Box className="w-4 h-4" />;
        }
    };

    const getTransactionTypeColor = (type: string) => {
        switch (type) {
            case 'IN':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'OUT':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'ADJUST':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate statistics
    const totalIn = transactions
        .filter(t => t.trans_type === 'IN')
        .reduce((sum, t) => sum + t.qty, 0);
    
    const totalOut = Math.abs(transactions
        .filter(t => t.trans_type === 'OUT')
        .reduce((sum, t) => sum + t.qty, 0));
    
    const totalAdjust = transactions
        .filter(t => t.trans_type === 'ADJUST')
        .reduce((sum, t) => sum + t.qty, 0);

    return (
        <div>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="border rounded-lg p-4"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                Total IN
                            </div>
                            <div className="text-xl font-bold text-green-600">+{totalIn}</div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <div className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                Total OUT
                            </div>
                            <div className="text-xl font-bold text-red-600">-{totalOut}</div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center mr-3">
                            <RotateCcw className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <div className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                Adjustments
                            </div>
                            <div className="text-xl font-bold text-yellow-600">{totalAdjust}</div>
                        </div>
                    </div>
                </div>

                <div className="border rounded-lg p-4"
                     style={{
                       backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                       borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                     }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                            <Box className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-sm"
                                 style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                Net Stock
                            </div>
                            <div className="text-xl font-bold text-blue-600">{totalIn + totalOut + totalAdjust}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2"
                                style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}} />
                        <input
                            type="text"
                            placeholder="Search by reference number..."
                            className="pl-10 pr-4 py-2 border rounded-lg"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                            }}
                        />
                    </div>
                    
                    <select className="px-4 py-2 border rounded-lg"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                                color: document.documentElement.classList.contains('dark') ? 'white' : '#111827'
                            }}>
                        <option value="">All Types</option>
                        <option value="IN">Stock IN</option>
                        <option value="OUT">Stock OUT</option>
                        <option value="ADJUST">Adjustments</option>
                    </select>
                </div>

                <div className="text-sm"
                     style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    📊 Stock Movement History Log
                </div>
            </div>

            {/* Transactions Table */}
            <div className="border rounded-lg overflow-hidden"
                 style={{
                   backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                   borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'
                 }}>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead style={{backgroundColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb'}}>
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Lot Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Reference
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Note
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200"
                               style={{
                                   backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                               }}>
                            {transactions.map((transaction, index) => (
                                <tr key={transaction.stock_trans_id || `transaction-${index}`}
                                    className="hover:bg-gray-50"
                                    style={{
                                        backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : 'white';
                                    }}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"
                                        style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                        {formatDate(transaction.trans_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTransactionTypeColor(transaction.trans_type)}`}>
                                            {getTransactionTypeIcon(transaction.trans_type)}
                                            <span className="ml-1">{transaction.trans_type}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={`${
                                            transaction.trans_type === 'IN' ? 'text-green-600' :
                                            transaction.trans_type === 'OUT' ? 'text-red-600' :
                                            'text-yellow-600'
                                        }`}>
                                            {transaction.trans_type === 'IN' ? '+' : ''}{transaction.qty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"
                                        style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                        {transaction.lot?.lot_no || `Lot ID: ${transaction.lot_id_fk}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"
                                        style={{color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'}}>
                                        {transaction.ref_no}
                                    </td>
                                    <td className="px-6 py-4 text-sm"
                                        style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                                        {transaction.note}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                            Recorded
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
                <div className="text-sm"
                     style={{color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'}}>
                    Showing 1 to {transactions.length} of {transactions.length} transactions
                </div>
                <div className="flex space-x-2">
                    <button className="px-3 py-2 border rounded-lg"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                                color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                            }}>
                        Previous
                    </button>
                    <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg">
                        1
                    </button>
                    <button className="px-3 py-2 border rounded-lg"
                            style={{
                                backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : 'white',
                                borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb',
                                color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#374151'
                            }}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StockTransactionsTab;
