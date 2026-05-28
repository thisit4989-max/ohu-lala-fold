const fs = require("fs");
const path = require("path");

const localInfoPath = path.join(__dirname, "../public/data/local-info.json");
const postsDir = path.join(__dirname, "../src/content/posts");

async function run() {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.error("GEMINI_API_KEY 환경변수가 없습니다.");
      process.exit(1);
    }

    // 1단계: 최신 데이터 확인
    if (!fs.existsSync(localInfoPath)) {
      console.log("local-info.json 파일이 존재하지 않습니다.");
      return;
    }

    const localInfoContent = fs.readFileSync(localInfoPath, "utf8");
    const localInfoData = JSON.parse(localInfoContent || "[]");

    if (localInfoData.length === 0) {
      console.log("local-info.json에 데이터가 없습니다.");
      return;
    }

    // 마지막 항목 가져오기
    const latestItem = localInfoData[localInfoData.length - 1];
    const latestTitle = (latestItem.title || "").trim();

    // 기존 블로그 글 목록 읽기 및 중복 검사
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    const files = fs.readdirSync(postsDir).filter((file) => file.endsWith(".md"));
    const existingTitles = files.map((file) => {
      const content = fs.readFileSync(path.join(postsDir, file), "utf8");
      // 간단히 frontmatter의 title 필드 추출
      const match = content.match(/title:\s*["']?(.*?)["']?\r?\n/);
      return match ? match[1].trim() : "";
    });

    if (existingTitles.includes(latestTitle)) {
      console.log("이미 작성된 글입니다");
      return;
    }

    // 2단계: Gemini AI로 블로그 글 생성
    const todayStr = new Date().toISOString().split("T")[0];
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    const promptText = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보:
제목: ${latestItem.title || ""}
카테고리: ${latestItem.category || ""}
기간: ${latestItem.startDate || ""} ~ ${latestItem.endDate || ""}
장소/신청처: ${latestItem.location || ""}
대상: ${latestItem.target || ""}
내용 요약: ${latestItem.description || ""}
상세 링크: ${latestItem.link || ""}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${todayStr}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: promptText
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const resJson = await response.json();
    let responseText = resJson.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 3단계: 파일명(FILENAME)과 본문(Markdown) 분리
    const lines = responseText.split("\n");
    let filename = "";
    let markdownContent = "";

    const filenameLineIndex = lines.findIndex((line) => line.toUpperCase().includes("FILENAME:"));

    if (filenameLineIndex !== -1) {
      const filenameLine = lines[filenameLineIndex];
      filename = filenameLine.replace(/FILENAME:\s*/i, "").trim();
      
      // 파일명 행을 배열에서 제거
      lines.splice(filenameLineIndex, 1);
      markdownContent = lines.join("\n").trim();
    } else {
      // 파일명 매칭 실패 시 기본값 설정
      const keyword = "public-service";
      filename = `${todayStr}-${keyword}`;
      markdownContent = responseText.trim();
    }

    // 마크다운 코드블록 울타리(```) 제거
    markdownContent = markdownContent.replace(/```markdown/g, "").replace(/```/g, "").trim();

    // 파일명 뒤에 .md 확장자 확인 및 추가
    if (!filename.endsWith(".md")) {
      filename += ".md";
    }

    // 파일 저장
    const finalFilePath = path.join(postsDir, filename);
    fs.writeFileSync(finalFilePath, markdownContent, "utf8");

    console.log(`블로그 글 생성 완료: ${filename}`);

  } catch (error) {
    console.error("오류 발생:", error);
  }
}

run();
