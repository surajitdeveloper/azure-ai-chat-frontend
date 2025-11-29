
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

// const connectionUrl = "http://localhost:4000";
const connectionUrl = "https://azure-ai-chat-backend.onrender.com/";
const socket = io.connect(connectionUrl);

const App = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [clientId, setClientId] = useState(uuidv4());
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setClientId(clientId || uuidv4());
    
    const handleReceiveMessage = (data) => {
      if (data.clientId === clientId) {
        setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
      }
    };

    socket.on(`receive_message_${clientId}`, handleReceiveMessage);

    return () => {
      socket.off(`receive_message_${clientId}`, handleReceiveMessage);
    };
  }, [clientId]);

  const sendToAzure = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    
    socket.emit("send_message", {
      messages: [userMessage], // Note: In a real app you might want to send history
      clientId: clientId,
    });
    
    setQuery("");
  };

  const onEnterPressAzure = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendToAzure();
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          AI Chatbot
        </div>
        
        <div className="message-list">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message-bubble ${msg.role}`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="input-area" onSubmit={sendToAzure}>
          <textarea
            className="chat-input"
            value={query}
            rows={1}
            placeholder="Type your message..."
            onKeyDown={onEnterPressAzure}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="send-button" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
