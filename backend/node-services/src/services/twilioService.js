const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const client = twilio(accountSid, authToken);

const makeCall = (to, from, url) => {
    return client.calls.create({
        to,
        from,
        url
    });
};

const sendMessage = (to, from, body) => {
    return client.messages.create({
        to,
        from,
        body
    });
};

module.exports = {
    makeCall,
    sendMessage
};