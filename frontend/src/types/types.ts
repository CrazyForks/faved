export type UsetType = {
    username: string,
    password: string,
    passwordConfirm: string,
}
export type UsernameType = Omit<UsetType, 'password' | 'passwordConfirm'>;
export type PasswordType = Omit<UsetType, 'username'>;
export type LoginType = Omit<UsetType, 'passwordConfirm'>;

export type ItemType = {
    id: string;
    title: string;
    description: string;
    url: string;
    comments: string;
    image: string;
    tags: string[];
    created_at: string;
    updated_at: string | null;
}
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
}
export type TagsObjectType = {
    [tagId: number | string]: TagType; // Use number if tagId is a number, otherwise use string
}

// export type BookmarkType = {
//     id: number;
//     title: string;
//     description: string;
//     url: string;
//     comments: string;
//     image: string;
//     tags: number[]; // Assuming tag IDs are numbers
//     created_at: string;
//     updated_at: string | null;
// }
