interface Post {
  id: string;
  timestamp: string;
  content: string;
}

interface PostsTimelineProps {
  posts: Post[];
}

export function PostsTimeline({ posts }: PostsTimelineProps) {
  return (
    <section className="p-8 md:p-8 p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Posts</h2>

      <section className="bg-white rounded-lg p-6 border border-gray-200">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-50 rounded-lg p-5 border border-gray-200"
              >
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {post.timestamp}
                </div>
                <div className="text-gray-800 leading-relaxed">
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
