import React, { useState } from 'react';
import { Home, CreditCard, BarChart3, Settings, Siren, Goal, ChevronDown, ChevronRight, List, PieChart, TrendingUp, DollarSign, Bitcoin, PiggyBank, Shield, Target, Bell, UserIcon, IndianRupee } from 'lucide-react';

const sidebarItems = [
 { name: 'Dashboard', icon: Home },
 { 
    name: 'INR Investments', 
    icon: IndianRupee,
    submenu: [
     { name: 'Overview', path: 'inr-overview', icon: List },
     { name: 'Mutual Funds', path: 'inr-mutual-funds', icon: PieChart },
     { name: 'Savings', path: 'inr-savings', icon: PiggyBank }
  ]
 },
  { 
    name: 'USD Investments', 
    icon: DollarSign,
    submenu: [
     { name: 'Overview', path: 'usd-overview', icon: List },
     { name: 'Mutual Funds', path: 'usd-mf', icon: PieChart },
     { name: 'Stocks', path: 'usd-stocks', icon: TrendingUp },
     { name: 'Crypto', path: 'usd-crypto', icon: Bitcoin }
  ]
 },
 { 
   name: 'Transactions', 
   icon: BarChart3,
 },
 { name: 'Upload', icon: CreditCard },
 { 
   name: 'Analytics', 
   icon: BarChart3,
   submenu: [
     { name: 'Portfolio Analysis', path: 'analytics-portfolio', icon: PieChart }
   ]
 },
 { name: 'Liabilities', icon: Siren },
 { name: 'Goals', icon: Goal },
 { 
   name: 'Settings', 
   icon: Settings,
   submenu: [
     { name: 'Profile', path: 'settings-profile', icon: UserIcon },
     { name: 'Preferences', path: 'settings-preferences', icon: Settings },
     { name: 'Notifications', path: 'settings-notifications', icon: Bell }
   ]
 }
];

const Sidebar = ({ activeTab, setActiveTab, toggleSidebar }) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleSubmenu = (itemName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const handleItemClick = (item, submenuItem = null) => {
    if (submenuItem) {
      setActiveTab(submenuItem.path);
    } else if (item.submenu) {
      toggleSubmenu(item.name);
    } else {
      setActiveTab(item.name);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="w-64 bg-gray-800 p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded mr-3"></div>
            <span className="text-xl font-semibold">FIRE</span>
          </div>
          <button
            className="p-2 rounded hover:bg-gray-700"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <div key={item.name} className="mb-2">
              {/* Main Menu Item */}
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  item.name === activeTab
                   ? 'bg-green-500 text-white'
                   : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center">
                  <item.icon className="w-6 h-6 mr-3" />
                  <span>{item.name}</span>
                </div>
                {item.submenu && (
                  <div className="ml-2">
                    {expandedMenus[item.name] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </div>

              {/* Submenu Items */}
              {item.submenu && expandedMenus[item.name] && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.submenu.map((submenuItem) => (
                    <div
                      key={submenuItem.path}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                        submenuItem.path === activeTab
                         ? 'bg-green-400 text-white'
                         : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                      onClick={() => handleItemClick(item, submenuItem)}
                    >
                      {submenuItem.icon ? (
                        <submenuItem.icon className="w-4 h-4 mr-3" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-500 rounded-full mr-3"></div>
                      )}
                      <span>{submenuItem.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
           ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
