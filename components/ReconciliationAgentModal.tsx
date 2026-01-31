import React, { useState, useEffect, useRef } from 'react';
import { IconX, IconExpand, IconCompress, IconRobot, IconMail, IconCheck, IconAlertTriangle, IconBank, IconFileText, IconSearch, IconBarclays } from './Icons';
import { ReconciliationItem } from '../types';

// Removed GoogleGenAI initialization to prevent browser errors
// const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

interface ReconciliationAgentModalProps {
    onClose: () => void;
}

type WorkflowStage =
    | 'thinking1'
    | 'reconciling'
    | 'analyzingBank'
    | 'fetchingBankDataLoading'
    | 'fetchingBankData'
    | 'fetchingInvoices'
    | 'showingRows'
    | 'thinking2'
    | 'emailConnection'
    | 'thinking3'
    | 'draftingEmails'
    | 'showEmails'
    | 'sending'
    | 'success';

// Mock discrepancies data (same as in ReconciliationDashboard)
const MOCK_DISCREPANCIES: ReconciliationItem[] = [
    { id: '1', reference: 'INV-2025-0892', expectedAmount: 1250.00, receivedAmount: 0, customer: 'Sarah Owen', date: '15/12/2025', status: 'Overdue', method: 'Direct Debit' },
    { id: '2', reference: 'INV-2025-0847', expectedAmount: 750.50, receivedAmount: 375.25, customer: 'Wendy Lill', date: '22/12/2025', status: 'Partial', method: 'Direct Debit' },
    { id: '3', reference: 'INV-2025-0823', expectedAmount: 890.00, receivedAmount: 0, customer: 'Anna Kitching', date: '08/11/2025', status: 'Overdue', method: 'Direct Debit' },
    { id: '4', reference: 'INV-2025-0815', expectedAmount: 450.00, receivedAmount: 450.00, customer: 'Oliver Payne', date: '01/09/2025', status: 'Unmatched', method: 'Bank Transfer', notes: 'Reference mismatch' },
    { id: '5', reference: 'INV-2025-0801', expectedAmount: 2100.00, receivedAmount: 1800.00, customer: 'James Mitchell', date: '28/12/2025', status: 'Partial', method: 'Direct Debit' },
];

// Email templates by status type
const generateEmailTemplate = (item: ReconciliationItem): { subject: string; body: string } => {
    const outstanding = item.expectedAmount - item.receivedAmount;

    if (item.status === 'Overdue') {
        return {
            subject: `Urgent: Overdue Payment Reminder - Invoice ${item.reference}`,
            body: `Dear ${item.customer},

We are writing to remind you that payment for invoice ${item.reference} is now overdue.

Invoice Details:
• Invoice Reference: ${item.reference}
• Amount Due: £${item.expectedAmount.toFixed(2)}
• Original Due Date: ${item.date}
• Days Overdue: ${Math.floor((Date.now() - new Date(item.date.split('/').reverse().join('-')).getTime()) / (1000 * 60 * 60 * 24))} days

Please arrange payment at your earliest convenience to avoid any late payment charges. If you have already made this payment, please disregard this notice and accept our apologies.

For any queries regarding this invoice, please contact our finance team.

Kind regards,
Clayesmore School Finance Department
Email: david.mitch@claysmoreschool.com`
        };
    } else if (item.status === 'Partial') {
        return {
            subject: `Payment Reminder: Outstanding Balance - Invoice ${item.reference}`,
            body: `Dear ${item.customer},

Thank you for your partial payment towards invoice ${item.reference}. We appreciate your continued support.

Payment Summary:
• Invoice Reference: ${item.reference}
• Total Amount Due: £${item.expectedAmount.toFixed(2)}
• Amount Received: £${item.receivedAmount.toFixed(2)}
• Outstanding Balance: £${outstanding.toFixed(2)}

We kindly request that you settle the remaining balance of £${outstanding.toFixed(2)} at your earliest convenience.

If you would like to discuss a payment plan or have any questions about this invoice, please don't hesitate to contact us.

Thank you for your prompt attention to this matter.

Warm regards,
Clayesmore School Finance Department
Email: david.mitch@claysmoreschool.com`
        };
    } else {
        // Unmatched
        return {
            subject: `Action Required: Payment Verification - Invoice ${item.reference}`,
            body: `Dear ${item.customer},

We have received a payment of £${item.receivedAmount.toFixed(2)} that appears to be related to invoice ${item.reference}. However, we were unable to match this payment automatically due to a reference discrepancy.

Invoice Details:
• Invoice Reference: ${item.reference}
• Expected Amount: £${item.expectedAmount.toFixed(2)}
• Payment Received: £${item.receivedAmount.toFixed(2)}
• Issue: ${item.notes || 'Reference format mismatch'}

To help us allocate your payment correctly, please reply to this email confirming:
1. The invoice reference you intended to pay
2. Your payment reference used in the bank transfer

We apologise for any inconvenience and will process your payment promptly once confirmed.

Best regards,
Clayesmore School Finance Department
Email: david.mitch@claysmoreschool.com`
        };
    }
};

export const ReconciliationAgentModal = ({ onClose }: ReconciliationAgentModalProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [stage, setStage] = useState<WorkflowStage>('thinking1');
    const [displayedText, setDisplayedText] = useState('');
    const [showDots, setShowDots] = useState(0);
    const [visibleRows, setVisibleRows] = useState(0);
    const [visibleEmails, setVisibleEmails] = useState(0);
    const [emailContents, setEmailContents] = useState<{ subject: string; body: string }[]>([]);
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when stage changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [stage, displayedText, visibleRows, visibleEmails]);

    // Animated dots for thinking states
    useEffect(() => {
        if (stage === 'thinking1' || stage === 'thinking2' || stage === 'thinking3' || stage === 'sending') {
            const timer = setInterval(() => {
                setShowDots((prev) => (prev + 1) % 4);
            }, 400);
            return () => clearInterval(timer);
        }
    }, [stage]);

    // Typing effect for messages
    useEffect(() => {
        let textToDisplay = '';
        if (stage === 'reconciling') {
            textToDisplay = "I will reconcile for you. Analyzing your invoices and payment records...";
        } else if (stage === 'emailConnection') {
            textToDisplay = "I see Email is connected. I will use david.mitch@claysmoreschool.com to send the email notification to your clients.";
        } else if (stage === 'draftingEmails') {
            textToDisplay = "Here's the email I've drafted for each discrepancy:";
        } else {
            return;
        }

        let index = 0;
        setDisplayedText('');
        const timer = setInterval(() => {
            if (index < textToDisplay.length) {
                setDisplayedText(textToDisplay.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
            }
        }, 25);
        return () => clearInterval(timer);
    }, [stage]);

    // Row-by-row animation for discrepancies table
    useEffect(() => {
        if (stage === 'showingRows' && visibleRows < MOCK_DISCREPANCIES.length) {
            const timer = setTimeout(() => {
                setVisibleRows(prev => prev + 1);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [stage, visibleRows]);

    // Email-by-email animation
    useEffect(() => {
        if (stage === 'showEmails' && visibleEmails < MOCK_DISCREPANCIES.length) {
            const timer = setTimeout(() => {
                setVisibleEmails(prev => prev + 1);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [stage, visibleEmails]);

    // Generate emails when entering draftingEmails stage
    useEffect(() => {
        if (stage === 'draftingEmails') {
            const emails = MOCK_DISCREPANCIES.map(item => generateEmailTemplate(item));
            setEmailContents(emails);
        }
    }, [stage]);

    // Stage progression
    useEffect(() => {
        if (stage === 'thinking1') {
            const timer = setTimeout(() => setStage('reconciling'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'reconciling') {
            const timer = setTimeout(() => setStage('analyzingBank'), 2500);
            return () => clearTimeout(timer);
        }
        if (stage === 'analyzingBank') {
            const timer = setTimeout(() => setStage('fetchingBankDataLoading'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'fetchingBankDataLoading') {
            const timer = setTimeout(() => setStage('fetchingBankData'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'fetchingBankData') {
            const timer = setTimeout(() => setStage('fetchingInvoices'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'fetchingInvoices') {
            const timer = setTimeout(() => setStage('showingRows'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'showingRows' && visibleRows === MOCK_DISCREPANCIES.length) {
            const timer = setTimeout(() => setStage('thinking2'), 1500);
            return () => clearTimeout(timer);
        }
        if (stage === 'thinking2') {
            const timer = setTimeout(() => setStage('emailConnection'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'emailConnection') {
            const timer = setTimeout(() => setStage('thinking3'), 3000);
            return () => clearTimeout(timer);
        }
        if (stage === 'thinking3') {
            const timer = setTimeout(() => setStage('draftingEmails'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'draftingEmails') {
            const timer = setTimeout(() => setStage('showEmails'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'sending') {
            const timer = setTimeout(() => setStage('success'), 2500);
            return () => clearTimeout(timer);
        }
    }, [stage, visibleRows]);

    const handleSendEmails = () => {
        setStage('sending');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Overdue': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Partial': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Unmatched': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const allRowsVisible = visibleRows === MOCK_DISCREPANCIES.length;
    const allEmailsVisible = visibleEmails === MOCK_DISCREPANCIES.length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade-in">
            <div
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ease-out ${isExpanded ? 'w-[90vw] max-w-6xl h-[90vh]' : 'w-[750px] max-h-[90vh]'
                    }`}
            >
                {/* Header */}
                <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center ${stage === 'thinking1' || stage === 'thinking2' || stage === 'thinking3' || stage === 'sending' ? 'animate-pulse' : ''
                            }`}>
                            <IconRobot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Reconciliation Agent</h2>
                            <p className="text-xs text-gray-500">Monthly Invoice Reconciliation</p>
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

                {/* Content - Scrollable */}
                <div ref={contentRef} className="p-6 overflow-y-auto" style={{ maxHeight: isExpanded ? 'calc(90vh - 80px)' : 'calc(90vh - 80px)' }}>

                    {/* Stage 1: Initial Thinking */}
                    <div className="mb-6 animate-fade-in">
                        <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0 ${stage === 'thinking1' ? 'animate-pulse' : ''}`}>
                                <IconRobot className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                <p className="text-gray-700">
                                    {stage === 'thinking1' ? `Thinking${'.'.repeat(showDots)}` : 'Processing your reconciliation request...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stage 2: Reconciling Message */}
                    {(stage !== 'thinking1') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shrink-0">
                                    <IconCheck className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-900 font-medium">
                                        {stage === 'reconciling' ? displayedText : "I will reconcile for you. Analyzing your invoices and payment records..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Bank Identification */}
                    {(stage !== 'thinking1' && stage !== 'reconciling') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                                    <IconBank className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <p className="text-gray-900 font-medium mb-3">
                                            Identified your bank and connection. Bank found:
                                        </p>
                                        <div className="flex items-center justify-center bg-white p-4 rounded-xl border border-gray-200 w-fit shadow-sm min-w-[150px]">
                                            <div className="h-8 flex items-center justify-center">
                                                <IconBarclays className="h-full w-auto object-contain" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 4: Fetching Bank Data */}
                    {(stage !== 'thinking1' && stage !== 'reconciling' && stage !== 'analyzingBank') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0 ${stage === 'fetchingBankDataLoading' ? 'animate-pulse' : ''}`}>
                                    <IconSearch className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-900 font-medium">
                                        {stage === 'fetchingBankDataLoading' ? (
                                            <span className="flex items-center gap-2">
                                                Fetching information from the bank
                                                <span className="flex gap-1">
                                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </span>
                                            </span>
                                        ) : (
                                            <>Fetching information from the bank - <span className="text-blue-600 font-bold">112 incoming payments found</span> on January 2026</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 5: Fetching Invoices */}
                    {(stage !== 'thinking1' && stage !== 'reconciling' && stage !== 'analyzingBank' && stage !== 'fetchingBankData') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shrink-0">
                                    <IconFileText className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-900 font-medium">
                                        Fetching invoices from the system for January 2026
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Discrepancies Table (Row by Row Animation) */}
                    {(stage === 'showingRows' || (stage !== 'thinking1' && stage !== 'reconciling' && allRowsVisible)) && (
                        <div className="mb-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-200">
                                <div className="flex items-center space-x-2 mb-4">
                                    <IconAlertTriangle className="w-5 h-5 text-orange-500" />
                                    <h3 className="text-lg font-bold text-gray-900">Reconciliation Discrepancies & Actions</h3>
                                    <span className="ml-auto bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {MOCK_DISCREPANCIES.length} Items Found
                                    </span>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-slate-700">
                                            <tr>
                                                {['Reference', 'Customer', 'Expected', 'Received', 'Status', 'Date'].map(head => (
                                                    <th key={head} className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                        {head}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {MOCK_DISCREPANCIES.slice(0, visibleRows).map((item, index) => (
                                                <tr
                                                    key={item.id}
                                                    className="animate-fade-in hover:bg-gray-50 transition-colors"
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                >
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                                                        {item.reference}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {item.customer}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        £{item.expectedAmount.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        £{item.receivedAmount.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        {item.date}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Processing indicator during row loading */}
                                {stage === 'showingRows' && !allRowsVisible && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Analyzing discrepancies{'.'.repeat(showDots)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stage 4: Thinking (after table) */}
                    {(stage === 'thinking2' || (allRowsVisible && stage !== 'thinking1' && stage !== 'reconciling' && stage !== 'showingRows')) && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0 ${stage === 'thinking2' ? 'animate-pulse' : ''}`}>
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        {stage === 'thinking2' ? `Thinking${'.'.repeat(showDots)}` : 'Checking email integration...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 5: Email Connection */}
                    {(stage === 'emailConnection' || (stage !== 'thinking1' && stage !== 'reconciling' && stage !== 'showingRows' && stage !== 'thinking2' && allRowsVisible)) && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                                    <IconMail className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-900 font-medium">
                                        {stage === 'emailConnection' ? displayedText : "I see Email is connected. I will use david.mitch@claysmoreschool.com to send the email notification to your clients."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 6: Thinking (drafting emails) */}
                    {(stage === 'thinking3' || stage === 'draftingEmails' || stage === 'showEmails' || stage === 'sending' || stage === 'success') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0 ${stage === 'thinking3' ? 'animate-pulse' : ''}`}>
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        {stage === 'thinking3' ? `Thinking${'.'.repeat(showDots)}` : 'Drafting personalized emails...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 7: Email Drafts */}
                    {(stage === 'draftingEmails' || stage === 'showEmails' || stage === 'sending' || stage === 'success') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shrink-0">
                                    <IconMail className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-2">Agent</p>
                                    <p className="text-gray-900 font-medium mb-4">
                                        {stage === 'draftingEmails' ? displayedText : "Here's the email I've drafted for each discrepancy:"}
                                    </p>

                                    {/* Email Cards */}
                                    {(stage === 'showEmails' || stage === 'sending' || stage === 'success') && (
                                        <div className="space-y-4">
                                            {MOCK_DISCREPANCIES.slice(0, visibleEmails).map((item, index) => (
                                                <div
                                                    key={item.id}
                                                    className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-fade-in"
                                                    style={{ animationDelay: `${index * 150}ms` }}
                                                >
                                                    {/* Email Header */}
                                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                                                {item.status}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-700">{item.customer}</span>
                                                            <span className="text-xs text-gray-400">• {item.reference}</span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            Outstanding: £{(item.expectedAmount - item.receivedAmount).toFixed(2)}
                                                        </span>
                                                    </div>

                                                    {/* Email Subject */}
                                                    <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                                                        <p className="text-sm">
                                                            <span className="font-medium text-gray-600">Subject: </span>
                                                            <span className="text-gray-800">{emailContents[index]?.subject}</span>
                                                        </p>
                                                    </div>

                                                    {/* Email Body */}
                                                    <div className="p-4 max-h-48 overflow-y-auto">
                                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                                            {emailContents[index]?.body}
                                                        </pre>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Loading indicator */}
                                            {stage === 'showEmails' && !allEmailsVisible && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                                                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Generating email {visibleEmails + 1} of {MOCK_DISCREPANCIES.length}{'.'.repeat(showDots)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Send Button - only show when all emails visible and not sending/success */}
                                    {stage === 'showEmails' && allEmailsVisible && (
                                        <div className="flex gap-3 mt-6">
                                            <button
                                                onClick={handleSendEmails}
                                                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                <IconMail className="w-4 h-4" />
                                                <span>Send {MOCK_DISCREPANCIES.length} Emails</span>
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="flex items-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                            >
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 8: Sending */}
                    {stage === 'sending' && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0 animate-pulse">
                                    <IconMail className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        Sending reconciliation emails{'.'.repeat(showDots)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 9: Success */}
                    {stage === 'success' && (
                        <div className="mb-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                                        <IconCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-700 mb-1">Success</p>
                                        <p className="text-lg font-bold text-gray-900 mb-2">
                                            Reconciliation emails sent successfully!
                                        </p>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {MOCK_DISCREPANCIES.length} personalized emails have been sent to your clients regarding their outstanding invoices.
                                        </p>
                                        <button
                                            onClick={onClose}
                                            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-200"
                                        >
                                            <IconCheck className="w-4 h-4" />
                                            <span>Done</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
