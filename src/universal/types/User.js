// @flow

export type UserProfile = {
  lname: string,
  fname?: string,
  email?: string
}

export type UserInit = {
  username: string,
  profile: UserProfile,
}

export type UserToCreate = UserInit & {
  password: string,
  roles: Array<string>
}

export type User = UserInit & {
  id: number,
  roles?: Array<string>,
}
