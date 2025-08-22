import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainLayout } from "../MainLayout";
import { createMockPost, createMockPosts } from "../../test/utils";

// Mock the cron service
vi.mock("../../services/cronService", () => ({
  useCronService: vi.fn(() => ({
    startCron: vi.fn(),
    stopCron: vi.fn(),
  })),
}));

// Mock the storage utilities
vi.mock("../../utils/storage", () => ({
  savePostsToStorage: vi.fn(),
  loadPostsFromStorage: vi.fn(() => []),
  getPublishedPosts: vi.fn((posts) =>
    posts.filter((p) => p.status === "published")
  ),
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  Toaster: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="toaster">{children}</div>
  ),
}));

describe("MainLayout", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the main layout structure", () => {
    render(<MainLayout />);

    expect(screen.getByText("What's on your mind")).toBeInTheDocument();
    expect(screen.getByText("Your Posts")).toBeInTheDocument();
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
  });

  it("should load posts from storage on mount", () => {
    const { loadPostsFromStorage } = require("../../utils/storage");
    loadPostsFromStorage.mockReturnValue([]);

    render(<MainLayout />);

    expect(loadPostsFromStorage).toHaveBeenCalled();
  });

  it('should display "No posts yet" when no posts exist', () => {
    render(<MainLayout />);

    expect(screen.getByText("No posts yet")).toBeInTheDocument();
  });

  it("should handle form submission with future date", async () => {
    const { savePostsToStorage } = require("../../utils/storage");

    render(<MainLayout />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Test post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(savePostsToStorage).toHaveBeenCalled();
    });
  });

  it("should handle form submission with past date", async () => {
    const { savePostsToStorage } = require("../../utils/storage");

    render(<MainLayout />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Test post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const pastTime = new Date(Date.now() - 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, pastTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(savePostsToStorage).toHaveBeenCalled();
    });
  });

  it("should create post with correct structure", async () => {
    const { savePostsToStorage } = require("../../utils/storage");

    render(<MainLayout />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Test post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(savePostsToStorage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: "Test post content",
            status: "scheduled",
          }),
        ])
      );
    });
  });

  it("should publish posts immediately if scheduled time has passed", async () => {
    const {
      savePostsToStorage,
      getPublishedPosts,
    } = require("../../utils/storage");
    getPublishedPosts.mockReturnValue([]);

    render(<MainLayout />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Past post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const pastTime = new Date(Date.now() - 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, pastTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(savePostsToStorage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: "Past post content",
            status: "published",
          }),
        ])
      );
    });
  });

  it("should use cron service for post management", () => {
    const { useCronService } = require("../../services/cronService");

    render(<MainLayout />);

    expect(useCronService).toHaveBeenCalled();
  });

  it("should handle multiple posts correctly", async () => {
    const { savePostsToStorage } = require("../../utils/storage");

    render(<MainLayout />);

    // Submit first post
    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "First post");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime1 = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime1);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    // Submit second post
    await user.clear(textarea);
    await user.type(textarea, "Second post");

    const futureTime2 = new Date(Date.now() + 120000)
      .toISOString()
      .slice(0, 16);
    await user.clear(datetimeInput);
    await user.type(datetimeInput, futureTime2);

    await user.click(submitButton);

    await waitFor(() => {
      expect(savePostsToStorage).toHaveBeenCalledTimes(2);
    });
  });

  it("should format timestamp correctly", async () => {
    const { savePostsToStorage } = require("../../utils/storage");

    render(<MainLayout />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Test post");

    const datetimeInput = screen.getByLabelText("Post By");
    const testDate = new Date("2024-01-01T12:00:00");
    const testTime = testDate.toISOString().slice(0, 16);
    await user.type(datetimeInput, testTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(savePostsToStorage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            timestamp: expect.stringMatching(/01\/01\/2024, 12:00 PM/),
          }),
        ])
      );
    });
  });

  it("should handle empty form submission gracefully", async () => {
    render(<MainLayout />);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });
  });

  it("should maintain state consistency between all posts and published posts", async () => {
    const {
      savePostsToStorage,
      getPublishedPosts,
    } = require("../../utils/storage");
    getPublishedPosts.mockReturnValue([]);

    render(<MainLayout />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Test post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(savePostsToStorage).toHaveBeenCalled();
    });
  });
});
