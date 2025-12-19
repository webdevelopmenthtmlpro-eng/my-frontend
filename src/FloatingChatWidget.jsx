// === FloatingChatWidget.jsx (Fully Fixed Version) ========================

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { auth, db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

function FloatingChatWidget({ user, isVisible = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);        // Firestore messages
  const [mongoMessages, setMongoMessages] = useState([]); // Socket/Mongo messages
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const messagesEndRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const containerRef = useRef(null);

  const currentUser = auth.currentUser;
  const uid = currentUser?.uid || user?._id || "anonymous";

  const conversationId = user?._id ? `customer-${user._id}` : null;

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const savedPosition = localStorage.getItem('chatWidgetPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch {
        setPosition({ x: 0, y: 80 });
      }
    }
  }, []);

  useEffect(() => {
    const handleOpenChatWithMessage = (event) => {
      const message = event.detail?.message;
      console.log('📱 FloatingChatWidget EVENT RECEIVED!');
      console.log('📱 Message:', message);
      if (message) {
        console.log('✅ Setting input and opening chat');
        setInput(message);
        setIsOpen(true);
      } else {
        console.log('⚠️ No message in event detail');
      }
    };

    console.log('📱 FloatingChatWidget: Setting up event listener for openFloatingChatWithMessage');
    window.addEventListener('openFloatingChatWithMessage', handleOpenChatWithMessage);
    return () => {
      window.removeEventListener('openFloatingChatWithMessage', handleOpenChatWithMessage);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || isOpen) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem('chatWidgetPosition', JSON.stringify(position));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  // Load Admin User
  useEffect(() => {
    if (!user?._id) return;

    const fetchAdminUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:5000/api/admin/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const admin = await res.json();
          setAdminUser(admin);
        }
      } catch (err) {
        console.error("Admin user error:", err);
      }
    };

    fetchAdminUser();
  }, [user?._id]);

  // SOCKET.IO — receive messages ONLY
  useEffect(() => {
    if (!user?._id) return;

    const s = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    s.on("connect", () => {
      setIsConnected(true);
      s.emit("user-login", { userId: user._id });

      const token = localStorage.getItem("token");
      fetch(`http://localhost:5000/api/messaging/conversation/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => setMongoMessages(d.messages || []));
    });

    s.on("disconnect", () => setIsConnected(false));

    s.on(`message-${conversationId}`, (message) => {
      setMongoMessages((prev) => [...prev, message]);

      if (message.isFromAdmin && !isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    s.on(`message-status-${conversationId}`, (status) => {
      setMongoMessages((prev) =>
        prev.map((msg) =>
          msg._id === status.messageId ? { ...msg, status: status.status } : msg
        )
      );
    });

    setSocket(s);

    return () => s.disconnect();
  }, [user?._id]);

  // FIREBASE CHAT THREAD (customer side)
  const threadRef = doc(db, "threads", uid);
  const messagesCol = collection(db, "threads", uid, "messages");

  useEffect(() => {
    if (!currentUser && !user) {
      setLoading(false);
      return;
    }

    let unsub = () => {};

    (async () => {
      const snap = await getDoc(threadRef);
      if (!snap.exists())
        await setDoc(threadRef, {
          userId: uid,
          agentRequested: false,
          updatedAt: serverTimestamp(),
        });

      const q = query(messagesCol, orderBy("ts", "asc"));

      unsub = onSnapshot(q, async (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(docs);

        docs.forEach(async (d) => {
          if (d.from !== "customer" && d.status !== "read") {
            await updateDoc(doc(messagesCol, d.id), { status: "read" });
          }
        });
      });

      setLoading(false);
    })();

    return unsub;
  }, [currentUser, user, uid]);

  const allMessages = React.useMemo(() => {
    const merged = [...messages, ...mongoMessages];
    const seen = new Set();
    return merged.filter(m => {
      const key = m.id || m._id || `${m.text || m.message}-${m.ts || m.createdAt}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [messages, mongoMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // SEND MESSAGE (API only — NO socket.emit)
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (!conversationId || !adminUser || !user?._id) return;

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      message: text,
      conversationId,
      senderId: user._id,
      recipientId: adminUser._id,
      isFromAdmin: false,
      status: "sent",
      createdAt: new Date(),
      text: text
    };

    setMongoMessages((prev) => [...prev, optimisticMessage]);



    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/messaging/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId,
          senderId: user._id,
          recipientId: adminUser._id,
          message: text,
          isFromAdmin: false,
        }),
      });

      if (!res.ok) {
        console.error("❌ Message send failed:", res.status);
        setMongoMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
      } else {
        const data = await res.json();
        console.log("✅ Message sent successfully:", data);
        setMongoMessages((prev) =>
          prev.map((m) =>
            m._id === optimisticMessage._id
              ? { ...data.message, status: "delivered" }
              : m
          )
        );
      }
    } catch (err) {
      console.error("❌ Send error:", err);
      setMongoMessages((prev) => prev.filter((m) => m._id !== optimisticMessage._id));
    }
  };

  if (!isVisible) return null;

  const renderMessage = (m) => {
    const isCustomer = m.from === "customer" || !m.isFromAdmin;

    return (
      <div
        key={m.id || m._id}
        style={{
          display: "flex",
          justifyContent: isCustomer ? "flex-end" : "flex-start",
          marginBottom: "8px",
          gap: "4px",
          alignItems: "flex-end",
        }}
      >
         <div
           style={{
             maxWidth: "75%",
             padding: "10px 14px",
             borderRadius: "12px",
             fontSize: "13px",
             fontStyle: "italic",
             background: isCustomer ? "#4f46e5" : "#f3f4f6",
             color: isCustomer ? "#fff" : "#111827",
           }}
         >
          {!isCustomer && (
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Support
            </strong>
          )}
          {m.text || m.message}
        </div>
        {isCustomer && (
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>
            {m.status === "read" && "✓✓"}
            {m.status === "delivered" && "✓"}
            {m.status === "sent" && "•"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{
        position: "fixed",
        top: `${position.y}px`,
        left: `${position.x}px`,
        right: "auto",
        zIndex: 3000,
        cursor: isDragging && !isOpen ? "grabbing" : !isOpen ? "grab" : "default",
        userSelect: isDragging ? "none" : "auto",
      }}
    >
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} style={{ padding: "10px 20px" }}>💬 Chat</button>
      ) : (
         <div
           style={{
             width: "320px",
             height: "500px",
             background: "#fff",
             borderRadius: "12px",
             display: "flex",
             flexDirection: "column",
             boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
           }}
         >
          <div
            style={{
              padding: "16px",
              background: "#4f46e5",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
            }}
          >
            <div>💬 Support</div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                color: "#fff",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "#f9fafb",
            }}
          >
            {allMessages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>



          <div style={{ padding: "12px", display: "flex", gap: "8px" }}>
            <input
              className="chatbox-floating-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message…"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: "#4f46e5",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px 20px",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FloatingChatWidget;
