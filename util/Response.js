export function sendResponse(res, statusCode, data) {
    res.status(statusCode).json(data);
}

export function sendErrorResponse(res, statusCode, errorMessage) {
    res.status(statusCode).json({ error: errorMessage });
}

