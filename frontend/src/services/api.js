import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.MODE === 'development' ? '' : 'https://oadiscussion.onrender.com',
});

export default api;
