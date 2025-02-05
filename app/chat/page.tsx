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
import { askTacoDog, getAllUsers, getUserChats } from "@/lib/api";
import { socket } from "@/lib/socketClient";
import { ChatHistory, User } from "@/lib/types";
import { iconSize, initializeCamera, TacoDog } from "@/lib/utils";
import TacoDogLogo from "@/public/logo.png";
import { Bone, Loader, Video, VideoOff } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface UserChat {
  user: User;
  chats: ChatHistory[] | null;
}
export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<UserChat[] | null>(null);
  const [activeUserChat, setActiveUserChat] = useState<UserChat | null>(null);
  const [chatUsersID, setChatUsersID] = useState<string | null>();
  const [searchText, setSearchText] = useState("");
  // const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
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
  const [callDuration, setCallDuration] = useState<{ start: number; date: Date } | null>(null);
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
            setAllUsers(response); //whole user database
            setFilteredUsers(response); //meaning both the search filters and userChats with other users
            setChatUsersID(`_0_${id}_`);

            // getActiveChatHistory(`_0_${id}_`).then((chatHistory) => {
            //   if (chatHistory) {
            //     setActiveChatHistory(chatHistory);
            //   } else {
            //     fade();
            //   }
            //   setActiveChatUser(response.find((user) => user.id == "0") as User);
            // });

            getUserChats(id)
              .then((userChatsResponse) => {
                if (userChatsResponse) {
                  setUserChats(
                    userChatsResponse.sort(
                      (a, b) =>
                        new Date(b.chats[b.chats.length - 1].date).getTime() -
                        new Date(a.chats[a.chats.length - 1].date).getTime()
                    )
                  );
                  setActiveUserChat(userChatsResponse[0]);
                } else {
                  setUserChats([{ user: TacoDog, chats: null }]);
                  setActiveUserChat({ user: TacoDog, chats: null });
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
    // setActiveChatUser(allUsers?.filter((user) => user?.username === "TacoDog")[0] as User);
    setIsNewChat(false);
    setShowSearchModal(false);
  };

  const handleSetActiveChat = (id: string) => {
    if (currentUser && userChats) {
      const IDs = `_${[id, currentUser.id].sort().join("_")}_`;
      const isNewChat = (userChats.find((userChat) => userChat.user.id === id) as UserChat) || null;

      setChatUsersID(IDs);
      setIsNewChat(false);
      setShowSearchModal(false);
      setActiveUserChat(
        isNewChat
          ? isNewChat
          : { user: allUsers.find((user) => user.id === id) as User, chats: null }
      );
      // setActiveChatUser(allUsers.find((user) => user.id === id) as User);
      // if (userChats)
      //   setActiveChatHistory(userChats.find((chat) => chat.id === id) as ChatHistory[]);
      // getActiveChatHistory(IDs).then((chatHistory) => {
      //   setActiveChatHistory(chatHistory);
      //   setActiveChatUser(allUsers.find((user) => user.id === id) as User);
      // });
    }
  };

  useEffect(() => {
    socket.on(`receiveChat:${chatUsersID}`, async (value) => {
      if (activeUserChat) {
        setActiveUserChat({
          ...activeUserChat,
          chats: [...(activeUserChat.chats || []), value],
        });
      }
      // setActiveChatHistory([...(activeChatHistory || []), value]);
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
      } else if (callerID == currentUser?.id) {
        setIsVideoCallRinging(false);
      }

      setCallDuration({ start: new Date().getTime(), date: new Date() });
    });

    socket.on(`rejectCall:${currentUser?.id}`, () => {
      console.log("call rejected");
      handleVideoCallEnd(false);
    });

    return () => {
      socket.off(`receiveChat:${chatUsersID}`);
      socket.off(`receiveCall:${currentUser?.id}`);
      socket.off(`acceptCall`);
      socket.off(`rejectCall:${currentUser?.id}`);
    };
  });

  useEffect(() => {
    if (videoRef.current) initializeCamera(videoRef.current);
  }, [showCamera]);

  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // if (socket.connected && e.key === "Enter" && activeChatUser && currentUser && chatMessage) {
    if (socket.connected && e.key === "Enter" && currentUser && chatMessage) {
      e.preventDefault();

      if (chatMessageRef.current) chatMessageRef.current.textContent = "";

      const chatHistory = {
        chatUsersID: chatUsersID,
        newChatMessage: { senderID: currentUser.id, chatMessage: chatMessage, date: new Date() },
        activeChatHistory: activeUserChat?.chats || [],
      };

      // if (chatUsers && !chatUsers.find((user) => user.id == activeChatUser.id)) {
      //   chatUsers.push(activeChatUser);
      // }
      if (
        userChats &&
        activeUserChat &&
        !userChats.find((userChat) => userChat.user.id == activeUserChat.user.id)
      ) {
        userChats.splice(0, 0, { user: activeUserChat.user, chats: [chatHistory.newChatMessage] });
      } else if (userChats && activeUserChat) {
        const index = userChats.indexOf(activeUserChat);
        const updated = [...userChats];
        // const updated = [...userChats].splice(index, 1);
        // updated.splice(0, 0, activeUserChat);
        if (index > 0) {
          updated.splice(index, 1);
          updated.splice(0, 0, activeUserChat);
          setUserChats(updated);
        }
      }

      //user input
      socket.emit("sendChat", chatHistory);

      //ai output
      if (chatMessage.startsWith("@t")) {
        const result = await askTacoDog(chatMessage);

        socket.emit("sendChat", {
          ...chatHistory,
          newChatMessage: result,
          activeChatHistory: [
            ...(activeUserChat?.chats as ChatHistory[]),
            chatHistory.newChatMessage,
          ],
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
     if (messageContainerRef.current) {
      const height = messageContainerRef.current.scrollHeight - 630;
      
      //double scrollTo due to sequence the scrollTo:instant in the useEffect below this
      messageContainerRef.current.scrollTo({
        top: height,
        behavior: "instant",
      });

       messageContainerRef.current.scrollTo({
         top: messageContainerRef.current.scrollHeight,
         behavior: "smooth",
       });
     }
  }, [activeUserChat?.chats]);

  useEffect(() => {
    if (activeUserChat?.user) {
      fade();
    }

    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "instant",
      });
    }

    if (document.activeElement != chatMessageRef.current && chatMessageRef.current) {
      setChatMessage("");
      chatMessageRef.current.textContent = "Enter message...";
    }
  }, [activeUserChat?.user, isLoading]);

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

  const handleVideoCall = async () => {
    setIsVideoCallRinging(true);
    setShowCamera(true);

    if (videoRef.current) initializeCamera(videoRef.current);

    console.log(activeUserChat?.user.id);
    socket.emit("call", {
      caller: currentUser,
      receiverID: activeUserChat?.user?.id,
      // receiverID: activeChatUser?.id,
    });
  };

  const handleVideoCallEnd = (emit = true) => {
    setShowCamera(false);
    setIsVideoCallRinging(false);
    setIncomingCall(null);

    if (videoRef.current) {
      // Stop the video stream tracks
      const stream = videoRef.current.srcObject as MediaStream;

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      videoRef.current.srcObject = null;
    }

    if (emit) {
      socket.emit("rejectCall", activeUserChat?.user?.id);
      // socket.emit("rejectCall", activeChatUser?.id);

      if (callDuration) {
        const chatHistory = {
          chatUsersID: chatUsersID,
          newChatMessage: {
            type: "call",
            start: callDuration.start,
            end: new Date().getTime(),
            date: callDuration.date,
          },
          activeChatHistory: activeChatHistory || [],
        };
        socket.emit("sendChat", chatHistory);
      }
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
    <div className={`flex overflow-hidden h-screen w-screen `}>
      {/* {!activeChatUser ? ( */}
      {!activeUserChat ? (
        <div
          ref={helloRef}
          className="duration-500 ease-out flex-col w-full h-full flex items-center text-[3.5rem] lg:text-[5rem] justify-center absolute z-[100]"
        >
          <h2 className="flex-row flex items-end leading-none gap-2">
            Fetching
            <Bone className="bone delay-0" />
            <Bone className=" bone delay-300" />
            <Bone className="bone delay-500" />
          </h2>
        </div>
      ) : (
        <>
          <ChatSidebar
            allUsers={allUsers}
            userChats={userChats?.map((userChat) => userChat.user) as User[]}
            // activeChatUserID={activeChatUser.user?.id as string}
            activeChatUserID={activeUserChat.user?.id as string}
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

            <ChatBanner activeChatUser={activeUserChat?.user as User} />

            <div className="w-full  flex-1 mx-auto flex flex-col relative bg-[#eee] dark:bg-[#141a35]">
              <div
                ref={helloRef}
                className=" bg-white dark:bg-slate-950 duration-500 ease-out flex-col w-full h-full flex items-center text-[5rem] lg:text-[8rem] justify-center absolute z-[10]"
              >
                Helllow
              </div>

              {!isLoading && (
                <>
                  {/* chat header  bg-slate-500 bg-opacity-10 */}
                  <div className=" bg-white shadow  dark:bg-slate-950 px-[25%] min-h-[13.6%] flex items-center justify-between   z-20 absolute w-full   backdrop-blur-md">
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
                      <div className="flex w-full justify-between items-center px-4">
                        <div className="flex gap-5 items-center">
                          <Avatar className="h-10 w-10 cursor-pointer">
                            <Image
                              alt="User Avatar"
                              height={300}
                              width={300}
                              className="aspect-square h-full w-full"
                              src={activeUserChat.user.avatar?.img as StaticImageData}
                            />
                            <AvatarFallback>{activeUserChat.user.username[0]}</AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-3xl">{activeUserChat.user.username}</CardTitle>
                        </div>
                        <div className="flex gap-4 items-center">
                          {isVideoCallRinging && (
                            <>
                              Ringing <Loader className="animate-spin " />
                            </>
                          )}
                          {activeUserChat.user.username !== "TacoDog" &&
                            (showCamera ? (
                              <VideoOff
                                onClick={() => handleVideoCallEnd()}
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
                    className=" flex pb-0 p-5 px-[25%] w-full  mx-auto gap-5 h-full items-center justify-center scrollbar scroll-smooth flex-col overflow-y-scroll"
                  >
                    {/* camera */}
                    {showCamera ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        controls={false}
                        className="z-[100] mt-[8%]  aspect-video  "
                      />
                    ) : (
                      <div className="h-[32rem] w-[85%] flex flex-col gap-5 px-3  ">
                        {activeUserChat.chats && currentUser ? (
                          <ChatMessages
                            activeChatHistory={activeUserChat.chats}
                            currentUser={currentUser}
                            activeChatUser={activeUserChat.user}
                          />
                        ) : (
                          <CardDescription className="h-full text-muted-secondary/40  text-center w-full flex text-base  flex-col justify-center items-center">
                            <Image
                              src={TacoDogLogo.src}
                              alt="tacodog logo"
                              width={300}
                              height={300}
                              className=" w-32 aspect-square grayscale opacity-[.15]"
                            />
                            <span className=" leading-tight">
                              Start your new chat by
                              <br />
                              <span>pinging TacoDog with &quot;@t&quot;</span>
                            </span>
                            <span>Woof!</span>
                          </CardDescription>
                        )}
                      </div>
                    )}
                  </div>

                  {/* chat input */}
                  <div className="bg-white dark:bg-slate-950 px-[25%] bottom-[15.9%] h-[1.3rem] z-[40]  absolute w-full border-t backdrop-blur-lg "></div>
                  <div className="bg-white dark:bg-slate-950 px-[25%] relative bottom-0 overflow-hidden h-[19%] flex gap-2 w-full  justify-center  mx-auto ">
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
