"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessagesCard from "@/components/ui/messages-card";
import { Textarea } from "@/components/ui/textarea";
import ThemeModeButton from "@/components/ui/theme-mode-button";
import axios from "axios";
import { Send, SquarePen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
}

interface Chat {
  chat: string;
  user: User;
  time?: string;
}

interface NewChat {
  user1: User;
  user2: User;
  messages: string[];
}

function clearLocalStorage() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
}

export default function Home() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState({ id: 0, username: "" });
  const [tacodog, setTacodog] = useState<User>({ id: 0, username: "" });
  const [searchText, setSearchText] = useState("");
  const [isSearch, setIsSearch] = useState(false);

  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [activeChat, setActiveChat] = useState<PrivateChat>({
    user1: { id: 0, username: "" },
    user2: { id: 0, username: "TacoDog" },
    chats: [],
  });
  const [inputText, setInputText] = useState("");

  const [messages, setMessages] = useState<Chat[]>([]);
  const [isSaveMessage, setIsSaveMessage] = useState(false);

  async function addPrivateChat(chatId: number) {
    const response = await axios.post(
      "https://web-production-019a.up.railway.app/addPrivateChat/",
      {
        userIds: [currentUser.id, activeChat.user2.id],
        chatIds: [chatId],
      }
    );
    if (response.data.error) {
      console.log("Failed to save private chat: ", response.data.error);
    } else {
      console.log("Save private chat success", response);
    }
  }

  async function saveMessage() {
    const response = await axios.post("https://web-production-019a.up.railway.app/addChat/", {
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
    const response = await axios.post("https://web-production-019a.up.railway.app/ask/", {
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
    const response = await axios.post("https://web-production-019a.up.railway.app/askImage/", {
      imagePrompt: inputText.slice(1),
    });

    if (!response) {
      throw new Error("Failed to fetch data");
    }

    setMessages([...messages, { chat: response.data.imageResponse, user: tacodog }]);
    setIsSaveMessage(true);
    console.log("ask image", response.data);
  }

  async function handleLogout() {
    try {
      // const response = await axios.get("https://web-production-019a.up.railway.app/signin/guest/");
      // setUser({ id: response.data.user.id, username: response.data.user.username });
      clearLocalStorage();
      router.push("/register");
      console.log("Logout sucess");
    } catch (error) {
      console.error("Error loggin out:", error);
    }
  }

  async function getUsers() {
    try {
      const response = await axios.get("https://web-production-019a.up.railway.app/getAllUsers/");
      console.log("Users", response);

      const data: User[] = response.data.users.flat();
      setUsers(data);

      //set default active chat
      const taco = data.filter((user) => user.username.toLowerCase() == "tacodog")[0];
      setTacodog(taco);
      setActiveChat({ user1: { id: 0, username: "" }, user2: taco, chats: [] });
      console.log("Taco", taco);
    } catch (error) {
      console.log("Error getting users:", error);
    }
  }

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    console.log("co", cookies);

    const cooki = {};

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      const username = localStorage.getItem("username") || "";
      const userId = parseInt(localStorage.getItem("userId") || "0", 10);
      setCurrentUser({ id: userId, username: username });
      getUsers();
      getPrivateChats(userId);
    } else router.push("/register");
  }, []);

  async function getPrivateChats(userId: number) {
    try {
      const response = await axios.get(
        `https://web-production-019a.up.railway.app/getPrivateChats/${userId}/`
      );
      const data: PrivateChat[] = response.data.private_chats.flat();
      setPrivateChats(data);

      console.log("data", data);
      // defaults to tacodog
      const defaultChat = data.find((chat) => chat.user2.username.toLowerCase() == "tacodog");
      console.log("default chat", defaultChat);
      if (defaultChat) {
        setActiveChat(defaultChat);

        console.log("def", defaultChat, defaultChat.chats);
      }

      // const privateChatsOnly = privateChats.map((chat) => chat.chats);
      // console.log("Only", privateChatsOnly);
      // const defaultChat = privateChats.find((chat) => new Date(chat.time) === user.username);
      // setActiveChat({});
      console.log("Private Chats", data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => setMessages(activeChat.chats), [activeChat]);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     getPrivateChats();
  //   }, 5000);
  //   return () => {
  //     clearInterval(timer);
  //   };
  // });
  useEffect(() => {
    // Scroll to the bottom of the messages container when messages change
    const messagesContainer = document.getElementById("messages-container");
    messagesContainer?.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <main className="flex h-screen overflow-hidden  min-w-screen">
      <div className="w-[15%] h-screen flex flex-col">
        <CardTitle className="border-b w-full h-16 flex items-end text-4xl pb-1">
          TACODOGG/.
        </CardTitle>
        <div className="px-5 py-6 flex h-[90%] flex-col gap-1 ">
          <div className="flex items-center justify-between">
            <span className="text-lg "> Chats </span>
            <div className="flex gap-2 justify-center">
              <SquarePen className="h-[1.2rem] w-[1.2rem] cursor-pointer" />
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Input
                placeholder="Search someone..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {users.map((user, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() =>
                    setActiveChat((prevActive) => ({ ...prevActive, username: user.username }))
                  }
                >
                  {user.username}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Chats setActiveChat={setActiveChat} users={users} privateChats={privateChats} />
        </div>
      </div>
      <div className="min-h-screen flex-1 flex flex-col border-x pb-10 ">
        <CardDescription className="border-b w-full h-16 flex items-center justify-center text-center text-xs pb-1">
          AI Chat Assistant - CSIT349 Final Project <br /> (Ask TacoDog anything with a
          &quot;!&quot; prefix)
        </CardDescription>
        <div className="w-4/5 h-[90%] mx-auto flex gap-5 flex-col ">
          <CardHeader className="static">
            <div className="flex justify-between items-center">
              <div className="flex gap-5 items-center">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src="/avatars/tacodog.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <CardTitle>{activeChat.user2.username}</CardTitle>
              </div>
              <div className="flex gap-4 items-center">
                <ThemeModeButton />
                {/* <Account username={user.username} setUser={setUser} /> */}
              </div>
            </div>
          </CardHeader>
          <CardContent
            id="messages-container"
            className="p-0 flex-1 overflow-auto scrollbar scroll-smooth"
          >
            <MessagesCard messages={messages} currentUsername={currentUser.username} />
          </CardContent>
          <CardFooter className="flex gap-3">
            <Textarea
              placeholder="Type your message here."
              onChange={(e) => setInputText(e.target.value)}
              value={inputText}
            />
            <div className="flex gap-3 justify-end">
              {inputText && (
                <X size={20} onClick={() => setInputText("")} className="cursor-pointer" />
              )}
              <Send size={20} onClick={onSendMessage} className="cursor-pointer" type="submit" />
            </div>
          </CardFooter>
        </div>
      </div>
      <div className="w-[15%] relative min-h-screen">
        {" "}
        <EmptyDiv />{" "}
        <div className="px-5 py-6  flex flex-col gap-1 ">
          <div className="flex justify-between   items-center">
            <div className="flex flex-col">
              <span className="text-lg">Account </span>
              <span className="text-xs text-muted-foreground"> {currentUser.username}</span>
            </div>
            <Avatar className="h-9 w-9 cursor-pointer ">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="absolute bottom-16 w-full px-5">
          <Button variant="ghost" className="w-full text-right" onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </main>
  );
}

interface PrivateChat {
  user1: User;
  user2: User;
  chats: Chat[];
}
interface ChatsProps {
  setActiveChat: (newActiveChat: PrivateChat) => void;
  users: User[];
  privateChats: PrivateChat[];
}
function Chats(props: ChatsProps) {
  const { setActiveChat, users, privateChats } = props;

  return (
    <div className="flex mt-2 flex-col scrollbar pt-2 h-4/5 overflow-auto w-full gap-4">
      {/* <span className="flex h-full justify-center items-center text-sm text-muted-foreground">
        No Chats
      </span> */}
      {users.map((user, index) => {
        const privateChat = privateChats.find(
          (chat) => chat.user2.username === user.username || chat.user1.username === user.username
        );
        return (
          <Button
            key={index}
            variant="ghost"
            className="flex gap-5 w-full justify-start"
            onClick={() => {
              if (privateChat) {
                setActiveChat({
                  user1: privateChat.user2 == user ? privateChat.user1 : privateChat.user2,
                  user2: user,
                  chats: privateChat.chats,
                });
              } else {
                setActiveChat({
                  user1: { id: 0, username: "" }, // Set proper default values
                  user2: user,
                  chats: [],
                });
              }
            }}
          >
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>U</AvatarFallback>
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
