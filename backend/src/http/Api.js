import cors from 'cors';
import express from 'express';
import { verifyTelegramAuth } from '../telegram/Auth.js';
import { saveScore, getScore, updateLastRefillTime, getLastRefillTime } from '../database/Database.js';
import mongoose from 'mongoose';

const PORT = 8000;
export const MESSAGE_PATH = "/message";

export function launchApi() {
    // Setup HTTP api
    const api = express();
    api.use(express.json());
    api.use(cors());

    // Connect to MongoDB
    mongoose.connect('mongodb+srv://kirlichps3:wYRks8y0VujfdQ8G@cluster0.mongodb.net/vnvnc_coin_tapper?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('MongoDB connection error:', err));

    api.post('/auth', async (request, response) => {
        try {
            const userData = request.body;
            const isValid = await verifyTelegramAuth(userData);
            if (isValid) {
                // Store user in database or session
                response.status(200).json({ message: 'Authentication successful' });
            } else {
                response.status(401).json({ message: 'Authentication failed' });
            }
        } catch (error) {
            response.status(500).json({ message: 'Server error' });
        }
    });

    api.post('/score', async (request, response) => {
        try {
            const { userId, score } = request.body;
            // Save score to database
            await saveScore(userId, score);
            response.status(200).json({ message: 'Score saved successfully' });
        } catch (error) {
            response.status(500).json({ message: 'Error saving score' });
        }
    });

    api.get('/score/:userId', async (request, response) => {
        try {
            const userId = request.params.userId;
            const score = await getScore(userId);
            response.status(200).json({ score });
        } catch (error) {
            response.status(500).json({ message: 'Error retrieving score' });
        }
    });

    // Listen to server start on port
    api.listen(PORT, () => console.log(`express is up on port ${PORT}`))

    return api
}
