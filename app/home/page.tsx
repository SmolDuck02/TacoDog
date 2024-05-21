"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Account from "@/components/ui/account";
import MessagesCard from "@/components/ui/messages-card";
import { Textarea } from "@/components/ui/textarea";
import ThemeModeButton from "@/components/ui/theme-mode-button";
import axios from "axios";
import { Send, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Chat {
  chat: string;
  username: string;
  time?: string;
}
export default function Home() {
  const [messages, setMessages] = useState<Chat[]>([]);
  const [inputText, setInputText] = useState("");
  const [user, setUser] = useState({ id: 0, username: "Guest" });
  const [isSaveMessage, setIsSaveMessage] = useState(false);
  async function signinGuest() {
    try {
      const response = await axios.get("https://web-production-019a.up.railway.app/signin/guest/");
      setUser({ id: response.data.user.id, username: response.data.user.username });
    } catch (error) {
      console.error("Error signing in as guest:", error);
    }
  }

  async function getChats() {
    try {
      const response = await axios.get("https://web-production-019a.up.railway.app/getChats/");
      const chatHistory: Chat[] = response.data.userChats;
      if (messages.length != chatHistory.length) {
        
        chatHistory.sort((a, b) => { 
          if (a.time && b.time) {
            return new Date(a.time).getTime() - new Date(b.time).getTime();
          } else {
            return 0;
          }
        }); 

        setMessages([...chatHistory.flat()]);
        console.log("chatHistory:", chatHistory);
      }
    } catch (error) {
      console.error("Error signing in as guest:", error);
    }
  }

  async function askAI() {
    const response = await axios.post("https://web-production-019a.up.railway.app/ask/", {
      inputText: inputText.slice(1),
    });

    if (!response) {
      throw new Error("Failed to fetch data");
    }
    setMessages([...messages, { chat: response.data.response, username: "TacoDog" }]);
    setIsSaveMessage(true);
    console.log(response.data);
  }

  async function saveMessage() {
    const response = await axios.post("https://web-production-019a.up.railway.app/addChat/", {
      chat: messages[messages.length - 1]?.chat,
      userId: messages[messages.length - 1]?.username == "TacoDog" ? 7 : user.id,
    });
    if (response.data.error) {
      console.log("Failed to save message: ", response.data.error);
    } else {
      console.log("Save message success");
    }
  }

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      const username = localStorage.getItem("username") || "";
      const userId = parseInt(localStorage.getItem("userId") || "0", 10);
      setUser({ id: userId, username: username });
    } else signinGuest();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      getChats();
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  });

  const onSendMessage = () => {
    setIsSaveMessage(true);
    setMessages([...messages, { chat: inputText, username: user.username }]);
  };

  useEffect(() => {
    if (inputText.startsWith("!")) askAI();
    // save all messages
    if (isSaveMessage) {
      saveMessage();
      setIsSaveMessage(false);
    }

    if (messages[messages.length - 1]?.username != "TacoDog") setInputText("");
  }, [isSaveMessage]);

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Card className="w-1/2  mx-auto">
        <CardHeader className="static">
          <div className="flex justify-between">
            <div>
              <CardTitle>TacoDogoo</CardTitle>
              <CardDescription className="p-1 text-xs">
                AI Chat Assistant - CSIT349 Final Project
                <div>
                  (Ask me anything with a <q>!</q> prefix)
                </div>
              </CardDescription>
            </div>
            <div className="flex gap-4 items-center">
              <ThemeModeButton />
              <Account username={user.username} setUser={setUser} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MessagesCard messages={messages} currentUsername={user.username} />
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Textarea
            placeholder="Type your message here."
            onChange={(e) => setInputText(e.target.value)}
            value={inputText}
          />
          <div className="flex gap-3 w-full justify-end">
            {inputText && (
              <X size={20} onClick={() => setInputText("")} className="cursor-pointer" />
            )}
            <Send size={20} onClick={onSendMessage} className="cursor-pointer" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
