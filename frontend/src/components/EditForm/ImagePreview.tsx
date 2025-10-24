import {Image} from "lucide-react";
import React from "react";
import {PreviewImage} from "@/components/Table/PreviewImage.tsx";

export const ImagePreview = ({imageUrl}) =>
  <>
    {imageUrl ? (<PreviewImage
        imageUrl={imageUrl}
        className="w-auto max-h-[100px] object-contain rounded-sm shadow-sm"
      />
    ) : (
      <div className="text-muted-foreground w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center" title="No image available">
        <Image/>
      </div>
    )}
  </>