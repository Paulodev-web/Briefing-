export type FieldType =
  | "short_text"
  | "long_text"
  | "link"
  | "file_upload"
  | "single_select"
  | "multi_select"
  | "date"
  | "repeatable_group";

export type BriefingStatus = "draft" | "published" | "in_progress" | "completed";

export interface Briefing {
  id: string;
  title: string;
  client_name: string | null;
  status: BriefingStatus;
  access_token: string;
  created_at: string;
  updated_at: string;
}

export interface BriefingBlock {
  id: string;
  briefing_id: string;
  title: string;
  order_index: number;
  created_at: string;
}

export interface BriefingQuestion {
  id: string;
  block_id: string;
  label: string;
  helper_text: string | null;
  type: FieldType;
  required: boolean;
  order_index: number;
  config: Record<string, unknown>;
  created_at: string;
}

export interface BriefingAnswer {
  id: string;
  briefing_id: string;
  question_id: string;
  value_text: string | null;
  value_json: unknown | null;
  updated_at: string;
}

export interface BriefingUpload {
  id: string;
  briefing_id: string;
  question_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

// Estrutura gerada pelo Gemini / usada no form builder
export interface SchemaQuestion {
  label: string;
  type: FieldType;
  helper_text: string | null;
  required: boolean;
  config: Record<string, unknown>;
}

export interface SchemaBlock {
  title: string;
  questions: SchemaQuestion[];
}

export interface BriefingSchema {
  blocks: SchemaBlock[];
}
