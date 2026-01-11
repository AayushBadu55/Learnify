import React, { useState, useEffect, useRef } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import './ChatPage.css'; // Reusing chat styles for consistency
import { Send, Bot, User, Trash2 } from 'lucide-react';

function ChatBotPage() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI assistant. How can I help you regarding your classes or assignments today?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newUserMsg = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInputText("");
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                text: "I am a simulated AI response. The actual AI integration will be connected to the backend soon!",
                sender: 'bot',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const clearChat = () => {
        setMessages([
            { id: 1, text: "Chat cleared. How can I help you?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
    };

    return (
        <div className="chat-root">
            <Nav />
            <div style={{ height: '70px' }}></div>

            <main className="chat-main" style={{ maxWidth: '900px' }}> {/* Slightly wider for bot */}
                <div className="chat-container">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar-container bot-avatar">
                                <Bot size={24} color="white" />
                            </div>
                            <div>
                                <h2>AI Assistant</h2>
                                <p className="status-text">Online</p>
                            </div>
                        </div>
                        <button className="clear-chat-btn" onClick={clearChat} title="Clear Chat">
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-wrapper ${msg.sender === 'user' ? 'my-message' : 'other-message'}`}>
                                <div className={`chat-bubble ${msg.sender === 'user' ? 'me' : 'other'}`}>
                                    {msg.text}
                                </div>
                                <span className="message-time">{msg.time}</span>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-wrapper other-message">
                                <div className="chat-bubble other typing-bubble">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-container" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Ask me anything..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit" className="send-btn">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ChatBotPage;
