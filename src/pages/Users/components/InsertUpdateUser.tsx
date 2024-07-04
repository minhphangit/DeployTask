import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, message, Select } from "antd";
import { insertUser, updateUser } from "../api/user.api";
import { User } from "../data";

interface InsertUpdateUserProps {
  selectedUser: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const InsertUpdateUser: React.FC<InsertUpdateUserProps> = ({
  selectedUser,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const generateUniqueId = () => {
    const timestamp = Date.now().toString(36);
    return `${timestamp.toUpperCase()}`;
  };

  useEffect(() => {
    if (selectedUser) {
      form.setFieldsValue(selectedUser);
    } else {
      form.resetFields();
    }
  }, [selectedUser, form]);

  const onFinish = async (values: User) => {
    setLoading(true);
    try {
      if (selectedUser && selectedUser.id) {
        await updateUser({ ...selectedUser, ...values });
        message.success("User updated successfully");
        setLoading(false);
      } else {
        await insertUser(values);
        message.success("User added successfully");
        setLoading(false);
      }
      onSuccess();
    } catch (error) {
      message.error("Operation failed");
    }
  };

  return (
    <Modal
      title={selectedUser ? "Update User" : "Add User"}
      visible={true}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={form.submit}
          loading={loading}
        >
          Submit
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="horizontal"
        onFinish={onFinish}
        initialValues={{
          idAccount: generateUniqueId(),
          accountType: "HS",
          gender: "male",
          status: "active",
          createAt: new Date().toISOString().slice(0, 10),
        }}
      >
        <Form.Item name="idAccount" label="Mã tài khoản">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="accountType"
          label="Loại tài khoản"
          rules={[
            {
              required: true,
              message: "Please select a type user!",
            },
          ]}
        >
          <Select
            defaultValue="HS"
            style={{ width: 120 }}
            options={[
              { value: "GV", label: "Giảng viên" },
              { value: "HS", label: "Sinh viên" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu!",
            },
            {
              min: 6,
              message: "Mật khẩu phải có ít nhất 6 ký tự!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          hidden={selectedUser ? true : false}
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          rules={[
            {
              required: true,
              message: "Vui lòng xác nhận mật khẩu!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!")
                );
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="birthday"
          label="Ngày sinh"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập ngày sinh!",
            },
          ]}
        >
          <Input type="date" />
        </Form.Item>
        {/* CreateAt date now */}
        <Form.Item name="createAt" hidden label="Ngày tạo">
          <Input type="date" hidden defaultValue={Date.now()} />
        </Form.Item>
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập họ và tên!",
            },
            {
              pattern: new RegExp(/^[\p{L}]+([\s][\p{L}]+)+$/u),
              message: "Vui lòng nhập họ và tên đúng định dạng!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập email!",
            },
            {
              pattern: new RegExp(/\S+@\S+\.\S+/),
              message: "Vui lòng nhập email đúng định dạng!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số điện thoại!",
            },
            {
              pattern: new RegExp(/(84|0[3|5|7|8|9])+([0-9]{8})\b/),
              message: "Vui lòng nhập số điện thoại đúng định dạng!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn giới tính!",
            },
          ]}
        >
          <Select
            defaultValue="male"
            style={{ width: 120 }}
            options={[
              { value: "male", label: "Nam" },
              { value: "female", label: "Nữ" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn trạng thái!",
            },
          ]}
        >
          <Select
            defaultValue="active"
            style={{ width: 120 }}
            options={[
              { value: "deactive", label: "Deactive" },
              { value: "active", label: "Active" },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InsertUpdateUser;
