import React, { useState } from "react";

function MarketingAnalysis({ bookText, onRun }) {
    const [genre, setGenre] = useState("");
    const [audience, setAudience] = useState("");
    const [vibe, setVibe] = useState("");

    function buildPrompt() {
        return [
            "Provide a concise marketing analysis for this book.",
            genre && `Genre: ${genre}`,
            audience && `Target audience: ${audience}`,
            vibe && `Tone/vibes: ${vibe}`,
            "Return: 1) Hook/logline 2) 3 audience personas 3) 5 marketing angles 4) Comparable titles.",
        ]
            .filter(Boolean)
            .join("\n");
    }

    const disabled = !bookText.trim();

    return (
        <section className="section">
            <div className="grid">
                <div className="row">
                    <label className="label">Genre</label>
                    <input
                        className="input"
                        placeholder="ex: Fantasy"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                    />
                </div>
                <div className="row">
                    <label className="label">Target audience</label>
                    <input
                        className="input"
                        placeholder="ex: Young adults"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                    />
                </div>
                <div className="row">
                    <label className="label">Tone / vibes</label>
                    <input
                        className="input"
                        placeholder="ex: Romance"
                        value={vibe}
                        onChange={(e) => setVibe(e.target.value)}
                    />
                </div>
            </div>

            <div className="right">
                <button className="btn" onClick={() => onRun(buildPrompt())} disabled={disabled}>
                    Generate Marketing Plan
                </button>
            </div>

            {disabled && (
                <span className="muted small">Upload a book in the Summarizer tab to enable this.</span>
            )}
        </section>
    );
}

export default MarketingAnalysis;