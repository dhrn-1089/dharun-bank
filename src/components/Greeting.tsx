"use client";

import { useEffect, useState } from "react";
import { Sun, Sunset, Moon, Sunrise } from "lucide-react";

export default function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState("Welcome");
  const [icon, setIcon] = useState<"morning" | "afternoon" | "evening" | "night">("morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
      setIcon("morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
      setIcon("afternoon");
    } else if (hour >= 17 && hour < 22) {
      setGreeting("Good Evening");
      setIcon("evening");
    } else {
      setGreeting("Good Evening");
      setIcon("night");
    }
  }, []);

  return (
    <div className="flex items-center gap-2.5 animate-fadeIn">
      <div className="p-1.5 rounded-lg bg-[#E6A500]/20 text-[#E6A500] shrink-0 transition-transform duration-300 hover:scale-110">
        {icon === "morning" && <Sunrise className="w-5 h-5 text-amber-400" />}
        {icon === "afternoon" && <Sun className="w-5 h-5 text-amber-400" />}
        {icon === "evening" && <Sunset className="w-5 h-5 text-orange-400" />}
        {icon === "night" && <Moon className="w-5 h-5 text-amber-300" />}
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
          <span>{greeting},</span>
          <span className="text-[#E6A500]">{name || "Member"}!</span>
        </h2>
      </div>
    </div>
  );
}
