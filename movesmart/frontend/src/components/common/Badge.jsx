// components/common/Badge.jsx — Status badge component (Design.md §2: success/warning/error colors)
import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, XCircle, Award } from 'lucide-react';

const VARIANT_CONFIGS = {
  admin_verified: {
    bg: 'bg-[#22C55E]/10',
    border: 'border-[#22C55E]/30',
    text: 'text-[#15803D]',
    icon: ShieldCheck,
    label: 'Admin Verified',
  },
  ai_scored: {
    bg: 'bg-[#00ADB5]/10',
    border: 'border-[#00ADB5]/30',
    text: 'text-[#008C93]',
    icon: Sparkles,
    label: 'AI Audit 99%',
  },
  zero_deposit: {
    bg: 'bg-[#00ADB5]/10',
    border: 'border-[#00ADB5]/30',
    text: 'text-[#008C93]',
    icon: Award,
    label: 'Zero Deposit',
  },
  verified_owner: {
    bg: 'bg-[#22C55E]/10',
    border: 'border-[#22C55E]/30',
    text: 'text-[#15803D]',
    icon: CheckCircle2,
    label: 'Verified Owner',
  },
  approved: {
    bg: 'bg-[#22C55E]/10',
    border: 'border-[#22C55E]/30',
    text: 'text-[#15803D]',
    icon: CheckCircle2,
    label: 'Approved',
  },
  pending_review: {
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/30',
    text: 'text-[#B45309]',
    icon: AlertTriangle,
    label: 'Pending Review',
  },
  rejected: {
    bg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/30',
    text: 'text-[#B91C1C]',
    icon: XCircle,
    label: 'Flagged',
  },
};

export default function Badge({ variant = 'admin_verified', children, className = '' }) {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.admin_verified;
  const Icon = config.icon;

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-xs font-["Plus_Jakarta_Sans"]',
        config.bg,
        config.border,
        config.text,
        className,
      ].join(' ')}
    >
      <Icon size={13} className="flex-shrink-0" />
      <span>{children || config.label}</span>
    </span>
  );
}
