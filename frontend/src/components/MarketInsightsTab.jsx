import React, { useState } from "react";
import {
  Container,
  Card,
  Button,
  Spinner,
  Form,
  Collapse,
  Row,
  Col,
} from "react-bootstrap";

function MarketInsightsTab({ onResponsesUpdate }) {
  const [loadingState, setLoadingState] = useState({});
  const [responses, setResponses] = useState({});
  const [prompts, setPrompts] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [editPromptOpen, setEditPromptOpen] = useState({});

  const handlePromptChange = (index, value) => {
    setPrompts((prev) => ({ ...prev, [index]: value }));
  };

  const handleFeedback = async (index, topicPrompt, depth = "quick") => {
    setLoadingState((prev) => ({ ...prev, [index]: depth }));
    setResponses((prev) => ({ ...prev, [index]: "" }));

    const personalizedPrompt = `
You are an analytical publishing-market consultant. 
Base your analysis ONLY on the uploaded manuscript.

Task: ${prompts[index] || topicPrompt}

Response style: ${
      depth === "quick"
        ? "Provide a concise 3–5 sentence market insight summary."
        : "Provide a detailed, structured market analysis using headings and bullet points. Keep the tone professional and neutral."
    }
`.trim();

    try {
      const res = await fetch("https://aipublishing.onrender.com/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: personalizedPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Market insights request failed.");

      // Update internal responses
      const updated = { ...responses, [index]: data.text };
      setResponses(updated);

      // Notify parent (safe)
      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }

      // Auto-expand
      setOpenSections((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      console.error(err);
      const updated = {
        ...responses,
        [index]:
          "⚠️ Error generating insights. Please check your connection or API key.",
      };
      setResponses(updated);

      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }
    } finally {
      setLoadingState((prev) => ({ ...prev, [index]: null }));
    }
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleEditPrompt = (index) => {
    setEditPromptOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Sections for Market Insights
  const sections = [
    {
      title: "1. Target Audience Analysis",
      description:
        "Identify who your most likely readers are and how their preferences shape market performance.",
      prompt:
        "Analyze the manuscript's target audience, including demographics, reading behaviors, and motivation for this genre.",
    },
    {
      title: "2. Genre Trends & Market Fit",
      description:
        "See how your book aligns with current publishing trends for its category.",
      prompt:
        "Evaluate how this manuscript fits into current genre and subgenre trends. Discuss market momentum, rising themes, and commercial opportunities.",
    },
    {
      title: "3. Competitor & Comparable Titles",
      description:
        "Understand what similar books are succeeding—and how yours compares.",
      prompt:
        "Identify comparable titles (comps) for this manuscript and analyze how its tone, themes, and structure compare to successful books.",
    },
    {
      title: "4. Positioning & Unique Selling Points",
      description:
        "Assess what makes your book distinct and how it stands out in the market.",
      prompt:
        "Determine the manuscript's unique selling points (USPs). Explain how its voice, themes, and narrative elements contribute to market positioning.",
    },
    {
      title: "5. Commercial Potential Forecast",
      description:
        "Get a data-informed projection of how the manuscript could perform commercially.",
      prompt:
        "Provide a commercial potential forecast for this manuscript based on genre trends, audience demand, and comp performance.",
    },
  ];

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">📊 Market Insights</h2>

      {sections.map((section, index) => (
        <Card key={index} className="mb-4 shadow-sm">
          <Card.Body>
            {/* Title + Edit Button */}
            <Row className="align-items-center mb-2">
              <Col className="flex-grow-1">
                <Card.Title className="fw-bold mb-0">{section.title}</Card.Title>
              </Col>
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => toggleEditPrompt(index)}
                >
                  {editPromptOpen[index] ? "Done" : "✏️ Edit Prompt"}
                </Button>
              </Col>
            </Row>

            <Card.Text className="text-muted">{section.description}</Card.Text>

            {/* Prompt Editor */}
            <Collapse in={editPromptOpen[index]}>
              <div className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold">Prompt being sent:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={prompts[index] ?? section.prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                  />
                </Form.Group>
              </div>
            </Collapse>

            {/* Buttons */}
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline-success"
                disabled={!!loadingState[index]}
                onClick={() => handleFeedback(index, section.prompt, "quick")}
              >
                {loadingState[index] === "quick" ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Quick Summary"
                )}
              </Button>

              <Button
                variant="outline-primary"
                disabled={!!loadingState[index]}
                onClick={() => handleFeedback(index, section.prompt, "in-depth")}
              >
                {loadingState[index] === "in-depth" ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "In-Depth Insights"
                )}
              </Button>

              {responses[index] && (
                <Button
                  variant="outline-secondary"
                  onClick={() => toggleSection(index)}
                >
                  {openSections[index] ? "▲ Minimize" : "▼ Expand"}
                </Button>
              )}
            </div>

            {/* AI Response */}
            <Collapse in={openSections[index]}>
              <div
                className="mt-3 p-3 bg-light border rounded"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {responses[index] || ""}
              </div>
            </Collapse>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default MarketInsightsTab;
