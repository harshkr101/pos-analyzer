import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ProgressBar,
} from "react-bootstrap";
import "./FileUpload.css";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Select a file!");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(
        "http://localhost:3001/api/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            setResponse({
              loaded,
              total,
              percentage: (loaded / total) * 100,
            });
          },
        }
      );
      setResponse(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="text-center mb-5">Text File Analyzer</h1>
          <Form>
            <Form.Group controlId="formFile">
              <Form.Label className="text-muted">Upload Text File</Form.Label>
              <Form.Control
                type="file"
                accept=".txt"
                onChange={handleFile}
                className="form-control-file"
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={handleUpload}
              className="btn-block mt-4"
            >
              Upload
            </Button>
          </Form>
          {loading && (
            <ProgressBar
              className="my-3"
              now={response ? response.percentage : 0}
              label={`${response ? response.percentage : 0}%`}
            />
          )}
          {response && (
            <div className="mt-5">
              <p>
                <strong>Noun Percentage:</strong> {response.nounPercentage}%
              </p>
              <p>
                <strong>Verb Percentage:</strong> {response.verbPercentage}%
              </p>
              <p>
                <strong>Adjective Percentage:</strong>{" "}
                {response.adjectivePercentage}%
              </p>
              <p>
                <strong>Adverb Percentage:</strong> {response.adverbPercentage}%
              </p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default FileUpload;
