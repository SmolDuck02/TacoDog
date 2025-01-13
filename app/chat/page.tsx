"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardTitle } from "@/components/ui/card";
import ChatSidebar from "@/components/ui/chat-sidebar";
import MessagesCard from "@/components/ui/messages-card";
import { Textarea } from "@/components/ui/textarea";
import { getAllUsers } from "@/lib/api";
import { Chat, User } from "@/lib/types";
import axios from "axios";
import { CircleEllipsis } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
const iconSize = 28;
export default function Home() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });

  const domain = "http://127.0.0.1:8000";
  // const domain = "https://web-production-019a.up.railway.app";
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState({ id: "0", username: "" });
  const [tacodog, setTacodog] = useState<User>({ id: "0", username: "" });
  const [searchText, setSearchText] = useState("");
  const [isSearch, setIsSearch] = useState(false);
  const [isAccountSidebar, setAccountSidebar] = useState(false);

  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  // const [activeChat, setActiveChat] = useState<PrivateChat>({
  //   user1: { id: "0", username: "" },
  //   user2: { id: "0", username: "TacoDog" },
  //   chats: [],
  // });
  const [activeChat, setActiveChat] = useState<User | null>();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Chat[]>([]);
  const [isSaveMessage, setIsSaveMessage] = useState(false);

  // REPLACED WITH REQUIRE TRUE AND ONUNAUTHENTICATED
  // useEffect(() => {
  //   if (!session && status !== "loading") {
  //     signIn();
  //   } else if (session) {
  //     setCurrentUser(session.user as User);
  //   }
  // }, [session, status]);

  // UNCOMMENT AFTER TESTING
  // useEffect(() => {
  //   getUsers();
  //   getPrivateChats();
  // }, []);

  useEffect(() => {
    getAllUsers().then((users) => setUsers(users as User[]));
  }, []);

  const chatSocketRef = useRef<null | WebSocket>(null);

  useEffect(() => {
    const chatSocket = new WebSocket("ws://127.0.0.1:8000/ws/chat/");
    chatSocketRef.current = chatSocket;

    chatSocket.onopen = function () {
      console.log("Chat socket opened");
    };

    chatSocket.onclose = function (event) {
      console.log("Chat socket closed", event);
    };

    chatSocket.onerror = function (error) {
      console.error("Chat socket error", error);
    };

    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      const message = data;
      console.log("Received message:", message);
      // Handle incoming message
    };

    // Cleanup on component unmount
    return () => {
      chatSocket.close();
    };
  }, []);
  // chatSocket.onmessage = function (e) {
  //   const data = JSON.parse(e.data);
  //   const message = data["message"];
  //   handleMessage(message); // Handle the received message
  // };

  // chatSocket.onclose = function (e) {
  //   console.error("Chat socket closed unexpectedly");
  // };

  // // Function to handle incoming messages
  // function handleMessage(message: string) {
  //   console.log("Received message:", message);
  //   // Add your logic to handle the message here
  // }

  // // Send message to server
  function sendMessage(message = "hello") {
    if (chatSocketRef.current?.readyState == WebSocket.OPEN)
      chatSocketRef.current.send(JSON.stringify({ user: currentUser, message: message }));
  }

  async function addPrivateChat(chatId: number) {
    const response = await axios.post(`${domain}/addPrivateChat/`, {
      // UNCOMENT  AFTWEER TESTING
      // userIds: [currentUser.id, activeChat.user2.id],
      chatIds: [chatId],
    });
    if (response.data.error) {
      console.log("Failed to save private chat: ", response.data.error);
    } else {
      console.log("Save private chat success", response);
    }
  }

  async function saveMessage() {
    sendMessage();
    const response = await axios.post(`${domain}/addChat/`, {
      chat: messages[messages.length - 1]?.chat,
      userId: messages[messages.length - 1]?.user.id,
    });

    if (response.data.error) {
      console.log("Failed to save message: ", response.data.error);
    } else {
      console.log("Save message success", response);
    }
    //after save messagee create private chat
    addPrivateChat(response.data.chatId);
  }

  const onSendMessage = () => {
    setIsSaveMessage(true);
    setMessages([...messages, { chat: inputText, user: currentUser }]);
  };

  useEffect(() => {
    if (inputText.startsWith("!")) askAI();
    else if (inputText.startsWith("/")) askImage();
    if (isSaveMessage) {
      // save all messages
      saveMessage();
      setIsSaveMessage(false);
    }

    if (messages[messages.length - 1]?.user.username != "TacoDog") setInputText("");
  }, [isSaveMessage]);

  async function askAI() {
    const response = await axios.post(`${domain}/ask/`, {
      inputText: inputText.slice(1),
    });

    if (!response) {
      throw new Error("Failed to fetch data");
    }
    setMessages([...messages, { chat: response.data.response, user: tacodog }]);
    setIsSaveMessage(true);
    console.log("ask ai", response.data);
  }

  async function askImage() {
    const response = await axios.post(`${domain}/askImage/`, {
      imagePrompt: inputText.slice(1),
    });

    if (!response) {
      throw new Error("Failed to fetch data");
    }

    setMessages([...messages, { chat: response.data.imageResponse, user: tacodog }]);
    setIsSaveMessage(true);
    console.log("ask image", response.data);
  }

  async function getUsers() {
    try {
      const response = await axios.get(`${domain}/getAllUsers/`);
      const data: User[] = response.data.users.flat();
      setUsers(data);

      // init tacodog
      const taco = data.filter((user) => user.username.toLowerCase() == "tacodog")[0];
      setTacodog(taco);

      // UNCOMENT  AFTWEER TESTING
      //set default active chat
      // setActiveChat({ user1: currentUser, user2: taco, chats: [] });
    } catch (error) {
      console.log("Error getting users:", error);
    }
  }

  async function getPrivateChats() {
    try {
      const response = await axios.get(`${domain}/getPrivateChats/${currentUser?.id}/`);
      const data: PrivateChat[] = response.data.private_chats.flat();
      setPrivateChats(data);

      // const privateChatsOnly = privateChats.map((chat) => chat.chats);
      // console.log("Only", privateChatsOnly);
      // const defaultChat = privateChats.find((chat) => new Date(chat.time) === user.username);
      // setActiveChat({});
      console.log("Private Chats", data);
    } catch (error) {
      console.log(error);
    }
  }
  // UNCOMENT  AFTWEER TESTING
  // useEffect(() => {
  //   // get chats of activeChat users
  //   const chatso = privateChats.filter(
  //     (chat) =>
  //       (chat.user1.id == activeChat.user1.id && chat.user2.id == activeChat.user2.id) ||
  //       (chat.user2.id == activeChat.user1.id && chat.user1.id == activeChat.user2.id)
  //   )[0];

  //   // sort by date
  //   if (chatso) {
  //     chatso.chats.sort(
  //       (a, b) => new Date(a.time ? a.time : 0).getTime() - new Date(b.time ? b.time : 0).getTime()
  //     );
  //     console.log("sorted?", chatso.chats);
  //     setActiveChat((prevActive) => ({ ...prevActive, chats: chatso.chats }));
  //   }
  //   console.log("chats", chatso);
  // }, [privateChats, activeChat]);

  // UNCOMENT  AFTWEER TESTING
  // useEffect(() => setMessages(activeChat.chats), [activeChat]);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     getPrivateChats(currentUser.id);
  //   }, 3000);
  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [currentUser]);

  useEffect(() => {
    // Scroll to the bottom of the messages container when messages change
    const messagesContainer = document.getElementById("messages-container");
    messagesContainer?.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function toggleAccountSidebar() {
    setAccountSidebar(!isAccountSidebar);
  }

  const handleSetActiveChat = (id: string) => {
    setActiveChat(users.filter((user) => user.id === id)[0]);
  };

  return (
    <div className={`${status === "loading" ? "hidden" : "flex"} h-screen w-screen flex`}>
      <ChatSidebar users={users} handleSetActiveChat={handleSetActiveChat} />
      <div className=" bg-orange-300 h-full w-full flex">
        {/* <div
          className={`bg-black h-full ${isAccountSidebar ? " w-[20%]" : "w-[40px]"} fixed right-0`}
        >
          <div className="border-b border-gray-400 w-full h-16 items-end text-4xl  relative">
            <Image
              className="hidden xl:flex "
              src={"/bg/BG1.jpg"}
              alt="User BG"
              fill={true}
              objectFit="cover"
            />
          </div>
          <div className="py-4 px-5 flex justify-between items-center ">
            <div className="flex gap-4">
              <Avatar onClick={toggleAccountSidebar} className="h-9 w-9 cursor-pointer ">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-lg">
                Account
                <span className="text-xs text-muted-foreground">
                  {currentUser?.username ? currentUser.username : "Guest"}
                </span>
              </div>
            </div>
            <Minimize size={22} onClick={toggleAccountSidebar} className="cursor-pointer" />
          </div>
        </div> */}

        <div className="h-full flex-1 flex flex-col border-x ">
          <div className="relative border-b w-full h-16 flex items-center justify-center text-center text-xs ">
            {/* AI Chat Assistant - CSIT349 Final Project <br /> (Ask TacoDog anything with a
            &quot;!&quot; prefix) */}
            <Image fill src="/bg/trees.jpg" objectFit="cover" alt="user banner" />
          </div>
          {activeChat ? (
            <div className="bg-blue-300 w-4/5 mx-auto p-3 flex-1 gap-5 flex-col relative  ">
              <div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-5 items-center">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src="/avatars/tacodog.png" className=" cursor-default" />
                      <AvatarFallback>{activeChat.username[0]}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-3xl">{activeChat.username}</CardTitle>
                  </div>
                  <div className="flex gap-4 items-center">
                    <CircleEllipsis size={iconSize} className="cursor-pointer" />
                    {/* <Account username={user.username} setUser={setUser} /> */}
                  </div>
                </div>
              </div>
              <CardContent
                id="messages-container"
                className="p-0 flex-1 overflow-auto scrollbar scroll-smooth"
              >
                <MessagesCard messages={messages} currentUsername={currentUser?.username} />
              </CardContent>{" "}
              <div className="bg-yellow-600 h-10 flex gap-2 w-[80%] left-1/2 -translate-x-1/2 absolute bottom-[10%]">
                <Textarea
                  placeholder="Type your message here."
                  onChange={(e) => setInputText(e.target.value)}
                  value={inputText}
                />
                {/* <div className="flex flex-col gap-3 py-2 justify-end">
                <Send size={20} onClick={onSendMessage} className="cursor-pointer" type="submit" />
                {inputText && (
                  <X size={20} onClick={() => setInputText("")} className="cursor-pointer" />
                  )}
                  </div> */}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8rem]">
              Helllow!
            </div>
          )}
        </div>
      </div>
    </div>
  );
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
  //                     setActiveChat((prevActive) => ({ ...prevActive, username: user.username }))
  //                   }
  //                 >
  //                   {user.username}
  //                 </DropdownMenuItem>
  //               ))}
  //             </DropdownMenuContent>
  //           </DropdownMenu>

  //           <Chats
  //             setActiveChat={setActiveChat}
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
  //                   {activeChat.user2.username.toLowerCase() == "tacodog" ? (
  //                     <AvatarImage src="/avatars/tacodog.png" />
  //                   ) : (
  //                     <AvatarImage src="" />
  //                   )}
  //                   <AvatarFallback>{activeChat.user2.username[0]}</AvatarFallback>
  //                 </Avatar>
  //                 <CardTitle>{activeChat.user2.username}</CardTitle>
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
  //               onChange={(e) => setInputText(e.target.value)}
  //               value={inputText}
  //             />
  //             <div className="flex gap-3 justify-end">
  //               {inputText && (
  //                 <X size={20} onClick={() => setInputText("")} className="cursor-pointer" />
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
  setActiveChat: (newActiveChat: PrivateChat) => void;
  users: User[];
  currentUser: User;
  privateChats: PrivateChat[];
}
function Chats(props: ChatsProps) {
  const { setActiveChat, users, currentUser, privateChats } = props;

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
                setActiveChat({
                  user1: currentUser,
                  user2: user,
                  chats: privateChat.chats,
                });
              } else {
                setActiveChat({
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
