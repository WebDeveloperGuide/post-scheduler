import type { Post } from "../types/post";

interface PostsTimelineProps {
  posts: Post[];
}

export function PostsTimeline({ posts }: PostsTimelineProps) {
  return (
    <section className="p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
        Your Posts
      </h2>

      <section className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
        {posts.length === 0 ? (
          <div className="text-center py-6 md:py-8">
            <p className="text-gray-500 text-base md:text-lg">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-50 rounded-lg p-4 md:p-5 border border-gray-200"
              >
                <div className="text-xs md:text-sm font-medium text-gray-600 mb-2">
                  {post.timestamp}
                </div>
                <div className="text-gray-800 leading-relaxed text-sm md:text-base">
                  {post.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
