import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 1. static export를 위해 모든 포스트 경로(slug)를 미리 생성합니다.
export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.md$/, ""),
  }));
}

export default async function BlogPostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  try {
    const post = getPostBySlug(resolvedParams.slug);

    return (
      <div className="min-h-screen bg-[#f0f0f2] text-[#2d3748] font-sans flex items-center justify-center p-4 sm:p-8">
        <div className="w-full md:w-[60vw] bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-[#e5e7eb] flex flex-col justify-between my-8">
          
          {/* 상단 네비게이션 & 제목 */}
          <header className="border-b border-[#eee] pb-6 mb-8">
            <Link href="/blog/" className="text-sm font-semibold text-[#334488] hover:underline">
              ← 블로그 목록으로
            </Link>
            <div className="mt-4 mb-2 flex items-center space-x-2 text-xs text-[#718096]">
              <span className="font-semibold text-[#334488] bg-[#f0f4f8] px-2 py-0.5 rounded">
                {post.category}
              </span>
              <span>•</span>
              <span>{post.date}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a202c] leading-tight mt-1">
              {post.title}
            </h1>
            
            {/* 태그 리스트 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-[#718096] bg-[#f7fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 블로그 포스트 본문 (react-markdown + tailwind css typography 플러그인 사용) */}
          <main className="prose prose-slate max-w-none prose-sm sm:prose-base mb-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </main>

          {/* 하단 제어 버튼 */}
          <footer className="border-t border-[#eee] pt-6 mt-8 flex justify-between items-center text-xs">
            <Link href="/blog/" className="text-[#334488] hover:text-[#223366] font-semibold hover:underline">
              ← 목록으로 돌아가기
            </Link>
            <p className="text-[#a0aec0]">© 2026 우리동네 생활정보.</p>
          </footer>

        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
