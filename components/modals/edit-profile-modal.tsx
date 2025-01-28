import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { saveProfileChanges } from "@/lib/api";
import { User } from "@/lib/types";
import { avatars, banners } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function EditProfileModal() {
  const { data: session } = useSession();
  const user = session?.user as User;
  const [username, setUsername] = useState("");
  const [avatarSelected, setAvatarSelected] = useState(user?.avatar);
  const [bannerSelected, setBannerSelected] = useState(user?.banner);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSaveChanges() {
    setIsLoading(true);

    const updatedUser = {
      ...session?.user,
      banner: bannerSelected,
      // username: username,
      avatar: avatarSelected,
    };

    saveProfileChanges(updatedUser as User);
    console.log(session?.user, updatedUser);

    signIn("credentials", {
      formData: JSON.stringify(updatedUser),
      mode: "update",
      redirect: false,
    })
      .then((response) => {
        if (response?.error) {
          toast("Changes Not Saved!", {
            description: response?.error,
          });
        } else {
          toast("Changes saved successfully!");
        }
      })
      .catch((error) => console.error("An unexpected error occurred:", error))
      .finally(() => setIsLoading(false));
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="w-[23rem] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 ">
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              defaultValue={(session?.user as User)?.username}
            />
          </div> */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Avatar
            </Label>
            <div className="flex w-full text-slate-400 col-span-3 gap-2 items-center justify-end">
              {avatarSelected?.name || "Jacket"}
              <div className="flex">
                {avatars.map((a, index) => {
                  return (
                    <Image
                      key={index}
                      src={a.img}
                      onClick={() => setAvatarSelected(a)}
                      alt={`avatar ${index + 1}`}
                      width={300}
                      height={300}
                      className={`${
                        avatarSelected?.name == a.name && "border-2 border-white"
                      } object-cover h-10 w-10`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Banner
            </Label>
            <div className="flex gap-2 text-slate-400 col-span-3 items-center justify-end">
              {bannerSelected?.name || "Moss"}
              <div className="flex">
                {banners.map((a, index) => {
                  return (
                    <Image
                      key={index}
                      onClick={() => setBannerSelected(a)}
                      src={a.img}
                      alt={`banner ${index + 1}`}
                      width={300}
                      height={300}
                      className={`${
                        bannerSelected?.name === a.name && "border-2 border-white"
                      } object-cover h-10 w-10`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 flex-row">
          <Button type="submit" disabled={isLoading} onClick={handleSaveChanges} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4  animate-spin" />
                Loading
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
