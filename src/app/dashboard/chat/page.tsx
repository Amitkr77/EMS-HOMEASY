"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageCircle, Users } from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

type Employee = {
  _id: string;
  name: string;
  email: string;
};

type Message = {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string | Date;
};

export default function HomeasyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [text, setText] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const handleSelectUser = (id: string) => {
    setReceiverId(id);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (employees.length > 0) {
      setCurrentUserId(employees[0]._id); // or logged-in user
    }
  }, [employees]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEmployees = async (): Promise<void> => {
      try {
        const res = await fetch("/api/employees", {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data: Employee[] = await res.json();
        setEmployees(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err.message);
        }
      }
    };

    fetchEmployees();

    return () => controller.abort();
  }, []);

  // Socket listener
  useEffect(() => {
    socket.on("receive-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const sendMessage = async () => {
    if (!text.trim() || !receiverId) return;

    const msg = {
      senderId: currentUserId,
      receiverId,
      message: text.trim(),
      timestamp: new Date(),
    };

    try {
      // Save to database
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });

      // Emit via socket
      socket.emit("send-message", msg);

      // Add to local state
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-3xl flex items-center justify-center text-white">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Team Chat
            </h1>
            <p className="text-slate-600 mt-1">
              Communicate with your Homeasy team in real-time
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - Employee List */}
          <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-slate-500" />
              <h2 className="font-semibold text-slate-900">Team Members</h2>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {employees?.map((emp) => (
                <div
                  key={emp._id}
                  onClick={() => handleSelectUser(emp._id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                    receiverId === emp._id
                      ? "bg-teal-50 border border-teal-200"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-[680px]">
            {/* Chat Header */}
            <div className="border-b border-slate-100 px-8 py-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {receiverId
                    ? employees.find((e) => e._id === receiverId)?.name ||
                      "Select a team member"
                    : "Team Chat"}
                </p>
                <p className="text-xs text-slate-500">Real-time messaging</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-40" />
                    <p>No messages yet</p>
                    <p className="text-sm">
                      Select a team member and start chatting
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-5 py-3 rounded-3xl ${
                          msg.senderId === currentUserId
                            ? "bg-teal-600 text-white rounded-br-none"
                            : "bg-white border border-slate-200 rounded-bl-none"
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed">
                          {msg.message}
                        </p>
                        <p className="text-[10px] mt-2 opacity-70 text-right">
                          {new Date(
                            msg.timestamp || Date.now(),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:border-teal-500 transition-all"
                  disabled={!receiverId}
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || !receiverId}
                  className="px-8 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-3xl transition-all flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
