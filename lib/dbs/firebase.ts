import firebase from "firebase/app";
import "firebase/firestore";
import { SessionProps, StoreData, UserData } from "../../types";

// Firebase config and initialization
// Prod applications might use config file
const { FIRE_API_KEY, FIRE_DOMAIN, FIRE_PROJECT_ID } = process.env;

const firebaseConfig = {
  apiKey: FIRE_API_KEY,
  authDomain: FIRE_DOMAIN,
  projectId: FIRE_PROJECT_ID,
};

if (!firebase.apps.length) {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const db = firebase.firestore();

// Firestore data management functions

// Use setUser for storing global user data (persists between installs)
export async function setUser({ user }: SessionProps) {
  if (!user) return null;
  const { email, id, username } = user;
  console.log("user", user);

  const ref = db.collection("users").doc(String(id));
  console.log("ref", ref);

  const data: UserData = { email };
  console.log("data", data);

  if (username) {
    data.username = username;
  }
  console.log("data 2", data);

  await ref.set(data, { merge: true });
}

export async function setStore(session: SessionProps) {
  console.log("setStore", session);

  const {
    access_token: accessToken,
    context,
    scope,
    user: { id },
  } = session;
  // Only set on app install or update
  if (!accessToken || !scope) return null;

  const storeHash = context?.split("/")[1] || "";
  console.log("storeHash", storeHash);

  const ref = db.collection("store").doc(storeHash);
  const data = { accessToken, adminId: id, scope };
  console.log("data hash", data);

  await ref.set(data);
}

// User management for multi-user apps
// Use setStoreUser for storing store specific variables
export async function setStoreUser(session: SessionProps) {
  console.log("setStoreUser", session);

  const {
    access_token: accessToken,
    context,
    user: { id },
  } = session;
  if (!id) return null;

  const storeHash = context?.split("/")[1] || "";

  const collection = db.collection("storeUsers");

  const ref = collection.doc(String(id));

  // Set admin (store owner) if installing/ updating the app
  // https://developer.bigcommerce.com/api-docs/apps/guide/users
  if (accessToken) {
    const oldAdmin = collection.where("isAdmin", "==", true).limit(1);
    console.log("oldAdmin", oldAdmin);

    const oldAdminRes = await oldAdmin.get();
    const [oldAdminDoc] = oldAdminRes?.docs ?? [];
    console.log("oldAdminRes", oldAdminRes);

    // Nothing to update if admin the same
    if (oldAdminDoc?.id === String(id)) return null;

    // Update admin (if different and previously installed)
    if (oldAdminDoc?.exists) {
      await oldAdminDoc.ref.update({ isAdmin: false });
    }
    console.log("create new record", storeHash);

    // Create a new record
    await ref.set({ storeHash, isAdmin: true });
  } else {
    const storeUser = await ref.get();
    console.log("storeUser", storeUser);

    // Create a new user if it doesn't exist (non-store owners added here for multi-user apps)
    if (!storeUser?.exists) {
      console.log("create new user", storeHash);

      await ref.set({ storeHash, isAdmin: false });
    }
  }
}

export async function deleteUser({ user }: SessionProps) {
  const storeUsersRef = db.collection("storeUsers").doc(String(user?.id));

  await storeUsersRef.delete();
}

export async function getStore() {
  console.log("get store");

  const doc = await db.collection("store").limit(1).get();
  const [storeDoc] = doc?.docs ?? [];
  const storeData: StoreData = { ...storeDoc?.data(), storeHash: storeDoc?.id };

  return storeDoc?.exists ? storeData : null;
}

export async function getStoreToken(storeHash: string) {
  if (!storeHash) return null;
  console.log("storeHash", storeHash);

  const storeDoc = await db.collection("store").doc(storeHash).get();

  return storeDoc?.exists ? storeDoc.data()?.accessToken : null;
}

export async function deleteStore({ store_hash: storeHash }: SessionProps) {
  const ref = db.collection("store").doc(storeHash);

  await ref.delete();
}
