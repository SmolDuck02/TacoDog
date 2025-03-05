import { iconSmall } from "@/lib/utils";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ImageDisplay({
  fileUploads,
  setFileUploads,
}: {
  fileUploads: File[];
  setFileUploads?: (value: File[]) => void;
}) {
  const [isImageHoverMap, setIsImageHoverMap] = useState<Record<number, boolean>>({});

  return (
    <div className={`  flex gap-1    `}>
      {fileUploads.map((file, index) => {
        return (
          <div
            key={index}
            className="relative flex justify-end"
            onMouseEnter={() =>
              setFileUploads && setIsImageHoverMap((prev) => ({ ...prev, [index]: true }))
            }
            onMouseLeave={() =>
              setFileUploads && setIsImageHoverMap((prev) => ({ ...prev, [index]: false }))
            }
          >
            <Image
              width={300}
              height={300}
              src={URL.createObjectURL(file)}
              alt={`uploaded image ${index}`}
              className={` ${setFileUploads && "border bg-white/10"}
                                h-12 w-12 aspect-square rounded object-cover 
                                `}
            />
            {setFileUploads && (
              <button
                className="cursor-pointer absolute "
                onClick={() => setFileUploads(fileUploads.filter((_, i) => i !== index))}
              >
                <XIcon size={iconSmall} className="bg-gray-200 dark:bg-gray-800 rounded-full text-black/80 dark:text-white/80" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
