'use client';

import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, BadgePercent } from 'lucide-react';
import { UPIPayment, CardPayment, NetBanking, WalletPayment, EMIPayment } from './PaymentTabs';

type PaymentTab = 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi';

interface PaymentMethodsProps {
  onPaymentComplete?: () => void;
}

const tabs = [
  { id: 'upi' as const, label: 'UPI', shortLabel: 'UPI', icon: Smartphone },
  { id: 'card' as const, label: 'Credit / Debit Card', shortLabel: 'Card', icon: CreditCard },
  { id: 'netbanking' as const, label: 'Net Banking', shortLabel: 'Net Banking', icon: Building2 },
  { id: 'wallet' as const, label: 'Wallets', shortLabel: 'Wallets', icon: Wallet },
  { id: 'emi' as const, label: 'EMI / Pay Later', shortLabel: 'EMI', icon: BadgePercent },
];

export const PaymentMethods = ({ onPaymentComplete }: PaymentMethodsProps) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>('upi');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'upi':        return <UPIPayment onPaymentComplete={onPaymentComplete} />;
      case 'card':       return <CardPayment onPaymentComplete={onPaymentComplete} />;
      case 'netbanking': return <NetBanking onPaymentComplete={onPaymentComplete} />;
      case 'wallet':     return <WalletPayment onPaymentComplete={onPaymentComplete} />;
      case 'emi':        return <EMIPayment onPaymentComplete={onPaymentComplete} />;
    }
  };

  return (
    <div className="bg-white border border-[#D6D3D1] rounded-[32px] p-8 shadow-sm">
      <h2 className="text-2xl font-black text-[#1C1917] mb-8" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>Payment Method</h2>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar tabs — desktop */}
        <nav className="hidden md:flex flex-col gap-2 w-56 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 text-left text-sm font-semibold ${
                  isActive
                    ? 'bg-[#FAF7F5] text-[#A67B5B] border border-[#D4956A]/30 shadow-sm'
                    : 'bg-transparent text-[#57534E] border border-transparent hover:bg-[#F5F5F4]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#A67B5B]' : 'text-[#78716C]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile tabs — horizontal scrollable pills */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap text-xs font-semibold transition-all flex-shrink-0 border ${
                  isActive
                    ? 'bg-[#FAF7F5] text-[#A67B5B] border-[#D4956A]/30 shadow-sm'
                    : 'bg-white text-[#78716C] border-[#E7E5E4] hover:bg-[#F5F5F4]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.shortLabel}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0 bg-white">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
