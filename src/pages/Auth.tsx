import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Mail, Lock, User } from 'lucide-react';
import logoExamtis from '@/assets/logo-examtis.png';
import { toast } from 'sonner';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode');
  const next = searchParams.get('next') || '/';

  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'signup') setIsSignUp(true);
    else if (mode === 'login') setIsSignUp(false);
  }, [mode]);

  useEffect(() => {
    if (user && !loading) {
      navigate(next);
    }
  }, [user, loading, next, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (user) return null; // Logic handled in useEffect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        toast.success('Conta criada! Verifique seu e-mail.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Login realizado!');
        // Redirect happens via useEffect
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro na autenticação');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-scale-in border-border shadow-2xl bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <img src={logoExamtis} alt="EXAMTIS" className="h-10 mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold">EXAMTIS</CardTitle>
          <CardDescription>{isSignUp ? 'Crie sua conta para começar' : 'Entre para continuar seus estudos'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Seu nome"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Senha" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                // Optional: update URL
                navigate(`?mode=${!isSignUp ? 'signup' : 'login'}&next=${next}`, { replace: true });
              }}
              className="text-primary hover:underline font-medium"
            >
              {isSignUp ? 'Já tenho uma conta? Entrar' : 'Não tem conta? Criar agora'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
