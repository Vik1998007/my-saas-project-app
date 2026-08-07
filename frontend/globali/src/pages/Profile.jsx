import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

   fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f4f7fc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "40px",
        }}
      >
        <h1 style={{ color: "#0f62fe" }}>My Profile</h1>

        <div
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            marginTop: "25px",
            maxWidth: "650px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#0f62fe",
              color: "#ffffff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "36px",
              fontWeight: "bold",
              marginBottom: "25px",
            }}
          >
            {user?.fullName
              ? user.fullName.charAt(0).toUpperCase()
              : "U"}
          </div>

          <h2>{user ? user.fullName : "Loading..."}</h2>

          <p style={{ fontSize: "17px", marginTop: "15px" }}>
            <strong>Email:</strong>{" "}
            {user ? user.email : "Loading..."}
          </p>

          <p style={{ fontSize: "17px" }}>
            <strong>Account Status:</strong> Active
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;