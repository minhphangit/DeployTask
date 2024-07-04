import { ExcelRenderer } from "react-excel-renderer";
import * as yup from "yup";
import type { RcFile } from "antd/es/upload";

const schema = yup.object().shape({
  name: yup.string().required("Họ tên không được để trống"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Email không được để trống"),
  password: yup.string(),
  gender: yup.mixed().oneOf(["Nam", "Nữ"], "Giới tính không hợp lệ"),
  birthday: yup
    .date()
    .typeError("Ngày sinh không hợp lệ")
    .required("Ngày sinh không được để trống"),
  phone: yup.string().matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
  accountType: yup.string().required("Loại tài khoản không được để trống"),
});

const fields = [
  "name",
  "email",
  "password",
  "gender",
  "birthday",
  "phone",
  "accountType",
];

export const validateRow = async (
  row: any[]
): Promise<{ status: string; errors: string[] }> => {
  const errors: string[] = [];
  for (const field of fields) {
    try {
      await schema.validateAt(field, {
        name: row[1],
        email: row[2],
        password: row[3] || "sachso",
        gender: row[4],
        birthday: row[5],
        phone: row[6],
        accountType: row[7],
      });
    } catch (error: any) {
      errors.push(error.message);
    }
  }
  return {
    status: errors.length ? "Chưa hợp lệ" : "Hợp lệ",
    errors,
  };
};

export const parseExcelFile = async (fileObj: RcFile): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    ExcelRenderer(fileObj, async (err: any, resp: any) => {
      if (err) {
        reject(err);
      } else {
        const rows = resp.rows.slice(1);

        if (rows.length > 1000) {
          reject(new Error("File exceeds the 1000 row limit"));
          return;
        }

        const users = await Promise.all(
          rows.map((row: any, index: number) => {
            return new Promise(async (resolveRow) => {
              setTimeout(async () => {
                const { status, errors } = await validateRow(row);
                resolveRow({
                  key: index,
                  stt: row[0],
                  name: row[1],
                  email: row[2],
                  password: row[3] || "sachso",
                  gender: row[4],
                  birthday: row[5],
                  phone: row[6],
                  accountType: row[7],
                  validateStatus: status,
                  errors,
                });
              }, 2000); // Giả lập thời gian chờ 2 giây cho mỗi dòng
            });
          })
        );
        resolve(users.filter((user) => user.stt !== undefined));
      }
    });
  });
};
