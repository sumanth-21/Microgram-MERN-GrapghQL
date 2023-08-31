export const userDefs = `#graphql
    type PublicUser {
        _id: ID!
        firstName: String!
        lastName: String!
        picturePath: String!
        followers: [ID]
    }

    type Query {
        getUser(input: GetUserInput!): PublicUser!
        getUserFriends(input: GetUserInput!): [PublicUser]!
    }

    type Mutation {
        updateUserFriend(input: updateUserFriendInput!): [PublicUser]!
    }
    
    input GetUserInput {
        id: ID!
    }
    
    input updateUserFriendInput {
        userId: ID!
        friendId: ID!
    }
`;
