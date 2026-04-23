"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// redirect to /admin
export default function Home() {

  const router = useRouter();

  useEffect(() => {
    router.push("/admin");
  }, [router])

  return (
    <></>
  );
}