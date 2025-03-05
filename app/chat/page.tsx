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
import { useUsers } from "@/lib/context/UserContext";
import { socket } from "@/lib/socketClient";
import { ChatHistory, User, UserChat } from "@/lib/types";
import { iconLarge, initializeCamera, TacoDog } from "@/lib/utils";
import TacoDogLogo from "@/public/logo.png";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Bone, Loader, Video, VideoOff } from "lucide-react";
import { useSession } from "next-auth/react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Chat() {
  const router = useRouter();
  const { user } = (useSession().data ?? { user: null }) as { user: User | null };
  const { users }  = useUsers();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<UserChat[] | null>(null);
  const [activeUserChat, setActiveUserChat] = useState<UserChat | null>(null);
  const [chatUsersID, setChatUsersID] = useState<string | null>();
  const [callerID, setCallerID] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeChatHistory, setActiveChatHistory] = useState<ChatHistory[] | null>(null);
  const [chatMessage, setChatMessage] = useState<string | null>();
  const [isNewChat, setIsNewChat] = useState(false);
  const [incomingCall, setIncomingCall] = useState<User | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSearchModalMini, setShowSearchModalMini] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoCallRinging, setIsVideoCallRinging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [callDuration, setCallDuration] = useState<{ start: number; date: Date } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const helloRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const chatMessageRef = useRef<HTMLSpanElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(users){
      setAllUsers(users)
      setFilteredUsers(users)
    }

    if (user) {
      const id = user.id;
      console.log("fetching", user);

      setCurrentUser(user as User);

      getUserChats(id)
        .then((userChatsResponse) => {
          if (userChatsResponse) {
            setUserChats(
              userChatsResponse.sort(
                (a, b) =>
                  new Date(b.chats![b.chats!.length - 1].date).getTime() -
                  new Date(a.chats![a.chats!.length - 1].date).getTime()
              )
            );
            setActiveUserChat(userChatsResponse[0]);
          } else {
            setUserChats([{ user: TacoDog, chats: null }]);
            setActiveUserChat({ user: TacoDog, chats: null });
          }
          setChatUsersID(`_${[(userChatsResponse?.[0].user || TacoDog).id, id].sort().join("_")}_`);
        })
        .catch((error) => console.log("Error getting user chats: ", error))
        .finally(() => console.log("done fetching user chats"));
      console.log("User:", user.username);
    }
  }, [user, users]);

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
      const isNewChat =
        (userChats.find((userChat) => userChat.user?.id === id) as UserChat) || null;
      console.log("bbb", IDs, isNewChat);
      setChatUsersID(IDs);
      setIsNewChat(false);
      setShowSearchModal(false);
      setActiveUserChat(
        isNewChat
          ? isNewChat
          : { user: allUsers.find((user) => user?.id === id) as User, chats: null }
      );

      if (!isNewChat) return;

      let seenChat = isNewChat.chats?.at(-1) as ChatHistory;

      if (seenChat?.isSeen) return;


      //fuck this took a long time
      //and even longer because this is wrong
      seenChat = { ...seenChat, isSeen: true };
      const chatTop = userChats?.[0] as UserChat;
      chatTop.chats?.splice((isNewChat.chats?.length || 1) - 1, 1, seenChat);
  

      socket.emit("seenChat", {
        senderID: seenChat.senderID,
        index: isNewChat?.chats?.indexOf(seenChat),
      });
      // setActiveChatUser(allUsers.find((user) => user.id === id) as User);
      // if (userChats)
      //   setActiveChatHistory(userChats.find((chat) => chat.id === id) as ChatHistory[]);
      // getActiveChatHistory(IDs).then((chatHistory) => {
      //   setActiveChatHistory(chatHistory);
      //   setActiveChatUser(allUsers.find((user) => user.id === id) as User);
      // });
    }
  };

  // TODO fix video call time
  // TODO implement delivered
  // TODO implement deliver and emoji, and image sharing
  // TODO clean code
  useEffect(() => {
    //also the method for handling seenMessages
    socket.on(`receiveChat:${currentUser?.id}`, async (newChat) => {
      console.log("receiver", newChat);

      if (newChat.senderID !== activeUserChat?.user.id) {
        const inUserChats =
          userChats?.find((userChat) => userChat?.user?.id === newChat.senderID) || null;

        if (!inUserChats) {
          const updatedUserChats = [...(userChats as UserChat[])];
          const currentUserChat = {
            user:
              newChat.senderID === currentUser?.id
                ? activeUserChat?.user
                : allUsers.find((user) => user?.id === newChat.senderID),
            chats: [newChat],
          } as UserChat;
          updatedUserChats?.unshift(currentUserChat);
          console.log("gano", updatedUserChats);
          setUserChats(updatedUserChats);
          return;
        }

        const chats = [...(userChats as UserChat[])];
        const index = userChats?.indexOf(inUserChats) || 0;

        if (index > 0) {
          chats.splice(index, 1); //delete from its current position
          chats.unshift(inUserChats); //add to top of list
        }
        // const updatedUserChats = [...userChats]

        // setActiveUserChat(updated);
        return;
      }
      if (activeUserChat) {
        setActiveUserChat({
          ...activeUserChat,
          chats: [...(activeUserChat.chats || []), newChat],
        });
        updateUserChats([...(activeUserChat?.chats || []), newChat] as ChatHistory[]);
      }

      // setActiveChatHistory([...(activeChatHistory || []), value]);
    });

    socket.on(`receiveCall:${currentUser?.id}`, (caller) => {
      console.log("Incoming caller", caller);
      setIncomingCall(caller);
      setCallerID(caller.id);
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

    socket.on(`typing:${currentUser?.id}`, ({ senderID, state = true }) => {
      console.log(senderID, state);
      if (activeUserChat?.user?.id === senderID) setIsTyping(state);
    });

    socket.on(`seenChat:${currentUser?.id}`, (index) => {
      const update = activeUserChat;
      if (!update || !update.chats) return;
      update.chats[index] = { ...update.chats[index], isSeen: true };

      if (userChats) {
        const updatedChats = [...userChats]; // Copy the array
        const index = userChats.indexOf(update);

        if (index !== -1) {
          updatedChats.splice(index, 1, update); // Replace the element at index
          // setUserChats(updatedChats); // Update state with the modified array
        }
      }
    });

    return () => {
      socket.off(`receiveChat:${currentUser?.id}`);
      socket.off(`receiveCall:${currentUser?.id}`);
      socket.off(`acceptCall`);
      socket.off(`rejectCall:${currentUser?.id}`);
      socket.off(`typing:${currentUser?.id}`);
    };
  });

  const updateUserChats = useCallback(
    (activeUserChatHistory: ChatHistory[], newChat?: ChatHistory) => {

      if (!userChats || !activeUserChat) return;

      if (!newChat) {
        const update = [...userChats];
        update[0].chats = activeUserChatHistory;
        setUserChats(update);
        return;
      }
      //move activeUserChat to top of list with updated messages
      if (userChats.find((userChat) => userChat.user?.id === activeUserChat.user.id)) {
        const updated = [...userChats];
        const index = updated.findIndex((userChat) => userChat.user?.id === activeUserChat.user.id);

        if (index > 0) {
          updated.splice(index, 1); //delete from its current position
          updated.unshift(activeUserChat); //add to top of list
        }

        console.log("lll", index, updated, userChats, activeUserChat);

        updated[0].chats = updated[0].chats ? [...updated[0].chats, newChat] : [newChat];
        console.log("grgr", updated);
        setUserChats(updated);
      } else {
        console.log("meow");
        userChats.splice(0, 0, { user: activeUserChat.user, chats: [newChat] });
      }
    },
    [activeUserChat, userChats]
  );

  const handleSeenMessage = (id: number) => {
    // console.log("lop", activeUserChat?.chats);
    let seenChat = activeUserChat?.chats?.[id] as ChatHistory;
    console.log("see", seenChat, id, activeUserChat);
    if (!seenChat || seenChat.isSeen) return;

    //fuck this took a long time
    seenChat = { ...seenChat, isSeen: true };
    const chatTop = userChats?.[0] as UserChat;
    chatTop.chats?.splice(id, 1, seenChat);
    console.log(seenChat, chatTop, userChats);

    socket.emit("seenChat", {
      senderID: seenChat.senderID,
      index: chatTop.chats?.indexOf(seenChat),
    });
    // setUserChats(up)
    // if (activeUserChat)
    //   setActiveUserChat({
    //     ...activeUserChat,
    //     chats: chats.splice(
    //       id,
    //       1,
    //       seenChat
    //     ) as ChatHistory[],
    //   });

    // const update = userChats?.find((userChat) => userChat.user === activeUserChat?.user);
    // if (update && update.chats) update.chats[id] = { ...update?.chats?.[id], isSeen: true };

    // console.log("uoaef,", update);
    // setUserChats(update);

    // console.log("pol", activeUserChat?.chats);
    // socket.emit("seenMessage", { value });
  };

  useEffect(() => {
    if (videoRef.current) initializeCamera(videoRef.current);
  }, [showCamera]);

  const handleSendMessage = async (
    e: React.KeyboardEvent<HTMLSpanElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    if ("key" in e && e.key !== "Enter") return; // Ensure it's an Enter key event

    e.preventDefault(); // Prevents form submission (for input)

    // if (socket.connected && e.key === "Enter" && activeChatUser && currentUser && chatMessage) {
    if (socket.connected && currentUser && (chatMessage || (fileUploads as File[])?.length > 0)) {
      if (chatMessageRef.current)
        chatMessageRef.current.textContent =
          document.activeElement !== chatMessageRef.current ? "Enter message..." : "";
      console.log("sender", chatUsersID);
      const chatHistory = {
        receiverID: activeUserChat?.user.id,
        newChatMessage: {
          senderID: currentUser.id,
          chatMessage: chatMessage,
          uploads: fileUploads,
          date: new Date(),
        } as ChatHistory,
        activeChatHistory: activeUserChat?.chats || [],
      };

      // if (chatUsers && !chatUsers.find((user) => user.id == activeChatUser.id)) {
      //   chatUsers.push(activeChatUser);
      // }
      //for ui update of recent chats

      if (activeUserChat) {
        setActiveUserChat({
          ...activeUserChat,
          chats: [...(activeUserChat.chats || []), chatHistory.newChatMessage],
        });
      }
      updateUserChats(activeUserChat?.chats as ChatHistory[], chatHistory.newChatMessage);

      //user input
      socket.emit("sendChat", chatHistory);

      setFileUploads(null);
      if (!chatMessage) return;
      //ai output
      if (chatMessage.startsWith("@t")) {
        const result = await askTacoDog(chatMessage);

        socket.emit("typing", { senderID: currentUser?.id, receiverID: TacoDog.id });

        socket.emit("sendChat", {
          ...chatHistory,
          newChatMessage: { ...result, date: new Date() },
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
      // messageContainerRef.current.scrollTo({
      //   top: height,
      //   behavior: "instant",
      // });

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

    setIsTyping(false); //typing is false by default when switching convos

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

    if (activeUserChat)
      socket.emit("typing", { senderID: currentUser?.id, receiverID: activeUserChat.user.id });
  };

  const handleBlur = () => {
    if (chatMessageRef.current && !chatMessage) {
      chatMessageRef.current.textContent = "Enter message...";
    }

    if (activeUserChat)
      socket.emit("typing", {
        senderID: currentUser?.id,
        receiverID: activeUserChat.user.id,
        state: false,
      });
  };

  useEffect(() => {
    if (searchRef.current && isNewChat) {
      searchRef.current.focus();
      setShowSearchModal(true);
    }
  }, [isNewChat, searchText]);

  const handleSearchModal = (value: string) => {
    setSearchText(value);
    setFilteredUsers(
      allUsers.filter((user) => user?.username?.toLowerCase().includes(value.toLowerCase()))
    );
  };

  const handleVideoCall = async () => {
    setIsVideoCallRinging(true);
    setShowCamera(true);
    setCallerID(currentUser?.id as string);

    if (videoRef.current) initializeCamera(videoRef.current);

    console.log(activeUserChat?.user?.id);
    socket.emit("call", {
      receiverID: activeUserChat?.user?.id,
      caller: currentUser,
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

      // if (callDuration && activeUserChat) {
      const chatHistory = {
        receiverID: callerID === currentUser?.id ? activeUserChat?.user?.id : currentUser?.id,
        newChatMessage: {
          type: "call",
          senderID: callerID as string,
          start: callDuration?.start || 0,
          end: new Date().getTime(),
          date: callDuration?.date || new Date(),
        },
        activeChatHistory: activeChatHistory || [],
      };

      console.log("llololol", chatHistory, activeUserChat);
      if (activeUserChat) {
        setActiveUserChat({
          ...activeUserChat,
          chats: [...(activeUserChat.chats || []), chatHistory.newChatMessage],
        });
      }

      updateUserChats(activeUserChat?.chats as ChatHistory[], chatHistory.newChatMessage);

      socket.emit("sendChat", chatHistory);
      setCallerID(null);
    }
    // }
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

  const handleEmojiClick = (emojiObject: any) => {
    setChatMessage((prev) => prev + emojiObject.emoji);
  };

  useEffect(() => {
    console.log(chatMessage);
    if (chatMessageRef.current && chatMessage)
      chatMessageRef.current.textContent = chatMessage || "";
  }, [chatMessage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);

        // Move caret to the end of the chat input
        if (chatMessageRef?.current) {
          console.log("Attempting focus on:", chatMessageRef.current);

          // Ensure span is focusable first
          chatMessageRef.current.focus();

          // Ensure selection moves to the end of the content
          setTimeout(() => {
            if (!chatMessageRef.current) return;
            const range = document.createRange();
            const selection = window.getSelection();

            range.selectNodeContents(chatMessageRef.current);
            range.collapse(false); // 👈 Moves cursor to end

            selection?.removeAllRanges();
            selection?.addRange(range);
          }, 0);
        }
      }
    }

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker]);

  const [fileUploads, setFileUploads] = useState<File[] | null>(null);
  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLSpanElement>
  ) => {
    let files: FileList | null = null;

    if ("files" in event.target && event.target.files) {
      // If it's an input file change event
      files = event.target.files;
    } else if ("dataTransfer" in event && event.dataTransfer.files.length) {
      // If it's a drag-and-drop event
      files = event.dataTransfer.files;
    }

    if (!files || files.length === 0) return;

    setFileUploads((prev) => {
      const existingFiles = new Set(prev?.map((file) => file.name + file.size)); // Unique identifier
      const newFiles = Array.from(files).filter(
        (file) => !existingFiles.has(file.name + file.size)
      );

      return [...(prev || []), ...newFiles]; // Add only unique files
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => {
      fileUploads &&
        Array.from(fileUploads).forEach((file) => URL.revokeObjectURL(URL.createObjectURL(file)));
    };
  }, [fileUploads]);

  return (
    <div className={`flex overflow-hidden h-screen w-screen `}>
      {/* {!activeChatUser ? ( */}
      {!activeUserChat ? (
        <div
          ref={helloRef}
          className="duration-500 ease-out flex-col w-full h-full flex items-center text-[2rem] lg:text-[5rem] justify-center absolute z-[100]"
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
            currentUserID={currentUser?.id as string}
            allUsers={allUsers}
            userChats={userChats as UserChat[]}
            // activeChatUserID={activeChatUser.user?.id as string}
            activeChatUser={activeUserChat.user as User}
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

            <div className="w-full  flex-1 mx-auto flex flex-col relative bg-[#eee] dark:bg-gray-900">
              <div
                ref={helloRef}
                className=" bg-[#ebe8e4] dark:bg-slate-950 duration-500 ease-out flex-col w-full h-full flex items-center text-[5rem] lg:text-[8rem] justify-center absolute z-[10]"
              >
                Helllow
              </div>

              {!isLoading && (
                <>
                  {/* chat header  bg-slate-500 bg-opacity-10 */}
                  <div className=" bg-[#ebe8e4] shadow border-b  dark:bg-slate-950 px-[15%] lg:px-[25%] min-h-[5rem] flex items-center justify-between   z-20 absolute w-full   backdrop-blur-md">
                    {isNewChat ? (
                      <div className="w-full flex gap-3">
                        <Button
                          onClick={handleNewChatClose}
                          className=" select-none text-muted-foreground"
                          variant={"secondary"}
                        >
                          X
                        </Button>
                        <Input
                          ref={searchRef}
                          placeholder="Search people..."
                          className=" select-none p-5 bg-gray-500/10 placeholder:text-muted-foreground/50"
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
                              src={activeUserChat.user?.avatar?.img as StaticImageData}
                            />
                            <AvatarFallback>{activeUserChat.user?.username[0]}</AvatarFallback>
                          </Avatar>
                          <CardTitle className="text-3xl">
                            {activeUserChat.user?.username}
                          </CardTitle>
                        </div>
                        <div className="flex gap-4 items-center">
                          {isVideoCallRinging && (
                            <>
                              <Loader className="animate-spin " />
                            </>
                          )}
                          {![TacoDog.id, currentUser?.id].includes(activeUserChat.user?.id) &&
                            (showCamera ? (
                              <VideoOff
                                onClick={() => handleVideoCallEnd()}
                                size={iconLarge}
                                className="cursor-pointer"
                              />
                            ) : (
                              <Video
                                onClick={handleVideoCall}
                                size={iconLarge}
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
                    className={` ${
                      showCamera ? "justify-center" : "justify-end"
                    } flex px-[15%] lg:px-[25%]  w-full  mx-auto gap-5 h-full items-center justify-center scrollbar scroll-smooth flex-col overflow-y-scroll`}
                  >
                    <div className="h-[4rem]" />
                    {/* camera */}
                    {showCamera ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        controls={false}
                        className="z-[48]  aspect-video  "
                      />
                    ) : (
                      <div className=" h-[calc(100vh-14rem)] lg:h-[calc(100vh-19rem)]  relative w-full lg:w-[85%] flex flex-col gap-2 px-3  ">
                        {activeUserChat.chats && currentUser ? (
                          <ChatMessages
                            activeChatHistory={activeUserChat.chats}
                            activeChatUser={activeUserChat.user}
                            currentUser={currentUser}
                            handleSeenMessage={handleSeenMessage}
                          />
                        ) : (
                          <CardDescription className="select-none h-full text-muted-secondary/80 font-light  text-center w-full flex text-xs lg:text-base  flex-col justify-center items-center">
                            <Image
                              src={TacoDogLogo.src}
                              alt="tacodog logo"
                              width={300}
                              height={300}
                              className=" w-24 lg:w-32 aspect-square grayscale opacity-[.3]"
                            />
                            <span className="leading-tight">
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
                  {isTyping && document.activeElement != chatMessageRef.current && (
                    <div className="duration-500 ease-in-out text-xs text-muted-secondary/40 absolute bottom-[19%] w-fit flex gap-0 left-1/2 -translate-x-1/2 z-100">
                      {activeUserChat.user.username} is typing
                      <h2 className="text-lg leading-none animate-typing delay-0 ">.</h2>
                      <h2 className="text-lg leading-none animate-typing  delay-300">.</h2>
                      <h2 className="text-lg leading-none animate-typing  delay-500">.</h2>
                    </div>
                  )}

                  <div
                    ref={pickerRef}
                    className="absolute right-[7rem] lg:right-[25rem] bottom-[4rem] z-10"
                  >
                    <EmojiPicker
                      open={showPicker}
                      height={300}
                      width={300}
                      style={{ backgroundColor: "black" }}
                      // className="bg-white"
                      theme={Theme.AUTO}
                      onEmojiClick={handleEmojiClick}
                      previewConfig={{
                        showPreview: false,
                      }}
                    />
                  </div>

                  {/* chat input */}
                  {/* <div className="bg-white dark:bg-slate-950 px-[25%] bottom-[15.9%] h-[1.3rem] z-[40]  absolute w-full border-t backdrop-blur-lg "></div> */}
                  {/* <div className="bg-white dark:bg-slate-950 px-[25%] relative bottom-0 overflow-hidden h-[19%] flex gap-2 w-full  justify-center  mx-auto "> */}
                  <div
                    className={`${
                      (fileUploads as File[])?.length > 0 ? "min-h-[10rem]" : "min-h-[5rem]"
                    }`}
                  ></div>
                  <div
                    className={`${
                      (fileUploads as File[])?.length > 0 ? "min-h-[10rem]" : "min-h-[5rem]"
                    } 
                   border-t bg-[#ebe8e4] dark:bg-slate-950 px-[15%] lg:px-[27%] absolute bottom-0 flex flex-col gap-2 w-full items-start  justify-center  mx-auto 
                  `}
                  >
                    {(fileUploads as File[])?.length > 0 && (
                      <ImageUpload
                        fileUploads={fileUploads as File[]}
                        setFileUploads={setFileUploads}
                      />
                    )}
                    <div className={`gap-2 flex w-full items-center h-fit relative `}>
                      <span
                        tabIndex={0}
                        ref={chatMessageRef}
                        onFocus={() => handleFocus()}
                        onBlur={() => handleBlur()}
                        onInput={(e) => setChatMessage((e.target as HTMLElement).textContent)}
                        onDrop={(e) => handleFileChange(e)}
                        contentEditable
                        className={`${
                          chatMessage ? "" : "text-muted-secondary/80"
                        } max-h-12 flex-wrap break-all focus:outline-none focus:ring-0 focus:border-muted-foreground dark:bg-gray-500/10 bg-[white] px-4 h-fit py-2 overflow-y-auto scrollbar items-center inline-flex rounded-lg border  w-full textarea`}
                        role="textbox"
                        onKeyDown={handleSendMessage}
                      />
                      {/* <Image
                      width={300}
                      height={300}
                      className="size-5 z-[10] absolute left-[60%]"
                      src={EmojiIcon}
                      alt="Emoji Icon"
                      /> */}
                      <button
                        id="emoji-icon"
                        className="cursor-pointer"
                        onClick={() => setShowPicker(true)}
                      >
                        <EmojiIcon className="size-7 text-muted-secondary/80" />
                      </button>

                      <div className="h-fit flex self-center">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept={".png,.jpg,.jpeg"}
                          multiple
                          ref={fileInputRef}
                        />
                        <button
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }}
                        >
                          <AttachmentIcon className="size-7 text-muted-secondary/80" />
                        </button>
                      </div>
                      <button className="cursor-pointer" onClick={handleSendMessage}>
                        <SubmitIcon className="size-7 text-muted-secondary/80" />
                      </button>
                    </div>
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

export function ImageUpload({
  fileUploads,
  setFileUploads,
}: {
  fileUploads: File[];
  setFileUploads?: (value: File[]) => void;
}) {
  const [isImageHoverMap, setIsImageHoverMap] = useState<Record<number, boolean>>({});

  return (
    <div className={`  flex gap-1    `}>
      {fileUploads.map((file, index) => {
        return (
          <div
            key={index}
            className="relative flex items-center justify-center"
            onMouseEnter={() =>
              setFileUploads && setIsImageHoverMap((prev) => ({ ...prev, [index]: true }))
            }
            onMouseLeave={() =>
              setFileUploads && setIsImageHoverMap((prev) => ({ ...prev, [index]: false }))
            }
          >
            <Image
              width={300}
              height={300}
              src={URL.createObjectURL(file)}
              alt={`uploaded image ${index}`}
              className={` ${isImageHoverMap[index] === true ? "opacity-50" : "opacity-100"} ${
                setFileUploads && "border bg-white/10"
              }
                                h-20 w-20 aspect-square rounded object-cover 
                                `}
            />
            {isImageHoverMap[index] && setFileUploads && (
              <button
                className="cursor-pointer absolute"
                onClick={() => setFileUploads(fileUploads.filter((_, i) => i !== index))}
              >
                <CloseIcon className="size-7 text-black/80 dark:text-white/80" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

const CloseIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    className={className}
    height="48"
    viewBox="0 0 48 48"
  >
    <defs>
      <mask id="ipSCloseOne0">
        <g fill="none" strokeLinejoin="round" strokeWidth="4">
          <path
            fill="#fff"
            stroke="#fff"
            d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"
          />
          <path
            stroke="#000"
            strokeLinecap="round"
            d="M29.657 18.343L18.343 29.657m0-11.314l11.314 11.314"
          />
        </g>
      </mask>
    </defs>
    <path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSCloseOne0)" />
  </svg>
);

const EmojiIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <g fill="currentColor" fillRule="evenodd">
      <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path
        fill="#currentColor"
        d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m2.8 11.857A3.98 3.98 0 0 1 12 15a3.98 3.98 0 0 1-2.8-1.143a1 1 0 1 0-1.4 1.428A5.98 5.98 0 0 0 12 17a5.98 5.98 0 0 0 4.2-1.715a1 1 0 0 0-1.4-1.428M8.5 8a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m7 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3"
      />
    </g>
  </svg>
);

const SubmitIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width="15"
    height="16"
    viewBox="0 0 15 16"
  >
    <path
      fill="currentColor"
      d="M12.49 7.14L3.44 2.27c-.76-.41-1.64.3-1.4 1.13l1.24 4.34q.075.27 0 .54l-1.24 4.34c-.24.83.64 1.54 1.4 1.13l9.05-4.87a.98.98 0 0 0 0-1.72Z"
    />
  </svg>
);

const AttachmentIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    className={className}
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13.324 8.436L9.495 12.19c-.364.36-.564.852-.556 1.369a2 2 0 0 0 .6 1.387c.375.371.88.584 1.403.593a1.92 1.92 0 0 0 1.386-.55l3.828-3.754a3.75 3.75 0 0 0 1.112-2.738a4 4 0 0 0-1.198-2.775a4.1 4.1 0 0 0-2.808-1.185a3.85 3.85 0 0 0-2.77 1.098L6.661 9.39a5.63 5.63 0 0 0-1.667 4.107a6 6 0 0 0 1.798 4.161a6.15 6.15 0 0 0 4.21 1.778a5.77 5.77 0 0 0 4.157-1.646l3.829-3.756"
    />
  </svg>
);
