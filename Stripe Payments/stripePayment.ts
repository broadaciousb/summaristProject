"use client";

import { FirebaseApp } from "firebase/app";
import { db, auth } from "@/Firebase/firebase.config";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

export const getCheckoutUrl = async (
  app: FirebaseApp,
  productId: string
) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("User is not authenticated");

  // Reference to: customers/{userId}/checkout_sessions in Firestore
  const checkoutSessionRef = collection(
    db,
    "customers",
    userId,
    "checkout_sessions"
  );

  // Create checkout session
  const docRef = await addDoc(checkoutSessionRef, {
    productId: productId,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
  });

  // Reference to: products/{productId} in Firestore
  const productRef = doc(db, "products", productId);

  const productData = await getDoc(productRef);

  if (productData.exists()) {
    console.log("Document data:", productData.data());
    return productData.data().stripeLink;
  } else {
    console.log("No such document in Firestore.");
  }
};
