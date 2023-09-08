import { rule, shield, allow } from "graphql-shield";

const isAuthenticated = rule()((_, args, { user }) => {
  return user !== null;
});

export default shield(
  {
    Query: {
      getUser: isAuthenticated,
      getUserFriends: isAuthenticated,
    },
    Mutation: {
      registerUser: allow,
      updateUserFriend: isAuthenticated,
    },
  },
  {
    allowExternalErrors: true,
  }
);
