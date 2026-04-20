import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { AUTH_API_METHODS } from '../-api-methods';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

import { useAuth } from '@/context/auth-context';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) =>
      AUTH_API_METHODS.login({ email: values.email, password: values.password }),
    onSuccess: (response: any) => {
      login(response.data.token, response.data.user);
      toast.success('Login successful!');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <img src="/smart-season-logo.webp" alt="SmartSeason Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-green-900">SmartSeason</span>
          </div>
        </div>
        <CardTitle className="text-center text-xl font-bold text-gray-900 uppercase tracking-tight">
          Field Monitoring System
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-600 font-medium">Email</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="bg-white border-gray-300 h-11 rounded-none focus-visible:ring-green-600"
                  aria-invalid={!!errors.email}
                />
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" title="Password" className="text-gray-600 font-medium">Password</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-white border-gray-300 h-11 rounded-none focus-visible:ring-green-600"
                  aria-invalid={!!errors.password}
                />
              )}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button
            type="submit"
            className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-bold rounded-none transition-colors text-lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Signing in...' : 'Login'}
          </Button>

          <div className="text-center w-full text-sm text-gray-500">
            Need help? <a href="#" className="text-blue-600 hover:underline">Contact Admin</a>
          </div>
          
          <div className="text-center w-full pt-2">
            <a href="/auth/signup" className="text-sm font-medium text-green-700 hover:underline">
              Don't have an account? Sign up
            </a>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
