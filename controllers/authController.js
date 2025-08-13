import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { twitterConfig } from "../config/twitterConfig.js";
import { generateCodeChallenge, generateCodeVerifier } from "../utils/twitterUtils.js";
import dotenv from "dotenv";
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET || "supersecret";


export const redirectToTwitter = (req, res) => {
  // const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Encode state + codeVerifier in a signed JWT
  const statePayload = { codeVerifier, random: crypto.randomUUID() };
  const stateJWT = jwt.sign(statePayload, JWT_SECRET, { expiresIn: "10m" });


   const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterConfig.clientId}&redirect_uri=${encodeURIComponent(twitterConfig.callbackUrl)}&scope=${
    "tweet.read users.read offline.access"}&state=${stateJWT}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  res.redirect(authUrl);

};

 export const handleTwitterCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!state) return res.status(400).send("Missing state");

  let decoded;
  try {
    decoded = jwt.verify(state, JWT_SECRET);
  } catch (err) {
    return res.status(400).send("Invalid or expired state");
  }

  const codeVerifier = decoded.codeVerifier;

  try {
    // Exchange code for token
    const body = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: twitterConfig.callbackUrl,
      code_verifier: codeVerifier,
    });

    if (!twitterConfig.clientSecret) {
      body.append("client_id", twitterConfig.clientId);
    }

    const headers = { "Content-Type": "application/x-www-form-urlencoded" };

    if (twitterConfig.clientSecret) {
      const basicAuth = Buffer.from(
        `${twitterConfig.clientId}:${twitterConfig.clientSecret}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${basicAuth}`;
    }

    const tokenRes = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      body,
      { headers }
    );

    const { access_token } = tokenRes.data;

    // Fetch user profile
    const userRes = await axios.get("https://api.twitter.com/2/users/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const username = userRes.data.data.username;

    // You can now create your own JWT for frontend to keep user logged in
    const userJWT = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });

    // Redirect to frontend with JWT
    res.redirect(`${process.env.FRONT_END_URL}?token=${userJWT}`);

  } catch (err) {
    console.error("Twitter Auth Error:", err.response?.data || err.message);
    res.status(500).send("Auth failed");
  }
};


export const saveWalletAddress = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("Unauthorized");

    const payload = jwt.verify(token, JWT_SECRET);

    // Add/update wallet address
    payload.walletAddress = req.body.walletAddress;

    // Issue new JWT with updated info
    const newToken = jwt.sign(payload, JWT_SECRET);

    res.json({ token: newToken });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

export const disconnectWallet = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Not logged in" });

    // Decode existing token
    const payload = jwt.verify(token, JWT_SECRET);

    // Remove walletAddress from payload
    const { walletAddress, ...newPayload } = payload;

    // Re-sign JWT
    const newToken = jwt.sign(newPayload, JWT_SECRET);
    

    res.status(200).json({ message: "Wallet disconnected", token: newToken });
  } catch (err) {
    console.error("Disconnect wallet error:", err.message);
    res.status(500).json({ error: "Failed to disconnect wallet" });
  }
};

export default {
  handleTwitterCallback,
  redirectToTwitter,
  saveWalletAddress,
  disconnectWallet
  
};
