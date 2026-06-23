"use client";

import React, { useState, useEffect, useRef } from "react";
import chatData from "../../chat-data.json";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "안녕하세요! '동네정보 지킴이'입니다. 우리동네 행사 및 혜택에 대해 궁금한 내용을 선택해주세요.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 대화창이 열리거나 메시지가 추가될 때 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleQuestionClick = (question: string, answer: string) => {
    // 1. 유저 질문 추가
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: question },
    ]);

    // 2. 약간의 딜레이(0.5초) 후 AI 답변 추가 (더 자연스러운 챗봇 느낌 제공)
    setTimeout(() => {
      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: "bot", text: answer },
      ]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 챗봇 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 focus:outline-none"
        aria-label="챗봇 상담창 열기"
      >
        {isOpen ? (
          // 닫기 아이콘
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          // 채팅 아이콘
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* 챗봇 채팅창 */}
      <div
        className={`fixed bottom-24 right-4 md:right-6 w-[calc(100vw-32px)] sm:w-[360px] h-[calc(100vh-120px)] md:h-[500px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* 채팅창 상단 헤더 */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                🏡
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-600 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm">동네정보 지킴이</h3>
              <p className="text-xs text-emerald-100">온라인</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
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
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* 채팅창 대화 내용 영역 */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 채팅창 하단 질문 리스트 */}
        <div className="p-4 bg-white border-t border-gray-150 flex flex-col space-y-2">
          <p className="text-xs font-semibold text-gray-400 mb-1">자주 묻는 질문</p>
          <div className="max-h-[140px] overflow-y-auto pr-1 space-y-2">
            {chatData.map((item, index) => {
              // 이미 유저가 보낸 질문이 아닌 질문만 하단에 띄워줍니다 (심플한 사용성 제공)
              return (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(item.question, item.answer)}
                  className="w-full text-left bg-gray-50 hover:bg-blue-50 hover:text-blue-700 text-gray-700 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium transition-all block focus:outline-none truncate"
                >
                  {item.question}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
