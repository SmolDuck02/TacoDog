"use client";

import { User, UserChat } from "@/lib/types";
import {
  iconSize,
  iconSizeSmall,
  monthDateOptions,
  timeOptions,
  yearDateOptions,
} from "@/lib/utils";
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
  userChats: UserChat[];
  currentUserID: string;
  activeChatUser: User;
  handleSetActiveChat: (id: string) => void;
  handleNewChat: () => void;
  handleNewChatClose: () => void;
}
export default function ChatSidebar(props: ChatSidebarProps) {
  const {
    currentUserID,
    allUsers,
    userChats,
    activeChatUser,
    handleSetActiveChat,
    handleNewChat,
    handleNewChatClose,
  } = props;
  const [isChatSidebar, setIsChatSidebar] = useState<false | true | "search" | "column">(false);
  const [isAccountSidebar, setAccountSidebar] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<UserChat[] | User[] | null>(userChats);
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
        user.username.toLowerCase().includes(filter.toLowerCase().trim())
      );
      const filteredUserChats = filtered.map((user) => {
        const foundChat = userChats.find((userChat) => userChat.user.id === user.id);
        return foundChat ? foundChat : { user: user, chats: null };
      });
      console.log("yyy", filtered, userChats, filteredUserChats);
      setFilteredUsers(filteredUserChats.length > 0 ? filteredUserChats : null);
    } else {
      setFilteredUsers(userChats);
    }
  }, [filter, allUsers, userChats]);

  return (
    <div
      className={` z-[49] backdrop-blur-xl bg-white/20 dark:bg-slate-950/10  h-screen absolute left-0  max-w-[17rem]  ${
        isChatSidebar ? "w-full shadow-2xl brightness-125 " : "w-[5rem]"
      } `}
    >
      <div className="w-full  h-full flex flex-col">
        <CardTitle
          className={`p-3 drop-shadow-lg h-[13%] text-black dark:text-[#ddd]  flex items-end text-5xl  ${
            isChatSidebar ? "justify-start px-6" : "justify-center"
          } `}
        >
          <span>{isChatSidebar ? "\\tacodog" : "\\t"}</span>
        </CardTitle>

        <div
          className={` flex flex-col h-[12%] shadow gap-2  z-[10] text-muted-foreground justify-center items-center p-3 px-[18px]    `}
        >
          <div
            className={`text-2xl px-1 relative flex w-full items-center  ${
              isChatSidebar ? "justify-between text-[#222] dark:text-[#bbb] " : "justify-center"
            } `}
          >
            {isChatSidebar && <span className={`flex relative bottom-[-0.3rem]`}>Chats</span>}
            <SquarePen size={iconSize} className="cursor-pointer" onClick={() => handleNewChat()} />
          </div>

          {isChatSidebar ? (
            <div className="relative  flex gap-2 w-full justify-end items-center">
              <Input
                ref={searchRef}
                className={` placeholder:text-muted-foreground/70 dark:bg-white/10 bg-black/10 pr-8`}
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
          // #07101f
          className={` flex-1 gap-2 pt-4 flex w-full scrollbar overflow-auto flex-col px-3`}
        >
          {filteredUsers ? (
            filteredUsers.map((userChat, index: number) => {
              const user: User = (userChat as UserChat).user
                ? (userChat as UserChat).user
                : (userChat as User);
              const chats = (userChat as UserChat).chats || [];
              const lastMessage = chats.at(-1);
              const isAuthor = lastMessage?.senderID === currentUserID;
              // console.log("heyhey", user, lastMessage, chats, filteredUsers);
              const isActiveChat = activeChatUser.id === user?.id;
              const callMessage = (isAuthor ? "You" : user.username) + " Called";
              const chatMessage = isAuthor
                ? `You: ${chats?.at(-1)?.chatMessage}`
                : lastMessage?.chatMessage;

              const d = new Date(lastMessage?.date || "");
              const options =
                d.getDate() == new Date().getDate()
                  ? timeOptions
                  : d.getFullYear() == new Date().getFullYear()
                  ? monthDateOptions
                  : yearDateOptions;

              const date = new Date(lastMessage?.date || "").toLocaleString("en-US", options);

              return (
                <div key={index} className="relative flex items-center">
                  {lastMessage && (
                    <>
                      {!lastMessage.isSeen && !isAuthor && (
                        <span
                          className={`bg-amber-400 z-10 absolute ${
                            isChatSidebar ? "right-3" : "-right-1"
                          } w-2 h-2 aspect-square rounded-full`}
                        />
                      )}
                      {lastMessage.isSeen && isAuthor && (
                        <div
                          className={`${isChatSidebar && !filter ? "right-3 " : "hidden"} ${
                            isActiveChat ? "brightness-125" : "brightness-50"
                          } absolute h-4 w-4 `}
                        >
                          <Image
                            alt="User Avatar"
                            height={300}
                            width={300}
                            className="aspect-square rounded-full h-full w-full"
                            src={activeChatUser?.avatar?.img || defaultAvatar}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div
                    onClick={() => {
                      handleSetActiveChat(user?.id);
                      setFilter(null);
                    }}
                    className={`flex gap-3 hover:cursor-pointer p-2 px-[10px] rounded items-center  w-full ${
                      isChatSidebar ? " justify-start" : "justify-center"
                    } ${
                      !filter &&
                      (isActiveChat
                        ? `font-bold ${
                            //condiitonal brightness because text become more brighter than image
                            !isChatSidebar ? "brightness-125" : "brightness-90"
                          } backdrop-blur-xl `
                        : "brightness-[.5] font-light")
                    } `}
                  >
                    <Avatar className="h-9 w-9 ">
                      <Image
                        alt="User Avatar"
                        height={300}
                        width={300}
                        className="aspect-square h-full w-full"
                        src={user?.avatar?.img || defaultAvatar}
                      />
                    </Avatar>
                    {isChatSidebar && (
                      <span className="flex flex-col">
                        <span className="z-[10] text-md">{user?.username}</span>
                        {chats.length > 0 && (
                          <span
                            className={`text-xs text-muted-foreground flex gap-1 font-light ${
                              lastMessage?.isSeen && "font-bold"
                            } ${lastMessage?.chatMessage && "italic"} `}
                          >
                            <span className="truncate w-auto pr-1 max-w-24">
                              {lastMessage?.chatMessage ? chatMessage : callMessage}
                            </span>
                            {date}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-3 text-muted-foreground text-center w-full">No People Found.</div>
          )}
        </div>

        {/* profile modal button */}
        <div
          className={` ${isChatSidebar ? "flex-row  items-start" : "flex-col items-center"}
           flex justify-start gap-1 p-2 px-[14px] h-32`}
        >
          <ProfileModal isChatSidebar={isChatSidebar as boolean} />
          {!isAccountSidebar && (
            <span
              onClick={toggleChatSidebar}
              className="h-12 w-12 rounded-full p-3 hover:bg-muted flex justify-center items-center cursor-pointer"
            >
              <Columns2 size={iconSize} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
