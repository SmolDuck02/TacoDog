import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export default function ThemeModeButton() {
  const { setTheme, theme } = useTheme();

  function toggleMode(mode: string) {
    setTheme(mode);
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => toggleMode("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleMode("dark")}>Dark</DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
