'use client';

import * as React from 'react';
import { ReactNode, useContext, useMemo } from 'react';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { cn, normalizeQuery } from '@/lib/utils.ts';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { TagPath } from '@/components/EditItem/TagPath.tsx';
import { IconPlus } from '@tabler/icons-react';

export const TagSelect = observer(
  ({
    className,
    selectedTagsAll,
    selectedTagsSome,
    onSubmit,
    children,
  }: {
    className?: string;
    selectedTagsAll: number[];
    selectedTagsSome: number[];
    onSubmit: ({ newSelectedTagsAll, newSelectedTagsSome }) => Promise<boolean>;
    children: ReactNode;
  }) => {
    const store = useContext(StoreContext);
    const [newSelectedTagsAll, setNewSelectedTagsAll] = React.useState(selectedTagsAll);
    const [newSelectedTagsSome, setNewSelectedTagsSome] = React.useState(selectedTagsSome);
    const [query, setQuery] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [isSubmitInProgress, setIsSubmitInProgress] = React.useState(false);
    const [createTagInProgress, setTagCreateInProgress] = React.useState(false);

    const isChanged: boolean = useMemo(
      () =>
        newSelectedTagsSome.length !== selectedTagsSome.length ||
        newSelectedTagsAll.length !== selectedTagsAll.length ||
        newSelectedTagsAll.some((tag) => !selectedTagsAll.includes(tag)) ||
        selectedTagsAll.some((tag) => !newSelectedTagsAll.includes(tag)),
      [newSelectedTagsAll, newSelectedTagsSome, selectedTagsAll, selectedTagsSome]
    );

    const sortedTags = useMemo(() => {
      const tags = [...store.tagsArray];
      const selectedTags = [...newSelectedTagsAll, ...newSelectedTagsSome];
      tags.sort((a, b) => {
        return Number(selectedTags.includes(b.id)) - Number(selectedTags.includes(a.id));
      });
      return tags;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store.tagsArray, query]);

    const normalizedQuery = normalizeQuery(query);
    const lowerCaseQuery = normalizedQuery.toLowerCase();
    const exactQueryMatchExists = sortedTags.some((t) => t.fullPath.toLowerCase() === lowerCaseQuery);

    const resetTags = () => {
      setQuery('');
      setNewSelectedTagsAll(selectedTagsAll);
      setNewSelectedTagsSome(selectedTagsSome);
    };

    return (
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (false === v) {
            return;
          }
          resetTags();
        }}
      >
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent
          sideOffset={7}
          className={cn(className, 'overflow-y-hidden p-0 invert')}
          align="center"
          // Required to make the popover scrollable with mouse wheel and touch move inside modal
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <Command shouldFilter={false} disablePointerSelection={false} loop={false}>
            <CommandInput value={query} onValueChange={setQuery} placeholder="Search tags..." className="h-9" />

            <CommandList className="max-h-[25dvh] overflow-y-scroll">
              <CommandGroup>
                {normalizedQuery.length > 0 && !exactQueryMatchExists && (
                  <CommandItem
                    forceMount={true}
                    key="new_item"
                    disabled={createTagInProgress}
                    value={query}
                    onSelect={() => {
                      const createTag = async () => {
                        setTagCreateInProgress(true);
                        const newTagID = await store.createTag(normalizedQuery);
                        if (newTagID === null) {
                          return;
                        }
                        setNewSelectedTagsAll((prev) => [...prev, Number(newTagID)]);
                        setQuery('');
                        setTagCreateInProgress(false);
                      };
                      createTag();
                    }}
                  >
                    {createTagInProgress ? <Spinner /> : <IconPlus />} Create new tag: "{normalizedQuery}"
                  </CommandItem>
                )}

                {sortedTags
                  .filter((tag) => tag.fullPath.toLowerCase().includes(normalizedQuery))
                  .map((tag) => (
                    <CommandItem
                      className="flex items-center gap-3"
                      key={tag.id}
                      // Need to convert to string because CommandItem expects value to be string, otherwise it will fallback to inner text (presumably)
                      value={tag.id.toString()}
                      keywords={[tag.fullPath]}
                      onSelect={(currentValue) => {
                        const val = Number(currentValue);

                        setNewSelectedTagsSome((prev) => prev.filter((tagID) => tagID !== tag.id));

                        setNewSelectedTagsAll((prev) =>
                          prev.includes(val) ? prev.filter((tagID) => tagID !== val) : [...prev, val]
                        );
                      }}
                    >
                      <Checkbox
                        checked={
                          newSelectedTagsAll.includes(tag.id) ||
                          (newSelectedTagsSome.includes(tag.id) ? 'indeterminate' : false)
                        }
                        aria-label="Select all"
                      />
                      <TagPath tag={{ label: tag.fullPath, color: tag.color }} className="invert" />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
            <div className="bg-background w-full p-1">
              <Button
                type="button"
                variant="default"
                disabled={!isChanged || isSubmitInProgress}
                size="sm"
                key="apply"
                value={query}
                className="w-full"
                onClick={async () => {
                  setIsSubmitInProgress(true);
                  await onSubmit({ newSelectedTagsAll, newSelectedTagsSome });
                  setIsSubmitInProgress(false);
                  setOpen(false);
                }}
              >
                {isSubmitInProgress && <Spinner />}
                Apply changes
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
