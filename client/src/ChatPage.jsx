import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import "./ChatPage.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ConfirmModal from "./components/ConfirmModal";

const socket = io("http://localhost:5000");

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

function getInitials(name = "") {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function getFileIcon(fileName = "") {
  const ext = fileName.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "🖼️";
  if (ext === "pdf") return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["ppt", "pptx"].includes(ext)) return "📊";
  if (["zip", "rar"].includes(ext)) return "🗜️";
  return "📎";
}

function getFileIconBadge(fileName = "") {
  const ext = fileName.split(".").pop().toLowerCase();
  if (ext === "pdf") return { label: "PDF", color: "#e63535" };
  if (["doc", "docx"].includes(ext)) return { label: "DOC", color: "#2b5fde" };
  if (["ppt", "pptx"].includes(ext)) return { label: "PPT", color: "#d95b13" };
  if (["xls", "xlsx"].includes(ext)) return { label: "XLS", color: "#1a7a43" };
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return { label: "IMG", color: "#7c3aed" };
  return { label: "FILE", color: "#64748b" };
}

function isImageFile(fileName = "") {
  const ext = fileName.split(".").pop().toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach(msg => {
    const label = formatDateLabel(msg.timestamp);
    if (label !== lastDate) {
      groups.push({ type: "label", label });
      lastDate = label;
    }
    groups.push({ type: "message", msg });
  });
  return groups;
}

function getGroupedReactions(reactions = []) {
  const groups = {};
  reactions.forEach(r => {
    groups[r.emoji] = (groups[r.emoji] || 0) + 1;
  });
  return Object.entries(groups).map(([emoji, count]) => ({ emoji, count }));
}

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeReactionPicker, setActiveReactionPicker] = useState(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [showNewDMModal, setShowNewDMModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [rightTab, setRightTab] = useState("participants"); // "participants" | "files"

  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load user
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      socket.emit("setup_user", storedUser.email);
    }
  }, []);

  // Fetch all users
  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then(r => r.json())
      .then(data => setAllUsers(data))
      .catch(console.error);
  }, []);

  // Fetch chats for user
  const fetchChats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chats/${encodeURIComponent(user.email)}`);
      const data = await res.json();
      setChats(data);
      // Auto-select first chat
      if (data.length > 0 && !activeChat) {
        setActiveChat(data[0]);
      }
    } catch (err) {
      console.error("Error fetching chats", err);
    }
  }, [user]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Fetch messages for active chat
  useEffect(() => {
    if (!activeChat) return;
    socket.emit("join_chat", activeChat._id);
    fetch(`http://localhost:5000/api/messages/chat/${activeChat._id}`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [activeChat]);

  // Socket listeners
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      setMessages(prev => {
        if (prev.find(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Update latest message in sidebar
      setChats(prev => prev.map(c =>
        c._id === msg.chatId ? { ...c, latestMessage: msg } : c
      ));
    });
    socket.on("message_deleted", (id) => {
      setMessages(prev => prev.filter(m => m._id !== id));
    });
    socket.on("reaction_updated", ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId ? { ...m, reactions } : m
      ));
    });
    return () => {
      socket.off("receive_message");
      socket.off("message_deleted");
      socket.off("reaction_updated");
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if ((!inputValue.trim() && !selectedFile) || !user || !activeChat) return;

    const sendMsg = (fileData = null, fileName = null) => {
      socket.emit("send_message", {
        senderName: user.name,
        senderEmail: user.email,
        senderPhoto: user.profilePicture || "",
        content: inputValue.trim(),
        fileData,
        fileName,
        chatId: activeChat._id,
      });
      setInputValue("");
      setSelectedFile(null);
      setShowEmojiPicker(false);
    };

    if (selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => sendMsg(reader.result, selectedFile.name);
    } else {
      sendMsg();
    }
  };

  const handleReaction = (messageId, emoji) => {
    socket.emit("add_reaction", { messageId, emoji, userEmail: user.email, chatId: activeChat._id });
    setActiveReactionPicker(null);
  };

  const confirmDelete = (id) => {
    setDeleteTarget(id);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      socket.emit("delete_message_request", { id: deleteTarget, chatId: activeChat._id });
      setIsModalOpen(false);
      setDeleteTarget(null);
    }
  };

  // Create Group Chat
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupMembers.length < 1 || !user) return;
    const members = [...new Set([...selectedGroupMembers, user.email])];
    try {
      const res = await fetch("http://localhost:5000/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGroupChat: true, chatName: groupName, users: members, admin: user.email }),
      });
      const chat = await res.json();
      setChats(prev => {
        if (prev.find(c => c._id === chat._id)) return prev;
        return [chat, ...prev];
      });
      setActiveChat(chat);
      setShowNewGroupModal(false);
      setGroupName("");
      setSelectedGroupMembers([]);
    } catch (err) { console.error(err); }
  };

  // Create DM
  const handleStartDM = async (otherEmail) => {
    if (!user) return;
    try {
      const res = await fetch("http://localhost:5000/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGroupChat: false, users: [user.email, otherEmail] }),
      });
      const chat = await res.json();
      setChats(prev => {
        if (prev.find(c => c._id === chat._id)) return prev;
        return [chat, ...prev];
      });
      setActiveChat(chat);
      setShowNewDMModal(false);
    } catch (err) { console.error(err); }
  };

  const getChatDisplayName = (chat) => {
    if (chat.isGroupChat) return chat.chatName;
    const other = chat.users?.find(u => u !== user?.email);
    const otherUser = allUsers.find(u => u.email === other);
    return otherUser ? otherUser.fullName : other;
  };

  const getChatMembers = (chat) => {
    if (!chat) return [];
    return allUsers.filter(u => chat.users?.includes(u.email));
  };

  const groupChats = chats.filter(c => c.isGroupChat);
  const dmChats = chats.filter(c => !c.isGroupChat);

  const sharedFiles = messages.filter(m => m.fileData && m.fileName);

  const grouped = groupMessagesByDate(messages);

  const filteredUsers = allUsers.filter(u =>
    u.email !== user?.email &&
    (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="chat-root">
      <Nav />
      <div className="chat-app">
        {/* LEFT SIDEBAR */}
        <aside className="chat-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-user-info">
              <div className="sidebar-avatar">
                {user?.profilePicture
                  ? <img src={user.profilePicture} alt={user.name} />
                  : <span>{getInitials(user?.name)}</span>}
              </div>
              <div>
                <div className="sidebar-username">{user?.name}</div>
                <div className="sidebar-role">{user?.userType} • Learnify</div>
              </div>
            </div>
            <button className="new-msg-btn" onClick={() => setShowNewDMModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              New Message
            </button>
          </div>

          <div className="sidebar-section-label">GROUP CHATS</div>
          <div className="chat-list">
            {groupChats.map(chat => (
              <div
                key={chat._id}
                className={`chat-list-item ${activeChat?._id === chat._id ? "active" : ""}`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="chat-item-avatar group-avatar">
                  <span>{getInitials(chat.chatName)}</span>
                </div>
                <div className="chat-item-info">
                  <div className="chat-item-top">
                    <span className="chat-item-name">{chat.chatName}</span>
                    <span className="chat-item-time">{chat.latestMessage ? formatTime(chat.latestMessage.timestamp) : ""}</span>
                  </div>
                  <div className="chat-item-preview">
                    {chat.latestMessage?.senderEmail === user?.email ? "You: " : ""}
                    {chat.latestMessage?.fileName ? `📎 ${chat.latestMessage.fileName}` : chat.latestMessage?.content || "No messages yet"}
                  </div>
                </div>
              </div>
            ))}
            <button className="new-group-btn" onClick={() => setShowNewGroupModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Group
            </button>
          </div>

          <div className="sidebar-section-label">DIRECT MESSAGES</div>
          <div className="chat-list">
            {dmChats.map(chat => {
              const name = getChatDisplayName(chat);
              return (
                <div
                  key={chat._id}
                  className={`chat-list-item ${activeChat?._id === chat._id ? "active" : ""}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="chat-item-avatar dm-avatar">
                    <span>{getInitials(name)}</span>
                    <span className="online-dot"></span>
                  </div>
                  <div className="chat-item-info">
                    <div className="chat-item-top">
                      <span className="chat-item-name">{name}</span>
                      <span className="chat-item-time">{chat.latestMessage ? formatTime(chat.latestMessage.timestamp) : ""}</span>
                    </div>
                    <div className="chat-item-preview">
                      {chat.latestMessage?.senderEmail === user?.email ? "You: " : ""}
                      {chat.latestMessage?.fileName ? `📎 ${chat.latestMessage.fileName}` : chat.latestMessage?.content || "Say hi!"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="chat-main">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <div className="chat-main-header-left">
                  <div className={`chat-header-avatar ${activeChat.isGroupChat ? "group-avatar" : "dm-avatar"}`}>
                    <span>{getInitials(getChatDisplayName(activeChat))}</span>
                  </div>
                  <div>
                    <div className="chat-main-title">
                      {getChatDisplayName(activeChat)}
                    </div>
                    <div className="chat-main-subtitle">
                      {activeChat.isGroupChat
                        ? `${activeChat.users?.length || 0} members`
                        : <><span className="online-dot-sm"></span>Online</>}
                    </div>
                  </div>
                </div>
                <div className="chat-main-header-actions">
                  <button className="header-action-btn" title="Search">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </button>
                  <button className="header-action-btn" title="Notifications">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  </button>
                  <button className="header-action-btn" title="Info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages-area" ref={messagesAreaRef}>
                {grouped.map((item, i) => {
                  if (item.type === "label") {
                    return <div key={`lbl-${i}`} className="date-label"><span>{item.label}</span></div>;
                  }
                  const msg = item.msg;
                  const mine = msg.senderEmail === user?.email;
                  return (
                    <div key={msg._id} className={`msg-row ${mine ? "mine" : "theirs"}`}>
                      {!mine && (
                        <div className="msg-avatar">
                          {msg.senderPhoto
                            ? <img src={msg.senderPhoto} alt={msg.senderName} />
                            : <span>{getInitials(msg.senderName)}</span>}
                        </div>
                      )}
                      <div className="msg-body">
                        {!mine && <div className="msg-sender-name">{msg.senderName} <span className="msg-time">{formatTime(msg.timestamp)}</span></div>}
                        <div className="msg-bubble-wrap">
                          <div className={`msg-bubble ${mine ? "msg-bubble-mine" : "msg-bubble-theirs"}`}>
                            {/* File attachment */}
                            {msg.fileData && msg.fileName && (
                              isImageFile(msg.fileName) ? (
                                <div className="chat-img-wrapper">
                                  <img src={msg.fileData} alt={msg.fileName} className="chat-img" />
                                </div>
                              ) : (
                                <a href={msg.fileData} download={msg.fileName} className="file-attachment-chip">
                                  <div className="file-chip-icon" style={{ background: getFileIconBadge(msg.fileName).color }}>
                                    {getFileIconBadge(msg.fileName).label}
                                  </div>
                                  <div className="file-chip-info">
                                    <span className="file-chip-name">{msg.fileName}</span>
                                    <span className="file-chip-action">Click to download</span>
                                  </div>
                                  <svg className="file-dl-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                </a>
                              )
                            )}
                            {msg.content && <p className="msg-text">{msg.content}</p>}
                            {mine && <div className="msg-time-mine">{formatTime(msg.timestamp)}</div>}

                            {/* Reactions overlay */}
                            {msg.reactions?.length > 0 && (
                              <div className="reactions-bar">
                                {getGroupedReactions(msg.reactions).map((r, ri) => (
                                  <span key={ri} className="reaction-chip" onClick={() => handleReaction(msg._id, r.emoji)}>
                                    {r.emoji} {r.count > 1 && <span>{r.count}</span>}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="msg-actions">
                            <button className="msg-action-btn" onClick={() => setActiveReactionPicker(activeReactionPicker === msg._id ? null : msg._id)} title="React">😊</button>
                            {mine && <button className="msg-action-btn delete-btn" onClick={() => confirmDelete(msg._id)} title="Delete">🗑️</button>}
                          </div>
                          {activeReactionPicker === msg._id && (
                            <div className="reaction-popup">
                              {EMOJIS.map(e => <span key={e} onClick={() => handleReaction(msg._id, e)}>{e}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                      {mine && (
                        <div className="msg-avatar">
                          {user?.profilePicture
                            ? <img src={user.profilePicture} alt={user.name} />
                            : <span>{getInitials(user?.name)}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="chat-input-area">
                {selectedFile && (
                  <div className="file-preview-strip">
                    <span>{getFileIcon(selectedFile.name)} {selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)}>✕</button>
                  </div>
                )}
                <div className="chat-input-bar">
                  <input type="file" hidden ref={fileInputRef} onChange={e => setSelectedFile(e.target.files[0])} />
                  <button className="input-icon-btn" onClick={() => fileInputRef.current.click()} title="Attach file">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  <textarea
                    className="chat-textarea"
                    placeholder="Type a message..."
                    value={inputValue}
                    rows={1}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <button className="input-icon-btn" onClick={() => setShowEmojiPicker(v => !v)} title="Emoji">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                  </button>
                  <button className="input-icon-btn" title="More">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                  <button className="send-btn" onClick={handleSend} title="Send">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                  </button>
                </div>
                {showEmojiPicker && (
                  <div className="emoji-picker-popup">
                    <EmojiPicker onEmojiClick={e => setInputValue(v => v + e.emoji)} previewConfig={{ showPreview: false }} />
                  </div>
                )}
                <div className="encrypt-note">🔒 Messages are end-to-end encrypted</div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-icon">💬</div>
              <h3>Welcome to Learnify Chat</h3>
              <p>Select a conversation or start a new one</p>
              <div className="no-chat-btns">
                <button onClick={() => setShowNewGroupModal(true)}>Create Group Chat</button>
                <button onClick={() => setShowNewDMModal(true)}>Start Direct Message</button>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT PANEL */}
        {activeChat && (
          <aside className="chat-right-panel">
            <div className="right-panel-tabs">
              <button className={rightTab === "participants" ? "active" : ""} onClick={() => setRightTab("participants")}>👥 Participants</button>
              <button className={rightTab === "files" ? "active" : ""} onClick={() => setRightTab("files")}>📁 Files</button>
            </div>

            {rightTab === "participants" && (
              <div className="participants-section">
                <div className="section-title-row">
                  <span>PARTICIPANTS ({getChatMembers(activeChat).length})</span>
                  {activeChat.admin === user?.email && <span className="admin-badge">Admin</span>}
                </div>
                <div className="participants-list">
                  {getChatMembers(activeChat).map(u => (
                    <div key={u.email} className="participant-item">
                      <div className="participant-avatar">
                        <span>{getInitials(u.fullName)}</span>
                        <span className="online-dot"></span>
                      </div>
                      <div className="participant-info">
                        <span className="participant-name">{u.fullName} {u.email === user?.email ? <em>(You)</em> : ""}</span>
                        <span className="participant-role">{u.userType}</span>
                      </div>
                      {u.email === activeChat.admin && <span className="admin-crown">👑</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rightTab === "files" && (
              <div className="shared-files-section">
                <div className="section-title-row">
                  <span>SHARED FILES ({sharedFiles.length})</span>
                </div>
                {sharedFiles.length === 0 ? (
                  <div className="no-files">No files shared yet</div>
                ) : (
                  <div className="shared-files-list">
                    {sharedFiles.map(msg => (
                      <a key={msg._id} href={msg.fileData} download={msg.fileName} className="shared-file-item">
                        <div className="shared-file-icon" style={{ background: getFileIconBadge(msg.fileName).color }}>
                          {getFileIconBadge(msg.fileName).label}
                        </div>
                        <div className="shared-file-info">
                          <span className="shared-file-name">{msg.fileName}</span>
                          <span className="shared-file-meta">Uploaded by {msg.senderEmail === user?.email ? "You" : msg.senderName}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="modal-overlay" onClick={() => setShowNewGroupModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Create Group Chat</h3>
            <input
              className="modal-input"
              placeholder="Group name..."
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
            />
            <input
              className="modal-input"
              placeholder="Search members..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="modal-user-list">
              {filteredUsers.map(u => (
                <label key={u.email} className="modal-user-row">
                  <input
                    type="checkbox"
                    checked={selectedGroupMembers.includes(u.email)}
                    onChange={e => {
                      setSelectedGroupMembers(prev =>
                        e.target.checked ? [...prev, u.email] : prev.filter(x => x !== u.email)
                      );
                    }}
                  />
                  <span>{u.fullName}</span>
                  <span className="role-tag">{u.userType}</span>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowNewGroupModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={handleCreateGroup}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* New DM Modal */}
      {showNewDMModal && (
        <div className="modal-overlay" onClick={() => setShowNewDMModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Start Direct Message</h3>
            <input
              className="modal-input"
              placeholder="Search users..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="modal-user-list">
              {filteredUsers.map(u => (
                <div key={u.email} className="modal-user-row clickable" onClick={() => handleStartDM(u.email)}>
                  <div className="participant-avatar sm">
                    <span>{getInitials(u.fullName)}</span>
                  </div>
                  <span>{u.fullName}</span>
                  <span className="role-tag">{u.userType}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowNewDMModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        title="Delete Message"
        message="Are you sure you want to delete this message?"
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
      />
      <Footer />
    </div>
  );
}
