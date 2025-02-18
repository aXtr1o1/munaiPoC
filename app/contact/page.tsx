"use client";
import Chatbot from '@/components/Chatbot';

export default function ContactPage() {
  const channel = "contact"; // Hardcoded for now, make dynamic if needed
  console.log("Contact Page Channel:", channel); // Debug log
  return <Chatbot channel={channel} />;
}