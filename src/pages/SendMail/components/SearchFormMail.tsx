import { Button, Form, Input } from "antd";
import { useState } from "react";
import { icons } from "../../Users/data";

interface SearchFormMailProps {
  onSearch: (values: any) => void;
  openModalAdd: () => void;
  onResetData: () => void;
}

const SearchFormMail: React.FC<SearchFormMailProps> = ({
  onSearch,
  openModalAdd,
  onResetData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Handle open modal to add new mail
  const handleOpenModal = () => {
    openModalAdd();
  };

  // Handle submit form
  const onFinish = (values: any) => {
    setLoading(true);
    const keyWord = values.keyWord?.trim();
    const searchValues = { idMail: keyWord, mailName: keyWord };
    setTimeout(() => {
      onSearch(searchValues);
      setLoading(false);
    }, 500);
  };

  // Handle reset form
  const handleResetData = () => {
    form.resetFields();
    onResetData();
  };
  return (
    <Form form={form} name="control-hooks" onFinish={onFinish}>
      <Form.Item
        name="keyWord"
        label="Tên/Mã"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập Tên/Mã tìm kiếm!",
          },
        ]}
      >
        <div className="flex gap-3">
          <Input />
          <Button type="primary" htmlType="submit" loading={loading}>
            {icons.search} Tìm kiếm
          </Button>
          <Button onClick={handleResetData}>{icons.reset} Làm mới</Button>
          <Button onClick={handleOpenModal}>{icons.add} Thêm mới</Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default SearchFormMail;
