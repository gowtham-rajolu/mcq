"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 via-pink-300 to-indigo-200 p-8">
      <div className="bg-white rounded-2xl shadow-xl p-12 flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold text-indigo-800">Welcome to Your Project</h1>
        <p className="text-gray-600 text-lg text-center">
          Choose one of the options below to proceed.
        </p>

        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Interview button */}
          <button
            onClick={() => window.location.href = "http://localhost:8501"}
            className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Interview
          </button>

          {/* MCQ button */}
          <button
            onClick={() => router.push("/mcq")}
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
          >
            MCQ Test
          </button>
        </div>
      </div>
    </div>
  );
}
