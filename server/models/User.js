import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  userType: { type: String },
  profilePicture: { type: String, default: "" },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Use export default for ES Modules
const User = mongoose.model('User', userSchema);
export default User;