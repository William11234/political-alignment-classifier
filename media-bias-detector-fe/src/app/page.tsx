"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { toast } from "sonner";

export default function Home() {
  const [isInputVisible, setIsInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [label, setLabel] = useState<string | null>(null)

  // Focus the textarea when it becomes visible
  useEffect(() => {
    if (isInputVisible && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isInputVisible])

  const handleButtonClick = () => {
    setIsInputVisible(true)
  }

  const handleSubmit = async () => {
    setLabel(null)

    if (inputValue.trim() === "") {
      toast.error("Please enter some text to analyze.")
      return
    }

    if (!inputValue.trim()) return;

    try {
      const response = await fetch("http://localhost:8000/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputValue }),
      })

      const data = await response.json()
      console.log("Response data:", data)
      console.log("Predicted label:", data.prediction)

      if (response.ok) {
        setLabel(data.prediction)
        toast.success(`Predicted label: ${data.prediction}`)
      } else {
        console.error("Error:", data)
        toast.error("Failed to classify text.")
      }
    } catch (error) {
      console.error("Error during classification:", error)
      toast.error("An error occurred while classifying the text.")
    }
  }


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-3xl">
        <h1 className="text-5xl font-mono">ClearScope</h1>
        <h2 className="text-xl font-mono">Detect the political lean in articles</h2>

        <div className="w-full transition-all duration-300 ease-in-out">
          {!isInputVisible ? (
            <div className="opacity-100 transform transition-all duration-300 ease-in-out">
              <button
                className="cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
                onClick={handleButtonClick}
              >
                <Image className="dark:invert" src="/vercel.svg" alt="Vercel logomark" width={20} height={20} />
                Start Analysing
              </button>
            </div>
          ) : (
            <div className="opacity-100 transform transition-all duration-300 ease-in-out w-full">
              <div className="flex flex-col gap-4 w-full">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter your text to analyze"
                  className="w-full min-h-[250px] p-4 rounded-lg border border-solid border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-foreground resize-y transition-all duration-200"
                  autoFocus
                />
                <button
                  className="cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-6 self-end"
                  onClick={handleSubmit}
                >
                  Analyze
                </button>
              </div>
            </div>
          )}
        </div>
        <div>
          {label && (
            <div className="mt-4 text-lg font-semibold">
              <p>Predicted label: {label}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
