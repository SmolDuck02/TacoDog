"use client";

import { User, UserChat } from "@/lib/types";
import { iconMedium, monthDateOptions, timeOptions, yearDateOptions } from "@/lib/utils";
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
  const searchRef = useRef<HTMLInputElement>(null);

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
        user.username?.toLowerCase().includes(filter.toLowerCase().trim())
      );
      const filteredUserChats = filtered.map((user) => {
        const foundChat = userChats.find((userChat) => userChat.user.id === user.id);
        return foundChat ? foundChat : { user: user, chats: null };
      });
      setFilteredUsers(filteredUserChats.length > 0 ? filteredUserChats : null);
    } else {
      setFilteredUsers(userChats);
    }
  }, [filter, allUsers, userChats]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClose(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !document.getElementById("profileModal")?.contains(event.target as Node) &&
        !document.getElementById("editProfileModal")?.contains(event.target as Node)
      ) {
        setIsChatSidebar(false);
      }
    }

    if (isChatSidebar) {
      document.addEventListener("mousedown", handleClose);
    }

    return () => {
      document.removeEventListener("mousedown", handleClose);
    };
  }, [isChatSidebar]);

  return (
    <div
      ref={sidebarRef}
      className={`z-[49]    h-screen absolute left-0  max-w-[17rem]  ${
        isChatSidebar ? "w-full shadow-2xl border-r " : "w-[4rem]"
      } `}
      // onBlur={(event) => {
      //   console.log("ddw", event.relatedTarget, document.activeElement);
      //   if (!event.currentTarget.contains(event.relatedTarget)) {
      //     setIsChatSidebar(false);
      //   }
      // }}
    >
      <div className="w-full  h-full flex flex-col">
        <CardTitle
          className={`p-3 drop-shadow-xl  brightness-150 h-[3rem] lg:min-h-[5.5rem] text-[#ebe8e4]  flex items-center text-3xl lg:text-5xl  ${
            isChatSidebar
              ? "justify-start px-4 bg-slate-950/10"
              : "justify-center bg-gradient-to-r  from-black/15 via-black/10 to-transparent"
          } `}
        >
          <span>{isChatSidebar ? "tacodog/" : "T"}</span>
        </CardTitle>

        <div
          className={`${
            !isChatSidebar ? "gap-2" : "bg-[#ebe8e4] dark:bg-slate-950"
          } flex  flex-col min-h-[5rem] border-b   z-[10] text-muted-foreground justify-center items-center  px-3    `}
        >
          <div
            className={`text-xl   px-1 relative flex w-full items-center  ${
              isChatSidebar ? "justify-between pl-2 " : "justify-center"
            } `}
          >
            {isChatSidebar && <span>Chats</span>}
            <SquarePen
              size={iconMedium}
              className="cursor-pointer"
              onClick={() => {
                setIsChatSidebar(false);
                handleNewChat();
              }}
            />
          </div>

          {isChatSidebar ? (
            <div className="relative  flex gap-2 w-full  justify-end items-center">
              <Input
                ref={searchRef}
                className={` focus:ring-none bg-secondary placeholder:text-muted-foreground/50 dark:bg-gray-500/10 bg-[white] pr-8`}
                onFocus={handleNewChatClose}
                placeholder="Find people..."
                value={filter || ""}
                onChange={(e) => {
                  setFilter(e.target.value);
                }}
              />

              {filter ? (
                <X
                  size={iconMedium}
                  className="absolute text-muted-foreground/50 mr-1 cursor-pointer"
                  onClick={() => setFilter("")}
                />
              ) : (
                <Search
                  size={iconMedium}
                  className="absolute text-muted-foreground/50 mr-1 cursor-pointer"
                />
              )}
            </div>
          ) : (
            <Search size={iconMedium} className=" cursor-pointer" onClick={handleSearch} />
          )}
        </div>

        {/* user chats */}
        <div
          tabIndex={-1}
          // #07101f
          className={`${
            isChatSidebar ? "bg-white dark:bg-slate-950 lg:bg-white/20 lg:dark:bg-gray-900/20" : ""
          }  flex-1 gap-2 pt-4 flex w-full scrollbar overflow-auto flex-col px-3`}
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
                      window.innerWidth < 1000 && setIsChatSidebar(false);
                    }}
                    className={`flex gap-3 hover:cursor-pointer p-2 px-[10px] rounded items-center  w-full ${
                      isChatSidebar ? " justify-start" : "justify-center"
                    } ${
                      !filter &&
                      (isActiveChat ? `font-bold backdrop-blur-xl ` : "brightness-[.5] font-light")
                    } `}
                  >
                    <Avatar className="h-9 w-9 ">
                      <Image
                        alt="User Avatar"
                        height={300}
                        width={300}
                        className={`aspect-square h-full w-full `}
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
          className={` ${
            isChatSidebar
              ? "flex-row   items-end justify-center h-[5rem] bg-[#ebe8e4] dark:bg-slate-950"
              : "flex-col gap-6 items-center justify-end h-fit pt-4"
          }
           flex  text-muted-foreground  pb-4 px-[14px] `}
        >
          <ProfileModal isChatSidebar={isChatSidebar as boolean} />

          <button
            tabIndex={0}
            onClick={toggleChatSidebar}
            className="h-12 w-12 rounded-full p-3 hover:bg-muted flex justify-center items-center cursor-pointer"
          >
            <Columns2 size={iconMedium} />
          </button>
        </div>
      </div>
    </div>
  );
}
