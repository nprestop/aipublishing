import React, { useState } from "react";
import { Card, Button, Collapse, Spinner, Form, Container, Row, Col } from "react-bootstrap";

function WritingAdviceTab() {
  const [loadingState, setLoadingState] = useState({}); // { [key]: "quick" | "in-depth" | null }
  const [responses, setResponses] = useState({});
  const [prompts, setPrompts] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [editPromptOpen, setEditPromptOpen] = useState({});

  const handlePromptChange = (key, value) => {
    setPrompts((prev) => ({ ...prev, [key]: value }));
  };

  const handleFeedback = async (key, topicPrompt, depth = "quick") => {
    setLoadingState((prev) => ({ ...prev, [key]: depth }));
    setResponses((prev) => ({ ...prev, [key]: "" }));

    const personalizedPrompt = `
You are a friendly, professional writing coach speaking directly to the author.
Provide feedback with warmth, encouragement, and clear, actionable advice.
Base your analysis on the uploaded manuscript text.

Task: ${prompts[key] || topicPrompt}
Response type: ${
      depth === "quick"
        ? "Provide a short summary (3–5 sentences)."
        : "Provide a detailed, structured response with examples and specific feedback."
    }
    `.trim();

    try {
      const res = await fetch("http://localhost:3000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: personalizedPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get AI response");

      setResponses((prev) => ({ ...prev, [key]: data.text }));
      setOpenSections((prev) => ({ ...prev, [key]: true }));
    } catch (error) {
      console.error(error);
      setResponses((prev) => ({
        ...prev,
        [key]: "⚠️ Connection error. Ensure the backend is running on port 3000.",
      }));
    } finally {
      setLoadingState((prev) => ({ ...prev, [key]: null }));
    }
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleEditPrompt = (key) => {
    setEditPromptOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const levels = [
    {
      key: "level1",
      title: "Level 1: Basic Writing Skills",
      desc: "Focuses on spelling, grammar, punctuation, and sentence clarity.",
      prompt:
        "Analyze this manuscript for grammar, spelling, punctuation, and readability issues. Provide specific examples and corrections where possible.",
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

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">✍️ Writing Advice & Feedback</h2>

      {levels.map((lvl) => (
        <Card key={lvl.key} className="mb-4 shadow-sm">
          <Card.Body>
            {/* Header row: title + edit button */}
            <Row className="align-items-center mb-2">
              <Col xs="auto" className="flex-grow-1">
                <Card.Title className="fw-bold mb-0">{lvl.title}</Card.Title>
              </Col>
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => toggleEditPrompt(lvl.key)}
                >
                  {editPromptOpen[lvl.key] ? "Done Editing" : "✏️ Edit Prompt"}
                </Button>
              </Col>
            </Row>

            <Card.Text className="text-muted mb-2">{lvl.desc}</Card.Text>

            {/* Collapsible editable prompt box */}
            <Collapse in={editPromptOpen[lvl.key]}>
              <div className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">
                    Prompt being sent:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={prompts[lvl.key] ?? lvl.prompt}
                    onChange={(e) =>
                      handlePromptChange(lvl.key, e.target.value)
                    }
                  />
                </Form.Group>
              </div>
            </Collapse>

            {/* Action buttons */}
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline-success"
                disabled={!!loadingState[lvl.key]}
                onClick={() => handleFeedback(lvl.key, lvl.prompt, "quick")}
              >
                {loadingState[lvl.key] === "quick" ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "Quick Summary"
                )}
              </Button>

              <Button
                variant="outline-primary"
                disabled={!!loadingState[lvl.key]}
                onClick={() => handleFeedback(lvl.key, lvl.prompt, "in-depth")}
              >
                {loadingState[lvl.key] === "in-depth" ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "In-Depth Response"
                )}
              </Button>

              {responses[lvl.key] && (
                <Button
                  variant="outline-secondary"
                  onClick={() => toggleSection(lvl.key)}
                >
                  {openSections[lvl.key] ? "▲ Minimize" : "▼ Expand"}
                </Button>
              )}
            </div>

            {/* Collapsible AI Response */}
            <Collapse in={openSections[lvl.key]}>
              <div
                className="mt-3 p-3 border rounded bg-light"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {responses[lvl.key] || ""}
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default WritingAdviceTab;
