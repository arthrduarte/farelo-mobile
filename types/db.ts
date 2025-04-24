export type Recipe = {
    id: string; // auto generated UUID
    title: string;
    description: string;
    ai_image_url: string; // URL to the AI generated image
    time: number; // int8 in minutes
    servings: number;
    ingredients: string[];
    instructions: string[];
    tags: string[];
    source_url: string; // URL to the source of the recipe
    user_image_url: string; // URL to the user's image
    notes: string;
    profile_id: string; // UUID of the user who created the recipe
    chat: JSON; // JSONB array of messages [{role: 'user' | 'ai', message: string, timestamp: timestamptz}]
};

export type Profile = {
    id: string; // UUID of the user
    user_id: string; // UUID of the user
    first_name: string;
    last_name: string;
    has_access: string; // "trial" | "paying" | NULL
    email: string;
    username: string;
    created_at: string; // timestamptz
    image: string;
};

export type Log = {
    id: string; // UUID of the log
    profile_id: string; // UUID of the user
    recipe_id: string; // UUID of the recipe
    description: string;
    images: string[]; // JSONB array of URLs to the images
    created_at: string; // timestamptz
};

export type Log_Like = {
    id: string; // UUID of the log like
    log_id: string; // UUID of the log
    profile_id: string; // UUID of the user
    created_at: string; // timestamptz
};

export type Log_Comment = {
    id: string; // UUID of the log comment
    log_id: string; // UUID of the log
    profile_id: string; // UUID of the user
    content: string;
    created_at: string; // timestamptz
};

export type Follow = {
    id: string; // UUID of the follow
    follower_id: string; // UUID of the follower
    following_id: string; // UUID of the following
    created_at: string; // timestamptz
};

