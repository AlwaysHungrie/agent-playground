'use client'

import { RegisterWallet } from "@/components/connectWallet";
import { Dialog, DialogContent } from "@/components/dialog";
import { useState } from "react";

export default function Home() {
  const [dialog, setDialog] = useState<DialogContent | null>(null)

  return (
    <div className="bg-gray-100">
      <div className="min-h-screen w-full flex flex-col items-center z-50 py-4 sm:py-6 overflow-x-hidden">
        <RegisterWallet setDialog={setDialog} />
        <Dialog onClose={() => setDialog(null)} dialog={dialog} />
      </div>
    </div>
  )
}
