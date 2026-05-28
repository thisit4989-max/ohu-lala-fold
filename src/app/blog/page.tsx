import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogList() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#f0f0f2] text-[#2d3748] font-sans flex items-center justify-center p-4 sm:p-8">
      <div className="w-full md:w-[60vw] bg-white p-8 sm:p-12 rounded-lg shadow-sm border border-[#e5e7eb] flex flex-col justify-between my-8">
        
        {/* 상단 헤더 네비게이션 */}
        <header className="border-b border-[#eee] pb-6 mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="text-sm font-semibold text-[#334488] hover:underline">
              ← 홈으로
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a202c] mt-2">
              지역 소식 블로그
            </h1>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 bg-[#f0f4f8] text-[#334488] rounded-lg border border-[#334488]/10">
            📝 총 {posts.length}개의 글
          </span>
        </header>

        {/* 블로그 포스트 목록 */}
        <main className="space-y-10 min-h-[300px]">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-[#718096]">
              아직 작성된 블로그 글이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-[#eee]">
              {posts.map((post) => (
                <article key={post.slug} className="py-6 first:pt-0 last:pb-0 opacity-90">
                  <div className="flex items-center space-x-2 text-xs text-[#718096] mb-2">
                    <span className="font-semibold text-[#334488] bg-[#f0f4f8] px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#1a202c] mb-2 hover:text-[#334488] transition-colors">
                    <Link href={`/blog/${post.slug}/`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4a5568] leading-relaxed mb-3 opacity-80">
                    {post.summary}
                  </p>
                  
                  {/* 태그 리스트 */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-[#718096] bg-[#f7fafc] px-2 py-0.5 rounded border border-[#e2e8f0]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div>
                    <Link
                      href={`/blog/${post.slug}/`}
                      className="text-[#334488] hover:text-[#223366] text-xs font-semibold hover:underline"
                    >
                      읽기 →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {/* 푸터 */}
        <footer className="border-t border-[#eee] pt-6 mt-10 text-xs text-[#a0aec0] text-center sm:text-left">
          <p>© 2026 우리동네 생활정보 블로그.</p>
        </footer>

      </div>
    </div>
  );
}
