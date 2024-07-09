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
import ContentEditor from "./EditorContent/ContentEditor";
import DynamicEditor from "./EditorContent/DynamicEditor";

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

      // Chuyển đổi Blob URLs thành base64
      content = await convertBlobUrlsToBase64(content);

      // Trích xuất và xử lý hình ảnh base64
      const base64Images = extractBase64Images(content);

      // Kiểm tra kích thước hình ảnh
      const MAX_IMAGE_SIZE = 1024 * 1024;
      for (const base64 of base64Images) {
        const sizeInBytes = (base64.length * 3) / 4;
        if (sizeInBytes > MAX_IMAGE_SIZE) {
          throw new Error(
            `Hình ảnh quá lớn. Kích thước tối đa là ${
              MAX_IMAGE_SIZE / (1024 * 1024)
            }MB.`
          );
        }
      }

      // Tải lên hình ảnh
      const uploadedImages = await uploadImages(base64Images);
      if (!uploadedImages || uploadedImages.length !== base64Images.length) {
        throw new Error("Có lỗi xảy ra khi tải lên hình ảnh.");
      }

      // Thay thế base64 bằng URL
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
      message.error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi xử lý mail"
      );
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
              <Select
                placeholder="Chọn thư mục"
                showSearch
                filterOption={(input: any, option: any) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
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
              {/* <FroalaEditorComponent
                content={editorContent}
                onModelChange={handleEditorChange}
              /> */}
              {/* <ContentEditor /> */}
              <DynamicEditor
                value={editorContent}
                setValue={setEditorContent}
                isEditHtml={true}
                readOnly={false}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default InsertUpdateMail;
