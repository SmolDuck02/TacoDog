import ImageDisplay from "./chat/image-display";
import { ChatHistory, User } from "@/lib/types";
import { iconLarge, monthDateOptions, timeOptions, yearDateOptions } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { PhoneOffIcon } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useEffect } from "react";
import { Avatar, AvatarFallback } from "./avatar";
import { CardContent } from "./card";

export default function ChatMesages({
  activeChatHistory,
  currentUser,
  activeChatUser,
  handleSeenMessage,
}: {
  activeChatHistory: ChatHistory[];
  currentUser: User;
  activeChatUser: User;
  handleSeenMessage: (id: number) => void;
}) {
  useEffect(() => {
    // const observer = new IntersectionObserver(
    //   ([entry]) => {
    //     if (entry.isIntersecting) {
    //       const id = entry.target.querySelector(".chatMessage")?.id;

    //       if (id) handleSeenMessage(Number(id));
    //     }
    //   },
    //   { root: null, threshold: 0.1 }
    // );

    const chatElements = document.querySelectorAll(".chatMessage");

    const handleMouseHover = (element: Element, mode = "leave") => {
      const label = element.parentElement?.querySelector("label") as HTMLElement;

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

    chatElements.forEach((chat, index) => {
      // observer.observe(chat);
      if (index !== chatElements.length - 1) {
        chat.addEventListener("click", handleClick);
        chat.addEventListener("mouseenter", handleMouseEnter);
        chat.addEventListener("mouseleave", handleMouseLeave);
      }
    });

    
    const lastChat = chatElements[chatElements.length - 1];
    if (
      lastChat &&
      lastChat.getBoundingClientRect().top >= 0 &&
      lastChat.getBoundingClientRect().bottom <= window.innerHeight
    ) {
      const isAuthor = activeChatHistory[+lastChat?.id as number]?.senderID === currentUser.id;
      if (lastChat.id && !isAuthor) handleSeenMessage(+lastChat.id);
    }

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      chatElements.forEach((chat) => {
        // observer.unobserve(chat);
        chat.removeEventListener("click", handleClick);
        chat.removeEventListener("mouseenter", handleMouseEnter);
        chat.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [activeChatHistory, handleSeenMessage, currentUser.id]);

  function getTime(ms: number) {
    let seconds = Math.floor((ms / 1000) % 60);
    let minutes = Math.floor((ms / (1000 * 60)) % 60);
    let hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return `${hours > 0 ? hours + "h" : ""} ${minutes > 0 ? minutes + "m" : ""} ${seconds}s`;
  }
  return (
    <>
      {/* empty div for padding*/}
      {/* <div className="min-h-[3rem] "></div> */}

      {/* chat messages */}
      {activeChatHistory.map((message, index) => {
        if (!message) return;
        const {
          senderID,
          start = 0,
          end,
          isSeen = false,
          isDelivered = false,
          uploads = null,
          date: messageDate,
        } = message;
        const chatMessage = message.chatMessage || false;
        const isAuthor = senderID === currentUser.id || senderID === currentUser.username;
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
        const isLastMessage = message === activeChatHistory.at(-1);
        const multipleMessages = activeChatHistory[index]?.senderID !== activeChatHistory[index+1]?.senderID;
        
        return (
          <div
            key={index}
            className={` flex w-full gap-4 ${uploads ? "items-end" : "items-center"}  ${
              isAuthor ? "justify-end pl-1/5" : "pr-1/5 justify-start"
            } `}
          >
            {!isAuthor && multipleMessages ? (
                  <Avatar className="mb-1 z-0 h-9 w-9">
                    <Image
                      src={author?.avatar?.img as StaticImageData}
                      alt="User Avatar"
                      height={300}
                      width={300}
                      className="aspect-square h-full w-full"
                    />
                    <AvatarFallback>{author.username[0]}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-9 w-9"></div>
                )}
            {!chatMessage && !uploads ? (
              // <div className="text-sm text-muted-secondary gap-4 flex justify-center items-center  text-center py-2">
              <div className="relative">
                <CardContent
                  id={index.toString()}
                  key={index}
                  className={`
                  chatMessage flex-wrap break-all z-[10] bg-[#ebe8e4] dark:bg-slate-950 text-justify shadow border py-4 px-3 flex items-start  rounded-lg
                  `}
                >
                  {/* <span className="w-4 bg-muted-secondary/50 h-[0.1rem] rounded" /> */}
                  <div id={index.toString()} className="video  flex  gap-2  items-center">
                    <span className="p-2 bg-[#ebe8e4]/10 rounded-full ">
                      <PhoneOffIcon
                        size={iconLarge}
                        className={` ${!start ? "text-red-800" : ""}`}
                      />
                    </span>
                    <span className="flex flex-col w-fit">
                      {!start
                        ? "Missed Call"
                        : `${senderID === currentUser.id ? "You" : activeChatUser.username} Called`}

                      {Boolean(start) && (
                        <span className="tex-xs text-muted-secondary">{duration}</span>
                      )}
                    </span>
                  </div>
                  {/* <span className="w-4 bg-muted-secondary/50 h-[0.1rem] rounded" /> */}
                </CardContent>
                <Label
                  className={`${isAuthor ? "justify-end " : "justify-start"}  ${
                    isLastMessage ? "opacity-100 -bottom-4" : "opacity-0  bottom-0"
                  }  flex px-2 text-xs absolute bottom-0 right-0`}
                >
                  {/* {new Date(message.date).toLocaleString("en-US", dateTimeOptions)} */}
                  {date}
                </Label>
              </div>
            ) : (
              // </div>
              <>
                <div
                  className={`${
                    isAuthor ? "items-end" : "items-start"
                  } relative w-full  flex flex-col `}
                >
                  {/* {!isAuthor && (
                    <Label
                      htmlFor={index.toString()}
                      className="px-2 flex justify-start text-xs text-muted-foreground"
                    >
                      {author.username}
                    </Label>
                  )} */}

                  {chatMessage && (
                    <CardContent
                      id={index.toString()}
                      key={index}
                      className="chatMessage flex-wrap break-all z-[10] bg-[#ebe8e4] dark:bg-slate-950 text-justify shadow border py-2 px-3 flex items-start max-w-[80%] rounded-lg"
                    >
                      {chatMessage}
                    </CardContent>
                  )}

                  {uploads && <ImageDisplay fileUploads={uploads} chat={true}/>}

                  {isSeen && isLastMessage && isAuthor ? (
                    <div className="activeUserAvatar w-fit z-10 pt-1 pr-1 flex items-center gap-1">
                      <Image
                        src={activeChatUser.avatar?.img as StaticImageData}
                        alt="Active Chat User Avatar"
                        height={300}
                        width={300}
                        className="aspect-square rounded-full object-cover h-3 w-3"
                      />
                      <span className=" text-xs text-muted-foreground font-light  inline-block">Seen {date}</span> 
                    </div>
                  ) : (
                    <Label
                      className={`date px-2 flex ${isAuthor ? "justify-end" : "justify-start"} ${
                        isLastMessage ? "opacity-100 -bottom-4" : "opacity-0  bottom-0"
                      }  ease-out duration-300 transition-all  absolute
                   text-[10px] text-muted-foreground`}
                    >
                      {isLastMessage && isAuthor && (isSeen ? "Seen •" : "Delivered •")} {date}
                    </Label>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* empty div for padding */}
      <div className="min-h-1 "></div>
      {/* <div className="min-h-5 "></div> */}
    </>
  );
}
