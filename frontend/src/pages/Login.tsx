import { useState } from "react";
import "./Login.css"
import { loginApi, signInApi } from "../api/api";
import { message } from 'antd';
import { useLocation, useNavigate } from "react-router-dom";
import { saveUserInfo } from "../utils/requireAuth";
import { t } from '../utils/i18n'
import { SignUpDataType, UserType } from "../types/login";



export default function Login() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [messageApi, contextHolder] = message.useMessage();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isLoginPage, setIsLoginPage] = useState(true)

    const [signUpData, setSignUpData] = useState<SignUpDataType>({
        username: '',
        password: '',
        passwordConfirm: '',
        email: '',
        phone: ''
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignUpData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    const signUp = async () => {
        if (!signUpData.username || !signUpData.password) {
            messageApi.error(t("login.passwordNotEmpty"))
            return
        }
        if (signUpData.password !== signUpData.passwordConfirm) {
            messageApi.error(t("login.passwordConfirmationFailed"))
            return
        }
        const data = await signInApi(signUpData)
        if (data.code === 0) {
            messageApi.success(data.message)
            setIsLoginPage(!isLoginPage)
        } else {
            messageApi.error({
                content: data.message,
            });
        }
    }
    const login = async () => {
        if (!username || !password) {
            messageApi.error(t("login.passwordNotEmpty"))
            return
        }
        const data = await loginApi(username, password)
        if (data.code === 0) {
            messageApi.success(t("success"))
            saveUserInfo(data.data as UserType)
            const redirectUrl = (new URLSearchParams(window.location.search)).get("url")
            if (redirectUrl) {
                window.location.href = window.origin + redirectUrl
                return
            }
            // 登录成功后，根据登录前保存的状态回跳
            let prevUrl = state?.from?.pathname || "/";
            navigate(prevUrl, { replace: true });
        } else {
            messageApi.error({
                content: data.message,
            });
        }
    }
    const signUpPage = () => (
        <>
            <h2>{t('login.signup')}</h2>
            <div className="input-box">
                <input type="text" placeholder={t('login.username')} name="username" value={signUpData.username} onChange={handleChange} />
                <input type="password" placeholder={t('login.password')} name="password" value={signUpData.password} onChange={handleChange} />
                <input type="password" placeholder={t('login.passwordConfirm')} name="passwordConfirm" value={signUpData.passwordConfirm} onChange={handleChange} />
                <input type="text" placeholder={t('login.email')} name="email" value={signUpData.email} onChange={handleChange} />
                <input type="text" placeholder={t('login.phone')} name="phone" value={signUpData.phone} onChange={handleChange} />
            </div>
            <button className="login-btn" onClick={signUp}>{t('login.signup')}</button><br />
        </>
    );

    const signInPage = () => (
        <>
            <h2>{t('login.login')}</h2>
            <div className="input-box">
                <input type="text" placeholder={t('login.username')} value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder={t('login.password')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") login() }} />
            </div>
            <button className="login-btn" onClick={login}>{t('login.login')}</button><br />
        </>
    );

    return (
        <div className="background" >
            {contextHolder}
            <div className="login-box">
                {isLoginPage ? signInPage() : signUpPage()}
                <p className="signup" onClick={() => setIsLoginPage(!isLoginPage)}>
                    {isLoginPage ? t('login.signup') : t('login.login')}
                </p>
            </div>
        </div>
    )
}