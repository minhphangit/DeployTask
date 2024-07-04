import { UploadOutlined } from "@ant-design/icons";
import { Button, Modal, Spin, Table, Tag, Upload, message } from "antd";
import React, { useState } from "react";
import type { RcFile } from "antd/es/upload";
import { insertUser as apiInsertUser } from "../../api/user.api";
import { importColumns } from "../../data";
import { parseExcelFile } from "./user.validate";

type Props = {
  onSuccess: Function;
};

const ImportExcelUser = ({ onSuccess }: Props) => {
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<any[]>([]);
  const [loadingTip, setLoadingTip] = useState<string>("");

  const toggleModal = () => {
    if (visibleModal) {
      //modal đang mở => xử lý trước khi tắt nếu cần
    } else {
      //modal đang tắt => xử lý trước khi mở nếu cần
    }
    setVisibleModal(!visibleModal);
  };

  const fileHandler = (fileList: RcFile) => {
    setRows([]);
    setIsLoading(true);
    setLoadingTip("Đang đọc file Excel...");
    if (!fileList) {
      message.error("Không có tệp nào được tải lên!");
      setIsLoading(false);
      return false;
    }
    parseExcelFile(fileList)
      .then(setRows)
      .catch((error) => {
        if (error.message === "File exceeds the 1000 row limit") {
          message.error("Giới hạn file là 1000 dòng");
        } else {
          message.error("Đọc file excel không thành công!");
        }
      })
      .finally(() => {
        setIsLoading(false);
        setLoadingTip("");
      });

    return false;
  };

  const handelSubmitExcel = async () => {
    setIsLoading(true);
    setLoadingTip("Đang tạo tài khoản...");
    const validUsers = rows
      .filter((user) => user.validateStatus === "Hợp lệ")
      .map(({ validateStatus, errors, ...rest }) => ({
        ...rest,
        password: rest.password || "sachso",
        status: "active",
        createAt: new Date(),
        sentStatus: true,
      }));

    // Call api to insert user
    try {
      await Promise.all(
        validUsers.map(async (user) => {
          await apiInsertUser(user);
        })
      );
      message.success("User added successfully");
      onSuccess();
      setRows((prevRows) =>
        prevRows.map((row) => {
          if (row.validateStatus === "Hợp lệ") {
            return { ...row, sentStatus: <Tag color="green">Đã gửi</Tag> };
          }
          return row;
        })
      );
      // toggleModal();
    } catch (error) {
      console.log("««««« error »»»»»", error);
      message.error("Failed to add some users. Please try again");
    } finally {
      setIsLoading(false);
      setLoadingTip("");
    }
  };

  return (
    <React.Fragment>
      <Button onClick={() => toggleModal()}>Nhập người dùng từ excel</Button>

      <Modal
        open={visibleModal}
        title="NHẬP TỪ EXCEL"
        onCancel={() => toggleModal()}
        cancelText="Đóng"
        okText="Lưu dữ liệu"
        onOk={() => handelSubmitExcel()}
        okButtonProps={{
          loading: isLoading,
          disabled: rows.length === 0,
        }}
        centered
        width={1200}
      >
        <div
          style={{
            display: "flex",
            alignContent: "center",
            justifyContent: "start",
            columnGap: 10,
          }}
        >
          <Upload
            name="file"
            beforeUpload={fileHandler}
            accept=".xlsx"
            maxCount={1}
            onRemove={() => {
              setRows([]);
            }}
          >
            <Button icon={<UploadOutlined />}>
              Click to Upload Excel File
            </Button>
          </Upload>
          <span
            style={{
              fontSize: 14,
              textDecoration: "none",
              color: "blue",
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            <a
              href="/templates/ImportUser.xlsx"
              download
              style={{ color: "#0078b7" }}
            >
              Tải tệp mẫu
            </a>
          </span>
        </div>
        <div>
          <i>
            Giới hạn mỗi lần tạo là 1000 tài khoản, mật khẩu mặc định là
            "sachso"
          </i>
        </div>

        <Spin
          spinning={isLoading}
          tip={
            loadingTip ||
            (rows.length === 0 ? "Chưa có dữ liệu" : "Đang tạo tài khoản...")
          }
        >
          <div style={{ marginTop: 20 }}>
            <Table dataSource={rows} columns={importColumns} bordered />
          </div>
        </Spin>
      </Modal>
    </React.Fragment>
  );
};

export default ImportExcelUser;
