import { useEffect, useState } from "react";

// A confirmação fica à vista alguns segundos: no celular o cartão some de uma coluna e reaparece longe.
export function useFlashMessage(ms = 4000) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), ms);
    return () => clearTimeout(timer);
  }, [message, ms]);
  return [message, setMessage] as const;
}
