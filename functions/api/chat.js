// 마크다운 문법 특수문자 제거하는 헬퍼 함수
function stripMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // Bold
    .replace(/(\*|_)(.*?)\1/g, "$2")   // Italic
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // Links
    .replace(/^#+\s+/gm, "")            // Headers
    .replace(/`([^`]+)`/g, "$1")         // Inline code
    .replace(/```[a-z]*\n([\s\S]*?)\n```/g, "$1") // Fenced code blocks
    .replace(/^\s*[-*+]\s+/gm, "")      // Lists
    .replace(/^\s*\d+\.\s+/gm, "")      // Numbered lists
    .replace(/>\s+/g, "")               // Blockquotes
    .replace(/---\n/g, "")              // Horizontal rules
    .trim();
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // 1. 요청 바디에서 prompt 가져오기
    const { prompt } = await request.json();
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required." }), 
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Cloudflare AI가 바인딩되어 있는지 확인
    if (!env.AI) {
      return new Response(
        JSON.stringify({ error: "AI binding not found in the environment." }), 
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. /data/search-index.json 가져오기
    let searchIndex = [];
    try {
      const url = new URL(request.url);
      const dataUrl = `${url.origin}/data/search-index.json`;
      const indexRes = await fetch(dataUrl);
      if (indexRes.ok) {
        searchIndex = await indexRes.json();
      }
    } catch (e) {
      console.error("Failed to fetch search-index.json", e);
    }

    // 4. 질문 단어 분리 및 매칭 점수 계산을 통한 상위 3개 항목 검색 (RAG 로직)
    const promptWords = prompt.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    
    const itemsWithScores = searchIndex.map(item => {
      let score = 0;
      // 검색 대상 텍스트는 title, summary, content를 결합하여 구성
      const searchText = `${item.title} ${item.summary} ${item.content}`.toLowerCase();
      
      promptWords.forEach(word => {
        if (searchText.includes(word)) {
          score += 1;
          // 단어와 완전히 일치하거나 제목에 포함된 단어일 시 추가 가산점
          if (item.title.toLowerCase().includes(word)) {
            score += 2;
          }
        }
      });
      return { item, score };
    });

    // 점수가 높은 순으로 정렬 후 0점 초과인 항목 중 상위 3개 선택
    const topMatches = itemsWithScores
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(entry => entry.item);

    // 5. 선택된 항목의 title과 summary를 시스템 프롬프트에 삽입
    let blogDataContext = "";
    if (topMatches.length > 0) {
      blogDataContext = topMatches
        .map((item, idx) => `[Item ${idx + 1}]\nTitle: ${item.title}\nSummary: ${item.summary}`)
        .join("\n\n");
    }

    // 6. 시스템 프롬프트 구성 (요청사항 사양 그대로 교체)
    const systemPrompt = `You are an AI assistant for a Korean local information blog.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following blog data. If not relevant, reply: 해당 내용은 블로그에서 확인이 어렵습니다. 다른 질문을 해주세요.

[블로그 데이터]
${blogDataContext}`;

    // 7. env.AI.run()을 사용하여 Workers AI 모델 실행 (max_tokens: 150으로 수정)
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150
    });

    // 8. AI 응답에서 마크다운 기호 제거 (stripMarkdown 적용)
    const cleanedResponse = stripMarkdown(response.response || "");

    // 9. AI 답변 반환
    return new Response(
      JSON.stringify({ response: cleanedResponse }), 
      { headers: { "Content-Type": "application/json;charset=UTF-8" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
