import React, { useState } from "react";
import { Card, Button, Collapse, Spinner } from "react-bootstrap";

function WritingAdviceTab() {
  const [openLevel, setOpenLevel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState({});

  // Each level sends a prompt describing what kind of feedback to generate
  const levels = [
    {
      key: "level1",
      title: "Level 1: Basic Writing Skills",
      desc: "Focuses on spelling, grammar, punctuation, and sentence clarity.",
      prompt:
        "Please analyze this manuscript for grammar, spelling, punctuation, and readability issues. Provide specific examples and corrections where possible.",
    },
    {
      key: "level2",
      title: "Level 2: Story Structure & Characters",
      desc: "Analyzes plot flow, pacing, dialogue, and character development.",
      prompt:
        "Analyze this manuscript’s story structure, pacing, and character arcs. Offer constructive feedback and identify key strengths and weaknesses.",
    },
    {
      key: "level3",
      title: "Level 3: Themes & Philosophy",
      desc: "Explores deeper ideas and emotional resonance.",
      prompt:
        "Discuss the manuscript’s deeper themes, symbolism, and emotional impact. What meaning or philosophy does the reader take away?",
    },
    {
      key: "enjoyment",
      title: "Reader Enjoyment",
      desc: "Evaluates tone, rhythm, and engagement.",
      prompt:
        "Evaluate how engaging and enjoyable this manuscript is to read. Comment on tone, rhythm, and reader immersion.",
    },
  ];

  const handleClick = async (key, prompt) => {
    if (openLevel === key) {
      setOpenLevel(null);
      return;
    }
    setOpenLevel(key);
    setLoading(true);

    try {
      // ✅ Your working Gemini endpoint
      const res = await fetch("http://localhost:3000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      // your original logic used "text" as the key in response
      setResponses((prev) => ({
        ...prev,
        [key]:
          data.text ||
          data.response ||
          "⚠️ No text returned from Gemini. Please verify your upload.",
      }));
    } catch (error) {
      console.error(error);
      setResponses((prev) => ({
        ...prev,
        [key]:
          "⚠️ Connection error. Ensure the backend is running on port 3000.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {levels.map((lvl) => (
        <Card key={lvl.key} className="mb-3 shadow-sm border-0">
          <Card.Body>
            <Card.Title className="text-primary fw-semibold">
              {lvl.title}
            </Card.Title>
            <Card.Text>{lvl.desc}</Card.Text>

            <Button
              variant="outline-primary"
              onClick={() => handleClick(lvl.key, lvl.prompt)}
              className="mt-2"
            >
              {openLevel === lvl.key ? "Hide Feedback" : "Get Feedback"}
            </Button>

            <Collapse in={openLevel === lvl.key}>
              <div className="mt-3">
                {loading ? (
                  <div className="text-center my-2">
                    <Spinner animation="border" size="sm" /> Fetching feedback…
                  </div>
                ) : (
                  <Card className="p-3 bg-light border-0">
                    <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                      {responses[lvl.key] || ""}
                    </pre>
                  </Card>
                )}
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

export default WritingAdviceTab;
