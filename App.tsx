

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MOCK_TRANSACTIONS } from './constants';
import { Transaction, DashboardData, ReconciliationData, ReconciliationItem } from './types';
import { processUserPrompt } from './services/geminiService';
import { ModernDashboard as Dashboard } from './components/ModernDashboard';
import { ReconciliationDashboard } from './components/ReconciliationDashboard';
import { TransactionModal } from './components/TransactionModal';
import { AgentModal } from './components/AgentModal';
import { ReconciliationAgentModal } from './components/ReconciliationAgentModal';
import { CustomerExploreModal } from './components/CustomerExploreModal';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
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

// --- Summary Cards (Vectare Style) ---
const SummaryCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    {/* Payable Funds Card */}
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium text-sm border-b border-dotted border-slate-400 cursor-help">Payable Funds</span>
          <IconInfo className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="text-xs text-slate-500">
          Next scheduled payout: <span className="font-medium text-slate-700">Jan 28 2026 16:30 (local time)</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <span className="inline-flex items-center gap-1 text-green-600">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Monthly on 28
        </span>
      </div>

      <div className="flex justify-between items-end">
        <div className="text-4xl font-bold text-slate-900 tracking-tight">£8,125.60</div>
        <button className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          Pay out now
        </button>
      </div>
    </div>

    {/* Pending Amount Card */}
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-600 font-medium text-sm border-b border-dotted border-slate-400 cursor-help">Pending amount</span>
        <span className="text-sm text-slate-500">£0.00</span>
        <IconInfo className="w-3.5 h-3.5 text-slate-400" />
      </div>
    </div>
  </div>
);

// --- Status Badge (Vectare Style) ---
const StatusBadge = ({ status }: { status: string }) => {
  let styles = "bg-slate-100 text-slate-700 border-slate-200";

  switch (status) {
    case 'Refunded':
      styles = "bg-purple-50 text-purple-700 border-purple-200";
      break;
    case 'Charged':
      styles = "bg-slate-100 text-slate-700 border-slate-200";
      break;
    case 'Cancelled':
      styles = "bg-red-50 text-red-700 border-red-200";
      break;
    case 'Paid into bank':
    case 'Settled':
      styles = "bg-green-50 text-green-700 border-green-200";
      break;
    case 'Failed':
      styles = "bg-red-50 text-red-600 border-red-200";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${styles}`}>
      {status === 'Paid into bank' ? 'Settled' : status}
    </span>
  );
};

// --- Payment Method Icon ---
const PaymentMethodIcon = ({ type }: { type: string }) => {
  if (type === 'Direct Debit') {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-4 bg-slate-700 rounded flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">DD</span>
        </div>
        <span className="text-xs text-slate-500">Direct Debit</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {type === 'Mastercard' ? (
        <IconMastercard className="w-6 h-4" />
      ) : (
        <IconVisa className="w-6 h-auto" />
      )}
    </div>
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

// --- Filter Tabs ---
const FILTER_TABS = ['Payments', 'Refunds', 'Disputes', 'Payouts'];
const FILTER_PILLS = ['All Payments', 'Authorised', 'Charged', 'Settled', 'Paid into bank'];

// --- Main App ---
export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('Payments');
  const [activeFilterPill, setActiveFilterPill] = useState('All Payments');

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

  // State for Reconciliation Agent Modal
  const [showReconciliationAgentModal, setShowReconciliationAgentModal] = useState(false);

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
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-[220px] min-h-screen flex flex-col">
        {/* Top Header */}
        <TopHeader title="Clayesmore School Transport Services" />

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

        {/* Reconciliation Agent Modal */}
        {showReconciliationAgentModal && (
          <ReconciliationAgentModal
            onClose={() => setShowReconciliationAgentModal(false)}
          />
        )}

        {/* Customer Explore Modal */}
        {showCustomerExploreModal && (
          <CustomerExploreModal
            onClose={() => setShowCustomerExploreModal(false)}
            allTransactions={MOCK_TRANSACTIONS}
          />
        )}

        <main className="flex-1 px-8 py-6">
          {/* Balance and Activity / Direct Debit Tabs */}
          <div className="flex items-center gap-6 mb-6 border-b border-slate-200">
            <button className="pb-3 text-sm font-semibold text-slate-800 border-b-2 border-cyan-500 -mb-px">
              Balance and Activity
            </button>
            <button className="pb-3 text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-2">
              Direct Debit
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Enabled</span>
            </button>
          </div>

          <SummaryCards />

          {/* Stats, Tabs and AI Search Row */}
          <div className="relative flex items-center justify-center mb-4 min-h-[40px]">
            {/* Payment Type Tabs */}
            <div className="absolute left-0 flex items-center gap-6 z-10">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilterTab(tab)}
                  className={`text-sm font-medium transition-colors ${activeFilterTab === tab
                    ? 'text-slate-800 border-b-2 border-slate-800 pb-2 -mb-px'
                    : 'text-slate-500 hover:text-slate-700 pb-2'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* AI Search Bar */}
            <div className="relative w-full max-w-[560px] z-20" ref={toolsDropdownRef}>
              <div className={`relative bg-white border border-slate-300 rounded-lg shadow-sm transition-all duration-300 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 ${selectedTool ? 'pb-2' : ''}`}>
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center pointer-events-none">
                    <IconSparkles className="h-4 w-4 text-purple-500" />
                  </div>

                  <button
                    onClick={() => setShowToolsMenu(!showToolsMenu)}
                    className="absolute left-11 flex items-center justify-center w-6 h-6 hover:bg-slate-100 rounded-md transition-colors"
                    aria-label="Tools menu"
                  >
                    <IconPlus className="h-4 w-4 text-slate-600" />
                  </button>

                  <input
                    type="text"
                    className="block w-full pl-20 pr-12 py-2 bg-transparent border-0 leading-5 placeholder-slate-400 focus:outline-none focus:ring-0 text-sm"
                    placeholder="Ask AI: 'Filter refunded' or 'Show reconciliation dashboard'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />

                  <button
                    onClick={handleSearch}
                    className="absolute right-3 flex items-center"
                  >
                    <div className="p-1 rounded-md bg-purple-500 hover:bg-purple-600 text-white transition-colors">
                      {isProcessing ? (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <IconArrowRight className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Tool Badge inside input */}
                {selectedTool && (
                  <div className="px-4 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-cyan-50 border border-cyan-200 rounded-md">
                      <span className="text-xs font-medium text-cyan-700 capitalize">{selectedTool}</span>
                      <button
                        onClick={() => setSelectedTool(null)}
                        className="text-cyan-400 hover:text-cyan-600 transition-colors"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tools Dropdown Menu */}
              {showToolsMenu && (
                <div className="absolute top-full text-left left-0 w-64 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50 animate-fade-in mt-1">
                  <div className="py-2">
                    <button onClick={() => { setSelectedTool('canvas'); setShowToolsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <IconCanvas className="h-5 w-5 text-slate-500" />
                      <span className="text-sm font-medium">Canvas</span>
                    </button>
                    <button onClick={() => { setSelectedTool('support'); setShowToolsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <IconLifebuoy className="h-5 w-5 text-slate-500" />
                      <span className="text-sm font-medium">Support</span>
                    </button>
                    <button onClick={() => { setSelectedTool('financial insights'); setShowToolsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <IconLightbulb className="h-5 w-5 text-slate-500" />
                      <span className="text-sm font-medium">Financial Insights</span>
                    </button>
                    <button onClick={() => { setSelectedTool('deep search'); setShowToolsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <IconSearch className="h-5 w-5 text-slate-500" />
                      <span className="text-sm font-medium">Deep Search</span>
                    </button>
                    <button onClick={() => { setSelectedTool('agent'); setShowToolsMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <IconAgent className="h-5 w-5 text-slate-500" />
                      <span className="text-sm font-medium">Agent</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Suggestions Panel */}
              {selectedTool && (
                <div className="absolute right-0 top-full mt-2 z-40 text-left">
                  <div className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden w-[780px] animate-fade-in">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-6 px-4 pt-4 border-b border-slate-200">
                      {['suggested', 'reports', 'actions'].map((category) => (
                        <button
                          key={category}
                          onClick={() => setSuggestionCategory(category)}
                          className={`pb-3 text-sm font-medium transition-colors ${suggestionCategory === category
                            ? 'text-cyan-600 border-b-2 border-cyan-600 -mb-px'
                            : 'text-slate-500 hover:text-slate-700'
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
                            if (suggestion.text === 'Automate monthly invoice reconciliation') {
                              setShowReconciliationAgentModal(true);
                              setSelectedTool(null);
                            } else if (suggestion.text === 'Create email automation for overdue invoices') {
                              const overdue = MOCK_TRANSACTIONS.filter(t => t.status !== 'Charged' && t.status !== 'Paid into bank');
                              setOverdueInvoices(overdue);
                              setShowAgentModal(true);
                              setSelectedTool(null);
                            } else if (suggestion.text === 'Explore your customers') {
                              setShowCustomerExploreModal(true);
                              setSelectedTool(null);
                            } else {
                              setSearchQuery(suggestion.text);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors group"
                        >
                          <span className="text-base">{suggestion.icon}</span>
                          <span className="text-sm text-slate-700 text-left flex-1">{suggestion.text}</span>
                          <IconArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </button>
                      )) || (
                          <div className="text-sm text-slate-500 text-center py-8">
                            No suggestions available for this category
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Pills and Actions Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {FILTER_PILLS.map((pill) => (
                <button
                  key={pill}
                  onClick={() => setActiveFilterPill(pill)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${activeFilterPill === pill
                    ? 'bg-cyan-500 text-white border-cyan-500'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  {pill}
                </button>
              ))}

              <div className="h-5 w-px bg-slate-200 mx-2"></div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50">
                <IconFilter className="w-3.5 h-3.5" />
                Filters [1]
              </button>

              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700">
                <IconX className="w-3.5 h-3.5" />
                Clear filters
              </button>
            </div>

            <div className="flex items-center gap-3">
              {viewMode === 'dashboard' || viewMode === 'reconciliation' ? (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-md text-sm font-medium hover:bg-cyan-100 transition-colors"
                >
                  <IconBack className="w-4 h-4" />
                  Back to List
                </button>
              ) : (
                <>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800">
                    <IconDownload className="w-3.5 h-3.5" />
                    Get reconciliation report
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800">
                    <IconDownload className="w-3.5 h-3.5" />
                    Export
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
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: '#1e3a5f' }}>
                    <tr>
                      <th className="w-8 px-4 py-3"></th>
                      {['Reference', 'Status', 'Notes', 'Customer', 'Method', 'Gross Amount', 'Fee', 'Net', 'Charged on'].map((header) => (
                        <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          {header}
                          {header === 'Charged on' && <span className="ml-1">↑</span>}
                        </th>
                      ))}
                      <th scope="col" className="relative px-4 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <IconChevronRight className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                        </td>
                        <td
                          className="px-4 py-3 whitespace-nowrap text-sm font-medium text-cyan-600 hover:underline cursor-pointer"
                          onClick={() => setModalInvoiceId(tx.reference)}
                        >
                          {tx.reference}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <StatusBadge status={tx.status === 'Paid into bank' || tx.status === 'Charged' ? 'Settled' : tx.status} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 max-w-[200px] truncate">
                          {tx.notes || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">
                          {tx.customer}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <PaymentMethodIcon type={tx.method.type} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">
                          £{tx.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                          {tx.fee === 0 ? '£0.00' : `-£${Math.abs(tx.fee).toFixed(2)}`} <IconInfo className="w-3 h-3 inline text-slate-400 ml-1" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">
                          £{tx.net.toFixed(2)} <IconInfo className="w-3 h-3 inline text-slate-400 ml-1" />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                          {tx.chargedOn}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-xs">
                            Refund
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                          No transactions found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">1-10</span> of <span className="font-medium">198</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-1">
                      <button className="p-2 rounded-md text-slate-400 hover:text-slate-600 disabled:opacity-50">
                        <IconChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-cyan-500 text-white rounded-md text-sm font-medium shadow-sm">1</button>
                      <button className="px-3 py-1 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium">2</button>
                      <button className="px-3 py-1 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium">3</button>
                      <button className="px-3 py-1 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium">4</button>
                      <span className="px-2 py-1 text-slate-500">...</span>
                      <button className="px-3 py-1 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium">9</button>
                      <button className="px-3 py-1 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium">10</button>
                      <button className="p-2 rounded-md text-slate-400 hover:text-slate-600">
                        <IconChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-700">Results per page</span>
                      <button className="relative inline-flex items-center px-2 py-1 border border-slate-300 bg-white text-sm font-medium rounded-md text-slate-700 hover:bg-slate-50">
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
    </div>
  );
}
