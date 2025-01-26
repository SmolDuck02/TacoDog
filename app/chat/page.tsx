"use client";
import { IncomingCallModal } from "@/components/modals/incoming-call-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import ChatSidebar from "@/components/ui/chat-sidebar";
import { Input } from "@/components/ui/input";
import { askTacoDog, getActiveChatHistory, getAllUsers, TacoDog } from "@/lib/api";
import { socket } from "@/lib/socketClient";
import { Chat, ChatHistory, User } from "@/lib/types";
import defaultBanner from "@/public/bg/defaultBG.avif";
import { Label } from "@radix-ui/react-label";
import { CircleEllipsis, Loader, Video, VideoOff } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [chatUsersID, setChatUsersID] = useState<string | null>();
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
    getAllUsers().then((allUsers) => {
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setActiveChatUser(allUsers?.filter((user) => user?.username === "TacoDog")[0] as User);
    });
  }, []);

  const [isNewChat, setIsNewChat] = useState(false);

  const handleNewChat = useCallback(() => {
    setShowSearchModalMini(false);
    setActiveChatUser({ username: "" } as User);
    setIsNewChat(true);
  }, []);

  const handleNewChatClose = () => {
    setActiveChatUser(allUsers?.filter((user) => user?.username === "TacoDog")[0] as User);
    setIsNewChat(false);
  };

  const handleSetActiveChat = useCallback(
    (id: string) => {
      if (currentUser) {
        const IDs = [id, currentUser.id].sort().join("");

        setIsNewChat(false);
        setShowSearchModal(false);
        setChatUsersID(IDs);

        getActiveChatHistory(IDs).then((chatHistory) => {
          setActiveChatHistory(chatHistory as ChatHistory[]);
          setActiveChatUser(allUsers.filter((user) => user.id === id)[0]);
        });
      }
    },
    [allUsers, currentUser]
  );

  const [incomingCall, setIncomingCall] = useState<User | null>(null);
  useEffect(() => {
    socket.on(`receiveChat:${chatUsersID}`, async (value) => {
      setActiveChatHistory([...(activeChatHistory || []), value]);
    });

    socket.on(`receiveCall:${currentUser?.id}`, (value) => {
      console.log("Incoming caller", value);
      setIncomingCall(value);
    });

    socket.on(`acceptCall`, ({ callerID, receiverID }) => {
      console.log("call accepted caller", callerID);
      console.log("call accepted receiver", receiverID);
      if (receiverID == currentUser?.id) {
        handleSetActiveChat(callerID);
        setShowCamera(true);
        initializeCamera();
      } else if (callerID == currentUser?.id) {
        setIsVideoCallRinging(false);
      }
    });

    socket.on(`rejectCall:${currentUser?.id}`, () => {
      console.log("call rejected");
      setShowCamera(false);
      setIsVideoCallRinging(false);
      setIncomingCall(null);
    });
    return () => {
      socket.off(`receiveChat:${chatUsersID}`);
      socket.off(`receiveCall:${currentUser?.id}`);
      socket.off(`acceptCall`);
      socket.off(`rejectCall:${currentUser?.id}`);
    };
  });

  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (socket.connected && e.key === "Enter" && activeChatUser && currentUser && chatMessage) {
      e.preventDefault();

      if (chatMessageRef.current) chatMessageRef.current.textContent = "";

      const chatHistory = {
        chatUsersID: chatUsersID,
        newChatMessage: { senderID: currentUser.id, chatMessage: chatMessage },
        activeChatHistory: activeChatHistory || [],
      };

      //user input
      socket.emit("sendChat", chatHistory);

      //ai output
      if (chatMessage.startsWith("@t")) {
        const result = await askTacoDog(chatMessage);

        socket.emit("sendChat", {
          ...chatHistory,
          newChatMessage: result,
          activeChatHistory: [...(activeChatHistory as ChatHistory[]), chatHistory.newChatMessage],
        });

        // socket.on(`receiveChat:${chatUsersID}`, (value) => {
        //   setActiveChatHistory([...(activeChatHistory || []), chatHistory.newChatMessage, value]);
        // });
      }

      setChatMessage("");
    }
  };

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });

      console.log("socket connected");
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
      console.log("socket disconnected");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatMessageRef.current && document.activeElement !== chatMessageRef.current) {
      chatMessageRef.current.textContent = "Enter message...";
      setChatMessage("");
    }

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
      chatMessageRef.current.textContent = "Enter message...";
    }
  };

  function toggleAccountSidebar() {
    setAccountSidebar(!isAccountSidebar);
  }

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSearchModalMini, setShowSearchModalMini] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchRef.current && isNewChat) {
      searchRef.current.focus();
      setShowSearchModal(true);
    }
  }, [isNewChat]);

  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const handleSearchModalMini = useCallback(
    (value: string) => {
      setShowSearchModalMini(true);
      setSearchText(value);
      setFilteredUsers(allUsers.filter((user) => user.username.toLowerCase().includes(value)));
    },
    [allUsers]
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoCallRinging, setIsVideoCallRinging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const handleVideoCall = async () => {
    setIsVideoCallRinging(true);
    setShowCamera(true);
    initializeCamera();
    console.log(chatUsersID);
    socket.emit("call", {
      caller: currentUser,
      receiverID: activeChatUser?.id,
    });
  };

  const handleVideoCallEnd = () => {
    setIncomingCall(null);
    setIsVideoCallRinging(false);
    setShowCamera(false);
    socket.emit("rejectCall", activeChatUser?.id);
    if (videoRef.current) {
      // Stop the video stream tracks
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      videoRef.current.srcObject = null;
    }
  };

  const handleVideoCallReject = useCallback((callerID: string) => {
    setIncomingCall(null);
    socket.emit(`rejectCall`, callerID);
  }, []);

  const handleVideoCallAccept = useCallback(
    (callerID: string) => {
      setIncomingCall(null);
      socket.emit(`acceptCall`, { callerID, receiverID: currentUser?.id });
    },
    [currentUser]
  );

  async function getConnectedDevices(type: MediaDeviceKind) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === type);
  }

  // Open camera with specified resolution and device ID
  async function openCamera(deviceId: string, minWidth: number, minHeight: number) {
    const constraints = {
      audio: { echoCancellation: true },
      video: {
        deviceId: { exact: deviceId }, // Ensure the correct camera is used
        width: { min: minWidth },
        height: { min: minHeight },
      },
    };

    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error("Error opening camera:", error);
      throw error; // Rethrow the error for handling by the caller
    }
  }

  async function initializeCamera() {
    try {
      // Get all available video input devices (cameras)
      const cameras = await getConnectedDevices("videoinput");
      if (cameras.length === 0) {
        console.warn("No cameras found.");
        return;
      }

      // Open the first available camera with a resolution of 1280x720
      const stream = await openCamera(cameras[0].deviceId, 1280, 720);

      // Play the stream in a video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } else {
        console.warn("No video element found.");
      }
    } catch (error) {
      console.error("Error initializing camera:", error);
    }
  }

  return (
    <div
      className={`${
        activeChatUser ? "flex" : "hidden"
      } text-slate-300 overflow-hidden h-screen w-screen `}
    >
      <ChatSidebar
        allUsers={allUsers}
        handleSetActiveChat={handleSetActiveChat}
        handleNewChat={handleNewChat}
        handleSearchModalMini={handleSearchModalMini}
      />

      <div
        className=" relative h-full w-full flex flex-col"
        tabIndex={-1}
        onFocus={() => {
          if (
            searchRef.current !== document.activeElement &&
            document.activeElement?.id !== "searchModal"
          ) {
            setShowSearchModal(false);
          }
        }}
      >
        {/* incoming call modal */}
        {incomingCall && (
          <IncomingCallModal
            caller={incomingCall}
            handleVideoCallAccept={handleVideoCallAccept}
            handleVideoCallReject={handleVideoCallReject}
          />
        )}

        {/* search modal */}
        {(showSearchModal || showSearchModalMini) && (
          <div
            id="searchModal"
            className={`shadow-md rounded p-3 gap-2 z-[60] flex flex-col bg-slate-900 scrollbar  h-[30%] overflow-auto absolute ${
              showSearchModalMini ? "w-[17%]  -left-[17%]" : "w-[58%]  left-1/2 -translate-x-1/2"
            } top-[27%] `}
            tabIndex={-1} // Makes the div focusable
          >
            {searchText == "" && "People you might know"}
            {filteredUsers.length > 0 ? (
              (searchText ? filteredUsers : filteredUsers.slice(0, 3)).map((user) => (
                <div
                  onClick={() => {
                    handleSetActiveChat(user.id);
                    setActiveChatHistory(null);
                  }}
                  key={user.id}
                  className={`flex gap-3 hover:bg-slate-950 
                hover:cursor-pointer p-2 rounded w-full items-center`}
                >
                  <Avatar className="h-9 w-9 ">
                    <AvatarImage src={user?.avatar?.img.src || ""} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg font-light">{user.username}</CardTitle>
                </div>
              ))
            ) : (
              <div className="h-full w-full flex justify-center items-center text-slate-500">
                No people found.
              </div>
            )}
          </div>
        )}

        {/* chat banner */}
        <div className="relative border-b w-full h-[8.2rem] flex items-center justify-center text-center text-xs ">
          <Image
            fill
            src={activeChatUser?.banner?.img || defaultBanner}
            className=" object-cover brightness-95"
            alt="user banner"
          />
          <div className="absolute items-start flex flex-col drop-shadow-lg text-white bottom-5 right-10">
            <span>
              Avatars by{" "}
              <a className="underline" target="_blank" href={`https://www.instagram.com/mcfriendy`}>
                Alison Friend
              </a>
            </span>
            <span>
              Photo by{" "}
              <a
                className="underline"
                target="_blank"
                href={`https://unsplash.com/s/users/${
                  activeChatUser?.banner?.source || "Maksim Samuilionak"
                }`}
              >
                {activeChatUser?.banner?.source || "Maksim Samuilionak"}
              </a>{" "}
              on Unsplash
            </span>
          </div>
        </div>

        {activeChatUser ? (
          <div className=" w-[60%] h-full mx-auto flex flex-col relative  ">
            {/* chat header */}
            <div className="  p-5 h-[6.5rem] py-7 z-50 absolute w-full border-b backdrop-blur-md">
              {isNewChat ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleNewChatClose}
                    className=" select-none"
                    variant={"secondary"}
                  >
                    X
                  </Button>
                  <Input
                    ref={searchRef}
                    onFocus={() => setShowSearchModal(true)}
                    placeholder="Search people..."
                    className="select-none p-5"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setFilteredUsers(
                        allUsers.filter((user) =>
                          user.username.toLowerCase().includes(e.target.value)
                        )
                      );
                    }}
                  />
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex gap-5 items-center">
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarImage
                        src={activeChatUser?.avatar?.img.src}
                        className=" cursor-default"
                      />
                      <AvatarFallback>{activeChatUser?.username[0] || ""}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl">{activeChatUser?.username || ""}</CardTitle>
                  </div>
                  <div className="flex gap-4 items-center">
                    {isVideoCallRinging && (
                      <>
                        Ringing <Loader className="animate-spin " />
                      </>
                    )}
                    {activeChatUser.username !== "TacoDog" &&
                      (showCamera ? (
                        <VideoOff
                          onClick={handleVideoCallEnd}
                          size={iconSize}
                          className="cursor-pointer"
                        />
                      ) : (
                        <Video
                          onClick={handleVideoCall}
                          size={iconSize}
                          className="cursor-pointer"
                        />
                      ))}
                    <CircleEllipsis size={iconSize} className="cursor-pointer" />
                    {/* <Account username={user.username} setUser={setUser} /> */}
                  </div>
                </div>
              )}
            </div>
            <div
              ref={messageContainerRef}
              className=" flex pb-0 p-5 gap-5 h-full items-center justify-end scrollbar scroll-smooth flex-col overflow-y-scroll"
            >
              {/* camera */}
              {showCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  controls={false}
                  className="z-[100] h-4/5 mb-5  aspect-video relative "
                />
              ) : (
                <div className="h-[32rem] w-full flex flex-col gap-5  ">
                  {activeChatHistory && currentUser && activeChatUser ? (
                    <>
                      {/* empty div */}
                      <div className="min-h-[5rem] "></div>

                      {/* chat messages */}
                      {activeChatHistory.map((message, index) => {
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
                            <div
                              className={`${isAuthor ? "items-end" : "items-start"} flex flex-col `}
                            >
                              <Label
                                htmlFor={index.toString()}
                                className="px-2 flex justify-start text-xs text-slate-500"
                              >
                                {author.username}
                              </Label>

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
                      })}

                      {/* empty div */}
                      <div className="min-h-3 "></div>
                    </>
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
              )}
            </div>

            <div className="bottom-[6.8rem] h-4 z-50  absolute w-full border-t backdrop-blur-lg brightness-75"></div>
            <div className=" relative bottom-0 overflow-hidden h-[8.2rem] flex gap-2 w-full px-5 justify-center  mx-auto ">
              <span
                ref={chatMessageRef}
                onFocus={() => handleFocus()}
                onBlur={() => handleBlur()}
                onInput={(e) => setChatMessage((e.target as HTMLElement).textContent)}
                contentEditable
                className={`${
                  chatMessage ? "text-white" : "text-slate-500"
                } max-h-28 px-4 h-fit py-2 overflow-y-auto scrollbar  items-center inline-flex rounded border-2   w-full textarea`}
                role="textbox"
                onKeyDown={handleSendMessage}
              ></span>
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
  // <div className=" bg-orange-300 overflow-hidden   flex flex-col"></div>;
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
