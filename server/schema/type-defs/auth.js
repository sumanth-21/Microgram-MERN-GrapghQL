export const authDefs = `#graphql
    type Query {
        loginUser(input: LoginInput): AuthPayload!
    }
    type User {
        _id: ID!
        firstName: String!
        lastName: String!
        email: String!
        picturePath: String
    }

    type AuthPayload {
        token: String!
        user: User!
    }

    type Mutation {
        registerUser(input: RegisterInput!): User!
    }

    input RegisterInput {
        firstName: String!
        lastName: String!
        email: String!
        password: String!
        picturePath: String = ""
    }
    input LoginInput {
        email: String!
        password: String!
    }
`;
