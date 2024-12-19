// api.ts
import qs from 'qs';
import { SignUpDataType, UserType } from "../types/login";
import { TableParams } from '../types/common';
// 登录接口返回的数据类型
interface ApiResponse<T = string> {
    code: number
    message: string,
    data?: T
}

const getRandomuserParams = (params: TableParams) => ({
    page: params.pagination?.current,
    pageSize: params.pagination?.pageSize,
    ...params,
});
async function request<T>(method: string, url: string, body: object = {}): Promise<ApiResponse<T>> {
    try {
        let requestBody: { method: string, headers: {}, body?: string } = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },

        }
        if (method == "POST") {
            requestBody.body = JSON.stringify(body)
        }
        const response = await fetch(url, requestBody);

        if (!response.ok) {
            return { code: 1, message: await response.text() }
        }
        // 解析响应的 JSON 数据
        const data: ApiResponse<T> = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}

// 封装登录请求的函数
export async function loginApi(username: string, password: string): Promise<ApiResponse<UserType>> {
    return request("POST", "/api/login", { username, password })
}

export async function signInApi(signUpData: SignUpDataType): Promise<ApiResponse> {
    return request("POST", "/api/user", signUpData)

}
export async function getUsersApi<T>(tableParams: TableParams): Promise<ApiResponse<T>> {
    console.log(tableParams);
    console.log(qs.stringify(getRandomuserParams(tableParams)));
    
    return request("GET", `/api/users?${qs.stringify(getRandomuserParams(tableParams))}`)
}
export async function deleteUserApi(userid: number): Promise<ApiResponse> {
    return request("DELETE", `/api/user/${userid}`)
}

export async function updateUserApi(user: UserDetail): Promise<ApiResponse> {
    return request("POST", `/api/user/${user.id}`, user)

}