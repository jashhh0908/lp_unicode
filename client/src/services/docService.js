import api from "./api"

export const createDocument = async (title, content) => {
    const response = await api.post('/document/create', {title, content});
    return response.data;
}

export const getDocuments = async () => {
    const response = await api.get('/document/read');
    return response.data;
}

export const updateDocument = async (id, title, content) => {
    const response = await api.patch(`/document/update/${id}`, {title, content});
    return response.data;
}

export const deleteDocument = async (id) => {
    await api.delete(`document/delete/${id}`);
}