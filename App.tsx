
import React, { useState, useCallback } from 'react';
import { MOCK_TRANSACTIONS } from './constants';
import { Transaction, DashboardData } from './types';
import { processUserPrompt } from './services/geminiService';
import { Dashboard } from './components/Dashboard';
import { TransactionModal } from './components/TransactionModal';
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
  IconChevronLeft as IconBack
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
      styles = "bg-green-50 text-green-700 border border-green-200";
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

// --- Main App ---
export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // State for AI Views
  const [viewMode, setViewMode] = useState<'list' | 'dashboard'>('list');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // State for Modal
  const [modalInvoiceId, setModalInvoiceId] = useState<string | null>(null);

  // Filter transactions based on query
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setTransactions(MOCK_TRANSACTIONS);
      setViewMode('list');
      return;
    }

    setIsProcessing(true);

    // Use Gemini for intelligent filtering OR generation OR details
    const response = await processUserPrompt(searchQuery, MOCK_TRANSACTIONS);

    if (response.type === 'DETAILS' && response.detailsId) {
      // Show modal logic
      setModalInvoiceId(response.detailsId);
      // We don't change viewMode, we just pop the modal over whatever view is active
    } else if (response.type === 'DASHBOARD' && response.dashboardData) {
      setDashboardData(response.dashboardData);
      setViewMode('dashboard');
    } else {
      // It's a filter request
      const ids = new Set(response.filteredIds || []);
      const filtered = MOCK_TRANSACTIONS.filter(t => ids.has(t.id));
      setTransactions(filtered);
      setViewMode('list');
    }

    setIsProcessing(false);
  }, [searchQuery]);

  const handleReset = () => {
    setViewMode('list');
    setSearchQuery('');
    setTransactions(MOCK_TRANSACTIONS);
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

      <main className="max-w-[1400px] mx-auto px-4 py-8">
        <h1 className="sr-only">Balance and Activity</h1>

        <SummaryCards />

        {/* Search / Command Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className={`flex items-center space-x-1 bg-gray-100 p-1 rounded-lg transition-opacity duration-300 ${viewMode === 'dashboard' ? 'opacity-50 pointer-events-none' : ''}`}>
            <button className="bg-white text-blue-600 shadow-sm px-4 py-1.5 rounded-md text-sm font-semibold">Transactions</button>
            <button className="text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-md text-sm font-medium">Payouts</button>
          </div>

          <div className="flex-1 max-w-xl mx-4 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconSparkles className="h-4 w-4 text-purple-500 group-focus-within:animate-pulse" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all shadow-sm"
              placeholder="Ask AI: 'Filter refunded' or 'Find invoice INV-123'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute inset-y-0 right-0 pr-2 flex items-center"
            >
              <div className={`p-1.5 rounded-md ${isProcessing ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'} text-purple-600 transition-colors`}>
                {isProcessing ? (
                  <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                ) : (
                  <IconArrowRight className="h-4 w-4" />
                )}
              </div>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {viewMode === 'dashboard' ? (
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
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    {['Reference', 'Status', 'Customer', 'Method', 'Amount', 'Fee', 'Net', 'Charged on'].map((header) => (
                      <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
