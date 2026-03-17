const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Friend = require('../models/Friend');

// GET /api/balances
// Calculates who owes whom
router.get('/', auth, async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.tripId) filter.tripId = req.query.tripId;
    const expenses = await Expense.find(filter);
    
    // Calculate net balances for EVERYONE
    // balanceMap: { participantId: netBalance }  (positive means they are owed money, negative means they owe money)
    const balanceMap = {};

    expenses.forEach(exp => {
      // The person who paid getting credited
      balanceMap[exp.paidBy] = (balanceMap[exp.paidBy] || 0) + exp.totalAmount;

      // Everyone who participated gets debited their share
      exp.participants.forEach(p => {
        balanceMap[p.friendId] = (balanceMap[p.friendId] || 0) - p.amountOwed;
      });
    });

    // Determine who owes who using a greedy algorithm
    const debtors = [];
    const creditors = [];

    Object.keys(balanceMap).forEach(person => {
      const balance = balanceMap[person];
      // Keep precision manageable
      if (balance < -0.01) debtors.push({ person, amount: Math.abs(balance) });
      else if (balance > 0.01) creditors.push({ person, amount: balance });
    });

    // Sort to try to match biggest debts to biggest credits first (heuristic)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];

    let i = 0; // index for debtors
    let j = 0; // index for creditors

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amountToSettle = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: parseFloat(amountToSettle.toFixed(2))
      });

      debtor.amount -= amountToSettle;
      creditor.amount -= amountToSettle;

      if (Math.abs(debtor.amount) < 0.01) i++;
      if (Math.abs(creditor.amount) < 0.01) j++;
    }

    res.json({
      balances: balanceMap,
      settlements
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
