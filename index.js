import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
const { ENABLE_CORS, CORS_ORIGINS } = process.env;
import multer from 'multer';

import { sendResponse, sendErrorResponse } from './util/Response.js';
import { Chat } from './classes/Chat.js';
import { authenticateApiKey } from './middleware/auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const chat = new Chat();

if(ENABLE_CORS) {
    // Use the CORS middleware
    let corsOptions = {};
    if(CORS_ORIGINS) {

        const allowedOrigins = CORS_ORIGINS.split(',');

        corsOptions = {
            origin: function (origin, callback) {
                if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            optionsSuccessStatus: 200
        };

        app.use(cors(corsOptions));
    }
}

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }))

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(authenticateApiKey);

app.get('/', (req, res) => {
    sendResponse(res, 200, { message: 'I see you!' });
});

app.post('/image/describe', upload.single('file'), async(req, res) => {
    let { statement } = req.body || {};
    const { file } = req;

    if (!file) {
        return sendErrorResponse(res, 400, 'No file uploaded');
    }

    try {
        const message =
            await chat.describeImage(file.buffer, statement);
        sendResponse(res, 200, { message });
    } catch (error) {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

app.post('/statement', async (req, res) => {
    let { statement } = req.body || {};

    try {
        const message = await chat.simpleAsk(statement);
        sendResponse(res, 200, { message });
    } catch (error) {
        sendErrorResponse(res, 500, 'Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
