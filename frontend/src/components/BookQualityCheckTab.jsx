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

function BookQualityCheckTab({ onResponsesUpdate }) {
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

    const finalPrompt = `
You are a professional publishing evaluator. 
Assess the manuscript objectively as a commercial product.

Task: ${prompts[index] || topicPrompt}

Response style: ${
      depth === "quick"
        ? "Provide a concise 3–5 sentence quality summary."
        : "Provide a structured, detailed evaluation with headings and bullet points. Maintain a neutral, professional tone."
    }
    `.trim();

    try {
      const res = await fetch("https://aipublishing.onrender.com/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Book quality check failed");

      const updated = { ...responses, [index]: data.text };
      setResponses(updated);

      // Notify parent
      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }

      // Auto-expand section
      setOpenSections((prev) => ({ ...prev, [index]: true }));
    } catch (err) {
      console.error(err);

      const updated = {
        ...responses,
        [index]:
          "⚠️ Error generating analysis. Please check your connection.",
      };

      setResponses(updated);

      if (typeof onResponsesUpdate === "function") {
        onResponsesUpdate(updated);
      }
    } finally {
      setLoadingState((prev) => ({ ...prev, [index]: null }));
    }
  };

  const toggleSection = (i) =>
    setOpenSections((prev) => ({ ...prev, [i]: !prev[i] }));

  const toggleEditPrompt = (i) =>
    setEditPromptOpen((prev) => ({ ...prev, [i]: !prev[i] }));

  // -------------------------
  // Book Quality Check Sections
  // -------------------------
  const sections = [
    {
      title: "1. Recommended Word Count & Page Length",
      description:
        "Evaluates whether the manuscript's projected length aligns with industry expectations for its genre.",
      prompt:
        "Estimate the manuscript’s approximate word count and page count based on content. Compare the length to industry standards for its genre.",
    },
    {
      title: "2. Language & Readability Level",
      description:
        "Assesses clarity, sentence structure, and reading level appropriateness.",
      prompt:
        "Analyze the manuscript’s readability level and language complexity. Comment on clarity, sentence flow, and audience suitability.",
    },
    {
      title: "3. Genre Alignment & Conventions",
      description:
        "Checks whether tone, themes, pacing, and structure match reader expectations for this genre.",
      prompt:
        "Evaluate how well the manuscript follows genre conventions. Discuss tone, structure, pacing, POV, and thematic alignment.",
    },
    {
      title: "4. Audience Appeal",
      description:
        "Considers whether the style, character depth, pacing, and themes appeal to the target demographic.",
      prompt:
        "Assesses how appealing the manuscript is to its intended audience based on writing style, themes, pacing, and emotional tone.",
    },
    {
      title: "5. Product Strength: Structure, Cohesion, and Flow",
      description:
        "Looks at the book as a commercial product—how cleanly it reads, whether chapters flow, and how strong the overall structure is.",
      prompt:
        "Evaluate the manuscript as a commercial product. Discuss story cohesion, pacing balance, chapter flow, structural clarity, and consistency.",
    },
  ];

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">📘 Book Quality Check</h2>

      {sections.map((section, index) => (
        <Card key={index} className="mb-4 shadow-sm">
          <Card.Body>
            {/* Title & Edit Button */}
            <Row className="align-items-center mb-2">
              <Col className="flex-grow-1">
                <Card.Title className="fw-bold mb-0">
                  {section.title}
                </Card.Title>
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

            <Card.Text className="text-muted">
              {section.description}
            </Card.Text>

            {/* Editable Prompt Box */}
            <Collapse in={editPromptOpen[index]}>
              <div className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Prompt being sent:
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={prompts[index] ?? section.prompt}
                    onChange={(e) =>
                      handlePromptChange(index, e.target.value)
                    }
                  />
                </Form.Group>
              </div>
            </Collapse>

            {/* Buttons */}
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Button
                variant="outline-success"
                disabled={!!loadingState[index]}
                onClick={() =>
                  handleFeedback(index, section.prompt, "quick")
                }
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
                onClick={() =>
                  handleFeedback(index, section.prompt, "in-depth")
                }
              >
                {loadingState[index] === "in-depth" ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "In-Depth Analysis"
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

export default BookQualityCheckTab;
