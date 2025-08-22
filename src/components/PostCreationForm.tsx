import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { postSchema } from "../schemas/postSchema";
import type { PostFormData } from "../types/post";
import toast from "react-hot-toast";

interface PostCreationFormProps {
  onSubmit: (data: PostFormData) => void;
}

export function PostCreationForm({ onSubmit }: PostCreationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PostFormData>({
    resolver: joiResolver(postSchema),
    mode: "onChange",
  });

  const onFormSubmit = async (data: PostFormData) => {
    try {
      await onSubmit(data);
      reset();
      toast.success("Post scheduled successfully!");
    } catch (error) {
      console.error("Failed to submit post:", error);
      toast.error("Failed to schedule post. Please try again.");
    }
  };

  const setMinDateTime = () => {
    const now = new Date();
    const localDateTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    );
    return localDateTime.toISOString().slice(0, 16);
  };

  return (
    <section className="p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
        What's on your mind
      </h2>

      <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
        <div className="mb-4 md:mb-6">
          <textarea
            {...register("description")}
            className={`w-full p-3 md:p-4 border rounded-lg resize-y min-h-24 md:min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.description
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            placeholder="Description"
            rows={4}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="mb-4 md:mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Post By
          </label>
          <input
            {...register("scheduledTime")}
            type="datetime-local"
            min={setMinDateTime()}
            className={`w-full p-2 md:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.scheduledTime
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            disabled={isSubmitting}
          />
          {errors.scheduledTime && (
            <p className="text-red-500 text-sm mt-1">
              {errors.scheduledTime.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-3 md:p-4 border rounded-lg font-medium transition-colors cursor-pointer ${
            isSubmitting
              ? "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 hover:border-gray-400"
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            "Submit"
          )}
        </button>
      </form>
    </section>
  );
}
