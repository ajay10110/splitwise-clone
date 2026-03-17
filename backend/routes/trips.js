const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Trip = require('../models/Trip');

// Get all trips for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create a new trip
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Trip name is required' });

    // Initially, members might just be the user themself ('userId')
    const newTrip = new Trip({
      userId: req.user.id,
      name,
      members: ['userId']
    });

    const savedTrip = await newTrip.save();
    res.json(savedTrip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add friends to a trip
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { friendIds } = req.body; // Array of friend IDs to add
    if (!friendIds || !Array.isArray(friendIds)) return res.status(400).json({ message: 'friendIds array is required' });

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Add unique members
    const newMembers = new Set([...trip.members, ...friendIds]);
    trip.members = Array.from(newMembers);

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Remove a friend from a trip
router.delete('/:id/members/:memberId', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.members = trip.members.filter(member => member !== req.params.memberId);
    const updatedTrip = await trip.save();
    
    res.json(updatedTrip);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete a trip
router.delete('/:id', auth, async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    await trip.deleteOne();
    
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
