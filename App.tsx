

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MOCK_TRANSACTIONS } from './constants';
import { Transaction, DashboardData, ReconciliationData, ReconciliationItem } from './types';
import { processUserPrompt } from './services/geminiService';
import { ModernDashboard as Dashboard } from './components/ModernDashboard';
import { ReconciliationDashboard } from './components/ReconciliationDashboard';
import { TransactionModal } from './components/TransactionModal';
import { AgentModal } from './components/AgentModal';
import { CustomerExploreModal } from './components/CustomerExploreModal';
import {
  IconBell,
  IconSettings,
  IconChevronDown,
  IconInfo,
  IconArrowRight,
  IconSparkles,
  IconFilter,
  IconColumns,
  IconDownload,
  IconMoreHorizontal,
  IconVisa,
  IconMastercard,
  IconRefund,
  IconCheck,
  IconX,
  IconPaid,
  IconFailed,
  IconChevronLeft,
  IconChevronRight,
  IconCoins,
  IconClock,
  IconChevronLeft as IconBack,
  IconTools,
  IconCanvas,
  IconLifebuoy,
  IconLightbulb,
  IconSearch,
  IconPlus,
  IconAgent
} from './components/Icons';

// --- Header Component ---
const Header = () => (
  <header className="bg-white border-b border-gray-200">
    <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex space-x-8 h-full">
        {/* Navigation Tabs */}
        <button className="h-full border-b-2 border-blue-600 text-blue-600 font-semibold px-1 text-sm">
          Balance and Activity
        </button>
        <button className="h-full border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium px-1 text-sm">
          Direct Debit
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
          <IconSparkles className="w-4 h-4 text-yellow-200" />
          <span>Smart Assistant</span>
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2"></div>

        <div className="flex items-center space-x-1 cursor-pointer">
          <span className="text-sm font-semibold text-gray-700">GBP</span>
          <IconChevronDown className="w-4 h-4 text-gray-500" />
        </div>

        <button className="p-2 text-gray-500 hover:text-gray-700">
          <IconBell className="w-5 h-5" />
        </button>

        <button className="p-2 text-gray-500 hover:text-gray-700">
          <IconSettings className="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
);

// --- Summary Cards ---
const SummaryCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
    {/* Payable Funds Card */}
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <IconCoins className="w-5 h-5 text-gray-500" />
          <div className="flex items-center space-x-1">
            <span className="text-gray-600 font-medium text-sm border-b border-dotted border-gray-400 cursor-help leading-tight">Payable funds</span>
            <IconInfo className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
        <div className="text-xs text-gray-500 self-start mt-0.5">
          Next scheduled payout: <span className="text-gray-400">No date</span>
        </div>
      </div>

      <div className="flex justify-between items-end mt-auto">
        <div className="text-3xl font-bold text-gray-900 tracking-tight">£ 1,000.00</div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors shadow-sm">
          <span>Pay out now</span>
          <IconArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Pending Amount Card */}
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <IconClock className="w-5 h-5 text-gray-500" />
        <span className="text-gray-600 font-medium text-sm">Pending amount</span>
        <IconInfo className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight mt-auto">£ 100.00</div>
    </div>
  </div>
);

// --- Status Badge ---
const StatusBadge = ({ status }: { status: string }) => {
  let styles = "bg-gray-100 text-gray-700";
  let Icon = IconInfo;

  switch (status) {
    case 'Refunded':
      styles = "bg-orange-50 text-orange-700 border border-orange-200";
      Icon = IconRefund;
      break;
    case 'Charged':
      styles = "bg-gray-100 text-gray-800 border border-gray-200";
      Icon = IconCheck;
      break;
    case 'Cancelled':
      styles = "bg-red-50 text-red-700 border border-red-200";
      Icon = IconX;
      break;
    case 'Paid into bank':
      styles = "bg-blue-50 text-blue-700 border border-blue-200";
      Icon = IconPaid;
      break;
    case 'Failed':
      styles = "bg-gray-50 text-gray-600 border border-gray-200";
      Icon = IconFailed;
      break;
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{status}</span>
    </span>
  );
};

// --- Tool Suggestions Data ---
const TOOL_SUGGESTIONS: Record<string, Record<string, { icon: string; text: string }[]>> = {
  canvas: {
    suggested: [
      { icon: '📄', text: 'Create visual dashboard of transaction trends' },
      { icon: '📊', text: 'Design flowchart for payment processing' },
      { icon: '✨', text: 'Sketch wireframe for invoice details modal' }
    ],
    reports: [
      { icon: '📈', text: 'Generate visual report of monthly revenue' },
      { icon: '🎨', text: 'Create infographic of payment methods breakdown' }
    ],
    actions: [
      { icon: '🖼️', text: 'Export current view as image' },
      { icon: '📐', text: 'Create custom chart layout' }
    ]
  },
  support: {
    suggested: [
      { icon: '💬', text: 'Contact support about failed transactions' },
      { icon: '📚', text: 'Find API documentation for payment integration' },
      { icon: '🐛', text: 'Report issue with transaction export' }
    ],
    reports: [
      { icon: '📋', text: 'View support ticket history' },
      { icon: '📊', text: 'Generate support metrics report' }
    ],
    actions: [
      { icon: '📞', text: 'Schedule call with support team' },
      { icon: '📧', text: 'Send feedback about dashboard' }
    ]
  },
  'financial insights': {
    suggested: [
      { icon: '💡', text: 'Analyze payment patterns for Q4 2024' },
      { icon: '📊', text: 'Identify unusual transaction spikes' },
      { icon: '🔍', text: 'Find opportunities to reduce refund rate' }
    ],
    reports: [
      { icon: '📈', text: 'Generate cash flow forecast' },
      { icon: '💰', text: 'Create profitability analysis' }
    ],
    actions: [
      { icon: '⚡', text: 'Run automated insights scan' },
      { icon: '🎯', text: 'Set up custom financial alerts' }
    ]
  },
  'deep search': {
    suggested: [
      { icon: '🔎', text: 'Search all invoices containing "Google Ads"' },
      { icon: '📅', text: 'Find transactions from last Black Friday' },
      { icon: '💳', text: 'Search by card ending in 4242' },
      { icon: '👤', text: 'Explore your customers' }
    ],
    reports: [
      { icon: '📊', text: 'Advanced search with multiple filters' },
      { icon: '🔍', text: 'Search transaction descriptions and notes' }
    ],
    actions: [
      { icon: '⭐', text: 'Save current search query' },
      { icon: '🔔', text: 'Create alert for search criteria' }
    ]
  },
  agent: {
    suggested: [
      { icon: '🤖', text: 'Automate monthly invoice reconciliation' },
      { icon: '⚡', text: 'Set up automated refund processing' },
      { icon: '📧', text: 'Create email automation for overdue invoices' },
      { icon: '🔔', text: 'Auto-notify customers of successful payments' },
      { icon: '💰', text: 'Automatically process pending payouts over £1000' },
      { icon: '📅', text: 'Schedule weekly revenue summary emails' },
      { icon: '🚨', text: 'Alert me when failed transactions exceed 5%' },
      { icon: '🎯', text: 'Auto-categorize transactions by merchant type' }
    ],
    reports: [
      { icon: '📊', text: 'View agent activity log' },
      { icon: '🎯', text: 'Generate automation performance report' },
      { icon: '⏱️', text: 'Show time saved by automation this month' },
      { icon: '📈', text: 'Automation success rate analytics' },
      { icon: '💡', text: 'Get automation improvement suggestions' }
    ],
    actions: [
      { icon: '🔧', text: 'Configure new automation workflow' },
      { icon: '▶️', text: 'Start agent training mode' },
      { icon: '⏸️', text: 'Pause all active automations' },
      { icon: '🗑️', text: 'Delete inactive automation rules' },
      { icon: '📋', text: 'Export automation configuration' },
      { icon: '🔄', text: 'Sync automations across all accounts' }
    ]
  }
};

// --- Main App ---
export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // State for AI Views
  const [viewMode, setViewMode] = useState<'list' | 'dashboard' | 'reconciliation'>('list');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reconciliationData, setReconciliationData] = useState<ReconciliationData | null>(null);

  // State for Modal
  const [modalInvoiceId, setModalInvoiceId] = useState<string | null>(null);

  // State for Tools Dropdown
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [suggestionCategory, setSuggestionCategory] = useState('suggested');
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // State for Agent Modal
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [overdueInvoices, setOverdueInvoices] = useState<Transaction[]>([]);
  const [chaseItem, setChaseItem] = useState<ReconciliationItem | null>(null);

  // State for Customer Explore Modal
  const [showCustomerExploreModal, setShowCustomerExploreModal] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
      }
    };

    if (showToolsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsMenu]);

  // Filter transactions based on query
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setTransactions(MOCK_TRANSACTIONS);
      setViewMode('list');
      return;
    }

    setIsProcessing(true);

    try {
      // Use Gemini for intelligent filtering OR generation OR details
      const response = await processUserPrompt(searchQuery, MOCK_TRANSACTIONS);
      console.log("AI Response:", response);

      if (response.type === 'DETAILS' && response.detailsId) {
        // Show modal logic
        setModalInvoiceId(response.detailsId);
        // We don't change viewMode, we just pop the modal over whatever view is active
      } else if (response.type === 'DASHBOARD' && response.dashboardData) {
        setDashboardData(response.dashboardData);
        setViewMode('dashboard');
      } else if (response.type === 'RECONCILIATION_DASHBOARD' && response.reconciliationData) {
        setReconciliationData(response.reconciliationData);
        setViewMode('reconciliation');
      } else {
        // It's a filter request
        const ids = new Set(response.filteredIds || []);
        const filtered = MOCK_TRANSACTIONS.filter(t => ids.has(t.id));
        setTransactions(filtered);
        setViewMode('list');
      }
    } catch (error) {
      console.error("Error in handleSearch:", error);
      // Fallback to simple text search if AI fails hard
      const lowerQuery = searchQuery.toLowerCase();
      const fallbackFiltered = MOCK_TRANSACTIONS.filter(t =>
        t.customer.toLowerCase().includes(lowerQuery) ||
        t.reference.toLowerCase().includes(lowerQuery) ||
        t.amount.toString().includes(lowerQuery)
      );
      setTransactions(fallbackFiltered);
      setViewMode('list');
    } finally {
      setIsProcessing(false);
    }
  }, [searchQuery]);

  const handleReset = () => {
    setViewMode('list');
    setSearchQuery('');
    setTransactions(MOCK_TRANSACTIONS);
  };

  // Handle Chase Payment from Reconciliation Dashboard
  const handleChasePayment = (item: ReconciliationItem) => {
    setChaseItem(item);
    setOverdueInvoices([]); // Clear bulk invoices
    setShowAgentModal(true);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20 font-sans">
      <Header />

      {/* Transaction Details Modal */}
      {modalInvoiceId && (
        <TransactionModal
          invoiceId={modalInvoiceId}
          onClose={() => setModalInvoiceId(null)}
        />
      )}

      {/* Agent Modal */}
      {showAgentModal && (
        <AgentModal
          onClose={() => {
            setShowAgentModal(false);
            setChaseItem(null); // Clear chase item when closing
          }}
          overdueInvoices={overdueInvoices}
          chaseItem={chaseItem || undefined}
        />
      )}

      {/* Customer Explore Modal */}
      {showCustomerExploreModal && (
        <CustomerExploreModal
          onClose={() => setShowCustomerExploreModal(false)}
          allTransactions={MOCK_TRANSACTIONS}
        />
      )}

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="sr-only">Balance and Activity</h1>

        <SummaryCards />

        {/* Search / Command Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className={`flex items-center space-x-1 bg-gray-100 p-1 rounded-lg transition-opacity duration-300 ${viewMode === 'dashboard' ? 'opacity-50 pointer-events-none' : ''}`}>
            <button className="bg-white text-blue-600 shadow-sm px-4 py-1.5 rounded-md text-sm font-semibold">Transactions</button>
            <button className="text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-md text-sm font-medium">Payouts</button>
          </div>

          <div className="flex-1 max-w-xl mx-4 relative" ref={toolsDropdownRef}>
            {/* Expandable AI Input Container */}
            <div className={`relative group border border-gray-300 rounded-lg bg-white shadow-sm transition-all duration-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 ${selectedTool ? 'min-h-[100px]' : 'h-auto'
              }`}>
              {/* Top Row: Sparkles + Plus Button + Input + Submit */}
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center pointer-events-none">
                  <IconSparkles className="h-4 w-4 text-purple-500 group-focus-within:animate-pulse" />
                </div>

                {/* Tools Button inside input - LEFT SIDE */}
                <div className="absolute left-10 flex items-center pl-2">
                  <button
                    onClick={() => setShowToolsMenu(!showToolsMenu)}
                    className="flex items-center justify-center w-6 h-6 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Tools menu"
                  >
                    <IconPlus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                <input
                  type="text"
                  className="block w-full pl-20 pr-12 py-2.5 bg-transparent border-0 leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Ask AI: 'Filter refunded' or 'Find invoice INV-123'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />

                {/* Submit Button - RIGHT SIDE */}
                <button
                  onClick={handleSearch}
                  className="absolute right-2 flex items-center"
                >
                  <div className="p-1.5 rounded-md bg-white hover:bg-gray-50 text-purple-600 transition-colors">
                    {isProcessing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <IconArrowRight className="h-4 w-4" />
                    )}
                  </div>
                </button>
              </div>

              {/* Tool Badge INSIDE input box */}
              {selectedTool && (
                <div className="px-4 pb-2 animate-fade-in">
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
                    <span className="text-xs font-medium text-blue-700 capitalize">{selectedTool}</span>
                    <button
                      onClick={() => setSelectedTool(null)}
                      className="text-blue-400 hover:text-blue-600 transition-colors"
                      aria-label="Clear tool selection"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tools Dropdown Menu - WHITE BACKGROUND */}
            {showToolsMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 animate-fade-in">
                <div className="py-2">
                  <button
                    onClick={() => {
                      setSelectedTool('canvas');
                      setShowToolsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <IconCanvas className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Canvas</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTool('support');
                      setShowToolsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <IconLifebuoy className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Support</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTool('financial insights');
                      setShowToolsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <IconLightbulb className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Financial Insights</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTool('deep search');
                      setShowToolsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <IconSearch className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Deep Search</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTool('agent');
                      setShowToolsMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    <IconAgent className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium">Agent</span>
                  </button>
                </div>
              </div>
            )}

            {/* Floating Suggestions Panel - Overlays table */}
            {selectedTool && (
              <div className="absolute left-4 right-4 top-full mt-2 z-40">
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-w-xl mx-auto animate-fade-in">
                  {/* Category Tabs */}
                  <div className="flex items-center gap-6 px-4 pt-4 border-b border-gray-200">
                    {['suggested', 'reports', 'actions'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSuggestionCategory(category)}
                        className={`pb-3 text-sm font-medium transition-colors ${suggestionCategory === category
                          ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Suggestion Cards */}
                  <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                    {TOOL_SUGGESTIONS[selectedTool]?.[suggestionCategory]?.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          // Special handling for agent automation
                          if (suggestion.text === 'Create email automation for overdue invoices') {
                            // Filter transactions that are NOT in 'Charged' status
                            const overdue = MOCK_TRANSACTIONS.filter(t => t.status !== 'Charged' && t.status !== 'Paid into bank');
                            setOverdueInvoices(overdue);
                            setShowAgentModal(true);
                            setSelectedTool(null); // Close the suggestions
                          } else if (suggestion.text === 'Explore your customers') {
                            // Open customer exploration modal
                            setShowCustomerExploreModal(true);
                            setSelectedTool(null); // Close the suggestions
                          } else {
                            setSearchQuery(suggestion.text);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors group"
                      >
                        <span className="text-base">{suggestion.icon}</span>
                        <span className="text-sm text-gray-700 text-left flex-1">{suggestion.text}</span>
                        <IconArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </button>
                    )) || (
                        <div className="text-sm text-gray-500 text-center py-8">
                          No suggestions available for this category
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {viewMode === 'dashboard' || viewMode === 'reconciliation' ? (
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 shadow-sm transition-colors"
              >
                <IconBack className="w-4 h-4" />
                <span>Back to List</span>
              </button>
            ) : (
              <>
                <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm">
                  <IconFilter className="w-4 h-4" />
                  <span>Filters {searchQuery && transactions.length !== MOCK_TRANSACTIONS.length ? '[Active]' : ''}</span>
                </button>
                <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm">
                  <IconColumns className="w-4 h-4" />
                  <span>Customize columns</span>
                </button>
                <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 shadow-sm">
                  <IconDownload className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area: List View OR Dashboard View */}
        {viewMode === 'dashboard' && dashboardData ? (
          <Dashboard
            data={dashboardData}
            onClose={handleReset}
          />
        ) : viewMode === 'reconciliation' && reconciliationData ? (
          <ReconciliationDashboard
            data={reconciliationData}
            onClose={handleReset}
            onChasePayment={handleChasePayment}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#b91c1c]">
                  <tr>
                    {['Reference', 'Status', 'Customer', 'Method', 'Amount', 'Fee', 'Net', 'Charged on'].map((header) => (
                      <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td
                        className="px-6 py-3 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                        onClick={() => setModalInvoiceId(tx.reference)}
                      >
                        <div>{tx.reference}</div>
                        {tx.notes && (
                          <div className="text-xs text-gray-500 italic font-normal mt-1">
                            {tx.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                        {tx.customer}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {tx.method.type === 'Mastercard' ? (
                            <IconMastercard className="w-5 h-4" />
                          ) : (
                            <IconVisa className="w-5 h-auto" />
                          )}
                          <span>••••-{tx.method.last4}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        £{tx.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {tx.fee === 0 ? '£0.00' : `£${tx.fee.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tx.net === 0 ? '£0.00' : `£${tx.net.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                        {tx.chargedOn}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <IconMoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">1-10</span> of <span className="font-medium">198</span>
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-1">
                    <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50">
                      <IconChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium shadow-sm">1</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium">2</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium">3</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium">4</button>
                    <span className="px-2 py-1 text-gray-500">...</span>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium">9</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm font-medium">10</button>
                    <button className="p-2 rounded-md text-gray-400 hover:text-gray-600">
                      <IconChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Results per page</span>
                    <button className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                      10
                      <IconChevronDown className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
