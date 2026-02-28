"use client";

import { Button } from "@components/ui/button";
import { Bot, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const GoToChatButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsLoading(true);
    router.push("/chat");
  };

  return (
    <Button
      className="w-[130px] bg-emerald-500 text-black font-medium hover:bg-emerald-400"
      disabled={isLoading}
      onClick={handleClick}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <span className="flex items-center">
          Go to chat
          <Bot className="ml-1.5" size={18} />
        </span>
      )}
    </Button>
  );
};
