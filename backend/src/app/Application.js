import { launchBot } from "../telegram/Bot.js";
import { launchApi, MESSAGE_PATH } from "../http/Api.js";
import { verifyTelegramAuth } from "../telegram/Auth.js";
import { saveScore, getScore, updateLastRefillTime, getLastRefillTime } from '../database/Database.js';

/**
 * This is the entry point of our app
 * Call this method inside index.js to launch the bot and the api
 *
 */
export function launchApp() {
    // Read token from .env file and use it to launch telegram bot
    const bot = launchBot(process.env.BOT_TOKEN)

    // Launch api
    const api = launchApi()

    // Listen to post requests on messages endpoint
    api.post(MESSAGE_PATH, async (request, response) => {
        await handleMessageRequest(bot, request, response)
    })

    // New endpoints
    api.post('/saveScore', verifyTelegramAuth, async (request, response) => {
        try {
            const { userId, score } = request.body;
            await saveScore(userId, score);
            response.status(200).json({ message: 'Score saved successfully' });
        } catch (error) {
            response.status(500).json({ message: 'Error saving score' });
        }
    });

    api.get('/getScore/:userId', verifyTelegramAuth, async (request, response) => {
        try {
            const { userId } = request.params;
            const score = await getScore(userId);
            response.status(200).json({ score });
        } catch (error) {
            response.status(500).json({ message: 'Error retrieving score' });
        }
    });

    api.post('/updateLastRefillTime', verifyTelegramAuth, async (request, response) => {
        try {
            const { userId } = request.body;
            await updateLastRefillTime(userId);
            response.status(200).json({ message: 'Last refill time updated successfully' });
        } catch (error) {
            response.status(500).json({ message: 'Error updating last refill time' });
        }
    });

    api.get('/getLastRefillTime/:userId', verifyTelegramAuth, async (request, response) => {
        try {
            const { userId } = request.params;
            const lastRefillTime = await getLastRefillTime(userId);
            response.status(200).json({ lastRefillTime });
        } catch (error) {
            response.status(500).json({ message: 'Error retrieving last refill time' });
        }
    });
}


/**
 * Receives data from the mini app and sends a simple message using answerWebAppQuery
 * @see https://core.telegram.org/bots/api#answerwebappquery
 *
 * We will use InlineQueryResult to create our message
 * @see https://core.telegram.org/bots/api#inlinequeryresult
 */
const handleMessageRequest = async (bot, request, response) => {
    try {
        // Read data from the request body received by the mini app
        const {queryId, message} = request.body


        // We are creating InlineQueryResultArticle
        // See https://core.telegram.org/bots/api#inlinequeryresultarticle
        const article = {
            type: 'article',
            id: queryId,
            title: 'Message from the mini app',
            input_message_content: {
                message_text: `MiniApp: ${message}`
            }
        }

        // Use queryId and data to send a message to the bot chat
        await bot.answerWebAppQuery(queryId, article)

        // End the request with a success code
        await response.status(200).json({
            message: 'success!'
        })

    } catch (e) {
        const errorJson = JSON.stringify(e)
        console.log(`handleMessageRequest error ${errorJson}`)

        await response.status(500).json({
            error: errorJson
        })
    }
}
