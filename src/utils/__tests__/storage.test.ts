import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  savePostsToStorage,
  loadPostsFromStorage,
  getPublishedPosts,
} from "../storage";
import { createMockPost, createMockPosts } from "../../test/utils";

describe("Storage Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("savePostsToStorage", () => {
    it("should save posts to localStorage", () => {
      const posts = createMockPosts(3);
      savePostsToStorage(posts);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "scheduled_posts",
        JSON.stringify(posts)
      );
    });

    it("should handle empty posts array", () => {
      savePostsToStorage([]);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "scheduled_posts",
        "[]"
      );
    });

    it("should handle localStorage errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      localStorage.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const posts = createMockPosts(1);
      expect(() => savePostsToStorage(posts)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe("loadPostsFromStorage", () => {
    it("should load posts from localStorage", () => {
      const posts = createMockPosts(2);
      localStorage.getItem.mockReturnValue(JSON.stringify(posts));

      const result = loadPostsFromStorage();
      expect(result).toEqual(posts);
      expect(localStorage.getItem).toHaveBeenCalledWith("scheduled_posts");
    });

    it("should return empty array when no posts exist", () => {
      localStorage.getItem.mockReturnValue(null);

      const result = loadPostsFromStorage();
      expect(result).toEqual([]);
    });

    it("should return empty array when localStorage is empty", () => {
      localStorage.getItem.mockReturnValue("");

      const result = loadPostsFromStorage();
      expect(result).toEqual([]);
    });

    it("should handle invalid JSON gracefully", () => {
      localStorage.getItem.mockReturnValue("invalid-json");

      const result = loadPostsFromStorage();
      expect(result).toEqual([]);
    });

    it("should handle localStorage errors gracefully", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      localStorage.getItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const result = loadPostsFromStorage();
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe("getPublishedPosts", () => {
    it("should return only published posts", () => {
      const now = new Date();
      const pastTime = new Date(now.getTime() - 60000).toISOString();
      const futureTime = new Date(now.getTime() + 60000).toISOString();

      const posts = [
        createMockPost({ status: "published", scheduledTime: pastTime }),
        createMockPost({ status: "scheduled", scheduledTime: futureTime }),
        createMockPost({ status: "published", scheduledTime: pastTime }),
      ];

      const result = getPublishedPosts(posts);
      expect(result).toHaveLength(2);
      expect(result.every((post) => post.status === "published")).toBe(true);
    });

    it("should filter posts by scheduled time", () => {
      const now = new Date();
      const pastTime = new Date(now.getTime() - 60000).toISOString();
      const futureTime = new Date(now.getTime() + 60000).toISOString();

      const posts = [
        createMockPost({ status: "scheduled", scheduledTime: pastTime }),
        createMockPost({ status: "scheduled", scheduledTime: futureTime }),
        createMockPost({ status: "scheduled", scheduledTime: pastTime }),
      ];

      const result = getPublishedPosts(posts);
      expect(result).toHaveLength(2);
      expect(result.every((post) => new Date(post.scheduledTime) <= now)).toBe(
        true
      );
    });

    it("should sort posts in descending order by scheduled time", () => {
      const now = new Date();
      const time1 = new Date(now.getTime() - 60000).toISOString();
      const time2 = new Date(now.getTime() - 120000).toISOString();
      const time3 = new Date(now.getTime() - 180000).toISOString();

      const posts = [
        createMockPost({ status: "scheduled", scheduledTime: time2 }),
        createMockPost({ status: "scheduled", scheduledTime: time1 }),
        createMockPost({ status: "scheduled", scheduledTime: time3 }),
      ];

      const result = getPublishedPosts(posts);
      expect(result).toHaveLength(3);
      expect(new Date(result[0].scheduledTime).getTime()).toBeGreaterThan(
        new Date(result[1].scheduledTime).getTime()
      );
      expect(new Date(result[1].scheduledTime).getTime()).toBeGreaterThan(
        new Date(result[2].scheduledTime).getTime()
      );
    });

    it("should return empty array when no posts are published", () => {
      const now = new Date();
      const futureTime = new Date(now.getTime() + 60000).toISOString();

      const posts = [
        createMockPost({ status: "scheduled", scheduledTime: futureTime }),
        createMockPost({ status: "scheduled", scheduledTime: futureTime }),
      ];

      const result = getPublishedPosts(posts);
      expect(result).toEqual([]);
    });

    it("should handle posts with current time", () => {
      const now = new Date();
      const currentTime = now.toISOString();

      const posts = [
        createMockPost({ status: "scheduled", scheduledTime: currentTime }),
      ];

      const result = getPublishedPosts(posts);
      expect(result).toHaveLength(1);
    });
  });
});
