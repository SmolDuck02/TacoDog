import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export default function Account({
  username,
  setUser,
}: {
  username: string;
  setUser: (newValue: { id: number; username: string }) => void;
}) {
  async function handleLogout() {
    try {
      const response = await axios.get("http://web-production-019a.up.railway.app/signin/guest/");
      setUser({ id: response.data.user.id, username: response.data.user.username });
      clearLocalStorage();
    } catch (error) {
      console.error("Error loggin out:", error);
    }
  }

  function clearLocalStorage() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  }

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
            <h3 className="scroll-m-20 m-1 text-lg font-semibold tracking-tight">
              {username[0]?.toUpperCase()}
              {username.slice(1)}
            </h3>
            <div className="flex flex-col gap-1">
              {username.toLowerCase() != "guest" ? (
                <>
                  <Button variant="ghost" className="w-auto " onClick={handleLogout}>
                    Logout Account
                  </Button>
                  {/* <Button variant="destructive" className="w-auto ">
                    Delete Account
                  </Button> */}
                </>
              ) : (
                <>
                  {/* <RegisterModal setUser={setUser} mode="Sign Up" />
                  <RegisterModal setUser={setUser} mode="Sign In" /> */}
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
