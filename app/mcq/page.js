"use client";

import { useState } from "react";

export default function Home() {
  const [jd, setJd] = useState("");
  const [numQuestions, setNumQuestions] = useState(3);
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!jd) return setError("Paste the job description first!");
    setError("");
    setLoading(true);
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setScore(0);
    setSelected(null);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: jd,
          numQuestions,
          difficulty
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("API error", data);
        setError(data?.error || "Server error");
        setLoading(false);
        return;
      }

      if (!data.questions || data.questions.length === 0) {
        setError("No questions returned. Try a longer or clearer JD.");
        setLoading(false);
        return;
      }

      setQuestions(data.questions);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!selected) return alert("Select an option.");

    const correct = selected === questions[current].answer;
    if (correct) setScore((s) => s + 1);

    setAnswers((prev) => [
      ...prev,
      { ...questions[current], selected, correct },
    ]);

    setSelected(null);
    setCurrent((c) => c + 1);
  };

  const handleRestart = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setJd("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex justify-center items-start">
      <div className="w-full max-w-3xl bg-black text-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">AI MCQ Test Generator</h1>

        {/* Inputs before test */}
        {questions.length === 0 && (
          <>
            <textarea
              className="w-full p-3 border rounded-lg mb-4 resize-none focus:outline-indigo-400"
              rows={6}
              placeholder="Paste Job Description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />

            <div className="flex gap-4 mb-4">
              <input
                type="number"
                min={1}
                max={20}
                className="w-1/2 p-2 border rounded-lg focus:outline-indigo-400"
                placeholder="Number of questions"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              />
              <select
                className="w-1/2 p-2 border rounded-lg focus:outline-indigo-400"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="flex justify-center items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                {loading ? "Generating..." : "Generate Questions"}
              </button>
              {error && <span className="text-red-600">{error}</span>}
            </div>
          </>
        )}

        {/* Questions */}
        {questions.length > 0 && current < questions.length && (
          <div className="mt-6 bg-black text-white p-6 rounded-xl shadow">
            <div className="text-lg font-semibold mb-4">
              Q{current + 1}. {questions[current].question}
            </div>

            <div className="flex flex-col gap-3">
              {Object.entries(questions[current].options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full text-left p-3 rounded-lg border font-medium transition ${
                    selected === key
                      ? "bg-indigo-600 text-black border-indigo-700"
                      : "bg-black hover:bg-blue-600"
                  }`}
                >
                  {key}: {value}
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Review / final result */}
        {questions.length > 0 && current >= questions.length && (
          <div className="mt-6 p-6 bg-indigo-50 rounded-xl shadow flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-indigo-700">Test Complete! Score: {score}/{questions.length}</h2>

            <div className="flex flex-col gap-4">
              {answers.map((q, i) => (
                <div key={i} className="p-4 bg-indigo-100 text-black rounded-lg shadow">
                  <div className="font-semibold mb-2">
                    Q{i + 1}. {q.question}
                  </div>
                  <div className="flex flex-col gap-2">
                    {Object.entries(q.options).map(([key, value]) => {
                      const isSelected = key === q.selected;
                      const isCorrect = key === q.answer;
                      let bg = "bg-white";

                      if (isCorrect) bg = "bg-green-200";
                      if (isSelected && !q.correct) bg = "bg-red-300";

                      return (
                        <div
                          key={key}
                          className={`p-2 rounded-lg border ${bg} font-medium`}
                        >
                          {key}: {value}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleRestart}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition self-center"
            >
              Restart Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
