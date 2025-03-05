import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { iconLarge } from "@/lib/utils";
import defaultAvatar from "@/public/avatars/defaultAvatar.png";
import { PhoneCall, X } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
export function IncomingCallModal({
  caller,
  handleVideoCallReject,
  handleVideoCallAccept,
}: {
  caller: User;
  handleVideoCallReject: (id: string) => void;
  handleVideoCallAccept: (value: User) => void;
}) {
  return (
    <Card>
      <CardContent
        className={`z-[70] left-1/2  -translate-x-1/2 absolute p-8 gap-3 flex flex-col `}
      >
        {/* profile menu component */}
        <CardHeader className="w-[30rem] py-3 relative flex flex-row   justify-center items-center ">
          <Image
            src={caller?.banner?.img.src || defaultAvatar}
            alt="Caller Banner"
            fill
            className="h-auto w-auto rounded-lg  object-cover brightness-75"
          />
          <div
            className={`z-10 px-2 flex gap-4  justify-start
            items-center  w-fit cursor-pointer `}
          >
            <Avatar className="h-16 w-16 aspect-square ">
              <AvatarImage src={caller?.avatar?.img.src || defaultAvatar.src} />
              <AvatarFallback>{caller?.username[0]}</AvatarFallback>
            </Avatar>
            <span className={`text-3xl font-bold`}>{caller?.username}</span>
          </div>
          <div className="z-10   w-full flex justify-end gap-4">
            <Button
              onClick={() => handleVideoCallAccept(caller)}
              variant="default"
              className="rounded-full h-14 w-14  aspect-square bg-green-500 hover:bg-green-700 "
            >
              <PhoneCall size={iconLarge} className=" cursor-pointer" />
            </Button>
            <Button
              onClick={() => handleVideoCallReject(caller?.id)}
              variant="secondary"
              className=" hover:brightness-75 rounded-full h-14 w-14  aspect-square "
            >
              <X size={iconLarge} className="cursor-pointer" />
            </Button>
          </div>
        </CardHeader>
      </CardContent>
    </Card>
  );
}
