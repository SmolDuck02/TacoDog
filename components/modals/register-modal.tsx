import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function SignupModal({
  setUser,
}: {
  setUser: (newValue: { username: string; password: string }) => void;
}) {
  const [formData, setFormData] = useState({
    username: "",
    password1: "",
    password2: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
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
        console.error("Signup error:", errorData);
      } else {
        const data = await response.json();
        console.log("Signup success:", data);
        setUser({ username: data.user.username, password: data.user.password });
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Sign Up </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSignup}>
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
              <Button type="submit">Sign Up</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RegisterModal({
  setUser,
  mode,
}: {
  setUser: (newValue: { id: number; username: string }) => void;
  mode: "Sign In" | "Sign Up";
}) {
  const [isPassShown, setIsPassShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const url = mode == "Sign In" ? "signin/user/" : "signup/";
  const [formData, setFormData] = useState({
    username: "",
    password1: "",
    password2: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://127.0.0.1:8000/${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setIsError(true);

        console.error(`${mode} error:`, errorData);
      } else {
        const data = await response.json();
        setUser({ id: data.user.id, username: data.user.username });

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("userId", data.user.id);

        console.log(`${mode} success:`, data);
      }
    } catch (error) {
      setIsError(true);
      console.error(`${mode} error:`, error);
    }
  };

  useEffect(() => setIsError(false), [formData]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={`${mode == "Sign In" ? "default" : "ghost"}`}>{mode} </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSignin}>
          <DialogHeader>
            <DialogTitle>{mode}</DialogTitle>
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
            {isError && (
              <span className="text-sm text-red-500 text-end">
                {(() => {
                  if (mode == "Sign In") {
                    if (formData.password1 && formData.username)
                      return "*Incorrect username or password!";
                  } else {
                    if (formData.password1 && formData.password2 && formData.username) {
                      if (formData.password1 != formData.password2) {
                        return "*Passwords do not match!";
                      }
                      if (formData.password1 == formData.password2) {
                        return "*VV Weak Password!";
                      }
                    }
                  }
                  return "*Fill in all fields!";
                })()}
              </span>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">{mode}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
