import React, { useState } from "react";
import { Container, Nav, Navbar, Tab, Tabs } from "react-bootstrap";
import UploadTab from "./components/UploadTab";
import WritingAdviceTab from "./components/WritingAdviceTab";
import MarketingAnalysisTab from "./components/MarketingAnalysisTab"; 
import "./App.css";

function App() {
  const [key, setKey] = useState("upload");

  const handleUploadComplete = () => {
    setKey("advice");
  };

  return (
    <>
      <Navbar
        expand="lg"
        className="shadow-sm"
        style={{
          background: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
        }}
      >
        <Container>
          <Navbar.Brand className="text-white fw-semibold fs-4">
            📖 Reader AI
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
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
            <UploadTab onUploadComplete={handleUploadComplete} />
          </Tab>

          <Tab eventKey="advice" title="Writing Advice">
            <WritingAdviceTab />
          </Tab>

          <Tab eventKey="marketing" title="Marketing Analysis">
            <MarketingAnalysisTab />
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
