import React, { useState } from 'react';
import { IconChevronDown } from './Icons';

// Bus Routes Data
const BUS_ROUTES = [
    { id: 1, name: 'Broadstone' },
    { id: 2, name: 'Salisbury' },
    { id: 3, name: 'Dorchester' },
    { id: 4, name: 'Ringwood' },
    { id: 5, name: 'Hindon' },
    { id: 6, name: 'Branksome Chine' },
    { id: 7, name: 'Sherborne' },
    { id: 8, name: 'Talbot Heath' },
    { id: 9, name: 'Gillingham' },
];



const RouteTab = ({ route, isActive }: { route: { id: number; name: string }; isActive: boolean }) => (
    <button
        className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 rounded
      ${isActive
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
    >
        {route.id} - {route.name}
    </button>
);

// User Menu Component
const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            >
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                    <span className="text-xs font-semibold text-slate-600">O</span>
                </div>
                <span>Oliver</span>
                <IconChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-fade-in">
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</a>
                    <hr className="my-2 border-slate-100" />
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Sign out</a>
                </div>
            )}
        </div>
    );
};

// Main Header Component
interface TopHeaderProps {
    title?: string;
}

export const TopHeader = ({ title = "Clayesmore School Transport Services" }: TopHeaderProps) => {
    const [showAllRoutes, setShowAllRoutes] = useState(false);

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            {/* Top Row - Company Name and User Controls */}
            <div className="px-6 py-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold text-slate-700">{title}</h1>

                <div className="flex items-center gap-3">
                    <UserMenu />
                    <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5">
                        Logout
                    </button>
                </div>
            </div>

            {/* Bus Routes Navigation */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM15 16.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                            <path d="M3 4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.05a2.5 2.5 0 0 1 4.9 0h2.1a2.5 2.5 0 0 1 4.9 0H17a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H3zM4 5h12v9h-.05a2.5 2.5 0 0 0-4.9 0h-2.1a2.5 2.5 0 0 0-4.9 0H4V5z" />
                        </svg>
                        <span className="font-medium">Bus routes:</span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto flex-1">
                        {BUS_ROUTES.slice(0, showAllRoutes ? undefined : 6).map((route, idx) => (
                            <RouteTab key={route.id} route={route} isActive={idx === 0} />
                        ))}
                        {!showAllRoutes && BUS_ROUTES.length > 6 && (
                            <span className="px-2 text-xs text-slate-400">+{BUS_ROUTES.length - 6} more</span>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAllRoutes(!showAllRoutes)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white text-xs font-medium rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                        Show all
                        <IconChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllRoutes ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>


        </header>
    );
};

export default TopHeader;
