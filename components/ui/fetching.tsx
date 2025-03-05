import { Bone } from "lucide-react";

export default function Fetching() {
  return (
    <div className="duration-500 ease-out flex-col  w-full h-full flex items-center text-[2rem] lg:text-[5rem] justify-center absolute z-[100]">
      <h2 className="flex-row flex items-end leading-none gap-2">
        Fetching
        <Bone className="bone delay-0" />
        <Bone className=" bone delay-300" />
        <Bone className="bone delay-500" />
      </h2>
    </div>
  );
}
