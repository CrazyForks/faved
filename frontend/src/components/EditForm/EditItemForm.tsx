import React, {useContext, useEffect, useMemo} from 'react';
import {useForm} from 'react-hook-form';
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {TagEdit} from "@/components/ui/tags"
import {Textarea} from '../ui/textarea';
import {StoreContext} from '@/store/storeContext';
import {zodResolver} from '@hookform/resolvers/zod';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../ui/form"
import {ActionType} from '../dashboard/types';
import type {ItemType} from '@/types/types';
import {useLocation} from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import {Image} from 'lucide-react';
import {IconCloudDownload, IconProgress} from "@tabler/icons-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import z from "zod";


interface EditItemFormProps {
  isCloseWindowOnSubmit: boolean
}

const INITIAL_ITEM_DATA: ItemType = {
  id: "",
  description: "",
  title: "",
  comments: '',
  created_at: undefined,
  image: '',
  tags: [],
  updated_at: undefined,
  url: ''
};

const safeDecodeURIComponent = (encodedURI: string): string => {
  try {
    return encodedURI ? decodeURIComponent(encodedURI) : '';
  } catch (error) {
    console.error('Error decoding URI component:', error, encodedURI);
    return encodedURI || '';
  }
};

const EditItemForm = ({isCloseWindowOnSubmit}: EditItemFormProps) => {
  const store = useContext(StoreContext);
  const location = useLocation();
  const [isMetadataLoading, setIsMetadataLoading] = React.useState(false);

  const currentItem = useMemo(() => {
    if (store.type === ActionType.EDIT && store.items.length > 0) {
      return store.items.find(item => item.id as unknown as number === store.idItem) || INITIAL_ITEM_DATA;
    }
    return INITIAL_ITEM_DATA;
  }, [store.type, store.items, store.idItem]);

  const form = useForm<ItemType>({
    resolver: zodResolver(z.object({
      title: z.string().min(1, {message: "Title is required"}),
      url: z.string().min(1, {message: "URL is required"}),
      description: z.any().optional(),
      comments: z.any().optional(),
      image: z.any().optional(),
      tags: z.array(z.any()).optional(),
      updated_at: z.any().optional(),
      id: z.any().optional(),
      created_at: z.any().optional(),
    })),
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

  const handleSubmit = (values: ItemType) => {
    store.onCreateItem(values, false, false, isCloseWindowOnSubmit ? window : null);
    store.setIsShowEditModal(false);
    form.reset();
  };

  const handleSaveCopy = (values: ItemType) => {
    store.onCreateItem(values, true);
    store.setIsShowEditModal(false);
    form.reset();
  };

  const handleSave = (values: ItemType) => {
    store.onCreateItem(values, false, true);
  };

  const handleDelete = () => {
    store.onDeleteItem(store.idItem as number);
    store.setIsShowEditModal(false);
    form.reset();
  };

  const handleClose = () => {
    if (isCloseWindowOnSubmit) {
      window.close();
    } else {
      store.fetchItems();
      store.fetchTags();
      store.setIsShowEditModal(false);
      form.reset();
    }
  };

  const updateMetadataFromUrl = async (url) => {
    setIsMetadataLoading(true);

    const data: { data: { title: string, description: string, image_url: string } } = await store.fetchUrlMetadata(url);

    setIsMetadataLoading(false);

    if (!data || !data?.data) {
      return;
    }

    form.setValue('title', data.data.title || '')
    form.setValue('description', data.data.description || '')
    form.setValue('image', data.data.image_url || '')

  }

  const renderTextField = (name: keyof ItemType, label: string, isDisabled = false) => (
    <FormField
      control={form.control}
      name={name}
      render={({field}) => (
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
          <FormMessage/>
        </FormItem>
      )}
    />
  );

  const renderTextareaField = (name: keyof ItemType, label: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({field}) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              className="max-h-[78px] overflow-y-auto"
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage/>
        </FormItem>
      )}
    />
  );

  const renderTagsField = () => (
    <FormField
      control={form.control}
      name="tags"
      render={({field}) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl className="text-left">
            <TagEdit
              className={'w-[calc(100dvw-var(--spacing)*6*2)]' + (!isCloseWindowOnSubmit ? ' md:w-[calc(95dvw-var(--spacing)*6*2)] max-w-[calc(72rem-var(--spacing)*6*2)]' : '')}
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
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div
          className="overflow-y-auto p-6 h-[100dvh] md:h-auto md:max-h-[95dvh] "
        >
          <h2 className="text-left text-xl font-semibold tracking-tight mb-3">
            {store.type === ActionType.EDIT ? "Edit item" : "Create item"}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid gap-3">
                {renderTextField('title', 'Title')}
              </div>

              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="url"
                  render={({field}) => {
                    return (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <div className='flex flex-row gap-2'>
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
                                <Button onClick={() => updateMetadataFromUrl(field.value)} variant="outline"
                                        disabled={isMetadataLoading}>
                                  {isMetadataLoading ?
                                    <IconProgress className="animate-spin"/>
                                    : <IconCloudDownload/>}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Pull title, description and image from the URL.
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="grid gap-3">
                {renderTextareaField('description', 'Description')}
              </div>

              <div className="grid gap-3">
                {renderTextareaField('comments', 'Comments')}
              </div>

              <div className="grid gap-3">
                {renderTextField('image', 'Image URL')}
              </div>

              <div className="grid gap-3">
                {renderTagsField()}
              </div>

              {store.type === ActionType.EDIT && (
                <>
                  <div className="grid gap-3">
                    {renderTextField('created_at', 'Created at', true)}
                  </div>
                  <div className="grid gap-3">
                    {renderTextField('updated_at', 'Updated at', true)}
                  </div>
                </>
              )}
            </div>
            <div className="lg:col-span-1">
              <FormItem>
                <div
                  className="border rounded-md p-4 bg-gray-50 dark:bg-[#202020] min-h-[200px] flex items-center justify-center">
                  {imageUrl ? (
                    <div className="text-center">
                      <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                        <img
                          src={imageUrl}
                          className="max-w-full max-h-[300px] mx-auto rounded-md shadow-sm"
                        />
                      </a>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl"><Image/></span>
                      </div>
                      <p className="text-sm">No image available</p>
                      <p className="text-xs">Enter an image URL</p>
                    </div>
                  )}
                </div>
              </FormItem>
            </div>
          </div>
          <div
            className="bg-background border-t pt-4 mt-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1">
              <Button
                type="submit"
                variant="default"
                onClick={form.handleSubmit(handleSubmit)}
                className="w-full sm:w-auto order-1"
              >
                Save & Close
              </Button>

              {store.type === ActionType.EDIT && (
                <>
                  <Button
                    onClick={form.handleSubmit(handleSaveCopy)}
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto order-2"
                  >
                    Save as Copy
                  </Button>
                  <Button
                    onClick={form.handleSubmit(handleSave)}
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto order-3"
                  >
                    Save
                  </Button>
                </>
              )}

              <Button
                onClick={handleClose}
                type="button"
                variant="secondary"
                className="w-full sm:w-auto order-4"
              >
                Close
              </Button>
            </div>

            {store.type === ActionType.EDIT && (
              <div className="order-1 sm:order-2 w-full sm:w-auto">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
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
                      <AlertDialogCancel className="mt-2 sm:mt-0">
                        Cancel
                      </AlertDialogCancel>
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
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EditItemForm;