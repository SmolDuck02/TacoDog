"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import ChatSidebar from "@/components/ui/chat-sidebar";
import { askTacoDog, getActiveChatHistory, getAllUsers, TacoDog } from "@/lib/api";
import { socket } from "@/lib/socketClient";
import { Chat, ChatHistory, User } from "@/lib/types";
import defaultBanner from "@/public/bg/defaultBG.avif";
import { Label } from "@radix-ui/react-label";
import { CircleEllipsis } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
const iconSize = 28;
export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/register");
    },
  });

  const [allUsers, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatUsersID, setChatUsers] = useState<string | null>();
  const chatMessageRef = useRef<HTMLSpanElement>(null);

  const [tacodog, setTacodog] = useState<User>({ id: "0", username: "" });
  const [searchText, setSearchText] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [isAccountSidebar, setAccountSidebar] = useState(false);

  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [activeChatHistory, setActiveChatHistory] = useState<ChatHistory[] | null>(null);

  const [chatMessage, setChatMessage] = useState<string | null>();
  const [messages, setMessages] = useState<Chat[]>([]);
  const [isSaveMessage, setIsSaveMessage] = useState(false);

  useEffect(() => {
    if (session) setCurrentUser(session.user as User);
  }, [session]);

  useEffect(() => {
    getAllUsers().then((allUsers) => setUsers(allUsers as User[]));
  }, []);

  const handleSetActiveChat = (id: string) => {
    if (currentUser) {
      const IDs = [id, currentUser.id].sort().join("");
      getActiveChatHistory(IDs).then((chatHistory) => {
        setActiveChatHistory(chatHistory as ChatHistory[]);
        setActiveChatUser(allUsers.filter((user) => user.id === id)[0]);
      });
    }
  };

  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (socket.connected && e.key === "Enter" && activeChatUser && currentUser && chatMessage) {
      e.preventDefault();
      if (chatMessageRef.current) chatMessageRef.current.textContent = "";

      const chatUsersID = [activeChatUser.id, currentUser.id].sort().join("");
      const chatHistory = {
        chatUsersID: chatUsersID,
        newChatMessage: { senderID: currentUser.id, chatMessage: chatMessage },
        activeChatHistory: activeChatHistory || [],
      };

      //user input
      socket.emit("sendChat", chatHistory);
      socket.on(`receiveChat:${chatUsersID}`, async (value) => {
        setActiveChatHistory([...(activeChatHistory || []), value]);
      });

      //ai output
      if (chatMessage.startsWith("@t")) {
        const result = await askTacoDog(chatMessage);
        socket.emit("sendChat", {
          ...chatHistory,
          newChatMessage: result,
          activeChatHistory: [...(activeChatHistory as ChatHistory[]), chatHistory.newChatMessage],
        });
        socket.on(`receiveChat:${chatUsersID}`, (value) => {
          setActiveChatHistory([...(activeChatHistory || []), chatHistory.newChatMessage, value]);
        });
      }

      setChatMessage("");
    }
  };

  useEffect(() => {
    if (socket === null) return;

    const handleConnect = () => console.log("Socket Connected");
    const handleDisconnect = () => console.log("Socket Disconnected");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatMessageRef.current && document.activeElement !== chatMessageRef.current) {
      chatMessageRef.current.textContent = "Enter message...";
      setChatMessage("");
    }
    // Focus the div element when the component mounts
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, [activeChatHistory]);

  const handleFocus = () => {
    if (chatMessageRef.current && !chatMessage) {
      chatMessageRef.current.textContent = "";
      setChatMessage("");
    }
  };
  const handleBlur = () => {
    if (chatMessageRef.current && !chatMessage) {
      chatMessageRef.current.textContent = "Enter message..."; // Reset placeholder on blur if empty
    }
  };
  function toggleAccountSidebar() {
    setAccountSidebar(!isAccountSidebar);
  }

  return (
    <div
      className={`${
        status === "loading" ? "hidden" : "flex"
      } overflow-hidden h-screen w-screen flex`}
    >
      <ChatSidebar allUsers={allUsers} handleSetActiveChat={handleSetActiveChat} />
      <div className=" h-full w-full flex flex-col  ">
        <div className="relative border-b w-full h-[7rem] flex items-center justify-center text-center text-xs ">
          <Image fill src={defaultBanner} className=" object-cover" alt="user banner" />
        </div>

        {activeChatUser ? (
          <div className=" w-[60%] h-fit mx-auto flex flex-col relative  ">
            <div className="  p-5 py-7 z-50 absolute w-full border-b backdrop-blur-md">
              <div className="flex justify-between items-center">
                <div className="flex gap-5 items-center">
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src="/avatars/tacodog.png" className=" cursor-default" />
                    <AvatarFallback>{activeChatUser.username[0]}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-3xl">{activeChatUser.username}</CardTitle>
                </div>
                <div className="flex gap-4 items-center">
                  <CircleEllipsis size={iconSize} className="cursor-pointer" />
                  {/* <Account username={user.username} setUser={setUser} /> */}
                </div>
              </div>
            </div>

            <div
              // ref="messages-container"
              ref={messageContainerRef}
              className=" pb-8  p-12 flex gap-5 scrollbar scroll-smooth flex-col overflow-y-scroll"
            >
              {/* empty div */}
              <div className="min-h-8 "></div>
              <div className="h-[26.5rem] flex flex-col gap-5 ">
                {activeChatHistory && currentUser && activeChatUser ? (
                  activeChatHistory.map((message, index) => {
                    const isAuthor = message.senderID == currentUser.id;
                    const author: User =
                      message.senderID == "TacoDog"
                        ? TacoDog
                        : isAuthor
                        ? currentUser
                        : activeChatUser;
                    return (
                      <div
                        id={index.toString()}
                        key={index}
                        className={`flex  w-fit gap-4 ${isAuthor && "self-end"} items-end`}
                      >
                        {!isAuthor && (
                          <Avatar className="mb-1 z-0">
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
                    <span className="text-3xl leading-none">Start a Convo</span>with TacoDog
                    <span className="text-sm text-[#3b4f72] ">
                      &quot;!&quot; prefix for text-based results! <br />
                      &quot;/&quot; prefix for image-based results!
                      <br />
                      Warf!
                    </span>
                  </CardDescription>
                )}
              </div>
            </div>
            <div className=" bottom-[3.1rem] h-4  absolute w-full border-t backdrop-blur-xl brightness-75"></div>
            {/* <MessagesCard
              messages={activeChatHistory}
              chatUsers={{ currentUser: currentUser, chatMate: activeChatUser }}
            /> */}
            <div className=" overflow-hidden z-10 flex gap-2 w-[95%] px-5  mx-auto ">
              <span
                ref={chatMessageRef}
                onFocus={() => handleFocus()}
                onBlur={() => handleBlur()}
                onInput={(e) => setChatMessage((e.target as HTMLElement).textContent)}
                contentEditable
                className={`${
                  chatMessage ? "text-white" : "text-slate-500"
                } max-h-48 px-4  overflow-y-auto no-scrollbar py-3 rounded border-2   w-full textarea`}
                role="textbox"
                onKeyDown={handleSendMessage}
              ></span>

              {/* <Textarea
                  placeholder="Type your message here."
                  onChange={(e) => setChatMessage(e.target.value)}
                  value={chatMessage}
                /> */}
              {/* <div className="flex flex-col gap-3 py-2 justify-end">
                <Send size={20} onClick={onSendMessage} className="cursor-pointer" type="submit" />
                {chatMessage && (
                  <X size={20} onClick={() => setChatMessage("")} className="cursor-pointer" />
                  )}
                  </div> */}
            </div>
          </div>
        ) : (
          <div className="w-full  flex-1 flex items-center text-[8rem] justify-center ">
            Helllow!
          </div>
        )}
      </div>

      {/* </div> */}
    </div>
  );
  <div className=" bg-orange-300 overflow-hidden   flex flex-col"></div>;
  //   return (
  //     <main className="flex h-screen overflow-hidden  min-w-screen">
  //       <div className="w-[15%] h-screen flex flex-col">
  //         <CardTitle className="border-b w-full h-16 flex items-end text-4xl pb-1">
  //           TACODOGG/.
  //         </CardTitle>
  //         <div className="px-5 py-6 flex h-[90%] flex-col gap-1 ">
  //           <div className="flex items-center justify-between">
  //             <span className="text-lg "> Chats </span>
  //             <div className="flex gap-2 justify-center">
  //               <SquarePen className="h-[1.2rem] w-[1.2rem] cursor-pointer" />
  //             </div>
  //           </div>

  //           <DropdownMenu>
  //             <DropdownMenuTrigger>
  //               <Input
  //                 placeholder="Search someone..."
  //                 value={searchText}
  //                 onChange={(e) => setSearchText(e.target.value)}
  //               />
  //             </DropdownMenuTrigger>
  //             <DropdownMenuContent className="w-48">
  //               {users.map((user, index) => (
  //                 <DropdownMenuItem
  //                   key={index}
  //                   onClick={() =>
  //                     setActiveChatUser((prevActive) => ({ ...prevActive, username: user.username }))
  //                   }
  //                 >
  //                   {user.username}
  //                 </DropdownMenuItem>
  //               ))}
  //             </DropdownMenuContent>
  //           </DropdownMenu>

  //           <Chats
  //             setActiveChatUser={setActiveChatUser}
  //             users={users}
  //             currentUser={currentUser}
  //             privateChats={privateChats}
  //           />
  //         </div>
  //       </div>
  //       <div className="min-h-screen flex-1 flex flex-col border-x pb-10 ">
  //         <CardDescription className="border-b w-full h-16 flex items-center justify-center text-center text-xs pb-1">
  //           AI Chat Assistant - CSIT349 Final Project <br /> (Ask TacoDog anything with a
  //           &quot;!&quot; prefix)
  //         </CardDescription>
  //         <div className="w-4/5 h-[90%] mx-auto flex gap-5 flex-col ">
  //           <CardHeader className="static">
  //             <div className="flex justify-between items-center">
  //               <div className="flex gap-5 items-center">
  //                 <Avatar className="h-9 w-9 cursor-pointer">
  //                   {activeChatUser.user2.username.toLowerCase() == "tacodog" ? (
  //                     <AvatarImage src="/avatars/tacodog.png" />
  //                   ) : (
  //                     <AvatarImage src="" />
  //                   )}
  //                   <AvatarFallback>{activeChatUser.user2.username[0]}</AvatarFallback>
  //                 </Avatar>
  //                 <CardTitle>{activeChatUser.user2.username}</CardTitle>
  //               </div>
  //               <div className="flex gap-4 items-center">
  //                 <ThemeModeButton />
  //                 {/* <Account username={user.username} setUser={setUser} /> */}
  //               </div>
  //             </div>
  //           </CardHeader>
  //           <CardContent
  //             id="messages-container"
  //             className="p-0 flex-1 overflow-auto scrollbar scroll-smooth"
  //           >
  //             <MessagesCard messages={messages} currentUsername={currentUser?.username} />
  //           </CardContent>
  //           <CardFooter className="flex gap-3">
  //             <Textarea
  //               placeholder="Type your message here."
  //               onChange={(e) => setChatMessage(e.target.value)}
  //               value={chatMessage}
  //             />
  //             <div className="flex gap-3 justify-end">
  //               {chatMessage && (
  //                 <X size={20} onClick={() => setChatMessage("")} className="cursor-pointer" />
  //               )}
  //               <Send size={20} onClick={onSendMessage} className="cursor-pointer" type="submit" />
  //             </div>
  //           </CardFooter>
  //         </div>
  //       </div>
  //       <div className="w-[15%] relative min-h-screen">
  //         {" "}
  //         <EmptyDiv />{" "}
  //         <div className="px-5 py-6  flex flex-col gap-1 ">
  //           <div className="flex justify-between   items-center">
  //             <div className="flex flex-col">
  //               <span className="text-lg">Account </span>
  //               <span className="text-xs text-muted-foreground"> {currentUser?.username}</span>
  //             </div>
  //             <Avatar className="h-9 w-9 cursor-pointer ">
  //               <AvatarImage src="https://github.com/shadcn.png" />
  //               <AvatarFallback>U</AvatarFallback>
  //             </Avatar>
  //           </div>
  //         </div>
  //         <div className="absolute bottom-16 w-full px-5">
  //           <Button variant="ghost" className="w-full text-right" onClick={() => signOut()}>
  //             Log Out
  //           </Button>
  //         </div>
  //       </div>
  //     </main>
  //   );
}

interface PrivateChat {
  user1: User;
  user2: User;
  chats: Chat[];
}
interface ChatsProps {
  setActiveChatUser: (newActiveChat: PrivateChat) => void;
  users: User[];
  currentUser: User;
  privateChats: PrivateChat[];
}
function Chats(props: ChatsProps) {
  const { setActiveChatUser, users, currentUser, privateChats } = props;

  const privateChat = privateChats.filter(
    (chat) => chat.user1.id == currentUser.id || chat.user2.id == currentUser.id
  );

  // console.log("amb", privateChat, currentUser);

  return (
    <div className="flex mt-2 flex-col scrollbar pt-2 h-4/5 overflow-auto w-full gap-4">
      {/* <span className="flex h-full justify-center items-center text-sm text-muted-foreground">
        No Chats
      </span> */}

      {users.map((user, index) => {
        const privateChat = privateChats.filter(
          (chat) =>
            (chat.user1.id == user.id && chat.user2.id == currentUser.id) ||
            (chat.user2.id == user.id && chat.user1.id == currentUser.id)
        )[0];

        // console.log("ded", privateChat);

        return (
          <Button
            key={index}
            variant="ghost"
            className="flex gap-5 w-full justify-start"
            onClick={() => {
              if (privateChat) {
                setActiveChatUser({
                  user1: currentUser,
                  user2: user,
                  chats: privateChat.chats,
                });
              } else {
                setActiveChatUser({
                  user1: currentUser, // Set proper default values
                  user2: user,
                  chats: [],
                });
              }
            }}
          >
            <Avatar className="h-9 w-9 cursor-pointer">
              {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            {user.username}
          </Button>
        );
      })}
    </div>
  );
}

function EmptyDiv() {
  return <CardTitle className="border-b w-full h-16 flex items-end text-4xl pb-1"></CardTitle>;
}
