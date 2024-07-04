import { Mail } from "../data";
import axiosClient from "../../../config/axiosClient";
import axios from "axios";

const uploadImage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `${process.env.REACT_APP_IMG_API_URL}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.data.url) {
      return response.data.data.url;
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
const searchMail = (params: Partial<Mail> = {}) =>
  axiosClient.get<Mail[]>("/mails", { params });
const insertMail = (data: Mail) => axiosClient.post("/mails", data);
const updateMail = (data: Mail) => axiosClient.put(`/mails/${data.id}`, data);
const deleteMail = (id: number) => axiosClient.delete(`/mails/${id}`);

export { searchMail, insertMail, updateMail, deleteMail, uploadImage };
