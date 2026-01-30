// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Asegúrate que coincida con tu backend
    withCredentials: true // Necesario para cookies o manejo seguro
});

// Interceptor de Request (Añade el token a cada petición)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de Response (Maneja los errores 401/403)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si recibimos 401 (No autorizado) y no hemos reintentado
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error("No token");

                // Intentamos refrescar
                const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
                    refreshToken
                });

                // Guardamos nuevo token
                localStorage.setItem('accessToken', data.accessToken);
                
                // Reintentamos la petición original
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // FALLÓ EL REFRESCO (Aquí ocurre la "Revocación")
                // Si el token fue borrado de la BD, caeremos aquí.
                console.error("Sesión expirada o revocada remotamente");
                localStorage.clear();
                window.location.href = '/login'; // Redirección forzada
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;