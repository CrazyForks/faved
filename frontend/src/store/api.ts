const API_BASE = '/api';

export const API_ENDPOINTS = {
    items: {
        list: `${API_BASE}/items`,
        deleteItem: (id: any) => `${API_BASE}/items?item-id=${id}`,
        createItem: `${API_BASE}/items`,
    },
    settings: {
        getUser: `${API_BASE}/settings/user`,
        create: `${API_BASE}/settings/user`,
        userName: `${API_BASE}/settings/username`,
        password: `${API_BASE}/settings/password`,
        delete: `${API_BASE}/settings/user`,
    },
    tags: {
        list: `${API_BASE}/tags`,
        create: `${API_BASE}/tags`,
        deleteTag: (id: any) => `${API_BASE}/tags?tag-id=${id}`,
        updateTitle: (id: any) => `${API_BASE}/tags/update-title?tag-id=${id}`,
        updateColor: (id: any) => `${API_BASE}/tags/update-color?tag-id=${id}`,
        updatePinned: (id: any) => `${API_BASE}/tags/update-pinned?tag-id=${id}`,
    },
    auth: {
        login: `${API_BASE}/auth`,
        logout: `${API_BASE}/auth/logout`,
    },
    setup: {
        setup: `${API_BASE}/setup/database`,
    },
    importBookmarks: {
        import: `${API_BASE}/import/pocket`,
    }
};