import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import pkg from 'lodash';
const { omit } = pkg;
import UserModel, { UserDocument, UserInput } from "../models/user.model.js";

export async function createUser(input: Partial<UserInput>) {
  try {
    const user = await UserModel.create(input);
    return omit(user.toJSON(), "password");
  } catch (e: any) {
    throw new Error(e);
  }
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    return false;
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) return false;

  return omit(user.toJSON(), "password");
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query).lean();
}
export async function findUserById(id:string) {
  return UserModel.findById(id);
}

export async function findUserByEmail(email:string) {
  return UserModel.findOne({email});
}
export async function findAndUpdateUser(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>,
  options: QueryOptions
) {
  return UserModel.findOneAndUpdate(query, update, options);
}

