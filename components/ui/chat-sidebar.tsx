"use client";

import { User } from "@/lib/types";
import { iconSize, iconSizeSmall } from "@/lib/utils";
import defaultAvatar from "@/public/avatars/defaultAvatar.png";
import { Columns2, Search, SquarePen, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ProfileModal } from "../modals/profile-modal";
import { Avatar } from "./avatar";
import { CardTitle } from "./card";
import { Input } from "./input";

interface ChatSidebarProps {
  allUsers: User[];
  userChats: User[];
  activeChatUserID: string;
  handleSetActiveChat: (id: string) => void;
  handleNewChat: () => void;
  handleNewChatClose: () => void;
}
export default function ChatSidebar(props: ChatSidebarProps) {
  const {
    allUsers,
    userChats,
    activeChatUserID,
    handleSetActiveChat,
    handleNewChat,
    handleNewChatClose,
  } = props;
  const [isChatSidebar, setIsChatSidebar] = useState<false | true | "search" | "column">(false);
  const [isAccountSidebar, setAccountSidebar] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[] | null>(userChats);
  const [filter, setFilter] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const handleSearch = () => {
    setIsChatSidebar("search");
    handleNewChatClose();
  };

  function toggleChatSidebar() {
    setIsChatSidebar(!isChatSidebar);
    setAccountSidebar(false);
  }

  useEffect(() => {
    if (searchRef.current && isChatSidebar == "search") {
      searchRef.current.focus();
    }
  }, [isChatSidebar]);

  useEffect(() => {
    if (filter) {
      const filtered = allUsers.filter((user) =>
        user.username.toLowerCase().includes(filter.toLowerCase())
      );
      setFilteredUsers(filtered.length > 0 ? filtered : null);
    } else {
      setFilteredUsers(userChats);
    }
  }, [filter, allUsers, userChats]);

  return (
    <div
      className={` relative h-screen  max-w-[17rem] border border-l-0 ${
        isChatSidebar ? "w-full z-[40] shadow-lg" : "w-[5rem]"
      } `}
    >
      <div className="w-full  h-full flex flex-col">
        <CardTitle
          className={`p-2 border-b h-[13%] flex items-end text-5xl  ${
            isChatSidebar ? "justify-start" : "justify-center"
          } `}
        >
          <span>{isChatSidebar ? "/tacodog" : "/t"}</span>
        </CardTitle>

        <div
          className={`flex flex-col ${
            !isChatSidebar && "shadow z-[10]"
          }  h-[12%] border-b gap-3 items-center p-3`}
        >
          <div
            className={`text-lg  relative flex w-full items-center  ${
              isChatSidebar ? "justify-between" : "justify-center"
            } `}
          >
            {isChatSidebar && <span className={`flex relative bottom-[-0.3rem]`}>Chats</span>}
            <SquarePen size={iconSize} className="cursor-pointer" onClick={() => handleNewChat()} />
          </div>

          {isChatSidebar ? (
            <div className="relative flex gap-2 w-full justify-end items-center">
              <Input
                ref={searchRef}
                className={`pr-8`}
                onFocus={handleNewChatClose}
                placeholder="Find people..."
                value={filter || ""}
                onChange={(e) => {
                  setFilter(e.target.value);
                }}
              />

              {filter ? (
                <X
                  size={iconSizeSmall}
                  className="absolute text-slate-500 mr-2 cursor-pointer"
                  onClick={() => setFilter("")}
                />
              ) : (
                <Search
                  size={iconSizeSmall}
                  className="absolute text-slate-500 mr-2 cursor-pointer"
                />
              )}
            </div>
          ) : (
            <Search size={iconSize} className=" cursor-pointer" onClick={handleSearch} />
          )}
        </div>

        {/* user chats */}
        <div
          tabIndex={-1}
          className={`  flex-1 bg-[#eee] dark:bg-[#07101f] py-2 flex w-full scrollbar overflow-auto flex-col gap-4 px-3`}
        >
          {filteredUsers ? (
            filteredUsers.map((user: User, index: number) => (
              <div
                onClick={() => handleSetActiveChat(user?.id)}
                key={index}
                className={`flex gap-3 hover:cursor-pointer p-2   rounded items-center  w-full ${
                  isChatSidebar ? " justify-start" : "justify-center"
                } ${activeChatUserID == user?.id ? "font-bold " : "brightness-[.4] font-light"} `}
              >
                {activeChatUserID == user?.id && (
                  <div className="absolute bg-white dark:bg-slate-950 border border-l-0 shadow left-0 rounded-e-full w-[90%] h-14 p-3" />
                )}

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
                {isChatSidebar && (
                  <CardTitle className="z-[10] text-lg">{user?.username}</CardTitle>
                )}
              </div>
            ))
          ) : (
            <div className="py-3 text-slate-500 text-center w-full">No People Found.</div>
          )}
        </div>

        {/* profile header */}
        <div
          className={` ${isChatSidebar ? "flex-row" : "flex-col h-32"}
            ${!isAccountSidebar && "p-2"}
          border-t-2 flex justify-center items-center  gap-1`}
        >
          <ProfileModal isChatSidebar={isChatSidebar as boolean} />

          {!isAccountSidebar && (
            <span
              onClick={toggleChatSidebar}
              className="h-12 w-12 rounded-full p-3 hover:bg-muted  flex justify-center items-center cursor-pointer"
            >
              <Columns2 size={iconSize} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
