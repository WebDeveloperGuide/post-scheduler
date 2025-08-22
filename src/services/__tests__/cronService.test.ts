import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCronService } from "../cronService";
import { createMockPost, createMockPosts } from "../../test/utils";

// Mock setInterval and clearInterval
vi.useFakeTimers();

describe("useCronService", () => {
  const mockOnPostsUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnPostsUpdate.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("should start cron service when posts are provided", () => {
    const posts = createMockPosts(1);

    renderHook(() => useCronService(posts, mockOnPostsUpdate));

    expect(setInterval).toHaveBeenCalled();
  });

  it("should not start cron service when no posts are provided", () => {
    renderHook(() => useCronService([], mockOnPostsUpdate));

    expect(setInterval).not.toHaveBeenCalled();
  });

  it("should check posts immediately when started", () => {
    const now = new Date();
    const pastTime = new Date(now.getTime() - 60000).toISOString();

    const posts = [
      createMockPost({ status: "scheduled", scheduledTime: pastTime }),
    ];

    renderHook(() => useCronService(posts, mockOnPostsUpdate));

    // Should call onPostsUpdate immediately for posts that should be published
    expect(mockOnPostsUpdate).toHaveBeenCalled();
  });

  it("should publish posts when their scheduled time arrives", () => {
    const now = new Date();
    const pastTime = new Date(now.getTime() - 60000).toISOString();

    const posts = [
      createMockPost({ status: "scheduled", scheduledTime: pastTime }),
    ];

    renderHook(() => useCronService(posts, mockOnPostsUpdate));

    // Fast-forward time to trigger the interval
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockOnPostsUpdate).toHaveBeenCalled();
  });

  it("should not publish posts that are already published", () => {
    const now = new Date();
    const pastTime = new Date(now.getTime() - 60000).toISOString();

    const posts = [
      createMockPost({ status: "published", scheduledTime: pastTime }),
    ];

    renderHook(() => useCronService(posts, mockOnPostsUpdate));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should not call onPostsUpdate since no changes occurred
    expect(mockOnPostsUpdate).toHaveBeenCalledTimes(1); // Only the initial check
  });

  it("should not publish posts with future scheduled times", () => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + 60000).toISOString();

    const posts = [
      createMockPost({ status: "scheduled", scheduledTime: futureTime }),
    ];

    renderHook(() => useCronService(posts, mockOnPostsUpdate));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should not call onPostsUpdate since no posts are ready to publish
    expect(mockOnPostsUpdate).toHaveBeenCalledTimes(1); // Only the initial check
  });

  it("should handle multiple posts with different statuses", () => {
    const now = new Date();
    const pastTime = new Date(now.getTime() - 60000).toISOString();
    const futureTime = new Date(now.getTime() + 60000).toISOString();

    const posts = [
      createMockPost({ status: "scheduled", scheduledTime: pastTime }),
      createMockPost({ status: "scheduled", scheduledTime: futureTime }),
      createMockPost({ status: "published", scheduledTime: pastTime }),
    ];

    renderHook(() => useCronService(posts, mockOnPostsUpdate));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Should call onPostsUpdate for the post that should be published
    expect(mockOnPostsUpdate).toHaveBeenCalled();
  });

  it("should clear interval when component unmounts", () => {
    const posts = createMockPosts(1);

    const { unmount } = renderHook(() =>
      useCronService(posts, mockOnPostsUpdate)
    );

    unmount();

    expect(clearInterval).toHaveBeenCalled();
  });

  it("should restart cron service when posts change", () => {
    const posts1 = createMockPosts(1);
    const posts2 = createMockPosts(2);

    const { rerender } = renderHook(
      ({ posts }) => useCronService(posts, mockOnPostsUpdate),
      { initialProps: { posts: posts1 } }
    );

    // Clear previous calls
    vi.clearAllMocks();

    rerender({ posts: posts2 });

    // Should restart the cron service
    expect(setInterval).toHaveBeenCalled();
  });

  it("should handle empty posts array changes", () => {
    const posts = createMockPosts(1);

    const { rerender } = renderHook(
      ({ posts }) => useCronService(posts, mockOnPostsUpdate),
      { initialProps: { posts } }
    );

    rerender({ posts: [] });

    // Should clear interval when no posts
    expect(clearInterval).toHaveBeenCalled();
  });

  it("should return startCron and stopCron functions", () => {
    const posts = createMockPosts(1);

    const { result } = renderHook(() =>
      useCronService(posts, mockOnPostsUpdate)
    );

    expect(result.current.startCron).toBeDefined();
    expect(result.current.stopCron).toBeDefined();
    expect(typeof result.current.startCron).toBe("function");
    expect(typeof result.current.stopCron).toBe("function");
  });

  it("should allow manual start and stop of cron service", () => {
    const posts = createMockPosts(1);

    const { result } = renderHook(() =>
      useCronService(posts, mockOnPostsUpdate)
    );

    // Stop the service
    act(() => {
      result.current.stopCron();
    });

    expect(clearInterval).toHaveBeenCalled();

    // Start the service again
    act(() => {
      result.current.startCron();
    });

    expect(setInterval).toHaveBeenCalled();
  });
});
