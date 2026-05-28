import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface Post {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

// Date 객체를 YYYY-MM-DD 형식의 문자열로 변환하는 헬퍼 함수
function formatDate(dateInput: any): string {
  if (dateInput instanceof Date) {
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const day = String(dateInput.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(dateInput || "");
}

// 모든 포스트 파일명(슬러그) 가져오기
export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

// 특정 슬러그의 포스트 상세 정보 가져오기
export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    title: data.title || "",
    date: formatDate(data.date),
    summary: data.summary || "",
    category: data.category || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    content,
  };
}

// 모든 포스트 목록을 날짜 기준 내림차순(최신순) 정렬하여 가져오기
export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => getPostBySlug(slug));

  return posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
}
