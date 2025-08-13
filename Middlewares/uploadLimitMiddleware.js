import axios from "axios";


export const checkUploadLimit = async(req,res,next) => {
    const userAddress = req.user.walletAddress; 
    const query = `
      query {
        transactions(tags: [
        { name: "owner", values: ["${userAddress}"] },
        { name: "application-id", values: ["yappers"] }
         
        ]) {
          edges {
            node {
              id
            }
          }
        }
      }
    `;
    try {
         const listResponse = await axios.post(
      "https://devnet.irys.xyz/graphql",
      { query },
      { headers: { "Content-Type": "application/json" } }
    );

    const edges = listResponse.data.data.transactions.edges;
    req.number_of_Uploads = edges.length;

    // ✅ Only pass control forward
    next();

    } catch (error) {
        console.log(error)
    }
}