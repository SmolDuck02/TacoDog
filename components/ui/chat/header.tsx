import { User, UserChat } from "@/lib/types";
import { iconLarge, TacoDog } from "@/lib/utils";
import { Loader, Video, VideoOff } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { Avatar, AvatarFallback } from "../avatar";
import { Button } from "../button";
import { CardTitle } from "../card";
import { Input } from "../input";

type Props = {
  makeNewChat: boolean;
  setMakeNewChat: (value:boolean)=>void;
  setShowSearchModal: (value: boolean) => void;
  handleSearchModal: (value:string) => void;
  searchRef: any;
  activeUserChat: UserChat;
  isVideoCallRinging: boolean;
  currentUser: User;
  showCamera: boolean;
  handleVideoCall: () => void;
  handleVideoCallEnd: () => void;
};

export default function ChatHeader(props: Props) {
  const {
    makeNewChat,
    setMakeNewChat,
    setShowSearchModal,
    handleSearchModal,
    searchRef,
    activeUserChat,
    isVideoCallRinging,
    currentUser,
    showCamera,
    handleVideoCall,
    handleVideoCallEnd,
  } = props;


   const handleNewChatClose = () => {
     setMakeNewChat(false);
     setShowSearchModal(false);
   };

   console.log(
     activeUserChat?.user?.id,
     [TacoDog.id, currentUser?.id],![(TacoDog.id, currentUser?.id)].includes(
       activeUserChat?.user?.id
     )
   );
  return (
    <div className=" bg-[#ebe8e4] shadow border-b  dark:bg-slate-950 px-[15%] lg:px-[25%] min-h-[5rem] flex items-center justify-between   z-20 absolute w-full   backdrop-blur-md">
      {makeNewChat ? (
        <div className="w-full justify-center flex gap-3">
          <Button
            onClick={handleNewChatClose}
            className=" select-none text-muted-foreground"
            variant={"secondary"}
          >
            X
          </Button>
          <Input
            ref={searchRef}
            placeholder="Search people..."
            className="w-[90%] select-none p-5 bg-gray-500/10 placeholder:text-muted-foreground/50"
            onFocus={() => setShowSearchModal(true)}
            onChange={(e) => handleSearchModal(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex w-full justify-between items-center px-4">
          <div className="flex gap-5 items-center">
            <Avatar className="h-10 w-10 cursor-pointer">
              <Image
                alt="User Avatar"
                height={300}
                width={300}
                className="aspect-square h-full w-full"
                src={activeUserChat?.user?.avatar?.img as StaticImageData}
              />
              <AvatarFallback>{activeUserChat?.user?.username[0]}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{activeUserChat?.user?.username}</CardTitle>
          </div>
          <div className="flex gap-4 items-center">
            {isVideoCallRinging && <Loader className="animate-spin " />}
            {![+TacoDog.id, currentUser?.id].includes(activeUserChat?.user?.id) &&
             ( showCamera ? (
                <VideoOff
                  onClick={() => handleVideoCallEnd()}
                  size={iconLarge}
                  className="cursor-pointer"
                />
              ) : (
                <Video onClick={handleVideoCall} size={iconLarge} className="cursor-pointer" />
              ))}
            {/* <CircleEllipsis size={iconSize} className="cursor-pointer" /> */}
            {/* <Account username={user.username} setUser={setUser} /> */}
          </div>
        </div>
      )}
    </div>
  );
}
