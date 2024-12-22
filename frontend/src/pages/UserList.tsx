import { useState, useEffect } from 'react';
import { Table, Button, Switch, message, Popconfirm, TableProps } from 'antd';

import { deleteUserApi, getUsersApi } from '../api/api';
import { Role, roleName, useRequireAuth } from '../utils/requireAuth';
import { t } from '../utils/i18n';
import { PaginationData, TableParams } from "../types/common"
import UserDetailDrawer from './UserDetail';
import { updateUser } from '../api/user';
type ColumnsType<T extends object = object> = TableProps<T>['columns'];


function UserListPage() {
    useRequireAuth(Role.admin);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userList, setUserList] = useState<UserDetailType[]>([])
    const [loading, setLoading] = useState(false);
    const [userDetailData, setUserDetailData] = useState<UserDetailType>();
    const [tableParams, setTableParams] = useState<TableParams>({
        pagination: {
            current: 1,
            pageSize: 10,
            total: 0,
            showTotal: (total) => `${total}`
        },
    });
    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = () => {
        setLoading(true)
        // 在组件加载时从后端接口获取数据
        getUsersApi<PaginationData<UserDetailType>>(tableParams).then(res => {
            if (res.code == 0 && res.data) {
                setUserList(res.data.data)
                setLoading(false)
                setTableParams({
                    ...tableParams,
                    pagination: {
                        ...tableParams.pagination,
                        total: res.data.total,
                    },
                });
            } else {
                message.error(res.message)
            }
        }
        )
    }


    const columns: ColumnsType<UserDetailType> = [
        {
            title: t('login.username'),
            dataIndex: 'username',
            key: 'username',
            sorter: true,
        },
        {
            title: t('login.email'),
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: t('login.phone'),
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: t('enable'), value: true },
                { text: t('disable'), value: false },
            ],
            render: (_text: string, record: UserDetailType) => (
                <Switch checked={record.status} onChange={(checked) => {
                    const updatedUserList = userList.map((user) =>
                        user.id === record.id ? { ...user, status: checked } : user
                    );
                    setUserList(updatedUserList);
                    updateUser({ ...record, status: checked }, () => {

                        // update fail, revert the changes
                        const revertedUserList = userList.map((user) =>
                            user.id === record.id ? { ...user, status: !checked } : user
                        );
                        setUserList(revertedUserList); // 恢复修改前的状态

                    });
                }} />
            ),
        },
        {
            title: t('role.title'),
            dataIndex: 'role',
            key: 'role',
            filters: Object.entries(roleName).map(([key, value]) => ({
                text: value,
                value: key,
            })),
            render: (role: number) => { return roleName[role] },
        },
        {
            title: t('action'),
            key: 'action',
            render: (_text: string, record: UserDetailType) => (
                <>
                    <Button type="default" onClick={() => showDetail(record)}>{t('detail')}</Button>
                    <Popconfirm
                        title="Are you sure delete this?"
                        onConfirm={() => deleteUser(record)}
                        okText={t("yes")}
                        cancelText={t('no')}
                    >
                        <Button type="default" danger>{t('delete')}</Button>
                    </Popconfirm>
                </>

            ),
        },
    ];




    const showDetail = (record: UserDetailType) => {
        setUserDetailData(record);
        setDrawerOpen(true);
    };
    const deleteUser = (record: UserDetailType) => {
        deleteUserApi(record.id).then(res => {
            if (res.code === 0) {
                message.success(res.message)
                getUsers()
            } else {
                message.error(res.message)
            }
        }
        )
    }

    useEffect(getUsers, [
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        tableParams?.sortOrder,
        tableParams?.sortField,
        JSON.stringify(tableParams.filters),
    ]);
    const handleTableChange: TableProps<UserDetailType>['onChange'] = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
        });

        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setUserList([]);
        }
    };
    return (
        <div>
            {/* <Button type="primary" onClick={() => setVisible(true)}>Add User</Button> */}
            <Table dataSource={userList} columns={columns}
                pagination={tableParams.pagination}

                loading={loading}
                onChange={handleTableChange}
                rowKey="id" scroll={{ y: 400 }} />

            <UserDetailDrawer open={drawerOpen} userDetail={userDetailData} onClose={() => { getUsers(); setDrawerOpen(false) }} />
        </div>
    );
};

export default UserListPage;
