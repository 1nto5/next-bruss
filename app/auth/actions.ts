'use server'

import { connectToMongo } from '@/lib/mongo/connector'
import bcrypt from 'bcryptjs'

const collectionName = 'users'

function replacePolishChars(str: string): string {
  const polishChars: { [key: string]: string } = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
    Ą: 'A',
    Ć: 'C',
    Ę: 'E',
    Ł: 'L',
    Ń: 'N',
    Ó: 'O',
    Ś: 'S',
    Ź: 'Z',
    Ż: 'Z',
  }

  return str.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (match) => polishChars[match])
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

function isValidPassword(password: string): boolean {
  const hasMinLength = password.length >= 6
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)
  const hasNumber = /\d/.test(password)

  return hasMinLength && hasSpecialChar && hasNumber
}

export async function Register(fName: string, lName: string, password: string) {
  try {
    // Connect to MongoDB
    const collection = await connectToMongo(collectionName)

    const formattedFName = capitalizeFirstLetter(fName)
    const formattedLName = capitalizeFirstLetter(lName)

    // Constructing the email based on the provided fName and lName
    const email = `${replacePolishChars(formattedFName)}.${replacePolishChars(
      formattedLName
    )}@bruss-group.com`.toLowerCase()

    // Checking if a user with the given email already exists
    const existingUser = await collection.findOne({ email })
    if (existingUser) {
      return { status: 'exists' }
    }

    if (!isValidPassword(password)) {
      return { status: 'wrong password' }
    }

    // Encrypt the password before saving it to the database
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Saving the user in the database
    const result = await collection.insertOne({
      fName: formattedFName,
      lName: formattedLName,
      email,
      password: hashedPassword,
    })

    if (result.insertedId) {
      return { status: 'registered' }
    } else {
      return { status: 'error' }
      throw new Error('Failed to register the user.')
    }
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while registering.')
  }
}
