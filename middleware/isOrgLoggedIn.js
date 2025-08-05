import axios from "axios";

const isOrgLoggedIn = async (req, res, next) => {
  try {
    let token = req.cookies?.OrganizationToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const response = await axios.get(`${process.env.ORG_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.data) {
      return res.status(403).json({ error: "Access denied" });
    }
    req.org = response.data;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
export default isOrgLoggedIn;
