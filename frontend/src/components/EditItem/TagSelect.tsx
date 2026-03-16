'use client';

import * as React from 'react';
import { useContext, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext.ts';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { IconPlus } from '@tabler/icons-react';
import { Kbd } from '@/components/ui/kbd.tsx';
import { TagPath } from '@/components/EditItem/TagPath.tsx';
import { ArrowDownLeft } from 'lucide-react';
import { normalizeQuery } from '@/lib/utils.ts';

export const TagSelect = observer(
  ({
    isMultiple,
    onChange,
    selectedTagIDs,
    excludedTagIDs,
  }: {
    isMultiple: boolean;
    onChange: (values: any[]) => void;
    selectedTagIDs: number[];
    excludedTagIDs: number[];
  }) => {
    const anchor = useComboboxAnchor();
    const store = useContext(StoreContext);
    const tags = store.tagsArray
      .map((t) => {
        return {
          value: t.id,
          color: t.color,
          // Append "/" to continue display parent item when child item is created
          label: t.fullPath + '/',
          lowercase: t.fullPath.toLowerCase(),
        };
      })
      .filter((t) => !excludedTagIDs.includes(t.value));
    const preselectedTags = useRef(tags.filter((t) => selectedTagIDs.includes(t.value)));
    const defaultValue = isMultiple ? preselectedTags.current : (preselectedTags.current[0] ?? null);
    const firstItemRef = React.useRef(null);

    const [query, setQuery] = React.useState(!isMultiple && defaultValue ? defaultValue.label.replace(/\/$/, '') : '');

    const normalizedQuery = normalizeQuery(query);
    const lowerCaseQuery = normalizedQuery.toLowerCase();
    const exactQueryMatchExists = tags.some((t) => t.lowercase === lowerCaseQuery);

    const comboboxItems =
      normalizedQuery.length > 0 && !exactQueryMatchExists
        ? [
            {
              creatable: true,
              value: `create:${normalizedQuery}`,
              label: query,
            },
            ...tags,
          ]
        : tags;

    const highlightedItemRef = React.useRef(undefined);

    const autocomplete = (label) => {
      setQuery(label.replace(/\/$/, ''));

      firstItemRef.current?.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
        })
      );
    };

    useEffect(() => {
      if (store.tagsArray.length > 0) {
        return;
      }
      store.fetchTags();
    }, [store]);

    const onKeyDownCapture = (e) => {
      if (e.key === 'Tab' && highlightedItemRef.current) {
        autocomplete(highlightedItemRef.current.label);
        // e.stopPropagation();
        e.preventDefault();
      }
      // For case when Enter is pressed when there is some text in input and no item is highlighted in list, we want to prevent form submission and/or text clearance in input, so user can continue typing or choose to create new tag with that text
      if (isMultiple && e.key === 'Enter' && query.length > 0 && !highlightedItemRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    return (
      <Combobox
        modal={true}
        // value={selectedTags}
        multiple={isMultiple}
        highlightItemOnHover={true}
        autoHighlight={true}
        items={comboboxItems}
        defaultValue={defaultValue}
        itemToStringLabel={(tag) => tag.label?.replace(/\/$/, '')}
        // itemToStringValue={(tag) => tag.value}
        inputValue={query}
        onInputValueChange={(v) => {
          setQuery(v);
        }}
        onItemHighlighted={(item) => {
          highlightedItemRef.current = item;
        }}
        onValueChange={(newValues) => {
          if (isMultiple) {
            onChange(newValues.map((v) => v.value));
          } else {
            onChange(newValues?.value ?? 0);
          }
        }}
        // filter={(value, query, itemToString) => {
        //   return value.fullPath.includes(query.trim().toLowerCase()) ?? false;
        // }}
        isItemEqualToValue={(item, value: number) => item.value === value.value}
      >
        {isMultiple ? (
          <ComboboxChips ref={anchor} className="">
            <ComboboxValue>
              {(values) => (
                <React.Fragment>
                  {values.map((tag) => (
                    <ComboboxChip key={String(tag.value)}>
                      <TagPath tag={tag} />
                    </ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={values.length > 0 ? '...' : 'Type to search or create tags...'}
                    onKeyDownCapture={onKeyDownCapture}
                  ></ComboboxChipsInput>
                </React.Fragment>
              )}
            </ComboboxValue>
          </ComboboxChips>
        ) : (
          <ComboboxInput showClear placeholder="Type to search or create a tag" onKeyDownCapture={onKeyDownCapture} />
        )}
        <ComboboxContent anchor={anchor}>
          <ComboboxList onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
            {(tag, index, allTags) => (
              <React.Fragment key={tag.value}>
                <ComboboxItem key={tag.value} value={tag} className="group" ref={index === 0 ? firstItemRef : null}>
                  {tag.creatable ? (
                    <>
                      <IconPlus />
                      Create new tag: "{normalizeQuery(tag.label)}"
                    </>
                  ) : (
                    <>
                      <TagPath tag={tag} />
                      <Button
                        variant="ghost"
                        title="Autocomplete"
                        size="xs"
                        className="bg-primary-foreground hover:bg-primary-foreground/50 invisible ms-auto flex items-center transition-none group-data-highlighted:visible pointer-coarse:visible"
                        onClick={(e) => {
                          autocomplete(tag.label);
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <ArrowDownLeft /> <Kbd className="pointer-coarse:hidden">Tab</Kbd>
                      </Button>
                    </>
                  )}
                </ComboboxItem>
                {tag.creatable && allTags.length > 1 && <ComboboxSeparator className="shrink-0" />}
              </React.Fragment>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  }
);
