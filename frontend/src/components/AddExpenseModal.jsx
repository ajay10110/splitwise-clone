import { useState, useEffect } from 'react';
import { X, Receipt, Users, Calculator, Plus, DollarSign, Percent } from 'lucide-react';

export default function AddExpenseModal({ isOpen, onClose, friends, onSave, currentUser }) {
  const [title, setTitle] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidBy, setPaidBy] = useState('userId'); // 'userId' refers to current user
  const [splitType, setSplitType] = useState('equal'); // 'equal', 'exact', 'percentage'
  
  // Selected participants mapping: id -> { selected: boolean, exactVal: string, percVal: string }
  const [participants, setParticipants] = useState({});

  useEffect(() => {
    if (isOpen) {
      setParticipants(
        [{ _id: 'userId', name: 'You' }, ...friends].reduce((acc, f) => ({
          ...acc,
          [f._id]: { selected: true, exactVal: '', percVal: '' }
        }), {})
      );
      setTitle('');
      setTotalAmount('');
      setPaidBy('userId');
      setSplitType('equal');
    }
  }, [isOpen, friends]);

  if (!isOpen) return null;

  const handleToggleParticipant = (id) => {
    setParticipants(prev => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id].selected }
    }));
  };

  const handleValChange = (id, field, val) => {
    setParticipants(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: val }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(totalAmount);
    if (isNaN(amountNum) || amountNum <= 0) return alert('Invalid total amount');
    if (!title.trim()) return alert('Enter a title');

    const selectedIds = Object.keys(participants).filter(id => participants[id].selected);
    if (selectedIds.length === 0) return alert('Select at least one participant');

    let finalParticipants = [];

    if (splitType === 'equal') {
      const splitAmount = amountNum / selectedIds.length;
      finalParticipants = selectedIds.map(id => ({
        friendId: id,
        amountOwed: splitAmount
      }));
    } else if (splitType === 'exact') {
      let sum = 0;
      finalParticipants = selectedIds.map(id => {
        const val = parseFloat(participants[id].exactVal) || 0;
        sum += val;
        return { friendId: id, amountOwed: val };
      });
      // Allow slight floating point variations
      if (Math.abs(sum - amountNum) > 0.05) {
        return alert(`Exact amounts must sum up to ${amountNum}. Currently sums to ${sum}.`);
      }
    } else if (splitType === 'percentage') {
      let sum = 0;
      finalParticipants = selectedIds.map(id => {
        const perc = parseFloat(participants[id].percVal) || 0;
        sum += perc;
        return { friendId: id, amountOwed: amountNum * (perc / 100) };
      });
      if (Math.abs(sum - 100) > 0.1) {
        return alert(`Percentages must sum up to 100%. Currently sums to ${sum}%.`);
      }
    }

    onSave({
      title,
      totalAmount: amountNum,
      paidBy,
      splitType,
      participants: finalParticipants,
      splitDetails: {}
    });
    onClose();
  };

  const selectedCount = Object.values(participants).filter(p => p.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Receipt className="w-6 h-6 text-indigo-600" />
            Add an Expense
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="grid grid-cols-[1fr,120px] gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <input 
                autoFocus
                placeholder="e.g. Dinner at Mario's"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent transition"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  value={totalAmount}
                  onChange={e => setTotalAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Paid By</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition cursor-pointer font-medium"
              value={paidBy}
              onChange={e => setPaidBy(e.target.value)}
            >
              <option value="userId">You</option>
              {friends.map(f => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              Split Options
            </label>
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              {[
                { id: 'equal', icon: Calculator, label: '=' },
                { id: 'exact', icon: DollarSign, label: 'Exact' },
                { id: 'percentage', icon: Percent, label: '%' }
              ].map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSplitType(type.id)}
                  className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${splitType === type.id ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="capitalize">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Participants</label>
              {[ { _id: 'userId', name: 'You' }, ...friends].map(f => {
                const isSelected = participants[f._id]?.selected;
                return (
                  <div key={f._id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isSelected ? 'border-indigo-100 bg-indigo-50/30' : 'border-gray-100 bg-gray-50/50 opacity-60'}`}>
                    <label className="flex items-center flex-1 cursor-pointer">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={isSelected || false}
                          onChange={() => handleToggleParticipant(f._id)}
                        />
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-md peer-checked:bg-indigo-600 peer-checked:border-indigo-600 flex items-center justify-center transition-all mr-3">
                           {isSelected && <Plus className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>{f.name}</span>
                    </label>

                    {isSelected && splitType === 'exact' && (
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full pl-6 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                          value={participants[f._id]?.exactVal || ''}
                          onChange={e => handleValChange(f._id, 'exactVal', e.target.value)}
                        />
                      </div>
                    )}

                    {isSelected && splitType === 'percentage' && (
                      <div className="relative w-24">
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          className="w-full pl-3 pr-6 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-right"
                          value={participants[f._id]?.percVal || ''}
                          onChange={e => handleValChange(f._id, 'percVal', e.target.value)}
                        />
                      </div>
                    )}

                    {isSelected && splitType === 'equal' && totalAmount > 0 && selectedCount > 0 && (
                      <span className="font-semibold text-gray-600 w-28 text-right">
                        ${(parseFloat(totalAmount) / selectedCount).toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 py-3 px-4 font-bold rounded-xl text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 py-3 px-4 font-bold rounded-xl text-white bg-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
