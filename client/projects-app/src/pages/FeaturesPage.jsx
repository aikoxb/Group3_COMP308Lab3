// client/projects-app/src/pages/FeaturesPage.jsx
// Allows the user to add feature requests and load feature history for a selected project
// Contains the GraphQL query and mutation needed for the feature request workflow on this page

import { useState } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { Alert, Button, Card, Form, ListGroup } from "react-bootstrap";

// Query to load all feature requests for a selected project
const FEATURE_REQUESTS = gql`
  query FeatureRequests($projectId: ID!) {
    featureRequests(projectId: $projectId) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

// Mutation to add a new feature request to a project
const ADD_FEATURE_REQUEST = gql`
  mutation AddFeatureRequest(
    $projectId: ID!
    $title: String!
    $description: String!
    $status: String
  ) {
    addFeatureRequest(
      projectId: $projectId
      title: $title
      description: $description
      status: $status
    ) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

// Component - displays the Features page
function FeaturesPage() {

  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [message, setMessage] = useState("");

  // Prepare the query used to load features for a project
  const [loadFeatures, { data, error }] = useLazyQuery(FEATURE_REQUESTS, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Prepare the mutation used to add a feature request
  const [addFeatureRequest, { loading }] = useMutation(ADD_FEATURE_REQUEST);

  // Handle form submission for adding a feature request
  const handleSubmit = async (event) => {

    event.preventDefault();
    setMessage("");

    try {
      // Send the addFeatureRequest mutation to the backend
      await addFeatureRequest({
        variables: {
          projectId,
          title,
          description,
          status,
        },
      });

      setTitle("");
      setDescription("");
      setStatus("open");
      setMessage("Feature request submitted successfully.");

      // Reload the feature list for the selected project
      await loadFeatures({
        variables: { projectId },
      });
    } catch (error) {
      setMessage(error.message || "Failed to add feature request.");
    }
  };

  // Store the returned feature list
  const features = data?.featureRequests || [];

  return (
    <div>
      <h2 className="mb-4">Feature Requests</h2>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Add Feature Request</Card.Title>

          {message && <Alert variant="info">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Project ID</Form.Label>
              <Form.Control
                type="text"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Feature Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Feature Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Feature Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </Form.Select>
            </Form.Group>

            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Add Feature Request"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Feature Request History</Card.Title>

          <Button
            className="mb-3"
            onClick={() => loadFeatures({ variables: { projectId } })}
            disabled={!projectId}
          >
            Load Features
          </Button>

          {error && (
            <Alert variant="warning">
              Feature request data is not ready yet. This page will work once
              the Projects Service backend is completed.
            </Alert>
          )}

          <ListGroup>
            {features.map((feature) => (
              <ListGroup.Item key={feature.id}>
                <strong>{feature.title}</strong>
                <div>{feature.description}</div>
                <small>Status: {feature.status || "open"}</small>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {!error && features.length === 0 && (
            <p className="mt-3 mb-0">No feature requests found.</p>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default FeaturesPage;
