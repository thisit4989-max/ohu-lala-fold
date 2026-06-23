"use client";

import React, { useState, useEffect, useRef } from "react";

interface DBMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp?: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 비밀번호 로그인 핸들러
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin1234") {
      setIsAuthorized(true);
      setErrorMsg("");
    } else {
      setErrorMsg("비밀번호가 올바르지 않습니다.");
    }
  };

  // 대화 스크롤 제어
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAuthorized]);

  // 로그인 성공 후 2초 간격 폴링
  useEffect(() => {
    if (!isAuthorized) return;

    // 즉시 가져오기 실행
    fetchMessages();

    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat-poll/");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      }
    } catch (e) {
      console.error("Failed to poll messages for admin", e);
    }
  };

  // 관리자 답장 전송 핸들러
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const replyText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // 화면에 관리자 말풍선 즉시 가배치
    const tempId = `admin-temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, sender: "admin", text: replyText },
    ]);

    try {
      const res = await fetch("/api/chat-human/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: replyText, sender: "admin" }), // admin으로 지정 전송
      });

      if (!res.ok) {
        throw new Error("답장 전송에 실패했습니다.");
      }

      // 전송 성공 시 동기화 갱신
      fetchMessages();
    } catch (error) {
      alert("답장을 보내는 도중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 화면
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#f0f0f2] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h2 className="text-xl font-bold text-gray-800 mt-3">관리자 실시간 상담 로그인</h2>
            <p className="text-xs text-gray-400 mt-1">상담 시스템 관리를 위해 비밀번호를 입력하세요.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-center"
                autoFocus
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-red-500 text-center font-medium">{errorMsg}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md transition-all focus:outline-none"
            >
              인증 및 접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 관리자 대화 콘솔 화면
  return (
    <div className="min-h-screen bg-[#f0f0f2] p-4 sm:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-2xl h-[calc(100vh-64px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
              👤
            </div>
            <div>
              <h3 className="font-bold text-sm">관리자 상담 콘솔</h3>
              <p className="text-xs text-emerald-100">실시간 방문자 메시지 대기 상태</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthorized(false)}
            className="text-xs font-semibold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            로그아웃 🚪
          </button>
        </div>

        {/* 대화 목록 화면 */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center flex-col text-gray-400 space-y-2">
              <span className="text-3xl">💬</span>
              <p className="text-xs font-medium">수신된 방문자 질문 메시지가 없습니다.</p>
            </div>
          ) : (
            messages.map((msg) => {
              // 요구사항: sender: "user"(방문자)는 오른쪽, sender: "admin"(관리자)는 왼쪽에 표시
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col max-w-[80%]">
                    {/* 발신 주체 표기 */}
                    <span className={`text-[10px] font-semibold text-gray-400 mb-1 px-1 ${isUser ? "text-right" : "text-left"}`}>
                      {isUser ? "방문자 (User)" : "나 (Admin)"}
                    </span>
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                        isUser
                          ? "bg-emerald-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 답장 입력 폼 */}
        <form
          onSubmit={handleSendReply}
          className="border-t border-gray-200 p-4 bg-white flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="답장을 입력하고 Enter를 누르거나 전송 버튼을 클릭하세요..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-all focus:outline-none flex items-center justify-center shadow-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
