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
    // setIsLoading(false);
    if (session) {
      router.push("/chat");
    }
    // if (session && mode == "Sign In") {
    //   router.push("/");
    // } else {
    //   setMode("Sign In");
    // }
  }, [session]);

  useEffect(() => {
    if (mode.match("Sign Up")) {
      if (confirmPassword && !(confirmPassword === (formData.password || " "))) {
        if (!isValid.show) setIsValid({ show: true, message: "Passwords don't match!" });
      } else if (formData.password === confirmPassword) {
        setIsValid({ ...isValid, show: false });
      } else {
        if (!isValid.show || !confirmPassword) setIsValid({ ...isValid, show: false });
      }
    }
  }, [formData, confirmPassword, mode]);
  useEffect(() => {
    if (mode.match("Sign Up")) {
      if (
        formData.password &&
        !formData.password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ) {
        setIsValid({
          show: true,
          message:
            "Password must meet the following requirements: <br />- At least 8 characters long.<br />- Contain both letters and numbers.<br />- Include at least one special character (e.g., @, $, !, %, *, ?, &).",
        });
      } else if (formData.password === confirmPassword) {
        setIsValid({ ...isValid, show: false });
      } else {
        if (isValid.show && confirmPassword)
          setIsValid({ ...isValid, message: "Passwords don't match!" });
        else setIsValid({ ...isValid, show: false });
      }
    }
  }, [formData, mode]);

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
          callbackUrl: "/chat",
        });

        console.log("response", response);
        const { error } = response as { error: string };
        if (error) {
          setIsError((prev) => ({ show: true, message: error }));
          // const parsedRes = JSON.parse(response.error);
          // setIsLoading(false);
          // if (mode == "Sign In") {
          //   setIsError({ show: true, message: parsedRes.error });
          // } else {
          //   const errors = JSON.parse(parsedRes.errors);
          //   setIsError({
          //     show: true,
          //     message: errors.confirmPassword.map((error: { code: string }) => error.code).join(", "),
          //   });
          // }
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

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   if (formData.username && formData.password) {
  //     setIsLoading(true);
  //     try {
  //       const response = await signIn("credentials", {
  //         formData: JSON.stringify(formData),
  //         redirect: false,
  //       });

  //       if (response && response.error) {
  //         setIsLoading(false);
  //         setIsError({ show: true, message: "User does not exist" });
  //         console.log(response);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   } else {
  //     setIsError({ show: true, message: "Fill in all fields!" });
  //   }
  // };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   try {
  //     const response = await fetch(`https://web-production-019a.up.railway.app/${url}`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await response.json();
  //     if (data.error || data.errors) {
  //       setIsError({
  //         show: true,
  //         message: mode == "Sign Up" ? JSON.parse(data.errors).confirmPassword[0].code : data.error,
  //       });

  //       console.error(`${mode} error:`, data.error);
  //     } else {
  //       // setUser({ id: data.user.id, username: data.user.username });

  //       console.log(`${mode} success:`, data);

  //       if (mode == "Sign In") {
  //         router.push("/");
  //         localStorage.setItem("isLoggedIn", "true");
  //         localStorage.setItem("username", data.user.username);
  //         localStorage.setItem("userId", data.user.id);
  //       } else setMode("Sign In");
  //     }
  //   } catch (error) {
  //     console.error(`${mode} catch error:`, error);
  //   }
  // };

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
      } min-h-screen min-w-screen justify-center items-center gap-32`}
    >
      <div className="flex flex-col relative h-[32rem] w-[40rem]">
        <Image
          src="/avatars/tacodog.png"
          alt="logo"
          height={300}
          width={300}
          className="h-auto w-auto absolute"
        />
        <CardTitle className="text-[10rem] absolute bottom-0">TacoDog.</CardTitle>
        <div className="ml-10 absolute bottom-5">
          Connect better with people using a built-in AI buddy.
        </div>
      </div>
      <div className=" w-96">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex text-3xl items-center justify-between">
                {mode} <ThemeModeButton />
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-76 flex flex-col justify-center">
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
                      className="absolute right-4 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
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
                        className="absolute right-4 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </div>
                    </div>
                  )}
                  <span className="text-xs w-fit">
                    {mode.match("Sign In") ? "Don't" : "Already"} have an account?
                    <Button
                      variant={"link"}
                      size={"icon"}
                      className="mx-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode(mode.match("Sign Up") ? "Sign In" : "Sign Up");
                      }}
                      type="button"
                    >
                      {mode} here
                    </Button>
                  </span>
                </div>

                {isError.show && (
                  <span className="  text-sm text-red-500 text-end">
                    {isError.message}
                    {/* {(() => {
                      if (mode == "Sign In") {
                        return `*${isError.message}`;
                      } else {
                        if (formData) {
                          if (formData.password != formData.confirmPassword) {
                            return "*Passwords do not match!";
                          }
                          if (formData.password == formData.confirmPassword) {
                            // const error = `*${isError.message} ${
                            //   isError.message.endsWith("similar") && "_with_username"
                            // }`;
                            return isError.message;
                            return "*VV Weak Password";
                          }
                        }
                      }
                      return "*Fill in all fields!";
                    })()} */}
                  </span>
                )}
                {isValid.show && (
                  <span className="  text-sm text-red-500 text-end">{isValid.message}</span>
                )}
              </div>
              <div className="flex flex-col items-end py-2">
                {isLoading ? (
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  </Button>
                ) : (
                  <Button disabled={isValid.show} type="submit">
                    {mode}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
