import { Shield, Home, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

interface AdminAccessBlockedPageProps {
  onNavigateHome: () => void;
  isAuthenticated: boolean;
}

export default function AdminAccessBlockedPage({ onNavigateHome, isAuthenticated }: AdminAccessBlockedPageProps) {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message === 'User is already authenticated') {
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {!isAuthenticated ? (
            <>
              <p className="text-muted-foreground leading-relaxed">
                You need to be logged in to access the Admin Panel. Please login to continue.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleLogin}
                  disabled={loginStatus === 'logging-in'}
                  size="lg"
                  className="w-full"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
                </Button>
                <Button onClick={onNavigateHome} variant="outline" size="lg" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground leading-relaxed">
                You don't have permission to access the Admin Panel. This area is restricted to administrators only.
              </p>
              <Button onClick={onNavigateHome} size="lg" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
