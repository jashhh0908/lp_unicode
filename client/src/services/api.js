import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
        const parsedData = JSON.parse(savedUser);
        if (parsedData.token) {
            config.headers.Authorization = `Bearer ${parsedData.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark it so we don't end up in an infinite loop!
            
            try {
                const res = await api.post('/refresh'); 
                
                const savedUser = JSON.parse(localStorage.getItem('user'));
                savedUser.token = res.data.token;
                localStorage.setItem('user', JSON.stringify(savedUser));
                
                originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
                return api(originalRequest);
                
            } catch (refreshError) {
                console.error("Refresh token expired. Hard logout required.");
                localStorage.removeItem('user');
                window.location.href = '/login'; 
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;