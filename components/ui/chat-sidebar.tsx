"use client";

import { User } from "@/lib/types";
import { iconSize } from "@/lib/utils";
import { Columns2, Minimize, Search, SquarePen } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { CardTitle } from "./card";
import { Input } from "./input";
import { Switch } from "./switch";

export default function ChatSidebar({
  allUsers,
  handleSetActiveChat,
}: {
  allUsers: User[];
  handleSetActiveChat: (id: string) => void;
}) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [isChatSidebar, setChatSidebar] = useState(false);
  const [isAccountSidebar, setAccountSidebar] = useState(false);

  useEffect(() => {
    setChecked(!(theme == "light"));
  }, [theme]);
  function toggleMode() {
    setTheme(theme == "light" ? "dark" : "light");
  }
  function toggleAccountSidebar() {
    setAccountSidebar(!isAccountSidebar);
    setChatSidebar(true);
  }
  function toggleChatSidebar() {
    setChatSidebar(!isChatSidebar);
    setAccountSidebar(false);
  }

  return (
    <div className={`  h-full  max-w-[18rem] ${isChatSidebar ? "w-full" : "w-[5rem]"} relative`}>
      <div className="w-full h-screen flex flex-col">
        <CardTitle className="border-b h-16 flex items-end text-5xl p-2 ">
          <span className={`flex`}>{isChatSidebar ? "/tacodog" : "/t"}</span>
        </CardTitle>

        <div className="flex  flex-col gap-3 items-center p-3">
          <div
            className={`flex w-full items-center  ${
              isChatSidebar ? "justify-between" : "justify-center"
            } text-lg relative`}
          >
            <span className={`${isChatSidebar ? "flex" : "hidden"}  relative bottom-[-0.3rem]`}>
              Chats
            </span>
            <SquarePen size={iconSize} className=" cursor-pointer" />
          </div>

          <div className="flex gap-2 w-full justify-center">
            <Input
              className={`${isChatSidebar ? "flex" : "hidden"} `}
              placeholder="Find someone..."
              // value={searchText}
              // onChange={(e) => setSearchText(e.target.value)}
            />

            <Search size={iconSize} className=" cursor-pointer" />
          </div>
        </div>
        <div
          className={` bg-slate-800 py-3 flex w-full h-full scrollbar overflow-auto flex-col gap-4 px-3`}
        >
          {session &&
            allUsers.map((user: User, index: number) => (
              <div
                onClick={() => handleSetActiveChat(user.id)}
                key={user.id}
                className="flex hover:bg-black hover:cursor-pointer p-2 rounded w-full items-center justify-start gap-3"
              >
                <Avatar className="h-9 w-9 ">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{user.username}</CardTitle>
              </div>
            ))}
        </div>
      </div>

      <div
        className={`bg-black w-full flex flex-col gap-1 py-2 ${
          isAccountSidebar && " h-[50%]"
        } absolute  bottom-2`}
      >
        <Columns2
          onClick={toggleChatSidebar}
          size={iconSize}
          className={`${
            (isAccountSidebar || isChatSidebar) && "hidden"
          }  w-full mx-auto cursor-pointer `}
        />
        <div
          className={` ${
            isAccountSidebar ? "relative" : "hidden"
          } border-b border-gray-400 w-full h-16 items-end text-4xl `}
        >
          <Image
            src={"/bg/trees.jpg"}
            alt="User Banner"
            fill={true}
            objectFit="cover"
            style={{ borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
          />
        </div>
        <div className=" flex justify-center items-center px-2 gap-2">
          <div
            onClick={toggleAccountSidebar}
            className={` rounded flex gap-4 items-center p-2 w-full cursor-pointer hover:bg-slate-700`}
          >
            <Avatar className="h-9 w-9 ">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className={` ${isChatSidebar ? "flex" : "hidden"} `}>Guest</span>
          </div>
          {isAccountSidebar && (
            <Minimize size={iconSize} onClick={toggleAccountSidebar} className="m-3 cursor-pointer" />
          )}
          {isChatSidebar && (
            <Columns2 size={iconSize} onClick={toggleChatSidebar} className="m-3 cursor-pointer" />
          )}
        </div>
        <div
          className={` ${
            isAccountSidebar ? "absolute" : "hidden"
          } w-full py-3 px-6 text-sm flex flex-col`}
        >
          <div className="flex w-full justify-between">
            Dark mode
            <Switch onClick={toggleMode} checked={checked} />
          </div>
        </div>
        <div className={` ${isAccountSidebar ? "absolute" : "hidden"} bottom-2 w-full px-3`}>
          <Button
            variant="ghost"
            className=" hover:bg-red-700 w-full text-right"
            onClick={() => signOut({ callbackUrl: "/register" })}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
