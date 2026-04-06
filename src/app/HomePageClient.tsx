"use client";

import dynamic from "next/dynamic";

const HomePage = dynamic(() => import("@/src/views/home/HomePage").then((m) => m.HomePage), {
  ssr: false,
});

export function HomePageClient() {
  return <HomePage />;
}

