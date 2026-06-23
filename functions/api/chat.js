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

    // 3. 현재 호스트 도메인을 기반으로 local-info.json 블로그 데이터 가져오기
    let localData = [];
    try {
      const url = new URL(request.url);
      const dataUrl = `${url.origin}/data/local-info.json`;
      const dataRes = await fetch(dataUrl);
      if (dataRes.ok) {
        localData = await dataRes.json();
      }
    } catch (e) {
      console.error("Failed to fetch local-info.json", e);
    }

    // 4. 검색 쿼리와 블로그 데이터 간의 매칭 찾기 (간단하고 정확한 문자열 포함 매칭)
    const matchedItems = localData.filter(item => {
      const query = prompt.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.location && item.location.toLowerCase().includes(query)) ||
        (item.target && item.target.toLowerCase().includes(query))
      );
    });

    // 5. 검색 결과 컨텍스트 구성
    let contextString = "";
    if (matchedItems.length > 0) {
      contextString = "Here is the relevant local/blog information matches for the user's query:\n" + 
        matchedItems.slice(0, 3).map(item => {
          return `- Title: ${item.title}\n  Category: ${item.category}\n  Period: ${item.startDate} ~ ${item.endDate}\n  Location: ${item.location || 'N/A'}\n  Target: ${item.target || 'N/A'}\n  Description: ${item.description}`;
        }).join("\n\n");
    } else {
      // 매칭되는 특정 검색어가 없는 경우 전체 요약 리스트를 제공하여 AI가 참고하도록 제공
      contextString = "Here is a list of available programs on the blog for reference:\n" + 
        localData.slice(0, 5).map(item => `- ${item.title} (${item.category}): ${item.description}`).join("\n");
    }

    // 6. 시스템 프롬프트 구성
    const systemPrompt = `You are a helpful and polite Korean AI assistant ("동네정보 지킴이") for a Korean local information blog. 
Answer in Korean. 

Use the following reference blog/local data context to answer the user's question accurately. 
If the user asks about programs, dates, eligibility, or locations, prioritize the information from this context. 
If the information is not in the context, politely explain that you do not have that specific information yet.

[Blog Data Context]
${contextString}`;

    // 7. env.AI.run()을 사용하여 Workers AI 모델 실행
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
      max_tokens: 300
    });

    // 8. AI 답변 반환
    return new Response(
      JSON.stringify({ response: response.response }), 
      { headers: { "Content-Type": "application/json;charset=UTF-8" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
