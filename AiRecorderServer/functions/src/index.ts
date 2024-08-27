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
import { firestore, messaging } from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();
const db = firestore();

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
    const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      await messaging().send({
        token,
        notification: {
          title: "업데이트 타이틀",
          body: "업데이트 바디",
        },
      });
    }

    res.status(200).send("Message sent successfully");
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).send("Internal Server Error");
  }
});
