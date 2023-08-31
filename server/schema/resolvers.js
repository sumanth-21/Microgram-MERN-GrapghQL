import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const resolvers = {
  Query: {
    loginUser: async (_, { input }) => {
      const { email, password } = input;
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          throw new Error("User does not exist.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("Invalid Credentials.");
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        delete user.password;
        console.log(user);
        return { token, user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    registerUser: async (_, { input }) => {
      const { firstName, lastName, email, password, picturePath } = input;
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: passwordHash, // Store the hashed password
        picturePath,
      });
      const savedUser = await newUser.save();

      // Return the user object without the password field
      const userWithoutPassword = { ...savedUser.toObject() };
      delete userWithoutPassword.password;
      delete userWithoutPassword.picturePath;

      return userWithoutPassword;
    },
  },
};
