import { useState } from "react";
import { Layout } from "./Layout";
import { PostCreationForm } from "./PostCreationForm";
import { PostsTimeline } from "./PostsTimeline";
import { Divider } from "./Divider";

interface Post {
  id: string;
  timestamp: string;
  content: string;
}

export function MainLayout() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      timestamp: "29/01/24 10:00pm",
      content:
        "Just finished reading an amazing book about design principles. It's incredible how small details can make such a huge impact on user experience!",
    },
  ]);

  const handlePostSubmit = (data: {
    description: string;
    scheduledTime: string;
  }) => {
    const newPost: Post = {
      id: Date.now().toString(),
      timestamp: new Date(data.scheduledTime).toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      content: data.description,
    };

    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <Layout>
      <PostCreationForm onSubmit={handlePostSubmit} />
      <Divider />
      <PostsTimeline posts={posts} />
    </Layout>
  );
}
