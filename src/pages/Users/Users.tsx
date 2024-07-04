import { Table, Button, message, Popconfirm } from "antd";
import React, { useState, useEffect } from "react";
import { ColumnsType } from "antd/lib/table";
import { actionsColumn, icons, tableColumns, User } from "./data";
import SearchFormUser from "./components/SearchFormUser";
import InsertUpdateUser from "./components/InsertUpdateUser";
import { deleteUser, searchUser } from "./api/user.api";
import ImportExcelUser from "./components/ImportExcelUser/ImportExcelUser";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response: any = await searchUser();
      setUsers(response.data);
    } catch (error) {
      message.error("Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSearch = async (values: Partial<User>) => {
    setLoading(true);
    try {
      const response: any = await searchUser(values);
      setUsers(response.data);
    } catch (error) {
      message.error("Không tìm thấy người dùng");
    }
    setLoading(false);
  };

  const openModalAdd = () => {
    setSelectedUser(null);
    setIsModalVisible(true);
  };

  const openModalUpdate = (record: User) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const onSaveSuccess = () => {
    setIsModalVisible(false);
    fetchUsers();
  };

  const handleDelete = async (userId: number) => {
    setLoading(true);
    try {
      await deleteUser(userId);
      message.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      message.error("Failed to delete user");
    }
    setLoading(false);
  };

  const columns: ColumnsType<User> = [
    ...tableColumns,
    actionsColumn(openModalUpdate, handleDelete, loading),
  ];

  return (
    <div className="p-5">
      <div className="flex justify-between">
        <a href="/">
          <h1 className="text-blue-400 font-bold text-xl">
            Quản lý người dùng
          </h1>
        </a>
        <div className="justify-between gap-3 flex">
          <Button onClick={openModalAdd} style={{ marginBottom: 16 }}>
            {icons.add} Add User
          </Button>
          <ImportExcelUser onSuccess={onSaveSuccess} />
        </div>
      </div>

      <SearchFormUser onSearch={onSearch} onResetData={fetchUsers} />
      <Table
        className="mt-5"
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
      {isModalVisible && (
        <InsertUpdateUser
          selectedUser={selectedUser}
          onSuccess={onSaveSuccess}
          onCancel={() => setIsModalVisible(false)}
        />
      )}
    </div>
  );
};

export default Users;
