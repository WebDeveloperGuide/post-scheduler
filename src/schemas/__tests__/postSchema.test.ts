import { describe, it, expect } from "vitest";
import { postSchema } from "../postSchema";

describe("postSchema", () => {
  describe("description validation", () => {
    it("should validate a valid description", () => {
      const validData = {
        description: "This is a valid post description",
        scheduledTime: new Date(Date.now() + 60000).toISOString(),
      };

      const result = postSchema.validate(validData);
      expect(result.error).toBeUndefined();
    });

    it("should reject empty description", () => {
      const invalidData = {
        description: "",
        scheduledTime: new Date(Date.now() + 60000).toISOString(),
      };

      const result = postSchema.validate(invalidData);
      expect(result.error?.message).toContain("Description is required");
    });

    it("should reject whitespace-only description", () => {
      const invalidData = {
        description: "   ",
        scheduledTime: new Date(Date.now() + 60000).toISOString(),
      };

      const result = postSchema.validate(invalidData);
      expect(result.error?.message).toContain("Description is required");
    });

    it("should reject description that is too long", () => {
      const longDescription = "a".repeat(1001);
      const invalidData = {
        description: longDescription,
        scheduledTime: new Date(Date.now() + 60000).toISOString(),
      };

      const result = postSchema.validate(invalidData);
      expect(result.error?.message).toContain(
        "Description cannot exceed 1000 characters"
      );
    });

    it("should reject missing description", () => {
      const invalidData = {
        scheduledTime: new Date(Date.now() + 60000).toISOString(),
      };

      const result = postSchema.validate(invalidData);
      expect(result.error?.message).toContain("Description is required");
    });
  });

  describe("scheduledTime validation", () => {
    it("should validate a future scheduled time", () => {
      const futureTime = new Date(Date.now() + 60000).toISOString();
      const validData = {
        description: "Valid post",
        scheduledTime: futureTime,
      };

      const result = postSchema.validate(validData);
      expect(result.error).toBeUndefined();
    });

    it("should reject past scheduled time", () => {
      const pastTime = new Date(Date.now() - 60000).toISOString();
      const invalidData = {
        description: "Valid post",
        scheduledTime: pastTime,
      };

      const result = postSchema.validate(invalidData);
      expect(result.error?.message).toContain(
        "Please select a future date and time"
      );
    });

    it("should reject current time", () => {
      const currentTime = new Date().toISOString();
      const invalidData = {
        description: "Valid post",
        scheduledTime: currentTime,
      };

      const result = postSchema.validate(invalidData);
      expect(result.error?.message).toContain(
        "Please select a future date and time"
      );
    });

    it("should reject invalid date format", () => {
      const invalidData = {
        description: "Valid post",
        scheduledTime: "invalid-date",
      };

      const result = postSchema.validate(invalidData);
      expect(result.error?.message).toContain(
        "Please select a valid date and time"
      );
    });

    it("should reject missing scheduled time", () => {
      const invalidData = {
        description: "Valid post",
      };

      const result = postSchema.validate(invalidData);
      expect(result.error?.message).toContain("Please select a date and time");
    });
  });

  describe("complete form validation", () => {
    it("should validate a complete valid form", () => {
      const validData = {
        description: "This is a complete valid post",
        scheduledTime: new Date(Date.now() + 120000).toISOString(),
      };

      const result = postSchema.validate(validData);
      expect(result.error).toBeUndefined();
      expect(result.value).toEqual(validData);
    });

    it("should reject form with multiple errors", () => {
      const invalidData = {
        description: "",
        scheduledTime: new Date(Date.now() - 60000).toISOString(),
      };

      const result = postSchema.validate(invalidData);
      expect(result.error).toBeDefined();
      // Should have at least one error
      expect(result.error?.details.length).toBeGreaterThan(0);
    });
  });
});
