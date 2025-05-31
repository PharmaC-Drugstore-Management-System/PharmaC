import { Link } from 'react-router-dom';
import {
    LineChart, Line,
    XAxis, YAxis, Tooltip
} from 'recharts';
export default function MedicineDetailPage() {
    const analyticsData = [
        { name: 'Jan', purple: 26.1, blue: 26.7 },
        { name: 'Feb', purple: 26.7, blue: 27.3 },
        { name: 'Mar', purple: 26.9, blue: 27.8 },
        { name: 'Apr', purple: 26.2, blue: 26.4 },
        { name: 'May', purple: 26.7, blue: 26.2 },
        { name: 'Jun', purple: 26.5, blue: 26.1 },
    ];
    return (
        <> <div className="min-h-screen flex flex-col p-4">
            <div className='w-full h-20  flex flex-row '>
                {/* Name of Products */}
                <h1 className='text-3xl text-start w-full'>
                    A-MOL Para 250mg/5ml 60ml
                </h1>
            </div>
            <div className='flex w-full h-100 flex-row  gap-4 mb-4'>
                <div className='w-100 h-full bg-white rounded-lg shadow-sm p-4 felx text-center border-1 border-gray-200'>
                    {/* Image of Products */}
                    <h2>IMAGE</h2>
                </div>

                <div className='w-100 h-full bg-white rounded-lg shadow-sm p-4 flex flex-col gap-2'>
                    <div className='flex flex-row gap-2'>
                        <h2 className='text-xl font-bold text-black-600'>Product : </h2>
                        <p className='text-gray-500 text-xl'>A-MOL</p>
                    </div>
                    <div className='flex flex-row gap-2'>
                        <h2 className='text-xl font-bold text-black-600'>Unit : </h2>
                        <p className='text-gray-500 text-xl'>A-MOL</p>
                    </div>
                    <div className='flex flex-row gap-2'>
                        <h2 className='text-xl font-bold text-black-600'>Category : </h2>
                        <p className='text-gray-500 text-xl'>A-MOL</p>
                    </div>
                    <div className='flex flex-row gap-2'>
                        <h2 className='text-xl font-bold text-black-600'>Supplier : </h2>
                        <p className='text-gray-500 text-xl'>A-MOL</p>
                    </div>
                    <div className='flex flex-row gap-2'>
                        <h2 className='text-xl font-bold text-black-600'>Distributor : </h2>
                        <p className='text-gray-500 text-xl'>A-MOL</p>
                    </div>
                    <div className='flex flex-row gap-2'>
                        <h2 className='text-xl font-bold text-black-600'>Barcode : </h2>
                        <p className='text-gray-500 text-xl'>A-MOL</p>
                    </div>
                </div>
            </div>
            <div className='w-full h-fit mb-4'>
                <h1 className='text-xl font-bold text-black-600'>Detail of Product</h1>

                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Quaerat totam ad ipsum, dicta quam non quo optio temporibus sunt fugiat at nostrum fugit
                    aut consectetur quidem iusto nulla libero explicabo.

                </p>
            </div>

            <div className='w-full h-fit p-4 mb-4 border-1 border-gray-200 bg-white rounded-lg shadow-sm'>
                <Link to="/RevenueDetail" className="block">
                    <div className=" rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                        <h3 className="text-xl font-medium mb-5 ml-2">Analytic</h3>
                        <div className="flex justify-center">
                            <LineChart width={600} height={250} data={analyticsData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#333' }}
                                />
                                <YAxis
                                    domain={[25, 29]}
                                    ticks={[25, 26, 27, 28, 29]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#333' }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', borderRadius: '4px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    cursor={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="purple"
                                    stroke="#9561e2"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#9561e2' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="blue"
                                    stroke="#36d7e8"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: '#36d7e8' }}
                                />
                            </LineChart>
                        </div>
                    </div>
                </Link>
            </div>
        </div>

        </>
    );
}
