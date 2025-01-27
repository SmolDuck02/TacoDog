"use client";

import { User } from "@/lib/types";
import { iconSize, iconSizeSmall } from "@/lib/utils";
import defaultAvatar from "@/public/avatars/defaultAvatar.png";
import { Columns2, Search, SquarePen } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ProfileModal } from "../modals/profile-modal";
import { Avatar } from "./avatar";
import { CardTitle } from "./card";
import { Input } from "./input";
export default function ChatSidebar({
  userChats,
  activeChatUserID,
  handleSetActiveChat,
  handleNewChat,
  handleNewChatClose,
  handleSearchModalMini,
}: {
  userChats: User[];
  activeChatUserID: string;
  handleSetActiveChat: (id: string) => void;
  handleNewChat: () => void;
  handleNewChatClose: () => void;
  handleSearchModalMini: (value: string) => void;
}) {
  const { theme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [isChatSidebar, setIsChatSidebar] = useState<false | true | "search" | "column">(false);
  const [isAccountSidebar, setAccountSidebar] = useState(false);

  const handleSearch = () => {
    setIsChatSidebar("search");
    handleNewChatClose();
  };

  useEffect(() => {
    setChecked(!(theme == "light"));
  }, [theme]);
  function toggleMode() {
    setTheme(theme == "light" ? "dark" : "light");
  }

  // function toggleAccountSidebar() {
  //   setAccountSidebar(!isAccountSidebar);
  //   setIsChatSidebar(true);
  // }
  const searchRef = useRef<HTMLInputElement | null>(null);
  function toggleChatSidebar() {
    setIsChatSidebar(!isChatSidebar);
    setAccountSidebar(false);
  }

  useEffect(() => {
    if (searchRef.current && isChatSidebar == "search") {
      searchRef.current.focus();
    }
  }, [isChatSidebar]);

  return (
    <div
      className={`  h-screen  max-w-[14rem] border ${
        isChatSidebar ? "w-full" : "w-[5rem]"
      } relative`}
    >
      <div className="w-full  flex flex-col">
        <CardTitle
          className={`border-b h-28 flex items-end text-5xl ${
            isChatSidebar ? "justify-start" : "justify-center"
          } p-2 `}
        >
          <span className={`flex`}>{isChatSidebar ? "/tacodog" : "/t"}</span>
        </CardTitle>

        <div className="flex border-b-2 flex-col gap-3 items-center p-3">
          <div
            className={`flex w-full items-center  ${
              isChatSidebar ? "justify-between" : "justify-center"
            } text-lg relative`}
          >
            <span className={`${isChatSidebar ? "flex" : "hidden"}  relative bottom-[-0.3rem]`}>
              Chats
            </span>
            <SquarePen
              size={iconSize}
              className=" cursor-pointer"
              onClick={() => handleNewChat()}
            />
          </div>

          {isChatSidebar ? (
            <div className="relative flex gap-2 w-full justify-end items-center">
              <Input
                ref={searchRef}
                className={` pr-8`}
                placeholder="Find people..."
                // value={searchText}
                // onChange={(e) => setSearchText(e.target.value)}
                onChange={(e) => {
                  handleSearchModalMini(e.target.value);
                }}
              />

              <Search
                size={iconSizeSmall}
                className="absolute text-slate-500 mr-2 cursor-pointer"
              />
            </div>
          ) : (
            <Search size={iconSize} className="my-1 cursor-pointer" onClick={handleSearch} />
          )}
        </div>

        {/* user chats */}
        <div
          tabIndex={-1}
          className={`  ${isChatSidebar ? "h-[31rem]" : "h-[27.5rem]"} 
           py-2 flex w-full scrollbar overflow-auto flex-col gap-4 px-3`}
        >
          {userChats &&
            userChats.map((user: User, index: number) => (
              <div
                onClick={() => handleSetActiveChat(user?.id)}
                key={index}
                className={`flex gap-3 ${
                  isChatSidebar ? "hover:bg-slate-900 rounded " : "rounded-full"
                } ${
                  activeChatUserID == user.id ? " bg-yellow-800 font-bold" : "font-light"
                } hover:cursor-pointer p-2  w-full items-center`}
              >
                <Avatar className="h-9 w-9 ">
                  <Image
                    alt="User Avatar"
                    height={300}
                    width={300}
                    className="aspect-square h-full w-full"
                    src={user?.avatar?.img || defaultAvatar}
                  />
                  {/* <AvatarFallback>{user?.username[0] || ""}</AvatarFallback> */}
                </Avatar>
                {isChatSidebar && <CardTitle className="text-lg">{user?.username}</CardTitle>}
              </div>
            ))}
        </div>
      </div>

      {/* profile header */}
      <div
        className={` ${isChatSidebar ? "flex-row" : "flex-col h-32"}
            ${!isAccountSidebar && "p-2"}
          } border-t-2 flex justify-center items-center  gap-1`}
      >
        <ProfileModal isChatSidebar={isChatSidebar as boolean} />

        {!isAccountSidebar && (
          <span
            onClick={toggleChatSidebar}
            className="h-12 w-12 rounded-full p-3 hover:bg-slate-700 flex justify-center items-center cursor-pointer"
          >
            <Columns2 size={iconSize} />
          </span>
        )}
      </div>
    </div>
  );
}
