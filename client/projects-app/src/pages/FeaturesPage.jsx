// client/projects-app/src/pages/FeaturesPage.jsx
// Allows the user to add feature requests and load feature history for a selected project
// Contains the GraphQL query and mutation needed for the feature request workflow on this page

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Alert, Button, Card, Form, ListGroup } from "react-bootstrap";

// Query to load the current user's projects - used to fill the project dropdown with valid project IDs
const PROJECTS_BY_USER = gql`
  query ProjectsByUser {
    projectsByUser {
      id
      title
      description
    }
  }
`;

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

  // Load the current user's projects so the dropdown has valid project options
  const {
    data: projectsData,
    loading: projectsLoading,
    error: projectsError,
  } = useQuery(PROJECTS_BY_USER, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Load the feature requests for the selected project
  const {
  data,
  error,
  refetch,
  } = useQuery(FEATURE_REQUESTS, {
  variables: { projectId },
  skip: !projectId, // Stops the query from running until a project is selected
  fetchPolicy: "network-only",
  errorPolicy: "all",
  });

  // Prepare the mutation used to add a feature request
  const [addFeatureRequest, { loading }] = useMutation(ADD_FEATURE_REQUEST);

  // Handle form submission for adding a feature request
  const handleSubmit = async (event) => {

    event.preventDefault();
    setMessage("");

    // Stop the form if the user has not selected a project yet
    if (!projectId) {
      setMessage("Please select a project.");
      return;
    }

    try {
      // Send the addFeatureRequest mutation (with the selected project ID & form values) to the backend
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
      await refetch();
    } catch (error) {
      setMessage(error.message || "Failed to add feature request.");
    }
  };

  // Store the returned feature list
  const features = data?.featureRequests || [];

  // Store the returned projects for the dropdown
  const projects = projectsData?.projectsByUser || [];

  return (
    <div>
      <h2 className="mb-4">Feature Requests</h2>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Add Feature Request</Card.Title>

          {message && <Alert variant="info">{message}</Alert>}

          {/* Show a warning if the projects list could not be loaded */}
          {projectsError && (
            <Alert variant="warning">
              Could not load your projects. Please make sure the Projects page is
              working and that you are logged in.
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Project</Form.Label>

              {/* Dropdown of valid projects owned by the current user */}
              <Form.Select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
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
            onClick={() => refetch()}
            disabled={!projectId}
          >
            Load Features
          </Button>

          {error && (
            <Alert variant="warning">
              Could not load feature requests for the selected project.
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
