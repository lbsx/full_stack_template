import { Button, Drawer, DrawerProps, Form, Input, message, Select, Space, Switch } from "antd";
import { useEffect } from "react";
import { t } from "../utils/i18n";
import { Role, roleName, useRequireAuth } from "../utils/requireAuth";
import { updateUser } from "../api/user";
const { Option } = Select;

interface UserDetailProps {
    open: boolean;
    userDetail: UserDetailType | undefined;
    onClose: () => void;
}
function UserDetailDrawer({ open, userDetail, onClose }: UserDetailProps) {
    useRequireAuth(Role.admin);
    const [form] = Form.useForm<UserDetailType | undefined>();
    const size: DrawerProps['size'] = "large";

    useEffect(() => {
        if (userDetail)
            form.setFieldsValue(userDetail);
    }, [open, userDetail]);
    const handlerOk = () => {
        if (form) {
            updateUser(form.getFieldsValue() as UserDetailType, () => {
                message.success(t('updateSuccess'));
            });
        }
        onClose();

    }

    return (
        <>
            <Drawer
                title={`${userDetail?.username} info`}
                placement="right"
                size={size}
                onClose={onClose}
                open={open}
                extra={
                    <Space>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" onClick={handlerOk}>
                            OK
                        </Button>
                    </Space>
                }
            >
                {userDetail ? (
                    <Form form={form} layout="vertical">
                        <Form.Item name="id" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item name="username" label={t('login.username')} rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="email" label={t('login.email')} rules={[{ required: false }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="phone" label={t('login.phone')} rules={[{ required: false }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="status" label={t("status")} valuePropName="checked">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="role" label={t('role.title')} rules={[{ required: true }]}>
                            <Select>
                                <Option value={Role.admin}>{roleName[Role.admin]}</Option>
                                <Option value={Role.special}>{roleName[Role.special]}</Option>
                                <Option value={Role.user}>{roleName[Role.user]}</Option>
                                <Option value={Role.guest}>{roleName[Role.guest]}</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                ) : (
                    <p>{t('loading')}...</p>
                )}
            </Drawer>
        </>
    );
}

export default UserDetailDrawer;
