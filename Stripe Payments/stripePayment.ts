"use client";

import { FirebaseApp } from "firebase/app";
import { db, auth } from "@/Firebase/firebase.config";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
} from "firebase/firestore";

export const getCheckoutUrl = async (
  app: FirebaseApp,
  priceId: string
): Promise<string> => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User is not authenticated");

  // Reference to: customers/{userId}/checkout_sessions
  const checkoutSessionRef = collection(
    db,
    "customers",
    userId,
    "checkout_sessions"
  );

  // Create checkout session
  const docRef = await addDoc(checkoutSessionRef, {
    price: priceId,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
  });

  return new Promise((resolve, reject) => {
  const timeout = setTimeout(() => {
    unsubscribe();
    reject(new Error("Checkout timed out. Please try again."));
  }, 30000);

  const unsubscribe = onSnapshot(
    docRef,
    (snap) => {
      const data = snap.data();

      if (data?.error) {
        clearTimeout(timeout);
        unsubscribe();
        reject(new Error(data.error.message));
      } else if (data?.url) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(data.url);
      }
    },
    (error) => {
      clearTimeout(timeout);
      unsubscribe();
      reject(error);
    }
  );
});
};
