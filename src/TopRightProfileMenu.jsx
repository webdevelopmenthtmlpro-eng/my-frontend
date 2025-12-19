import React, { useState, useEffect, useRef } from "react";
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

function TopRightProfileMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = auth.currentUser;
  const uid = currentUser?.uid || user?._id || "anonymous";

  const threadRef = doc(db, "threads", uid);
  const messagesCol = collection(db, "threads", uid, "messages");

  useEffect(() => {
    if (!currentUser && !user) {
      setLoading(false);
      return;
    }

    let unsub = () => {};
    let mounted = true;

    (async () => {
      try {
        const snap = await getDoc(threadRef);
        if (!snap.exists()) {
          await setDoc(threadRef, {
            userId: uid,
            agentRequested: false,
            updatedAt: serverTimestamp(),
          });
        }

        const q = query(messagesCol, orderBy("ts", "asc"));
        unsub = onSnapshot(q, async (snapshot) => {
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          if (mounted) {
            setMessages(docs);
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }

          const updates = [];
          for (const d of snapshot.docs) {
            const m = d.data();
            if (m.from !== "customer" && m.status !== "read") {
              updates.push(
                updateDoc(doc(messagesCol, d.id), { status: "read" })
              );
            }
          }
          if (updates.length) {
            for (const u of updates) {
              try {
                await u;
              } catch (e) {
                console.warn("message status update failed", e);
              }
            }
          }
        });
      } catch (e) {
        console.error("Chat init failed", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      try {
        unsub();
      } catch {}
    };
  }, [currentUser, user, uid, threadRef, messagesCol]);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    try {
      await addDoc(messagesCol, {
        from: "customer",
        text,
        ts: serverTimestamp(),
        status: "sent",
      });
      await updateDoc(threadRef, { updatedAt: serverTimestamp() });

      const lower = text.toLowerCase();
      const agentKeywords = [
        "request agent",
        "speak with agent",
        "speak to agent",
        "request human",
        "human agent",
        "talk to agent",
        "i need help",
      ];

      if (agentKeywords.some((keyword) => lower.includes(keyword))) {
        try {
          await setDoc(
            threadRef,
            { agentRequested: true, updatedAt: serverTimestamp() },
            { merge: true }
          );
          await addDoc(messagesCol, {
            from: "bot",
            text: "🚀 I've connected you with our support team. An agent will be with you shortly!",
            ts: serverTimestamp(),
            status: "sent",
          });
        } catch (e) {
          console.warn("auto-escalation failed", e);
        }
        return;
      }

      let botReply = null;

      const greetingPhrases = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
      const isGreeting = greetingPhrases.some(p => lower === p || lower.startsWith(p + ' '));
      
      if (isGreeting) {
        const userName = userData?.name || 'there';
        botReply = `Hello ${userName}! 👋 How can I help you with your deliveries today?`;
      }

      try {
        if (!botReply) {
          const aiResponse = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              userId: user?._id,
              userName: userData?.name || 'Customer',
            }),
          });

          botReply = "I'm here to help! How can I assist you?";

          if (aiResponse.ok) {
            const data = await aiResponse.json();
            if (data.reply && data.reply.trim()) {
              botReply = data.reply;
            }
          }
        }

        await addDoc(messagesCol, {
          from: "bot",
          text: botReply,
          ts: serverTimestamp(),
          status: "sent",
        });
      } catch (e) {
        console.error("AI chat error:", e);
        await addDoc(messagesCol, {
          from: "bot",
          text: "I'm temporarily unavailable. Would you like to connect with a human agent?",
          ts: serverTimestamp(),
          status: "sent",
        });
      }
    } catch (e) {
      console.error("sendMessage failed", e);
    }
  };

  const userInitials = userData?.name
    ? userData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SD";

  return (
    <div
      style={{
        position: "fixed",
        top: "80px",
        right: "20px",
        zIndex: 9999,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 16px",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
            fontSize: "14px",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.6)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.4)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
              color: "#fff",
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "2px solid rgba(255, 255, 255, 0.8)",
              position: "relative",
              backgroundImage: userData?.profilePicture
                ? `url(${userData.profilePicture})`
                : "none",
              backgroundColor: userData?.profilePicture
                ? "transparent"
                : "rgba(255, 255, 255, 0.3)",
            }}
          >
            {!userData?.profilePicture && userInitials}
            {userData?.isVerified && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "16px",
                  height: "16px",
                  background: "#10b981",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  color: "#fff",
                  border: "2px solid #fff",
                }}
              >
                ✓
              </div>
            )}
          </div>
        </button>
      ) : (
        <div
          style={{
            width: "380px",
            height: "600px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.16)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#fff",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: userData?.profilePicture
                    ? `url(${userData.profilePicture}) center/cover`
                    : "rgba(255, 255, 255, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#fff",
                  border: "2px solid rgba(255, 255, 255, 0.8)",
                  position: "relative",
                  backgroundImage: userData?.profilePicture
                    ? `url(${userData.profilePicture})`
                    : "none",
                  backgroundColor: userData?.profilePicture
                    ? "transparent"
                    : "rgba(255, 255, 255, 0.3)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {!userData?.profilePicture && userInitials}
                {userData?.isVerified && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-4px",
                      right: "-4px",
                      width: "18px",
                      height: "18px",
                      background: "#10b981",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#fff",
                      border: "2px solid #fff",
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600" }}>
                  {userData?.name || "Support"}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.9 }}>
                  {userData?.isVerified ? "✓ Verified" : "Pending Verification"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: "20px",
                cursor: "pointer",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
              backgroundColor: "#f9fafb",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {loading && (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                Loading chat…
              </p>
            )}
            {!loading && messages.length === 0 && (
              <p
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                👋 Start the conversation!
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent:
                    m.from === "customer" ? "flex-end" : "flex-start",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    background:
                      m.from === "customer"
                        ? "#4f46e5"
                        : m.from === "admin"
                        ? "#f3f4f6"
                        : "#e5e7eb",
                    color:
                      m.from === "customer"
                        ? "#fff"
                        : m.from === "admin"
                        ? "#111827"
                        : "#374151",
                    wordWrap: "break-word",
                  }}
                >
                  {m.from === "customer" ? null : (
                    <strong style={{ display: "block", marginBottom: "4px" }}>
                      {m.from === "admin" ? "Support" : "Bot"}
                    </strong>
                  )}
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: "12px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type your message…"
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#4f46e5";
                e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 16px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#6366f1";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#4f46e5";
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

export default TopRightProfileMenu;
