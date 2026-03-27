// client/projects-app/src/pages/ProjectsPage.jsx
// Allows the user to create a project and view their existing projects
// Contains the GraphQL query and mutation needed for the project workflow on this page

import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";

// Query to load all projects that belong to the current user
const PROJECTS_BY_USER = gql`
  query ProjectsByUser {
    projectsByUser {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`;

// Mutation to create a new project
const CREATE_PROJECT = gql`
  mutation CreateProject($title: String!, $description: String!) {
    createProject(title: $title, description: $description) {
      id
      title
      description
      createdAt
      updatedAt
    }
  }
`;

// Component - displays the Projects page
function ProjectsPage() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load the current user's projects from the backend
  const { data, loading, error, refetch } = useQuery(PROJECTS_BY_USER, {
    fetchPolicy: "network-only",
    errorPolicy: "all",
  });

  // Prepare the mutation used to create a new project
  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT);

  // Handle form submission for creating a new project
  const handleSubmit = async (event) => {
    
    event.preventDefault(); 
    setErrorMessage(""); 

    try {
      // Send the createProject mutation to the backend
      await createProject({
        variables: {
          title,
          description,
        },
      });

      setTitle("");
      setDescription("");

      await refetch(); // Reload the projects list so the new project appears
    } catch (error) {
      setErrorMessage(error.message || "Failed to create project");
    }
  };

  // Store the returned projects
  const projects = data?.projectsByUser || [];

  return (
    <div>
      <h2 className="mb-4">Projects</h2>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Create Project</Card.Title>

          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Project Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Project"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <h3 className="mb-3">My Projects</h3>

      {loading && <Spinner animation="border" />}

      {error && (
        <Alert variant="warning">
          Projects data is not ready yet. This page will work once the Projects
          Service backend is completed.
        </Alert>
      )}

      <Row>
        {projects.map((project) => (
          <Col md={6} lg={4} className="mb-3" key={project.id}>
            <Card>
              <Card.Body>
                <Card.Title>{project.title}</Card.Title>
                <Card.Text>{project.description}</Card.Text>
                <small className="text-muted">
                  Created:{" "}
                  {project.createdAt
                    ? new Date(project.createdAt).toLocaleString()
                    : "N/A"}
                </small>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {!loading && !error && projects.length === 0 && (
        <Alert variant="info">No projects found yet.</Alert>
      )}
    </div>
  );
}

export default ProjectsPage;
