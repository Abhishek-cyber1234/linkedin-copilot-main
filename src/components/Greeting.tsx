"use client";

import { useEffect, useState } from "react";

// Rendered on the client so the greeting follows the visitor's clock, not the server's.
export function Greeting() {
  const [text, setText] = useState("Hello.");
  useEffect(() => {
    const h = new Date().getHours();
    setText(h < 12 ? "Good morning." : h < 18 ? "Good afternoon." : "Good evening.");
  }, []);
  return <>{text}</>;
}
