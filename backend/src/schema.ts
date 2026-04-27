import { z } from 'zod';

// Define the rules for an individual field (e.g., full_name, email)
const FieldSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean', 'date']).default('string'),
  required: z.boolean().default(false),
});

// Define the rules for the UI section
const UiSchema = z.object({
  views: z.array(z.string()).default(['data_table']), // Fallback to a table if missing
});

// Define the rules for an Entity (e.g., Customers, Products)
const EntitySchema = z.object({
  name: z.string(),
  fields: z.array(FieldSchema),
  ui: UiSchema.optional().default({ views: ['data_table'] }),
});

// Define the master rules for the entire App Configuration
export const AppConfigSchema = z.object({
  app_name: z.string().default('Untitled App'),
  version: z.string().default('1.0'),
  entities: z.array(EntitySchema).default([]),
  translations: z.any().optional(),
});