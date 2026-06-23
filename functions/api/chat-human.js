export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // 1. CHAT_KV 바인딩 확인
    if (!env.CHAT_KV) {
      return new Response(
        JSON.stringify({ error: "CHAT_KV binding not found in the environment." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. 요청 바디에서 prompt(message)와 sender 가져오기
    const data = await request.json();
    const message = data.prompt || data.message;
    const sender = data.sender || "user";

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message content is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. 메시지용 key와 value 구성
    const timestamp = Date.now();
    const key = `msg_${timestamp}`;
    const value = JSON.stringify({
      id: key,
      sender: sender,
      text: message,
      timestamp: timestamp
    });

    // 4. KV에 저장
    await env.CHAT_KV.put(key, value);

    return new Response(
      JSON.stringify({ success: true, key: key }),
      { headers: { "Content-Type": "application/json;charset=UTF-8" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
