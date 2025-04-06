import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const navigate = useNavigate()
// Crea una instancia de Axios
const axiosInstance = axios.create({
  baseURL: 'https://chris-back-horarios.onrender.com/api', // Cambia esta URL por la base de tu API
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

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
  (response) => {
    // Devuelve la respuesta si no hay errores
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirige al usuario al login
      localStorage.removeItem("token")
      localStorage.removeItem("role")
       navigate("/login")
      // window.location.href = '/login'; // Cambia esta ruta por la del login en tu aplicación
    }
    return Promise.reject(error);
  })

export default axiosInstance;
