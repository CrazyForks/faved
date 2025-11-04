import React from 'react';
import { Badge } from '../ui/badge';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/store/storeContext';
import { colorMap } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

type TagType = {
  fullPath: string;
  title: string;
  color: string;
};

interface MainStore {
  tags: Record<number, TagType>;
  setCurrentTagId: (id: number) => void;
  setCurrentPage: (page: number) => void;
  selectedTagId: number;
}

export const getColorClass = (color: string | undefined) => {
  return colorMap[color as keyof typeof colorMap] || colorMap.gray;
};

const formatTagPathForDisplay = (path) => {
  return path.replaceAll('\\/', '/');
};

export const TagBadgeMini: React.FC<{ tagID: number }> = observer(({ tagID }) => {
  const store = React.useContext(StoreContext) as unknown as MainStore;
  const tag = store.tags[tagID];
  if (!tag) {
    return null;
  }
  const fullPath = formatTagPathForDisplay(tag.fullPath);
  const colorClass = getColorClass(tag.color);

  return (
    <Badge variant="secondary">
      <span className={`w-3 h-3 rounded-full flex-none ${colorClass}`}></span>
      <span>{fullPath}</span>
    </Badge>
  );
});

export const TagBadge: React.FC<{ tagID: number }> = observer(({ tagID }) => {
  const store = React.useContext(StoreContext) as unknown as MainStore;
  const tag = store.tags[tagID];
  if (!tag) {
    return null;
  }

  const fullPath = formatTagPathForDisplay(tag.fullPath);
  const tagTitle = tag.title;
  const isTagSelected = store.selectedTagId == tagID;

  const setTag = () => {
    store.setCurrentTagId(tagID);
    store.setCurrentPage(1);
  };

  const colorClass =
    tag.color && colorMap[tag.color as keyof typeof colorMap]
      ? colorMap[tag.color as keyof typeof colorMap]
      : colorMap.gray;

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge variant={isTagSelected ? 'outline' : 'secondary'} className="cursor-pointer" onClick={setTag}>
          <span className={`w-3 h-3 rounded-full flex-none ${colorClass}`}></span>
          <span>{tagTitle}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{fullPath}</TooltipContent>
    </Tooltip>
  );
});
