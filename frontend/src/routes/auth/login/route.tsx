import { createFileRoute, useNavigate } from '@tanstack/react-router';
import LoginForm from '../-components/LoginForm';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  return (
    <LoginForm
      onSuccess={() => {
        window.location.href = '/'; // Refresh to update auth context
      }}
    />
  );
}
