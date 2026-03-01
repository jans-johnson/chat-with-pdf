"use client";

import axios from "axios";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logger } from "@lib/logger";
import { useAppStore } from "@store/app-store";
import { SafeChat } from "@lib/db/schema";
import { cn } from "@/lib/utils";
import { PdfIcon } from "./icons/pdf-icon";
import { FileUploadIcon } from "./icons/file-upload-icon";

const FileUpload = () => {
  const router = useRouter();
  const { addChat } = useAppStore();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const { mutate, isPending } = useMutation({
    mutationFn: async (files: { file_key: string; file_name: string }[]) => {
      const response = await axios.post("/api/create-chat", { files });
      return response.data;
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validate all files
      for (const file of acceptedFiles) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`File "${file.name}" is too large (max 50MB)`);
          return;
        }
      }

      try {
        setIsUploading(true);
        const uploadedFiles: { file_key: string; file_name: string }[] = [];

        // Upload each file sequentially
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];
          setUploadProgress(
            `Uploading file ${i + 1} of ${acceptedFiles.length}: ${file.name}`
          );

          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload-file", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            toast.error(`Failed to upload "${file.name}"`);
            return;
          }

          const data = await res.json();
          if (!data?.file_key || !data.file_name) {
            toast.error(`Failed to upload "${file.name}"`);
            return;
          }

          uploadedFiles.push({
            file_key: data.file_key,
            file_name: data.file_name,
          });
        }

        setUploadProgress("Creating chat and indexing files...");

        mutate(uploadedFiles, {
          onSuccess: ({ chat }: { chat: SafeChat }) => {
            toast.success("Uploaded file(s) successfully");
            addChat(chat);
            router.push(`/chat/${chat.id}`);
          },
          onError: () => {
            toast.error("Error creating chat");
          },
        });
      } catch (error) {
        logger.error("Error uploading file:", {
          error,
        });
      } finally {
        setIsUploading(false);
        setUploadProgress("");
      }
    },
    [mutate, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    disabled: isPending || isUploading,
    onDrop,
  });

  return (
    <div className="w-1/2 bg-neutral-50 dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 rounded-xl p-5">
      <div
        {...getRootProps({
          className: cn(
            "border-dashed border-2 rounded-xl cursor-pointer p-5 py-8 flex justify-center items-center flex-col border-neutral-300 dark:border-white/10 hover:dark:border-emerald-500/30 transition-colors",
            {
              "bg-neutral-100 dark:bg-emerald-500/5": isDragActive,
              "cursor-not-allowed": isPending || isUploading,
            }
          ),
        })}
      >
        <input {...getInputProps()} />
        {isPending || isUploading ? (
          <>
            <FileUploadIcon size={85} />
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-300 mt-4">
              {uploadProgress || "Spilling tea to AI..."}
            </p>
          </>
        ) : (
          <>
            <PdfIcon
              size={85}
              className={cn({
                "opacity-50": isDragActive,
              })}
            />
            <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-300 mt-4">
              {isDragActive
                ? "Drop your files here"
                : "Drag and drop your files here or click to select files"}
            </p>
            <div className="flex gap-2 mt-2 text-sm">
              <p className="text-neutral-400 dark:text-neutral-500 border-r-2 border-neutral-300 dark:border-white/10 pr-2">
                Supported file types: PDF
              </p>
              <p className="text-neutral-400 dark:text-neutral-500">
                Max file size: 50MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
