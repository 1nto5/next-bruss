export type UserType = {
  _id: string;
  email: string;
  roles?: string[];
  source?: 'manual'; // only set for manual users
  password?: string; // bcrypt hash, only for manual users
};

export type UsersListType = {
  email: string;
  name: string;
}[];
