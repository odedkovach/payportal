import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

// --- Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-md p-4 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-xl">
                <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-lg text-blue-600 font-bold">
                        £{payload[0].value.toLocaleString()}
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

// --- Revenue Trend Chart (Area) ---
export const RevenueChart = ({ data }: { data: any[] }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-[350px] w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <filter id="glow" height="300%" width="300%" x="-75%" y="-75%">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                        minTickGap={30}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value) => `£${value}`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        filter="url(#glow)"
                        animationDuration={2000}
                        animationEasing="ease-in-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

// --- Payment Method Distribution (Donut) ---
export const DistributionChart = ({ data }: { data: { label: string; value: number; color?: string }[] }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="h-[350px] w-full relative"
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={6}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color || COLORS[index % COLORS.length]}
                                strokeWidth={0}
                                className="hover:opacity-80 transition-opacity duration-300"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                        }}
                        formatter={(value: number) => `£${value.toLocaleString()}`}
                        itemStyle={{ color: '#1F2937', fontWeight: 600 }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-sm font-medium text-gray-600 ml-2">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Text with Glow */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-10">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total</span>
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-3xl font-extrabold text-gray-800"
                >
                    £{data.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                </motion.span>
            </div>
        </motion.div>
    );
};

// --- Top Customers (Bar) ---
export const TopCustomersChart = ({ data }: { data: { label: string; value: number }[] }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="h-[350px] w-full"
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
                    barSize={24}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="label"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#4B5563', fontSize: 13, fontWeight: 600 }}
                        width={100}
                    />
                    <Tooltip
                        cursor={{ fill: '#F3F4F6', opacity: 0.5 }}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
                        }}
                        formatter={(value: number) => [<span className="font-bold text-blue-600">£{value.toLocaleString()}</span>, 'Sales Volume']}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={1500}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
};
