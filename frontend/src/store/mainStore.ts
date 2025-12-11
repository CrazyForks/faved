import { makeAutoObservable } from 'mobx';
import { toast } from 'sonner';
import { API_ENDPOINTS } from './api';
import {
  ActionType,
  CreateUserType,
  ItemType,
  LoginType,
  TagsObjectType,
  TagType,
  UpdatePasswordType,
  UpdateUsernameType,
  UserType,
} from '@/lib/types.ts';

const getCookie = (name: string) => {
  // Add a semicolon to the beginning of the cookie string to handle the first cookie
  const cookieString = '; ' + document.cookie;

  // Split the string at the specified cookie name
  const parts = cookieString.split('; ' + name + '=');

  // If the cookie was found (the array has more than one part)
  if (parts.length === 2) {
    // Return the value, which is everything after the '=' and before the next ';'
    return parts.pop().split(';').shift();
  }
  // If the cookie was not found
  return null;
};

class mainStore {
  items: ItemType[] = [];
  tags: TagsObjectType[] = [];
  type: ActionType = '' as ActionType;
  user: UserType | null = null;
  idItem: number | undefined = undefined;
  isAuthRequired = false;
  showInitializeDatabasePage = false;
  error: string | null = null;
  isOpenSettingsModal: boolean = false;
  preSelectedItemSettingsModal: string | null = null;
  selectedTagId: string | null = '0'; // Default to '0' for no tag selected
  itemsOriginal: ItemType[] = [];
  isShowEditModal: boolean = false;
  appInfo: {
    installed_version: string | null;
    latest_version: string | null;
    update_available: boolean | null;
  } | null = null;

  constructor() {
    makeAutoObservable(this); // Makes state observable and actions transactional
  }

  runRequest = (
    endpoint: string,
    method: string,
    bodyData: object | FormData,
    defaultErrorMessage: string,
    skipSuccessMessage: boolean = false,
    skipErrorMessage: boolean = false
  ) => {
    const options = {
      method: method,
      headers: {
        Accept: 'application/json',
        'X-CSRF-TOKEN': getCookie('CSRF-TOKEN'),
      },
    };

    if (!(bodyData instanceof FormData)) {
      options['headers']['Content-Type'] = 'application/json';
    }
    if (method !== 'GET' && method !== 'HEAD') {
      options['body'] = bodyData instanceof FormData ? bodyData : JSON.stringify(bodyData);
    }

    return fetch(endpoint, options)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        if (response.status === 401) {
          this.setIsAuthRequired(true);
        }
        if (response.status === 424) {
          this.setIsshowInitializeDatabasePage(true);
        }
        return response.json().then((data) => {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        });
      })
      .then((data) => {
        if (typeof data.message !== 'undefined' && !skipSuccessMessage) {
          toast.success(data.message, { position: 'top-center' });
        }
        return data;
      })
      .catch((reason) => {
        if (!skipErrorMessage) {
          toast.error(reason instanceof Error ? reason.message : defaultErrorMessage, {
            position: 'top-center',
          });
        }

        return null;
      });
  };
  setIsshowInitializeDatabasePage = (val: boolean) => {
    this.showInitializeDatabasePage = val;
  };
  setCurrentTagId = (val: string | null | number) => {
    this.selectedTagId = val === null ? null : val.toString();
  };
  setUser = (user: UserType) => {
    this.user = user;
  };

  unsetUser = () => {
    this.user = null;
  };
  setIsShowEditModal = (val: boolean) => {
    this.isShowEditModal = val;
  };
  setItemsOriginal = (val: ItemType[]) => {
    this.itemsOriginal = val;
  };
  setTags = (tags: TagsObjectType) => {
    const renderTagSegment = (tag: TagType) => {
      let output = '';
      if (tag.parent !== '0') {
        const parentTag = Object.values(tags).find((t) => t.id.toString() === tag.parent.toString());
        if (parentTag) {
          output += renderTagSegment(parentTag) + '/';
        }
      }
      output += tag.title.replaceAll('/', '\\/');
      return output;
    };

    for (const tagID in tags) {
      const tagId = tagID.toString();
      tags[tagId] = {
        ...tags[tagId],
        id: tags[tagId].id.toString(),
        parent: tags[tagId].parent.toString(),
        fullPath: renderTagSegment(tags[tagId]),
        pinned: !!tags[tagId].pinned,
      };
    }
    this.tags = tags as unknown as TagsObjectType[];
  };
  setIsAuthRequired = (val: boolean) => {
    this.isAuthRequired = val;
  };
  fetchTags = async () => {
    return this.runRequest(API_ENDPOINTS.tags.list, 'GET', {}, 'Error fetching tags').then((data) => {
      if (data === null) {
        return;
      }
      this.setTags(data);
    });
  };
  onCreateTag = async (title: string) => {
    let tagID = null;

    await this.runRequest(API_ENDPOINTS.tags.create, 'POST', { title }, 'Error creating tag')
      .then((data) => {
        tagID = data?.data?.tag_id || null;
      })
      .finally(() => {
        this.fetchTags();
        this.fetchItems();
      });

    return tagID;
  };
  onDeleteTag = async (tagID: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      return;
    }

    return this.runRequest(API_ENDPOINTS.tags.deleteTag(tagID), 'DELETE', {}, 'Error deleting tag').finally(() => {
      this.fetchTags();
      this.fetchItems();
    });
  };
  onChangeTagTitle = async (tagID: string, title: string) => {
    this.runRequest(API_ENDPOINTS.tags.updateTitle(tagID), 'PATCH', { title }, 'Error updating tag title').finally(
      () => {
        this.fetchTags();
      }
    );
  };
  onChangeTagColor = async (tagID: string, color: string) => {
    return this.runRequest(
      API_ENDPOINTS.tags.updateColor(tagID),
      'PATCH',
      { color },
      'Error updating tag color'
    ).finally(() => {
      const tag = { ...this.tags[tagID as unknown as number], color };
      this.tags = { ...this.tags, [tagID]: tag };
    });
  };
  onChangeTagPinned = async (tagID: string, pinned: boolean) => {
    return this.runRequest(
      API_ENDPOINTS.tags.updatePinned(tagID),
      'PATCH',
      { pinned },
      'Error updating tag pinned'
    ).finally(() => {
      const tag = { ...this.tags[tagID as unknown as number], pinned };
      this.tags = { ...this.tags, [tagID]: tag };
    });
  };

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
    return this.runRequest(API_ENDPOINTS.items.list, 'GET', {}, 'Failed to fetch items').then((data) => {
      if (data === null) {
        return;
      }
      this.setItems(data);
      this.setItemsOriginal(data);
    });
  };
  onDeleteItem = async (id: number) => {
    return this.runRequest(API_ENDPOINTS.items.deleteItem(id), 'DELETE', {}, 'Failed to delete item').finally(() => {
      this.fetchItems();
      this.fetchTags();
    });
  };
  onCreateItem = async (val: ItemType) => {
    return this.sendItemRequest(API_ENDPOINTS.items.createItem, 'POST', val);
  };
  onUpdateItem = async (val: ItemType, itemId) => {
    return this.sendItemRequest(API_ENDPOINTS.items.updateItem(itemId), 'PATCH', val);
  };
  sendItemRequest = async (endpoint, method, val: ItemType) => {
    return this.runRequest(
      endpoint,
      method,
      {
        title: val.title || '',
        description: val.description || '',
        url: val.url || '',
        comments: val.comments || '',
        image: val.image || '',
        tags: val.tags,
      },
      'Failed to create item'
    );
  };
  getUser = async (noErrorEmit: boolean = false) => {
    const response = await this.runRequest(
      API_ENDPOINTS.settings.getUser,
      'GET',
      {},
      'Failed to fetch user',
      true,
      noErrorEmit
    );

    if (!response?.data?.user) {
      return false;
    }
    this.setUser(response.data.user);
    return true;
  };

  createUser = async (values: CreateUserType) => {
    const response = await this.runRequest(API_ENDPOINTS.settings.create, 'POST', values, 'Failed to create user');

    if (response === null || !response?.data?.user) {
      return false;
    }

    this.setUser(response.data.user);
    return true;
  };

  updateUsername = async (values: UpdateUsernameType) => {
    const response = await this.runRequest(
      API_ENDPOINTS.settings.userName,
      'PATCH',
      values,
      'Failed to update username'
    );

    if (response === null) {
      return false;
    }

    this.setUser({ ...this.user, ...{ username: values.username } });
    return true;
  };

  updatePassword = async (values: UpdatePasswordType) => {
    const response = await this.runRequest(
      API_ENDPOINTS.settings.password,
      'PATCH',
      values,
      'Failed to update password'
    );
    if (response === null) {
      return false;
    }
    return true;
  };

  deleteUser = () => {
    return this.runRequest(API_ENDPOINTS.settings.delete, 'DELETE', {}, 'Failed to delete user').then((response) => {
      if (response === null) {
        return;
      }
      this.unsetUser();
    });
  };
  logOut = () => {
    return this.runRequest(API_ENDPOINTS.auth.logout, 'POST', {}, 'Failed to log out').then((response) => {
      if (response === null) {
        return;
      }
      this.setIsAuthRequired(true);
    });
  };

  login = async (values: LoginType) => {
    const response = await this.runRequest(API_ENDPOINTS.auth.login, 'POST', values, 'Failed to log in');

    if (response === null || !response?.data?.user) {
      return;
    }

    this.setIsAuthRequired(false);
    this.setUser(response.data.user);
  };
  initializeDatabase = async () => {
    return this.runRequest(API_ENDPOINTS.setup.setup, 'POST', {}, 'Failed to initialize database').then((response) => {
      if (response === null) {
        return false;
      }
      this.setIsAuthRequired(false);
      this.setIsshowInitializeDatabasePage(false);
      return true;
    });
  };
  importPocketBookmarks = async (selectedFile: File, setIsLoading: (val: boolean) => void) => {
    return this.importBookmarks(selectedFile, setIsLoading, 'pocket-zip', API_ENDPOINTS.importBookmarks.pocket);
  };

  importBrowserBookmarks = async (selectedFile: File, setIsLoading: (val: boolean) => void) => {
    return this.importBookmarks(selectedFile, setIsLoading, 'browser-html', API_ENDPOINTS.importBookmarks.browser);
  };
  importBookmarks = async (
    selectedFile: File,
    setIsLoading: (val: boolean) => void,
    inputName: string,
    endpointUrl: string
  ) => {
    const formData = new FormData();
    formData.append(inputName, selectedFile);

    setIsLoading(true);

    return this.runRequest(endpointUrl, 'POST', formData, 'Failed to import bookmarks')
      .then((response) => {
        if (response === null) {
          return false;
        }
        this.setIsOpenSettingsModal(false);
        this.fetchItems();
        this.fetchTags();
        return true;
      })
      .finally(() => setIsLoading(false));
  };

  fetchUrlMetadata = async (url: string) => {
    return this.runRequest(API_ENDPOINTS.urlMetdata.fetch(url), 'GET', {}, 'Error fetching metadata from URL');
  };

  getAppInfo = async () => {
    const response = await this.runRequest(API_ENDPOINTS.appInfo, 'GET', {}, 'Error fetching app info', true, true);

    if (response === null || !response.data) {
      return;
    }

    this.appInfo = response.data;
    return response.data;
  };
}

export default new mainStore();
