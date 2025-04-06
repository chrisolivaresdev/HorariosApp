import axios from 'axios';

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
      // Emitir un evento personalizado para redirigir al login
      const event = new CustomEvent('unauthorized', { detail: 'Usuario no autorizado' });
      window.dispatchEvent(event);

      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // Retornar una respuesta controlada para evitar que caiga en el catch
      return Promise.resolve({ data: null, status: 401 });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
