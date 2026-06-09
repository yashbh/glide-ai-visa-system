export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  country: string | null;
  visa_type: string | null;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface VisaRequirement {
  id: string;
  country: string;
  visa_type: string;
  category: string;
  requirement_key: string;
  title: string;
  description: string;
  threshold: string | null;
  recommendation: string;
  question_hint: string | null;
  display_order: number;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  flag: string;
  gradient: string;
  visa_type: string;
}

export interface Document {
  id: string;
  user_id: string;
  conversation_id: string | null;
  country: string;
  title: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  status: "uploaded" | "verified" | "rejected" | "processing";
  created_at: string;
}
