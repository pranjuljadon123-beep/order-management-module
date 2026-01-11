import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, useSignIn, useSignUp } from '@/hooks/useAuth';
import { useCarriers } from '@/hooks/useProcurement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Ship, Users } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const signIn = useSignIn();
  const signUp = useSignUp();
  const { data: carriers } = useCarriers();

  const defaultTab = searchParams.get('tab') || 'signin';
  const defaultRole = searchParams.get('role') as 'buyer' | 'vendor' || 'buyer';

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpRole, setSignUpRole] = useState<'buyer' | 'vendor'>(defaultRole);
  const [signUpCarrier, setSignUpCarrier] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      // Redirect based on profile role (will be checked in profile query)
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn.mutateAsync({ email: signInEmail, password: signInPassword });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp.mutateAsync({
      email: signUpEmail,
      password: signUpPassword,
      fullName: signUpName,
      role: signUpRole,
      carrierId: signUpRole === 'vendor' ? signUpCarrier : undefined,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Ship className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">FreightFlow</h1>
          </div>
          <p className="text-muted-foreground">Freight Procurement Platform</p>
        </div>

        <Card className="border-border/50 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={signIn.isPending}
                  >
                    {signIn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={signUpRole === 'buyer' ? 'default' : 'outline'}
                        className={signUpRole === 'buyer' ? 'bg-accent hover:bg-accent/90' : ''}
                        onClick={() => setSignUpRole('buyer')}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Buyer
                      </Button>
                      <Button
                        type="button"
                        variant={signUpRole === 'vendor' ? 'default' : 'outline'}
                        className={signUpRole === 'vendor' ? 'bg-accent hover:bg-accent/90' : ''}
                        onClick={() => setSignUpRole('vendor')}
                      >
                        <Ship className="mr-2 h-4 w-4" />
                        Vendor
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {signUpRole === 'buyer' 
                        ? 'Create RFQs and manage freight procurement' 
                        : 'Submit quotes and participate in freight auctions'}
                    </p>
                  </div>

                  {signUpRole === 'vendor' && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-carrier">Select Your Carrier</Label>
                      <Select value={signUpCarrier} onValueChange={setSignUpCarrier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select carrier" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {(carriers || []).map((carrier) => (
                            <SelectItem key={carrier.id} value={carrier.id}>
                              {carrier.name} ({carrier.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select the carrier company you represent
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={signUp.isPending || (signUpRole === 'vendor' && !signUpCarrier)}
                  >
                    {signUp.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
