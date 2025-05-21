import admin from 'firebase-admin';

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS || './serviceAccountKey.json';
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
