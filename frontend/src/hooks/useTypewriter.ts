import { useEffect, useState } from "react";

/** Types `text` out character-by-character. Resets when `text` changes. */
export function useTypewriter(text: string, speedMs = 12, startDelayMs = 300) {
  const [output, setOutput] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setOutput("");
    setDone(false);
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i += 1;
        setOutput(text.slice(0, i));
        if (i >= text.length) {
          if (interval) clearInterval(interval);
          setDone(true);
        }
      }, speedMs);
    }, startDelayMs);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speedMs, startDelayMs]);

  return { output, done };
}
