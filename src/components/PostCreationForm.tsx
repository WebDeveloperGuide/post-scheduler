interface PostCreationFormProps {
  onSubmit: (data: { description: string; scheduledTime: string }) => void;
}

export function PostCreationForm({ onSubmit }: PostCreationFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      description: formData.get("description") as string,
      scheduledTime: formData.get("scheduledTime") as string,
    });
  };

  return (
    <section className="p-8 md:p-8 p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        What's on your mind
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <textarea
            name="description"
            className="w-full p-4 border border-gray-300 rounded-lg resize-y min-h-32 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Description"
            rows={6}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Post By
          </label>
          <input
            name="scheduledTime"
            type="datetime-local"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full p-4 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-200 hover:border-gray-400 transition-colors"
        >
          Submit
        </button>
      </form>
    </section>
  );
}
