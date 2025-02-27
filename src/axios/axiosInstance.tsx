import axios from 'axios';
import { useContext } from "react"



// Crea una instancia de Axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', // Cambia esta URL por la base de tu API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token Bearer a cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Asumiendo que guardas el token en el almacenamiento local
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
