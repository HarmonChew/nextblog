// Import the functions you need from the SDKs you need

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDCAcHJslxF1C5WXf-_kixPvIh5d4AwWJk",

  authDomain: "blog-f1a85.firebaseapp.com",

  projectId: "blog-f1a85",

  storageBucket: "blog-f1a85.appspot.com",

  messagingSenderId: "1032641186933",

  appId: "1:1032641186933:web:25ad397a9f2d97b182fc3c",

  measurementId: "G-3S8VKFQMKB",
};

function createFirebaseApp(config) {
  try {
    return getApp();
  } catch {
    return initializeApp(config);
  }
}

// const firebaseApp = initializeApp(firebaseConfig);
const firebaseApp = createFirebaseApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const STATE_CHANGED = "state_changed";
export const googleAuthProvider = new GoogleAuthProvider();

export async function getUserWithUsername(username: string) {
  const q = query(
    collection(firestore, "users"),
    where("username", "==", username),
    limit(1)
  );

  const userDoc = (await getDocs(q)).docs[0];
  return userDoc;
}

export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,

    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}

export const fromMillis = Timestamp.fromMillis;
