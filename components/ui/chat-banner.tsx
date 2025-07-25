import { User } from "@/lib/types";
import defaultBanner from "@/public/bg/defaultBG.avif";
import Image from "next/image";
export default function ChatBanner({ activeChatUser }: { activeChatUser: User }) {
  return (
    <div className="z-[52] relative border-b justify-end items-end w-full p-6 min-h-[2rem] lg:min-h-[5.5rem] flex text-[10px] lg:text-xs ">
      <Image
        fill
        src={activeChatUser?.banner?.img || defaultBanner.src}
        className=" object-cover brightness-95"
        alt="user banner"
      />
      <div className="absolute bottom-1 lg:bottom-auto  h-fit text-end flex flex-col drop-shadow-lg  text-white ">
        <span>
          Avatars by{" "}
          <a className="underline" target="_blank" href={`https://www.instagram.com/mcfriendy`}>
            Alison Friend
          </a>
        </span>
        <span>
          Photo by{" "}
          <a
            className="underline"
            target="_blank"
            href={`https://unsplash.com/s/users/${
              activeChatUser?.banner?.source || "Maksim Samuilionak"
            }`}
          >
            {activeChatUser?.banner?.source || "Maksim Samuilionak"}
          </a>{" "}
          on Unsplash
        </span>
      </div>
    </div>
  );
}
