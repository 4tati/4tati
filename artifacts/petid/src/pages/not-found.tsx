import { Link } from "wouter";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 text-center space-y-8 bg-background relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-card border border-border shadow-xl rounded-full flex items-center justify-center relative z-10">
         <Search className="w-10 h-10 text-muted-foreground" />
      </motion.div>
      
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3 max-w-sm relative z-10">
        <h1 className="text-4xl font-serif font-extrabold text-foreground tracking-tight">404</h1>
        <p className="text-lg text-muted-foreground font-medium">We couldn't find the page you were looking for.</p>
      </motion.div>
      
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="relative z-10">
        <Link href="/">
          <Button className="h-14 px-8 rounded-[20px] text-lg font-bold shadow-lg">Go Home</Button>
        </Link>
      </motion.div>
    </div>
  );
}