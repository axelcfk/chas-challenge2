"use client";
import { useRouter } from "next/navigation";

const BackButton = () => {
  function handleBack() {}

  const router = useRouter();
  return (
    <div>
      <button
        className="bg-slate-400 rounded-full text-black text-lg mt-5 px-4 py-3 cursor-pointer"
        onClick={handleBack}
      >
        🔙
      </button>
    </div>
  );
};

export default BackButton;
