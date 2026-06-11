const admin = require('firebase-admin');

// Initialize with dummy if JSON not provided
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    : null;

if (serviceAccount) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized");
    } catch (err) {
        console.warn("Firebase initialization failed, check credentials");
    }
}

const sendPushNotification = async (token, title, body) => {
    if (!admin.apps.length) return;
    const message = {
        notification: { title, body },
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.log('Error sending message:', error);
    }
};

module.exports = { sendPushNotification };
