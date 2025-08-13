import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const authMiddleware = (req, res, next) => {
  try {
    // Expect header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
  
    req.user = {
      username: decoded.username,
      walletAddress: decoded.walletAddress,
    };

    next();
  } catch (err) {
    console.error("JWT auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
