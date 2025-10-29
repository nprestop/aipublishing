import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";

function UploadTab({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setMessage("");

      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ File uploaded successfully!");
        console.log("Uploaded length:", data.length);
        // move to next tab
        onUploadComplete();
      } else {
        setMessage(`❌ Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      setMessage("❌ Failed to connect to backend.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <h4 className="mb-3">Upload Your Manuscript</h4>
      <p className="text-muted">
        Accepted formats: <strong>.txt</strong> or <strong>.pdf</strong>.
      </p>

      <Form.Group className="mb-3">
        <Form.Control type="file" accept=".txt,.pdf" onChange={handleFileChange} />
      </Form.Group>

      <Card className="p-3 bg-light mb-3 border-0">
        <h5 className="text-primary">Mission Statement</h5>
        <p className="mb-0">
          Reader AI empowers authors through clear, constructive feedback that enhances both
          technical precision and creative depth.
        </p>
      </Card>

      <div className="text-center">
        <Button variant="primary" onClick={handleUpload} disabled={uploading}>
          {uploading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" /> Uploading...
            </>
          ) : (
            "Upload and Analyze"
          )}
        </Button>
      </div>

      {message && <p className="mt-3 text-center">{message}</p>}
    </Card>
  );
}

export default UploadTab;
