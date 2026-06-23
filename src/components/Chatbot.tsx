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
      text: "안녕하세요! '동네정보 지킴이'입니다. 우리동네 행사 및 혜택에 대해 궁금한 내용을 선택하거나 아래 입력창에 질문을 입력해 주세요.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 대화창이 열리거나 메시지가 추가될 때 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // 버튼 질문 선택 시
  const handleQuestionClick = (question: string, answer: string) => {
    if (isLoading) return;
    
    // 1. 유저 질문 추가
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: question },
    ]);

    // 2. 딜레이 후 사전 정의된 답변 추가
    setTimeout(() => {
      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: "bot", text: answer },
      ]);
    }, 500);
  };

  // 텍스트 직접 입력 전송 시
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    // 1. 화면에 유저가 보낸 메시지 즉시 추가
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: "user", text: userText },
    ]);

    try {
      // 2. 서버의 /api/chat 엔드포인트로 POST 요청 전송
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userText }),
      });

      if (!res.ok) {
        throw new Error("서버 에러가 발생했습니다.");
      }

      const data = await res.json();
      
      // 3. AI 답변 추가
      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: "bot", text: data.response || "답변을 가져오지 못했습니다." },
      ]);
    } catch (error: any) {
      // 에러 발생 시 안내 메시지
      const botMsgId = `bot-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, sender: "bot", text: "죄송합니다. 서비스 일시 장애로 답변을 생성할 수 없습니다." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans">
      {/* 챗봇 플로팅 버튼 - 모바일에서 채팅창이 열려있을 때는 숨김 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 focus:outline-none ${
          isOpen ? "max-md:hidden" : ""
        }`}
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
        className={`fixed z-50 bg-white flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4 pointer-events-none"
        }
        /* 모바일에서는 화면 전체를 채움 */
        inset-0 w-full h-full rounded-none
        /* 데스크톱(md: 768px 이상)에서만 플로팅 모달 크기 적용 */
        md:inset-auto md:bottom-24 md:right-6 md:w-[360px] md:h-[500px] md:max-h-[600px] md:rounded-2xl md:shadow-2xl md:border md:border-gray-200
        `}
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
          
          {/* 로딩 스피너 애니메이션 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 채팅창 하단 질문 리스트 */}
        <div className="p-3 bg-white border-t border-gray-150 flex flex-col space-y-1.5">
          <p className="text-[10px] font-semibold text-gray-400">자주 묻는 질문</p>
          <div className="flex flex-nowrap overflow-x-auto pb-1 gap-1.5 scrollbar-thin">
            {chatData.map((item, index) => {
              return (
                <button
                  key={index}
                  onClick={() => handleQuestionClick(item.question, item.answer)}
                  className="bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200 text-[11px] font-medium transition-all focus:outline-none whitespace-nowrap"
                >
                  {item.question}
                </button>
              );
            })}
          </div>
        </div>

        {/* 직접 텍스트 입력 폼 */}
        <form
          onSubmit={handleSendText}
          className="border-t border-gray-200 p-2.5 bg-white flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="질문을 입력하세요..."
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl transition-all focus:outline-none flex items-center justify-center"
          >
            <svg
              className="w-4 h-4"
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
