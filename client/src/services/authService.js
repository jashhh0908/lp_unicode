import api from "./api.js";

export const login = async (email, password) => {
    const response = await api.post('/login', {email, password});
    return response.data;
};