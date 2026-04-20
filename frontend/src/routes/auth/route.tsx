import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth')({
  beforeLoad: ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="min-h-screen no-scrollbar flex items-center justify-center bg-[#F9FAFB]  py-12 px-4 sm:px-6 lg:px-8">
      <div className={"max-w-md w-full space-y-8 no-scrollbar "}>
        <Outlet />
      </div>
    </div>
  );
}
