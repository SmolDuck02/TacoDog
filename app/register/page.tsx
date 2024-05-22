"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isPassShown, setIsPassShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState({ state: false, message: "" });
  const [mode, setMode] = useState("Sign In");
  const url = mode == "Sign In" ? "signin/user/" : "signup/";
  const [formData, setFormData] = useState({
    username: "",
    password1: "",
    password2: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`https://web-production-019a.up.railway.app/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.error || data.errors) {
        setIsError({
          state: true,
          message: mode == "Sign Up" ? JSON.parse(data.errors).password2[0].code : data.error,
        });

        console.error(`${mode} error:`, data.error);
      } else {
        // setUser({ id: data.user.id, username: data.user.username });

        console.log(`${mode} success:`, data);

        if (mode == "Sign In") {
          router.push("/");
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", data.user.username);
          localStorage.setItem("userId", data.user.id);
        } else setMode("Sign In");
      }
    } catch (error) {
      console.error(`${mode} catch error:`, error);
    }
  };

  useEffect(() => setIsError((prevError) => ({ ...prevError, state: false })), [formData]);
  useEffect(
    () =>
      setFormData({
        username: "",
        password1: "",
        password2: "",
      }),
    [mode]
  );
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center gap-32">
      <div className="flex flex-col relative h-[32rem] w-[40rem]">
        <Image
          src="/avatars/tacodog.png"
          alt="logo"
          height={300}
          width={300}
          className="absolute"
        />
        <CardTitle className="text-[10rem] absolute bottom-0">TacoDog.</CardTitle>
        <div className="ml-10 absolute bottom-5">
          Connect better with people with a built-in AI buddy.
        </div>
      </div>
      <div className=" w-96">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>{mode}</CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="grid relative grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password1"
                    name="password1"
                    placeholder="Password"
                    type={isPassShown ? "text" : "password"}
                    value={formData.password1}
                    onChange={handleChange}
                    className="col-span-3"
                  />

                  <div
                    className="absolute right-2 cursor-pointer"
                    onClick={() => setIsPassShown(!isPassShown)}
                  >
                    {isPassShown ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                </div>
                {mode == "Sign Up" && (
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
                )}
                {isError.state && (
                  <span className="text-sm text-red-500 text-end">
                    {(() => {
                      if (mode == "Sign In") {
                        if (formData.password1 && formData.username) return `*${isError.message}`;
                      } else {
                        if (formData.password1 && formData.password2 && formData.username) {
                          if (formData.password1 != formData.password2) {
                            return "*Passwords do not match!";
                          }
                          if (formData.password1 == formData.password2) {
                            const error = `*${isError.message} ${
                              isError.message.endsWith("similar") && "_with_username"
                            }`;
                            return error;
                            return "*VV Weak Password";
                          }
                        }
                      }
                      return "*Fill in all fields!";
                    })()}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end">
                {mode == "Sign In" ? (
                  <span className="text-xs">
                    Do not have an account?
                    <Button
                      variant={"link"}
                      size={"icon"}
                      className="mx-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode("Sign Up");
                      }}
                      type="button"
                    >
                      Sign up here.
                    </Button>
                  </span>
                ) : (
                  <span className="text-xs">
                    Alread have an account?
                    <Button
                      variant={"link"}
                      size={"icon"}
                      className="mx-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        setMode("Sign In");
                      }}
                      type="button"
                    >
                      Sign in here.
                    </Button>
                  </span>
                )}

                <Button type="submit">{mode}</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
