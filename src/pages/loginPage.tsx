import React, { useState } from "react";
import "./loginPage.css";
import { useNavigate } from "react-router-dom";
import { authStore, notificationsStore } from "../lib/stores";

export default function LoginPage({ isRegister }: { isRegister: boolean }) {
  const navigate = useNavigate();
  const { setAuth } = authStore();
  const sendNotification = notificationsStore((state) => state.addNotification);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && password !== confirmPassword) {
      alert("passwords do not match");
      return;
    }
    fetch(`http://localhost:3001/auth/${isRegister ? "register" : "login"}`, {
      method: "POST",
      body: JSON.stringify(
        isRegister ? { username, email, password } : { email, password }
      ),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isRegister && data.access_token) {
          setAuth(data.access_token);
          sendNotification({
            type: "SUCCESS",
            title: "Login Successful",
            message:
              "You have Successfully Logged in, You Will be now inside the Home Page.",
          });
          navigate("/");
        } else if (isRegister) {
          sendNotification({
            type: "SUCCESS",
            title: "Registration Successful",
            message:
              "You have Successfully Registered, You Need Now to login with Your Account.",
          });
          navigate("/login");
        }
      })
      .catch((err) => {
        console.error(err);
        sendNotification({
          type: "ERROR",
          title: `${isRegister ? "Registering" : "Logging In"} fails`,
          message: String(err),
        });
      });
  };
  return (
    <>
      <div className="auth-section">
        <div className="item">
          <div className="item1">
            <h2>{isRegister ? "Register" : "Login"}</h2>
            <form onSubmit={handleAuth}>
              {isRegister && (
                <div>
                  <label>Username:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {isRegister && (
                <div>
                  <label>Confirm Password:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              <button type="submit">{isRegister ? "SignUp" : "login"}</button>
            </form>
            <div
              style={{
                cursor: "pointer",
                marginTop: "20px",
                fontSize: "10px",
                transform: "translateX(-30px)",
                color: "darkblue",
              }}
              onClick={(e) => {
                e.preventDefault();
                navigate(isRegister ? "/login" : "/register");
              }}
            >
              want to {isRegister ? "login" : "register"}?
            </div>
          </div>
        </div>
        <div className="item item2"></div>
      </div>
    </>
  );
}
