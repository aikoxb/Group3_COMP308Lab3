import { Container } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';

function HomePage() {
  const { user } = useAuth();

  return (
    <Container className="mt-5 text-center">
      <h1>Welcome to DevPilot</h1>
      {user ? (
        <p>Hello, {user.username}! Use the navigation bar to manage your projects.</p>
      ) : (
        <p>Please login or register to get started.</p>
      )}
    </Container>
  );
}

export default HomePage;
