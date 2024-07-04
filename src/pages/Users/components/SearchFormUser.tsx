import React, { useState } from "react";
import { Form, Input, Button, Select } from "antd";
import { icons, User } from "../data";

interface SearchFormProps {
  onSearch: (values: User) => void;
  onResetData: () => void;
}

const SearchFormUser: React.FC<SearchFormProps> = ({
  onSearch,
  onResetData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values: User) => {
    setLoading(true);
    setTimeout(() => {
      onSearch(values);
      setLoading(false);
    }, 500);
  };
  const onReset = () => {
    form.resetFields();
    onResetData();
  };

  return (
    <Form
      form={form}
      name="control-hooks"
      onFinish={onFinish}
      initialValues={{
        accountType: "HS",
        gender: "male",
        status: "active",
      }}
    >
      <div className="flex gap-3">
        <Form.Item
          name="accountType"
          label="Loại tài khoản"
          rules={[
            {
              required: true,
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
        <Form.Item name="idAccount" label="Mã tài khoản">
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Họ và tên">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input />
        </Form.Item>
      </div>
      <div className="flex gap-3">
        <Form.Item name="phone" label="Số điện thoại">
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="Giới tính">
          <Select
            defaultValue="male"
            style={{ width: 120 }}
            options={[
              { value: "male", label: "Nam" },
              { value: "female", label: "Nữ" },
            ]}
          />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái">
          <Select
            defaultValue="active"
            style={{ width: 120 }}
            options={[
              { value: "deactive", label: "Khoá" },
              { value: "active", label: "Hoạt động" },
            ]}
          />
        </Form.Item>
      </div>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {icons.search}Tìm kiếm
        </Button>
        <Button className="ms-4" htmlType="button" onClick={onReset}>
          {icons.reset}Làm mới
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SearchFormUser;
