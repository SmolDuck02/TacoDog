import { User } from "@/lib/types";
import Image, { StaticImageData } from "next/image";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { CardTitle } from "../ui/card";
import { getImageSrc } from "@/lib/utils";
interface SearchModalProps {
  searchText: string;
  filteredUsers: User[];
  handleSetActiveChat: (value: User) => void;
}
export default function SearchModal(props: SearchModalProps) {
  const { searchText, filteredUsers, handleSetActiveChat } = props;

  return (
    <div
      id="searchModal"
      // showSearchModalMini  ? "w-[100%] -left-[50%] translate-x-1/2"
      className={`top-[8.1rem] lg:top-[10.5rem] text-muted-foreground shadow-md rounded ml-7 p-3 gap-2 z-[40] flex flex-col bg-[#ebe8e4] dark:bg-slate-950 scrollbar  h-[14rem] overflow-auto absolute w-[60%] lg:w-[47%]  left-1/2 -translate-x-1/2`}
      tabIndex={-1} // Makes the div focusable
    >
      {searchText == "" && "People you might know"}
      {filteredUsers.length > 0 ? (
        (searchText ? filteredUsers : filteredUsers.slice(0, 3)).map((user) => (
          <div
            onClick={() => {
              handleSetActiveChat(user);
              // setActiveChatHistory(null);
            }}
            key={user?.id}
            className={`flex gap-3 hover:bg-muted 
                hover:cursor-pointer p-2 rounded w-full items-center`}
          >
            <Avatar className="h-9 w-9 ">
              <Image
                loading="eager"
                alt="User Avatar"
                height={300}
                width={300}
                className="aspect-square h-full w-full"
                src={getImageSrc(user?.avatar?.img)}
              />
              <AvatarFallback>{user?.username?.[0]}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg font-light">{user?.username}</CardTitle>
          </div>
        ))
      ) : (
        <div className="h-full w-full flex justify-center items-center text-slate-500">
          No people found.
        </div>
      )}
    </div>
  );
}
