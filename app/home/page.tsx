"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { Moon, Send, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState(["Test"]);
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");

  async function getData() {
    const response = await axios.post("http://127.0.0.1:8000/ask/", {
      inputText: inputText.slice(1),
    });

    if (!response) {
      throw new Error("Failed to fetch data");
    }
    console.log(response.data.response);
    setMessages([...messages, response.data.response]);
  }

  useEffect(() => {
    const lastMessage = document.getElementById((messages.length - 1).toString());
    lastMessage?.scrollIntoView({ behavior: "smooth" });

    if (inputText.startsWith("!")) {
      getData();
    }
    setInputText("");
  }, [messages]);

  const onSendMessage = () => {
    setMessages([...messages, inputText]);
  };
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
              <Account />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MessagesCard messages={messages} />
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

function Account() {
  const data = false;
  return (
    <>
      <Popover>
        <PopoverTrigger>
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className=" min-w-32 w-auto   p-3">
          <div>
            <h3 className="scroll-m-20 my-1 text-lg font-semibold tracking-tight">
              {data ? "Jameel Ursonal" : "Guest"}
            </h3>
            <div className="flex flex-col gap-1">
              {data ? (
                <>
                  <Button variant="ghost" className="w-auto ">
                    Logout Account
                  </Button>
                  <Button variant="destructive" className="w-auto ">
                    Delete Account
                  </Button>
                </>
              ) : (
                <SignInModal />
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

function SignInModal() {
  const [formData, setFormData] = useState({
    username: "",
    password1: "",
    password2: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/signin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Form submission error:", errorData);
      } else {
        const data = await response.json();
        console.log("Form submission success:", data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Sign In </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>Send some love: 091m155h3r</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="Pedro Duarte"
                value={formData.username}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Password
              </Label>
              <Input
                id="password1"
                placeholder="Password"
                name="password1"
                type="password"
                value={formData.password1}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Confirm Password
              </Label>
              <Input
                id="password2"
                name="password2"
                placeholder="Confirm Password"
                type="password"
                value={formData.password2}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Sign In</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MessagesCard({ messages }: { messages: string[] }) {
  const data = true;
  return (
    <Card>
      <CardContent className="  overflow-auto h-[40vh] scroll-smooth  p-5 flex flex-col gap-4">
        {messages[0] ? (
          messages.map((message, index) => (
            <div
              id={index.toString()}
              key={index}
              className={`flex gap-4 ${!data && "self-end"} items-end`}
            >
              {data && (
                <Avatar className="mb-1">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
              <div>
                <Label htmlFor={index.toString()} className="pl-2 text-xs text-slate-500">
                  {data ? "Guest" : "User"}
                </Label>
                <CardContent
                  id={index.toString()}
                  key={index}
                  className="border p-3 w-auto rounded-lg"
                >
                  {message}
                </CardContent>
              </div>
            </div>
          ))
        ) : (
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-500">
            No Chat History
          </span>
        )}
      </CardContent>
    </Card>
  );
}

function ThemeModeButton() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
