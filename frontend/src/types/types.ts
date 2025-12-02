import z from 'zod';

export type CreateUserType = {
  username: string;
  password: string;
  confirm_password: string;
};

export type LoginType = {
  username: string;
  password: string;
};

export type UpdateUsernameType = {
  username: string;
};

export type UserType = {
  id: number;
  username: string;
};

export type UpdatePasswordType = {
  password: string;
  confirm_password: string;
};

export const UrlSchema = z
  .string()
  .trim()
  .min(1, { message: 'URL is required' })
  .transform((val) => (val.includes(':') ? val : `https://${val}`))
  .pipe(z.url());

export const ItemSchema = z.object({
  id: z.any().optional(),
  title: z.string().min(1, { message: 'Title is required' }),
  url: UrlSchema,
  description: z.string().optional(),
  comments: z.string().optional(),
  image: UrlSchema.optional().or(z.literal('')),
  tags: z.array(z.any()).optional(),
  created_at: z.any().optional(),
  updated_at: z.any().optional(),
});

export type ItemType = z.infer<typeof ItemSchema>;

export type TagType = {
  id: number | string;
  parent: number | string; // Or number | undefined // Assuming parent is also a tag ID. Could also be Tag | null
  title: string;
  description?: string; // Optional
  color: string;
  pinned: boolean; // Or boolean if you prefer
  created_at: string;
  updated_at: string | null;
  fullPath: any;
};
export type TagsObjectType = {
  [tagId: number | string]: TagType; // Use number if tagId is a number, otherwise use string
};
