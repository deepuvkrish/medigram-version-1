"use client";

import { useEffect, useState } from "react";
import { Clock9 } from "lucide-react";

type CountdownTimerProps = {
  submittedAt: string; // ISO date string from DB
};

export default function VerficationTimer({ submittedAt }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const submittedDate = new Date(submittedAt);

    // Add 48 hours
    const expiryDate = new Date(submittedDate.getTime() + 48 * 60 * 60 * 1000);

    const interval = setInterval(() => {
      const now = new Date().getTime();

      const difference = expiryDate.getTime() - now;

      if (difference <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}h : ${minutes
          .toString()
          .padStart(2, "0")}m : ${seconds.toString().padStart(2, "0")}s`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [submittedAt]);

  return (
    <div
      className="
        inline-flex
        items-center
        rounded-lg
        md:bg-amber-100
        bg-(--mobileDark)
        px-4
        py-2
        text-sm
        font-semibold
        text-(--cornBlue)
        md:text-amber-600
      "
    >
      <Clock9 className="w-4 h-4 mr-1" /> {timeLeft}
    </div>
  );
}
