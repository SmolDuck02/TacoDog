import { useRef } from "react";

type Props = {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
};

export default function Hello({ isLoading, setIsLoading }: Props) {
  const helloRef = useRef<HTMLDivElement>(null);
  const fade = () => {
    setTimeout(() => {
      if (helloRef?.current) {
        helloRef.current.classList.add("opacity-0", "-translate-y-10");
        setIsLoading(false);
        setTimeout(() => {
          if (helloRef.current) helloRef.current.style.display = "none";
        }, 500);
      }
    }, 1000);
  };
  
  isLoading && fade();
  
  return (
    <div
      ref={helloRef}
      className=" z-[51] bg-[#ebe8e4] dark:bg-slate-950 duration-500 ease-out flex-col w-full h-full flex items-center text-[5rem] lg:text-[8rem] justify-center absolute"
    >
      Helllow
    </div>
  );
}
