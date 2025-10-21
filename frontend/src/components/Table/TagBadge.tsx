import React from "react";
import {Badge} from "../ui/badge";
import {observer} from "mobx-react-lite";
import {StoreContext} from "@/store/storeContext";
import {colorMap} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";

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


export const TagBadge: React.FC<{ tagID: number }> = observer(({tagID}) => {
  const store = React.useContext(StoreContext) as unknown as MainStore;
  const fullPath = store.tags?.[tagID]?.fullPath.replaceAll('\\/', '/') || "";
  const tagName = store.tags?.[tagID]?.title;
  const isTagSelected = store.selectedTagId == tagID;

  const setTag = () => {
    store.setCurrentTagId(tagID);
    store.setCurrentPage(1);
  };

  const colorClass = store.tags[tagID]?.color && colorMap[store.tags[tagID].color as keyof typeof colorMap]
    ? colorMap[store.tags[tagID].color as keyof typeof colorMap]
    : colorMap.gray;

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <Badge
          variant={isTagSelected ? 'outline' : 'secondary'}
          className="mr-2 cursor-pointer"
          onClick={setTag}
        >
          <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
          <span>{tagName}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        {fullPath}
      </TooltipContent>
    </Tooltip>

  );
});