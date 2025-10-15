import React, { useState } from "react";
import Summarizer from "./Summarizer";
import AuthorReflection from "./AuthorReflection";
import MarketingAnalysis from "./MarketingAnalysis";
import Response from "./Response";
import ConversationHistory from "./ConversationHistory";
import "./App.css";

function App() {
  const TABS = ["Summarizer", "Author Reflection", "Marketing Analysis"];
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [bookText, setBookText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  async function summarizeButtonClicked(userPrompt) {
    if (!userPrompt?.trim()) return;

    setLoading(true);
    setError("");
    setOut("");

    try {
      const text = await callGemini(userPrompt.trim());
      setOut(text);
      setHistory((prev) => [
        ...prev,
        { prompt: userPrompt.trim(), response: text },
      ]);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function callGemini(prompt) {
    const res = await fetch("https://aipublishing.onrender.com/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data?.text || "No response";
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>AI Publishing Tool</h1>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab ${activeTab === t ? "active" : ""}`}
            onClick={() => {
              setActiveTab(t);
              setOut("");
              setError("");
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="panel">
        {activeTab === "Summarizer" && (
          <Summarizer
            bookText={bookText}
            setBookText={setBookText}
            onSubmit={() =>
              summarizeButtonClicked(
                "Summarize this book clearly with main characters, themes, and key plot beats. Return a short overview and 5 bullets of pivotal scenes."
              )
            }
          />
        )}

        {activeTab === "Author Reflection" && (
          <AuthorReflection
            bookText={bookText}
            prompt={prompt}
            setPrompt={setPrompt}
            onRun={summarizeButtonClicked}
          />
        )}

        {activeTab === "Marketing Analysis" && (
          <MarketingAnalysis bookText={bookText} onRun={summarizeButtonClicked} />
        )}

        <Response loading={loading} error={error} out={out} />
      </main>

      <ConversationHistory history={history} />
    </div>
  );
}

export default App;
