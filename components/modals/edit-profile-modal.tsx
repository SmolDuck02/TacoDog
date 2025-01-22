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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/lib/types";
import avatarOne from "@/public/avatars/avatarOne.png";
import avatarThree from "@/public/avatars/avatarThree.png";
import avatarTwo from "@/public/avatars/avatarTwo.png";
import plant from "@/public/bg/plant.jpg";
import sea from "@/public/bg/sea.jpg";
import shore from "@/public/bg/shore.jpg";
import { getSession, signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
export default function EditProfileModal() {
  const { data: session, update } = useSession();
  const avatars = [avatarOne, avatarTwo, avatarThree];
  const banners = [plant, shore, sea];
  const credits = ["Junel Mujar", "Marc Kleen", "Rafael Garcin"];

  const [username, setUsername] = useState("");
  const [avatarSelected, setAvatarSelected] = useState("");
  const [bannerSelected, setBannerSelected] = useState("");
  async function handleSaveChanges() {
    const updatedUser = {
      ...session?.user,
      banner: bannerSelected,
      // username: username,
      avatar: avatarSelected,
    };
    console.log(session?.user, updatedUser);

    try {
      // Update the session with new data
      await update({ user: updatedUser });

      // Optional: Refresh session from backend
      await signIn("credentials", { redirect: false });

      const t = await getSession();

      console.log("Profile updated successfully:", t, updatedUser, session?.user);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="w-[20rem] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 ">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-2"
              defaultValue={(session?.user as User)?.username}
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Avatar
            </Label>
            <div className="flex w-full text-slate-400 col-span-2 gap-2 items-center">
              Morty{" "}
              <div className="flex">
                {avatars.map((a, index) => {
                  return (
                    <Image
                      key={index}
                      src={a.src}
                      onClick={() => setAvatarSelected(a.src)}
                      alt={`avatar ${index + 1}`}
                      width={300}
                      height={300}
                      className={`${
                        avatarSelected == a.src && "border-2 border-white"
                      } object-cover h-10 w-10`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Banner
            </Label>
            <div className="flex gap-2 text-slate-400 col-span-2 items-center">
              Moss{" "}
              <div className="flex">
                {banners.map((a, index) => {
                  return (
                    <Image
                      key={index}
                      onClick={() => setBannerSelected(a.src)}
                      src={a.src}
                      alt={`banner ${index + 1}`}
                      width={300}
                      height={300}
                      className={`${
                        bannerSelected == a.src && "border-2 border-white"
                      } object-cover h-10 w-10`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveChanges} className="w-full">
            Save changes
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
