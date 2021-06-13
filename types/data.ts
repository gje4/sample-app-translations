export interface FormData {
    [k: string]: any;
}

export interface TableItem {
    id: number;
    name: string;
    price: number;
    stock: number;
}

export interface ListItem extends FormData {
    id: number;
}

export interface StringKeyValue {
    [key: string]: string;
}
