import { create } from 'zustand';
import { UserType } from '../types/login';
import { createJSONStorage, persist } from 'zustand/middleware';
import { StorageEnum } from '../types/common';


type UserStore = {
    userInfo: Partial<UserType>;
    userToken: string;
    // 使用 actions 命名空间来存放所有的 action
    actions: {
        setUserInfo: (userInfo: UserType) => void;
        setUserToken: (token: string) => void;
        clearUserInfoAndToken: () => void;
    };
};


const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            userInfo: {},
            userToken: "",
            actions: {
                setUserInfo: (userInfo) => {
                    set({ userInfo });
                },
                setUserToken: (userToken) => {
                    set({ userToken });
                },
                clearUserInfoAndToken() {
                    set({ userInfo: {}, userToken: "" });
                },
            },
        }),
        {
            name: "userStore", // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({
                [StorageEnum.UserInfo]: state.userInfo,
                [StorageEnum.UserToken]: state.userToken,
            }),
        },
    ),
);

export const useUserInfo = () => useUserStore((state) => state.userInfo);
// const { username, role } = useUserInfo();
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserRole = () => useUserStore((state) => state.userInfo.role);
export const useUserActions = () => useUserStore((state) => state.actions);
// const { setUserToken, setUserInfo } = useUserActions();