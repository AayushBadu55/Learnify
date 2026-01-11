import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatPage.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello i am Cr", color: "dark" },
    { id: 2, text: "Hello", color: "light" },
    { id: 3, text: "Whats up", color: "dark" },
    { id: 4, text: "Good", color: "light" },
    { id: 5, text: "Hello", color: "light" },
    { id: 6, text: "Hiii", color: "dark" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        color: "dark", // User messages are always dark/purple
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-root">
      <Nav />
      {/* Spacer for fixed header */}
      <div style={{ height: '70px' }}></div>
      <div className="chat-background-curve"></div>

      <main className="chat-main">
        <div className="chat-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-bubble chat-bubble--${message.color} ${message.color === 'dark' ? 'chat-bubble--right' : 'chat-bubble--left'}`}
            >
              <span className="chat-message-text">{message.text}</span>
              <div className="chat-bubble-icon" title="React to message">
                {/* Smiley / Reaction Icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="chat-input-container">
        <button className="chat-attach-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>

        <button className="chat-send-btn" onClick={handleSend}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default ChatPage;



