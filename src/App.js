
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
  const [model, setModel] = useState("agentic_rag");
  const [isTyping, setIsTyping] = useState(false);
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
        setIsTyping(false);
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
    setIsTyping(true);
    
    socket.emit("send_message", {
      messages: [userMessage], // Note: In a real app you might want to send history
      clientId,
      model,
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
          <div className="header-title">AI Chatbot - chat with {model}</div>
          <div className="header-description">
            {model === "agentic_rag" 
              ? "Provides customized information about Surajit, cStart Technologies, etc., and can take quotation information for creating sites."
              : "Helps create an appointment with Surajit; necessary information is automatically captured by AI."}
          </div>
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
          {isTyping && <div className="typing-indicator">AI is typing...</div>}
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
          <div className="input-controls">
            <select 
              className="model-selector"
              value={model}
              onChange={(e) => {setModel(e.target.value); setMessages([]);}}
            >
              <option value="agentic-rag">Support</option>
              <option value="agent">Appointment</option>
            </select>
            <button className="send-button" type="submit">
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
