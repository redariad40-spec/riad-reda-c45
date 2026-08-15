import { HydratedDocument } from "mongoose";
import { IBrand } from "src/common";
import { Lean } from "src/DB/repository/database.repository";

export class BrandResponse {
    brand: IBrand;
}

export class GetAllResponse {
    result: {
        docscount?: number;
        limit?: number;
        pages?: number;
        currentPage?: number;
    result: (Lean<IBrand> | HydratedDocument<IBrand> | null)[];
    }
}