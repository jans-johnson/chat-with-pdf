"use client";

import { FunctionComponent, useEffect, useState } from "react";
import { Resizable } from "re-resizable";
import { SafeChatFile } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface PdfViewerProps {
  files: SafeChatFile[];
}

const PdfViewer: FunctionComponent<PdfViewerProps> = ({ files }) => {
  const [width, setWidth] = useState(0);
  const [maxWidth, setMaxWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth - 826 : 800
  );
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setMaxWidth(window.innerWidth - 826);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const activeFile = files[activeFileIndex];

  return (
    <Resizable
      size={{ width: width || "60%", height: "100%" }}
      maxWidth={maxWidth}
      minWidth={500}
      enable={{
        top: false,
        right: true,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(e, direction, ref, d) => {
        setWidth(width + d.width);
      }}
      handleComponent={{
        right: (
          <div className="w-1.5 h-full bg-neutral-100 dark:bg-white/5 hover:dark:bg-emerald-500/20 cursor-col-resize transition-colors" />
        ),
      }}
    >
      <div className="flex flex-col h-full">
        {files.length > 1 && (
          <div className="flex gap-0 border-b border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-[#0a0a0a] overflow-x-auto shrink-0">
            {files.map((file, index) => (
              <button
                key={file.id}
                onClick={() => setActiveFileIndex(index)}
                className={cn(
                  "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  index === activeFileIndex
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                )}
                title={file.fileName}
              >
                {file.fileName.length > 25
                  ? file.fileName.substring(0, 22) + "..."
                  : file.fileName}
              </button>
            ))}
          </div>
        )}
        {activeFile && (
          <iframe
            width="100%"
            height="100%"
            src={activeFile.fileUrl}
            className="rounded-md flex-1"
          />
        )}
      </div>
    </Resizable>
  );
};

export default PdfViewer;
