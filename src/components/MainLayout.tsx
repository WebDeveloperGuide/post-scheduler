import { useState } from "react";
import { Layout } from "./Layout";
import { PostCreationForm } from "./PostCreationForm";
import { PostsTimeline } from "./PostsTimeline";
import { Divider } from "./Divider";
import { Toaster } from "react-hot-toast";
import type { PostFormData } from "../schemas/postSchema";

interface Post {
  id: string;
  timestamp: string;
  content: string;
}

export function MainLayout() {
  const [posts, setPosts] = useState<Post[]>([]);

  const handlePostSubmit = async (data: PostFormData) => {
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
    <>
      <Layout>
        <PostCreationForm onSubmit={handlePostSubmit} />
        <Divider />
        <PostsTimeline posts={posts} />
      </Layout>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}
