import { iconSmall } from "@/lib/utils";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ImageDisplay({
  fileUploads,
  setFileUploads,
  chat = false,
}: {
  fileUploads: (File | string | any)[];
  setFileUploads?: (value: File[]) => void;
  chat?: boolean;
}) {
  const [isImageHoverMap, setIsImageHoverMap] = useState<Record<number, boolean>>({});

  return (
    <div className={`  flex gap-1 overflow-x-auto px-2 ${chat ? "w-fit" : "w-full"} scrollbar  `}>
      {fileUploads.map((file, index) => {
        let imageSrc = file;

        if (file instanceof File) {
          try {
            imageSrc = URL.createObjectURL(file);
          } catch (error) {
            console.error("Failed to create URL for file:", file);
          }
        } else if (typeof file === "string") {
          imageSrc = file;
        }
        // 🔍 CHECK 2: Is it a String? (Base64/URL from History)
        else if (typeof file === "string") {
          imageSrc = file;
        }
        // 🔍 CHECK 3: Is it a Redis Object? (Saved History)
        else if (typeof file === "object" && file !== null) {
            // If your redis saved it as an object with a 'url' or 'base64' property
            imageSrc = file.url || file.base64 || "";
        }

        // If we still have no source (or it was a broken object), skip rendering
        if (!imageSrc) return null;

        return (
          <div
            key={index}
            className="relative flex justify-end shrink-0"
            onMouseEnter={() =>
              setFileUploads && setIsImageHoverMap((prev) => ({ ...prev, [index]: true }))
            }
            onMouseLeave={() =>
              setFileUploads && setIsImageHoverMap((prev) => ({ ...prev, [index]: false }))
            }
          >
            <Image
              loading="eager"
              width={300}
              height={300}
              src={imageSrc}
              alt={`uploaded image ${index}`}
              className={` ${setFileUploads && "border bg-white/10"}
                                ${chat ? "" : "h-12 w-12"} aspect-square rounded object-cover 
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
