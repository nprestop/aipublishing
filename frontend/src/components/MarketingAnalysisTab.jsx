import React, { useState } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";

function MarketingAnalysisTab() {
  const [loadingState, setLoadingState] = useState({});  
  const [responses, setResponses] = useState({});        

  const handleFeedback = async (index, topicPrompt) => {
    setLoadingState((prev) => ({ ...prev, [index]: true }));
    setResponses((prev) => ({ ...prev, [index]: "" }));

    const prompt = `
    You are a professional book marketing consultant.

    The user has already uploaded a manuscript. Use the uploaded text as the basis for your analysis.

    Task: ${topicPrompt}

    Provide a detailed, professional, and structured marketing insight. 
    Format your answer with clear section headings and bullet points. 
    Include examples, market trends, and actionable recommendations where relevant.
    `;

    try {
      const res = await fetch("http://localhost:3000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get AI response");
      setResponses((prev) => ({ ...prev, [index]: data.text }));
    } catch (err) {
      console.error(err);
      setResponses((prev) => ({
        ...prev,
        [index]: "❌ Error generating marketing analysis. Please try again.",
      }));
    } finally {
      setLoadingState((prev) => ({ ...prev, [index]: false }));
    }
  };

  const sections = [
    {
      title: "1. General Marketing Advice",
      description:
        "Broad, overarching marketing strategies and best practices for publishing and promoting books.",
      prompt: `Give overarching, typical marketing strategies and advice for books in this genre.`,
    },
    {
      title: "2. Strategies for This Book",
      description:
        "Specific marketing strategies tailored for this particular book based on its content and tone.",
      prompt: `Recommend marketing strategies specifically for this uploaded manuscript.`,
    },
    {
      title: "3. Target Audiences & Reach",
      description:
        "Who the ideal readers are and how to reach them through online or offline methods.",
      prompt: `Identify target audiences for this book and suggest where to reach them (social media, events, etc.).`,
    },
    {
      title: "4. Current Market Overview",
      description:
        "Analyze what the current book market looks like for this genre — trends, saturation, and reader interests.",
      prompt: `Describe the current market conditions for this book's genre and recent publishing trends.`,
    },
    {
      title: "5. Opportunities & Challenges",
      description:
        "Potential advantages and obstacles the author may face in promoting and selling this book.",
      prompt: `List marketing opportunities and challenges this book might face based on its genre and themes.`,
    },
    {
      title: "6. Marketing Channels",
      description:
        "Best online and real-world places to promote this book effectively.",
      prompt: `Recommend the best online and offline marketing channels for this book.`,
    },
    {
      title: "7. Comparable Books",
      description:
        "Books similar in genre or theme and what made their marketing effective.",
      prompt: `Identify comparable or competing books and explain what marketing strategies made them successful.`,
    },
    {
      title: "8. Market Data Insights",
      description:
        "Statistics on how many books were published in this genre, who reads them, and average sales performance.",
      prompt: `Provide market data: number of books in this genre last year, who reads them, and sales figures.`,
    },
  ];

  return (
    <Container className="py-4 text-start">
      <h2 className="mb-4 text-center text-primary">
        📊 Marketing Analysis & Recommendations
      </h2>

      {sections.map((section, index) => (
        <Card key={index} className="mb-3 shadow-sm">
          <Card.Body>
            <Card.Title className="fw-bold">{section.title}</Card.Title>
            <Card.Text className="text-muted">{section.description}</Card.Text>

            <Button
              variant="outline-primary"
              disabled={loadingState[index]}
              onClick={() => handleFeedback(index, section.prompt)}
            >
              {loadingState[index] ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Loading...
                </>
              ) : (
                "Get Analysis"
              )}
            </Button>

            {responses[index] && (
              <div
                className="mt-3 p-3 border rounded bg-light"
                style={{ whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: responses[index] }}
              />
            )}
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
}

export default MarketingAnalysisTab;
