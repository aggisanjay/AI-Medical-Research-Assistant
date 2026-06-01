const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  conditions: [String],
  preferences: {
    preferredSources: [String],
    locationPreference: String
  },
  queryHistory: [{
    query: String,
    disease: String,
    timestamp: Date
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
