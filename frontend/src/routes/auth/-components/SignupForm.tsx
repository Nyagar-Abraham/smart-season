import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { AUTH_API_METHODS } from '../-api-methods';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Link } from "@tanstack/react-router";

import { useAuth } from '@/context/auth-context';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'field_agent']),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'field_agent',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: SignupFormValues) =>
      AUTH_API_METHODS.signup({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        role: values.role
      }),
    onSuccess: (response: any) => {
      login(response.data.token, response.data.user);
      toast.success('Account created successfully!');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Signup failed');
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-full border-none shadow-none bg-transparent ">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            <img src="/smart-season-logo.webp" alt="SmartSeason Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-green-900">SmartSeason</span>
          </div>
        </div>
        <CardTitle className="text-center text-xl font-bold text-gray-900 uppercase">Create an account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-gray-600 text-sm font-medium">Full Name</Label>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="fullName"
                  placeholder="John Doe"
                  className="h-11 border-gray-300 rounded-none focus-visible:ring-green-600"
                  aria-invalid={!!errors.fullName}
                />
              )}
            />
            {errors.fullName && <p className="text-[10px] text-red-600">{errors.fullName.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-gray-600 text-sm font-medium">Email address</Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="h-11 border-gray-300 rounded-none focus-visible:ring-green-600"
                  aria-invalid={!!errors.email}
                />
              )}
            />
            {errors.email && <p className="text-[10px] text-red-600">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" title="Password" className="text-gray-600 text-sm font-medium">Password</Label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 border-gray-300 rounded-none focus-visible:ring-green-600"
                  aria-invalid={!!errors.password}
                />
              )}
            />
            {errors.password && <p className="text-[10px] text-red-600">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-gray-600 text-sm font-medium">Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="role" className="w-full h-11 border-gray-300 rounded-none focus:ring-green-600">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent position={'popper'} className="rounded-none">
                    <SelectItem value="field_agent">Field Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-[10px] text-red-600">{errors.role.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button
            type="submit"
            className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-bold rounded-none text-lg"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating account...' : 'Sign up'}
          </Button>

          <div className="text-center w-full">
            <Link to="/auth/login" className="font-medium text-green-700 hover:underline text-sm">
              Already have an account? Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
