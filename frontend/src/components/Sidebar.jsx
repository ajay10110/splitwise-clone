import { useState } from 'react';
import { UserPlus, User, Plane, Plus, Trash2, UserMinus } from 'lucide-react';

export default function Sidebar({ 
  friends, 
  trips, 
  balances, 
  onAddFriend, 
  onDeleteFriend,
  onAddTrip, 
  onDeleteTrip,
  onRemoveTripMember,
  activeTrip, 
  setActiveTrip 
}) {
  const [addingType, setAddingType] = useState(null); // 'friend' or 'trip'
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    if (addingType === 'friend') {
      onAddFriend(inputValue.trim());
    } else if (addingType === 'trip') {
      onAddTrip(inputValue.trim());
    }
    
    setInputValue('');
    setAddingType(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full overflow-y-auto">
      {/* Trips Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-800">Trips / Groups</h2>
          <button 
            onClick={() => setAddingType(addingType === 'trip' ? null : 'trip')}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {addingType === 'trip' && (
          <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
            <input 
              type="text" 
              placeholder="Trip Name..." 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
            <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
              Add
            </button>
          </form>
        )}

        <div className="space-y-2">
          <div 
            onClick={() => setActiveTrip(null)}
            className={`flex items-center gap-3 p-3 rounded-xl transition cursor-pointer ${!activeTrip ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!activeTrip ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <User className="w-5 h-5" />
            </div>
            <span className={`font-semibold ${!activeTrip ? 'text-indigo-800' : 'text-gray-700'}`}>All Expenses</span>
          </div>

          {trips.map(trip => (
            <div 
              key={trip._id}
              className={`group flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${activeTrip?._id === trip._id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTrip(trip)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTrip?._id === trip._id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <Plane className="w-5 h-5" />
                </div>
                <span className={`font-semibold ${activeTrip?._id === trip._id ? 'text-indigo-800' : 'text-gray-700'}`}>{trip.name}</span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTrip(trip._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Friends Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-800">
          {activeTrip ? `Members in ${activeTrip.name}` : 'All Friends'}
        </h2>
        <button 
          onClick={() => setAddingType(addingType === 'friend' ? null : 'friend')}
          className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {addingType === 'friend' && (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <input 
            type="text" 
            placeholder={activeTrip ? "Friend's name to add to trip..." : "Friend's name..."}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
            Add
          </button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {friends.length === 0 ? (
          <p className="text-gray-500 text-sm italic py-4 text-center">No friends here yet.</p>
        ) : (
          friends.map((friend) => {
            const bal = balances[friend._id] || 0;
            return (
              <div key={friend._id} className="group flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-gray-700">{friend.name}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {!activeTrip && (
                    <div className="text-right flex items-center gap-2">
                      {bal > 0 ? (
                        <span className="text-sm font-bold text-green-600">owes you ${bal.toFixed(2)}</span>
                      ) : bal < 0 ? (
                        <span className="text-sm font-bold text-red-600">you owe ${Math.abs(bal).toFixed(2)}</span>
                      ) : (
                        <span className="text-sm text-gray-500">settled up</span>
                      )}
                      
                      {Math.abs(bal) < 0.01 && onDeleteFriend && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFriend(friend._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                          title="Delete Friend"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {activeTrip && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTripMember(activeTrip._id, friend._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                      title={`Remove from ${activeTrip.name}`}
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
