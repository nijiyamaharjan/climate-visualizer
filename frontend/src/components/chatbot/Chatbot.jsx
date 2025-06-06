import React, { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare } from "lucide-react";

export default function Chatbot({variable}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, variable]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
  
    const userMessage = { sender: "user", text: input };
    const userInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
  
    // Show timeout after 15 seconds
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I'm sorry, the request is taking too long. Please try again later.",
        },
      ]);
      timeoutRef.current = null;
    }, 20000); // 20 seconds instead of 200000 (which is too long)
  
    try {
      let variableEndpoint = "";
      const mapping = {
        tas_max: "tasmax",
        tas_min: "tasmin",
        precipitation_rate: "pr",
        sfc_windspeed: "sfcWind",
        tas: "tas",
        huss: "huss",
        hurs: "hurs",
      };
  
      if (variable in mapping) {
        variableEndpoint = mapping[variable];
      }
  
      console.log(variableEndpoint, "endpoint");
  
      const payload = {
        query: userInput,
        top_k: 5,
        variable: variableEndpoint,
      };
  
      console.log("Sending request to:", `http://localhost:8000/query/${variableEndpoint}`);
      console.log("Request payload:", payload);
  
      const response = await fetch(`http://localhost:8000/query/${variableEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      const data = await response.json(); // Extract JSON response
  
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
  
        setIsLoading(false);
        setMessages((prev) => [...prev, { sender: "bot", text: data.response || "No response from bot." }]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
  
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "I'm having trouble connecting. Please try again in a moment.",
          },
        ]);
      }
    }
  };
  

  // Mock API response with a configurable delay
  const mockApiResponse = (delay = 200000) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          json: () => Promise.resolve({ reply: "This is the output." }) 
        });
      }, delay); 
    });
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 md:w-96 h-[35rem] bg-white rounded-lg flex flex-col mb-4 shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Chat Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                <p>👋 Ask anything about the currently selected variable.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-3/4 p-3 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {formatMessage(msg.text)}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 p-3 rounded-lg border border-gray-200 rounded-bl-none shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ask anything about the currently selected variable..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isLoading}
              />
              <button
                className={`ml-2 ${
                  input.trim() && !isLoading
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-300 cursor-not-allowed"
                } text-white p-2 rounded-full transition-colors duration-200`}
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        className={`${
          isOpen ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
        } text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <MessageSquare size={22} />
      </button>
    </div>
  );
}