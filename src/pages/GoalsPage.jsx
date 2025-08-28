import React, { useState } from 'react';
import { Goal } from 'lucide-react';

const currencyOptions = ['INR', 'USD', 'EUR'];

// Circle progress component
const CircleProgress = ({ percentage }) => {
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="mb-4">
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#10b981"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fontSize="1.2em"
        fill="#10b981"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newGoal, setNewGoal] = useState({ amount: '', date: '', currency: 'INR', progress: 0 });

  const handleChange = (field, value) => {
    setNewGoal({ ...newGoal, [field]: value });
  };

  const addGoal = () => {
    if (!newGoal.amount || !newGoal.date) return;
    setGoals([...goals, { ...newGoal }]);
    setNewGoal({ amount: '', date: '', currency: 'INR', progress: 0 });
  };

  const editGoal = (idx) => {
    setEditingIndex(idx);
    setNewGoal(goals[idx]);
  };

  const saveGoal = (idx) => {
    const updated = [...goals];
    updated[idx] = { ...newGoal };
    setGoals(updated);
    setEditingIndex(null);
    setNewGoal({ amount: '', date: '', currency: 'INR', progress: 0 });
  };

  const removeGoal = (idx) => {
    setGoals(goals.filter((_, i) => i !== idx));
  };

  // Calculate current goal progress % (for first goal or selected goal)
  const currentGoal = goals[0]; // Example: first goal as current
  let percentage = 0;
  if (currentGoal && currentGoal.progress && currentGoal.amount) {
    const amount = parseFloat(currentGoal.amount) || 0;
    const progressAmount = parseFloat(currentGoal.progress) || 0;
    percentage = amount > 0 ? Math.min((progressAmount / amount) * 100, 100) : 0;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col items-center mb-6">
        <div className="rounded-full shadow-lg flex items-center justify-center w-16 h-16 mb-2">
          <Goal size={36} color="#10b981" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Set Your Financial Goals</h2>
        {currentGoal && (
          <div className="flex flex-col items-center">
            <CircleProgress percentage={percentage} />
            <p className="text-white">
              Progress: {currentGoal.progress || 0} / {currentGoal.amount} {currentGoal.currency}
            </p>
          </div>
        )}
      </div>
      <div className="overflow-auto"           style={{
            background: "#20232a",
            borderRadius: 12,
            padding: "24px 0",
            marginTop: 8,
          }}>
        <table className="table-auto w-full mb-4 border shadow-lg rounded-lg text-white">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border text-white-700 font-semibold">Amount</th>
              <th className="p-2 border text-gray-700 font-semibold bg-gray-100">Target Date</th>
              <th className="p-2 border text-gray-700 font-semibold">Currency</th>
              <th className="p-2 border text-gray-700 font-semibold">Progress</th>
              <th className="p-2 border text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal, idx) => (
              editingIndex === idx ? (
                <tr key={idx} className="bg-gray-50">
                  <td>
                    <input
                      value={newGoal.amount}
                      onChange={e => handleChange('amount', e.target.value)}
                      className="border p-1 w-full rounded bg-gray-100"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={newGoal.date}
                      onChange={e => handleChange('date', e.target.value)}
                      className="border p-1 w-full rounded bg-gray-100"
                    />
                  </td>
                  <td>
                    <select
                      value={newGoal.currency}
                      onChange={e => handleChange('currency', e.target.value)}
                      className="border p-1 w-full rounded bg-gray-100"
                    >
                      {currencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={newGoal.amount || 0}
                      value={newGoal.progress || 0}
                      onChange={e => handleChange('progress', e.target.value)}
                      className="border p-1 w-full rounded bg-gray-100"
                    />
                  </td>
                  <td>
                    <button onClick={() => saveGoal(idx)} className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600">Save</button>
                    <button onClick={() => setEditingIndex(null)} className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400">Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={idx} className="bg-gray-50">
                  <td className="p-2 border text-gray-900">{goal.amount}</td>
                  <td className="p-2 border text-gray-900">{goal.date}</td>
                  <td className="p-2 border text-gray-900">{goal.currency}</td>
                  <td className="p-2 border text-gray-900">{goal.progress || 0}</td>
                  <td className="p-2 border">
                    <button onClick={() => editGoal(idx)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600">Edit</button>
                    <button onClick={() => removeGoal(idx)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              )
            ))}
            <tr>
              <td>
                <input
                  value={newGoal.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  className="border p-1 w-full rounded bg-gray-100"
                  placeholder="Amount"
                />
              </td>
              <td>
                <input
                  type="date"
                  value={newGoal.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className="border p-1 w-full rounded bg-gray-100"
                />
              </td>
              <td>
                <select
                  value={newGoal.currency}
                  onChange={e => handleChange('currency', e.target.value)}
                  className="border p-1 w-full rounded bg-gray-100"
                >
                  {currencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  max={newGoal.amount || 0}
                  value={newGoal.progress || 0}
                  onChange={e => handleChange('progress', e.target.value)}
                  className="border p-1 w-full rounded bg-gray-100"
                  placeholder="Progress"
                />
              </td>
              <td>
                <button onClick={addGoal} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Add Goal</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoalsPage;
