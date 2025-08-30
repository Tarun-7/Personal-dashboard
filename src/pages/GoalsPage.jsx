import React, { useState } from 'react';
import { Goal, Target, TrendingUp, Calendar, DollarSign, Plus, Edit3, Trash2, Check, X } from 'lucide-react';

const currencyOptions = ['INR', 'USD', 'EUR'];

// Enhanced Circle Progress Component
const CircleProgress = ({ percentage, size = 120, strokeWidth = 12, color = "#10b981" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={size} width={size}>
        <circle
          stroke="#374151"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 0.5s ease-in-out',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
        <span className="text-xs text-gray-400">Complete</span>
      </div>
    </div>
  );
};

// Goal Card Component
const GoalCard = ({ goal, index, onEdit, onDelete, onUpdateProgress }) => {
  const [showProgressInput, setShowProgressInput] = useState(false);
  const [progressInput, setProgressInput] = useState(goal.progress || 0);

  const percentage = goal.amount > 0 ? Math.min((goal.progress / goal.amount) * 100, 100) : 0;
  const isCompleted = percentage >= 100;
  const daysLeft = Math.ceil((new Date(goal.date) - new Date()) / (1000 * 60 * 60 * 24));

  const handleProgressUpdate = () => {
    onUpdateProgress(index, parseFloat(progressInput));
    setShowProgressInput(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">
            {goal.title || `Financial Goal #${index + 1}`}
          </h3>
          <p className="text-gray-400 text-sm mb-1">Target: {goal.amount.toLocaleString()} {goal.currency}</p>
          <p className="text-gray-400 text-sm mb-1">Due: {new Date(goal.date).toLocaleDateString()}</p>
          <p className={`text-sm ${daysLeft > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(index)}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(index)}
            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <CircleProgress percentage={percentage} size={80} strokeWidth={8} />
        <div className="flex-1 ml-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Progress</span>
            {!showProgressInput ? (
              <button
                onClick={() => {
                  setProgressInput(goal.progress || 0);
                  setShowProgressInput(true);
                }}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                Update Progress
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max={goal.amount}
                  value={progressInput}
                  onChange={(e) => setProgressInput(e.target.value)}
                  className="w-20 bg-gray-700 text-white px-2 py-1 rounded text-sm"
                />
                <button
                  onClick={handleProgressUpdate}
                  className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => setShowProgressInput(false)}
                  className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="bg-gray-700 rounded-full h-3 mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{(goal.progress || 0).toLocaleString()} {goal.currency}</span>
            <span className="text-gray-400">{goal.amount.toLocaleString()} {goal.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([
    {
      title: 'Emergency Fund',
      amount: 500000,
      date: '2024-12-31',
      currency: 'INR',
      progress: 350000,
      createdAt: new Date().toISOString()
    },
    {
      title: 'Retirement Corpus',
      amount: 10000000,
      date: '2035-12-31',
      currency: 'INR',
      progress: 2500000,
      createdAt: new Date().toISOString()
    },
    {
      title: 'House Down Payment',
      amount: 1500000,
      date: '2026-06-30',
      currency: 'INR',
      progress: 800000,
      createdAt: new Date().toISOString()
    }
  ]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ 
    amount: '', 
    date: '', 
    currency: 'INR', 
    progress: 0,
    title: ''
  });

  const handleChange = (field, value) => {
    setNewGoal({ ...newGoal, [field]: value });
  };

  const addGoal = () => {
    if (!newGoal.amount || !newGoal.date || !newGoal.title) return;
    const goalToAdd = {
      ...newGoal,
      amount: parseFloat(newGoal.amount),
      progress: parseFloat(newGoal.progress) || 0,
      createdAt: new Date().toISOString()
    };
    setGoals([...goals, goalToAdd]);
    setNewGoal({ amount: '', date: '', currency: 'INR', progress: 0, title: '' });
    setShowAddForm(false);
  };

  const editGoal = (idx) => {
    setEditingIndex(idx);
    setNewGoal({
      ...goals[idx],
      amount: goals[idx].amount.toString(),
      progress: goals[idx].progress.toString()
    });
    setShowAddForm(true);
  };

  const saveGoal = () => {
    if (!newGoal.amount || !newGoal.date || !newGoal.title) return;
    const updated = [...goals];
    updated[editingIndex] = {
      ...newGoal,
      amount: parseFloat(newGoal.amount),
      progress: parseFloat(newGoal.progress) || 0,
      createdAt: goals[editingIndex].createdAt
    };
    setGoals(updated);
    setEditingIndex(null);
    setNewGoal({ amount: '', date: '', currency: 'INR', progress: 0, title: '' });
    setShowAddForm(false);
  };

  const removeGoal = (idx) => {
    setGoals(goals.filter((_, i) => i !== idx));
  };

  const updateProgress = (idx, progress) => {
    const updated = [...goals];
    updated[idx].progress = Math.min(progress, updated[idx].amount);
    setGoals(updated);
  };

  // Calculate stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => (g.progress / g.amount) >= 1).length;
  const totalTargetValue = goals.reduce((sum, g) => sum + g.amount, 0);
  const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Goals</p>
                <p className="text-2xl font-bold text-white">{totalGoals}</p>
              </div>
              <Goal className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{completedGoals}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Target Value</p>
                <p className="text-2xl font-bold text-white">₹{totalTargetValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Progress</p>
                <p className="text-2xl font-bold text-white">₹{totalProgress.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Add Goal Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">My Financial Goals</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add New Goal</span>
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingIndex !== null ? 'Edit Goal' : 'Add New Goal'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={e => handleChange('title', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                  placeholder="Emergency Fund"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Target Amount</label>
                <input
                  type="number"
                  value={newGoal.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Target Date</label>
                <input
                  type="date"
                  value={newGoal.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Currency</label>
                <select
                  value={newGoal.currency}
                  onChange={e => handleChange('currency', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                >
                  {currencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Current Progress</label>
                <input
                  type="number"
                  min="0"
                  max={newGoal.amount || undefined}
                  value={newGoal.progress}
                  onChange={e => handleChange('progress', e.target.value)}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingIndex(null);
                  setNewGoal({ amount: '', date: '', currency: 'INR', progress: 0, title: '' });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingIndex !== null ? saveGoal : addGoal}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                {editingIndex !== null ? 'Save Changes' : 'Add Goal'}
              </button>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal, index) => (
              <GoalCard
                key={index}
                goal={goal}
                index={index}
                onEdit={editGoal}
                onDelete={removeGoal}
                onUpdateProgress={updateProgress}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Goal className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Goals Set</h3>
            <p className="text-gray-500 mb-4">Start your financial journey by setting your first goal</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Set Your First Goal
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;