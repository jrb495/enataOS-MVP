import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

export function initFirebase() {
  if (!getApps().length) {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || 'serviceAccountKey.json';
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  return getFirestore();
}
