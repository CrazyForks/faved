'use client';

import * as React from 'react';
import { ReactNode, useContext } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import { toJS } from 'mobx';
import { TagsObjectType } from '@/lib/types.ts';
import { getColorClass } from '@/components/Table/Fields/TagBadge.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';

export const TagSelect = observer(
  ({
    className,
    selectedTagsAll,
    selectedTagsSome,
    onSubmit,
    children,
  }: {
    className?: string;
    selectedTagsAll: Array<string>;
    selectedTagsSome: Array<string>;
    onSubmit: ({ newSelectedTagsAll, newSelectedTagsSome }) => void;
    children: ReactNode;
  }) => {
    const store = useContext(StoreContext);
    const [tagList, setTagList] = React.useState([]);
    const [newSelectedTagsAll, setNewSelectedTagsAll] = React.useState(selectedTagsAll);
    const [newSelectedTagsSome, setNewSelectedTagsSome] = React.useState(selectedTagsSome);
    const [query, setQuery] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [isSubmitInProgress, setIsSubmitInProgress] = React.useState(false);

    const isChanged: boolean =
      newSelectedTagsSome.length !== selectedTagsSome.length ||
      newSelectedTagsAll.length !== selectedTagsAll.length ||
      newSelectedTagsAll.some((tag) => !selectedTagsAll.includes(tag)) ||
      selectedTagsAll.some((tag) => !newSelectedTagsAll.includes(tag));

    const getSortedTags = (tags, selectedTags) => {
      const t = Object.values(toJS(tags as TagsObjectType[]));
      t.sort((a, b) => {
        return (
          Number(selectedTags.includes(b.id as unknown as string)) -
          Number(selectedTags.includes(a.id as unknown as string))
        );
      });
      return t;
    };

    React.useEffect(() => {
      setTagList(getSortedTags(store.tags, [...newSelectedTagsAll, ...newSelectedTagsSome]));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [store.tags]);

    const resetTags = () => {
      setQuery('');
      setNewSelectedTagsAll(selectedTagsAll);
      setNewSelectedTagsSome(selectedTagsSome);
      setTagList(getSortedTags(store.tags, [...selectedTagsAll, ...selectedTagsSome]));
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
          className={[className, 'overflow-y-hidden p-0'].join(' ')}
          align="center"
          // Required to make the popover scrollable with mouse wheel and touch move inside modal
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <Command shouldFilter={false} disablePointerSelection={false} loop={false}>
            <CommandInput value={query} onValueChange={setQuery} placeholder="Search tags..." className="h-9" />

            <CommandList className="max-h-[25dvh] overflow-y-scroll">
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {tagList
                  .filter((tag) => tag.fullPath.toLowerCase().includes(query.toLowerCase().trim()))
                  .map((tag) => (
                    <CommandItem
                      className="flex items-center gap-3"
                      key={tag.id}
                      value={tag.id}
                      keywords={[tag.fullPath]}
                      onSelect={(currentValue) => {
                        setNewSelectedTagsSome(newSelectedTagsSome.filter((val) => val !== tag.id));

                        setNewSelectedTagsAll(
                          newSelectedTagsAll.includes(currentValue)
                            ? newSelectedTagsAll.filter((val) => val !== currentValue)
                            : [...newSelectedTagsAll, currentValue]
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
                      <span className={`h-3 w-3 flex-none rounded-full ${getColorClass(tag.color)}`}></span>
                      <span>{tag.fullPath}</span>
                    </CommandItem>
                  ))}

                {query.length > 1 && !tagList.some((t) => t.fullPath.toLowerCase() === query.trim().toLowerCase()) && (
                  <CommandItem
                    forceMount={true}
                    key="new_item"
                    value={query}
                    onSelect={async () => {
                      const newTagID = await store.createTag(query);
                      if (!newTagID) {
                        return;
                      }
                      setNewSelectedTagsAll([...newSelectedTagsAll, newTagID.toString()]);
                      setQuery('');
                    }}
                  >
                    + Create new tag: "{query.trim()}"
                  </CommandItem>
                )}
              </CommandGroup>
              <CommandGroup></CommandGroup>
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
