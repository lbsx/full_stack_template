import { message } from "antd"
import { updateUserApi } from "./api"

export function updateUser(user: UserDetailType, failFunc: () => void) {
    updateUserApi(user).then(res => {
        if (res.code === 0) {
            message.success(res.message)
            // getUsers()
        } else {
            failFunc();
            message.error(res.message)
        }
    })
}