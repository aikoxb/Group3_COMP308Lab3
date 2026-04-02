// client/projects-app/src/pages/DraftsPage.jsx
// Allows the user to submit implementation drafts and load draft history for a selected feature
// Contains the GraphQL query and mutation needed for the draft workflow on this page

import { useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { Alert, Button, Card, Form, ListGroup } from "react-bootstrap";

// Query to load all drafts for a selected feature
const DRAFTS_BY_FEATURE = gql`
  query DraftsByFeature($featureId: ID!) {
    draftsByFeature(featureId: $featureId) {
      id
      content
      version
      createdAt
    }
  }
`;

// Mutation to submit a new implementation draft
const SUBMIT_DRAFT = gql`
  mutation SubmitDraft($featureId: ID!, $content: String!, $version: Int) {
    submitDraft(featureId: $featureId, content: $content, version: $version) {
      id
      content
      version
      createdAt
    }
  }
`;

// Component - displays the Drafts page
function DraftsPage() {

  const [featureId, setFeatureId] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState(1);
  const [message, setMessage] = useState("");

  // Prepare the query used to load drafts for a selected feature
  const [loadDrafts, { data, error }] = useLazyQuery(DRAFTS_BY_FEATURE, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Prepare the mutation used to submit a draft
  const [submitDraft, { loading }] = useMutation(SUBMIT_DRAFT);

  // Handle form submission for submitting a draft
  const handleSubmit = async (event) => {

    event.preventDefault();
    setMessage("");

    try {
      // Send the submitDraft mutation to the backend
      await submitDraft({
        variables: {
          featureId,
          content,
          version: Number(version),
        },
      });

      setContent("");
      setMessage("Draft submitted successfully.");

      // Reload the drafts list for the selected feature
      await loadDrafts({
        variables: { featureId },
      });

    } catch (error) {
      setMessage(error.message || "Failed to submit draft.");
    }
  };

  // Store the returned drafts
  const drafts = data?.draftsByFeature || [];

  return (
    <div>
      <h2 className="mb-4">Implementation Drafts</h2>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Submit Draft</Card.Title>

          {message && <Alert variant="info">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Feature ID</Form.Label>
              <Form.Control
                type="text"
                value={featureId}
                onChange={(event) => setFeatureId(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Draft Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Version</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
              />
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Draft"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Draft History</Card.Title>

          <Button
            className="mb-3"
            onClick={() => loadDrafts({ variables: { featureId } })}
            disabled={!featureId}
          >
            Load Drafts
          </Button>

          {error && (
            <Alert variant="warning">
              Draft history is not ready yet. This page will work once the
              Projects Service backend is completed.
            </Alert>
          )}

          <ListGroup>
            {drafts.map((draft) => (
              <ListGroup.Item key={draft.id}>
                <div>
                  <strong>Version:</strong> {draft.version || "N/A"}
                </div>
                <div>{draft.content}</div>
                <small>
                  Created:{" "}
                  {draft.createdAt
                    ? new Date(draft.createdAt).toLocaleString()
                    : "N/A"}
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {!error && drafts.length === 0 && (
            <p className="mt-3 mb-0">No drafts found.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default DraftsPage;