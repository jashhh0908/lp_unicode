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

export const exportDocument = async (id) => {
    const response = await api.get(`/document/${id}/export/pdf`, { responseType: 'blob' });
    return response.data;
}

export const getDocCollaborators = async (id) => {
    const response = await api.get(`/document/${id}/collaborators`);
    return response.data;
};

export const addUserAccess = async (id, email, type) => {
    const response = await api.patch(`/document/add-user-access/${id}`, { email, type });
    return response.data;
};

export const approveRequest = async (id, data) => {
    const response = await api.patch(`/document/approve-request/${id}`, data);
    return response.data;
};
