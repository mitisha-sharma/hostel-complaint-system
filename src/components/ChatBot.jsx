// src/components/ChatBot.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { complaints, maintenanceStaff } from "../data/dummyData";
import { useNavigate } from "react-router-dom";

function ChatBot() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // ── Login page greeting (no user logged in) ──
      if (!currentUser) {
        addBotMessage(
          `👋 Welcome to the Hostel Complaint Management System!\n\nI can help you:\n• 🔐 Get logged in\n• ℹ️ Understand how the system works\n• 🧭 Navigate to the right portal\n\nNeed the test credentials to get started?`
        );
        return;
      }

      // ── Role-specific greetings ──
      const greetings = {
        student: `Hi ${currentUser.name}! 👋 I'm your Hostel Assistant. I can help you:\n• 📝 Raise a new complaint by just describing your issue\n• 📊 Check status of your complaints\n• ❓ Answer questions about the complaint process\n\nWhat can I help you with today?`,
        admin: `Hello ${currentUser.name}! 👋 I'm your Admin Assistant. I can help you:\n• 📋 Summarize all complaints and their statuses\n• 👷 Check staff workload and performance\n• 🔍 Find specific complaints\n• 📊 Give you analytics insights\n\nWhat would you like to know?`,
        maintenance: `Hi ${currentUser.name}! 👋 I'm your Work Assistant. I can help you:\n• 📋 List your assigned complaints\n• ✅ Update complaint status through chat\n• 📊 Show your performance stats\n\nWhat do you need help with?`,
      };
      addBotMessage(greetings[currentUser.role] || "Hello! How can I help you?");
    }
  }, [isOpen]);

  // ── Message helpers ────────────────────────────────────────────

  const addBotMessage = (text, actions = null) => {
    setMessages((prev) => [...prev, {
      role: "assistant", content: text,
      actions, id: Date.now() + Math.random(),
    }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, {
      role: "user", content: text, id: Date.now() + Math.random(),
    }]);
  };

  // ── Build system prompt ────────────────────────────────────────

  const buildSystemPrompt = () => {
    // Guest prompt for login page
    if (!currentUser) {
      return `You are a helpful assistant for a Hostel Complaint Management System.
You help visitors understand what the system does and how to log in.
The system has 3 roles: Student, Admin/Warden, and Maintenance Staff.

Test credentials:
- Student: student@hostel.com / student123
- Admin: admin@hostel.com / admin123
- Staff: staff@hostel.com / staff123

The complaint lifecycle is: Raised → Assigned → In Progress → Resolved → Closed
Complaint categories: Electrical, Plumbing, Carpentry, Cleaning, Internet, Other
Priorities: High, Medium, Low

Be friendly, concise, and help them understand the system or get logged in.
Use emojis naturally. Keep responses under 100 words unless more detail is needed.`;
    }

    const myComplaints = currentUser.role === "student"
      ? complaints.filter((c) => c.student_id === currentUser.id)
      : currentUser.role === "maintenance"
      ? complaints.filter((c) => c.staff_id === currentUser.id)
      : complaints;

    const complaintsJson = JSON.stringify(myComplaints, null, 2);
    const staffJson = JSON.stringify(maintenanceStaff, null, 2);

    const baseContext = `
You are a smart, friendly hostel complaint management assistant.
You are talking to: ${currentUser.name}
Their role: ${currentUser.role}
${currentUser.room_no ? `Their room: ${currentUser.room_no}` : ""}
${currentUser.department ? `Their department: ${currentUser.department}` : ""}
Today's date: ${new Date().toISOString().split("T")[0]}

CURRENT COMPLAINT DATA:
${complaintsJson}

${currentUser.role === "admin" ? `MAINTENANCE STAFF LIST:\n${staffJson}` : ""}

COMPLAINT LIFECYCLE: Raised → Assigned → In Progress → Resolved → Closed (also: Rejected)
CATEGORIES: Electrical, Plumbing, Carpentry, Cleaning, Internet, Other
PRIORITIES: High, Medium, Low

YOUR PERSONALITY:
- Friendly, helpful, concise
- Use emojis naturally but don't overdo it
- Give short answers unless detail is needed
- Always address the user by first name
- Be proactive — suggest next steps
- Keep responses under 150 words unless a detailed report is needed

IMPORTANT RULES:
- Only discuss hostel complaint related topics
- If asked something unrelated, politely redirect
- Format lists clearly with bullet points
`;

    const roleInstructions = {
      student: `
STUDENT CAPABILITIES:
1. RAISE COMPLAINT: If user describes a problem, extract category, priority, description.
   Respond with "I've drafted this complaint for you:" followed by the details.
   Ask "Should I take you to the form with this pre-filled?"
   End your message with exactly this JSON on a new line:
   ACTION:{"type":"prefill_complaint","category":"X","priority":"Y","description":"Z"}

2. CHECK STATUS: Summarize their complaints from the data with current statuses.

3. COMPLAINT TIPS: Advise on how to write better complaints.

4. ESCALATION: If complaint is taking too long, empathize and advise contacting warden.
`,
      admin: `
ADMIN CAPABILITIES:
1. COMPLAINT SUMMARY: Summarize all complaints, counts by status/category/priority
2. STAFF ANALYSIS: Tell admin about staff workload, who has most/least complaints
3. FIND COMPLAINTS: Help find specific complaints by ID, category, status, student
4. ASSIGNMENT ADVICE: Suggest which staff to assign based on department matching category
5. INSIGHTS: Point out patterns like rooms with most complaints
`,
      maintenance: `
MAINTENANCE CAPABILITIES:
1. LIST TASKS: Show all assigned complaints clearly
2. STATUS HELP: Guide user on updating complaint status
3. PERFORMANCE: Tell user their resolved vs pending count and completion rate
4. PRIORITY ALERT: Point out high priority complaints that need urgent attention
`,
    };

    return baseContext + (roleInstructions[currentUser.role] || "");
  };

  // ── Parse action from AI response ─────────────────────────────

  const parseAndExecuteAction = (text) => {
    const actionMatch = text.match(/ACTION:(\{.*?\})/s);
    if (!actionMatch) return { cleanText: text, actionData: null };
    try {
      const actionData = JSON.parse(actionMatch[1]);
      const cleanText = text.replace(/ACTION:\{.*?\}/s, "").trim();
      return { cleanText, actionData };
    } catch {
      return { cleanText: text, actionData: null };
    }
  };

  // ── Send message to Claude API ─────────────────────────────────

  const sendMessage = async () => {
    const userText = input.trim();
    if (!userText || isTyping) return;

    setInput("");
    addUserMessage(userText);
    setIsTyping(true);

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: [...history, { role: "user", content: userText }],
        }),
      });

      const data = await response.json();
      const rawText = data.content?.[0]?.text ||
        "Sorry, I couldn't process that. Please try again.";

      const { cleanText, actionData } = parseAndExecuteAction(rawText);

      let actionButtons = null;
      if (actionData?.type === "prefill_complaint") {
        actionButtons = [
          {
            label: "📝 Open Complaint Form →",
            onClick: () => {
              navigate("/student/raise", { state: actionData });
              setIsOpen(false);
            },
            style: "primary",
          },
        ];
      } else if (actionData?.type === "navigate") {
        navigate(actionData.path);
      }

      setIsTyping(false);
      addBotMessage(cleanText, actionButtons);

    } catch (err) {
      setIsTyping(false);
      addBotMessage("⚠️ I'm having trouble connecting right now. Please try again in a moment.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Quick suggestion chips ─────────────────────────────────────

  const quickSuggestions = {
    guest: [
      "What is this system? 🏠",
      "Show me test credentials 🔑",
      "How does it work? ℹ️",
      "Who can use this? 👥",
    ],
    student: [
      "My fan is not working 🌀",
      "Check my complaint status 📊",
      "There's a water leak 🚿",
      "Internet is very slow 📶",
    ],
    admin: [
      "Summarize all complaints 📋",
      "Which staff is busiest? 👷",
      "Show high priority issues 🚨",
      "Any patterns this week? 📊",
    ],
    maintenance: [
      "Show my tasks 📋",
      "What's my completion rate? 📊",
      "Any urgent complaints? 🚨",
      "How many resolved? ✅",
    ],
  };

  const suggestionKey = !currentUser ? "guest" : currentUser.role;
  const suggestions = quickSuggestions[suggestionKey] || [];

  const roleColors = {
    student: "#4f46e5",
    admin: "#dc2626",
    maintenance: "#16a34a",
  };
  const accentColor = currentUser
    ? (roleColors[currentUser.role] || "#4f46e5")
    : "#1e3a5f"; // dark blue for guest/login page

  return (
    <>
      {/* ── Floating Chat Bubble ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ ...chatStyles.bubble, backgroundColor: accentColor }}
        >
          <span style={{ fontSize: "26px" }}>💬</span>
          <span style={chatStyles.bubbleLabel}>AI Assistant</span>
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div style={chatStyles.window}>

          {/* Header */}
          <div style={{ ...chatStyles.header, backgroundColor: accentColor }}>
            <div style={chatStyles.headerLeft}>
              <div style={chatStyles.botAvatar}>🤖</div>
              <div>
                <p style={chatStyles.headerTitle}>Hostel AI Assistant</p>
                <p style={chatStyles.headerStatus}>
                  <span style={chatStyles.onlineDot} />
                  Online · Powered by Claude
                </p>
              </div>
            </div>
            <div style={chatStyles.headerActions}>
              <button
                style={chatStyles.headerBtn}
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? "▲" : "▼"}
              </button>
              <button
                style={chatStyles.headerBtn}
                onClick={() => {
                  setIsOpen(false);
                  setMessages([]);
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div style={chatStyles.messages}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      ...chatStyles.messageRow,
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    {msg.role === "assistant" && (
                      <div style={chatStyles.botAvatarSmall}>🤖</div>
                    )}
                    <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{
                        ...chatStyles.bubble2,
                        ...(msg.role === "user"
                          ? { ...chatStyles.userBubble, backgroundColor: accentColor }
                          : chatStyles.botBubble),
                      }}>
                        {msg.content.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < msg.content.split("\n").length - 1 && <br />}
                          </span>
                        ))}
                      </div>
                      {msg.actions && (
                        <div style={chatStyles.actionRow}>
                          {msg.actions.map((action, i) => (
                            <button
                              key={i}
                              onClick={action.onClick}
                              style={{
                                ...chatStyles.actionBtn,
                                backgroundColor: action.style === "primary" ? accentColor : "white",
                                color: action.style === "primary" ? "white" : accentColor,
                                border: `2px solid ${accentColor}`,
                              }}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div style={{ ...chatStyles.messageRow, justifyContent: "flex-start" }}>
                    <div style={chatStyles.botAvatarSmall}>🤖</div>
                    <div style={chatStyles.typingIndicator}>
                      <span style={chatStyles.dot} />
                      <span style={{ ...chatStyles.dot, animationDelay: "0.2s" }} />
                      <span style={{ ...chatStyles.dot, animationDelay: "0.4s" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion chips — show only before first user message */}
              {messages.filter((m) => m.role === "user").length === 0 && (
                <div style={chatStyles.suggestions}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      style={chatStyles.chip}
                      onClick={() => {
                        setInput(s.replace(/[^\w\s'?.,!]/g, "").trim());
                        inputRef.current?.focus();
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={chatStyles.inputRow}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Enter to send)"
                  rows={1}
                  style={chatStyles.input}
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={isTyping || !input.trim()}
                  style={{
                    ...chatStyles.sendBtn,
                    backgroundColor: input.trim() && !isTyping ? accentColor : "#e2e8f0",
                    cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                  }}
                >
                  {isTyping ? "..." : "➤"}
                </button>
              </div>

              <p style={chatStyles.footer}>
                Powered by Claude · Press Enter to send
              </p>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes bubblePop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const chatStyles = {
  bubble: {
    position: "fixed", bottom: "28px", right: "28px",
    color: "white", border: "none", borderRadius: "50px",
    padding: "14px 22px", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "10px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    fontSize: "15px", fontWeight: "700", zIndex: 1000,
    animation: "bubblePop 0.3s ease",
  },
  bubbleLabel: { fontSize: "14px", fontWeight: "700" },
  window: {
    position: "fixed", bottom: "28px", right: "28px",
    width: "380px", maxHeight: "580px",
    backgroundColor: "white", borderRadius: "20px",
    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
    display: "flex", flexDirection: "column",
    zIndex: 1000, overflow: "hidden",
    animation: "bubblePop 0.25s ease",
  },
  header: {
    padding: "14px 16px", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  botAvatar: {
    width: "38px", height: "38px", borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "20px",
  },
  headerTitle: { color: "white", fontWeight: "800", fontSize: "14px", margin: 0 },
  headerStatus: {
    color: "rgba(255,255,255,0.8)", fontSize: "11px",
    margin: 0, display: "flex", alignItems: "center", gap: "4px",
  },
  onlineDot: {
    width: "6px", height: "6px", borderRadius: "50%",
    backgroundColor: "#4ade80", display: "inline-block",
  },
  headerActions: { display: "flex", gap: "6px" },
  headerBtn: {
    background: "rgba(255,255,255,0.2)", border: "none",
    color: "white", borderRadius: "6px", padding: "4px 8px",
    cursor: "pointer", fontSize: "13px", fontWeight: "700",
  },
  messages: {
    flex: 1, overflowY: "auto", padding: "16px",
    display: "flex", flexDirection: "column", gap: "12px",
    minHeight: "280px", maxHeight: "340px",
  },
  messageRow: { display: "flex", alignItems: "flex-end", gap: "8px" },
  botAvatarSmall: {
    width: "28px", height: "28px", borderRadius: "50%",
    backgroundColor: "#f1f5f9", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: "14px", flexShrink: 0,
  },
  bubble2: {
    padding: "10px 14px", borderRadius: "16px",
    fontSize: "13px", lineHeight: "1.6",
    animation: "bubblePop 0.2s ease",
  },
  userBubble: { color: "white", borderRadius: "16px 16px 4px 16px" },
  botBubble: {
    backgroundColor: "#f1f5f9", color: "#1e293b",
    borderRadius: "16px 16px 16px 4px",
  },
  actionRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  actionBtn: {
    padding: "8px 14px", borderRadius: "8px",
    fontSize: "12px", fontWeight: "700", cursor: "pointer",
  },
  typingIndicator: {
    backgroundColor: "#f1f5f9", padding: "12px 16px",
    borderRadius: "16px 16px 16px 4px",
    display: "flex", gap: "4px", alignItems: "center",
  },
  dot: {
    width: "7px", height: "7px", borderRadius: "50%",
    backgroundColor: "#94a3b8", display: "inline-block",
    animation: "bounce 1s infinite",
  },
  suggestions: {
    padding: "8px 12px", display: "flex",
    gap: "6px", flexWrap: "wrap", borderTop: "1px solid #f1f5f9",
  },
  chip: {
    padding: "6px 12px", borderRadius: "20px",
    border: "1.5px solid #e2e8f0", backgroundColor: "white",
    fontSize: "12px", color: "#475569", cursor: "pointer", fontWeight: "500",
  },
  inputRow: {
    padding: "10px 12px", display: "flex",
    gap: "8px", borderTop: "1px solid #f1f5f9",
    alignItems: "flex-end",
  },
  input: {
    flex: 1, padding: "10px 14px", borderRadius: "12px",
    border: "1.5px solid #e2e8f0", fontSize: "13px",
    outline: "none", resize: "none", fontFamily: "inherit",
    backgroundColor: "#f8fafc", color: "#1e293b",
    maxHeight: "80px",
  },
  sendBtn: {
    width: "40px", height: "40px", borderRadius: "10px",
    border: "none", color: "white", fontSize: "16px",
    flexShrink: 0, display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  footer: {
    textAlign: "center", fontSize: "10px",
    color: "#94a3b8", padding: "6px",
    borderTop: "1px solid #f1f5f9",
  },
};

export default ChatBot;