import React, { ReactNode } from 'react';
import {
    IconHome,
    IconUsers,
    IconCalendar,
    IconActivity,
    IconCreditCard,
    IconBook,
    IconFileText,
    IconUser,
    IconSettings,
    IconBell,
    IconChevronDown
} from './Icons';

interface LayoutProps {
    children: ReactNode;
}

interface MenuItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
}

const menuItems: MenuItem[] = [
    { icon: IconHome, label: 'Dashboard' },
    { icon: IconUsers, label: 'Parents' },
    { icon: IconCalendar, label: 'Bookings' },
    { icon: IconActivity, label: 'Activities' },
    { icon: IconCreditCard, label: 'Payments', active: true },
    { icon: IconBook, label: 'Programs' },
    { icon: IconFileText, label: 'Invoices' },
    { icon: IconUser, label: 'Staff' },
    { icon: IconSettings, label: 'Settings' }
];

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Top Header Bar */}
            <header className="bg-[#8DB93C] text-white h-[60px] flex items-center justify-between px-6 flex-shrink-0 shadow-md">
                {/* Left: Company Name with Dropdown */}
                <div className="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-opacity">
                    <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                        <span className="text-[#8DB93C] text-sm font-bold">🐘</span>
                    </div>
                    <span className="font-semibold text-base">Little Green Elephants</span>
                    <IconChevronDown className="w-4 h-4" />
                </div>

                {/* Center: Navigation Links */}
                <nav className="flex items-center space-x-8">
                    <a href="#" className="text-white font-medium hover:opacity-80 transition-opacity text-sm">
                        Dashboard
                    </a>
                    <a href="#" className="text-white font-medium hover:opacity-80 transition-opacity text-sm">
                        Company Dashboard
                    </a>
                </nav>

                {/* Right: Icons and User */}
                <div className="flex items-center space-x-4">
                    {/* Setup with notification badge */}
                    <button className="relative p-2 hover:bg-white/10 rounded-md transition-colors">
                        <IconSettings className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        <span className="sr-only">Setup</span>
                    </button>

                    {/* Bell notification */}
                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                        <IconBell className="w-5 h-5" />
                        <span className="sr-only">Notifications</span>
                    </button>

                    {/* Settings */}
                    <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                        <IconSettings className="w-5 h-5" />
                        <span className="sr-only">Settings</span>
                    </button>

                    {/* User Avatar */}
                    <button className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition-opacity">
                        O
                    </button>
                </div>
            </header>

            {/* Main Content Area with Sidebar */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-[240px] bg-white border-r border-gray-200 flex-shrink-0 overflow-y-auto">
                    <nav className="py-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.label}
                                    className={`w-full flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${item.active
                                            ? 'bg-[#E8F5C8] text-gray-900 border-l-4 border-[#8DB93C]'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${item.active ? 'text-[#8DB93C]' : 'text-gray-400'}`} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-auto bg-[#F9FAFB]">
                    {children}
                </main>
            </div>
        </div>
    );
};
