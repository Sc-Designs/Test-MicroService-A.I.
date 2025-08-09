import axios from "axios";

const deleteSetsFromOrg = async (orgId, setIds, token) => {
  try {
    const response = await axios.delete(
      `${process.env.ORG_API_URL}/delete-set-id`,
      {
        data: { orgId, setIds },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting sets:", error);

    throw {
      success: false,
      message: error.response?.data?.message || "Server error",
      status: error.response?.status || 500,
    };
  }
};

export default deleteSetsFromOrg;
