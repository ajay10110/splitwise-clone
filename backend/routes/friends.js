const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Friend = require('../models/Friend');

// GET /api/friends
router.get('/', auth, async (req, res) => {
  try {
    const friends = await Friend.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(friends);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/friends
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    // Check if friend already exists for this user
    let existingFriend = await Friend.findOne({ userId: req.user.id, name: new RegExp(`^${name}$`, 'i') });
    if (existingFriend) return res.json(existingFriend);

    const newFriend = new Friend({
      userId: req.user.id,
      name
    });

    const friend = await newFriend.save();
    res.json(friend);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/friends/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const friend = await Friend.findById(req.params.id);
    if (!friend) return res.status(404).json({ message: 'Friend not found' });
    
    if (friend.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await friend.deleteOne();
    res.json({ message: 'Friend removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Friend not found' });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
