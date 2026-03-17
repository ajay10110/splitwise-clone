const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');

// GET /api/expenses
router.get('/', auth, async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    if (req.query.tripId) filter.tripId = req.query.tripId;
    const expenses = await Expense.find(filter).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/expenses
router.post('/', auth, async (req, res) => {
  try {
    const { title, totalAmount, paidBy, participants, splitType, splitDetails, tripId } = req.body;
    
    // Ensure totalAmount is distributed among participants according to splitType
    // This is a trusted frontend architecture for simplicity, but validation could be added.

    const newExpense = new Expense({
      title,
      totalAmount,
      paidBy,
      participants,
      splitType,
      splitDetails,
      tripId,
      userId: req.user.id
    });

    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Expense not found' });
    res.status(500).send('Server Error');
  }
});

// POST /api/expenses/settle
// Adds a settlement expense to balance out
router.post('/settle', auth, async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    // from/to can be 'userId' (Me) or Friend ID
    
    // settlement is just an expense paid by 'from' to 'to'
    const newExpense = new Expense({
      title: 'Settled up',
      totalAmount: amount,
      paidBy: from,
      userId: req.user.id,
      participants: [{
        friendId: to,
        amountOwed: amount
      }],
      splitType: 'exact'
    });

    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
