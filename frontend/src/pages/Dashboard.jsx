import { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getFriends, addFriend, deleteFriend, getExpenses, addExpense, deleteExpense, getBalances, settleUp } from '../services/api';

import Sidebar from '../components/Sidebar';
import ExpenseList from '../components/ExpenseList';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';

import { LogOut, Plus, HandCoins } from 'lucide-react';

export default function Dashboard() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({});
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);

  const [settlements, setSettlements] = useState([]);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isSettleModalOpen, setSettleModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [fRes, eRes, bRes, tRes] = await Promise.all([
        getFriends(),
        getExpenses(activeTrip?._id),
        getBalances(activeTrip?._id),
        import('../services/api').then(api => api.getTrips())
      ]);
      setFriends(fRes.data);
      setExpenses(eRes.data);
      setBalances(bRes.data.balances || {});
      setSettlements(bRes.data.settlements || []);
      const updatedTrips = tRes.data;
      setTrips(updatedTrips);
      
      if (activeTrip) {
        const syncedActiveTrip = updatedTrips.find(t => t._id === activeTrip._id);
        if (syncedActiveTrip) {
          setActiveTrip(syncedActiveTrip);
        } else {
          setActiveTrip(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrip?._id]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleAddFriend = async (name) => {
    try {
      if (activeTrip) {
        // Find friend by name (or create it - for simplicity let's assume friend must exist or we create it globally then add to trip)
        // Let's create globally first
        const res = await addFriend({ name });
        // Then add to trip
        import('../services/api').then(api => api.addTripMembers(activeTrip._id, { friendIds: [res.data._id] })).then(loadData);
      } else {
        await addFriend({ name });
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add friend');
    }
  };
  
  const handleDeleteFriend = async (friendId) => {
    if (!confirm('Are you sure you want to delete this friend?')) return;
    try {
      await deleteFriend(friendId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete friend');
    }
  };

  const handleAddTrip = async (name) => {
    try {
      await import('../services/api').then(api => api.addTrip({ name }));
      loadData();
    } catch (err) {
      alert('Failed to add trip');
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip? All related expenses will remain but untethered.')) return;
    try {
      await import('../services/api').then(api => api.deleteTrip(tripId));
      if (activeTrip?._id === tripId) {
        setActiveTrip(null);
      }
      loadData();
    } catch (err) {
      alert('Failed to delete trip');
    }
  };

  const handleRemoveTripMember = async (tripId, memberId) => {
    if (!confirm('Remove member from this trip?')) return;
    try {
      await import('../services/api').then(api => api.removeTripMember(tripId, memberId));
      loadData();
    } catch (err) {
      alert('Failed to remove member');
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      if (activeTrip) {
        expenseData.tripId = activeTrip._id;
      }
      await addExpense(expenseData);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleSettleUp = async (data) => {
    try {
      await settleUp(data);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to settle up');
    }
  };

  const { totalOwed, totalLent, netBalance, pseudoBalances } = useMemo(() => {
    let owed = 0;
    let lent = 0;
    const pBalances = {};

    settlements.forEach(s => {
      if (s.from === 'userId') {
        owed += s.amount;
        pBalances[s.to] = -s.amount;
      }
      if (s.to === 'userId') {
        lent += s.amount;
        pBalances[s.from] = s.amount;
      }
    });

    return {
      totalOwed: owed,
      totalLent: lent,
      netBalance: lent - owed,
      pseudoBalances: pBalances
    };
  }, [settlements]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="bg-white/70 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                SplitwiseClone
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-100/50 px-3 py-1.5 rounded-full border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {user?.name || 'User'}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar - Trips & Friends */}
        <aside className="w-full lg:w-80 flex-shrink-0 h-[calc(100vh-8rem)] sticky top-24">
          <Sidebar 
            friends={activeTrip ? friends.filter(f => activeTrip.members.includes(f._id)) : friends} 
            trips={trips}
            balances={pseudoBalances}
            onAddFriend={handleAddFriend} 
            onDeleteFriend={handleDeleteFriend}
            onAddTrip={handleAddTrip}
            onDeleteTrip={handleDeleteTrip}
            onRemoveTripMember={handleRemoveTripMember}
            activeTrip={activeTrip}
            setActiveTrip={setActiveTrip}
          />
        </aside>

        {/* Main Content */}
        <section className="flex-1 space-y-6">
          {/* Top Widget / Summary */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-1 w-full divide-x divide-gray-100">
              <div className="px-4 flex-1 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total balance</p>
                <p className={`text-2xl font-black ${netBalance > 0 ? 'text-green-500' : netBalance < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                  {netBalance > 0 ? '+' : ''}${netBalance.toFixed(2)}
                </p>
              </div>
              <div className="px-4 flex-1 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">You owe</p>
                <p className="text-2xl font-black text-red-500">${totalOwed.toFixed(2)}</p>
              </div>
              <div className="px-4 flex-1 text-center hidden sm:block">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">You are owed</p>
                <p className="text-2xl font-black text-green-500">${totalLent.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setExpenseModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Add Expense
              </button>
              <button 
                onClick={() => setSettleModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-600 shadow-lg shadow-green-500/30 transition active:scale-95"
              >
                <HandCoins className="w-5 h-5" />
                Settle Up
              </button>
            </div>
          </div>

          {/* Settlements - Who owes whom */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-xl font-bold tracking-tight text-gray-800 mb-4">Network Settlements</h3>
             {settlements.length === 0 ? (
               <p className="text-gray-500 italic">No debts to settle right now!</p>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {settlements.map((s, idx) => {
                   const fromMe = s.from === 'userId';
                   const toMe = s.to === 'userId';
                   const fromUser = fromMe ? 'You' : (friends.find(f => f._id === s.from)?.name || 'Unknown');
                   const toUser = toMe ? 'You' : (friends.find(f => f._id === s.to)?.name || 'Unknown');
                   
                   return (
                     <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${fromMe ? 'bg-red-50 border-red-100' : toMe ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                       <div className="flex flex-col">
                         <span className="font-semibold text-gray-800">{fromUser}</span>
                         <span className="text-xs text-gray-500">pays</span>
                         <span className="font-semibold text-gray-800">{toUser}</span>
                       </div>
                       <span className={`text-xl font-black ${fromMe ? 'text-red-500' : toMe ? 'text-green-500' : 'text-indigo-500'}`}>
                         ${s.amount.toFixed(2)}
                       </span>
                     </div>
                   );
                 })}
               </div>
             )}
          </div>

          {/* Expense History */}
          <ExpenseList expenses={expenses} friends={friends} onDelete={handleDeleteExpense} currentUser={user} />

        </section>
      </main>

      {/* Modals */}
      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setExpenseModalOpen(false)} 
        friends={activeTrip ? friends.filter(f => activeTrip.members.includes(f._id)) : friends} 
        onSave={handleAddExpense} 
        currentUser={user}
      />

      <SettleUpModal 
        isOpen={isSettleModalOpen} 
        onClose={() => setSettleModalOpen(false)} 
        friends={friends} 
        balances={pseudoBalances} 
        onSave={handleSettleUp}
      />
    </div>
  );
}
