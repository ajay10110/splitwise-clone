import { useState, useEffect } from 'react';
import { X, HandCoins } from 'lucide-react';

export default function SettleUpModal({ isOpen, onClose, friends, balances, onSave }) {
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');

  // Default selection to first friend who owes us or we owe
  useEffect(() => {
    if (isOpen) {
      const firstOwed = Object.keys(balances).find(id => balances[id] !== 0);
      if (firstOwed) {
        setTargetId(firstOwed);
        setAmount(Math.abs(balances[firstOwed]).toFixed(2));
      } else if (friends.length > 0) {
        setTargetId(friends[0]._id);
      }
    }
  }, [isOpen, balances, friends]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return alert('Enter a valid amount');
    if (!targetId) return alert('Select a friend');

    // If balances[targetId] is positive, the friend owes me -> they are paying me -> from: targetId, to: 'userId'
    // If balances[targetId] is negative, I owe the friend -> I am paying them -> from: 'userId', to: targetId
    const bal = balances[targetId] || 0;
    
    // Default assumption if strictly paying off debt
    const from = bal > 0 ? targetId : 'userId';
    const to = bal > 0 ? 'userId' : targetId;

    onSave({ from, to, amount: val });
    onClose();
  };

  const currentBal = balances[targetId] || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-green-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
            <HandCoins className="w-6 h-6 text-green-600" />
            Settle Up
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex-1">
               <label className="block text-sm font-semibold text-gray-700 mb-2">You and...</label>
               <select 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none font-medium"
                value={targetId}
                onChange={e => {
                  setTargetId(e.target.value);
                  setAmount(Math.abs(balances[e.target.value] || 0).toFixed(2));
                }}
              >
                {friends.map(f => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          {currentBal !== 0 && (
            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Current Balance</p>
              {currentBal > 0 ? (
                <p className="text-lg font-bold text-green-600">They owe you ${currentBal.toFixed(2)}</p>
              ) : (
                <p className="text-lg font-bold text-red-600">You owe them ${Math.abs(currentBal).toFixed(2)}</p>
              )}
            </div>
          )}

          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xl text-gray-800 focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent transition"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
             </div>
          </div>

          <button type="submit" className="w-full py-4 px-4 font-bold rounded-xl text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30 active:scale-95 transition">
            Record Payment
          </button>
        </form>
      </div>
    </div>
  );
}
