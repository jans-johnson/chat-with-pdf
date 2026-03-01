"use client";

import axios from "axios";
import { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CornerDownRight, Plus } from "lucide-react";
import { SafeChat, SafeChatFile } from "@/lib/db/schema";
import { Button } from "./ui/button";
import MessageList from "./messages/message-list";
import { Textarea } from "./ui/textarea";
import ModelSelector from "./model-selector";
import { useAppStore } from "@store/app-store";
import toast from "react-hot-toast";
import type { ChatWithFiles } from "@/app/chat/[[...chatId]]/_actions/chat";

interface ChatInterfaceProps {
  currentChat: ChatWithFiles;
}

const ChatInterface: FunctionComponent<ChatInterfaceProps> = ({
  currentChat,
}) => {
  const chatId = currentChat.id;
  const {
    messageCount,
    setCurrentChatId,
    updateMessageCount,
    selectedModel,
    apiKeys,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [chatFiles, setChatFiles] = useState<SafeChatFile[]>(
    currentChat.files || []
  );

  const query = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [modelForMessages, setModelForMessages] = useState<
    Record<string, string>
  >({});

  const { messages, input, isLoading, handleInputChange, handleSubmit } =
    useChat({
      body: {
        chatId,
        messageCount,
        selectedModel,
        apiKeys,
      },
      initialMessages: query.data?.messages || [],
      onResponse: (response) => {
        updateMessageCount("increase", 1);

        const sourcesHeader = response.headers.get("x-sources");
        const sources = sourcesHeader
          ? JSON.parse(Buffer.from(sourcesHeader, "base64").toString("utf8"))
          : [];
        const messageIndexHeader = response.headers.get("x-message-index");
        const modelHeader = response.headers.get("x-model");
        if (messageIndexHeader) {
          if (sources.length) {
            setSourcesForMessages({
              ...sourcesForMessages,
              [messageIndexHeader]: sources,
            });
          }

          // Store the selected model for the new AI message
          if (modelHeader) {
            setModelForMessages((prev) => ({
              ...prev,
              [messageIndexHeader]: modelHeader,
            }));
          }
        }

        setIsWaitingForResponse(false);
      },
      onError: (error) => {
        const message = JSON.parse(error.message);
        if (typeof message.error === "string") {
          toast.error(message.error, {
            position: "bottom-right",
            duration: 5000,
          });
        } else {
          toast.error("Something went wrong", {
            position: "bottom-right",
            duration: 5000,
          });
        }
      },
    });

  useEffect(() => {
    setCurrentChatId(chatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract model information from database messages
  useEffect(() => {
    if (query.data?.messages) {
      const modelMap: Record<string, string> = {};
      query.data.messages.forEach((msg: any) => {
        if (msg.model) {
          modelMap[msg.id] = msg.model;
        }
      });
      setModelForMessages(modelMap);
    }
  }, [query.data?.messages]);

  const handleAddFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large (max 50MB)");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }

    try {
      setIsAddingFile(true);

      // Upload the file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        toast.error("Failed to upload file");
        return;
      }

      const uploadData = await uploadRes.json();

      // Add file to chat
      const addRes = await axios.post("/api/add-file-to-chat", {
        chatId,
        file_key: uploadData.file_key,
        file_name: uploadData.file_name,
      });

      setChatFiles(addRes.data.files);
      toast.success(`Added "${uploadData.file_name}" to chat`);
    } catch (error) {
      toast.error("Error adding file to chat");
    } finally {
      setIsAddingFile(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [chatId]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsWaitingForResponse(true);
    handleSubmit(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      onSubmit(e as any);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-72px)] flex flex-col justify-between bg-neutral-50 dark:bg-[#0a0a0a] rounded-md">
      <MessageList
        messages={messages}
        isLoading={query.isLoading}
        isWaitingForResponse={isWaitingForResponse}
        isResponding={isLoading}
        // sources={sourcesForMessages}
        models={modelForMessages}
        chatId={chatId}
        pdfName={currentChat.pdfName || currentChat.files?.[0]?.fileName || "PDF"}
      />
      <form
        className={`flex gap-3 bg-neutral-50 dark:bg-[#0a0a0a] px-3 pt-1 pb-5`}
        onSubmit={onSubmit}
      >
        {/* Chat input container */}
        <div className="flex flex-col items-end w-full border border-neutral-300 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur rounded-lg">
          <Textarea
            value={input}
            placeholder="Ask any question..."
            rows={2}
            disabled={isLoading}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            className="pt-2.5 border-none resize-none bg-transparent"
          />
          {/* Bottom row with model selector, add file, and send button */}
          <div className="flex items-center justify-between w-full pb-2">
            {/* Left side: model selector and add file */}
            <div className="flex items-center gap-1">
              <ModelSelector className="ml-3" />
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleAddFile}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isAddingFile || isLoading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-1 font-light text-[12px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 hover:bg-transparent"
                title="Add PDF to chat"
              >
                {isAddingFile ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Add file
              </Button>
            </div>

            {/* Send button on the right */}
            <Button
              type="submit"
              variant="ghost"
              className="w-fit gap-1 font-light text-[12px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 hover:bg-transparent"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <CornerDownRight size={16} />
                  Enter to send
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
