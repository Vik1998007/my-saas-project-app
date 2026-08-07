const API_URL =
  `${process.env.REACT_APP_API_BASE_URL}/api/notifications`;
const getToken = () => {
  return localStorage.getItem("token");
};

export async function getNotifications() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
  });

  return response.json();
}

export async function markAsRead(notificationId) {
  const response = await fetch(
    `${API_URL}/${notificationId}/read`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.json();
}

export async function markAllAsRead() {
  const response = await fetch(
    `${API_URL}/read-all`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.json();
}