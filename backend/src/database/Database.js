import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    score: { type: Number, default: 0 },
    lastRefillTime: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export async function saveScore(userId, score) {
    await User.findOneAndUpdate({ userId }, { score }, { upsert: true });
}

export async function getScore(userId) {
    const user = await User.findOne({ userId });
    return user ? user.score : 0;
}

export async function updateLastRefillTime(userId) {
    await User.findOneAndUpdate({ userId }, { lastRefillTime: Date.now() }, { upsert: true });
}

export async function getLastRefillTime(userId) {
    const user = await User.findOne({ userId });
    return user ? user.lastRefillTime : null;
}