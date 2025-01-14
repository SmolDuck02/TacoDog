"use client";

import Account from "@/components/ui/account-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import ThemeModeButton from "@/components/ui/theme-mode-button";
import axios from "axios";
import { Send, X } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Chat {
  chat: string;
  username: string;
  time?: string;
}
export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
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

  async function hey() {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Explain how AI works";

    const result = await model.generateContent(prompt);
    console.log(result.response.text(), process.env.GEMINI_KEY);
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

  // async function checkSession() {
  //   try {
  //     const response = await axios.get("http://127.0.0.1:8000/check_session/");
  //     console.log("This is response: ", response);
  //   } catch (error) {
  //     console.error("Error checking session:", error);
  //   }
  // }

  // useEffect(() => {
  //   checkSession();
  // }, [messages]);

  // Handle session-based routing
  useEffect(() => {
    if (!session && status !== "loading") {
      signIn();
    }
  }, [session, status]);

  // useEffect(() => {
  //   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  //   if (isLoggedIn) {
  //     const username = localStorage.getItem("username") || "";
  //     const userId = parseInt(localStorage.getItem("userId") || "0", 10);
  //     setUser({ id: userId, username: username });
  //   } else signinGuest();
  // }, []);

  // UNCOMMENT THIS AFTER
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     getChats();
  //   }, 5000);
  //   return () => {
  //     clearInterval(timer);
  //   };
  // });
  return (
    <div className={`flex h-screen w-screen  justify-center items-center`}>
      {status !== "loading" && (
        <Card className="w-4/5 lg:w-1/2  mx-auto">
          <CardHeader className="static">
            <div className="flex justify-between">
              <div>
                <CardTitle>TacoDogoo</CardTitle>
                <CardDescription className="p-1 text-xs">
                  AI Chat Assistant - CSIT349 Final Project <br /> (Ask me anything with a <q>!</q>{" "}
                  prefix)
                </CardDescription>
              </div>
              <div className="flex gap-4 items-center">
                <ThemeModeButton />
                <Account username={user.username} setUser={setUser} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* <MessagesCard messages={messages} currentUsername={user.username} /> */}
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
              <Send size={20} className="cursor-pointer" />
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
