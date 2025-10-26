"use client"
import Link from "next/link";
 import {Button} from "@/components/ui/button"
import { useRouter } from "next/navigation";
export default async function Home() {
  const router = useRouter();
   
  return (
    
     router.push('/dashboard')
     
  )
}
       
