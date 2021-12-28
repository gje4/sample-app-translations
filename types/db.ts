import { SessionProps } from './index';

export interface StoreData {
    accessToken?: string;
    scope?: string;
    storeHash: string;
}

export interface UserData {
    email: string;
    username?: string;
}

export interface Db {
    setUser(session: SessionProps): Promise<void>;
    setStore(session: SessionProps): Promise<void>;
    setStoreUser(session: SessionProps): Promise<void>;
    getStore(): StoreData | null;
    getStoreToken(storeId: string): string | null;
    getDbLocales(storeId: string): string | null;
    addDbLocale(storeId: string, locale: object): Promise<void>;
    deleteStore(session: SessionProps): Promise<void>;
    deleteUser(session: SessionProps): Promise<void>;
}
