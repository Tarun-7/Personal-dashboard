import React from 'react';
import {
  LayoutDashboard,
  Upload,
  Wallet,
  Target,
  IndianRupee,
  DollarSign,
  CreditCard,
  PiggyBank
} from 'lucide-react';

const FloatingDock = ({ activeTab, setActiveTab, sidebarOpen, topbar }) => {
  const dockItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
    { id: 'INR Investments', icon: IndianRupee, label: 'INR Investments', color: 'from-green-500 to-emerald-500' },
    { id: 'USD Investments', icon: DollarSign, label: 'USD Investments', color: 'from-orange-500 to-yellow-500' },
    { id: 'Cash & Savings', icon: PiggyBank, label: 'Cash & Savings', color: 'from-indigo-500 to-purple-500' },
    { id: 'Goals', icon: Target, label: 'Goals', color: 'from-red-500 to-rose-500' },
    { id: 'Liabilities', icon: CreditCard, label: 'Liabilities', color: 'from-pink-500 to-red-500' },
    { id: 'Upload', icon: Upload, label: 'Upload', color: 'from-purple-500 to-pink-500' },
    { id: 'Item8', icon: CreditCard, label: 'Item8', color: 'from-green-500 to-teal-500' },
    { id: 'Item9', icon: CreditCard, label: 'Item9', color: 'from-yellow-500 to-amber-500' },
    { id: 'Item10', icon: CreditCard, label: 'Item10', color: 'from-cyan-500 to-blue-500' },
  ];

  if (sidebarOpen) return null;

  return (
    <div
      className={
        topbar
          ? 'flex flex-row gap-3 ml-2 items-center overflow-x-auto overflow-y-hidden py-2 pb-4 pl-2'
          : 'fixed left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50 max-h-[90vh] overflow-y-auto overflow-x-hidden pr-2 pt-2'
      }
      style={
        topbar 
          ? { 
              position: 'static',
              scrollbarWidth: 'thin',
              scrollbarColor: '#475569 transparent'
            } 
          : {
              scrollbarWidth: 'thin',
              scrollbarColor: '#475569 transparent'
            }
      }
    >
      {dockItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const responsiveClass = index < 5 ? '' : 'hidden md:flex';

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              group relative flex items-center justify-center gap-2
              h-12 rounded-xl
              transition-all duration-300 ease-out
              ${isActive
                ? 'bg-gradient-to-br ' + item.color + ' scale-110 shadow-lg'
                : 'bg-slate-800/50 hover:bg-slate-700/50 hover:scale-105'
              }
              ${responsiveClass}
              w-12 md:w-auto md:px-4
              flex-shrink-0
            `}
            aria-label={item.label}
          >
            <Icon
              className={`
                w-5 h-5 transition-all duration-300
                ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}
              `}
            />
            <span
              className={`
                hidden md:inline text-sm font-medium whitespace-nowrap
                ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}
              `}
            >
              {item.label}
            </span>
            <div
              className={`
                absolute md:hidden
                ${topbar ? 'top-full mt-2 left-1/2 -translate-x-1/2' : 'left-full ml-3 top-1/2 -translate-y-1/2'}
                px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-lg whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200
                shadow-xl border border-slate-700
              `}
            >
              {item.label}
              <div
                className={`
                  absolute
                  ${topbar ? 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-t-0' : 'right-full top-1/2 -translate-y-1/2 border-r-slate-800'}
                  border-4 border-transparent
                `}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default FloatingDock;