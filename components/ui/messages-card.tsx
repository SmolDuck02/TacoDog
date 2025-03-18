import type { ChatHistory, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { CardContent, CardDescription } from "./card";
import { Label } from "./label";

export default function MessagesCard({
  messages,
  chatUsers: { currentUser, chatMate },
}: {
  messages: ChatHistory[] | null;
  chatUsers: { currentUser: User | null; chatMate: User | null };
}) {
  return (
    <div
      // id="messages-container"
      className="scroll-smooth bg-green-700  flex-1 scrollbar  p-5 flex flex-col justify-end  gap-4"
    >
      {messages && currentUser && chatMate ? (
        messages.map((message, index) => {
          const isAuthor = message.senderID == currentUser.id;
          const author: User = isAuthor ? currentUser : chatMate;
          return (
            <div
              id={index.toString()}
              key={index}
              className={`flex bg-orange-400 w-fit gap-4 ${isAuthor && "self-end"} items-end`}
            >
              {!isAuthor && (
                <Avatar className="mb-1">
                  <AvatarImage src={"/avatars/tacodog.png"} />
                  <AvatarFallback>{author.username[0]}</AvatarFallback>
                </Avatar>
              )}
              <div className={`${isAuthor ? "items-end" : "items-start"} flex flex-col `}>
                <Label
                  htmlFor={index.toString()}
                  className="px-2 flex justify-start text-xs text-slate-500"
                >
                  {author.username}
                </Label>
                {/* {message && message.chat.toLowerCase().startsWith("https") ? (
                    <Image
                      src={message.chat}
                      alt="image generated response"
                      className="rounded"
                      width={200}
                      height={200}
                    />
                  ) : ( */}
                <CardContent
                  id={index.toString()}
                  key={index}
                  className="border p-3 flex items-start  text-left w-auto rounded-lg"
                >
                  {message.chatMessage}
                </CardContent>
                {/* )} */}
              </div>
            </div>
          );
        })
      ) : (
        <CardDescription className="h-full bg-black w-full text-center flex text-lg flex-col justify-center items-center">
          Ask TacoDog
          <span className="text-sm text-[#3b4f72] ">
            &quot;!&quot; prefix for text-based results! <br />
            &quot;/&quot; prefix for image-based results!
            <br />
            Warf!
          </span>
        </CardDescription>
      )}
    </div>
  );
}
