import { z } from "zod";

export const FieldTypeEnum = z.enum([
  "short_text",
  "long_text",
  "link",
  "file_upload",
  "single_select",
  "multi_select",
  "date",
  "repeatable_group",
]);

export const SchemaQuestionSchema = z.object({
  label: z.string().min(1),
  type: FieldTypeEnum,
  helper_text: z.string().nullable(),
  required: z.boolean(),
  config: z.record(z.unknown()),
});

export const SchemaBlockSchema = z.object({
  title: z.string().min(1),
  questions: z.array(SchemaQuestionSchema).min(1),
});

export const BriefingSchemaSchema = z.object({
  blocks: z.array(SchemaBlockSchema).min(1),
});

export type SchemaQuestionInput = z.infer<typeof SchemaQuestionSchema>;
export type SchemaBlockInput = z.infer<typeof SchemaBlockSchema>;
export type BriefingSchemaInput = z.infer<typeof BriefingSchemaSchema>;
