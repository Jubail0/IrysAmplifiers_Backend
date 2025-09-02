import { Uploader } from "@irys/upload";
import { Ethereum } from "@irys/upload-ethereum";
import { ethers } from "ethers";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// --- Irys uploader setup ---
const irys = await Uploader(Ethereum)
  .withWallet(process.env.PRIVATE_KEY)
  .withRpc(process.env.RPC_URL)
  // .devnet();


function verifySignature(address, signature, message, expectedUsername) {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase();
    const isAddressMatch = recoveredAddress === address.toLowerCase();
    const isUsernameIncluded = message.includes(expectedUsername);
    return isAddressMatch && isUsernameIncluded;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Upload endpoint
 export const irysUpload = async (req, res) => {
  try {
  
    const {walletAddress} = req.user;
    const { jsonData } = req.body;

    if(!walletAddress || walletAddress === null || !req.user.walletAddress) return res.status(401).json({error: "Please connect your wallet"})


      // First check user uploads limit is upto 5
    const upload_limit = 5;
    const userUploaded = req.number_of_Uploads;

    if(userUploaded >= upload_limit) return res.status(403).json({error:"Maximum uploads reached" });

    const timestamp = new Date().toISOString()
    jsonData.profile.uploadedAt = timestamp;

    const receipt = await irys.upload(JSON.stringify(jsonData), {
      tags: [
        { name: "content-Type", value: "application/json" },
        { name: "application-id", value:"1kYappers"},
        { name: "owner", value: walletAddress },
      ],
    });

    res.json({ id: receipt.id, url: `https://gateway.irys.xyz/${receipt.id}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ err: "Failed to Upload On IRYS" });
  }
};

// Mindshare data
export const getMindshare = async (req, res) => {
 res.setHeader('Cache-Control', 'no-store');
  try {
    const { timeframe } = req.query;
    const apiUrl = `https://kaito.irys.xyz/api/community-mindshare?window=${timeframe}d`;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });
    
    const yappersData = {
      total_yappers: response.data.community_mindshare.total_unique_yappers,
      total_tweets: response.data.community_mindshare.total_unique_tweets,
      top_engagements: response.data.community_mindshare.top_1000_yapper_community_engagements,
      top_1k_yappers: response.data.community_mindshare.top_1000_yappers
    };

    res.json(yappersData);
  } catch (error) {
    console.error('Axios error:', error.message);
    if (error.response) {
      res.status(error.response.status).json({
        error: 'API responded with error',
        status: error.response.status,
        details: error.response.data
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch from Kaito IRYS API', message: error.message });
    }
  }
};

export const fetchCardsData = async (req, res) => {
 res.setHeader('Cache-Control', 'no-store');
  try {
    const query = `
      query {
        transactions(tags: [{ name: "application-id", values: ["1kYappers"] }]) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;

    const listResponse = await axios.post(
      "https://uploader.irys.xyz/graphql",
      { query },
      { headers: { "Content-Type": "application/json" } }
    );

    if (listResponse.data.errors) {
      // Send error response once and return early
      return res.status(500).json({ errors: listResponse.data.errors });
    }

    const edges = listResponse.data.data.transactions.edges;
    
    return res.status(200).json(edges);

  } catch (error) {
    // Handle overall errors here, send response once
    console.error("Error fetching transactions:", error.message);
    return res.status(500).json({ error: error.message });
  }
};


export default {
    getMindshare,
    irysUpload,
    fetchCardsData

}





