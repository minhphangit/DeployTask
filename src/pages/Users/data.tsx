import { ColumnsType } from "antd/lib/table";
import {
  ArrowsAltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditFilled,
  EyeOutlined,
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { Alert, Button, Popconfirm, Tag } from "antd";

export type ImportUser = User & {
  validateStatus: string;
  errors: string[];
};
export type User = {
  key: number;
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  status: string;
  birthday: Date;
  createAt: Date;
  accountType: string;
  idAccount: string;
  sentStatus: boolean;
};

const tableColumns: ColumnsType<User> = [
  {
    title: "#",
    dataIndex: "key",
    key: "key",
    render: (text: any, record: any, index: number) => {
      return <span>{index + 1}</span>;
    },
  },
  {
    title: "Mã tài khoản",
    dataIndex: "idAccount",
    key: "idAccount",
  },
  {
    title: "Họ và tên",
    dataIndex: "name",
    key: "name",
    sorter: {
      compare: (a: any, b: any) => a.name.localeCompare(b.name),
      multiple: 4,
    },
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    sorter: {
      compare: (a: any, b: any) => a.email.localeCompare(b.email),
      multiple: 3,
    },
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
    key: "phone",
    sorter: {
      compare: (a: any, b: any) => a.phone.localeCompare(b.phone),
      multiple: 2,
    },
  },
  {
    title: "Giới tính",
    dataIndex: "gender",
    key: "gender",
    sorter: {
      compare: (a: any, b: any) => a.gender.localeCompare(b.gender),
      multiple: 1,
    },
    render: (text: any, record: any) => {
      return <span>{text === "female" ? "Nữ" : "Nam"}</span>;
    },
  },
  {
    title: "Ngày sinh",
    dataIndex: "birthday",
    key: "birthday",
    render: (text: any, record: any) => {
      return (
        <span>
          {new Date(text).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      );
    },
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    sorter: {
      compare: (a: any, b: any) => a.status.localeCompare(b.status),
      multiple: 0,
    },
    render: (text: any, record: any, index: number) => {
      let color = text === "active" ? "green" : "red";
      let icon = text === "active" ? <UnlockOutlined /> : <LockOutlined />;
      return (
        <>
          <Tag className="cursor-pointer py-1 px-2" color={color} icon={icon}>
            {text === "active" ? "Hoạt động" : "Khóa"}
          </Tag>
        </>
      );
    },
  },
  {
    title: "Ngày tạo",
    dataIndex: "createAt",
    key: "createAt",
    render: (text: any, record: any) => {
      return (
        <span>
          {new Date(text).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </span>
      );
    },
  },
  {
    title: "Loại tài khoản",
    dataIndex: "accountType",
    key: "accountType",
    sorter: {
      compare: (a: any, b: any) => a.accountType.localeCompare(b.accountType),
      multiple: 5,
    },
    render: (text: any, record: any) => {
      return <span>{text === "HS" ? "Sinh viên" : "Giảng viên"}</span>;
    },
  },
];

const importColumns: ColumnsType<ImportUser> = [
  { title: "STT", dataIndex: "stt", key: "stt" },
  { title: "Họ tên", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Mật khẩu", dataIndex: "password", key: "password" },
  { title: "Giới tính", dataIndex: "gender", key: "gender" },
  { title: "Ngày sinh", dataIndex: "birthday", key: "birthday" },
  { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
  { title: "Loại tài khoản", dataIndex: "accountType", key: "accountType" },
  {
    title: "Trạng thái",
    dataIndex: "validateStatus",
    key: "validateStatus",
    filters: [
      {
        text: "Hợp lệ",
        value: "Hợp lệ",
      },
      {
        text: "Chưa hợp lệ",
        value: "Chưa hợp lệ",
      },
    ],
    onFilter: (value, record) => {
      return record.validateStatus === value;
    },
    render: (text: any) => {
      return (
        <Alert
          message={text === "Hợp lệ" ? "Hợp lệ" : "Chưa hợp lệ"}
          type={text === "Hợp lệ" ? "success" : "error"}
        />
      );
    },
  },
  {
    title: "Lỗi",
    dataIndex: "errors",
    key: "errors",
    render: (errors: string[]) => {
      return errors.length ? (
        <ul style={{ color: "red" }}>
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      ) : (
        "Không có lỗi"
      );
    },
  },
  {
    title: "Trạng thái gửi",
    dataIndex: "sentStatus",
    key: "sentStatus",
    render: (text) => text || <Tag color="blue">Chưa gửi</Tag>,
  },
];

// Define the actions column as a function to accept handlers
const actionsColumn = (
  openModalUpdate: (record: User) => void,
  handleDelete: (userId: number) => Promise<void>,
  loading: boolean
) => ({
  title: "Actions",
  key: "actions",
  render: (_text: any, record: User) => (
    <div>
      <Button icon={icons.edit} onClick={() => openModalUpdate(record)} />
      <Popconfirm
        title="Delete user?"
        description="Are you sure to delete this user?"
        okButtonProps={{ loading: loading }}
        onConfirm={() => handleDelete(record.id)}
        okText="Yes"
        cancelText="No"
      >
        <Button icon={icons.delete} danger />
      </Popconfirm>
    </div>
  ),
});

const icons = {
  edit: <EditFilled />,
  lock: <LockOutlined />,
  unlock: <UnlockOutlined />,
  delete: <DeleteOutlined />,
  add: <PlusOutlined />,
  search: <SearchOutlined />,
  reset: <ReloadOutlined />,
  valid: <CheckCircleOutlined />,
  invalid: <CloseCircleOutlined />,
  preview: <EyeOutlined />,
  move: <ArrowsAltOutlined />,
};

export { tableColumns, importColumns, icons, actionsColumn };
