// client/shell-app/src/remotes/ProjectsRemote.jsx
// Loads the Projects App remote dynamically through Module Federation
// Used in App.jsx to display the remote Projects frontend inside the Shell host

import { Suspense, lazy } from "react";

// Load the remote Projects App
const RemoteProjectsApp = lazy(() => import("projects_app/App"));

// Component - renders the remote Projects App
function ProjectsRemote() {
    return (
        <Suspense fallback={<p className="text-center mt-4">Loading Projects App...</p>}>
            <RemoteProjectsApp />
        </Suspense>
    );
}

export default ProjectsRemote;