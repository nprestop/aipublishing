import React, { useState } from "react";
import { Container, Nav, Navbar, Tab, Tabs, Button } from "react-bootstrap";
import UploadTab from "./components/UploadTab";
import WritingAdviceTab from "./components/WritingAdviceTab";
import MarketingAnalysisTab from "./components/MarketingAnalysisTab";
import "./App.css";

function App() {
  const [key, setKey] = useState("upload");

  // These states will eventually hold responses from each tab if you want to merge them later
  const [writingResponses, setWritingResponses] = useState({});
  const [marketingResponses, setMarketingResponses] = useState({});

  // Placeholder for when you integrate actual response sharing
  const handleDownloadReport = () => {
    let reportText = "📖 Reader AI - Combined Report\n\n";

    // Combine Writing Advice responses
    if (Object.keys(writingResponses).length > 0) {
      reportText += "=== Writing Advice ===\n";
      for (const [key, value] of Object.entries(writingResponses)) {
        reportText += `\nSection ${key}:\n${value}\n`;
      }
      reportText += "\n";
    }

    // Combine Marketing Analysis responses
    if (Object.keys(marketingResponses).length > 0) {
      reportText += "=== Marketing Analysis ===\n";
      for (const [key, value] of Object.entries(marketingResponses)) {
        reportText += `\nSection ${key}:\n${value}\n`;
      }
    }

    if (
      Object.keys(writingResponses).length === 0 &&
      Object.keys(marketingResponses).length === 0
    ) {
      reportText += "(No responses available yet — generate some feedback first!)";
    }

    const blob = new Blob([reportText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ReaderAI_Report.txt";
    link.click();
  };

  return (
    <>
      {/* Header with title on left and download button on right */}
      <Navbar
        expand="lg"
        className="shadow-sm px-3"
        style={{
          background: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
        }}
      >
        <Container fluid className="d-flex justify-content-between align-items-center">
          <Navbar.Brand className="text-white fw-semibold fs-4 m-0">
            📖 Reader AI
          </Navbar.Brand>

          <Button
            variant="outline-light"
            className="fw-semibold"
            onClick={handleDownloadReport}
          >
            📄 Download Report
          </Button>
        </Container>
      </Navbar>

      <Container className="py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">Refine Your Writing with AI-Powered Insight</h2>
          <p className="text-muted">
            Upload your manuscript and receive expert-level feedback on structure,
            tone, and creativity.
          </p>
        </div>

        <Tabs
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-4 justify-content-center"
          fill
        >
          <Tab eventKey="upload" title="Upload Manuscript">
            <UploadTab />
          </Tab>

          <Tab eventKey="advice" title="Writing Advice">
            <WritingAdviceTab
              onResponsesUpdate={(data) => setWritingResponses(data)}
            />
          </Tab>

          <Tab eventKey="marketing" title="Marketing Analysis">
            <MarketingAnalysisTab
              onResponsesUpdate={(data) => setMarketingResponses(data)}
            />
          </Tab>
        </Tabs>
      </Container>

      <footer className="text-center text-muted py-3 border-top">
        © {new Date().getFullYear()} Reader AI
      </footer>
    </>
  );
}

export default App;
