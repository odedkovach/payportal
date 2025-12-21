import React, { useState, useEffect } from 'react';
import { IconX, IconExpand, IconCompress, IconRobot, IconCheck, IconUser, IconMail, IconMapPin, IconBriefcase, IconTrendingUp } from './Icons';
import { Transaction } from '../types';

interface CustomerExploreModalProps {
    onClose: () => void;
    allTransactions: Transaction[];
}

type WorkflowStage = 'thinking1' | 'confirmation' | 'thinking2' | 'customerList' | 'searching' | 'results';

interface CustomerSummary {
    name: string;
    email: string;
    transactionCount: number;
    totalSpent: number;
    lastTransactionDate: string;
}

interface CustomerSearchResult {
    customer: string;
    email: string;
    webPresence: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
        company?: string;
        occupation?: string;
        location?: string;
        bio?: string;
    };
    transactionSummary: {
        totalTransactions: number;
        totalSpent: number;
        avgTransaction: number;
        lastTransaction: string;
        paymentMethods: string[];
        statusBreakdown: Record<string, number>;
    };
    transactions: Transaction[];
}

export const CustomerExploreModal = ({ onClose, allTransactions }: CustomerExploreModalProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [stage, setStage] = useState<WorkflowStage>('thinking1');
    const [displayedText, setDisplayedText] = useState('');
    const [showDots, setShowDots] = useState(0);
    const [customers, setCustomers] = useState<CustomerSummary[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
    const [searchResult, setSearchResult] = useState<CustomerSearchResult | null>(null);

    const confirmationText = "I will help you to explore your customer.";

    // Extract unique customers with their stats
    useEffect(() => {
        const customerMap = new Map<string, CustomerSummary>();

        allTransactions.forEach(tx => {
            if (!customerMap.has(tx.customer)) {
                customerMap.set(tx.customer, {
                    name: tx.customer,
                    email: tx.customerEmail || `${tx.customer.toLowerCase().replace(/\s+/g, '.')}@email.com`,
                    transactionCount: 0,
                    totalSpent: 0,
                    lastTransactionDate: tx.chargedOn
                });
            }

            const customer = customerMap.get(tx.customer)!;
            customer.transactionCount++;
            customer.totalSpent += tx.amount;

            // Update last transaction if newer
            if (new Date(tx.chargedOn) > new Date(customer.lastTransactionDate)) {
                customer.lastTransactionDate = tx.chargedOn;
            }
        });

        setCustomers(Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent));
    }, [allTransactions]);

    // Typing effect
    useEffect(() => {
        if (stage === 'confirmation') {
            let index = 0;
            setDisplayedText('');
            const timer = setInterval(() => {
                if (index < confirmationText.length) {
                    setDisplayedText(confirmationText.slice(0, index + 1));
                    index++;
                } else {
                    clearInterval(timer);
                }
            }, 30);
            return () => clearInterval(timer);
        }
    }, [stage]);

    // Animated dots
    useEffect(() => {
        if (stage === 'thinking1' || stage === 'thinking2' || stage === 'searching') {
            const timer = setInterval(() => {
                setShowDots((prev) => (prev + 1) % 4);
            }, 400);
            return () => clearInterval(timer);
        }
    }, [stage]);

    // Stage progression
    useEffect(() => {
        if (stage === 'thinking1') {
            const timer = setTimeout(() => setStage('confirmation'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'confirmation') {
            const timer = setTimeout(() => setStage('thinking2'), 2500);
            return () => clearTimeout(timer);
        }
        if (stage === 'thinking2') {
            const timer = setTimeout(() => setStage('customerList'), 2000);
            return () => clearTimeout(timer);
        }
    }, [stage]);

    // Mock deep search - generates realistic customer data
    const performDeepSearch = (customer: CustomerSummary) => {
        setSelectedCustomer(customer);
        setStage('searching');

        // Mock web presence data
        const mockWebPresence = {
            linkedin: `https://linkedin.com/in/${customer.name.toLowerCase().replace(/\s+/g, '-')}`,
            twitter: Math.random() > 0.5 ? `https://twitter.com/${customer.name.split(' ')[0].toLowerCase()}` : undefined,
            facebook: Math.random() > 0.3 ? `https://facebook.com/${customer.name.toLowerCase().replace(/\s+/g, '.')}` : undefined,
            company: ['TechStart Inc', 'Green Leaf Co', 'Self-employed', 'Acme Corp', 'Digital Solutions Ltd'][Math.floor(Math.random() * 5)],
            occupation: ['Software Engineer', 'Product Manager', 'Marketing Director', 'CEO', 'Designer', 'Consultant'][Math.floor(Math.random() * 6)],
            location: ['London, UK', 'New York, USA', 'Berlin, Germany', 'Amsterdam, Netherlands', 'San Francisco, USA'][Math.floor(Math.random() * 5)],
            bio: `Experienced professional with a passion for innovation and technology. ${Math.random() > 0.5 ? 'Always looking for new opportunities.' : 'Building the future, one project at a time.'}`
        };

        // Calculate transaction stats
        const customerTransactions = allTransactions.filter(tx => tx.customer === customer.name);
        const paymentMethods = [...new Set(customerTransactions.map(tx => `${tx.method.type} ****${tx.method.last4}`))];
        const statusBreakdown: Record<string, number> = {};

        customerTransactions.forEach(tx => {
            statusBreakdown[tx.status] = (statusBreakdown[tx.status] || 0) + 1;
        });

        setTimeout(() => {
            setSearchResult({
                customer: customer.name,
                email: customer.email,
                webPresence: mockWebPresence,
                transactionSummary: {
                    totalTransactions: customer.transactionCount,
                    totalSpent: customer.totalSpent,
                    avgTransaction: customer.totalSpent / customer.transactionCount,
                    lastTransaction: customer.lastTransactionDate,
                    paymentMethods,
                    statusBreakdown
                },
                transactions: customerTransactions
            });
            setStage('results');
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade-in">
            <div
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ease-out ${isExpanded ? 'w-[90vw] max-w-6xl h-[90vh]' : 'w-[700px] max-h-[85vh]'
                    }`}
            >
                {/* Header */}
                <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center ${stage === 'thinking1' || stage === 'thinking2' || stage === 'searching' ? 'animate-pulse' : ''
                            }`}>
                            <IconRobot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Customer Explorer</h2>
                            <p className="text-xs text-gray-500">Deep Search Assistant</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? <IconCompress className="w-5 h-5" /> : <IconExpand className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all"
                        >
                            <IconX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: isExpanded ? 'calc(90vh - 80px)' : 'calc(85vh - 80px)' }}>

                    {/* Stage 1: Initial Thinking */}
                    {(stage === 'thinking1' || stage === 'confirmation' || stage === 'thinking2' || stage === 'customerList' || stage === 'searching' || stage === 'results') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 animate-pulse">
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">Thinking{'.'.repeat(showDots)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 2: Confirmation */}
                    {(stage === 'confirmation' || stage === 'thinking2' || stage === 'customerList' || stage === 'searching' || stage === 'results') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                                    <IconCheck className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-900 font-medium">{displayedText}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Analyzing Database */}
                    {(stage === 'thinking2' || stage === 'customerList' || stage === 'searching' || stage === 'results') && stage !== 'thinking1' && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 animate-pulse">
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        {stage === 'thinking2' ? `Analyzing customer database${'.'.repeat(showDots)}` : 'Database analysis complete'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 4: Customer List */}
                    {(stage === 'customerList' || stage === 'searching' || stage === 'results') && !selectedCustomer && (
                        <div className="mb-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                <div className="flex items-center space-x-2 mb-4">
                                    <IconUser className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-bold text-gray-900">Select a Customer</h3>
                                    <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {customers.length} customers found
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                    {customers.map((customer, index) => (
                                        <button
                                            key={index}
                                            onClick={() => performDeepSearch(customer)}
                                            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left group"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{customer.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{customer.email}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                                    <IconUser className="w-5 h-5 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                <span className="text-xs text-gray-500">{customer.transactionCount} transactions</span>
                                                <span className="text-sm font-bold text-gray-900">£{customer.totalSpent.toFixed(2)}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 5: Searching */}
                    {stage === 'searching' && selectedCustomer && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0 animate-pulse">
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700 mb-2">Searching the web for {selectedCustomer.name}{'.'.repeat(showDots)}</p>
                                    <p className="text-gray-700 mb-2">Analyzing social media presence{'.'.repeat(showDots)}</p>
                                    <p className="text-gray-700">Gathering transaction history{'.'.repeat(showDots)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 6: Results */}
                    {stage === 'results' && searchResult && (
                        <div className="mb-6 animate-fade-in space-y-6">
                            {/* Customer Header */}
                            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl p-6 text-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold mb-2">{searchResult.customer}</h3>
                                        <p className="text-blue-100 flex items-center space-x-2">
                                            <IconMail className="w-4 h-4" />
                                            <span>{searchResult.email}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Web & Social Media Section */}
                            <div className="bg-white rounded-xl p-6 border-2 border-indigo-200 shadow-sm">
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                    <span>🌐</span>
                                    <span>Web & Social Presence</span>
                                </h4>

                                <div className="space-y-3">
                                    {searchResult.webPresence.company && (
                                        <div className="flex items-center space-x-3">
                                            <IconBriefcase className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">Company:</span>
                                            <span className="text-sm font-semibold text-gray-900">{searchResult.webPresence.company}</span>
                                        </div>
                                    )}

                                    {searchResult.webPresence.occupation && (
                                        <div className="flex items-center space-x-3">
                                            <IconUser className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">Role:</span>
                                            <span className="text-sm font-semibold text-gray-900">{searchResult.webPresence.occupation}</span>
                                        </div>
                                    )}

                                    {searchResult.webPresence.location && (
                                        <div className="flex items-center space-x-3">
                                            <IconMapPin className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">Location:</span>
                                            <span className="text-sm font-semibold text-gray-900">{searchResult.webPresence.location}</span>
                                        </div>
                                    )}

                                    {searchResult.webPresence.bio && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700 italic">"{searchResult.webPresence.bio}"</p>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                                        {searchResult.webPresence.linkedin && (
                                            <a href={searchResult.webPresence.linkedin} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                                <span>in</span>
                                                <span>LinkedIn</span>
                                            </a>
                                        )}
                                        {searchResult.webPresence.twitter && (
                                            <a href={searchResult.webPresence.twitter} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center space-x-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium">
                                                <span>𝕏</span>
                                                <span>Twitter</span>
                                            </a>
                                        )}
                                        {searchResult.webPresence.facebook && (
                                            <a href={searchResult.webPresence.facebook} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                                                <span>f</span>
                                                <span>Facebook</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Summary */}
                            <div className="bg-white rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                    <IconTrendingUp className="w-5 h-5 text-purple-600" />
                                    <span>Transaction Analytics</span>
                                </h4>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Total Transactions</p>
                                        <p className="text-2xl font-bold text-gray-900">{searchResult.transactionSummary.totalTransactions}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Total Spent</p>
                                        <p className="text-2xl font-bold text-gray-900">£{searchResult.transactionSummary.totalSpent.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Avg Transaction</p>
                                        <p className="text-2xl font-bold text-gray-900">£{searchResult.transactionSummary.avgTransaction.toFixed(2)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-lg">
                                        <p className="text-xs text-gray-600 mb-1">Last Purchase</p>
                                        <p className="text-sm font-bold text-gray-900">{searchResult.transactionSummary.lastTransaction}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Payment Methods:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {searchResult.transactionSummary.paymentMethods.map((method, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                    {method}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">Status Breakdown:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(searchResult.transactionSummary.statusBreakdown).map(([status, count]) => (
                                                <span key={status} className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'Charged' ? 'bg-green-100 text-green-700' :
                                                        status === 'Refunded' ? 'bg-orange-100 text-orange-700' :
                                                            status === 'Failed' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {status}: {count}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction History */}
                            <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                                <h4 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {searchResult.transactions.map((tx, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-blue-600">{tx.reference}</p>
                                                <p className="text-xs text-gray-500">{tx.chargedOn}</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'Charged' ? 'bg-green-50 text-green-700' :
                                                        tx.status === 'Refunded' ? 'bg-orange-50 text-orange-700' :
                                                            tx.status === 'Failed' ? 'bg-red-50 text-red-700' :
                                                                'bg-gray-50 text-gray-700'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                                <span className="text-sm font-bold text-gray-900">£{tx.amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
