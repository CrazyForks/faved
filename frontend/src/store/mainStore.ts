import {makeAutoObservable} from 'mobx';
import {toast} from 'sonner';
import {API_ENDPOINTS} from './api';
import {ActionType} from '@/components/dashboard/types';
import type {ItemType, LoginType, PasswordType, TagsObjectType, TagType, UsernameType, UsetType} from '@/types/types';

const stylesTost = () => ({
  width: 'auto',
  left: '50%',
  transform: 'translateX(-50%)'
});


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
  preSelectedItemSettingsModal: string | null = null;
  currentPage: number = 1;
  selectedTagId: string | null = '0'; // Default to '0' for no tag selected
  itemsOriginal: ItemType[] = [];
  isShowEditModal: boolean = false;

  constructor() {
    makeAutoObservable(this); // Makes state observable and actions transactional
  }

  runRequest = (endpoint: string, method: string, bodyFields: object, defaultErrorMessage: string, skipSuccessMessage: boolean = false, skipErrorMessage: boolean = false) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCookie('CSRF-TOKEN')
      },
    };
    if (method !== 'GET' && method !== 'HEAD' && Object.keys(bodyFields).length > 0) {
      options['body'] = JSON.stringify(bodyFields)
    }

    return fetch(endpoint, options)
      .then(response => {
        if (response.ok) {
          return response.json();
        }

        if (response.status === 401) {
          this.setIsAuthRequired(true)
        }
        if (response.status === 424) {
          this.setIsshowInitializeDatabasePage(true)
        }
        return response.json().then(data => {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        });
      })
      .then((data) => {
        if (typeof data.message !== 'undefined' && !skipSuccessMessage) {
          toast.success(data.message, {position: 'top-center', style: stylesTost()});
        }
        return data
      })
      .catch((err, data) => {
        if (!skipErrorMessage) {
          toast.error((err instanceof Error ? err.message : defaultErrorMessage), {
            position: 'top-center',
            style: stylesTost()
          })
        }

        return null;
      })
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
    this.runRequest(API_ENDPOINTS.tags.list, 'GET', {}, 'Error fetching tags')
      .then((data) => {
        if (data === null) {
          return;
        }
        this.setTags(data);
      })
  }
  onCreateTag = async (title: string) => {
    let tagID = null;

    await this.runRequest(API_ENDPOINTS.tags.create, 'POST', {title}, 'Error creating tag')
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

    this.runRequest(API_ENDPOINTS.tags.deleteTag(tagID), 'DELETE', {}, 'Error deleting tag')
      .finally(() => {
        this.fetchTags()
        this.fetchItems()
      })

  }
  onChangeTagTitle = async (tagID: string, title: string) => {

    this.runRequest(API_ENDPOINTS.tags.updateTitle(tagID), "PATCH", {title}, 'Error updating tag title')
      .finally(() => {
        this.fetchTags()
      })

  }
  onChangeTagColor = async (tagID: string, color: string) => {

    this.runRequest(API_ENDPOINTS.tags.updateColor(tagID), "PATCH", {color}, 'Error updating tag color')
      .finally(() => {
        const tag = {...this.tags[tagID as unknown as number], color}
        this.tags = {...this.tags, [tagID]: tag};
      })
  }
  onChangeTagPinned = async (tagID: string, pinned: boolean) => {

    this.runRequest(API_ENDPOINTS.tags.updatePinned(tagID), "PATCH", {pinned}, 'Error updating tag pinned')
      .finally(() => {
        const tag = {...this.tags[tagID as unknown as number], pinned}
        this.tags = {...this.tags, [tagID]: tag};
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
  setPreSelectedItemSettingsModal = (val: string) => {
    this.preSelectedItemSettingsModal = val;
  };
  fetchItems = async () => {

    this.runRequest(API_ENDPOINTS.items.list, 'GET', {}, 'Failed to fetch items')
      .then((data) => {
        if (data === null) {
          return
        }
        this.setItems(data);
        this.setItemsOriginal(data)

      });
  }
  onDeleteItem = async (id: number) => {
    this.runRequest(API_ENDPOINTS.items.deleteItem(id), 'DELETE', {}, 'Failed to delete item')
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

        toast(message, {position: 'top-center', style: stylesTost()})

      })
      .catch(err => toast(err.message, {position: 'top-center', style: stylesTost()}))
      .finally(() => {
        if (!onSave) {
          this.fetchItems()
          this.fetchTags()
          this.setCurrentPage(this.currentPage)
        }

      })
  }
  getUser = async (noErrorEmit: boolean = false) => {
    return this.runRequest(API_ENDPOINTS.settings.getUser, 'GET', {},
      'Failed to fetch user', true, noErrorEmit)
      .then(({data}) => {
        if (data?.user !== null) {
          this.setUser(data.user.username);
          return true;
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

        toast.success(response.message, {position: 'top-center', style: stylesTost()})
        return true
      })
      .catch((err) => {
        toast.error(err.message, {position: 'top-center', style: stylesTost()})
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
        toast(response.message, {position: 'top-center', style: stylesTost()})
        this.setUser(val.username);

      })
      .catch((err) => {
        toast(err.message, {position: 'top-center', style: stylesTost()})
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
        toast(response.message, {position: 'top-center', style: stylesTost()})
        reset()
      })
      .catch((err) => {
        toast(err.message, {position: 'top-center', style: stylesTost()})
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
        toast(response.message, {position: 'top-center', style: stylesTost()})
        this.unsetUser();
      })
      .catch((err) => {
        toast(err.message, {position: 'top-center', style: stylesTost()})
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
        toast(response.message, {position: 'top-center', style: stylesTost()})
        this.setIsAuthRequired(true);
      })
      .catch((err) => {
        toast(err.message, {position: 'top-center', style: stylesTost()})
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
      .finally(() => {
        setIsLoading(false)
      })
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
        this.setIsOpenSettingsModal(false);
        this.fetchItems();
        this.fetchTags();
        toast.success(response.message, {position: 'top-center', style: stylesTost()});
        return true;
      })
      .catch((err) => {
        toast.error(err.message, {position: 'top-center', style: stylesTost()});
        return false;
      })
      .finally(() => setIsLoading(false))
  };

  fetchUrlMetadata = (url: string) => {

    return this.runRequest(API_ENDPOINTS.urlMetdata.fetch(url), 'GET', {}, 'Error fetching metadata from URL')
  }
}

export default new mainStore();
