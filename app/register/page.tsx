"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/api";
import { useUsers } from "@/lib/context/UserContext";
import { RegistrationError, type User } from "@/lib/types";
import { iconSmall } from "@/lib/utils";
import GoogleIcon from "@/public/icons/flat-color-icons--google.svg";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

export default function Register() {
  const router = useRouter();
  const { users: allUsers, isLoading } = useUsers();
  const { data: session } = useSession();
  const [isButtonLoading, setIsButtonLoading] = useState<boolean | 'Google'>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isError, setIsError] = useState<RegistrationError>({ show: false });
  const [isValid, setIsValid] = useState<RegistrationError>({ show: false });
  const [mode, setMode] = useState<"Sign In" | "Sign Up">("Sign In");
  const [formData, setFormData] = useState<User>({ id: "", username: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState<String>("");

  useEffect(() => {
    if (mode.match("Sign Up")) {
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

      // password validation
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
  }, [confirmPassword, formData, mode, isValid]);

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
  }, [formData, mode, confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value != " ")
      if (e.target.id == "confirmPassword") {
        setConfirmPassword(e.target.value);
      } else {
        setFormData((prevFormData) => ({ ...prevFormData, [e.target.name]: e.target.value }));
      }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError({ show: false });
    if (formData.username && formData.password && confirmPassword) {
      setIsButtonLoading(true);
      registerUser(formData)
        .then((response) => {
          if (response.error) {
            setIsError({ show: true, message: response.error });
          } else {
            toast("Registration Successful!");
            setMode("Sign In");
          }
        })
        .catch((error) => {
          setIsError({ show: true, message: error.message });
        })
        .finally(() => setIsButtonLoading(false));
    } else {
      setIsError({ show: true, message: "Fill in all fields!" });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      setIsButtonLoading(true);

      const fData = JSON.stringify({ user: formData, allUsers, mode: "login" });
   
      try {
        const response = await signIn("credentials", {
          data: fData,
          redirect: false,
          callbackUrl: "/chat",
        });

        const { error } = response as { error: string };
        if (error) {
          setIsError({ show: true, message: error });
        }

        await router.replace("/chat");
      } catch (error) {
        console.error(`${mode} error`, error);
      } finally {
        setIsButtonLoading(false);
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
      className={` ${isLoading ? "hidden" : "flex"} flex-col lg:flex-row
      h-screen w-screen relative bg-[#ebe8e4] dark:bg-slate-950 justify-center items-center gap-10 overflow-hidden`}
    >
      <div className="z-10  flex flex-col justify-center items-start relative  lg:h-96 lg:w-1/2 lg:items-end">
        <CardTitle className=" lg:text-[8rem] text-[5rem] leading-none drop-shadow-lg  ">
          Taco<span className="text-yellow-700">Dog</span>
        </CardTitle>
        <div className="text-sm  h-fit rounded pl-5 bg-opacity-50  lg:mr-16  lg:text-2xl drop-shadow-lg">
          Connect better with a built-in AI buddy.
        </div>
      </div>

      <form
        onSubmit={(e) => (mode.match("Sign In") ? handleSubmit(e) : handleRegister(e))}
        className="z-20 w-full  lg:w-1/2 flex lg:justify-start justify-center"
      >
        {/* min-h-96  */}
        <Card className="w-3/4 lg:w-[25rem] backdrop-blur-lg opacity-90">
          <CardHeader className="pb-3">
            <CardTitle className="flex text-3xl items-end justify-center lg:justify-between">
              {mode}
              {/* <ThemeModeButton /> */}
            </CardTitle>
          </CardHeader>
          {/* min-h-72  */}
          <CardContent className=" flex flex-col justify-center">
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
                    {showPassword ? <EyeOff size={iconSmall} /> : <Eye size={iconSmall} />}
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
                      {showPassword ? <EyeOff size={iconSmall} /> : <Eye size={iconSmall} />}
                    </div>
                  </div>
                )}
                {/* <span className="text-xs text-slate-500 w-fit">
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
                </span> */}
              </div>

              {(isValid.show || isError.show) && (
                <span className="text-center text-sm text-red-500">
                  {isValid.show ? isValid.message : isError.message}
                </span>
              )}
            </div>
            <div className="py-2">
              {isButtonLoading === true ? (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4  animate-spin" /> Loading
                </Button>
              ) : (
                <Button
                  className="w-full flex items-center gap-2"
                  disabled={isValid.show}
                  type="submit"
                >
                  <span>{mode}</span>
                </Button>
              )}
            </div>

            <Button
              className="w-full flex items-center gap-2"
              disabled={isValid.show}
              onClick={() => {
                setIsButtonLoading("Google");
                signIn("google", { redirect: true });
              }}
              type="button"
            >
              {isButtonLoading === "Google" ? (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4  animate-spin" /> Loading
                </Button>
              ) : (
                <>
                  <Image
                    width={100}
                    height={100}
                    alt="Google Icon"
                    src={GoogleIcon}
                    className="size-6"
                  />
                  <span>{mode} with Google</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>

      <div className=" bottom-0 lg:bottom-auto  w-full right-[-58%]  absolute ">
        <Image
          src="/avatars/tacoAvatar.png"
          alt="logo"
          height={500}
          width={500}
          className=" rounded-full scale-x-[-1]  object-cover  w-[80%] lg:w-[50%] brightness-100"
        />
      </div>
    </main>
  );
}
