import { compare, hash } from 'bcrypt'

export const GenerateHash = async (
    plaintext: string,
    salt_round: number = parseInt(process.env.SALT as string)
): Promise<string> => {
    return await hash(plaintext, salt_round)
}

export const CompareHash = async (
    plaintext: string,
    hashvalue: string
): Promise<boolean> => {
    return await compare(plaintext, hashvalue)
}