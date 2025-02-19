"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import FileUpload from "./FileUploadDropDown";
import ReactMarkdown from "react-markdown";  // Import Markdown renderer

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [movieScript, setMovieScript] = useState<File | null>(null);
  const [readerReport, setReaderReport] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (file: File, fileType: "movieScript" | "readerReport") => {
    if (fileType === "movieScript") setMovieScript(file);
    else setReaderReport(file);

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "system", content: `📂 **${file.name}** uploaded successfully.` },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (!movieScript || !readerReport) {
      alert("Please upload both the Movie Script and Reader Report.");
      return;
    }

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: input.trim() }]);
    setInput("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("movie_script", movieScript);
      formData.append("reader_report", readerReport);
      formData.append("query", input.trim());

      const response = await axios.post("http://localhost:5000/query", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: response.data.result }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "⚠️ Failed to get a response." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] relative">
      <div className="p-4 flex gap-2">
        <FileUpload onFileSelect={handleFileUpload} fileType="movieScript" />
        <FileUpload onFileSelect={handleFileUpload} fileType="readerReport" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            
            <div className={`p-3 rounded-lg max-w-[80%] leading-relaxed 
              ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-700 text-white"}`}>
              
              {message.role === "assistant" ? (
                <ReactMarkdown className="prose prose-invert">{message.content}</ReactMarkdown>
              ) : (
                <span>{message.content}</span>
              )}

            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Type your query..." className="flex-1 bg-gray-800 text-white border-gray-600 p-2 rounded-md"
            disabled={isLoading} />
          <motion.button type="submit" disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-500 rounded-md text-white disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
