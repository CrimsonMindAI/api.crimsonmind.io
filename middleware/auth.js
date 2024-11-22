import dotenv from 'dotenv';

dotenv.config();

export const authenticateApiKey = (req, res, next) => {
    const { APP_API_KEY } = process.env;

    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === APP_API_KEY) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};