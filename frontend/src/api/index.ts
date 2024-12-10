export * from "./http";
export * from "./types.d";

import { BaseModel } from "./http";
import { Shirt, ShirtType, User, Clothing } from "./types";

export const UserModel = new BaseModel<User>("/api/users/");
export const ShirtModel = new BaseModel<Shirt>("/api/shirts/");
export const ShirtTypeModel = new BaseModel<ShirtType>("/api/shirt-types/");
export const ClothingModel = new BaseModel<Clothing>("/api/clothing/");
