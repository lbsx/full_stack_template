import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { UserType } from '../types/login';
import { t } from './i18n';

export enum Role {
    admin = 8,
    special = 4,
    user = 2,
    guest = 1,
}
export const roleName: { [key: number]: string } = {
    [Role.admin]: t("role.admin"),
    [Role.special]: t("role.special"),
    [Role.user]: t("role.user"),
    [Role.guest]: t("role.guest"),
};
function isLoggedIn(): boolean {
    // return localStorage.getItem("user") !== null
    return document.cookie.includes("token")
}
export function saveUserInfo(user: UserType) {
    localStorage.setItem("user", JSON.stringify(user))
}

function getUser(): UserType {
    const user: UserType = JSON.parse(localStorage.getItem("user") || "{}")
    return user
}
export function isAdmin(): boolean {
    return getUser().role >= Role.admin
}
export function isAuthenticationPage(page: React.ReactNode, role: Role) {
    if (getUser().role < role) {
        return (<div>{t("permissionDenied")}</div>)
    }
    return page
}
export function useRequireAuth(role: Role = Role.guest) {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/login', { replace: true, state: { from: location } });
        }
        if (getUser().role < role) {
            navigate('/403', { replace: true, state: { from: location } });
        }
    }, [navigate, location]);

    // 返回空对象，以便在组件树中能正常使用此Hook
    return {};
};

