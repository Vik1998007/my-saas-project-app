const API_URL =
  `${process.env.REACT_APP_API_BASE_URL}/api/dashboard`;

const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const getDashboardSummary = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Login token not found.");
  }

  const response = await fetch(`${API_URL}/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load dashboard summary.");
  }

  return data;
};