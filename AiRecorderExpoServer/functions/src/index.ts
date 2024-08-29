/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { firestore } from "firebase-admin";
import { Expo } from "expo-server-sdk";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();
const db = firestore();

const expo = new Expo({
  // accessToken: process.env.EXPO_ACCESS_TOKEN,
  // useFcmV1: false // this can be set to true in order to use the FCM v1 API
});

export const updateToken = onRequest(async (req, res) => {
  // POST 요청만 처리
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { token } = req.body;

  if (!token) {
    res.status(400).send("Invalid request: token and userId are required.");
    return;
  }

  try {
    // Firestore에 token 저장
    const tokenRef = db.collection("tokens").doc(token);
    await tokenRef.set({ token }, { merge: true });

    res.status(200).send("Token saved successfully");
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const sendUpdateMessage = onRequest(async (req, res) => {
  // POST 요청만 처리
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const tokensSnapshot = await db.collection("tokens").get();
    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token as string);

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      await expo.sendPushNotificationsAsync([
        {
          to: token,
          title: "Title",
          body: "Body",
        },
      ]);
    }

    res.status(200).send("Message sent successfully");
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).send("Internal Server Error");
  }
});
