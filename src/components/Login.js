import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import image_login from "./cozeka_login_logo.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const correctPassword = "12345";
    if (username.trim()) {
      localStorage.setItem("username", username);
      if (password === correctPassword) {
        navigate("/chat");
      } else {
        alert("Invalid password");
      }
    } else {
      toast.error("Please enter a username");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-lg flex flex-col items-center">
        <img
          src={image_login}
          alt="Login Logo"
          style={{ marginBottom: "20px", width: "150px" }}
        />
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Join the Chat
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="appearance-none rounded-lg relative block w-full mb-2 px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
