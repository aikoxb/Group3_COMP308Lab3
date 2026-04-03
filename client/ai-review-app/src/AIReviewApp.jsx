// client/ai-review-app/src/AIReviewApp.jsx
import { useState } from 'react';
import { Container, Card, Badge, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Placeholder mock results to simulate future AI review output
const MOCK_REVIEW_RESULTS = [
  {
    id: 1,
    category: 'Code Quality',
    severity: 'warning',
    message: 'Consider extracting repeated logic into a shared utility function.',
    suggestion: 'Create a helper module to centralize common operations.',
  },
  {
    id: 2,
    category: 'Security',
    severity: 'danger',
    message: 'User input is not validated before being processed.',
    suggestion: 'Add input sanitization and validation at the service boundary.',
  },
  {
    id: 3,
    category: 'Performance',
    severity: 'info',
    message: 'Database query could benefit from indexing on the owner field.',
    suggestion: 'Add a compound index on (owner, createdAt) for faster lookups.',
  },
];

const SEVERITY_LABELS = {
  danger: 'High',
  warning: 'Medium',
  info: 'Low',
};

function AIReviewApp() {
  const [draftContent, setDraftContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draftContent.trim()) return;
    setLoading(true);
    // Simulate async AI processing delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleReset = () => {
    setDraftContent('');
    setSubmitted(false);
  };

  return (
    <Container className="mt-4">
      <div className="mb-4">
        <h2>AI Code Review</h2>
        <p className="text-muted">
          Submit an implementation draft to receive automated AI-powered feedback.
          Full Agentic RAG integration is coming in a future release.
        </p>
        <Alert variant="info" className="d-flex align-items-center gap-2">
          <span>
            <strong>Coming Soon:</strong> This module will use an Agentic RAG workflow
            to analyze your code, check against project requirements, and generate
            actionable improvement suggestions.
          </span>
        </Alert>
      </div>

      {!submitted ? (
        <Card className="shadow-sm">
          <Card.Header>
            <strong>Submit Draft for Review</strong>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Implementation Draft</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  placeholder="Paste your code or implementation notes here for AI review..."
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !draftContent.trim()}
              >
                {loading ? 'Analyzing...' : 'Submit for AI Review'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Review Results (Mock Preview)</h5>
            <Button variant="outline-secondary" size="sm" onClick={handleReset}>
              Submit Another
            </Button>
          </div>

          <Alert variant="success" className="mb-3">
            AI analysis complete. {MOCK_REVIEW_RESULTS.length} findings identified.
          </Alert>

          <Row xs={1} className="g-3">
            {MOCK_REVIEW_RESULTS.map((result) => (
              <Col key={result.id}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg={result.severity}>
                          {SEVERITY_LABELS[result.severity]}
                        </Badge>
                        <span className="fw-semibold">{result.category}</span>
                      </div>
                    </div>
                    <p className="mb-1">{result.message}</p>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                      <strong>Suggestion:</strong> {result.suggestion}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="mt-4 border-dashed" style={{ borderStyle: 'dashed' }}>
            <Card.Body className="text-center text-muted py-4">
              <h6>Full AI Review Coming in Weeks 11–12</h6>
              <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                The complete Agentic RAG workflow will provide deep semantic analysis,
                requirement alignment checks, and auto-generated improvement drafts.
              </p>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default AIReviewApp;
