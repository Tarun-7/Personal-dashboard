import React from 'react';
import KuveraTransactions from '../components/KuveraTransactions';
import IbkrTransactions from '../components/IbkrTransactions';
import { BarChart3 } from 'lucide-react';

const TransactionsTab = ({
  brokerType,
  setBrokerType,
  kuveraTransactions,
  setRupeeInvestments,
  ibkrTransactions,
  setUsdInvestments
}) => {

  return (
    <div className="space-y-6">
      {/* Broker Switch */}
      <div className="flex justify-center">
        <div className="bg-gray-800 p-1 rounded-lg flex">
          <button
            onClick={() => setBrokerType('Kuvera')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              brokerType === 'Kuvera'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Kuvera
          </button>
          <button
            onClick={() => setBrokerType('Interactive Broker')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              brokerType === 'Interactive Broker'
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Interactive Broker
          </button>
        </div>
      </div>

        {/* Content based on selected broker */}
      {brokerType === 'Kuvera' ? (
        <KuveraTransactions 
          transactions={kuveraTransactions} 
          onTotalMarketValue={setRupeeInvestments} 
        />
      ) : brokerType === 'Interactive Broker' ? (
        <IbkrTransactions
          transactions={ibkrTransactions}
          onTotalMarketValueChange={setUsdInvestments}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-96">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Transactions - {brokerType}</h2>
            <p className="text-gray-400">{brokerType} transaction management will be available here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;
