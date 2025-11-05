import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '@/store/storeContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Loader2Icon } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout.tsx';

const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});
export const Login = observer(() => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const store = useContext(StoreContext);
  const navigate = useNavigate();

  // Redirect if user already logged in
  useEffect(() => {
    if (store.isAuthRequired) {
      return;
    }

    const redirectUrl = location.state?.from?.pathname
      ? location.state.from.pathname + location.state?.from?.search
      : '/';
    navigate(redirectUrl, { replace: true });
  }, [store.isAuthRequired, location.state?.from?.pathname, location.state?.from?.search, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    store.login(values, setIsLoading);
  }

  return (
    <AuthLayout>
      <div className="min-w-xs w-full max-w-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Sign in to your account</CardTitle>
                <CardDescription>Enter your username and password below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6 text-left">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem className="gap-3">
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Username" autoComplete="username" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="gap-3">
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Password"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button onClick={form.handleSubmit(onSubmit)} type="submit" className="w-full">
                    {isLoading && <Loader2Icon className=" mr-2 h-4 w-4 animate-spin" />}
                    Sign in
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
});
