import mongoose from 'mongoose';

const stakeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: props => `${props.value} is not a valid Ethereum address!`
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number, // Duration in days
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    apy: {
      type: Number,
      required: true,
    },
    rewards: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    transactionHash: {
      type: String,
      sparse: true, // Allows null values and maintains uniqueness for non-null values
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Calculate rewards based on amount, duration, and APY
 */
stakeSchema.methods.calculateRewards = function() {
  // Simple interest calculation: principal * rate * time
  // where rate is APY/100 and time is duration/365 (converting days to years)
  const principal = this.amount;
  const rate = this.apy / 100;
  const time = this.duration / 365;
  
  this.rewards = principal * rate * time;
  return this.rewards;
};

/**
 * Calculate end date based on start date and duration
 */
stakeSchema.methods.calculateEndDate = function() {
  const startDate = this.startDate || new Date();
  this.endDate = new Date(startDate.getTime() + this.duration * 24 * 60 * 60 * 1000);
  return this.endDate;
};

/**
 * Pre-save hook to calculate rewards and end date
 */
stakeSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('amount') || this.isModified('duration') || this.isModified('apy')) {
    this.calculateRewards();
    this.calculateEndDate();
  }
  next();
});

const Stake = mongoose.model('Stake', stakeSchema);

export default Stake;