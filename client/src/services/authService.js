import api from "./api.js";

export const login = async (email, password) => {
    const response = await api.post('/login', {email, password});
    return response.data;
};

export const register = async (name, email, dob, password) => {
    const response = await api.post('/register', {name, email, dob, password});
    return response.data;
}