import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios"; // axios instance
import "../styles/Login.css";

function VroLogin({ onLogin, onClose }) {
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ NEW
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // ✅ prevent double submit

    setError("");
    setLoading(true); // ⏳ start loading

    try {
      const res = await API.post("/officer/login", {
        officerId: officerId.trim(),
        password: password.trim(),
      });

      if (res.data.success) {
        // keep session
        localStorage.setItem(
          "officer",
          JSON.stringify(res.data.officer)
        );

        onLogin?.();
        onClose?.();
        navigate("/admin-dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false); // ✅ stop loading ONLY after response
    }
  };

  return (
    <div className="login-container">
      <button
        className="close-btn"
        onClick={onClose}
        disabled={loading} // ✅ prevent close while loading
      >
        ✖
      </button>

      <h2>Officer Login</h2>
      <p className="login-subtitle">Access authorized for VRO only</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Officer ID (e.g., gov.admin)"
          value={officerId}
          onChange={(e) => setOfficerId(e.target.value)}
          disabled={loading} // ✅
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading} // ✅
        />

        {error && <p className="error text-danger">{error}</p>}

        <button
          type="submit"
          className="btn-login"
          disabled={loading} // ✅
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default VroLogin;
