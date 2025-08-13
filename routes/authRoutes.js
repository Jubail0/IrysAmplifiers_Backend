import express from "express";
import { handleTwitterCallback, redirectToTwitter, saveWalletAddress, disconnectWallet } from "../controllers/authController.js";

const router = express.Router();

// Step 1 - Redirect to Twitter
router.get("/twitter", redirectToTwitter);

// Step 2 - Handle Twitter callback
router.get("/twitter/callback", handleTwitterCallback);

// Connect wallet and save address on session
router.post("/link-wallet", saveWalletAddress);
router.post("/disconnect-wallet", disconnectWallet);


export default router;
