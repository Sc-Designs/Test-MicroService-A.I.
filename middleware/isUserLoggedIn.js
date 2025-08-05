import axios from "axios";

const isUserLoggedIn = async (req, res, next) => {
  try {
    let token = req.cookies?.UserToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const response = await axios.get(`${process.env.USER_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.data || !response.data.user) {
      return res.status(403).json({ error: "Access denied" });
    }
    return next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
export default isUserLoggedIn;
