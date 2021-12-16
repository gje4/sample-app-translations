export interface User {
    id: number;
    username?: string;
    email: string;
}

export interface SessionProps {
    access_token?: string;
    scope?: string;
    user: User;
    context: string;
    store_hash?: string;
    timestamp?: number;
    owner?: User;
    sub?: string;
}

export interface QueryParams {
    [key: string]: string | string[];
}
