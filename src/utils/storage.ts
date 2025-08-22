import type { Post } from "../types/post";

const POSTS_STORAGE_KEY = "scheduled_posts";

export function savePostsToStorage(posts: Post[]): void {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error("Failed to save posts to localStorage:", error);
  }
}

export function loadPostsFromStorage(): Post[] {
  try {
    const stored = localStorage.getItem(POSTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load posts from localStorage:", error);
    return [];
  }
}

export function getPublishedPosts(posts: Post[]): Post[] {
  const now = new Date();
  return posts
    .filter((post) => {
      const scheduledTime = new Date(post.scheduledTime);
      return scheduledTime <= now;
    })
    .sort(
      (a, b) =>
        new Date(b.scheduledTime).getTime() -
        new Date(a.scheduledTime).getTime()
    );
}
