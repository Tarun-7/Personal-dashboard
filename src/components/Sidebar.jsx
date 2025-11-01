import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, CreditCard, BarChart3, Settings, Siren, Goal, ChevronDown, ChevronRight, PieChart, TrendingUp, DollarSign, Bitcoin, PiggyBank, LogOut, Target, Bell, User, IndianRupee, Menu, X } from 'lucide-react';

const sidebarItems = [
 { name: 'Dashboard', icon: Home },
 { 
    name: 'INR Investments', icon: IndianRupee,
 },
  { 
    name: 'USD Investments', icon: DollarSign,
  //   submenu: [
  //    { name: 'Overview', path: 'usd-overview', icon: List },
  //    { name: 'Stocks', path: 'usd-stocks', icon: TrendingUp },
  //    { name: 'Crypto', path: 'usd-crypto', icon: Bitcoin }
  // ]
 },
 { name: 'Crypto Investments', icon: Bitcoin },
 { name: 'Cash & Savings', icon: PiggyBank },
 { name: 'Upload', icon: CreditCard },
 { 
   name: 'Analytics', 
   icon: BarChart3,
 },
 { name: 'Liabilities', icon: Siren },
 { name: 'Goals', icon: Goal },
 { 
   name: 'Settings', 
   icon: Settings,
   submenu: [
     { name: 'Profile', path: 'settings-profile', icon: User },
     { name: 'Preferences', path: 'settings-preferences', icon: Settings },
     { name: 'Notifications', path: 'settings-notifications', icon: Bell }
   ]
 }
];

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, toggleSidebar }) => {

  const { logout, user } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Expand all submenus by default
  const [expandedMenus, setExpandedMenus] = useState(
    sidebarItems.reduce((acc, item) => {
      if (item.submenu) {
        acc[item.name] = true; // Default to expanded
      }
      return acc;
    }, {})
  );

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

  const getItemGradient = (itemName, isActive) => {
    if (itemName.includes('INR')) {
      return isActive 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
        : 'hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20';
    } else if (itemName.includes('USD')) {
      return isActive 
        ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
        : 'hover:bg-gradient-to-r hover:from-green-600/20 hover:to-emerald-600/20';
    } else if (itemName.includes('Analytics')) {
      return isActive 
        ? 'bg-gradient-to-r from-orange-600 to-yellow-600' 
        : 'hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-yellow-600/20';
    } else if (itemName.includes('Crypto')) {
      return isActive 
        ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
        : 'hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-pink-600/20';
    } else if (itemName.includes('Cash')) {
      return isActive 
        ? 'bg-gradient-to-r from-teal-600 to-cyan-600' 
        : 'hover:bg-gradient-to-r hover:from-teal-600/20 hover:to-cyan-600/20';
    } else if (itemName.includes('Liabilities')) {
      return isActive 
        ? 'bg-gradient-to-r from-red-600 to-pink-600' 
        : 'hover:bg-gradient-to-r hover:from-red-600/20 hover:to-pink-600/20';
    } else if (itemName.includes('Goals')) {
      return isActive 
        ? 'bg-gradient-to-r from-yellow-600 to-orange-600' 
        : 'hover:bg-gradient-to-r hover:from-yellow-600/20 hover:to-orange-600/20';
    } else if (itemName.includes('Settings')) {
      return isActive 
        ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
        : 'hover:bg-gradient-to-r hover:from-gray-600/20 hover:to-gray-700/20';
    }
    return isActive 
      ? 'bg-gradient-to-r from-gray-600 to-gray-700' 
      : 'hover:bg-gray-700/50';
  };

  return (
    <div className={`h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-65'}`}>
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 backdrop-blur-sm border-r border-gray-700/50 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mr-3 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  FIRE
                </span>
                <p className="text-xs text-gray-400 mt-1">Portfolio Tracker</p>
              </div>
            )}
          </div>
          
          <button
            className="p-2 rounded-xl hover:bg-gray-700/50 transition-colors border border-gray-600/50"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <Menu className="w-5 h-5 text-gray-400" /> : <X className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2">
          <div className="space-y-2 pb-4">
            {sidebarItems.map((item) => (
              <div key={item.name} className="group">
                {/* Main Menu Item */}
                <div
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-gray-600/30 ${
                    item.name === activeTab
                     ? `${getItemGradient(item.name, true)} text-white shadow-lg border-gray-600/50`
                     : `text-gray-300 ${getItemGradient(item.name, false)} hover:text-white`
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg mr-3 ${isCollapsed ? 'mx-auto' : ''}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.submenu && (
                    <div className="ml-2 transition-transform duration-200">
                      {expandedMenus[item.name] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </div>

                {/* Submenu Items */}
                {!isCollapsed && item.submenu && expandedMenus[item.name] && (
                  <div className="ml-6 mt-2 space-y-1 border-l-2 border-gray-700/50 pl-4">
                    {item.submenu.map((submenuItem) => (
                      <div
                        key={submenuItem.path}
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 border border-transparent ${
                          submenuItem.path === activeTab
                           ? 'bg-gradient-to-r from-gray-700 to-gray-600 text-white border-gray-500/50 shadow-md'
                           : 'text-gray-400 hover:text-white hover:bg-gray-700/30 hover:border-gray-600/30'
                        }`}
                        onClick={() => handleItemClick(item, submenuItem)}
                      >
                        <div className="p-1.5 rounded-md mr-3">
                          {submenuItem.icon ? (
                            <submenuItem.icon className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 bg-current rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{submenuItem.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Collapsed submenu indicator */}
                {isCollapsed && item.submenu && (
                  <div className="absolute left-20 top-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <p className="text-white font-medium text-sm mb-2">{item.name}</p>
                    {item.submenu.map((submenuItem) => (
                      <div key={submenuItem.path} className="text-gray-300 text-xs py-1">
                        {submenuItem.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-gray-700/50 pt-3 mt-3 flex-shrink-0">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-2 border border-gray-600/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{user?.name}</p>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="p-2 rounded-lg hover:bg-gray-600/30 transition-colors duration-200 group"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed footer */}
        {isCollapsed && (
          <div className="border-t border-gray-700/50 pt-6 mt-6 flex justify-center flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;