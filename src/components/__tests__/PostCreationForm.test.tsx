import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostCreationForm } from "../PostCreationForm";
import { createMockPostFormData } from "../../test/utils";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PostCreationForm", () => {
  const mockOnSubmit = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockClear();
  });

  it("should render form elements correctly", () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByText("What's on your mind")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Post By")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("should have proper form attributes", () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const form = screen.getByRole("form");
    expect(form).toHaveAttribute("noValidate");
  });

  it("should set minimum datetime to current time", () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const datetimeInput = screen.getByLabelText("Post By") as HTMLInputElement;
    const now = new Date();
    const minDateTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );
    const expectedMin = minDateTime.toISOString().slice(0, 16);

    expect(datetimeInput.min).toBe(expectedMin);
  });

  it("should show validation error for empty description", async () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show validation error for whitespace-only description", async () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "   ");

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Description is required")).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show validation error for missing scheduled time", async () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Valid description");

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please select a date and time")
      ).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should show validation error for past scheduled time", async () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Valid description");

    const datetimeInput = screen.getByLabelText("Post By");
    const pastTime = new Date(Date.now() - 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, pastTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please select a future date and time")
      ).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should submit form with valid data", async () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Valid post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        description: "Valid post content",
        scheduledTime: futureTime,
      });
    });
  });

  it("should show loading state during submission", async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Valid post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    expect(screen.getByText("Saving...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should disable form elements during submission", async () => {
    mockOnSubmit.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Valid post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    expect(textarea).toBeDisabled();
    expect(datetimeInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("should reset form after successful submission", async () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Valid post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(textarea).toHaveValue("");
      expect(datetimeInput).toHaveValue("");
    });
  });

  it("should handle submission errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockOnSubmit.mockRejectedValue(new Error("Submission failed"));

    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.type(textarea, "Valid post content");

    const datetimeInput = screen.getByLabelText("Post By");
    const futureTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);
    await user.type(datetimeInput, futureTime);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to submit post:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it("should apply error styling to invalid fields", async () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: "Submit" });
    await user.click(submitButton);

    await waitFor(() => {
      const textarea = screen.getByPlaceholderText("Description");
      expect(textarea).toHaveClass("border-red-500");
    });
  });

  it("should apply focus styling to valid fields", async () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    await user.click(textarea);

    expect(textarea).toHaveClass("focus:ring-blue-100");
  });

  it("should handle textarea resize", () => {
    render(<PostCreationForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText("Description");
    expect(textarea).toHaveClass("resize-y");
    expect(textarea).toHaveAttribute("rows", "4");
  });
});
