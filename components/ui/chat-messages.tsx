import { ChatHistory, User } from "@/lib/types";
import { Label } from "@radix-ui/react-label";
import Image, { StaticImageData } from "next/image";
import { Avatar, AvatarFallback } from "./avatar";
import { CardContent } from "./card";
export default function ChatMesages({
  activeChatHistory,
  currentUser,
  activeChatUser,
}: {
  activeChatHistory: ChatHistory[];
  currentUser: User;
  activeChatUser: User;
}) {
  return (
    <>
      {/* empty div */}
      <div className="min-h-[5rem] "></div>

      {/* chat messages */}
      {activeChatHistory.map((message, index) => {
        const isAuthor = message.senderID == currentUser.id;
        const author: User = isAuthor ? currentUser : activeChatUser;
        return (
          <div
            id={index.toString()}
            key={index}
            className={`flex w-fit gap-4 ${isAuthor && "self-end"}  items-end`}
          >
            {!isAuthor && (
              <Avatar className="mb-1 z-0">
                <Image
                  src={author?.avatar?.img as StaticImageData}
                  alt="User Avatar"
                  height={300}
                  width={300}
                  className="aspect-square h-full w-full"
                />
                <AvatarFallback>{author.username[0]}</AvatarFallback>
              </Avatar>
            )}
            <div className={`${isAuthor ? "items-end" : "items-start"} flex flex-col `}>
              <Label
                htmlFor={index.toString()}
                className="px-2 flex justify-start text-xs text-muted-foreground"
              >
                {author.username}
              </Label>

              <CardContent
                id={index.toString()}
                key={index}
                className="bg-white dark:bg-slate-950 shadow border p-3 flex items-start text-left w-auto rounded-lg"
              >
                {message.chatMessage}
              </CardContent>
            </div>
          </div>
        );
      })}

      {/* empty div */}
      <div className="min-h-3 "></div>
    </>
  );
}
