import { HydratedDocument } from "mongoose";
import { ICategory, RoleEnum } from "src/common";
import { Lean } from "src/DB/repository/database.repository";


export const endpoint = {

   create: [RoleEnum.admin, RoleEnum.superadmin, RoleEnum.user]
}

export class GetAllResponse {
   result: {
      docscount?: number;
      limit?: number;
      pages?: number;
      currentPage?: number;
      result: (Lean<ICategory> | HydratedDocument<ICategory> | null)[];
   }
}