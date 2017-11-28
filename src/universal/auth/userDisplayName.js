// @flow

export default function userDisplayName(user: {
  +username: string,
  +profile?: {
    +lname?: string,
    +fname?: string,
  },
}): string {
  if (!user.profile || (!user.profile.fname && !user.profile.lname)) return user.username
  return [user.profile.fname, user.profile.lname].filter(Boolean).join(' ')
}

