import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(100, "Workspace name is too long"),
  description: z.string().trim().max(500, "Description is too long").optional().nullable(),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;
