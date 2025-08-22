import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import type { Post, PostFormData } from "../types/post";

// Test wrapper component for providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Test data factories
export const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: "1",
  timestamp: "01/01/2024, 12:00 PM",
  content: "Test post content",
  scheduledTime: "2024-01-01T12:00:00",
  status: "scheduled",
  ...overrides,
});

export const createMockPostFormData = (
  overrides: Partial<PostFormData> = {}
): PostFormData => ({
  description: "Test description",
  scheduledTime: "2024-01-01T12:00:00",
  ...overrides,
});

export const createMockPosts = (
  count: number,
  overrides: Partial<Post> = {}
): Post[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockPost({
      id: (index + 1).toString(),
      content: `Test post ${index + 1}`,
      scheduledTime: new Date(Date.now() + (index + 1) * 60000).toISOString(),
      ...overrides,
    })
  );
};

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };
