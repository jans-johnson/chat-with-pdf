import ClientOnly from "@/components/client-only";
import Image from "next/image";
import Link from "next/link";
import { GoToChatButton } from "./page-client";

export default function Home() {
  return (
    <ClientOnly>
      <div className="w-screen min-h-screen relative bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950/30">
        <Link href="/" className="absolute top-8 left-8">
          <Image src="/pdfwizard-logo.svg" alt="logo" width="180" height="44" />
        </Link>
        <div className="w-full flex flex-col items-center justify-center gap-3 px-5 py-24">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-semibold text-white">
              Chat with PDF
            </h1>
            <p className="max-w-2xl text-md text-neutral-400 text-center">
              Ask questions and receive instant responses from your PDFs.
              It&apos;s an easy-to-use tool for quick information retrieval.
            </p>
          </div>
          <GoToChatButton />
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-3 rounded-xl mt-5">
            <Image
              src="/demo.png"
              alt="demo image of the app"
              width="1200"
              height="700"
              className="rounded-md"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
