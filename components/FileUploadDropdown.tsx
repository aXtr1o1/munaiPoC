"use client";

import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SparklesCore } from "@/components/ui/sparkles";
import { motion } from "framer-motion";

type FileUploadDropdownProps = {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
};

export default function FileUploadDropdown({ onFileSelect, isUploading }: FileUploadDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={isUploading}
          className="relative overflow-hidden group rounded-full bg-black/20 backdrop-blur-md border border-white/10"
        >
          <motion.div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={100}
              className="w-full h-full"
              particleColor="#fff"
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 17,
              rotate: { duration: 0.5 } 
            }}
          >
            {isUploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </motion.div>
            ) : (
              <Upload className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
            )}
          </motion.div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="z-50 min-w-[8rem] bg-black/50 backdrop-blur-md border border-white/10 rounded-lg p-2 shadow-xl animate-in fade-in-80 zoom-in-95"
        align="end"
        sideOffset={8}
      >
        {["script", "report"].map((type) => (
          <div key={type} className="relative">
            <input
              type="file"
              id={`${type}-upload`}
              accept=".txt"
              onChange={onFileSelect}
              className="hidden"
            />
            <DropdownMenuItem asChild>
              <label
                htmlFor={`${type}-upload`}
                className="relative flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-white/90 hover:text-white hover:bg-white/10 focus:bg-white/10 transition-colors"
              >
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload {type === "script" ? "Movie Script" : "Report File"}
                </motion.div>
              </label>
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 