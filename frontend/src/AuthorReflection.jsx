import React from "react";

function AuthorReflection({ bookText, prompt, setPrompt, onRun }) {
  const REFLECTION_PROMPTS = [
    "What themes emerge most strongly in my book?",
    "How do my characters align with reader expectations for this genre?",
    "Where does the pacing feel slow or too fast?",
    "What scenes are most emotionally impactful and why?",
    "What’s a compelling logline/blurb for this story?",
  ];

  function handlePrePromptClick(p) {
    setPrompt(p);
  }

  return (
    <section className="section">
      <div className="row">
        <label className="label">Pre-generated prompts</label>
        <div className="chips">
          {REFLECTION_PROMPTS.map((p) => (
            <button
              key={p}
              className="chip"
              onClick={() => handlePrePromptClick(p)}
              title="Click to load this prompt"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <label className="label">Custom prompt</label>
        <textarea
          className="text"
          rows={6}
          placeholder="Write your own question here…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="right">
        <button className="btn" onClick={() => onRun(prompt)} disabled={!prompt.trim()}>
          Ask
        </button>
      </div>
    </section>
  );
}

export default AuthorReflection;
