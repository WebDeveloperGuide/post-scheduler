export interface Post {
  id: string;
  timestamp: string;
  content: string;
  scheduledTime: string;
  status: "scheduled" | "published";
}

export type PostFormData = {
  description: string;
  scheduledTime: string;
};
