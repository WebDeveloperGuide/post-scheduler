import { useState, useEffect, useCallback } from "react";
import { Layout } from "./Layout";
import { PostCreationForm } from "./PostCreationForm";
import { PostsTimeline } from "./PostsTimeline";
import { Divider } from "./Divider";
import { Toaster } from "react-hot-toast";
import type { Post, PostFormData } from "../types/post";
import {
  savePostsToStorage,
  loadPostsFromStorage,
  getPublishedPosts,
} from "../utils/storage";
import { useCronService } from "../services/cronService";

export function MainLayout() {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);

  useEffect(() => {
    const savedPosts = loadPostsFromStorage();
    setAllPosts(savedPosts);
    setPublishedPosts(getPublishedPosts(savedPosts));
  }, []);

  const handlePostsUpdate = useCallback((updatedPosts: Post[]) => {
    setAllPosts(updatedPosts);
    setPublishedPosts(getPublishedPosts(updatedPosts));
  }, []);

  const { startCron } = useCronService(allPosts, handlePostsUpdate);

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
      scheduledTime: data.scheduledTime,
      status: "scheduled",
    };

    const updatedPosts = [newPost, ...allPosts];
    setAllPosts(updatedPosts);
    savePostsToStorage(updatedPosts);

    const now = new Date();
    const scheduledTime = new Date(data.scheduledTime);
    if (scheduledTime.getTime() <= now.getTime()) {
      const publishedPost = { ...newPost, status: "published" as const };
      const finalPosts = [publishedPost, ...allPosts];
      setAllPosts(finalPosts);
      savePostsToStorage(finalPosts);
      setPublishedPosts(getPublishedPosts(finalPosts));
    } else {
      setPublishedPosts(getPublishedPosts(updatedPosts));
      startCron();
    }
  };

  return (
    <>
      <Layout>
        <PostCreationForm onSubmit={handlePostSubmit} />
        <Divider />
        <PostsTimeline posts={publishedPosts} />
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
