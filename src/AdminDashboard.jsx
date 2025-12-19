import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getCurrentUser, logoutUser } from "./authService";
import TrackingModal from "./TrackingModal";
import TestModal from "./TestModal";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

const AdminDashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // State for users
  const [users, setUsers] = useState([]);
  // State for couriers
  const [couriers, setCouriers] = useState([]);
  // State for shipments
  const [shipments, setShipments] = useState([]);
  // State for chat
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  // Loading states for button interactions
  const [verifyingUsers, setVerifyingUsers] = useState({});
  
  // State for agent requests
  const [agentRequests, setAgentRequests] = useState([]);
  // State for verified users
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  // State for direct messages
  const [selectedUser, setSelectedUser] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [directMessage, setDirectMessage] = useState("");
  // State for Socket.io
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser({ name: currentUser.email, ...currentUser });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // logout handler
  const handleLogout = async () => {
    try {
      console.log("Logout clicked");
      if (onLogout) {
        await onLogout();
        return;
      }
      await logoutUser();
      setUser(null);
      window.location.hash = "#/";
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem("token");
      setUser(null);
      window.location.hash = "#/";
      window.location.reload();
    }
  };

  useEffect(() => {
    if (!user || !user.id) return;

    const newSocket = io("http://localhost:5000", {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("✅ Admin connected to messaging server");
      setIsSocketConnected(true);
      newSocket.emit("user-login", { userId: user.id });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Admin disconnected from messaging server");
      setIsSocketConnected(false);
    });

    newSocket.on("message-error", (error) => {
      console.error("❌ Message error:", error);
    });

    newSocket.on(`notification-${user.id}`, (notification) => {
      console.log("🔔 Notification received:", notification);
      alert(`📧 New message from ${notification.senderName}: ${notification.message}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // Fetch data when tab changes
  useEffect(() => {
    let unsubscribe;
    if (user) {
      if (activeTab === "users") fetchUsers();
      if (activeTab === "couriers") fetchCouriers();
      if (activeTab === "shipments") fetchShipments();
      if (activeTab === "chat") {
        unsubscribe = fetchConversations();
      }
      if (activeTab === "agent-requests") fetchAgentRequests();
      if (activeTab === "verified-users") fetchVerifiedUsers();
      if (activeTab === "direct-messages") fetchVerifiedUsers();
    }
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [activeTab, user]);

  // API calls
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        return data;
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
    return [];
  };

  const fetchCouriers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/couriers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCouriers(data);
      }
    } catch (err) {
      console.error("Failed to fetch couriers:", err);
      // Mock data for demo
      setCouriers([
        {
          _id: "c1",
          name: "John Courier",
          email: "john@courier.com",
          status: "active",
          verified: true,
        },
        {
          _id: "c2",
          name: "Jane Driver",
          email: "jane@driver.com",
          status: "inactive",
          verified: false,
        },
      ]);
    }
  };

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/admin/shipments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setShipments(data);
      }
    } catch (err) {
      console.error("Failed to fetch shipments:", err);
      // Mock data for demo
      setShipments([
        {
          _id: "s1",
          sender: "Alice Customer",
          receiver: "Bob Receiver",
          pickupAddress: "123 Main St",
          deliveryAddress: "456 Elm St",
          courier: "John Courier",
          status: "in_transit",
        },
        {
          _id: "s2",
          sender: "Charlie Sender",
          receiver: "Diana Dest",
          pickupAddress: "789 Oak Ave",
          deliveryAddress: "321 Pine Rd",
          courier: "Not Assigned",
          status: "pending",
        },
      ]);
    }
  };

  const fetchConversations = () => {
    try {
      const threadsRef = collection(db, "threads");
      const q = query(where("agentRequested", "==", true));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const convs = [];
        
        for (const threadDoc of snapshot.docs) {
          const threadData = threadDoc.data();
          const threadId = threadDoc.id;
          
          try {
            // Get messages for this thread to find last message
            const messagesRef = collection(db, "threads", threadId, "messages");
            const messagesSnap = await getDoc(doc(db, "threads", threadId));
            
            const userData = await Promise.resolve().then(() => {
              // Try to get user info from users list or use threadId as fallback
              const found = users.find(u => u._id === threadId || u.id === threadId);
              return found ? found.name || found.email || "Customer" : "Customer";
            });
            
            convs.push({
              _id: threadId,
              customerName: userData,
              agentRequested: true,
              lastMessage: threadData.lastMessage || "",
              unread: threadData.unread || 0,
            });
          } catch (err) {
            console.error("Error processing thread:", err);
          }
        }
        
        setConversations(convs);
      });
      
      return unsubscribe;
    } catch (err) {
      console.error("Failed to fetch conversations from Firestore:", err);
      setConversations([]);
    }
  };

  const verifyUser = async (userId) => {
    console.log("Verify clicked for", userId);
    
    // Set loading state for this specific user
    setVerifyingUsers(prev => ({ ...prev, [userId]: true }));
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/admin/verify-user/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        let errorMessage = `Failed to verify user (${res.status})`;
        
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, try to get text response
          const textError = await res.text();
          console.error("Verify response text:", textError);
        }
        
        console.error("Verify error:", res.status, errorMessage);
        alert(`Verification failed: ${errorMessage}`);
        return;
      }

      const result = await res.json();
      console.log("User verification successful:", result);
      alert("User verified successfully!");
      
      // Refresh the users list to show updated status
      await fetchUsers();
      
    } catch (err) {
      console.error("Failed to verify user:", err);
      alert(`Network error verifying user: ${err.message}`);
    } finally {
      // Always clear the loading state
      setVerifyingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  const updateShipmentStatus = async (shipmentId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/admin/shipments/${shipmentId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        alert("Status updated!");
        fetchShipments();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const fetchAgentRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/agent-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAgentRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch agent requests:", err);
    }
  };

  const fetchVerifiedUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/verified-users-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setVerifiedUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch verified users:", err);
    }
  };

  const fetchConversationMessages = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const conversationId = `customer-${userId}`;
      
      const res = await fetch(
        `http://localhost:5000/api/messaging/conversation/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        setDirectMessages(data.messages || []);
        console.log(`✅ Loaded ${data.messages?.length || 0} messages for conversation ${conversationId}`);

        await fetch(
          `http://localhost:5000/api/messaging/mark-read/${conversationId}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch((err) => console.warn("Failed to mark as read:", err));

        if (socket && isSocketConnected) {
          socket.off(`message-${conversationId}`);
          socket.off(`message-status-${conversationId}`);
          
          socket.on(`message-${conversationId}`, (message) => {
            console.log("📩 New message received:", message);
            setDirectMessages((prev) => {
              const exists = prev.some(m => m._id === message._id);
              return exists ? prev : [...prev, message];
            });
          });

          socket.on(`message-status-${conversationId}`, (status) => {
            console.log("📊 Message status updated:", status);
            setDirectMessages((prev) =>
              prev.map((msg) =>
                msg._id === status.messageId ? { ...msg, status: status.status } : msg
              )
            );
          });

          socket.on(`message-status-updated-${conversationId}`, (data) => {
            console.log("📊 Messages marked as read");
            setDirectMessages((prev) =>
              prev.map((msg) => ({ ...msg, status: 'read' }))
            );
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    }
  };

  const sendDirectMessage = async () => {
    if (!selectedUser || !directMessage.trim()) {
      alert("Please select a user and type a message");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const conversationId = `customer-${selectedUser._id}`;
      
      const res = await fetch("http://localhost:5000/api/messaging/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          recipientId: selectedUser._id,
          message: directMessage,
          isFromAdmin: true,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setDirectMessage("");
        
        if (socket && isSocketConnected) {
          socket.emit("send-message", {
            conversationId,
            senderId: user.id,
            recipientId: selectedUser._id,
            message: directMessage,
            isFromAdmin: true,
          });
        }
        
        await fetchConversationMessages(selectedUser._id);
      } else {
        alert("Failed to send message");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Error sending message");
    }
  };

  const acceptAgentRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/agent-request/${requestId}/accept`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert("Agent request accepted!");
        fetchAgentRequests();
      }
    } catch (err) {
      console.error("Failed to accept agent request:", err);
    }
  };

  const resolveAgentRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/agent-request/${requestId}/resolve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        alert("Agent request resolved!");
        fetchAgentRequests();
      }
    } catch (err) {
      console.error("Failed to resolve agent request:", err);
    }
  };

  const openConversation = async (conv) => {
    setSelectedConversation(conv);
    setChatMessages([]);
    
    try {
      const messagesRef = collection(db, "threads", conv._id, "messages");
      const q = query(messagesRef, orderBy("ts", "asc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map((d) => ({
          _id: d.id,
          sender: d.data().from === "admin" ? "admin" : d.data().from === "bot" ? "bot" : "customer",
          text: d.data().text,
          timestamp: d.data().ts?.toDate?.() || new Date(),
        }));
        setChatMessages(messages);
      });
      
      // Store unsub to clean up when changing conversations
      conv._unsubscribe = unsubscribe;
    } catch (err) {
      console.error("Failed to open Firestore conversation:", err);
      setChatMessages([]);
    }
  };

  const sendAdminMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const messagesRef = collection(db, "threads", selectedConversation._id, "messages");
      
      await addDoc(messagesRef, {
        from: "admin",
        text: newMessage,
        ts: serverTimestamp(),
        status: "sent",
      });
      
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send admin message:", err);
      alert("Failed to send message: " + err.message);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading admin data...</div>;
  }

  if (!user) {
    return (
      <div style={styles.loading}>
        You must be logged in as an admin to view this page.
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1>SwiftDelivery Admin Dashboard</h1>
            <p>Welcome, {user.name || "Admin"}!</p>
          </div>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            title="Log out"
          >
            ✕
          </button>
        </div>
      </header>

      <nav style={styles.nav}>
        <button
          style={activeTab === "overview" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          style={activeTab === "users" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          style={activeTab === "couriers" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("couriers")}
        >
          Couriers
        </button>
        <button
          style={activeTab === "shipments" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("shipments")}
        >
          Shipments
        </button>
        <button
          style={activeTab === "tracking" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("tracking")}
        >
          Tracking
        </button>
        <button
          style={activeTab === "chat" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("chat")}
        >
          Chat/Support
        </button>
        <button
          style={activeTab === "agent-requests" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("agent-requests")}
        >
          Agent Requests {agentRequests.length > 0 && `(${agentRequests.length})`}
        </button>
        <button
          style={activeTab === "verified-users" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("verified-users")}
        >
          All Verified Users
        </button>
        <button
          style={activeTab === "direct-messages" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("direct-messages")}
        >
          Direct Messages
        </button>
        <button
          style={activeTab === "analytics" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </nav>

      <main style={styles.main}>
        {activeTab === "overview" && (
          <div>
            <h2>Dashboard Overview</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h3>Total Users</h3>
                <p style={styles.statNumber}>{users.length || 0}</p>
              </div>
              <div style={styles.statCard}>
                <h3>Active Shipments</h3>
                <p style={styles.statNumber}>
                  {shipments.filter((s) => s.status === "in_transit").length ||
                    0}
                </p>
              </div>
              <div style={styles.statCard}>
                <h3>Total Shipments</h3>
                <p style={styles.statNumber}>{shipments.length || 0}</p>
              </div>
              <div style={styles.statCard}>
                <h3>Delivered Today</h3>
                <p style={styles.statNumber}>0</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <h2>User Management</h2>
            <div style={{ position: "relative", zIndex: 5 }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Admin</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.isAdmin ? "Yes" : "No"}</td>
                      <td>{u.isVerified ? "✅" : "⏳"}</td>
                      <td>
                        {!u.isVerified && (
                          <button
                            style={{
                              ...styles.btnSmall,
                              opacity: verifyingUsers[u._id] ? 0.6 : 1,
                              cursor: verifyingUsers[u._id] ? "not-allowed" : "pointer"
                            }}
                            disabled={verifyingUsers[u._id]}
                            onClick={() => {
                              console.log("Button onClick fired for", u._id);
                              verifyUser(u._id);
                            }}
                          >
                            {verifyingUsers[u._id] ? "Verifying..." : "Verify"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "couriers" && (
          <div>
            <h2>Courier Management</h2>
            <button style={styles.btnPrimary}>Add New Courier</button>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {couriers.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.status}</td>
                    <td>{c.verified ? "✅" : "⏳"}</td>
                    <td>
                      <button style={styles.btnSmall}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "shipments" && (
          <div>
            <h2>Shipment Overview</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Receiver</th>
                  <th>Pickup</th>
                  <th>Delivery</th>
                  <th>Courier</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr key={s._id}>
                    <td>{s._id}</td>
                    <td>{s.sender}</td>
                    <td>{s.receiver}</td>
                    <td>{s.pickupAddress}</td>
                    <td>{s.deliveryAddress}</td>
                    <td>{s.courier}</td>
                    <td>{s.status}</td>
                    <td>
                      <select
                        style={styles.select}
                        value={s.status}
                        onChange={(e) =>
                          updateShipmentStatus(s._id, e.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">
                          Out for Delivery
                        </option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "tracking" && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2>📍 Live Package Tracking</h2>
              <p style={{ color: '#718096', marginBottom: '20px' }}>
                Manage package tracking, pinpoint locations, and generate tracking IDs for customers
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsTrackingModalOpen(true)}
                style={{
                  ...styles.btnPrimary,
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                🗺️ Open Live Tracking Map
              </button>
              <button
                onClick={() => setIsTestModalOpen(true)}
                style={{
                  ...styles.tab,
                  padding: '12px 32px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#f0f4ff',
                  border: '1px solid #c7d2fe',
                  color: '#4f46e5',
                  cursor: 'pointer',
                }}
                title="Click to test if modal system works"
              >
                🧪 Test Modal
              </button>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div style={styles.chatContainer}>
            <div style={styles.chatSidebar}>
              <h3>Agent Requests 🔴</h3>
              {conversations.length === 0 ? (
                <p style={{ padding: "15px", color: "#6c757d", fontSize: "12px" }}>
                  No agent requests pending
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    style={{
                      ...styles.conversationItem,
                      backgroundColor: selectedConversation?._id === conv._id ? "#e3f2fd" : "transparent",
                      borderLeft: conv.agentRequested ? "4px solid #dc3545" : "4px solid transparent",
                      transition: "background-color 0.2s",
                    }}
                    onClick={() => openConversation(conv)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#dc3545", fontSize: "16px" }}>🔴</span>
                      <strong>{conv.customerName}</strong>
                    </div>
                    <p style={styles.lastMessage}>{conv.lastMessage || "New agent request"}</p>
                    {conv.unread > 0 && (
                      <span style={styles.unreadBadge}>{conv.unread}</span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div style={styles.chatMain}>
              {selectedConversation ? (
                <>
                  <div style={styles.chatHeader}>
                    <h3>Chat with {selectedConversation.customerName}</h3>
                  </div>
                  <div style={styles.chatMessages}>
                    {chatMessages.map((msg) => (
                      <div
                        key={msg._id}
                        style={{
                          display: "flex",
                          justifyContent: msg.sender === "admin" ? "flex-end" : "flex-start",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={
                            msg.sender === "admin"
                              ? { ...styles.adminMessage, maxWidth: "70%" }
                              : msg.sender === "bot"
                              ? { ...styles.botMessage, maxWidth: "70%" }
                              : { ...styles.customerMessage, maxWidth: "70%" }
                          }
                        >
                          <p style={{ margin: "0 0 4px 0", wordWrap: "break-word" }}>
                            {msg.text}
                          </p>
                          <small style={{ opacity: 0.7, fontSize: "11px" }}>
                            {msg.timestamp?.toLocaleTimeString?.() || ""}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={styles.chatInput}>
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && sendAdminMessage()
                      }
                      style={styles.input}
                    />
                    <button
                      style={styles.btnPrimary}
                      onClick={sendAdminMessage}
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div style={styles.chatPlaceholder}>
                  <p>Select a conversation to start chatting with a customer.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "agent-requests" && (
          <div>
            <h2>🚨 Agent Requests</h2>
            {agentRequests.length === 0 ? (
              <p style={{ padding: "20px", color: "#6c757d", fontSize: "14px" }}>
                No pending agent requests
              </p>
            ) : (
              <div style={{ ...styles.statsGrid, gap: "15px" }}>
                {agentRequests.map((req) => (
                  <div
                    key={req._id}
                    style={{
                      ...styles.statCard,
                      backgroundColor: "#fff3cd",
                      borderLeft: "4px solid #ffc107",
                      padding: "15px",
                    }}
                  >
                    <h4 style={{ marginTop: 0 }}>
                      {req.userId?.name || "Unknown"} ({req.userId?.email})
                    </h4>
                    <p style={{ color: "#555", marginBottom: "10px" }}>
                      <strong>Message:</strong> {req.message}
                    </p>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
                      <strong>Status:</strong> {req.status}
                    </p>
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "15px" }}>
                      <strong>Requested:</strong> {new Date(req.createdAt).toLocaleString()}
                    </p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {req.status === "pending" && (
                        <>
                          <button
                            style={{ ...styles.btnSmall, backgroundColor: "#28a745", color: "#fff" }}
                            onClick={() => acceptAgentRequest(req._id)}
                          >
                            Accept
                          </button>
                          <button
                            style={{ ...styles.btnSmall, backgroundColor: "#6c757d", color: "#fff" }}
                            onClick={() => {
                              setSelectedUser({ _id: req.userId?._id, name: req.userId?.name });
                              setActiveTab("direct-messages");
                            }}
                          >
                            Message Customer
                          </button>
                        </>
                      )}
                      {req.status === "accepted" && (
                        <button
                          style={{ ...styles.btnSmall, backgroundColor: "#6c757d", color: "#fff" }}
                          onClick={() => resolveAgentRequest(req._id)}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "verified-users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0 }}>✅ All Verified Users</h2>
              <div style={{ 
                backgroundColor: "#28a745", 
                color: "white", 
                padding: "8px 16px", 
                borderRadius: "20px", 
                fontWeight: "600",
                fontSize: "14px"
              }}>
                Total: {verifiedUsers.length}
              </div>
            </div>
            {verifiedUsers.length === 0 ? (
              <p style={{ padding: "20px", color: "#6c757d", fontSize: "14px" }}>
                No verified users
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "15px",
                  maxHeight: "calc(100vh - 250px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "15px",
                  paddingRight: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                {verifiedUsers.map((user, index) => (
                  <div
                    key={user._id}
                    style={{
                      ...styles.statCard,
                      backgroundColor: "#d4edda",
                      borderLeft: "4px solid #28a745",
                      borderRadius: "8px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 6px 12px rgba(40, 167, 69, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    }}
                    onClick={() => {
                      setSelectedUser(user);
                      fetchConversationMessages(user._id);
                      setActiveTab("direct-messages");
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: "#28a745",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        marginRight: "10px",
                        fontSize: "14px"
                      }}>
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <h4 style={{ margin: 0, flex: 1, fontSize: "15px" }}>{user.name}</h4>
                    </div>
                    <p style={{ color: "#555", marginBottom: "8px", fontSize: "13px" }}>
                      📧 {user.email}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "#28a745", fontWeight: "600" }}>
                      💬 Send Message →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "direct-messages" && (
          <div>
            <h2>💬 Direct Messages</h2>
            <div style={styles.chatContainer}>
              <div style={{ ...styles.chatSidebar, flex: "0 0 320px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0 }}>Verified Users</h3>
                  <span style={{ 
                    backgroundColor: "#e9ecef", 
                    padding: "4px 10px", 
                    borderRadius: "12px", 
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {verifiedUsers.length}
                  </span>
                </div>
                <div style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", overflowX: "hidden", paddingRight: "8px" }}>
                  {verifiedUsers.length === 0 ? (
                    <p style={{ padding: "15px", color: "#6c757d", fontSize: "12px" }}>
                      No verified users
                    </p>
                  ) : (
                    verifiedUsers.map((user) => (
                      <div
                        key={user._id}
                        style={{
                          ...styles.conversationItem,
                          backgroundColor: selectedUser?._id === user._id ? "#e3f2fd" : "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setSelectedUser(user);
                          fetchConversationMessages(user._id);
                        }}
                      >
                        <strong>{user.name}</strong>
                        <p style={{ ...styles.lastMessage, margin: "5px 0 0 0" }}>
                          {user.email}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div style={styles.chatMain}>
                {selectedUser ? (
                  <>
                    <div style={styles.chatHeader}>
                      <h3 style={{ margin: 0 }}>
                        💬 {selectedUser.name}
                      </h3>
                      <p style={{ margin: "5px 0 0 0", color: "#6c757d", fontSize: "12px" }}>
                        {selectedUser.email}
                      </p>
                    </div>
                    <div style={styles.chatMessages}>
                      {directMessages.length === 0 ? (
                        <p style={{ color: "#6c757d", textAlign: "center" }}>
                          No messages yet. Start the conversation!
                        </p>
                      ) : (
                        directMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: msg.isFromAdmin ? "flex-end" : "flex-start",
                              marginBottom: "8px",
                              gap: "4px",
                              alignItems: "flex-end",
                            }}
                          >
                            <div
                              style={
                                msg.isFromAdmin
                                  ? styles.adminMessage
                                  : styles.customerMessage
                              }
                            >
                              {msg.message}
                            </div>
                            {msg.isFromAdmin && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  color: "#9ca3af",
                                  minWidth: "20px",
                                }}
                              >
                                {msg.status === "read" && "✓✓"}
                                {msg.status === "delivered" && "✓"}
                                {msg.status === "sent" && "•"}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div style={styles.chatInput}>
                      <input
                        type="text"
                        style={styles.input}
                        placeholder="Type your message..."
                        value={directMessage}
                        onChange={(e) => setDirectMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") sendDirectMessage();
                        }}
                      />
                      <button
                        style={styles.btnSmall}
                        onClick={sendDirectMessage}
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={styles.chatPlaceholder}>
                    <p>Select a user to start messaging</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <h2>System Analytics</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h3>Revenue (This Month)</h3>
                <p style={styles.statNumber}>$0</p>
              </div>
              <div style={styles.statCard}>
                <h3>Total Deliveries</h3>
                <p style={styles.statNumber}>
                  {shipments.filter((s) => s.status === "delivered").length}
                </p>
              </div>
              <div style={styles.statCard}>
                <h3>Failed Deliveries</h3>
                <p style={styles.statNumber}>
                  {shipments.filter((s) => s.status === "failed").length}
                </p>
              </div>
              <div style={styles.statCard}>
                <h3>Active Couriers</h3>
                <p style={styles.statNumber}>
                  {couriers.filter((c) => c.status === "active").length}
                </p>
              </div>
            </div>
            <p style={{ marginTop: "20px" }}>
              Charts and detailed performance metrics will be displayed here.
            </p>
          </div>
        )}
      </main>

      <TrackingModal 
        isOpen={isTrackingModalOpen} 
        onClose={() => setIsTrackingModalOpen(false)} 
      />

      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};

// Inline styles
const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
    padding: "20px",
  },
  loading: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "18px",
  },
  header: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  logoutButton: {
    backgroundColor: "#f56565",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
  nav: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "12px 24px",
    border: "none",
    backgroundColor: "#fff",
    cursor: "pointer",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  tabActive: {
    padding: "12px 24px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
  },
  main: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    minHeight: "500px",
    position: "relative",
    zIndex: 1,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  statCard: {
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderRadius: "8px",
    textAlign: "center",
    border: "1px solid #e5e7eb",
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#007bff",
    margin: "10px 0 0 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  btnSmall: {
    padding: "6px 12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    transition:
      "transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
  },
  btnPrimary: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "15px",
    pointerEvents: "auto",
    zIndex: 10,
  },
  select: {
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  mapPlaceholder: {
    height: "400px",
    backgroundColor: "#e9ecef",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    marginTop: "20px",
  },
  chatContainer: {
    display: "flex",
    height: "500px",
    gap: "20px",
    marginTop: "20px",
  },
  chatSidebar: {
    flex: "0 0 300px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "15px",
    overflowY: "auto",
    border: "1px solid #e5e7eb",
  },
  conversationItem: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    cursor: "pointer",
    position: "relative",
  },
  lastMessage: {
    fontSize: "12px",
    color: "#6c757d",
    margin: "5px 0 0 0",
  },
  unreadBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "#dc3545",
    color: "#fff",
    borderRadius: "50%",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "bold",
  },
  chatMain: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
  },
  chatHeader: {
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  chatMessages: {
    flex: "1",
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  adminMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "12px",
    maxWidth: "70%",
  },
  customerMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e9ecef",
    color: "#000",
    padding: "10px 15px",
    borderRadius: "12px",
    maxWidth: "70%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f7ff",
    color: "#1f2937",
    padding: "10px 15px",
    borderRadius: "12px",
    maxWidth: "70%",
    border: "1px solid #bfdbfe",
  },
  chatInput: {
    display: "flex",
    padding: "15px",
    borderTop: "1px solid #e5e7eb",
    gap: "10px",
  },
  input: {
    flex: "1",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },
  chatPlaceholder: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6c757d",
  },
};

export default AdminDashboard;
