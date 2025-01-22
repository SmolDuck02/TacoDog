"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThemeModeButton from "@/components/ui/theme-mode-button";
import type { User } from "@/lib/types";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isError, setIsError] = useState({ show: false, message: "" });
  const [isValid, setIsValid] = useState({ show: false, message: "" });
  const [mode, setMode] = useState<"Sign In" | "Sign Up">("Sign In");
  const [formData, setFormData] = useState<User>({ id: "", username: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState<String>("");

  useEffect(() => {
    if (session && session.user) {
      router.push("/chat");
    }
  }, [session, router]);

  //confirmation password validation
  useEffect(() => {
    if (
      (!confirmPassword && formData.password) ||
      (confirmPassword && !(confirmPassword === (formData.password || " ")))
    ) {
      if (!isValid.show) setIsValid({ show: true, message: "Passwords don't match!" });
    } else if (formData.password === confirmPassword) {
      setIsValid({ show: false, message: "" });
    } else {
      if (!isValid.show || !confirmPassword) setIsValid({ show: false, message: "" });
    }
  }, [confirmPassword]);

  //password validation
  useEffect(() => {
    if (mode.match("Sign Up")) {
      if (
        formData.password &&
        !formData.password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,}$/)
      ) {
        setIsValid({
          show: true,
          message:
            "Password must meet the following requirements: <br />- At least 8 characters long.<br />- Contain both letters and numbers.<br />- Include at least one special character (e.g., @, $, !, %, *, ?, &).",
        });
      } else if (formData.password === confirmPassword) {
        setIsValid({ show: false, message: "" });
      } else {
        if ((!formData.password && confirmPassword) || formData.password !== confirmPassword)
          setIsValid({ show: true, message: "Passwords don't match!" });
        else setIsValid({ show: false, message: "" });
      }
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value != " ")
      if (e.target.id == "confirmPassword") {
        setConfirmPassword(e.target.value);
      } else {
        setFormData((prevFormData) => ({ ...prevFormData, [e.target.name]: e.target.value }));
      }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (mode.match("Sign Up") && !confirmPassword.match(formData.password || "")) {
      setIsError({ show: true, message: "Passwords don't match!" });
      return;
    }
    if (formData.username && formData.password) {
      setIsLoading(true);

      try {
        const response = await signIn("credentials", {
          formData: JSON.stringify(formData),
          mode: mode,
          redirect: false,
          callbackUrl: "/chat",
        });

        console.log("response", response);
        const { error } = response as { error: string };
        if (error) {
          setIsError({ show: true, message: error });
        }
      } catch (error) {
        console.error(`${mode} error`, error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsError({ show: true, message: "Fill in all fields!" });
    }
  };

  useEffect(
    () => setIsError((prevError) => ({ ...prevError, show: false })),
    [formData, confirmPassword]
  );
  useEffect(() => {
    setFormData({
      id: "",
      username: "",
      password: "",
    });
    setConfirmPassword("");
  }, [mode]);

  return (
    <main
      className={`${
        status !== "loading" && !session?.user ? "flex" : "hidden"
      } h-screen min-w-screen justify-center items-center gap-10 overflow-hidden`}
    >
      <div className="z-10  max-h-screen overflow-hidden flex flex-col items-end justify-center w-full absolute">
        <Image
          src="/avatars/tacodog.png"
          alt="logo"
          height={300}
          width={300}
          className="scale-x-[-1] w-1/2 brightness-80"
        />
        <p className="absolute bottom-5 right-10 text-white ">
          Avatar Photos by{" "}
          <a href="https://www.instagram.com/mcfriendy/?hl=en" className=" underline">
            Alison Friend
          </a>
        </p>
      </div>
      <div className="flex flex-col justify-end relative h-96 w-1/2 items-end">
        <CardTitle className=" text-[8rem] leading-none ">
          <span className="text-yellow-700">Taco</span>Dog
        </CardTitle>
        <div className="mr-32 pb-10 text-xl text-slate-400">
          Connect better with a built-in AI buddy.
        </div>
      </div>
      <form onSubmit={handleSubmit} className="z-20 w-1/2">
        <Card className="min-h-96 w-[25rem] backdrop-blur-lg opacity-80">
          <CardHeader className="pb-3">
            <CardTitle className="flex text-3xl items-end justify-between">
              {mode} <ThemeModeButton />
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-72  flex flex-col justify-center">
            <div className="relative grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  autoComplete="username"
                  id="username"
                  name="username"
                  placeholder="Pedro Duarte"
                  value={formData.username || ""}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              <div className="flex flex-col items-end ">
                <div className="grid relative grid-cols-4 items-center gap-4 w-full">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    placeholder="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password || ""}
                    onChange={handleChange}
                    className="col-span-3"
                  />

                  <div
                    className="absolute text-slate-500 right-4 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
                {mode == "Sign Up" && (
                  <div className="pt-4 grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirmPassword" className="text-right">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      type={showPassword ? "text" : "password"}
                      onChange={handleChange}
                      className="col-span-3"
                    />
                    <div
                      className="absolute text-slate-500 right-4 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                )}
                <span className="text-xs text-slate-500 w-fit">
                  {mode.match("Sign In") ? "Don't" : "Already"} have an account?
                  <Button
                    variant={"link"}
                    size={"icon"}
                    className="underline mx-7 text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsError({ ...isError, show: false });
                      setIsValid({ ...isValid, show: false });
                      setMode(mode.match("Sign Up") ? "Sign In" : "Sign Up");
                    }}
                    type="button"
                  >
                    {mode.match("Sign In") ? "Sign Up" : "Sign In"} here
                  </Button>
                </span>
              </div>

              {(isValid.show || isError.show) && (
                <span className="  text-sm text-red-500 text-end">
                  {isValid.show ? isValid.message : isError.message}
                </span>
              )}
            </div>
            <div className="py-2">
              {isLoading ? (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4  animate-spin" /> Loading
                </Button>
              ) : (
                <Button disabled={isValid.show} type="submit" className="w-full">
                  {mode}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </main>
  );
}
