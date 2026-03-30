import React, { useState, useEffect, useRef } from 'react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import './ChatPage.css'; // Reusing chat styles for consistency

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
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>
                            </div>
                            <div>
                                <h2>AI Assistant</h2>
                                <p className="status-text">Online</p>
                            </div>
                        </div>
                        <button className="clear-chat-btn" onClick={clearChat} title="Clear Chat">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
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
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ChatBotPage;
