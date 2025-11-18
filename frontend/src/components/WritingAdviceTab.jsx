import React, { useState } from "react";
import {
  Card,
  Button,
  Collapse,
  Spinner,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import API_BASE from "../config";

function WritingAdviceTab({ onResponsesUpdate }) {
  const [loadingState, setLoadingState] = useState({});
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
You are a professional writing coach and editor. 
Use a direct, objective, and constructive tone — avoid exaggerated praise or emotional language.
Base your feedback strictly on the uploaded manuscript.

Task: ${prompts[key] || topicPrompt}

Requested response style:
${
  depth === "quick"
    ? "Provide a concise, 3–5 sentence editorial summary."
    : "Provide a detailed, structured editorial analysis with strengths, weaknesses, and specific recommendations."
}
Avoid dramatic or overly personal language. Maintain a confident, neutral editorial voice.
    `.trim();

    try {
      const res = await fetch(`${API_BASE}/api/gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: personalizedPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get AI response");

      // SAFE: Update local state FIRST
      const updated = { ...responses, [key]: data.text };
      setResponses(updated);

      // SAFE: Only notify parent AFTER updating state
      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }

      setOpenSections((prev) => ({ ...prev, [key]: true }));
    } catch (error) {
      setResponses((prev) => ({
        ...prev,
        [key]:
          "⚠️ Connection error. Please check your network or backend connection.",
      }));
    } finally {
      setLoadingState((prev) => ({ ...prev, [key]: null }));
    }
  };

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleEditPrompt = (key) =>
    setEditPromptOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const levels = [
    {
      key: "level1",
      title: "Level 1: Basic Writing Skills",
      desc: "Looks at your clarity, sentence flow, grammar, punctuation, and overall readability.",
      prompt:
        "Review the manuscript for clarity, sentence flow, grammar, punctuation, and readability. Identify areas needing improvement and offer direct, constructive guidance.",
    },
    {
      key: "level2",
      title: "Level 2: Story Structure & Characters",
      desc: "Evaluates your pacing, transitions, dialogue, plot flow, and character development.",
      prompt:
        "Evaluate the structure of your story, including pacing, transitions, dialogue, and character development. Highlight strengths and offer specific suggestions for improving plot momentum or character clarity.",
    },
    {
      key: "level3",
      title: "Level 3: Themes & Philosophy",
      desc: "Analyzes the deeper meaning, themes, symbolism, and emotional tone in your manuscript.",
      prompt:
        "Analyze the themes, symbolism, emotional tone, and deeper meaning within your manuscript. Explain what readers may take away and suggest ways to strengthen thematic clarity.",
    },
    {
      key: "enjoyment",
      title: "Reader Enjoyment",
      desc: "Assesses your tone, rhythm, emotional impact, and overall reader engagement.",
      prompt:
        "Evaluate how engaging and immersive the manuscript is. Assess tone, rhythm, atmosphere, emotional impact, and flow. Offer constructive advice for improving engagement.",
    },
  ];

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">✍️ Writing Advice & Feedback</h2>

      {levels.map((lvl) => (
        <Card key={lvl.key} className="mb-4 shadow-sm">
          <Card.Body>
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
                    onChange={(e) => handlePromptChange(lvl.key, e.target.value)}
                  />
                </Form.Group>
              </div>
            </Collapse>

            <div className="d-flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline-success"
                disabled={!!loadingState[lvl.key]}
                onClick={() => handleFeedback(lvl.key, lvl.prompt, "quick")}
              >
                {loadingState[lvl.key] === "quick" ? (
                  <Spinner animation="border" size="sm" />
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
                  <Spinner animation="border" size="sm" />
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
