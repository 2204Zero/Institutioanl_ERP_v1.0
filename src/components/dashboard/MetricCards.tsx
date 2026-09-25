import React from 'react';
import { DollarSign, Clock, ArrowUpRight, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { useERP } from '../../hooks/useERP';
import { motion } from 'framer-motion';

interface MetricCardsProps {
  onSelectFilter?: (status: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ onSelectFilter }) => {
  const { transactions, students, addToast } = useERP();

  // Dynamic calculations from context state
  const totalCollected = transactions
    .filter((t) => t.status === 'Paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = transactions
    .filter((t) => t.status === 'Refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  const digitalTxnsCount = transactions.filter(
    (t) => t.paymentMode === 'UPI Gateway' || t.paymentMode === 'Net Banking' || t.paymentMode === 'Credit Card'
  ).length;

  const digitalRate = transactions.length > 0 ? Math.round((digitalTxnsCount / transactions.length) * 100) : 94;

  const cards = [
    {
      id: 'paid',
      title: 'Total Tuition Collected',
      value: `₹${totalCollected.toLocaleString('en-IN')}`,
      subtext: '+12.4% vs previous semester',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      bgIcon: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: '+12.4%',
      badgeVariant: 'bg-emerald-100 text-emerald-700',
      status: 'Paid',
    },
    {
      id: 'pending',
      title: 'Outstanding Fee Dues',
      value: `₹${pendingAmount.toLocaleString('en-IN')}`,
      subtext: `${transactions.filter((t) => t.status === 'Pending').length} pending student ledgers`,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bgIcon: 'bg-amber-50 text-amber-600 border-amber-200',
      badge: 'Action Needed',
      badgeVariant: 'bg-amber-100 text-amber-700',
      status: 'Pending',
    },
    {
      id: 'digital',
      title: 'Digital Gateway Rate',
      value: `${digitalRate}%`,
      subtext: 'UPI & Net Banking Dominance',
      icon: <TrendingUp className="w-5 h-5 text-brand-600" />,
      bgIcon: 'bg-brand-50 text-brand-600 border-brand-200',
      badge: 'High Speed',
      badgeVariant: 'bg-brand-100 text-brand-700',
      status: 'All',
    },
    {
      id: 'refund',
      title: 'Refunds Processed',
      value: `₹${totalRefunded.toLocaleString('en-IN')}`,
      subtext: `${transactions.filter((t) => t.status === 'Refunded').length} approved refund vouchers`,
      icon: <RefreshCw className="w-5 h-5 text-purple-600" />,
      bgIcon: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: 'Audited',
      badgeVariant: 'bg-purple-100 text-purple-700',
      status: 'Refunded',
    },
  ];

  const handleCardClick = (card: (typeof cards)[0]) => {
    if (onSelectFilter && card.status !== 'All') {
      onSelectFilter(card.status);
      addToast('Filter Applied', `Filtered transaction ledgers by status: ${card.status}`, 'info');
    } else {
      addToast('Metric Selected', `Viewing details for ${card.title}`, 'info');
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, idx) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <Card
            onClick={() => handleCardClick(c)}
            className="cursor-pointer hover:shadow-md border-slate-200/80 transition-all text-left group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl border ${c.bgIcon} transition-transform group-hover:scale-105`}>
                {c.icon}
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${c.badgeVariant}`}>
                {c.badge}
              </span>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-500">{c.title}</span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">{c.value}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                <span>{c.subtext}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600 transition-colors" />
              </p>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
