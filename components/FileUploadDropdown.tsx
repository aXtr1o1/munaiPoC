"use client";

import { Upload, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

type FileUploadProps = {
  onFileSelect: (file: File, fileType: "movieScript" | "readerReport") => void;
  fileType: "movieScript" | "readerReport";
};

export default function FileUpload({ onFileSelect, fileType }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".txt")) {
      alert("Only .txt files are allowed.");
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      setFileName(file.name);
      onFileSelect(file, fileType);
      setIsUploading(false);
    }, 500);
  };

  return (
    <div className="relative">
      <input type="file" id={fileType} accept=".txt" onChange={handleChange} className="hidden" />
      <Button asChild className="bg-gray-800 text-white p-2 rounded-md">
        <label htmlFor={fileType} className="cursor-pointer flex items-center gap-2">
          {isUploading ? <Loader2 className="animate-spin w-5 h-5 text-white" /> : <Upload className="w-5 h-5 text-white" />}
          <span>{fileName || `Upload ${fileType === "movieScript" ? "Movie Script" : "Reader Report"}`}</span>
        </label>
      </Button>
    </div>
  );
}
