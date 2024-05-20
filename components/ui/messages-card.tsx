import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardContent } from "./card";
import { Label } from "./label";

export default function MessagesCard({
  messages,
  currentUsername,
}: {
  messages: { chat: string; username: string }[];
  currentUsername: string;
}) {
  return (
    <Card>
      <CardContent className="  overflow-auto h-[40vh] scroll-smooth scrollbar p-5 flex flex-col gap-4">
        {messages[0] ? (
          messages.map((message, index) => {
            const isAuthor =
              currentUsername == message.username && message.username.toLowerCase() != "guest";
            return (
              <div
                id={index.toString()}
                key={index}
                className={`flex gap-4 ${isAuthor && "self-end"} items-end`}
              >
                {!isAuthor && (
                  <Avatar className="mb-1">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <Label htmlFor={index.toString()} className="pl-2 text-xs text-slate-500">
                    {message.username}
                  </Label>
                  <CardContent
                    id={index.toString()}
                    key={index}
                    className="border p-3 w-auto rounded-lg"
                  >
                    {message.chat}
                  </CardContent>
                </div>
              </div>
            );
          })
        ) : (
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-500">
            No Chat History
          </span>
        )}
      </CardContent>
    </Card>
  );
}
