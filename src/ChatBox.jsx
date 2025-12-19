import React, { useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "./firebase";
import VoiceAssistant from "./VoiceAssistant";
import SmartSuggestions from "./SmartSuggestions";
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
import { getEnhancedNLU } from "./services/enhancedNLU.js";
import { getAutonomousActionExecutor } from "./services/autonomousActionExecutor.js";
import { getCustomerContextService } from "./services/customerContextService.js";
import EntityExtractor from "./services/entityExtractor.js";
import SentimentAnalyzer from "./services/sentimentAnalyzer.js";
import AdvancedMemory from "./services/advancedMemory.js";

/*
Firestore data model
- threads/{uid}: { userId, agentRequested: boolean, updatedAt }
- threads/{uid}/messages/{messageId}: {
    from: 'customer' | 'admin' | 'bot',
    text: string,
    ts: Timestamp,
    status: 'sent' | 'delivered' | 'read'
  }

Behavior
- Customer can send messages and request a human agent (sets agentRequested=true)
- When customer receives admin/bot messages, client marks them as delivered/read
- Status for customer-sent messages gets updated by the admin console
*/

function StatusTick({ status }) {
  // Minimal status indicator
  if (!status || status === "sent") return <span title="Sent">✓</span>;
  if (status === "delivered") return <span title="Delivered">✓✓</span>;
  if (status === "read") return <span title="Read">✓✓</span>;
  return null;
}

function ChatBox() {
  const user = auth.currentUser;
  const uid = user?.uid || "anonymous"; // requires login for per-user thread
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [agentRequested, setAgentRequested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [botResponse, setBotResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [autonomousActions, setAutonomousActions] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [welcomeGreeting, setWelcomeGreeting] = useState("");
  const [trackingSuggestions, setTrackingSuggestions] = useState([]);
  const [sessionGreetingShown, setSessionGreetingShown] = useState(false);
  const [showSuggestionsAutoplay, setShowSuggestionsAutoplay] = useState(false);
  const listRef = useRef(null);
  
  // Advanced Memory and Analytics
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const [currentSentiment, setCurrentSentiment] = useState('neutral');
  
  // Enhanced NLU, Action Executor, and Customer Context
  const enhancedNLU = useMemo(() => getEnhancedNLU(), []);
  const actionExecutor = useMemo(() => getAutonomousActionExecutor(), []);
  const customerContext = useMemo(() => getCustomerContextService(), []);
  const entityExtractor = useMemo(() => new EntityExtractor(), []);
  const sentimentAnalyzer = useMemo(() => new SentimentAnalyzer(), []);
  const advancedMemory = useMemo(() => new AdvancedMemory(auth), []);

  const threadRef = useMemo(() => doc(db, "threads", uid), [db, uid]);
  const messagesCol = useMemo(
    () => collection(db, "threads", uid, "messages"),
    [db, uid]
  );

  useEffect(() => {
    console.log("✅ ChatBox mounted, VoiceAssistant should be visible");
    
    const loadContext = async () => {
      if (uid && uid !== "anonymous") {
        try {
          await enhancedNLU.loadConversationFromStorage(uid);
          
          await customerContext.initializeContext();
          const name = customerContext.getCustomerName();
          setCustomerName(name);
          
          const greeting = customerContext.getCustomerGreeting();
          setWelcomeGreeting(greeting);
          
          const suggestions = customerContext.getTrackingSuggestions();
          setTrackingSuggestions(suggestions);
          
          await advancedMemory.initialize(uid, auth.currentUser?.email);
          console.log(`✅ Advanced memory initialized for ${name}`);
          
          console.log(`✅ Customer context loaded for ${name}`);
        } catch (error) {
          console.warn('Error loading context:', error);
        }
      }
    };
    loadContext();
  }, [uid, enhancedNLU, customerContext, advancedMemory]);

  // Listen for autonomous action events
  useEffect(() => {
    const handleAutonomousEvent = (event) => {
      const { type, detail } = event;
      console.log(`🤖 Autonomous event: ${type}`, detail);
      
      // Add bot message for autonomous actions
      if (type === 'swiftbot_autonomous_tracking_started') {
        const botMessage = `🔍 **Autonomous Tracking Started**\n\nTracking ID: ${detail.trackingId}\nSource: ${detail.source}\n\nI'm navigating to tracking page and filling in details for you...`;
        
        addDoc(messagesCol, {
          from: "bot",
          text: botMessage,
          ts: serverTimestamp(),
          status: "sent",
          metadata: {
            autonomousAction: true,
            trackingId: detail.trackingId,
            eventType: type
          }
        });
      }
    };

    document.addEventListener('swiftbot_autonomous_tracking_started', handleAutonomousEvent);
    document.addEventListener('swiftbot_contextual_message', handleAutonomousEvent);
    
    return () => {
      document.removeEventListener('swiftbot_autonomous_tracking_started', handleAutonomousEvent);
      document.removeEventListener('swiftbot_contextual_message', handleAutonomousEvent);
    };
  }, [messagesCol]);

  // Ensure thread doc exists and subscribe to messages
  useEffect(() => {
    let unsub = () => {};
    let mounted = true;

    (async () => {
      try {
        // Ensure thread doc exists
        const snap = await getDoc(threadRef);
        if (!snap.exists()) {
          await setDoc(threadRef, {
            userId: uid,
            agentRequested: false,
            updatedAt: serverTimestamp(),
          });
        } else {
          const data = snap.data();
          if (mounted) setAgentRequested(!!data.agentRequested);
        }

        // Subscribe to messages ordered by timestamp
        const q = query(messagesCol, orderBy("ts", "asc"));
        unsub = onSnapshot(q, async (snapshot) => {
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setMessages(docs);

          // Auto-scroll to latest
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }

          // Mark incoming admin/bot messages as delivered then read
          const updates = [];
          for (const d of snapshot.docs) {
            const m = d.data();
            if (m.from !== "customer") {
              if (m.status === "sent") {
                updates.push(
                  updateDoc(doc(messagesCol, d.id), { status: "delivered" })
                );
              }
              // Consider them read when chat is open and message is visible
              if (m.status !== "read") {
                updates.push(
                  updateDoc(doc(messagesCol, d.id), { status: "read" })
                );
              }
            }
          }
          if (updates.length) {
            // Execute sequentially to avoid contention
            for (const u of updates) {
              try {
                await u;
              } catch (e) {
                // best-effort
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
  }, [threadRef, messagesCol, uid]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setIsProcessing(true);

    // Trigger autoplay suggestions on first customer message
    if (!sessionGreetingShown) {
      setShowSuggestionsAutoplay(true);
      // Stop autoplay after 3 full cycles (approx 25 seconds)
      setTimeout(() => setShowSuggestionsAutoplay(false), 25000);
    }

    try {
      // Add customer message
      await addDoc(messagesCol, {
        from: "customer",
        text,
        ts: serverTimestamp(),
        status: "sent",
      });
      await updateDoc(threadRef, { updatedAt: serverTimestamp() });

      // Mark greeting as shown on first message
      if (!sessionGreetingShown) {
        setSessionGreetingShown(true);
      }

      // Enhanced NLU Processing
      const nluResult = await enhancedNLU.processMessage(text, uid);
      console.log("🧠 Enhanced NLU Result:", nluResult);

      // Entity Extraction
      const entities = entityExtractor.extractAllEntities(text);
      console.log("🏷️ Extracted Entities:", entities);

      // Sentiment Analysis
      const sentiment = sentimentAnalyzer.analyzeSentiment(text);
      setCurrentSentiment(sentiment.primary);
      setSentimentHistory([...sentimentHistory, sentiment]);
      console.log("😊 Sentiment Analysis:", sentiment);

      // Record interaction to advanced memory
      try {
        const session = await customerContext.getSessionId?.();
        if (session && auth.currentUser) {
          await advancedMemory.recordInteraction(
            session,
            { text, intent: nluResult.intent, id: Date.now() },
            entities,
            sentiment
          );
          
          await advancedMemory.recordSentiment(
            auth.currentUser.uid,
            session,
            Date.now().toString(),
            {
              ...sentiment,
              messageContent: text,
              intent: nluResult.intent
            }
          );
          
          await advancedMemory.enrichUserProfile(auth.currentUser.uid, entities);
          console.log("✅ Advanced memory recorded");
        }
      } catch (error) {
        console.warn('Failed to record in advanced memory:', error);
      }

      // Save tracking history if tracking IDs are found
      if (nluResult.entities?.trackingIds && nluResult.entities.trackingIds.length > 0) {
        for (const trackingId of nluResult.entities.trackingIds) {
          try {
            await customerContext.updateTrackingContext(trackingId, {
              requestedVia: 'chatbot',
              timestamp: new Date()
            });
            console.log(`✅ Tracking history saved for ${trackingId}`);
          } catch (error) {
            console.warn(`Failed to save tracking history for ${trackingId}:`, error);
          }
        }
      }

      // Execute autonomous actions if detected
      if (nluResult.actions && nluResult.actions.length > 0) {
        console.log("🤖 Executing autonomous actions:", nluResult.actions);
        
        const actionResult = await actionExecutor.executeActions(nluResult.actions, uid);
        setAutonomousActions(actionResult.results);
        
        // Show autonomous action feedback
        if (actionResult.executed) {
          const successActions = actionResult.results.filter(r => r.success);
          const failedActions = actionResult.results.filter(r => !r.success);
          
          if (successActions.length > 0) {
            const actionMessages = successActions.map(a => a.message).join('\n');
            await addDoc(messagesCol, {
              from: "bot",
              text: `🤖 **Autonomous Actions Executed**\n\n${actionMessages}`,
              ts: serverTimestamp(),
              status: "sent",
              metadata: {
                autonomousActions: true,
                results: actionResult.results
              }
            });
          }
          
          if (failedActions.length > 0) {
            const errorMessages = failedActions.map(a => a.error).join('\n');
            await addDoc(messagesCol, {
              from: "bot",
              text: `⚠️ **Some actions failed**\n\n${errorMessages}\n\nYou can try again or contact support.`,
              ts: serverTimestamp(),
              status: "sent",
              metadata: {
                autonomousActions: true,
                errors: failedActions
              }
            });
          }
        }
      }

      // Handle specific intents with enhanced responses
      let botReply = null;

      // Autonomous tracking handled
      if (nluResult.intent.includes('track') && nluResult.entities.trackingIds.length > 0) {
        // Autonomous tracking already handled above
        botReply = `🎯 **Package Tracking Initiated**\n\nI found tracking ID: ${nluResult.entities.trackingIds[0]}\n\nI'm automatically navigating to the tracking page and filling in the details for you.`;
      } else if (nluResult.intent.includes('track')) {
        // General tracking inquiry - offer suggestions from history
        const suggestions = trackingSuggestions.length > 0 
          ? trackingSuggestions.map(s => `• ${s.trackingId} - ${s.status}`).join('\n')
          : '';
        
        if (suggestions) {
          botReply = `📦 **Recent Packages**\n\n${suggestions}\n\nWould you like me to track any of these? Just say the tracking ID or I can navigate you to the tracking page.`;
        } else {
          botReply = "I can help you track your package! Please provide your tracking ID, or I can navigate you to the tracking page.";
        }
        
        // Add navigation action
        const navAction = await actionExecutor.executeActions([{
          type: 'NAVIGATE_TO_TRACKING',
          route: '/tracking',
          highlightSection: true,
          autoFocus: true
        }], uid);
      } else if (nluResult.intent.includes('status_inquiry')) {
        const suggestions = trackingSuggestions.length > 0 
          ? trackingSuggestions.map(s => `• ${s.trackingId}`).join('\n')
          : '';
        
        if (suggestions) {
          botReply = `📦 **Recent Packages**\n\n${suggestions}\n\nWhich one would you like to check the status for?`;
        } else {
          botReply = "I can check the status of your package. Please provide your tracking ID or tell me which package you're asking about.";
        }
      } else if (nluResult.intent.includes('location_inquiry')) {
        botReply = "I can help you find your package location. Please provide your tracking ID so I can show you exactly where it is.";
      } else if (nluResult.intent.includes('delivery_time_inquiry')) {
        botReply = "I can check when your package will arrive. Please provide your tracking ID and I'll get you the latest delivery estimate.";
      }

      // Fallback to traditional tracking detection
      if (!botReply) {
        const lower = text.toLowerCase();
        const trackingPhrases = [
          "tracking",
          "track my package",
          "where is my package",
          "package status",
          "delivery status",
          "is my package",
          "when will my package",
        ];

        const trackingDetected = trackingPhrases.some((p) => lower.includes(p));

        if (trackingDetected) {
          try {
            // Try to fetch tracking info by customer name
            const response = await fetch(
              `http://localhost:5000/api/bot/tracking-suggestions?customerName=${encodeURIComponent(
                user?.displayName || "Customer"
              )}`
            );

            if (response.ok) {
              const trackingData = await response.json();

              if (Array.isArray(trackingData) && trackingData.length > 0) {
                const tracking = trackingData[0];
                botReply = `📦 **Your Package Tracking**\n\n🆔 Tracking ID: ${tracking.trackingId}\n📍 Status: ${tracking.status}\n📧 Recipient: ${tracking.user.fullName}\n🕐 Last Updated: ${new Date(
                  tracking.updatedAt
                ).toLocaleString()}\n\nLocation: ${tracking.location.lat.toFixed(
                  4
                )}, ${tracking.location.lng.toFixed(4)}`;
              }
            }
          } catch (e) {
            console.warn("Tracking lookup failed:", e);
          }
        }
      }

      // Intent detection to auto-escalate to admin
      if (!botReply) {
        const lower = text.toLowerCase();
        const escalatePhrases = [
          "speak with agent",
          "speak with human",
          "speak to agent",
          "talk to agent",
          "talk to human",
          "talk with human",
          "human agent",
          "live agent",
        ];

        if (escalatePhrases.some((p) => lower.includes(p))) {
          try {
            await setDoc(
              threadRef,
              { agentRequested: true, updatedAt: serverTimestamp() },
              { merge: true }
            );
            setAgentRequested(true);
            botReply = "🚀 I've connected you with our support team. An agent will be with you shortly!";
          } catch (e) {
            console.warn("auto-escalation setDoc failed", e);
          }
        }
      }

      // Greeting detection with personalization
      if (!botReply) {
        const lower = text.toLowerCase().trim();
        const greetingPhrases = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
        const isGreeting = greetingPhrases.some(p => lower === p || lower.startsWith(p + ' '));
        
        if (isGreeting) {
          const userName = user?.displayName || customerName || 'there';
          botReply = `Hello ${userName}! 👋 How can I help you with your deliveries today?`;
        }
      }

      // Sentiment-based proactive messaging
      if (!botReply && sentimentAnalyzer.shouldShowProactive(sentiment)) {
        const proactiveMsg = sentimentAnalyzer.generateProactiveMessage(sentiment);
        if (proactiveMsg) {
          botReply = proactiveMsg;
        }
      }

      // Check if escalation is needed based on sentiment
      if (sentimentAnalyzer.shouldEscalate(sentiment)) {
        console.log("🚨 HIGH SENTIMENT ESCALATION NEEDED");
        try {
          await setDoc(
            threadRef,
            { 
              agentRequested: true, 
              escalationReason: 'high_negative_sentiment',
              escalationSentiment: sentiment.primary,
              updatedAt: serverTimestamp() 
            },
            { merge: true }
          );
          setAgentRequested(true);
          if (!botReply) {
            botReply = "😟 I'm truly sorry you're experiencing issues. I'm connecting you with our support team immediately so we can resolve this right away.";
          }
        } catch (e) {
          console.warn("Escalation setDoc failed:", e);
        }
      }

      // General AI chat fallback
      if (!botReply) {
        try {
          console.log("🤖 Calling AI endpoint with message:", text);
          const userName = user?.displayName || customerName || 'Customer';
          const aiResponse = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text, userName }),
          });

          console.log("🤖 AI response status:", aiResponse.status);

          if (aiResponse.ok) {
            const data = await aiResponse.json();
            console.log("🤖 AI response data:", data);
            if (data.reply && data.reply.trim()) {
              botReply = data.reply;
            }
          } else {
            console.warn(
              "⚠️ AI endpoint returned non-ok status:",
              aiResponse.status
            );
            botReply =
              "I'm experiencing a temporary issue, but I'm here to help. What do you need?";
          }
        } catch (e) {
          console.error("❌ AI chat error:", e);
          botReply =
            "I'm temporarily unavailable. Would you like to connect with a human agent?";
        }
      }

      // Default response if nothing else matched
      if (!botReply) {
        botReply = "I'm here to help! How can I assist you today?";
      }

      // Send bot response
      console.log("📤 Sending bot response:", botReply);
      setBotResponse(botReply);
      await addDoc(messagesCol, {
        from: "bot",
        text: botReply,
        ts: serverTimestamp(),
        status: "sent",
      });

      // Save bot response to customer context (MongoDB)
      try {
        await customerContext.updateContextWithMessage(botReply, 'bot');
      } catch (error) {
        console.warn('Failed to save bot response context:', error);
      }

      // Save conversation context
      await enhancedNLU.saveConversationToStorage(uid);
    } catch (e) {
      console.error("sendMessage failed", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const onRequestAgent = async () => {
    try {
      await setDoc(
        threadRef,
        { agentRequested: true, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setAgentRequested(true);
    } catch (e) {
      console.error("request agent failed", e);
    }
  };

  const onSuggestionClick = (suggestedText) => {
    setInput(suggestedText);
    // Auto-focus the input field for better UX
    const inputElement = document.querySelector('.chatbox-input input');
    if (inputElement) {
      inputElement.focus();
    }
  };

  return (
    <div
      className="chatbox-container"
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: 8,
          borderBottom: "1px solid #eee",
        }}
      >
        <strong style={{ flex: 1 }}>Support Chat</strong>
        <button onClick={onRequestAgent} disabled={agentRequested}>
          {agentRequested ? "Agent Requested" : "Request Human Agent"}
        </button>
      </div>

      <div
        ref={listRef}
        className="chatbox-messages"
        style={{ height: 280, overflowY: "auto", padding: 12, flex: 1 }}
      >
        {loading && <p>Loading chat…</p>}
        {!loading && messages.length === 0 && !sessionGreetingShown && (
          <div>
            {welcomeGreeting && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    background: "#f0f8ff",
                    padding: "8px 12px",
                    borderRadius: 8,
                    maxWidth: "80%",
                  }}
                >
                  <strong>SwiftBot</strong>
                  <div style={{ fontStyle: "italic", marginTop: 4 }}>
                    {welcomeGreeting}
                  </div>
                </div>
              </div>
            )}
            {trackingSuggestions.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: "8px",
                  background: "#f5f5f5",
                  borderRadius: 6,
                }}
              >
                <strong style={{ fontSize: 12 }}>📦 Recent Packages:</strong>
                <div style={{ marginTop: 6 }}>
                  {trackingSuggestions.map((pkg, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 12,
                        padding: "4px 0",
                        color: "#333",
                      }}
                    >
                      • {pkg.trackingId} - {pkg.status}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
                  Just ask me to track any of these!
                </div>
              </div>
            )}
          </div>
        )}
        {messages.map((m) => {
          const hasLocation =
            m.meta &&
            m.meta.location &&
            typeof m.meta.location.lat === "number" &&
            typeof m.meta.location.lng === "number";
          const hasPkgStatus = m.meta && m.meta.pkgStatus;
          const mapsHref = hasLocation
            ? `https://www.google.com/maps?q=${m.meta.location.lat},${m.meta.location.lng}`
            : null;
          return (
            <div
              key={m.id}
              className={`chatbox-message ${
                m.from === "customer"
                  ? "chatbox-user"
                  : m.from === "admin"
                  ? "chatbox-admin"
                  : "chatbox-bot"
              }`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.from === "customer" ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
               <div
                 style={{
                   background:
                     m.from === "customer"
                       ? "#daf1ff"
                       : m.from === "admin"
                       ? "#f4f6ff"
                       : "#f9f9f9",
                   padding: "6px 10px",
                   borderRadius: 8,
                   maxWidth: "80%",
                   whiteSpace: "pre-wrap",
                   fontStyle: "italic",
                 }}
               >
                <strong>
                  {m.from === "customer"
                    ? "You"
                    : m.from === "admin"
                    ? "Admin"
                    : "SwiftBot"}
                </strong>
                <div style={{ fontStyle: "italic" }}>{m.text}</div>
                {hasPkgStatus && (
                  <div style={{ marginTop: 6 }}>
                    <span
                      style={{
                        fontSize: 12,
                        color: "#0c5460",
                        background: "#d1ecf1",
                        padding: "2px 6px",
                        borderRadius: 6,
                      }}
                    >
                      Status: {String(m.meta.pkgStatus).replace("_", " ")}
                    </span>
                  </div>
                )}
                {hasLocation && (
                  <div style={{ marginTop: 6 }}>
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12 }}
                    >
                      View package location on map
                    </a>
                  </div>
                )}
              </div>
              {m.from === "customer" && (
                <div
                  style={{ fontSize: 12, color: "#888", marginTop: 2 }}
                >
                  <StatusTick status={m.status} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          padding: 12,
          borderTop: "2px solid #06b6d4",
          backgroundColor: "#fff",
        }}
      >
        <p
          style={{
            margin: "0 0 10px 0",
            fontSize: 13,
            fontWeight: 600,
            color: "#0369a1",
          }}
        >
          🎤 Voice Commands:
        </p>
        <VoiceAssistant
          onSendMessage={(voiceText) => {
            if (voiceText.trim()) {
              addDoc(messagesCol, {
                from: "customer",
                text: voiceText.trim(),
                ts: serverTimestamp(),
                status: "sent",
              }).then(() => {
                updateDoc(threadRef, { updatedAt: serverTimestamp() });
              });
            }
          }}
          userId={uid}
        />
      </div>

      <SmartSuggestions 
        onSuggestionClick={onSuggestionClick}
        autoplay={showSuggestionsAutoplay}
      />

      <div
        className="chatbox-input"
        style={{
          display: "flex",
          gap: 8,
          padding: 8,
          borderTop: "1px solid #eee",
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
          style={{ flex: 1, padding: 8 }}
          disabled={isProcessing}
        />
        <button onClick={sendMessage} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
