import { z } from "zod";

export const generalValidation = {
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    finalPath: z.string(),
    path: z.string(),
    destination: z.string(),
    filename: z.string(),
    size: z.number(),
  }),
};

export const paginationQuerySchema = {
  query: z.strictObject({
    page: z.int().default(1).optional(),
    limit: z.int().default(1).optional(),
    search: z.string().optional(),
  }),
};

export type paginationQuery = z.infer<typeof paginationQuerySchema.query>;
