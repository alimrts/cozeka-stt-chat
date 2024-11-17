import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import toast from "react-hot-toast";
import RecordingControls from "./RecordingControls";
import Message from "./Message";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const wsInitialized = useRef(false);
  const [ws, setWs] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const SOCKET_BASE_URL = process.env.REACT_APP_SOCKET_BASE_URL;

  useEffect(() => {
    if (!username) {
      navigate("/login");
      return;
    }

    if (wsInitialized.current) return;
    wsInitialized.current = true;

    const websocket = new WebSocket(SOCKET_BASE_URL);

    websocket.onopen = () => {
      console.log("Connected to WebSocket");
      toast.success("Connected to chat");

      const joinMessage = {
        type: "join",
        username: `${username} has joined`,
        timestamp: new Date().toISOString(),
      };
      websocket.send(JSON.stringify(joinMessage));
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error");
    };

    websocket.onclose = () => {
      console.log("Disconnected from WebSocket");
      toast.error("Disconnected from chat");
    };

    setWs(websocket);

    return () => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [username, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    const trimmedText = text?.trim();
    if (ws && ws.readyState === WebSocket.OPEN && trimmedText) {
      const message = {
        type: "message",
        content: trimmedText,
        username: username,
        timestamp: new Date().toISOString(),
      };
      ws.send(JSON.stringify(message));
      setInputMessage("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e) => {
    // Only allow Enter key to submit the form
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 w-full bg-gray-800 p-4 shadow z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Chat as {username}</h1>
        <h1 className="text-xl font-bold text-white">CoZeka STT Chat Demo</h1>
      </div>

      {/* Main content with padding for the fixed header */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-20 sm:pt-24">
        {messages.map((message, index) => (
          <Message
            key={index}
            message={message}
            isOwn={message.username === username}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input area */}
      <div className="flex-none bg-gray-800 p-3">
        <form
          onSubmit={handleSubmit}
          className="max-w-[1200px] mx-auto flex items-center gap-2"
        >
          <div className="flex-1 min-w-0">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 resize-none overflow-y-auto min-h-[2rem] max-h-36"
              placeholder="Type a message..."
            />
          </div>

          <div className="flex-shrink-0">
            <RecordingControls
              setInputMessage={setInputMessage}
              apiBaseUrl={API_BASE_URL}
              username={username}
            />
          </div>

          <button
            type="submit"
            disabled={!inputMessage}
            className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FaPaperPlane className="w-8 h-8" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
