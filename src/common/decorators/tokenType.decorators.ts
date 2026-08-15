import { SetMetadata } from "@nestjs/common"
import { TokentypeEnum } from "../enums"

export const tokenName = "tokenType"

export const Token = (type: TokentypeEnum = TokentypeEnum.access) => {
    return SetMetadata(tokenName, type)

}