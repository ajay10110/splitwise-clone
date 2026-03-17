const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  paidBy: { type: String, required: true }, // 'userId' (Me) or Friend's String ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{
    friendId: { type: String, required: true }, // 'userId' (Me) or Friend's String ID
    amountOwed: { type: Number, required: true }
  }],
  splitType: { type: String, enum: ['equal', 'exact', 'percentage'], required: true },
  splitDetails: { type: Object }, // e.g. percentages array
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: false },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
