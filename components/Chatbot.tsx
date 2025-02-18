"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Bodoni_Moda } from "next/font/google";
import axios from "axios";

const bodoni = Bodoni_Moda({ subsets: ["latin"] });

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatbotProps = {
  channel: "startups" | "investors";
};

export default function Chatbot({ channel }: ChatbotProps) {
  console.log("Chatbot Channel Prop:", channel); // Debug log
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(`${channel}-messages`);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error(`Error parsing ${channel} messages:`, error);
        localStorage.removeItem(`${channel}-messages`);
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [channel]);

  useEffect(() => {
    localStorage.setItem(`${channel}-messages`, JSON.stringify(messages));
  }, [messages, channel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderMessageContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return content.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !file) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("csv_file", file);
      formData.append("channel", channel);
      formData.append("query", input.trim());

      const response = await axios.post("http://localhost:5000/query", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: response.data.result,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: "Failed to get a response from the server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setFile(uploadedFile);

      const systemMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: `CSV file "${uploadedFile.name}" has been uploaded. You can now ask questions about its contents.`,
      };

      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`rounded-2xl p-4 max-w-[70%] bg-black/20 border border-white/10`}>
                <p className="text-white/90 whitespace-pre-line">{renderMessageContent(message.content)}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-start"
            >
              <div className="rounded-2xl p-4 max-w-[70%] bg-black/20 border border-white/10">
                <Loader2 className="animate-spin w-6 h-6 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4">
        <div className="relative flex items-center gap-2">
          <input type="file" id="file-upload" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
          <motion.label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-5 h-5 text-white/70" />
          </motion.label>
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 text-white/90"
              disabled={isLoading}
            />
            <motion.button type="submit" disabled={isLoading || !input.trim()} className="relative">
              {isLoading ? (
                <Loader2 className="animate-spin w-5 h-5 text-white/70" />
              ) : (
                <Send className="w-5 h-5 text-white/70" />
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
