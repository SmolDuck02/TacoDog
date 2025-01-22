"use client";

import { User } from "@/lib/types";
import { iconSize } from "@/lib/utils";
import { Columns2, Search, SquarePen } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ProfileModal } from "../modals/profile-modal";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { CardTitle } from "./card";
import { Input } from "./input";

export default function ChatSidebar({
  allUsers,
  handleSetActiveChat,
}: {
  allUsers: User[];
  handleSetActiveChat: (id: string) => void;
}) {
  const { data: session } = useSession();
  const user = session?.user as User;
  const { theme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [isChatSidebar, setIsChatSidebar] = useState(false);
  const [isAccountSidebar, setAccountSidebar] = useState(false);

  useEffect(() => {
    setChecked(!(theme == "light"));
  }, [theme]);
  function toggleMode() {
    setTheme(theme == "light" ? "dark" : "light");
  }

  function toggleAccountSidebar() {
    setAccountSidebar(!isAccountSidebar);
    setIsChatSidebar(true);
  }
  function toggleChatSidebar() {
    setIsChatSidebar(!isChatSidebar);
    setAccountSidebar(false);
  }

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
              onClick={() => setIsChatSidebar(true)}
            />
          </div>

          {isChatSidebar ? (
            <div className="relative flex gap-2 w-full justify-end items-center">
              <Input
                className={` pr-8`}
                placeholder="Find someone..."
                // value={searchText}
                // onChange={(e) => setSearchText(e.target.value)}
              />

              <Search size={20} className="absolute text-slate-500 mr-2 cursor-pointer" />
            </div>
          ) : (
            <Search
              size={iconSize}
              className="cursor-pointer"
              onClick={() => setIsChatSidebar(true)}
            />
          )}
        </div>

        {/* user chats */}
        <div
          className={`  py-2 flex w-full ${
            isChatSidebar ? "h-[31rem]" : "h-[27.5rem]"
          } scrollbar overflow-auto flex-col gap-4 px-3`}
        >
          {session &&
            allUsers.map((user: User, index: number) => (
              <div
                onClick={() => handleSetActiveChat(user.id)}
                key={user.id}
                className={`flex gap-3 ${
                  isChatSidebar && "hover:bg-black "
                } hover:cursor-pointer p-2 rounded w-full items-center`}
              >
                <Avatar className="h-9 w-9 ">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                {isChatSidebar && (
                  <CardTitle className="text-lg font-light">{user.username}</CardTitle>
                )}
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
        <ProfileModal isChatSidebar={isChatSidebar} />

        {!isAccountSidebar && (
          <span className="h-12 w-12 rounded-full p-3 hover:bg-slate-700 flex justify-center items-center cursor-pointer">
            <Columns2 size={iconSize} onClick={toggleChatSidebar} />
          </span>
        )}
      </div>
    </div>
  );
}
