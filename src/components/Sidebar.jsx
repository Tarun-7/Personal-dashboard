import React from 'react';
import '../app.css'
import { Home, CreditCard, BarChart3, User, MessageSquare, Settings, Siren, Goal } from 'lucide-react';

const sidebarItems = [
  { name: 'Dashboard', icon: Home },
  { name: 'Transactions', icon: BarChart3 },
  { name: 'Upload', icon: CreditCard },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'Liabilities', icon: Siren },
  { name: 'Goals', icon: Goal },
  { name: 'Setting', icon: Settings }
];

const Sidebar = ({ activeTab, setActiveTab }) => (

  <div className="h-screen flex flex-col">
        <div className="w-64 bg-gray-800 p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-green-500 rounded mr-3"></div>
          <span className="text-xl font-semibold">FIRE</span>
        </div>
        
        <nav>
          {sidebarItems.map((item) => (
            <div
              key={item.name}
              className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                item.name === activeTab 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </div>
  </div>
);

export default Sidebar;
