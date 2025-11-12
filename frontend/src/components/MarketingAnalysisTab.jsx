import React, { useState } from "react";
import { Container, Card, Button, Spinner, Form, Collapse, Row, Col } from "react-bootstrap";

function MarketingAnalysisTab() {
  const [loadingState, setLoadingState] = useState({}); // holds { [index]: "quick" | "in-depth" | null }
  const [responses, setResponses] = useState({});
  const [prompts, setPrompts] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [editPromptOpen, setEditPromptOpen] = useState({});

  const handlePromptChange = (index, value) => {
    setPrompts((prev) => ({ ...prev, [index]: value }));
  };

  const handleFeedback = async (index, topicPrompt, depth = "quick") => {
    // set specific loading type for this section
    setLoadingState((prev) => ({ ...prev, [index]: depth }));
    setResponses((prev) => ({ ...prev, [index]: "" }));

    const personalizedPrompt = `
You are a friendly, professional book marketing consultant.
Speak directly to the author as "you", offering warm but expert advice.
Base your analysis on the uploaded manuscript text.

Task: ${prompts[index] || topicPrompt}
Response type: ${
      depth === "quick"
        ? "Provide a short summary (3–5 sentences)."
        : "Provide a detailed, structured, in-depth response with clear headings and bullet points."
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

      setResponses((prev) => ({ ...prev, [index]: data.text }));
      setOpenSections((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      console.error(err);
      setResponses((prev) => ({
        ...prev,
        [index]:
          "❌ Error generating marketing analysis. Please check your connection or API key.",
      }));
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

  const sections = [
    {
      title: "1. General Marketing Advice",
      description:
        "Broad strategies and best practices to help you promote and position your book successfully.",
      prompt:
        "Provide general marketing advice tailored to this manuscript. Include actionable steps an author can take to promote their book effectively.",
    },
    {
      title: "2. Target Audience",
      description:
        "Identifies who your ideal readers are and how you can reach them through online or offline channels.",
      prompt:
        "Identify the most relevant target audience for this manuscript and suggest specific ways to reach them.",
    },
    {
      title: "3. Market Trends & Positioning",
      description:
        "Analyzes how your book fits into the current publishing market.",
      prompt:
        "Analyze how this manuscript fits into the current book market for its genre. Include any trends or unique selling points that could improve visibility.",
    },
    {
      title: "4. Promotion Channels",
      description:
        "Recommends the best online and offline platforms for book promotion.",
      prompt:
        "Recommend the best platforms, communities, or promotional channels for the author to focus on when marketing this book.",
    },
    {
      title: "5. Competitor Comparison",
      description:
        "Examines similar successful books and marketing approaches to inspire your strategy.",
      prompt:
        "Compare this manuscript to similar successful books and analyze what marketing strategies they used that could be applied here.",
    },
  ];

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">
        📊 Marketing Analysis & Recommendations
      </h2>

      {sections.map((section, index) => (
        <Card key={index} className="mb-4 shadow-sm">
          <Card.Body>
            {/* Header row with title + edit button */}
            <Row className="align-items-center mb-2">
              <Col xs="auto" className="flex-grow-1">
                <Card.Title className="fw-bold mb-0">{section.title}</Card.Title>
              </Col>
              <Col xs="auto">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => toggleEditPrompt(index)}
                >
                  {editPromptOpen[index] ? "Done Editing" : "✏️ Edit Prompt"}
                </Button>
              </Col>
            </Row>

            <Card.Text className="text-muted mb-2">{section.description}</Card.Text>

            {/* Collapsible editable prompt box */}
            <Collapse in={editPromptOpen[index]}>
              <div className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold text-secondary">
                    Prompt being sent:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={prompts[index] ?? section.prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                  />
                </Form.Group>
              </div>
            </Collapse>

            {/* Action buttons */}
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline-success"
                disabled={!!loadingState[index]}
                onClick={() => handleFeedback(index, section.prompt, "quick")}
              >
                {loadingState[index] === "quick" ? (
                  <Spinner as="span" animation="border" size="sm" />
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
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  "In-Depth Response"
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

            {/* Collapsible AI Response */}
            <Collapse in={openSections[index]}>
              <div
                className="mt-3 p-3 border rounded bg-light"
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

export default MarketingAnalysisTab;
