const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  userID: { type: Number, unique: true },
  fullName: String,
  email: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

// Pre-save hook to generate sequential user IDs
userSchema.pre('save', async function (next) {
  // Ensure that a userID is generated only if it's not provided
  if (!this.userID) {
    try {
      // Find the last user in the database and retrieve the highest userID
      const lastUser = await mongoose.model('User').findOne({}, {}, { sort: { 'userID': -1 } }).exec();

      // Calculate a new userID, incrementing the highest found or starting from 1
      const newUserID = lastUser ? lastUser.userID + 1 : 1;
      this.userID = newUserID;
    } catch (error) {
      // Handle any errors during the userID generation process
      console.error('Error generating sequential userID:', error);
      return next(error);
    }
  }

  // Continue with the save operation
  next();
});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model for use in other parts of the application
module.exports = User;
