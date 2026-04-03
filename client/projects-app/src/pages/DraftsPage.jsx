// client/projects-app/src/pages/DraftsPage.jsx
// Allows the user to submit implementation drafts and load draft history for a selected feature
// Contains the GraphQL query and mutation needed for the draft workflow on this page

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Alert, Button, Card, Form, ListGroup } from "react-bootstrap";

// Query to load all projects that belong to the current user - used to build a list of all features that belong to the user's projects
const PROJECTS_BY_USER = gql`
  query ProjectsByUser {
    projectsByUser {
      id
      title
    }
  }
`;

// Query to load all feature requests for a selected project - used to build the feature dropdown
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

  const [projectId, setProjectId] = useState("");
  const [featureId, setFeatureId] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState(1);
  const [message, setMessage] = useState("");

  // Load the current user's projects for the projects dropdown
  const {
    data: projectsData,
    error: projectsError,
  } = useQuery(PROJECTS_BY_USER, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Load the features for the selected project
  const {
    data: featuresData,
    error: featuresError,
  } = useQuery(FEATURE_REQUESTS, {
    variables: { projectId },
    skip: !projectId, // This query is skipped until a project is selected
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Load the drafts for the selected feature
  const {
    data,
    error,
    refetch,
  } = useQuery(DRAFTS_BY_FEATURE, {
    variables: { featureId },
    skip: !featureId, // This query is skipped until a feature is selected
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Prepare the mutation used to submit a draft
  const [submitDraft, { loading }] = useMutation(SUBMIT_DRAFT);

  // Handle form submission for submitting a draft
  const handleSubmit = async (event) => {

    event.preventDefault();
    setMessage("");

    // Stop the form if the user has not selected a project
    if (!projectId) {
      setMessage("Please select a project first.");
      return;
    }

    // Stop the form if the user has not selected a feature
    if (!featureId) {
      setMessage("Please select a feature.");
      return;
    }

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
      await refetch();

    } catch (error) {
      setMessage(error.message || "Failed to submit draft.");
    }
  };

  // Store the returned projects for the project dropdown
  const projects = projectsData?.projectsByUser || [];

  // Store the returned features for the feature dropdown
  const features = featuresData?.featureRequests || [];

  // Store the returned drafts
  const drafts = data?.draftsByFeature || [];

  return (
    <div>
      <h2 className="mb-4">Implementation Drafts</h2>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Submit Draft</Card.Title>

          {message && <Alert variant="info">{message}</Alert>}

          {/* Show a warning if the user's projects could not be loaded */}
          {projectsError && (
            <Alert variant="warning">
              Could not load your projects. Please make sure you are logged in
              and have created at least one project.
            </Alert>
          )}

          {/* Show a warning if the selected project's features could not be loaded */}
          {featuresError && (
            <Alert variant="warning">
              Could not load features for the selected project.
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Project</Form.Label>

              {/* Dropdown to choose a project so the app can load related features */}
              <Form.Select
                value={projectId}
                onChange={(event) => {
                  setProjectId(event.target.value); // Save the selected project ID
                  setFeatureId("");
                }}
                required
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Feature</Form.Label>

              {/* Dropdown to choose a feature that belongs to the selected project */}
              <Form.Select
                value={featureId}
                onChange={(event) => setFeatureId(event.target.value)}
                disabled={!projectId}
                required
              >
                <option value="">Choose a feature</option>
                {features.map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.title}
                  </option>
                ))}
              </Form.Select>
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

          {/* Reload the draft history for the currently selected feature */}
          <Button
            className="mb-3"
            onClick={() => refetch()}
            disabled={!featureId}
          >
            Load Drafts
          </Button>

          {error && (
            <Alert variant="warning">
              Could not load draft history for the selected feature.
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