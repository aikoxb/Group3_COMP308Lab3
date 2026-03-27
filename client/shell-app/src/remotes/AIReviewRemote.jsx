// client/shell-app/src/remotes/AIReviewRemote.jsx
// Loads the AI Review App remote dynamically through Module Federation
// Used in App.jsx to display the remote AI Review frontend inside the Shell host

import { Suspense, lazy } from "react";

// Load the remote AI Review App
const RemoteAIReviewApp = lazy(() => import("ai_review_app/App"));

// Component - renders the remote AI Review App
function AIReviewRemote() {
    return (
        <Suspense fallback={<p className="text-center mt-4">Loading AI Review App...</p>}>
            <RemoteAIReviewApp />
        </Suspense>
    );
}

export default AIReviewRemote;