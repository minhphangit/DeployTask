import { Button, Drawer, Form, Input, message, Tag } from "antd";
import { formatDate, Mail, replaceVariables } from "../data";
import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { updateMail } from "../api/sendMail.api";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
import { htmlFooter, htmlHeader } from "./EditorContent/contants";
interface InsertUpdateMailProps {
  selectedMail: Mail | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const PreviewMail: React.FC<InsertUpdateMailProps> = ({
  selectedMail,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mailContent, setMailContent] = useState("");
  // Hàm để cập nhật nội dung email
  const updateMailContent = (values: any) => {
    const variables: any = {
      ten_hoc_sinh: values.nameStudent || "",
      ngay_sinh: formatDate(values.birthday || ""),
      ma_du_tuyen: values.applicationCode || "",
    };
    //update mail content with variables
    const updatedMailContent = replaceVariables(
      selectedMail?.mailContent || "",
      variables
    );
    setMailContent(updatedMailContent);
  };

  // set initial value for form and update mail content
  useEffect(() => {
    if (selectedMail) {
      console.log("««««« previewSelectedMail »»»»»", selectedMail);
      const initialValues = {
        ...selectedMail,
        mailSender: "abcxyztienz@gmail.com",
        birthday: selectedMail.birthday
          ? new Date(selectedMail.birthday).toISOString().split("T")[0]
          : "1999-01-01",
        sentDate: selectedMail.sentDate
          ? new Date(selectedMail.sentDate).toISOString().split("T")[0]
          : "1999-01-01",
      };
      form.setFieldsValue(initialValues);
      updateMailContent(initialValues);
    }
  }, [selectedMail]);

  // handle submit form
  const onFinish = async (values: Mail) => {
    setLoading(true);
    try {
      const updatedMail = { ...values, mailContent };
      // Send email using EmailJS
      const serviceID = `${process.env.REACT_APP_MAIL_SERVICE_ID}`;
      const templateID = `${process.env.REACT_APP_MAIL_TEMPLATE_ID}`;
      const userID = `${process.env.REACT_APP_MAIL_USER_ID}`;
      // Combine the HTML header, mail content, and footer
      const fullHtmlContent = `${htmlHeader}${updatedMail.mailContent}${htmlFooter}`;
      const templateParams = {
        to_email: updatedMail.mailReceiver,
        from_email: updatedMail.mailSender,
        subject: updatedMail.mailTitle,
        html: fullHtmlContent,
        to_name: updatedMail.nameStudent,
      };

      const result = await emailjs.send(
        serviceID,
        templateID,
        templateParams,
        userID
      );

      if (result.text === "OK") {
        await updateMail({
          ...selectedMail,
          ...values,
          status: true,
          sentDate: new Date(),
        });
        message.success("Email sent successfully");
        onSuccess();
        onCancel();
      } else {
        throw new Error("Failed to send email");
      }
    } catch (error) {
      console.log("««««« error »»»»»", error);
      message.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi các trường input thay đổi
  const handleInputChange = () => {
    const currentValues = form.getFieldsValue();
    updateMailContent(currentValues);
  };

  return (
    <Drawer
      title={"Xem trước"}
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
          {selectedMail?.status ? "Gửi lại" : "Gửi thư"}
        </Button>,
        <Button key="back" onClick={onCancel} className="me-2 float-end">
          Đóng
        </Button>,
      ]}
    >
      <Form
        form={form}
        onFinish={onFinish}
        className="flex"
        onValuesChange={handleInputChange}
      >
        <div className="w-[1300px]">
          <Form.Item
            name="mailTitle"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề mail!" }]}
          >
            <Input />
          </Form.Item>

          <div
            className="fr-view ql-editor border-2 drop-shadow-sm p-5"
            dangerouslySetInnerHTML={{ __html: mailContent }}
            style={{
              height: "calc(100vh - 300px)",
              overflowY: "auto",
              margin: "0px auto",
            }}
          />
        </div>
        <div className="w-1/2">
          <Form.Item
            labelCol={{ span: 8 }}
            name="mailSender"
            label="Mail gửi"
            rules={[{ required: true, message: "Vui lòng nhập mail gửi!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 8 }}
            name="mailReceiver"
            label="Mail nhận"
            rules={[{ required: true, message: "Vui lòng nhập mail nhận!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 8 }}
            name="nameStudent"
            label="ten_hoc_sinh"
            rules={[{ required: true, message: "Vui lòng nhập tên học sinh!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 8 }}
            name="birthday"
            label="ngay_sinh"
            rules={[{ required: true, message: "Vui lòng nhập ngày sinh!" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            labelCol={{ span: 8 }}
            name="applicationCode"
            label="ma_du_tuyen"
            rules={[{ required: true, message: "Vui lòng nhập mã dự tuyển!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item labelCol={{ span: 8 }} name="status" label="Trạng thái">
            <Tag className="p-2" color={selectedMail?.status ? "green" : "red"}>
              {selectedMail?.status ? "Đã gửi" : "Chưa gửi"}
            </Tag>
          </Form.Item>
          <Form.Item labelCol={{ span: 8 }} name="sentDate" label="Ngày gửi">
            <Input disabled type="date" className="font-bold text-gray-950" />
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
};

export default PreviewMail;
