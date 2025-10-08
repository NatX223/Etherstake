import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      private: true, // This ensures the password is not included in query results
    },
    walletAddress: {
      type: String,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: props => `${props.value} is not a valid Ethereum address!`
      },
      unique: true,
      sparse: true, // Allows null values and maintains uniqueness for non-null values
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    stakes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stake',
    }],
  },
  {
    timestamps: true,
  }
);

/**
 * Check if email is already taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to exclude
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if wallet address is already taken
 * @param {string} walletAddress - The user's wallet address
 * @param {ObjectId} [excludeUserId] - The id of the user to exclude
 * @returns {Promise<boolean>}
 */
userSchema.statics.isWalletAddressTaken = async function (walletAddress, excludeUserId) {
  const user = await this.findOne({ walletAddress, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password - Password to check
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;