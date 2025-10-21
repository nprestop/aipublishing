import React, { useState } from "react";
import { Container, Navbar, Nav, Tab, Row, Col, Card } from "react-bootstrap";
import Summarizer from "./Summarizer";
import AuthorReflection from "./AuthorReflection";
import MarketingAnalysis from "./MarketingAnalysis";
import Response from "./Response";
import ConversationHistory from "./ConversationHistory";
import "bootstrap/dist/css/bootstrap.min.css";
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
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data?.text || "No response";
  }

  return (
    <Container fluid className="p-0">
      {/* ===== Header / Navbar ===== */}
      <Navbar bg="dark" variant="dark" expand="lg" className="px-4 mb-3">
        <Navbar.Brand className="fs-4 fw-semibold text-light">
          AI Publishing Tool
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-tabs" />
        <Navbar.Collapse id="main-tabs">
          <Nav
            activeKey={activeTab}
            onSelect={(t) => {
              setActiveTab(t);
              setOut("");
              setError("");
            }}
            className="ms-auto"
          >
            {TABS.map((t) => (
              <Nav.Item key={t}>
                <Nav.Link
                  eventKey={t}
                  className={`px-3 ${activeTab === t ? "fw-bold" : ""}`}
                >
                  {t}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* ===== Main Content ===== */}
      <Container>
        <Row>
          <Col xs={12}>
            <Card className="shadow-sm border-0 mb-4 p-4 w-100">
              <Tab.Container activeKey={activeTab}>
                <Tab.Content>
                  <Tab.Pane eventKey="Summarizer">
                    <Summarizer
                      bookText={bookText}
                      setBookText={setBookText}
                      onSubmit={() =>
                        summarizeButtonClicked(
                          "Summarize this book clearly with main characters, themes, and key plot beats. Return a short overview and 5 bullets of pivotal scenes."
                        )
                      }
                    />
                  </Tab.Pane>

                  <Tab.Pane eventKey="Author Reflection">
                    <AuthorReflection
                      bookText={bookText}
                      prompt={prompt}
                      setPrompt={setPrompt}
                      onRun={summarizeButtonClicked}
                    />
                  </Tab.Pane>

                  <Tab.Pane eventKey="Marketing Analysis">
                    <MarketingAnalysis
                      bookText={bookText}
                      onRun={summarizeButtonClicked}
                    />
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card>

            {/* Response Section */}
            <Card className="shadow-sm border-0 mb-4 p-4 bg-light">
              <Response loading={loading} error={error} out={out} />
            </Card>

            {/* Conversation History */}
            <Card className="shadow-sm border-0 p-4 bg-white mb-5">
              <h5 className="mb-3 text-secondary">Conversation History</h5>
              <ConversationHistory history={history} />
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

export default App;
