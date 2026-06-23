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

    // 3. env.AI.run()을 사용하여 Workers AI 모델 실행
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for a Korean local information blog. Answer in Korean."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300
    });

    // 4. AI 답변 반환
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
