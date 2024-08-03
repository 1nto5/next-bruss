export type UserType = {
  _id: string;
  email: string;
  roles?: string[];
};

export type UsersListType = {
  email: string;
  name: string;
}[];
