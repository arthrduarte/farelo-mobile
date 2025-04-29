import { Log_Comment, Log_Like, Recipe, Log, Profile } from "./db";

export type EnhancedLog = Log & {
    profile: Profile;
    recipe: Recipe;
    likes: Log_Like[];
    comments: Log_Comment[];
};