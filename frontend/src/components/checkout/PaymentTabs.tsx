'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GPayIcon, PhonePeIcon, PaytmIcon, BhimIcon,
  VisaIcon, MastercardIcon, RuPayIcon, AmexIcon,
  AmazonPayIcon, MobiKwikIcon, SimplIcon, LazyPayIcon,
} from './PaymentIcons';
import { Check, ChevronDown, QrCode, Smartphone, CreditCard, HelpCircle, CheckCircle2, Zap, FlaskConical } from 'lucide-react';
import { DEMO_PAYMENT_MODE } from '@/lib/demoConfig';

/* ── Shared animation variants ──────────────────────────────────────────── */
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
} as any;

/* ── Pay Button ─────────────────────────────────────────────────────────── */
const PayButton = ({
  label = 'Pay Now',
  amount = '12,548.08',
  onPaymentComplete,
}: {
  label?: string;
  amount?: string;
  onPaymentComplete?: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onPaymentComplete}
    className="w-full btn-accent flex items-center justify-center gap-2 mt-4 py-4"
  >
    <span className="relative z-10">{label} — ₹{amount}</span>
  </motion.button>
);

/* ── Demo Badge ─────────────────────────────────────────────────────────── */
const DemoBadge = () => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-700 uppercase tracking-wider">
    <FlaskConical className="w-3 h-3" />
    Demo Mode
  </div>
);

/* ── UPI Payment Tab ─────────────────────────────────────────────────────── */
export const UPIPayment = ({ onPaymentComplete }: { onPaymentComplete?: () => void }) => {
  const [selected, setSelected] = useState<string | null>('gpay');
  const [upiId, setUpiId] = useState('');
  const [mode, setMode] = useState<'apps' | 'qr' | 'id'>('apps');
  const [completingPayment, setCompletingPayment] = useState(false);

  const options = [
    { id: 'gpay', name: 'Google Pay', icon: <GPayIcon size={36} /> },
    { id: 'phonepe', name: 'PhonePe', icon: <PhonePeIcon size={36} /> },
    { id: 'paytm', name: 'Paytm', icon: <PaytmIcon size={36} /> },
    { id: 'bhim', name: 'BHIM', icon: <BhimIcon size={36} /> },
  ];

  const handleComplete = () => {
    setCompletingPayment(true);
    setTimeout(() => {
      onPaymentComplete?.();
    }, 600);
  };

  return (
    <motion.div {...fadeUp} className="flex flex-col gap-6">
      {/* Mode selector */}
      <div className="flex bg-[#F5F5F4] p-1.5 rounded-[16px] gap-1 relative overflow-hidden">
        {[
          { id: 'apps', label: 'UPI Apps', icon: <Smartphone className="w-4 h-4" /> },
          { id: 'qr', label: 'Scan QR', icon: <QrCode className="w-4 h-4" /> },
          { id: 'id', label: 'UPI ID', icon: <span className="text-sm font-bold">@</span> },
        ].map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all relative z-10 ${
                isActive
                  ? 'bg-white text-[#1C1917] shadow-sm'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              {m.icon} {m.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'apps' && (
          <motion.div key="apps" {...fadeUp} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {options.map((opt) => (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelected(opt.id)}
                  className={`relative flex flex-col items-center justify-center p-5 rounded-[20px] border transition-all ${
                    selected === opt.id
                      ? 'bg-[#FAF7F5] border-[#A67B5B] shadow-sm'
                      : 'bg-white border-[#E7E5E4] hover:border-[#D6D3D1] hover:bg-[#F5F5F4]'
                  }`}
                >
                  {selected === opt.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-[#A67B5B] rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="mb-3 h-12 flex items-center justify-center">{opt.icon}</div>
                  <span className="text-xs font-bold text-[#1C1917]">{opt.name}</span>
                </motion.button>
              ))}
            </div>
            <p className="text-[11px] font-medium text-[#78716C] text-center pt-2">
              Open your UPI app to approve the payment request
            </p>
            {DEMO_PAYMENT_MODE && (
              <div className="flex justify-center">
                <DemoBadge />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={completingPayment}
              className="w-full py-4 mt-2 rounded-[16px] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: 'white' }}
            >
              {completingPayment ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> I Have Completed Payment</>
              )}
            </motion.button>
          </motion.div>
        )}

        {mode === 'qr' && (
          <motion.div key="qr" {...fadeUp} className="flex flex-col items-center gap-5">

            {/* ── Header ── */}
            <div className="text-center">
              <h3 className="font-black text-[#1C1917] text-xl mb-1" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                Google Pay / UPI Payment
              </h3>
              <p className="text-xs font-medium text-[#78716C]">Scan the QR below to complete payment</p>
            </div>

            {/* ── Premium QR Card ── */}
            <div
              className="w-full max-w-xs bg-white rounded-[24px] shadow-lg border border-[#E7E5E4] overflow-hidden"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)' }}
            >
              {/* Card header strip */}
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* GPay wordmark inline */}
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-white border border-[#E7E5E4] shadow-sm flex items-center justify-center">
                    <GPayIcon size={22} />
                  </div>
                  <span className="text-sm font-bold text-[#1C1917]">Google Pay</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-wider">Live</span>
                </div>
              </div>

              {/* QR Image — always uses /payment/gpay-qr.png */}
              <div className="px-5 pb-3">
                <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-white border border-[#F5F5F4]">
                  <Image
                    src="/payment/gpay-qr.png"
                    alt="Google Pay QR Code"
                    fill
                    className="object-contain p-2"
                    priority
                    unoptimized
                  />
                </div>
              </div>

              {/* UPI app logos */}
              <div className="px-5 py-3 border-t border-[#F5F5F4] flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl border border-[#E7E5E4] bg-white shadow-sm flex items-center justify-center">
                    <GPayIcon size={22} />
                  </div>
                  <span className="text-[9px] font-semibold text-[#78716C]">GPay</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl border border-[#E7E5E4] bg-white shadow-sm flex items-center justify-center">
                    <PhonePeIcon size={22} />
                  </div>
                  <span className="text-[9px] font-semibold text-[#78716C]">PhonePe</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl border border-[#E7E5E4] bg-white shadow-sm flex items-center justify-center">
                    <PaytmIcon size={22} />
                  </div>
                  <span className="text-[9px] font-semibold text-[#78716C]">Paytm</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl border border-[#E7E5E4] bg-white shadow-sm flex items-center justify-center">
                    <BhimIcon size={22} />
                  </div>
                  <span className="text-[9px] font-semibold text-[#78716C]">BHIM</span>
                </div>
              </div>

              {/* Security footer */}
              <div className="px-5 py-3 bg-[#F9F9F9] border-t border-[#F0F0F0] flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#78716C] flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 text-[#22C55E] inline-block">🔒</span>
                  UPI Payment Accepted
                </span>
                <span className="text-[10px] font-semibold text-[#A67B5B]">
                  Secure Demo Checkout
                </span>
              </div>
            </div>

            {/* ── Demo info + CTA ── */}
            {DEMO_PAYMENT_MODE ? (
              <div className="w-full flex flex-col items-center gap-3">
                <DemoBadge />
                <p className="text-xs font-medium text-[#78716C] text-center max-w-xs">
                  Scan &amp; pay any amount (₹1, ₹5, or skip) — your booking will still be confirmed in demo mode.
                </p>

                {/* Primary CTA */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleComplete}
                  disabled={completingPayment}
                  className="w-full py-4 rounded-[16px] font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: 'white' }}
                >
                  {completingPayment ? (
                    <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> I Have Completed Payment</>
                  )}
                </motion.button>

                {/* Secondary simulate button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  disabled={completingPayment}
                  className="w-full py-3 rounded-[16px] font-semibold text-sm flex items-center justify-center gap-2 border border-[#A67B5B]/30 text-[#A67B5B] bg-[#FAF7F5] hover:bg-[#F5EDE5] transition-all"
                >
                  <Zap className="w-4 h-4" /> Simulate Successful Payment
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-[#F5EDE5]/50 border border-[#D4956A]/30 rounded-full text-[#A67B5B]">
                <div className="w-1.5 h-1.5 bg-[#A67B5B] rounded-full animate-pulse" />
                <span className="text-xs font-semibold">Waiting for payment...</span>
              </div>
            )}
          </motion.div>
        )}

        {mode === 'id' && (
          <motion.div key="id" {...fadeUp} className="flex flex-col gap-5 pt-2">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-[#1C1917]">Enter your UPI ID</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="mobilenumber@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="flex-1 px-4 py-3.5 rounded-[16px] border border-[#D6D3D1] bg-[#FAF7F5] focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all text-sm font-medium"
                />
                <button className="px-6 py-3.5 rounded-[16px] bg-[#1C1917] text-white font-semibold text-sm hover:bg-[#44403C] transition-colors shadow-sm">
                  Verify
                </button>
              </div>
              <p className="text-[11px] font-medium text-[#78716C] flex items-center gap-1.5 mt-1">
                <HelpCircle className="w-3.5 h-3.5" /> Find UPI ID in your banking/payment app settings
              </p>
            </div>
            {DEMO_PAYMENT_MODE && (
              <div className="flex justify-center">
                <DemoBadge />
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={completingPayment}
              className="w-full py-4 mt-2 rounded-[16px] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: 'white' }}
            >
              {completingPayment ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> I Have Completed Payment</>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Card Payment Tab ────────────────────────────────────────────────────── */
export const CardPayment = ({ onPaymentComplete }: { onPaymentComplete?: () => void }) => {
  const [saveCard, setSaveCard] = useState(true);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const cardType = cardNum.startsWith('4') ? 'visa'
    : cardNum.startsWith('5') ? 'mc'
    : cardNum.startsWith('6') ? 'rupay'
    : cardNum.startsWith('3') ? 'amex' : null;

  return (
    <motion.div {...fadeUp} className="flex flex-col gap-6">
      {/* Card preview — showroom glass */}
      <div
        className="w-full h-52 p-7 flex flex-col justify-between relative overflow-hidden rounded-[24px] shadow-sm"
        style={{ background: 'linear-gradient(135deg, #292524 0%, #1C1917 100%)' }}
      >
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col gap-0.5">
            <span className="text-white/60 text-xs font-medium">Credit Card</span>
            <span className="text-white text-lg font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>EventNova</span>
          </div>
          <div className="h-8">
            {cardType === 'visa' ? <VisaIcon size={24} /> :
             cardType === 'mc' ? <MastercardIcon size={24} /> :
             cardType === 'rupay' ? <RuPayIcon size={24} /> :
             cardType === 'amex' ? <AmexIcon size={24} /> :
             <div className="w-12 h-8 rounded-md bg-white/10 flex items-center justify-center backdrop-blur-sm">
               <CreditCard className="w-4 h-4 text-white/50" />
             </div>}
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-white/90 font-mono text-xl tracking-[0.2em] mb-4">
            {cardNum || '•••• •••• •••• ••••'}
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Valid Thru</p>
              <p className="text-white font-mono font-semibold">{expiry || 'MM/YY'}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <span className="text-white/80 font-mono font-bold text-xs">{cvv ? '•'.repeat(cvv.length) : 'CVV'}</span>
            </div>
          </div>
        </div>
        
        {/* Chip */}
        <div className="absolute top-16 left-7 w-12 h-9 rounded-md border border-white/20 bg-white/5 flex items-center justify-center">
          <div className="w-full h-px bg-white/20 absolute top-1/2 -translate-y-1/2" />
          <div className="h-full w-px bg-white/20 absolute left-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Accepted cards */}
      <div className="flex items-center gap-4 pb-4 border-b border-[#F5F5F4]">
        <span className="text-xs font-semibold text-[#78716C]">Accepted:</span>
        <VisaIcon size={20} />
        <MastercardIcon size={20} />
        <RuPayIcon size={20} />
        <AmexIcon size={20} />
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#57534E]">Card Number</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
            value={cardNum}
            onChange={(e) => setCardNum(formatCard(e.target.value))}
            className="w-full px-4 py-3.5 rounded-xl border border-[#D6D3D1] bg-[#FAF7F5] focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-mono text-sm tracking-wider"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#57534E]">Expiry Date</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              className="w-full px-4 py-3.5 rounded-xl border border-[#D6D3D1] bg-[#FAF7F5] focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-mono text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#57534E] flex items-center gap-1.5">
              CVV
              <span title="3-digit security code on the back of your card" className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-[#A67B5B]" />
              </span>
            </label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="•••"
              maxLength={4}
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3.5 rounded-xl border border-[#D6D3D1] bg-[#FAF7F5] focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all font-mono text-sm"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-[#57534E]">Name on Card</label>
          <input
            type="text"
            placeholder="Full name as on card"
            className="w-full px-4 py-3.5 rounded-xl border border-[#D6D3D1] bg-[#FAF7F5] focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] transition-all text-sm font-medium"
          />
        </div>
        
        <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border border-[#E7E5E4] hover:bg-[#F5F5F4] transition-colors mt-2">
          <button
            onClick={() => setSaveCard(!saveCard)}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
              saveCard ? 'bg-[#A67B5B] border-transparent shadow-sm' : 'bg-white border border-[#D6D3D1]'
            }`}
          >
            {saveCard && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
          <div>
            <p className="text-sm font-semibold text-[#1C1917]">Save card for future payments</p>
            <p className="text-[11px] font-medium text-[#78716C] mt-0.5">Secured with 256-bit encryption</p>
          </div>
        </label>
      </div>

      {DEMO_PAYMENT_MODE && <div className="flex justify-center"><DemoBadge /></div>}
      <PayButton label="Pay Securely" onPaymentComplete={onPaymentComplete} />
    </motion.div>
  );
};

/* ── Net Banking Tab ─────────────────────────────────────────────────────── */
const bankColors: Record<string, { bg: string; text: string; abbr: string }> = {
  sbi:   { bg: '#FAF7F5', text: '#1C1917', abbr: 'SBI' },
  hdfc:  { bg: '#FAF7F5', text: '#1C1917', abbr: 'HDFC' },
  icici: { bg: '#FAF7F5', text: '#1C1917', abbr: 'ICICI' },
  axis:  { bg: '#FAF7F5', text: '#1C1917', abbr: 'Axis' },
  kotak: { bg: '#FAF7F5', text: '#1C1917', abbr: 'Kotak' },
  pnb:   { bg: '#FAF7F5', text: '#1C1917', abbr: 'PNB' },
};

export const NetBanking = ({ onPaymentComplete }: { onPaymentComplete?: () => void }) => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const popularBanks = [
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'axis', name: 'Axis Bank' },
    { id: 'kotak', name: 'Kotak Mahindra' },
    { id: 'pnb', name: 'Punjab National Bank' },
  ];

  return (
    <motion.div {...fadeUp} className="flex flex-col gap-6">
      <p className="text-sm font-medium text-[#57534E]">Select your bank to proceed securely</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {popularBanks.map((bank) => {
          const meta = bankColors[bank.id];
          const isSelected = selectedBank === bank.id;
          return (
            <motion.button
              key={bank.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedBank(bank.id)}
              className={`relative flex flex-col items-center justify-center p-5 rounded-[20px] border transition-all gap-3 ${
                isSelected 
                  ? 'border-[#A67B5B] bg-[#FAF7F5] shadow-sm' 
                  : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:bg-[#F5F5F4]'
              }`}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border border-[#E7E5E4]"
                style={{ background: isSelected ? '#A67B5B' : 'white', color: isSelected ? 'white' : '#1C1917' }}
              >
                {meta.abbr}
              </div>
              <span className="text-xs font-semibold text-center leading-tight text-[#1C1917]">{bank.name}</span>
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[#A67B5B] rounded-full flex items-center justify-center shadow-sm">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
      
      <div className="flex flex-col gap-2 mt-2">
        <label className="text-xs font-semibold text-[#57534E]">Other Banks</label>
        <div className="relative">
          <select className="w-full px-4 py-3.5 rounded-xl border border-[#D6D3D1] bg-[#FAF7F5] appearance-none focus:outline-none focus:border-[#A67B5B] focus:ring-1 focus:ring-[#A67B5B] cursor-pointer text-sm font-medium text-[#1C1917] transition-all">
            <option value="">Select your bank...</option>
            <option value="bob">Bank of Baroda</option>
            <option value="canara">Canara Bank</option>
            <option value="idfc">IDFC First Bank</option>
            <option value="indusind">IndusInd Bank</option>
            <option value="yes">YES Bank</option>
            <option value="federal">Federal Bank</option>
            <option value="rbl">RBL Bank</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78716C] pointer-events-none" />
        </div>
      </div>
      {DEMO_PAYMENT_MODE && <div className="flex justify-center"><DemoBadge /></div>}
      <PayButton label="Proceed to Net Banking" onPaymentComplete={onPaymentComplete} />
    </motion.div>
  );
};

/* ── Wallet Payment Tab ──────────────────────────────────────────────────── */
export const WalletPayment = ({ onPaymentComplete }: { onPaymentComplete?: () => void }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const wallets = [
    { id: 'paytm', name: 'Paytm Wallet', icon: <PaytmIcon size={32} />, balance: '₹0.00', desc: 'Link to check balance' },
    { id: 'amazon', name: 'Amazon Pay', icon: <AmazonPayIcon size={32} />, balance: null, desc: 'Use your Amazon Pay balance' },
    { id: 'mobikwik', name: 'MobiKwik', icon: <MobiKwikIcon size={32} />, balance: null, desc: 'MobiKwik Wallet & SuperCash' },
  ];

  return (
    <motion.div {...fadeUp} className="flex flex-col gap-4">
      {wallets.map((wallet) => (
        <motion.button
          key={wallet.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected(wallet.id)}
          className={`flex items-center justify-between p-5 rounded-[20px] border transition-all text-left ${
            selected === wallet.id
              ? 'border-[#A67B5B] bg-[#FAF7F5] shadow-sm'
              : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:bg-[#F5F5F4]'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[16px] border border-[#E7E5E4] bg-white flex items-center justify-center overflow-hidden shadow-sm">
              {wallet.icon}
            </div>
            <div>
              <p className="font-bold text-[#1C1917] text-sm">{wallet.name}</p>
              <p className={`text-xs font-medium mt-0.5 ${selected === wallet.id ? 'text-[#78716C]' : 'text-[#78716C]'}`}>{wallet.desc}</p>
              {wallet.balance && <p className="text-xs font-semibold text-[#A67B5B] mt-1">Balance: {wallet.balance}</p>}
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
            selected === wallet.id ? 'bg-[#A67B5B] border-transparent' : 'border border-[#D6D3D1] bg-white'
          }`}>
            {selected === wallet.id && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </motion.button>
      ))}
      {DEMO_PAYMENT_MODE && <div className="flex justify-center mt-2"><DemoBadge /></div>}
      {selected && <PayButton label="Pay with Wallet" onPaymentComplete={onPaymentComplete} />}
    </motion.div>
  );
};

/* ── EMI / Pay Later Tab ─────────────────────────────────────────────────── */
export const EMIPayment = ({ onPaymentComplete }: { onPaymentComplete?: () => void }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    {
      id: 'simpl',
      name: 'Simpl Pay Later',
      icon: <SimplIcon size={32} />,
      desc: 'Pay in 3 parts. Zero interest.',
      badge: 'Instant Approval',
      badgeColor: 'text-[#22C55E] bg-[#DCFCE7] border border-[#22C55E]/20',
    },
    {
      id: 'lazypay',
      name: 'LazyPay',
      icon: <LazyPayIcon size={32} />,
      desc: 'Pay later in 15 days.',
      badge: 'No cost EMI',
      badgeColor: 'text-[#A67B5B] bg-[#F5EDE5] border border-[#A67B5B]/20',
    },
    {
      id: 'icici_emi',
      name: 'ICICI Bank EMI',
      icon: <div className="text-xs font-bold text-[#1C1917]">ICICI</div>,
      desc: '3, 6, 9, 12 month plans available.',
      badge: '0% Interest',
      badgeColor: 'text-[#57534E] bg-[#F5F5F4] border border-[#D6D3D1]',
    },
    {
      id: 'hdfc_emi',
      name: 'HDFC Bank EMI',
      icon: <div className="text-xs font-bold text-[#1C1917]">HDFC</div>,
      desc: '6, 12, 18 month plans.',
      badge: 'Low Interest',
      badgeColor: 'text-[#57534E] bg-[#F5F5F4] border border-[#D6D3D1]',
    },
  ];

  return (
    <motion.div {...fadeUp} className="flex flex-col gap-4">
      {options.map((opt) => (
        <motion.button
          key={opt.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelected(opt.id)}
          className={`flex items-center justify-between p-5 rounded-[20px] border transition-all text-left ${
            selected === opt.id
              ? 'border-[#A67B5B] bg-[#FAF7F5] shadow-sm'
              : 'border-[#E7E5E4] bg-white hover:border-[#D6D3D1] hover:bg-[#F5F5F4]'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[16px] border border-[#E7E5E4] bg-white shadow-sm flex items-center justify-center overflow-hidden">
              {opt.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-[#1C1917] text-sm">{opt.name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${opt.badgeColor}`}>{opt.badge}</span>
              </div>
              <p className="text-xs font-medium text-[#78716C]">{opt.desc}</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            selected === opt.id ? 'bg-[#A67B5B] border-transparent' : 'border border-[#D6D3D1] bg-white'
          }`}>
            {selected === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </motion.button>
      ))}
      {DEMO_PAYMENT_MODE && <div className="flex justify-center mt-2"><DemoBadge /></div>}
      {selected && <PayButton label="Continue with EMI" onPaymentComplete={onPaymentComplete} />}
    </motion.div>
  );
};
