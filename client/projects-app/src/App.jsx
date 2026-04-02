// client/projects-app/src/App.jsx
// Root component for the Projects App remote
// Supports both standalone routes and Shell-hosted routes for the Projects workflow pages

import { Routes, Route, NavLink } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import ProjectsPage from "./pages/ProjectsPage";
import FeaturesPage from "./pages/FeaturesPage";
import DraftsPage from "./pages/DraftsPage";

function App() {
  return (
    <>
      <Navbar bg="light" expand="lg" className="border-bottom">
        <Container>
          <Navbar.Brand>Projects App</Navbar.Brand>

          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/projects" end>
              Projects
            </Nav.Link>

            <Nav.Link as={NavLink} to="/projects/features">
              Features
            </Nav.Link>

            <Nav.Link as={NavLink} to="/projects/drafts">
              Drafts
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          {/* Standalone root route */}
          <Route path="/" element={<ProjectsPage />} />

          {/* Standalone sub-routes */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/drafts" element={<DraftsPage />} />

          {/* Shell-hosted routes */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/features" element={<FeaturesPage />} />
          <Route path="/projects/drafts" element={<DraftsPage />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
