import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL;

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: password,
          }),
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (data.success) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      setMessage("Something went wrong.");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>

      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Reset Password</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;