import type { GetProp, TableProps } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
export interface PaginationData<T> {
    page: number,
    page_size: number,
    total: number,
    data: T[]
}

export type ColumnsType<T extends object = object> = TableProps<T>['columns'];
export type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;


export interface TableParams {
    pagination?: TablePaginationConfig;
    sortField?: SorterResult<any>['field'];
    sortOrder?: SorterResult<any>['order'];
    filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}


export enum StorageEnum {
	UserInfo = "userInfo",
	UserToken = "userToken",
	Settings = "settings",
	I18N = "i18nextLng",
}