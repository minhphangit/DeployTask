import { Button, Col, Drawer, Form, Input, message, Row, Select } from "antd";
import { insertMail, updateMail } from "../api/sendMail.api";
import {
  convertBlobUrlsToBase64,
  extractBase64Images,
  Folder,
  Mail,
  replaceBase64WithUrls,
  uploadImages,
} from "../data";
import React, { useEffect, useState } from "react";
import FroalaEditorComponent from "./EditorContent/FroalaEditor";
import { searchFolder } from "../api/folders.api";

interface InsertUpdateMailProps {
  selectedMail: Mail | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const InsertUpdateMail: React.FC<InsertUpdateMailProps> = ({
  selectedMail,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [folders, setFolders] = useState<Folder[]>([]);
  useEffect(() => {
    if (selectedMail) {
      form.setFieldsValue(selectedMail);
      setEditorContent(selectedMail.mailContent || "");
    } else {
      form.resetFields();
      setEditorContent("");
    }
  }, [selectedMail, form]);

  const onFinish = async (values: Mail) => {
    setLoading(true);
    try {
      let content = editorContent;
      content = await convertBlobUrlsToBase64(content);
      const base64Images = extractBase64Images(content);
      const uploadedImages = await uploadImages(base64Images);
      const updatedContent = replaceBase64WithUrls(content, uploadedImages);
      const updatedValues = { ...values, mailContent: updatedContent };

      if (selectedMail && selectedMail.id) {
        await updateMail({ ...selectedMail, ...updatedValues });
        message.success("Cập nhật mail thành công");
      } else {
        await insertMail(updatedValues);
        message.success("Thêm mail thành công");
      }
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      message.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (model: string) => {
    setEditorContent(model);
  };

  const fetchFolders = async () => {
    try {
      const response = await searchFolder();
      setFolders(response.data);
    } catch (error) {
      message.error("Failed to load folders");
    }
  };
  useEffect(() => {
    fetchFolders();
  }, []);
  return (
    <Drawer
      title={selectedMail ? "Cập nhập Mail" : "Thêm Mail"}
      closable
      destroyOnClose
      visible={true}
      placement="right"
      onClose={onCancel}
      width={1300}
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={form.submit}
          loading={loading}
          className="float-end"
        >
          Lưu thông tin
        </Button>,
        <Button key="back" onClick={onCancel} className="me-2 float-end">
          Đóng
        </Button>,
      ]}
    >
      <Form
        form={form}
        onFinish={onFinish}
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="mailName"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên mail!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="idMail"
              label="Mã"
              rules={[{ required: true, message: "Vui lòng nhập mã mail!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="mailTitle"
              label="Tiêu đề"
              rules={[
                { required: true, message: "Vui lòng nhập tiêu đề mail!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="folderId"
              label="Tên thư mục"
              rules={[
                { required: true, message: "Vui lòng nhập tên thư mục!" },
              ]}
            >
              <Select placeholder="Chọn thư mục">
                {folders.map((folder) => (
                  <Select.Option key={folder.folderId} value={folder.folderId}>
                    {folder.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item
              name="mailContent"
              label="Nội dung"
              labelCol={{ span: 2 }}
              wrapperCol={{ span: 22 }}
              rules={[
                {
                  validator: (_, value) => {
                    if (!editorContent || editorContent === "<p><br></p>") {
                      return Promise.reject("Vui lòng nhập nội dung mail!");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <FroalaEditorComponent
                content={editorContent}
                onModelChange={handleEditorChange}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default InsertUpdateMail;
