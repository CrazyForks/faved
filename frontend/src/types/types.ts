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

export type ItemType = {
  id?: string;
  title: string;
  url: string;
  description?: string;
  comments?: string;
  image?: string;
  tags?: string[];
  updated_at?: any;
  created_at?: any;
};

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
