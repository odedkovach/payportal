import React from 'react';
import {
    IconUser,
    IconCalendar,
    IconCreditCard,
    IconBook,
    IconSettings,
    IconUsers,
    IconFileText,
    IconLifebuoy,
    IconChevronDown,
    IconCheck,
} from './Icons';

// Navigation item type definition
interface NavItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    active?: boolean;
    hasCheck?: boolean;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

// Sidebar Navigation Configuration
const NAV_SECTIONS: NavSection[] = [
    {
        title: 'MAIN',
        items: [
            { label: 'My account', icon: <IconUser className="w-4 h-4" /> },
            { label: 'Check availability', icon: <IconCalendar className="w-4 h-4" /> },
            { label: 'Book now', icon: <IconCreditCard className="w-4 h-4" /> },
            { label: 'Taxi booking', icon: <IconCreditCard className="w-4 h-4" /> },
            { label: 'School bus guide', icon: <IconBook className="w-4 h-4" /> },
        ],
    },
    {
        title: 'ADMIN',
        items: [
            { label: 'Private hire', icon: <IconUsers className="w-4 h-4" /> },
            { label: 'Site admin', icon: <IconSettings className="w-4 h-4" />, active: true },
            { label: 'Site config', icon: <IconSettings className="w-4 h-4" />, hasCheck: true },
            { label: 'Power tools', icon: <IconSettings className="w-4 h-4" />, hasCheck: true },
        ],
    },
    {
        title: 'OTHER',
        items: [
            { label: 'FAQs', icon: <IconLifebuoy className="w-4 h-4" /> },
            { label: 'Contact us', icon: <IconFileText className="w-4 h-4" /> },
            { label: 'Terms & conditions', icon: <IconFileText className="w-4 h-4" /> },
            { label: 'Help hub', icon: <IconLifebuoy className="w-4 h-4" /> },
            { label: "'How to' parent guide", icon: <IconBook className="w-4 h-4" /> },
        ],
    },
];

// School Crest/Logo Component
const SchoolLogo = () => (
    <div className="flex flex-col items-center py-6 px-4">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-3 border-2 border-white/20">
            {/* Placeholder for school crest - SVG shield icon */}
            <svg viewBox="0 0 100 120" className="w-14 h-14 text-white/90" fill="currentColor">
                <path d="M50 5 L95 20 L95 55 C95 85 50 115 50 115 C50 115 5 85 5 55 L5 20 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3" />
                <path d="M50 25 L70 35 L70 55 C70 70 50 85 50 85 C50 85 30 70 30 55 L30 35 Z"
                    fill="currentColor"
                    opacity="0.3" />
                {/* Crown/top decoration */}
                <circle cx="50" cy="15" r="3" fill="currentColor" />
                <circle cx="40" cy="18" r="2" fill="currentColor" />
                <circle cx="60" cy="18" r="2" fill="currentColor" />
            </svg>
        </div>
    </div>
);

// Navigation Item Component
const NavItemComponent = ({ item }: { item: NavItem }) => {
    const baseClasses = "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer relative";
    const activeClasses = item.active
        ? "bg-white/10 text-white border-l-3 border-l-cyan-400"
        : "text-slate-400 hover:text-white hover:bg-white/5";

    return (
        <div className={`${baseClasses} ${activeClasses}`}>
            <span className="opacity-70">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.hasCheck && (
                <span className="w-5 h-5 rounded bg-cyan-500 flex items-center justify-center">
                    <IconCheck className="w-3 h-3 text-white" />
                </span>
            )}
        </div>
    );
};

// Navigation Section Component
const NavSectionComponent = ({ section }: { section: NavSection }) => (
    <div className="mb-6">
        <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {section.title}
        </div>
        <div className="space-y-0.5">
            {section.items.map((item, index) => (
                <NavItemComponent key={index} item={item} />
            ))}
        </div>
    </div>
);

// Collapsed View Toggle
const CollapsedViewToggle = () => (
    <div className="px-4 py-3 border-t border-white/10 mt-auto">
        <div className="flex items-center gap-3 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors">
            <IconChevronDown className="w-4 h-4" />
            <span>Collapsed view</span>
        </div>
    </div>
);

// Main Sidebar Component
export const Sidebar = () => {
    return (
        <aside
            className="sidebar fixed left-0 top-0 h-screen w-[220px] bg-slate-800 flex flex-col overflow-y-auto z-40"
            style={{ backgroundColor: '#1e293b' }}
        >
            {/* Powered by Badge */}
            <div className="px-4 pt-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500 text-white text-xs font-semibold rounded">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                        <path d="M10 2L2 7l8 5 8-5-8-5z" />
                        <path d="M2 12l8 5 8-5" opacity="0.7" />
                    </svg>
                    Powered by Vectare
                </div>
            </div>

            {/* School Logo/Crest */}
            <SchoolLogo />

            {/* Navigation Sections */}
            <nav className="flex-1 px-0 overflow-y-auto">
                {NAV_SECTIONS.map((section, index) => (
                    <NavSectionComponent key={index} section={section} />
                ))}
            </nav>

            {/* Collapsed View Toggle */}
            <CollapsedViewToggle />
        </aside>
    );
};

export default Sidebar;
