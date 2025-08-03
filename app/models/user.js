// app/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Basic Auth Fields
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Subscription Management
  stripeCustomerId: {
    type: String,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    index: true
  },
  currentPlan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  analysisCount: {
    type: Number,
    default: 0,
    min: 0
  },
  analysisLimit: {
    type: Number,
    default: 1 // Free tier gets 1 analysis
  },
  nextBillingReset: {
    type: Date
  },

  // Enhanced Analysis Tracking
  analysisHistory: {
    type: [{
      date: {
        type: Date,
        default: Date.now
      },
      age: Number,
      imageUrl: String,
      preview: String,
      scores: {
        happiness: Number,
        anxiety: Number,
        confidence: Number,
        social: Number
      },
      analysisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DrawingAnalysis'
      }
    }],
    default: []
  },

  emotionalTrends: {
    happiness: { type: [Number], default: [] },
    anxiety: { type: [Number], default: [] },
    confidence: { type: [Number], default: [] },
    social: { type: [Number], default: [] }
  },

  // Children Profiles (for future expansion)
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChildProfile'
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to check usage
userSchema.statics.checkUsage = async function(userId) {
  const user = await this.findById(userId);
  if (!user) throw new Error('User not found');

  // Reset counter if new billing period
  if (user.nextBillingReset && new Date() > user.nextBillingReset) {
    user.analysisCount = 0;
    user.nextBillingReset = new Date(new Date().setMonth(new Date().getMonth() + 1));
    await user.save();
  }

  if (user.analysisCount >= user.analysisLimit) {
    throw new Error(`You've used ${user.analysisCount}/${user.analysisLimit} analyses. Upgrade for more.`);
  }

  return user;
};

// Enhanced analysis tracking methods
userSchema.statics.recordAnalysis = async function(userId, analysisData) {
  const { scores, age, imageUrl, analysisId } = analysisData;
  
  return this.findByIdAndUpdate(
    userId,
    {
      $inc: { analysisCount: 1 },
      $push: { 
        analysisHistory: {
          age,
          imageUrl,
          scores,
          analysisId,
          preview: analysisData.preview || `Analysis for ${age}-year-old`
        },
        'emotionalTrends.happiness': scores.happiness,
        'emotionalTrends.anxiety': scores.anxiety,
        'emotionalTrends.confidence': scores.confidence,
        'emotionalTrends.social': scores.social
      }
    },
    { new: true }
  );
};

// Get recent analyses
userSchema.statics.getAnalysisHistory = async function(userId, limit = 5) {
  return this.findById(userId)
    .select('analysisHistory')
    .slice('analysisHistory', limit)
    .lean();
};

// Get emotional trends
userSchema.statics.getEmotionalTrends = async function(userId) {
  const user = await this.findById(userId)
    .select('emotionalTrends analysisHistory')
    .lean();

  if (!user) return null;

  return {
    happiness: user.emotionalTrends.happiness,
    anxiety: user.emotionalTrends.anxiety,
    confidence: user.emotionalTrends.confidence,
    social: user.emotionalTrends.social,
    lastUpdated: user.analysisHistory[0]?.date
  };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
