import React, { useContext, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagEdit } from '@/components/ui/tags';
import { Textarea } from '../ui/textarea';
import { StoreContext } from '@/store/storeContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { ActionType } from '../dashboard/types';
import type { ItemType } from '@/types/types';
import { useLocation } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { IconCloudDownload, IconProgress } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import z from 'zod';
import { ImagePreview } from '@/components/EditForm/ImagePreview.tsx';

interface EditItemFormProps {
  isCloseWindowOnSubmit: boolean;
}

const INITIAL_ITEM_DATA: ItemType = {
  id: '',
  description: '',
  title: '',
  comments: '',
  created_at: undefined,
  image: '',
  tags: [],
  updated_at: undefined,
  url: '',
};

const safeDecodeURIComponent = (encodedURI: string): string => {
  try {
    return encodedURI ? decodeURIComponent(encodedURI) : '';
  } catch {
    return encodedURI || '';
  }
};

const EditItemForm = ({ isCloseWindowOnSubmit }: EditItemFormProps) => {
  const store = useContext(StoreContext);
  const location = useLocation();
  const [isMetadataLoading, setIsMetadataLoading] = React.useState(false);

  const currentItem = useMemo(() => {
    if (store.type === ActionType.EDIT && store.items.length > 0) {
      return store.items.find((item) => (item.id as unknown as number) === store.idItem) || INITIAL_ITEM_DATA;
    }
    return INITIAL_ITEM_DATA;
  }, [store.type, store.items, store.idItem]);

  const form = useForm<ItemType>({
    resolver: zodResolver(
      z.object({
        title: z.string().min(1, { message: 'Title is required' }),
        url: z.string().min(1, { message: 'URL is required' }),
        description: z.any().optional(),
        comments: z.any().optional(),
        image: z.any().optional(),
        tags: z.array(z.any()).optional(),
        updated_at: z.any().optional(),
        id: z.any().optional(),
        created_at: z.any().optional(),
      })
    ),
    defaultValues: currentItem,
  });

  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      url: safeDecodeURIComponent(searchParams.get('url') || ''),
      title: safeDecodeURIComponent(searchParams.get('title') || ''),
      description: safeDecodeURIComponent(searchParams.get('description') || ''),
      image: safeDecodeURIComponent(searchParams.get('image') || ''),
    };
  }, [location.search]);

  useEffect(() => {
    form.reset(currentItem);
  }, [currentItem, form]);

  useEffect(() => {
    if (isCloseWindowOnSubmit) {
      form.setValue('title', urlParams.title);
      form.setValue('description', urlParams.description);
      form.setValue('url', urlParams.url);
      form.setValue('image', urlParams.image);
    }
  }, [isCloseWindowOnSubmit, urlParams, form]);

  const handleSaveClose = async (values: ItemType) => {
    let result;

    if (store.type === ActionType.EDIT && values.id) {
      result = await store.onUpdateItem(values, values.id);
    } else {
      result = await store.onCreateItem(values);
    }
    if (!result) {
      return;
    }
    success();
  };

  const handleSaveCopy = async (values: ItemType) => {
    const result = await store.onCreateItem(values);
    if (!result) {
      return;
    }
    success();
  };

  const handleDelete = async () => {
    const result = await store.onDeleteItem(store.idItem as number);
    if (!result) {
      return;
    }
    success();
  };

  const success = () => {
    if (isCloseWindowOnSubmit) {
      setTimeout(() => {
        window.close();
      }, 1000);
    } else {
      store.fetchItems();
      store.fetchTags();
      store.setIsShowEditModal(false);
      form.reset();
    }
  };

  const cancel = () => {
    if (isCloseWindowOnSubmit) {
      window.close();
    } else {
      store.setIsShowEditModal(false);
      form.reset();
    }
  };

  const updateMetadataFromUrl = async (url) => {
    setIsMetadataLoading(true);

    const data: { data: { title: string; description: string; image_url: string } } = await store.fetchUrlMetadata(url);

    setIsMetadataLoading(false);

    if (!data || !data?.data) {
      return;
    }

    form.setValue('title', data.data.title || '');
    form.setValue('description', data.data.description || '');
    form.setValue('image', data.data.image_url || '');
  };

  const renderTextField = (name: keyof ItemType, label: string, isDisabled = false) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="text"
              disabled={isDisabled}
              className={isDisabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : ''}
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderTextareaField = (name: keyof ItemType, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea className="overflow-y-auto" {...field} value={field.value ?? ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderTagsField = () => (
    <FormField
      control={form.control}
      name="tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl className="text-left">
            <TagEdit
              className={
                'w-[calc(100dvw-var(--spacing)*6*2)]' +
                (!isCloseWindowOnSubmit
                  ? ' md:w-[calc(95dvw-var(--spacing)*6*2)] max-w-[calc(72rem-var(--spacing)*6*2)]'
                  : '')
              }
              onChange={field.onChange}
              values={field.value ?? []}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );

  const imageUrl = form.watch('image');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSaveClose)}>
        <div
          className={'overflow-y-auto p-6 h-[100dvh]' + (!isCloseWindowOnSubmit ? ' md:h-auto md:max-h-[95dvh]' : '')}
        >
          <h2 className="text-left text-xl font-semibold tracking-tight mb-3">
            {store.type === ActionType.EDIT ? 'Edit item' : 'Create item'}
          </h2>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid gap-3">{renderTextField('title', 'Title')}</div>

              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <div className="flex flex-row gap-2">
                            <Input
                              type="text"
                              id="name-1"
                              value={field.value ?? undefined}
                              onChange={(value) => {
                                field.onChange(value ?? null);
                              }}
                            />
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => updateMetadataFromUrl(field.value)}
                                  variant="outline"
                                  disabled={isMetadataLoading}
                                >
                                  {isMetadataLoading ? (
                                    <IconProgress className="animate-spin" />
                                  ) : (
                                    <IconCloudDownload />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Pull title, description and image from the URL.</TooltipContent>
                            </Tooltip>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="grid gap-3">{renderTextareaField('description', 'Description')}</div>

              <div className="grid gap-3">{renderTextareaField('comments', 'Comments')}</div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="grow"> {renderTextField('image', 'Image URL')}</div>
                <div className="sm:max-w-[40%] min-w-16 min-h-16">
                  <ImagePreview imageUrl={imageUrl} />
                </div>
              </div>

              <div className="grid gap-3">{renderTagsField()}</div>

              {store.type === ActionType.EDIT && (
                <div className="sm:grid grid-cols-2 gap-3 space-y-4 sm:space-y-0">
                  {renderTextField('created_at', 'Created at', true)}
                  {renderTextField('updated_at', 'Updated at', true)}
                </div>
              )}
            </div>
          </div>
          <div className="bg-background border-t pt-5 mt-4 flex flex-col sm:flex-row justify-end gap-2">
            {store.type === ActionType.EDIT && (
              <div className="mt-10 order-last sm:order-none sm:mr-auto sm:mt-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your item.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row">
                      <AlertDialogCancel className="mt-2 sm:mt-0">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            <Button onClick={cancel} type="button" variant="outline" className="order-3 sm:order-none">
              Cancel
            </Button>

            {store.type === ActionType.EDIT && (
              <>
                <Button
                  onClick={form.handleSubmit(handleSaveCopy)}
                  type="button"
                  variant="outline"
                  className="order-2 sm:order-none"
                >
                  Save as copy
                </Button>
              </>
            )}

            <Button
              type="submit"
              variant="default"
              onClick={form.handleSubmit(handleSaveClose)}
              className="order-1 sm:order-none"
            >
              {store.type === ActionType.EDIT ? 'Save changes' : 'Create item'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EditItemForm;
