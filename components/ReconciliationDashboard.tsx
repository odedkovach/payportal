import React from 'react';
import { motion } from 'framer-motion';
import { ReconciliationData } from '../types';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    IconInfo, IconCheck, IconX, IconClock, IconAlertTriangle, IconDownload, IconFilter
} from './Icons';

interface ReconciliationDashboardProps {
    data: ReconciliationData;
    onClose: () => void;
    onChasePayment?: (item: ReconciliationData['discrepancies'][0]) => void;
}

const COLORS = ['#1e3a8a', '#6b7280', '#9ca3af', '#e5e7eb']; // School Blue, Dark Grey, Light Grey, Off-white

export const ReconciliationDashboard = ({ data, onClose, onChasePayment }: ReconciliationDashboardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 p-4 md:p-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-blue-700 rounded-sm"></span>
                        {data.title}
                    </h2>
                    <p className="text-gray-500 mt-1 ml-5">
                        <span className="font-semibold text-gray-700">Period:</span> {data.period} •
                        <span className="ml-2 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 uppercase font-bold tracking-wider">
                            Phase 1 Analysis
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <IconFilter className="w-4 h-4 text-gray-500" />
                        <span>Filter Criteria</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm hover:shadow-md">
                        <IconDownload className="w-4 h-4" />
                        <span>Export Reconciliation Report</span>
                    </button>
                </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    label="Total Fees Expected"
                    value={`£${data.summary.totalExpected.toLocaleString()}`}
                    subtext="Based on Termly Invoices"
                    icon={<IconInfo className="w-5 h-5 text-gray-400" />}
                />
                <KPICard
                    label="Total Collected"
                    value={`£${data.summary.totalReceived.toLocaleString()}`}
                    valueColor="text-gray-900"
                    subtext={`${((data.summary.totalReceived / data.summary.totalExpected) * 100).toFixed(1)}% Collection Rate`}
                    icon={<IconCheck className="w-5 h-5 text-gray-700" />}
                    overrideIconColor="text-gray-600"
                />
                <KPICard
                    label="Outstanding Balance"
                    value={`£${data.summary.outstanding.toLocaleString()}`}
                    valueColor="text-orange-600"
                    subtext="Subject to 3% Interest"
                    icon={<IconAlertTriangle className="w-5 h-5 text-orange-500" />}
                    highlight
                />
                <KPICard
                    label="Reconciliation Rate"
                    value={`${data.summary.reconciliationRate}%`}
                    subtext="Matched Transactions"
                    icon={<IconClock className="w-5 h-5 text-blue-500" />}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Aging Analysis Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <IconClock className="w-5 h-5 text-gray-400" />
                        Aging Analysis (Overdue Fees)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer>
                            <BarChart data={data.aging} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    formatter={(value: number) => `£${value.toLocaleString()}`}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Bar dataKey="value" fill="#1e3a8a" radius={[0, 6, 6, 0]} barSize={32}>
                                    {data.aging.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : index === 1 ? '#1e3a8a' : '#172554'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                        <IconAlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700">
                            <strong>Policy Note:</strong> Interest accrues daily at 3% above base rate on all overdue balances &gt; 14 days.
                            Automated chasing emails are scheduled for the "30-60 Days" cohort.
                        </p>
                    </div>
                </div>

                {/* Payment Breakdown Donut */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data.methodBreakdown as any[]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="label"
                                >
                                    {data.methodBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => `£${val.toLocaleString()}`} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-xs text-gray-400 font-medium uppercase">Primary</span>
                            <span className="text-xl font-bold text-gray-900">Direct Debit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discrepancies Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <IconAlertTriangle className="w-5 h-5 text-orange-500" />
                        Reconciliation Discrepancies & Actions
                    </h3>
                    <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                        {data.discrepancies.length} Items Require Review
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-blue-800">
                            <tr>
                                {['Reference', 'Customer', 'Expected', 'Received', 'Status', 'Date', 'Action'].map(head => (
                                    <th key={head} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.discrepancies.map((item) => (
                                <tr key={item.id} className="hover:bg-blue-50/10 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                        {item.reference}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        £{item.expectedAmount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        £{item.receivedAmount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.status === 'Overdue' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                            item.status === 'Partial' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button
                                            onClick={() => onChasePayment?.(item)}
                                            className="text-white hover:text-white font-medium text-xs border border-blue-700 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors shadow-sm"
                                        >
                                            Chase Payment
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

// Internal Helper
const KPICard = ({ label, value, subtext, icon, valueColor = "text-gray-900", overrideIconColor, highlight = false }: any) => (
    <div className={`p-6 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md ${highlight ? 'bg-white border-orange-200 shadow-orange-50' : 'bg-white border-gray-200'
        }`}>
        <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <div className={`p-2 rounded-lg ${highlight ? 'bg-orange-50' : 'bg-gray-50'} ${overrideIconColor || ''}`}>
                {icon}
            </div>
        </div>
        <div className="flex flex-col">
            <span className={`text-2xl font-bold tracking-tight mb-1 ${valueColor}`}>{value}</span>
            <span className="text-xs text-gray-400 font-medium">{subtext}</span>
        </div>
    </div>
);
