"use client";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();
  return (
    <div>
      <button
        className="bg-slate-400 rounded-full text-black text-lg mt-5 px-4 py-3 cursor-pointer"
        onClick={router.back}
      >
        🔙
      </button>
    </div>
  );
};

export default BackButton;
