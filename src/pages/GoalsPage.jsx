import React, { useState } from 'react';
import { Goal, Target, TrendingUp, Calendar, DollarSign, Plus, Edit3, Trash2, Check, X } from 'lucide-react';

const currencyOptions = ['INR', 'USD', 'EUR'];

// Enhanced Circle Progress Component matching dashboard style
const CircleProgress = ({ percentage, size = 120, strokeWidth = 8, color = "#4F46E5" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={size} width={size} className="transform -rotate-90">
        <circle
          stroke="#1F2937"
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
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{Math.round(percentage)}%</span>
        <span className="text-xs text-gray-400">Complete</span>
      </div>
    </div>
  );
};

// Goal Card Component with modern styling
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

  // Dynamic gradient based on progress
  const getCardGradient = () => {
    if (isCompleted) return 'from-green-500 to-emerald-600';
    if (percentage > 75) return 'from-blue-500 to-cyan-600';
    if (percentage > 50) return 'from-purple-500 to-pink-600';
    if (percentage > 25) return 'from-orange-500 to-red-600';
    return 'from-gray-500 to-slate-600';
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden group hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getCardGradient()} p-4`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">
              {goal.title || `Financial Goal #${index + 1}`}
            </h3>
            <p className="text-white/80 text-sm">
              Target: ₹{goal.amount.toLocaleString()} {goal.currency}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(index)}
              className="p-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <Edit3 size={16} />
            </button>
            <button
              onClick={() => onDelete(index)}
              className="p-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CircleProgress 
              percentage={percentage} 
              size={80} 
              strokeWidth={6} 
              color={isCompleted ? '#10B981' : '#6366F1'} 
            />
            <div>
              <p className="text-gray-400 text-sm mb-1">Progress</p>
              <p className="text-2xl font-bold text-white">
                ₹{(goal.progress || 0).toLocaleString()}
              </p>
              <p className="text-gray-400 text-sm">
                of ₹{goal.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-blue-400 to-purple-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Calendar size={16} />
            <span>{new Date(goal.date).toLocaleDateString()}</span>
          </div>
          <div className={`text-sm font-medium ${
            daysLeft > 0 
              ? daysLeft > 30 ? 'text-green-400' : 'text-yellow-400'
              : 'text-red-400'
          }`}>
            {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
          </div>
        </div>

        {/* Progress Update Section */}
        <div className="mt-4 pt-4 border-t border-slate-700">
          {!showProgressInput ? (
            <button
              onClick={() => {
                setProgressInput(goal.progress || 0);
                setShowProgressInput(true);
              }}
              className="w-full py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
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
                className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter amount"
              />
              <button
                onClick={handleProgressUpdate}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setShowProgressInput(false)}
                className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Financial Goals
            </h1>
            <p className="text-gray-400">
              Track your progress towards financial milestones
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>Add New Goal</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 border border-blue-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Goals</p>
                <p className="text-3xl font-bold text-white">{totalGoals}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Goal className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 border border-green-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold text-white">{completedGoals}</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 border border-purple-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Target Value</p>
                <p className="text-3xl font-bold text-white">₹{(totalTargetValue/100000).toFixed(1)}L</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 border border-orange-400/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Progress</p>
                <p className="text-3xl font-bold text-white">₹{(totalProgress/100000).toFixed(1)}L</p>
              </div>
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6">
              <h3 className="text-2xl font-bold text-white">
                {editingIndex !== null ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <p className="text-slate-300 mt-1">
                Set up your financial milestone
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Goal Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={e => handleChange('title', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Emergency Fund"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Target Amount</label>
                  <input
                    type="number"
                    value={newGoal.amount}
                    onChange={e => handleChange('amount', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="1000000"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.date}
                    onChange={e => handleChange('date', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Currency</label>
                  <select
                    value={newGoal.currency}
                    onChange={e => handleChange('currency', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {currencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Current Progress</label>
                  <input
                    type="number"
                    min="0"
                    max={newGoal.amount || undefined}
                    value={newGoal.progress}
                    onChange={e => handleChange('progress', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingIndex(null);
                    setNewGoal({ amount: '', date: '', currency: 'INR', progress: 0, title: '' });
                  }}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={editingIndex !== null ? saveGoal : addGoal}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                >
                  {editingIndex !== null ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
          <div className="text-center py-16">
            <div className="bg-slate-800 rounded-2xl p-12 border border-slate-700 max-w-md mx-auto">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Goal className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Goals Set</h3>
              <p className="text-gray-400 mb-6">
                Start your financial journey by setting your first goal
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
              >
                Set Your First Goal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsPage;