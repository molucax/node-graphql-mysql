import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLString,
} from 'graphql'
import { Users } from '../../Entities/Users'
import { UserType } from '../typeDefs/User'
import bcrypt from 'bcryptjs'
import { MessageType } from '../typeDefs/Message'

export const CREATE_USER = {
  type: UserType,
  args: {
    name: { type: GraphQLString },
    username: { type: GraphQLString },
    password: { type: GraphQLString },
  },
  async resolve(_: any, args: any) {
    const { name, username, password } = args
    const encryptedPassword = await bcrypt.hash(password, 10)
    const result = await Users.insert({
      name: name,
      username: username,
      password: encryptedPassword,
    })
    return {
      ...args,
      password: encryptedPassword,
      id: result.identifiers[0].id,
    }
  },
}

export const DELETE_USER = {
  type: GraphQLBoolean,
  args: {
    id: { type: GraphQLID },
  },
  async resolve(_: any, { id }: any) {
    const result = await Users.delete(id)
    if (result.affected === 1) return true
    return false
  },
}

export const UPDATE_USER = {
  type: MessageType,
  args: {
    id: { type: GraphQLID },
    input: {
      type: new GraphQLInputObjectType({
        name: 'UserInput',
        fields: {
          name: { type: GraphQLString },
          username: { type: GraphQLString },
          oldPassword: { type: GraphQLString },
          newPassword: { type: GraphQLString },
        },
      }),
    },
  },
  async resolve(_: any, { id, input }: any) {
    const userFound = await Users.findOneBy({ id: id })
    if (!userFound)
      return {
        success: false,
        message: 'User not found',
      }
    const isMatch = await bcrypt.compare(input.oldPassword, userFound.password)
    if (!isMatch)
      return {
        success: false,
        message: 'Old password is incorrect',
      }
    const newHashedPassword = await bcrypt.hash(input.newPassword, 10)
    const result = await Users.update(
      { id },
      {
        username: input.username,
        name: input.username,
        password: newHashedPassword,
      }
    )
    if (result.affected === 1)
      return { success: true, message: 'User updated successfully' }
    return false
  },
}
