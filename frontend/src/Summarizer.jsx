import React, { useState } from "react";

function Summarizer({ bookText, setBookText, onSubmit }) {
  const [fileName, setFileName] = useState("");
  const [uploaded, setUploaded] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://aipublishing.onrender.com/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setUploaded(true);
        setBookText(data.text || "");
        alert(`File uploaded successfully: ${file.name}`);
      } else {
        alert("Upload failed: " + (data.error || "unknown error"));
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  }

  return (
    <section className="section">
      <div className="row">
        <label className="label">Book Upload (PDF or TXT)</label>
        <input
          type="file"
          accept=".pdf,.txt"
          className="file"
          onChange={handleFile}
          disabled={uploaded}
        />
        {fileName && (
          <span className="muted small">
            {uploaded ? `Loaded: ${fileName}` : `Preparing: ${fileName}`}
          </span>
        )}
      </div>

      <div className="row">
        <label className="label">Extracted book text</label>
        <textarea
          className="text"
          rows={10}
          value={bookText}
          onChange={(e) => setBookText(e.target.value)}
          placeholder="Upload a file or paste your book text here..."
        />
      </div>

      <div className="right">
        <button className="btn primary" onClick={onSubmit} disabled={!uploaded}>
          Summarize
        </button>
      </div>
    </section>
  );
}

export default Summarizer;
