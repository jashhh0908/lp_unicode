import api from "./api"

export const createDocument = async (title, content) => {
    const document = await api.post('/create', {title, content});
    return document;
}

export const getDocuments = async () => {
    const response = await api.get('/document/read');
    return response.data;
}
