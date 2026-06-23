const fs = require("fs");
const path = require("path");

// 마크다운 문법 특수문자 제거하는 헬퍼 함수
function removeMarkdown(markdown) {
  if (!markdown) return "";
  return markdown
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

function buildSearchIndex() {
  const index = [];

  // 1. public/data/local-info.json 처리
  const localInfoPath = path.join(process.cwd(), "public", "data", "local-info.json");
  if (fs.existsSync(localInfoPath)) {
    try {
      const localInfoData = JSON.parse(fs.readFileSync(localInfoPath, "utf8"));
      localInfoData.forEach((item) => {
        index.push({
          type: "benefit",
          title: item.title,
          summary: item.description,
          content: `카테고리: ${item.category}, 대상: ${item.target || ""}, 위치: ${item.location || ""}, 기간: ${item.startDate} ~ ${item.endDate}. ${item.description}`,
          link: item.link || "#"
        });
      });
    } catch (e) {
      console.error("local-info.json을 처리하는 중 에러가 발생했습니다:", e);
    }
  }

  // 2. src/content/posts/*.md 파일들 처리
  const postsDir = path.join(process.cwd(), "src", "content", "posts");
  if (fs.existsSync(postsDir)) {
    try {
      const files = fs.readdirSync(postsDir).filter((file) => file.endsWith(".md"));
      files.forEach((file) => {
        const fullPath = path.join(postsDir, file);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        
        // 간단한 front-matter 파서 구현 (라이브러리 로드 회피)
        const match = fileContents.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
        if (match) {
          const frontMatter = match[1];
          const rawContent = match[2];
          
          // 메타데이터 행 파싱
          const metadata = {};
          frontMatter.split("\n").forEach((line) => {
            const parts = line.split(":");
            if (parts.length >= 2) {
              const key = parts[0].trim();
              const val = parts.slice(1).join(":").trim().replace(/^['"]|['"]$/g, ""); // 따옴표 제거
              metadata[key] = val;
            }
          });

          const title = metadata.title || file.replace(/\.md$/, "");
          const summary = metadata.summary || "";
          
          // 마크다운 제거 및 앞 500자 추출
          const plainText = removeMarkdown(rawContent);
          const slicedContent = plainText.substring(0, 500);
          const slug = file.replace(/\.md$/, "");

          index.push({
            type: "post",
            title: title,
            summary: summary,
            content: slicedContent,
            link: `/blog/${slug}/`
          });
        }
      });
    } catch (e) {
      console.error("마크다운 포스트를 처리하는 중 에러가 발생했습니다:", e);
    }
  }

  // 3. 결과물 저장
  const outputPath = path.join(process.cwd(), "public", "data", "search-index.json");
  
  // 저장용 폴더가 없을 경우 생성
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2), "utf8");
  console.log(`Search index built: ${index.length} entries`);
}

buildSearchIndex();
