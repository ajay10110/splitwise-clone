const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  members: [{ type: String }], // Array of 'userId' or Friend's String _id
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);
