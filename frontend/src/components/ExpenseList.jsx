import { format } from 'date-fns';
import { Receipt, Trash2 } from 'lucide-react';

export default function ExpenseList({ expenses, friends, onDelete, currentUser }) {
  
  const getFriendName = (id) => {
    if (id === 'userId' || id === currentUser.id) return 'You';
    const f = friends.find(fr => fr._id === id);
    return f ? f.name : 'Unknown';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold tracking-tight text-gray-800 mb-6">Recent Expenses</h2>
      
      <div className="space-y-4">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No expenses yet. Add one to get started!</p>
        ) : (
          expenses.map((expense) => {
            const isSettle = expense.title === 'Settled up';
            return (
              <div key={expense._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${isSettle ? 'bg-green-500' : 'bg-purple-500'}`}>
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{expense.title}</h3>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">{getFriendName(expense.paidBy)}</span> paid <span className="font-bold text-gray-800">${expense.totalAmount.toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{format(new Date(expense.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right flex flex-col items-end">
                     {/* Show user's share */}
                     {(() => {
                        const userPart = expense.participants.find(p => p.friendId === 'userId' || p.friendId === currentUser.id);
                        if (!userPart && expense.paidBy !== 'userId') {
                          return <span className="text-gray-500 text-sm">Not involved</span>;
                        }
                        if (expense.paidBy === 'userId') {
                          // User paid. Calculate how much others owe user for this expense
                          const othersOwe = expense.participants.filter(p => p.friendId !== 'userId').reduce((sum, p) => sum + p.amountOwed, 0);
                          return (
                            <>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">You lent</span>
                              <span className="font-bold text-green-600">${othersOwe.toFixed(2)}</span>
                            </>
                          );
                        } else {
                          // Someone else paid, user is a participant
                          return (
                            <>
                              <span className="text-xs text-gray-500 uppercase tracking-wide">You borrowed</span>
                              <span className="font-bold text-red-600">${userPart ? userPart.amountOwed.toFixed(2) : '0.00'}</span>
                            </>
                          );
                        }
                     })()}
                  </div>
                  <button onClick={() => onDelete(expense._id)} className="p-2 text-gray-400 hover:text-red-500 transition ml-2">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
