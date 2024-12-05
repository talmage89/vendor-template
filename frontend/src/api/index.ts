export * from "./http";
export * from "./types.d";

import { BaseModel } from "./http";
import { Artwork, User } from "./types";

export const ArtworkModel = new BaseModel<Artwork>("/api/artworks/");
export const UserModel = new BaseModel<User>("/api/users/");
