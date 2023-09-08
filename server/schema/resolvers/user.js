import User from "../../models/User.js";

export const user = {
  Query: {
    getUser: async (_, { input }) => {
      const { id } = input;
      try {
        const user = await User.findById(id);
        if (!user) {
          throw new Error("User not found");
        }
        delete user.password;
        return user;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    getUserFriends: async (_, { input }) => {
      const { id } = input;
      try {
        const user = await User.findById(id);
        if (!user) {
          throw new Error("User not found");
        }
        const userFriends = await Promise.all(
          user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = userFriends.map(
          ({ _id, firstName, lastName, picturePath }) => {
            return { _id, firstName, lastName, picturePath };
          }
        );
        return formattedFriends;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
  Mutation: {
    updateUserFriend: async (_, { input }) => {
      const { userId, friendId } = input;
      try {
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);
        if (user.friends.includes(friendId)) {
          user.friends = user.friends.filter((id) => id !== friendId);
          friend.friends = friend.friends.filter((id) => id !== friendId);
        } else {
          user.friends.push(friendId);
          friend.friends.push(userId);
        }
        await user.save();
        await friend.save();
        const userFriends = await Promise.all(
          user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = userFriends.map(
          ({ _id, firstName, lastName, picturePath }) => {
            return { _id, firstName, lastName, picturePath };
          }
        );
        return formattedFriends;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};
