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
  created_at?: string;
}
export default function Home() {
  const [messages, setMessages] = useState<Chat[]>([]);
  const [inputText, setInputText] = useState("");
  const [user, setUser] = useState({ id: 0, username: "" });

  async function signinGuest() {
    try {
      const response = await axios.get("http://127.0.0.1:8000/signin/guest/");
      setUser({ id: response.data.user.id, username: response.data.user.username });
    } catch (error) {
      console.error("Error signing in as guest:", error);
    }
  }

  async function getChats() {
    try {
      const response = await axios.get("http://127.0.0.1:8000/getChats/");
      const chatHistory = response.data.userChats;
      if (messages.length != chatHistory.length) {
        console.log("geneviewve", response.data.userChats);
        console.log("chatHistory:", chatHistory);
        setMessages([...chatHistory.flat()]);
      }
    } catch (error) {
      console.error("Error signing in as guest:", error);
    }
  }

  async function askAI() {
    const response = await axios.post("http://127.0.0.1:8000/ask/", {
      inputText: inputText.slice(1),
    });

    if (!response) {
      throw new Error("Failed to fetch data");
    }
    setMessages([...messages, { chat: response.data.response, username: "TacoDogss" }]);
    console.log(response.data);
  }

  async function saveMessage() {
    const response = await axios.post("http://127.0.0.1:8000/addChat/", {
      chat: inputText,
      userId: user.id,
    });
    if (response.data.error) {
      console.log("Failed to save message: ", response.data.error);
    } else {
      console.log("Save message success");
    }
  }

  const onSendMessage = () => {
    setMessages([...messages, { chat: inputText, username: user.username }]);
  };

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
    }, 100);
    return () => {
      clearInterval(timer);
    };
  });

  useEffect(() => {
    const lastMessage = document.getElementById((messages.length - 1).toString());
    lastMessage?.scrollIntoView({ behavior: "smooth" });
    console.log("messages", messages);

    if (inputText.startsWith("!")) {
      askAI();
    } else if (inputText) {
      saveMessage();
    }

    if (messages[messages.length - 1]?.username != "TacoDogss") setInputText(""); 
  }, [messages]);

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Card className="w-1/2  mx-auto">
        <CardHeader className="static">
          <div className="flex justify-between">
            <div>
              <CardTitle>TacoDogoo</CardTitle>
              <CardDescription className="p-1 text-xs">
                AI Chat Assistant - CSIT349 Final Project
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
