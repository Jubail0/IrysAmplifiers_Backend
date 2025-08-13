import dotenv from "dotenv";
dotenv.config();

export const twitterConfig = {
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
  callbackUrl: process.env.TWITTER_CALLBACK_URL
};