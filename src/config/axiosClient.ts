import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://666fe29a0900b5f872488ea1.mockapi.io/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
