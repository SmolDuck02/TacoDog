"use client";
import { IncomingCallModal } from "@/components/modals/incoming-call-modal";
import SearchModal from "@/components/modals/search-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardDescription, CardTitle } from "@/components/ui/card";
import ChatBanner from "@/components/ui/chat-banner";
import ChatMessages from "@/components/ui/chat-messages";
import ChatSidebar from "@/components/ui/chat-sidebar";
import { Input } from "@/components/ui/input";
import { askTacoDog, getActiveChatHistory, getAllUsers, getUserChats } from "@/lib/api";
import { socket } from "@/lib/socketClient";
import { ChatHistory, User } from "@/lib/types";
import { iconSize, initializeCamera } from "@/lib/utils";
import TacoDogLogo from "@/public/logo.png";
import { Bone, Loader, Video, VideoOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated: () => {
      signIn();
    },
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<User[] | null>(null);
  const [chatUsersID, setChatUsersID] = useState<string | null>();
  const [searchText, setSearchText] = useState("");
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [activeChatHistory, setActiveChatHistory] = useState<ChatHistory[] | null>(null);
  const [chatMessage, setChatMessage] = useState<string | null>();
  const [isNewChat, setIsNewChat] = useState(false);
  const [incomingCall, setIncomingCall] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSearchModalMini, setShowSearchModalMini] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoCallRinging, setIsVideoCallRinging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const helloRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const chatMessageRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (session && session.user && !currentUser) setCurrentUser(session.user as User);
  }, [session, currentUser]);

  useEffect(() => {
    if (currentUser) {
      const id = currentUser.id;

      getAllUsers()
        .then((response) => {
          if (response) {
            setAllUsers(response);
            setFilteredUsers(response);
            setChatUsersID(`_0_${id}_`);

            getActiveChatHistory(`_0_${id}_`).then((chatHistory) => {
              if (chatHistory) {
                setActiveChatHistory(chatHistory);
              } else {
                fade();
              }
              setActiveChatUser(response.find((user) => user.id == "0") as User);
            });

            getUserChats(id)
              .then((userChatsResponse) => {
                if (userChatsResponse) setUserChats(userChatsResponse);
                else {
                  setUserChats([response.find((user) => user.id == "0") as User]);
                }
              })
              .catch((error) => console.log("Error getting user chats: ", error));
          }
        })
        .catch((error) => console.log("error fetching all users: ", error));
    }
  }, [currentUser]);

  const handleNewChat = useCallback(() => {
    setSearchText("");
    setShowSearchModalMini(false);
    setIsNewChat(true);
  }, []);

  const handleNewChatClose = () => {
    setActiveChatUser(allUsers?.filter((user) => user?.username === "TacoDog")[0] as User);
    setIsNewChat(false);
    setShowSearchModal(false);
  };

  const handleSetActiveChat = (id: string) => {
    if (currentUser) {
      const IDs = `_${[id, currentUser.id].sort().join("_")}_`;

      setChatUsersID(IDs);
      setIsNewChat(false);
      setShowSearchModal(false);

      getActiveChatHistory(IDs).then((chatHistory) => {
        setActiveChatHistory(chatHistory);
        setActiveChatUser(allUsers.find((user) => user.id === id) as User);
      });
    }
  };

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
        if (videoRef.current) initializeCamera(videoRef.current);
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
        newChatMessage: { senderID: currentUser.id, chatMessage: chatMessage, time: new Date() },
        activeChatHistory: activeChatHistory || [],
      };

      if (userChats && !userChats.find((user) => user.id == activeChatUser.id)) {
        userChats.push(activeChatUser);
      }

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
      }

      setChatMessage("");
    }
  };

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("socket connected");
    }

    function onDisconnect() {
      console.log("socket disconnected");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const fade = () => {
    setTimeout(() => {
      if (helloRef?.current) {
        helloRef.current.classList.add("opacity-0", "-translate-y-10");
        setIsLoading(false);
        setTimeout(() => {
          if (helloRef.current) helloRef.current.style.display = "none";
        }, 500);
      }
    }, 1000);
  };

  useEffect(() => {
    if (activeChatHistory) {
      fade();
    }

    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "instant",
      });
    }
  }, [activeChatHistory]);

  useEffect(() => {
    if (chatMessageRef.current) {
      setChatMessage("");
      chatMessageRef.current.textContent = "Enter message...";
    }
  }, [isLoading]);

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

  useEffect(() => {
    if (searchRef.current && isNewChat) {
      searchRef.current.focus();
      setShowSearchModal(true);
    }
  }, [isNewChat, searchText]);

  const handleSearchModal = (value: string) => {
    setSearchText(value);
    setFilteredUsers(allUsers.filter((user) => user.username.toLowerCase().includes(value)));
  };

  // const handleSearchModalMini = useCallback(
  //   (value: string | null) => {
  //     if (value) {
  //       setShowSearchModalMini(true);
  //       setSearchText(value);
  //       setFilteredUsers(allUsers.filter((user) => user.username.toLowerCase().includes(value)));
  //     } else {
  //       setShowSearchModalMini(false);
  //     }
  //   },
  //   [allUsers]
  // );

  const handleVideoCall = async () => {
    setIsVideoCallRinging(true);
    setShowCamera(true);

    if (videoRef.current) initializeCamera(videoRef.current);

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

  const handleParentDivFocus = () => {
    if (
      searchRef.current !== document.activeElement &&
      document.activeElement?.id !== "searchModal"
    ) {
      setShowSearchModal(false);
      setShowSearchModalMini(false);
    }
  };

  return (
    <div className={`flex  overflow-hidden h-screen w-screen `}>
      {!activeChatUser ? (
        <div
          ref={helloRef}
          className="duration-500 ease-out flex-col w-full h-full flex items-center text-[3.5rem] lg:text-[8rem] justify-center absolute z-[100]"
        >
          <h2 className="flex-row flex items-end leading-none gap-2">
            Fetching <Bone className="bone delay-0" />
            <Bone className=" bone delay-300" />
            <Bone className="bone delay-500" />
          </h2>
        </div>
      ) : (
        <>
          <ChatSidebar
            allUsers={allUsers}
            userChats={userChats as User[]}
            activeChatUserID={activeChatUser?.id as string}
            handleSetActiveChat={handleSetActiveChat}
            handleNewChat={handleNewChat}
            handleNewChatClose={handleNewChatClose}
          />

          <div
            className="relative h-full w-full flex flex-col"
            tabIndex={-1}
            onFocus={handleParentDivFocus}
          >
            {incomingCall && (
              <IncomingCallModal
                caller={incomingCall}
                handleVideoCallAccept={handleVideoCallAccept}
                handleVideoCallReject={handleVideoCallReject}
              />
            )}

            {(showSearchModal || showSearchModalMini) && (
              <SearchModal
                searchText={searchText}
                filteredUsers={filteredUsers}
                handleSetActiveChat={handleSetActiveChat}
              />
            )}

            <ChatBanner activeChatUser={activeChatUser as User} />

            <div className="w-full  flex-1  mx-auto flex flex-col relative bg-[#eee] dark:bg-[#07101f]">
              <div
                ref={helloRef}
                className=" duration-500 ease-out flex-col w-full h-full flex items-center text-[5rem] lg:text-[8rem] justify-center absolute z-[100]"
              >
                Helllow
              </div>

              {!isLoading && (
                <>
                  {/* chat header */}
                  <div className=" bg-white shadow  dark:bg-slate-950 px-[20%] min-h-[13.8%] flex items-center justify-between   z-20 absolute w-full border-b backdrop-blur-md">
                    {isNewChat ? (
                      <div className="w-full flex gap-3">
                        <Button
                          onClick={handleNewChatClose}
                          className=" select-none"
                          variant={"secondary"}
                        >
                          X
                        </Button>
                        <Input
                          ref={searchRef}
                          placeholder="Search people..."
                          className=" select-none p-5"
                          onFocus={() => setShowSearchModal(true)}
                          onChange={(e) => handleSearchModal(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="flex w-full justify-between items-center">
                        <div className="flex gap-5 items-center">
                          <Avatar className="h-10 w-10 cursor-pointer">
                            <Image
                              alt="User Avatar"
                              height={300}
                              width={300}
                              className="aspect-square h-full w-full"
                              src={activeChatUser.avatar?.img as StaticImageData}
                            />
                            <AvatarFallback>{activeChatUser.username[0]}</AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-3xl">{activeChatUser.username}</CardTitle>
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
                          {/* <CircleEllipsis size={iconSize} className="cursor-pointer" /> */}
                          {/* <Account username={user.username} setUser={setUser} /> */}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* chat body */}
                  <div
                    ref={messageContainerRef}
                    className=" flex pb-0 p-5 px-[20%] gap-5 h-full items-center justify-end scrollbar scroll-smooth flex-col overflow-y-scroll"
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
                        {activeChatHistory && currentUser ? (
                          <ChatMessages
                            activeChatHistory={activeChatHistory}
                            currentUser={currentUser}
                            activeChatUser={activeChatUser}
                          />
                        ) : (
                          <CardDescription className="h-full text-[#3b4f72] text-center w-full flex text-lg gap-2 flex-col justify-center items-center">
                            <Image
                              src={TacoDogLogo.src}
                              alt="tacodog logo"
                              width={300}
                              height={300}
                              className=" h-40 w-40 grayscale opacity-20"
                            />
                            <span className="text-xl leading-none">
                              Start your new chat by
                              <br />
                              <span className="text-lg">pinging TacoDog with &quot;@t&quot;</span>
                            </span>
                            <span className="text-sm  ">Woof!</span>
                          </CardDescription>
                        )}
                      </div>
                    )}
                  </div>

                  {/* chat input */}
                  <div className="bg-white dark:bg-slate-950 px-[20%] bottom-[15.9%] h-[1.3rem] z-50  absolute w-full border-t backdrop-blur-lg "></div>
                  <div className="bg-white dark:bg-slate-950 px-[20%] relative bottom-0 overflow-hidden h-[19%] flex gap-2 w-full  justify-center  mx-auto ">
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
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
