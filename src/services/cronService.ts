import { useEffect, useRef, useCallback } from "react";
import type { Post } from "../types/post";
import { savePostsToStorage } from "../utils/storage";

export function useCronService(
  posts: Post[],
  onPostsUpdate: (posts: Post[]) => void
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const postsRef = useRef<Post[]>(posts);

  // Keep postsRef updated with latest posts
  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const checkAndPublishPosts = useCallback((): Post[] => {
    const now = new Date();
    let hasChanges = false;

    const updatedPosts = postsRef.current.map((post) => {
      if (post.status === "scheduled") {
        const scheduledTime = new Date(post.scheduledTime);
        // Check if current time is exactly at or past the scheduled time
        if (scheduledTime.getTime() <= now.getTime()) {
          hasChanges = true;
          return {
            ...post,
            status: "published" as const,
          };
        }
      }
      return post;
    });

    return hasChanges ? updatedPosts : postsRef.current;
  }, []);

  const startCron = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Check immediately first
    const updatedPosts = checkAndPublishPosts();
    if (updatedPosts !== postsRef.current) {
      savePostsToStorage(updatedPosts);
      onPostsUpdate(updatedPosts);
    }

    // Then set up interval for continuous checking
    intervalRef.current = setInterval(() => {
      const updatedPosts = checkAndPublishPosts();
      if (updatedPosts !== postsRef.current) {
        savePostsToStorage(updatedPosts);
        onPostsUpdate(updatedPosts);
      }
    }, 1000);
  }, [checkAndPublishPosts, onPostsUpdate]);

  const stopCron = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      startCron();
    }

    return () => {
      stopCron();
    };
  }, [posts.length, startCron, stopCron]);

  return { startCron, stopCron };
}
