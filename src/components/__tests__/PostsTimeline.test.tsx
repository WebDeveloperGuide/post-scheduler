import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostsTimeline } from "../PostsTimeline";
import { createMockPost, createMockPosts } from "../../test/utils";

describe("PostsTimeline", () => {
  it("should render the heading correctly", () => {
    render(<PostsTimeline posts={[]} />);

    expect(screen.getByText("Your Posts")).toBeInTheDocument();
  });

  it('should show "No posts yet" when posts array is empty', () => {
    render(<PostsTimeline posts={[]} />);

    expect(screen.getByText("No posts yet")).toBeInTheDocument();
  });

  it('should show "No posts yet" when posts array is undefined', () => {
    render(<PostsTimeline posts={undefined as any} />);

    expect(screen.getByText("No posts yet")).toBeInTheDocument();
  });

  it("should display posts when they exist", () => {
    const posts = [
      createMockPost({ content: "First post content" }),
      createMockPost({ content: "Second post content" }),
    ];

    render(<PostsTimeline posts={posts} />);

    expect(screen.getByText("First post content")).toBeInTheDocument();
    expect(screen.getByText("Second post content")).toBeInTheDocument();
    expect(screen.queryByText("No posts yet")).not.toBeInTheDocument();
  });

  it("should display post timestamp correctly", () => {
    const posts = [
      createMockPost({
        timestamp: "01/01/2024, 12:00 PM",
        content: "Test post",
      }),
    ];

    render(<PostsTimeline posts={posts} />);

    expect(screen.getByText("01/01/2024, 12:00 PM")).toBeInTheDocument();
  });

  it("should display post content correctly", () => {
    const posts = [
      createMockPost({ content: "This is a test post with some content" }),
    ];

    render(<PostsTimeline posts={posts} />);

    expect(
      screen.getByText("This is a test post with some content")
    ).toBeInTheDocument();
  });

  it("should render multiple posts with proper spacing", () => {
    const posts = createMockPosts(3);

    render(<PostsTimeline posts={posts} />);

    const postElements = screen.getAllByText(/Test post \d+/);
    expect(postElements).toHaveLength(3);
  });

  it("should apply proper styling classes to post containers", () => {
    const posts = [createMockPost()];

    render(<PostsTimeline posts={posts} />);

    const postContainer = screen.getByText("Test post content").closest("div");
    expect(postContainer).toHaveClass(
      "bg-gray-50",
      "rounded-lg",
      "p-4",
      "border"
    );
  });

  it("should apply proper styling to the main container", () => {
    render(<PostsTimeline posts={[]} />);

    const mainContainer = screen.getByText("No posts yet").closest("section");
    expect(mainContainer).toHaveClass("bg-white", "rounded-lg", "border");
  });

  it("should handle posts with long content", () => {
    const longContent =
      "This is a very long post content that might wrap to multiple lines and should still be displayed correctly without any truncation or overflow issues.";
    const posts = [createMockPost({ content: longContent })];

    render(<PostsTimeline posts={posts} />);

    expect(screen.getByText(longContent)).toBeInTheDocument();
  });

  it("should handle posts with special characters in content", () => {
    const specialContent =
      "Post with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?";
    const posts = [createMockPost({ content: specialContent })];

    render(<PostsTimeline posts={posts} />);

    expect(screen.getByText(specialContent)).toBeInTheDocument();
  });

  it("should handle posts with HTML-like content safely", () => {
    const htmlContent = '<script>alert("xss")</script><div>Safe content</div>';
    const posts = [createMockPost({ content: htmlContent })];

    render(<PostsTimeline posts={posts} />);

    // Content should be displayed as text, not rendered as HTML
    expect(screen.getByText(htmlContent)).toBeInTheDocument();
  });

  it("should maintain proper structure with many posts", () => {
    const posts = createMockPosts(10);

    render(<PostsTimeline posts={posts} />);

    const postElements = screen.getAllByText(/Test post \d+/);
    expect(postElements).toHaveLength(10);

    // Should still show the heading
    expect(screen.getByText("Your Posts")).toBeInTheDocument();
  });

  it("should handle posts with empty content", () => {
    const posts = [createMockPost({ content: "" })];

    render(<PostsTimeline posts={posts} />);

    // Empty content should still render the post container
    const postContainer = screen
      .getByText("01/01/2024, 12:00 PM")
      .closest("div");
    expect(postContainer).toBeInTheDocument();
  });

  it("should apply responsive classes correctly", () => {
    render(<PostsTimeline posts={[]} />);

    const section = screen.getByText("Your Posts").closest("section");
    expect(section).toHaveClass("p-4", "md:p-8");
  });

  it("should apply responsive text sizing", () => {
    render(<PostsTimeline posts={[]} />);

    const heading = screen.getByText("Your Posts");
    expect(heading).toHaveClass("text-xl", "md:text-2xl");
  });
});
