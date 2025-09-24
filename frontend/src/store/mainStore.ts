import { makeAutoObservable } from 'mobx';
import { toast } from 'sonner';
import { API_ENDPOINTS } from './api';
import { ActionType } from '@/components/Dashboard/types';
import type { LoginType, PasswordType, UsernameType, UsetType, ItemType, TagsObjectType, TagType } from '@/types/types';

const stylesTost = () => ({
    width: 320,
    left: '50%',
    transform: 'translateX(-50%)'
});


const handleResponse = (promise, defaultErrorMessage, setIsAuthRequired) => {
    return promise
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    setIsAuthRequired(true)
                }
                return response.json().then(data => {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            toast(data.message, { position: 'top-center', style: stylesTost() });
            return data
        })
        .catch((err, data) => {
            toast.error((err instanceof Error ? err.message : defaultErrorMessage), { position: 'top-center', style: stylesTost() })
            return null
        })
};

const getCookie = (name: string) => {

    // Add a semicolon to the beginning of the cookie string to handle the first cookie
    const cookieString = "; " + document.cookie;

    // Split the string at the specified cookie name
    const parts = cookieString.split("; " + name + "=");

    // If the cookie was found (the array has more than one part)
    if (parts.length === 2) {
        // Return the value, which is everything after the '=' and before the next ';'
        return parts.pop().split(";").shift();
    }
    // If the cookie was not found
    return null;
}

class mainStore {
    items: ItemType[] = [];
    tags: TagsObjectType[] = [];
    type: ActionType = "" as ActionType
    user: { username: string } | null = null
    idItem: number | undefined = undefined;
    isAuthRequired = false;
    showInitializeDatabasePage = false;
    error: string | null = null;
    isOpenSettingsModal: boolean = false;
    selectedItemSettingsModal: string = "Authentication settings";
    currentPage: number = 1;
    selectedTagId: string | null = '0'; // Default to '0' for no tag selected
    itemsOriginal: ItemType[] = [];
    isShowEditModal: boolean = false;

    constructor() {
        makeAutoObservable(this); // Makes state observable and actions transactional
    }
    setIsshowInitializeDatabasePage = (val: boolean) => {
        this.showInitializeDatabasePage = val;
    }
    setCurrentTagId = (val: string | null | number) => {
        this.selectedTagId = val === null ? null : val.toString();
    }
    setUser = (username: string) => {
        this.user = {
            username: username,
        }
    }
    unsetUser = () => {
        this.user = null
    }
    setIsShowEditModal = (val: boolean) => {
        this.isShowEditModal = val
    }
    setCurrentPage = (val: number) => {
        this.currentPage = val;
    }
    setItemsOriginal = (val: ItemType[]) => {
        this.itemsOriginal = val;
    }
    setTags = (tags: TagsObjectType) => {
        const renderTagSegment = (tag: TagType) => {
            let output = ''
            if (tag.parent !== '0') {
                const parentTag = Object.values(tags).find(t => t.id.toString() === tag.parent.toString());
                if (parentTag) {
                    output += renderTagSegment(parentTag) + '/';
                }
            }
            output += tag.title.replaceAll('/', '\\/');
            return output;
        }

        for (const tagID in tags) {
            const tagId = tagID.toString()
            tags[tagId] = {
                ...tags[tagId],
                id: tags[tagId].id.toString(),
                parent: tags[tagId].parent.toString(),
                fullPath: renderTagSegment(tags[tagId]),
                pinned: !!tags[tagId].pinned
            };
        }
        this.tags = tags as unknown as TagsObjectType[];
    };
    setIsAuthRequired = (val: boolean) => {
        this.isAuthRequired = val;
    };
    fetchTags = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.tags.list, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.setTags(data);
        } catch (err) {
            toast.error('Error fetching tags', { position: 'top-center', style: stylesTost() })
        }
    }
    onCreateTag = async (title: string) => {
        let tagID = null;

        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                title
            })
        };

        await handleResponse(fetch(API_ENDPOINTS.tags.create, options), 'Error creating tag', this.setIsAuthRequired)
            .then((data) => {
                tagID = data?.data?.tag_id || null;
            })
            .finally(() => {
                this.fetchTags()
                this.fetchItems()
            })

        return tagID;
    }
    onDeleteTag = async (tagID: number) => {
        if (!confirm('Are you sure you want to delete this tag?')) {
            return;
        }

        const options = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
        };

        handleResponse(fetch(API_ENDPOINTS.tags.deleteTag(tagID), options), 'Error deleting tag', this.setIsAuthRequired)
            .finally(() => {
                this.fetchTags()
                this.fetchItems()
            })

    }
    onChangeTagTitle = async (tagID: string, title: string) => {
        const options = {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                title
            })
        };

        handleResponse(fetch(API_ENDPOINTS.tags.updateTitle(tagID), options), 'Error updating tag title', this.setIsAuthRequired)
            .finally(() => {
                this.fetchTags()
            })

    }
    onChangeTagColor = async (tagID: string, color: string) => {
        const options = {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                color
            })
        };

        handleResponse(
            fetch(API_ENDPOINTS.tags.updateColor(tagID), options),
            'Error updating tag color',
            this.setIsAuthRequired
        )
            .finally(() => {
                const tag = { ...this.tags[tagID as unknown as number], color }
                this.tags = { ...this.tags, [tagID]: tag };
            })
    }
    onChangeTagPinned = async (tagID: string, pinned: boolean) => {
        const options = {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                pinned
            })
        };
        fetch(API_ENDPOINTS.tags.updatePinned(tagID), options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => toast(data.message, { position: 'top-center', style: stylesTost() }))
            .catch(err => console.error(err))
            .finally(() => {
                const tag = { ...this.tags[tagID as unknown as number], pinned }
                this.tags = { ...this.tags, [tagID]: tag };
            })
    }

    setItems = (val: ItemType[]) => {
        this.items = val;
    };
    createItem = (val: ItemType) => {
        this.items = this.items.concat(val);
    };
    setType = (val: ActionType) => {
        this.type = val;
    };
    setIdItem = (val: number) => {
        this.idItem = val;
    };
    setIsOpenSettingsModal = (val: boolean) => {
        this.isOpenSettingsModal = val;
    };
    setSelectedItemSettingsModal = (val: string) => {
        this.selectedItemSettingsModal = val;
    };
    fetchItems = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },

        };
        const fetchItems = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.items.list, options);
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                this.setItems(data);
                this.setItemsOriginal(data)
            } catch (err) {
                this.error = (err instanceof Error ? err.message : 'Failed to fetch items');
                toast(err.message, { position: 'top-center', style: stylesTost() })
            }
        };


        return fetch(API_ENDPOINTS.settings.getUser, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then(async ({ data }) => {
                if (data.user !== null) {
                    this.setUser(data.user.username);
                }
                await fetchItems();
            })
            .catch(err => {
                toast(err.message, { position: 'top-center', style: stylesTost() })

            })


    }
    onDeleteItem = async (id: number) => {
        const options = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
        };
        fetch(API_ENDPOINTS.items.deleteItem(id), options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => toast(response.message, { position: 'top-center', style: stylesTost() }))
            .catch(err => toast(err.message, { position: 'top-center', style: stylesTost() }))
            .finally(() => {
                this.fetchItems()
                this.fetchTags()
            })
    }
    onCreateItem = (val: ItemType, isCreateCopy = false as boolean, onSave = false, closeWindow = null) => {
        const options = {
            method: onSave ? 'PATCH' : !isCreateCopy ? this.type === ActionType.EDIT ? 'PATCH' : 'POST' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                title: val.title || '',
                description: val.description || '',
                url: val.url || '',
                comments: val.comments || '',
                image: val.image || '',
                tags: val.tags
            })
        };

        fetch((isCreateCopy || this.type !== ActionType.EDIT ? API_ENDPOINTS.items.createItem : API_ENDPOINTS.items.updateItem(val.id)), options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then(response => {

                let message = response.message;
                if (closeWindow) {
                    message += "\n" + 'The window will close in 1 second.';
                    setTimeout(() => {
                        window.close()
                    }, 1000);
                }

                toast(message, { position: 'top-center', style: stylesTost() })

            })
            .catch(err => toast(err.message, { position: 'top-center', style: stylesTost() }))
            .finally(() => {
                if (!onSave) {
                    this.fetchItems()
                    this.fetchTags()
                    this.setCurrentPage(this.currentPage)
                }

            })
    }
    getUser = async (noErrorEmit = false) => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },

        };

        return fetch(API_ENDPOINTS.settings.getUser, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                if (response.data.user !== null) {
                    this.setUser(response.data.user.username);
                    return true;
                }
                return false;
            })
            .catch(err => {
                if (!noErrorEmit) {
                    toast(err.message, { position: 'top-center', style: stylesTost() })
                }
                return false;
            })

    }
    onCreateUser = async (val: UsetType) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                username: val.username || '',
                password: val.password || '',
                confirm_password: val.passwordConfirm || '',
            })
        };

        return fetch(API_ENDPOINTS.settings.create, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                this.setUser(val.username);

                toast.success(response.message, { position: 'top-center', style: stylesTost() })
                return true
            })
            .catch((err) => {
                toast.error(err.message, { position: 'top-center', style: stylesTost() })
                return false
            })

    }

    createUserName = (val: UsernameType) => {
        const options = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                username: val.username || '',

            })
        };

        fetch(API_ENDPOINTS.settings.userName, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                toast(response.message, { position: 'top-center', style: stylesTost() })
                this.setUser(val.username);

            })
            .catch((err) => {
                toast(err.message, { position: 'top-center', style: stylesTost() })
            })
    }
    createPassword = (val: PasswordType, reset: any) => {
        const options = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                password: val.password || '',
                confirm_password: val.passwordConfirm || '',
            })
        };

        fetch(API_ENDPOINTS.settings.password, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                toast(response.message, { position: 'top-center', style: stylesTost() })
                reset()
            })
            .catch((err) => {
                toast(err.message, { position: 'top-center', style: stylesTost() })
            })
    }
    deleteUser = () => {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
        };

        fetch(API_ENDPOINTS.settings.delete, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                toast(response.message, { position: 'top-center', style: stylesTost() })
                this.unsetUser();
            })
            .catch((err) => {
                toast(err.message, { position: 'top-center', style: stylesTost() })
            })
    }
    logOut = () => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
        };

        fetch(API_ENDPOINTS.auth.logout, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                toast(response.message, { position: 'top-center', style: stylesTost() })
                this.setIsAuthRequired(true);
            })
            .catch((err) => {
                toast(err.message, { position: 'top-center', style: stylesTost() })
            })
    }
    login = (values: LoginType, setIsLoading: (val: boolean) => void) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
            body: JSON.stringify({
                username: values.username || '',
                password: values.password || '',
            })
        };
        setIsLoading(true)
        fetch(API_ENDPOINTS.auth.login, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                this.setIsAuthRequired(false)
            })
            .catch((err) => {
                toast(err.message, {
                    position: 'top-center', style: stylesTost()
                })
            })
            .finally(() => { setIsLoading(false) })
    }
    initializeDatabase = async () => {
        const options = {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },

        };

        return fetch(API_ENDPOINTS.setup.setup, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                toast.success(response.message, {
                    position: 'top-center', style: stylesTost()
                })
                this.setIsAuthRequired(false)
                this.setIsshowInitializeDatabasePage(false)
                return true
            })
            .catch((err) => {
                toast.error(err.message, {
                    position: 'top-center', style: stylesTost()
                })
                return false
            })
    }
    importPocketBookmarks = async (selectedFile: File, setIsLoading: (val: boolean) => void) => {
        return this.importBookmarks(selectedFile, setIsLoading, 'pocket-zip', API_ENDPOINTS.importBookmarks.pocket)
    }

    importBrowserBookmarks = async (selectedFile: File, setIsLoading: (val: boolean) => void) => {
        return this.importBookmarks(selectedFile, setIsLoading, 'browser-html', API_ENDPOINTS.importBookmarks.browser)
    }
    importBookmarks = async (selectedFile: File, setIsLoading: (val: boolean) => void, inputName: string, endpointUrl: string) => {
        const formData = new FormData();
        formData.append(inputName, selectedFile);
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN'),
                'Accept': 'application/json',
            }
        };
        setIsLoading(true)
        return fetch(endpointUrl, options)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        this.setIsAuthRequired(true)
                    }
                    if (response.status === 424) {
                        this.setIsshowInitializeDatabasePage(true)
                    }
                    return response.headers.get('Content-Type')?.includes('application/json')
                        ? response.json().then(json => Promise.reject(json))
                        : response.text().then(text => Promise.reject(new Error(text)));
                }
                return response.json();
            })
            .then((response) => {
                this.isOpenSettingsModal = false;
                this.fetchItems();
                this.fetchTags();
                toast.success(response.message, { position: 'top-center', style: stylesTost() });
                return true;
            })
            .catch((err) => {
                toast.error(err.message, { position: 'top-center', style: stylesTost() });
                return false;
            })
            .finally(() => setIsLoading(false))
    };

    fetchUrlMetadata = (url: string) => {

        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
            },
        };

        return handleResponse(
          fetch(API_ENDPOINTS.urlMetdata.fetch(url), options),
          'Error fetching metadata from URL',
          this.setShowLoginPage
        )
    }
}

export default new mainStore();
