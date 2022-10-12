import Mix from '@ember/polyfills/types';
export declare type Nullable<T> = T | null | undefined;
export declare type PlainObject<T = string | number | boolean> = {
    [key: string]: T | PlainObject<T> | PlainObject<T>[] | undefined | null;
};
export declare type PlainHeaders = {
    [key: string]: string;
};
export declare type Method = 'HEAD' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
export declare type AjaxOptions = {
    url: string;
    type: Method;
    data?: PlainObject | BodyInit;
    headers?: PlainHeaders;
};
export declare type Credentials = 'omit' | 'same-origin' | 'include';
export declare type FetchOptions = Mix<AjaxOptions, {
    body?: BodyInit | null;
    method?: Method;
    credentials: Credentials;
}>;
export declare function isPlainObject(obj: any): obj is PlainObject;
