import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  roleId: z.uuid(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
