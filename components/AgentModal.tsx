import React, { useState, useEffect, useRef } from 'react';
import { IconX, IconExpand, IconCompress, IconRobot, IconMail, IconCheck } from './Icons';
import { Transaction } from '../types';

interface AgentModalProps {
    onClose: () => void;
    overdueInvoices: Transaction[];
}

type WorkflowStage = 'thinking1' | 'confirmation' | 'thinking2' | 'results' | 'thinking3' | 'emailCheck' | 'sending' | 'success' | 'workflowPrompt' | 'thinkingWorkflow' | 'workflowSuccess';

export const AgentModal = ({ onClose, overdueInvoices }: AgentModalProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [stage, setStage] = useState<WorkflowStage>('thinking1');
    const [displayedText, setDisplayedText] = useState('');
    const [showDots, setShowDots] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when stage changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [stage, displayedText]);

    // Text for confirmation stage
    const confirmationText = "I will Create email automation for overdue invoices for you.";
    const emailCheckText = "I see Email is connected. I will use David.mitch@nurserycare.com to send the email notification to your clients.";

    // Typing effect for confirmation and email check messages
    useEffect(() => {
        let textToDisplay = '';
        if (stage === 'confirmation') {
            textToDisplay = confirmationText;
        } else if (stage === 'emailCheck') {
            textToDisplay = emailCheckText;
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
        }, 30);
        return () => clearInterval(timer);
    }, [stage, confirmationText, emailCheckText]);

    // Animated dots for thinking states
    useEffect(() => {
        if (stage === 'thinking1' || stage === 'thinking2' || stage === 'thinking3' || stage === 'sending') {
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
            const timer = setTimeout(() => setStage('results'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'results') {
            const timer = setTimeout(() => setStage('thinking3'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'thinking3') {
            const timer = setTimeout(() => setStage('emailCheck'), 2000);
            return () => clearTimeout(timer);
        }
        if (stage === 'emailCheck') {
            const timer = setTimeout(() => setStage('sending'), 2500);
            return () => clearTimeout(timer);
        }
        if (stage === 'sending') {
            const timer = setTimeout(() => setStage('success'), 1500);
            return () => clearTimeout(timer);
        }
        if (stage === 'success') {
            const timer = setTimeout(() => setStage('workflowPrompt'), 1000);
            return () => clearTimeout(timer);
        }
        if (stage === 'thinkingWorkflow') {
            const timer = setTimeout(() => setStage('workflowSuccess'), 2000);
            return () => clearTimeout(timer);
        }
    }, [stage]);

    const handleAutomate = () => {
        setStage('thinkingWorkflow');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm animate-fade-in">
            <div
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ease-out ${isExpanded ? 'w-[90vw] max-w-5xl h-[85vh]' : 'w-[600px] max-h-[85vh]'
                    }`}
            >
                {/* Header */}
                <div className="relative flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 flex items-center justify-center ${stage === 'thinking1' || stage === 'thinking2' || stage === 'sending' ? 'animate-pulse' : ''
                            }`}>
                            <IconRobot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">AI Agent</h2>
                            <p className="text-xs text-gray-500">Automation Assistant</p>
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
                <div ref={contentRef} className="p-6 overflow-y-auto" style={{ maxHeight: isExpanded ? 'calc(85vh - 80px)' : 'calc(85vh - 80px)' }}>

                    {/* Stage 1: Initial Thinking */}
                    {(stage === 'thinking1' || stage === 'confirmation' || stage === 'thinking2' || stage === 'results' || stage === 'thinking3' || stage === 'emailCheck' || stage === 'sending' || stage === 'success' || stage === 'workflowPrompt' || stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shrink-0 ${stage === 'thinking1' ? 'animate-pulse' : ''}`}>
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        {stage === 'thinking1' ? `Thinking${'.'.repeat(showDots)}` : 'Processing your request...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 2: Confirmation Message */}
                    {(stage === 'confirmation' || stage === 'thinking2' || stage === 'results' || stage === 'thinking3' || stage === 'emailCheck' || stage === 'sending' || stage === 'success' || stage === 'workflowPrompt' || stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                                    <IconCheck className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-900 font-medium">{stage === 'confirmation' ? displayedText : confirmationText}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Secondary Thinking */}
                    {(stage === 'thinking2' || stage === 'results' || stage === 'thinking3' || stage === 'emailCheck' || stage === 'sending' || stage === 'success' || stage === 'workflowPrompt' || stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && stage !== 'thinking1' && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shrink-0 animate-pulse">
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        {stage === 'thinking2' ? `Thinking${'.'.repeat(showDots)}` : 'Analysis complete'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 4: Results Display */}
                    {(stage === 'results' || stage === 'thinking3' || stage === 'emailCheck' || stage === 'sending' || stage === 'success' || stage === 'workflowPrompt' || stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                                <div className="flex items-center space-x-2 mb-4">
                                    <IconMail className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-bold text-gray-900">Overdue Invoices</h3>
                                    <span className="ml-auto bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        {overdueInvoices.length} found
                                    </span>
                                </div>

                                {/* Invoice List */}
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {overdueInvoices.map((invoice, index) => (
                                        <div
                                            key={invoice.id}
                                            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="text-sm font-bold text-blue-600">{invoice.reference}</span>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${invoice.status === 'Failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                            invoice.status === 'Cancelled' ? 'bg-gray-50 text-gray-700 border border-gray-200' :
                                                                'bg-orange-50 text-orange-700 border border-orange-200'
                                                            }`}>
                                                            {invoice.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{invoice.customer}</p>
                                                    {invoice.customerEmail && (
                                                        <div className="flex items-center space-x-1 mt-1">
                                                            <IconMail className="w-3.5 h-3.5 text-gray-400" />
                                                            <p className="text-xs text-gray-500">{invoice.customerEmail}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">£{invoice.amount.toFixed(2)}</p>
                                                    <p className="text-xs text-gray-500">{invoice.chargedOn}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Thinking3 Stage - before email check */}
                    {(stage === 'thinking3' || stage === 'emailCheck' || stage === 'sending' || stage === 'success' || stage === 'workflowPrompt' || stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shrink-0 ${stage === 'thinking3' ? 'animate-pulse' : ''}`}>
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        {stage === 'thinking3' ? `Thinking${'.'.repeat(showDots)}` : 'Checking email configuration...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Check Stage - appears after thinking3 */}
                    {(stage === 'emailCheck' || stage === 'sending' || stage === 'success' || stage === 'workflowPrompt' || stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0">
                                    <IconCheck className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-900 font-medium">{stage === 'emailCheck' ? displayedText : emailCheckText}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sending Payment Links Stage - only during sending */}
                    {stage === 'sending' && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0 animate-pulse">
                                    <IconMail className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        Sending payment links{'.'.repeat(showDots)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {(stage === 'success' || stage === 'workflowPrompt' || stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shrink-0">
                                        <IconCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-600 mb-1">Success</p>
                                        <p className="text-lg font-bold text-gray-900 mb-2">
                                            Payment link were sent to all customers.
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {overdueInvoices.length} email{overdueInvoices.length !== 1 ? 's' : ''} sent successfully
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Workflow Automation Prompt */}
                    {(stage === 'workflowPrompt' || stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shrink-0">
                                        <IconRobot className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-indigo-600 mb-1">Agent</p>
                                        <p className="text-lg font-bold text-gray-900 mb-4">
                                            Do you want to set this up as a daily workflow?
                                        </p>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={handleAutomate}
                                                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                <IconCheck className="w-4 h-4" />
                                                <span>Yes, automate it</span>
                                            </button>
                                            <button className="flex items-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                                                <span>No, just this once</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Thinking Workflow Stage */}
                    {(stage === 'thinkingWorkflow' || stage === 'workflowSuccess') && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center shrink-0 ${stage === 'thinkingWorkflow' ? 'animate-pulse' : ''}`}>
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Agent</p>
                                    <p className="text-gray-700">
                                        {stage === 'thinkingWorkflow' ? `Thinking${'.'.repeat(showDots)}` : 'Daily email automation for overdue invoices has been set up. You can edit it under Settings -> Workflows.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
