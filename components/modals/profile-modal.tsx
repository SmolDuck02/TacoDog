import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@/lib/types";
import defaultAvatar from "@/public/avatars/defaultAvatar.png";
import defaultBanner from "@/public/bg/defaultBG.avif";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import EditProfileModal from "./edit-profile-modal";

export function ProfileModal({ isChatSidebar }: { isChatSidebar: boolean }) {
  const { data: session } = useSession();
  const user = session?.user as User;
  const [isAccountSidebar, setAccountSidebar] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* profile header */}
        <div
          className={`  rounded p-2 flex gap-4   ${
            isChatSidebar ? "justify-start hover:bg-slate-700" : "justify-center"
          } items-center  w-full cursor-pointer `}
        >
          <Avatar className="h-9 w-9 ">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span className={` ${isChatSidebar ? "flex" : "hidden"} `}>{user?.username}</span>
        </div>
      </DialogTrigger>
      <DialogContent className={` left-44 top-[34rem] p-0 w-[20rem] sm:max-w-[425px]`}>
        {/* profile menu component */}

        <DialogHeader>
          <div className={` relative border-b border-gray-400  w-full h-16  text-4xl `}>
            <Image
              src={user?.banner || defaultBanner.src}
              alt="User Banner"
              fill={true}
              style={{
                objectFit: "cover",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
              }}
            />
          </div>
          {/* profile header */}
          <div
            className={` flex-row
          flex justify-center items-center  gap-1`}
          >
            <div className={` border-b p-3 flex gap-4  justify-start items-center w-full `}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || defaultAvatar.src} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>

              <span className={` text-3xl `}>{user?.username}</span>
            </div>
          </div>

          {/* profile menu items*/}
          <div className="flex flex-col gap-3 py-3">
            <div className={`w-full  px-6 text-sm flex flex-col`}>
              <div className="flex w-full justify-between">
                Username
                <p>{user?.username}</p>
              </div>
            </div>
            {/* <div className={`  w-full px-6 text-sm flex flex-col`}>
              <div className="flex w-full justify-between">
                Dark mode
                <Switch className="h-5 w-5" onClick={toggleMode} checked={checked} />
              </div>
            </div> */}
            <div className={`  w-full  px-6 text-sm flex flex-col`}>
              <div className="flex w-full justify-between">
                Avatar
                <p>Morty</p>
              </div>
            </div>
            <div className={`  w-full  px-6 text-sm flex flex-col`}>
              <div className="flex w-full justify-between">
                Banner
                <p>Moss</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <div className={`  flex flex-col gap-1 bottom-2 w-full px-3`}>
              <EditProfileModal />
              <Button
                variant="ghost"
                className=" hover:bg-red-700 w-full text-right"
                onClick={() => signOut({ callbackUrl: "/register" })}
              >
                Log Out
              </Button>
            </div>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

//   {/* profile menu component */}
//   <div
//     className={`bg-white dark:bg-[#111] w-full flex flex-col    ${
//       isAccountSidebar && " h-[50%]"
//     } absolute  bottom-2`}
//   >
//     <div
//       className={` ${
//         isAccountSidebar ? "relative" : "hidden"
//       } border-b border-gray-400  w-full h-16  text-4xl `}
//     >
//       <Image
//         src={defaultBanner}
//         alt="User Banner"
//         fill={true}
//         style={{ objectFit: "cover", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}
//       />
//     </div>

//     {/* profile header */}
//     <div
//       className={` ${isChatSidebar ? "flex-row" : "flex-col h-32"}
//         ${!isAccountSidebar && "p-2"}
//       } border-t-2 flex justify-center items-center  gap-1`}
//     >
//       <div
//         onClick={toggleAccountSidebar}
//         className={` ${isAccountSidebar ? "border-b p-3" : "rounded p-2"} flex gap-4   ${
//           isChatSidebar ? "justify-start hover:bg-slate-700" : "justify-center"
//         } items-center  w-full cursor-pointer `}
//       >
//         <Avatar className="h-9 w-9 ">
//           <AvatarImage src="https://github.com/shadcn.png" />
//           <AvatarFallback>U</AvatarFallback>
//         </Avatar>
//         <span className={` ${isChatSidebar ? "flex" : "hidden"} `}>{user?.username}</span>
//       </div>

//       {!isAccountSidebar && (
//         <span className="h-12 w-12 rounded-full p-3 hover:bg-slate-700 flex justify-center items-center cursor-pointer">
//           <Columns2 size={iconSize} onClick={toggleChatSidebar} />
//         </span>
//       )}
//     </div>

//     {/* profile menu items*/}
//     {isAccountSidebar && (
//       <div className="flex flex-col gap-3 py-3">
//         <div className={`w-full  px-6 text-sm flex flex-col`}>
//           <div className="flex w-full justify-between">
//             Username
//             <p>{user?.username}</p>
//           </div>
//         </div>
//         {/* <div className={`  w-full px-6 text-sm flex flex-col`}>
//           <div className="flex w-full justify-between">
//             Dark mode
//             <Switch className="h-5 w-5" onClick={toggleMode} checked={checked} />
//           </div>
//         </div> */}
//         <div className={`  w-full  px-6 text-sm flex flex-col`}>
//           <div className="flex w-full justify-between">
//             Avatar
//             <p>Morty</p>
//           </div>
//         </div>
//         <div className={`  w-full  px-6 text-sm flex flex-col`}>
//           <div className="flex w-full justify-between">
//             Banner
//             <p>Moss</p>
//           </div>
//         </div>
//         <div className={` absolute flex flex-col gap-1 bottom-2 w-full px-3`}>
//           <EditProfileModal />
//           <Button
//             variant="ghost"
//             className=" hover:bg-red-700 w-full text-right"
//             onClick={() => signOut({ callbackUrl: "/register" })}
//           >
//             Log Out
//           </Button>
//         </div>
//       </div>
//     )}
//   </div>
