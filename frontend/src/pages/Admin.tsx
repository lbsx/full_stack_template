import { useState } from "react"
import { Button, Layout, Menu, theme } from 'antd';
import { UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { t } from '../utils/i18n'
import { useRequireAuth, isAdmin } from "../utils/requireAuth";
import { Link, Outlet, useLocation } from "react-router-dom";


const { Header, Content, Sider } = Layout;
export function Admin() {
    useRequireAuth()
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const location = useLocation();
    const pathname = location.pathname.split("/")
    const currentRoute = pathname[pathname.length - 1]

    return isAdmin() ? (
        <Layout style={{ height: "95vh" }}>
            <Sider trigger={null}
                collapsible collapsed={collapsed}>
                <div className="demo-logo-vertical" />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={[currentRoute]}
                    items={[
                        // { 'key': 'tool', icon: <ToolOutlined />, label: <Link to="tool" >{t('admin.tool')}</Link> },
                        { 'key': 'user', icon: <UserOutlined />, label: <Link to="user" >{t('admin.user')}</Link> },
                    ]}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    ) : (<div>{t("permissionDenied")}</div>)
}

