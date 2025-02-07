import { ChatHistory, User } from "@/lib/types";
import { dateTimeOptions, monthDateOptions, timeOptions, yearDateOptions } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import Image, { StaticImageData } from "next/image";
import { useEffect } from "react";
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
  useEffect(() => {
    console.log(activeChatHistory)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log("read", entry.target);
        }
      },
      { root: null, threshold: 0.1 }
    );

    const chatElements = document.querySelectorAll(".chat");

    const handleMouseHover = (element: Element, mode = "leave") => {
      const label = element.firstChild?.lastChild as HTMLLabelElement;
      
      if (mode == "enter" || (mode == "click" && label.classList.contains("opacity-0"))) {
        label.classList.remove("opacity-0", "bottom-0");
        label.classList.add("opacity-100", "-bottom-4");
      } else {
        label.classList.remove("opacity-100", "-bottom-4");
        label.classList.add("opacity-0", "bottom-0");
      }
    };

    // Named event handlers
    const handleClick = (event: Event) => handleMouseHover(event.currentTarget as Element, "click");
    const handleMouseEnter = (event: Event) =>
      handleMouseHover(event.currentTarget as Element, "enter");
    const handleMouseLeave = (event: Event) => handleMouseHover(event.currentTarget as Element);

    chatElements.forEach((chat) => {
      observer.observe(chat);
      chat.addEventListener("click", handleClick);
      chat.addEventListener("mouseenter", handleMouseEnter);
      chat.addEventListener("mouseleave", handleMouseLeave);
    });

    const lastChat = chatElements[chatElements.length - 1];
    if (
      lastChat.getBoundingClientRect().top >= 0 &&
      lastChat.getBoundingClientRect().bottom <= window.innerHeight
    ) {
      // console.log("read", lastChat);
    }

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      chatElements.forEach((chat) => {
        observer.unobserve(chat);
        chat.removeEventListener("click", handleClick);
        chat.removeEventListener("mouseenter", handleMouseEnter);
        chat.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [activeChatHistory]);

  function getTime(ms: number) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return `${hours > 0 ? hours + "h" : ""} ${minutes > 0 ? minutes + "m" : ""} ${seconds}s`;
  }
  return (
    <>
      {/* empty div for padding*/}
      <div className="min-h-[3rem] "></div>

      {/* chat messages */}
      {activeChatHistory.map((message, index) => {
        const { chatMessage:isMessage, senderID, start, end, isSeen = false, isDelivered = false, chatMessage, date:messageDate } = message
    
        const isAuthor = senderID == currentUser.id;
        const author: User = isAuthor ? currentUser : activeChatUser;
        const duration = end && start ? getTime(end - start) : 0;
        const d = new Date(messageDate);
        const options =
          d.getDate() == new Date().getDate()
            ? timeOptions
            : d.getFullYear() == new Date().getFullYear()
            ? monthDateOptions
            : yearDateOptions;
        const date = new Date(message.date).toLocaleString("en-US", options);
        
        return (
          <div
            key={index}
            className={` chat flex w-fit gap-4  items-end ${isAuthor && "self-end"} ${
              !isMessage && "self-center"
            } `}
          >
            {!isMessage ? (
              <div className="text-sm text-muted-secondary gap-4 flex justify-center items-center  text-center py-2">
                <span className="w-4 bg-muted-secondary/50 h-[0.1rem] rounded" />
                <div className="flex flex-col">
                  <span>
                    {senderID == currentUser.id ? "You" : activeChatUser.username} Called &#x2022;{" "}
                    {duration}
                  </span>
                  <span className="text-xs">
                    {new Date(message.date).toLocaleString("en-US", dateTimeOptions)}
                  </span>
                </div>
                <span className="w-4 bg-muted-secondary/50 h-[0.1rem] rounded" />
              </div>
            ) : (
              <>
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
                <div
                  className={`${isAuthor ? "items-end" : "items-start"} relative flex flex-col `}
                >
                  {/* {!isAuthor && (
                    <Label
                      htmlFor={index.toString()}
                      className="px-2 flex justify-start text-xs text-muted-foreground"
                    >
                      {author.username}
                    </Label>
                  )} */}

                  <CardContent
                    id={index.toString()}
                    key={index}
                    className="z-[10] bg-white dark:bg-slate-950 shadow border p-3 flex items-start text-left w-auto rounded-lg"
                  >
                    {chatMessage}
                  </CardContent>

                  <Label
                    className={`date px-2 flex ${
                      isAuthor ? "justify-end" : "justify-start"
                    } opacity-0 ease-out duration-300 transition-all bottom-0 absolute
                   text-[10px] text-muted-foreground`}
                  >
                    {date}
                  </Label>
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* empty div for padding */}
      <div className="min-h-5 "></div>
    </>
  );
}
