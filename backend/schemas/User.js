import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// const userSchema = new mongoose.Schema({
//   userId: { type: Number, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   username: { type: String, required: true, unique: true },
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   password: { type: String, required: true },
//   dateOfBirth: { type: Date, required: true },
//   terms: { type: Boolean, required: true },
// });
const userSchema = new mongoose.Schema({
  // userId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  terms: { type: Boolean, required: true },
  isAdmin: { type: Boolean, default: false },
  lastScanAt: { type: Date },
  account_created_at: { type: Date, default: Date.now },
  
  // Gmail integration settings
  gmail: {
    isConnected: { type: Boolean, default: false },
    connectedAt: { type: Date },
    tokens: {
      accessToken: { type: String },
      refreshToken: { type: String },
      expiryDate: { type: Date }
    },
    defaultSettings: {
      maxResults: { type: Number, default: 10, min: 1, max: 100 },
      startDate: { type: String, default: null }, // ISO date string or null
      endDate: { type: String, default: null }    // ISO date string or null
    }
  }
}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
