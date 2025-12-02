
import React from 'react';
import { IconX, IconRefundCurve, IconCheckCircle, IconCreditCard, IconRefund } from './Icons';

interface TransactionModalProps {
  invoiceId: string;
  onClose: () => void;
}

export const TransactionModal = ({ invoiceId, onClose }: TransactionModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-[480px] overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Main Info Grid */}
          <div className="grid grid-cols-[120px_1fr] gap-y-4 mb-8">
            <div className="text-sm font-medium text-gray-500">Reference</div>
            <div className="text-sm font-semibold text-blue-500 hover:text-blue-600 cursor-pointer">{invoiceId}</div>

            <div className="text-sm font-medium text-gray-500">Total amount</div>
            <div className="text-sm font-bold text-gray-900">£200.00</div>

            <div className="text-sm font-medium text-gray-500">Status</div>
            <div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-orange-700 border border-orange-300 shadow-sm">
                <IconRefund className="w-3.5 h-3.5" />
                <span>Refunded</span>
              </span>
            </div>
          </div>

          {/* Activity Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-6">Recent activity</h3>
            
            <div className="relative pl-2">
              {/* Vertical connecting line */}
              <div className="absolute left-[15px] top-3 bottom-8 w-px bg-gray-200" />

              {/* Item 1: Refunded */}
              <div className="flex gap-4 mb-8 relative">
                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 z-10 text-gray-500">
                  <IconRefundCurve className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">£100.00 successfully refunded</p>
                  <a href="#" className="text-sm text-blue-500 hover:underline font-medium block mt-0.5">View details</a>
                  <p className="text-xs text-gray-400 mt-1">Nov 10, 2025, 1:15 PM</p>
                </div>
              </div>

              {/* Item 2: Payment Succeeded */}
              <div className="flex gap-4 mb-8 relative">
                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 z-10 text-gray-400">
                  <IconCheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Payment succeeded</p>
                  <p className="text-xs text-gray-400 mt-1">Nov 8, 2025, 10:45 AM</p>
                </div>
              </div>

              {/* Item 3: Payment Started */}
              <div className="flex gap-4 relative">
                <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 z-10 text-gray-400">
                  <IconCreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Payment started</p>
                  <p className="text-xs text-gray-400 mt-1">Nov 8, 2025, 10:45 AM</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
