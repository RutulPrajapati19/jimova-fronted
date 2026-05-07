import axios from "axios";

const API = axios.create({
  baseURL: "https://jimova-backend-1.onrender.com",
});
delete API.defaults.headers.common["Authorization"];
export default API;
