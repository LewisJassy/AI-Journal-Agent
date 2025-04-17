export const logError = (error) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${error}`);
};

export const logInfo = (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
};

export const handleResponse = (res, statusCode, data) => {
    res.status(statusCode).json(data);
};