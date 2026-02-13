import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Shield, ShieldOff, CheckCircle, XCircle, Search, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_days: number;
  payment_status: string;
  payment_method: string;
  starts_at: string;
  expires_at: string;
  created_at: string;
  notes: string | null;
}

export default function UserManager() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [profilesRes, rolesRes, subsRes] = await Promise.all([
      (supabase.from as any)('profiles').select('*').order('created_at', { ascending: false }),
      (supabase.from as any)('user_roles').select('user_id, role'),
      (supabase.from as any)('user_subscriptions').select('*').order('created_at', { ascending: false }),
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data);
    if (rolesRes.data) setRoles(rolesRes.data);
    if (subsRes.data) setSubscriptions(subsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getUserRole = (userId: string) => {
    return roles.find(r => r.user_id === userId)?.role || 'user';
  };

  const getUserSubscription = (userId: string) => {
    return subscriptions.find(
      s => s.user_id === userId && s.payment_status === 'approved' && new Date(s.expires_at) > new Date()
    );
  };

  const getPendingSubscription = (userId: string) => {
    return subscriptions.find(s => s.user_id === userId && s.payment_status === 'pending');
  };

  async function toggleAdmin(userId: string, currentRole: string) {
    setActionLoading(userId + '-role');
    try {
      if (currentRole === 'admin') {
        const { error } = await (supabase.from as any)('user_roles')
          .delete().eq('user_id', userId).eq('role', 'admin');
        if (error) throw error;
        toast.success('Role admin removido');
      } else {
        const { error } = await (supabase.from as any)('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
        toast.success('Usuário promovido a admin');
      }
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao alterar role');
    } finally {
      setActionLoading(null);
    }
  }

  async function approveSubscription(sub: UserSubscription) {
    setActionLoading(sub.id + '-approve');
    try {
      const { error } = await (supabase.from as any)('user_subscriptions')
        .update({ payment_status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', sub.id);
      if (error) throw error;
      toast.success('Assinatura aprovada!');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao aprovar');
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectSubscription(subId: string) {
    setActionLoading(subId + '-reject');
    try {
      const { error } = await (supabase.from as any)('user_subscriptions')
        .update({ payment_status: 'rejected' })
        .eq('id', subId);
      if (error) throw error;
      toast.info('Assinatura rejeitada.');
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao rejeitar');
    } finally {
      setActionLoading(null);
    }
  }

  async function resetPassword(userId: string) {
    setActionLoading(userId + '-reset');
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { target_user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(data?.email_sent ? 'Senha redefinida e enviada por e-mail!' : 'Senha redefinida!');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao redefinir senha');
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = profiles.filter(p =>
    !search || (p.display_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pendingSubs = subscriptions.filter(s => s.payment_status === 'pending');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Usuários</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{profiles.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Admins</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{roles.filter(r => r.role === 'admin').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Assinaturas Pendentes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{pendingSubs.length}</div></CardContent>
        </Card>
      </div>

      {/* Pending subscriptions */}
      {pendingSubs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assinaturas Pendentes de Aprovação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingSubs.map(sub => {
              const profile = profiles.find(p => p.user_id === sub.user_id);
              return (
                <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{profile?.display_name || 'Usuário desconhecido'}</p>
                    <p className="text-xs text-muted-foreground">
                      Plano: {sub.plan_days} dias • {sub.payment_method} • {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                    {sub.notes && <p className="text-xs mt-1 text-muted-foreground">Obs: {sub.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={actionLoading === sub.id + '-approve'}
                      onClick={() => approveSubscription(sub)}
                    >
                      {actionLoading === sub.id + '-approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === sub.id + '-reject'}
                      onClick={() => rejectSubscription(sub.id)}
                    >
                      {actionLoading === sub.id + '-reject' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Search + User list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Usuários Cadastrados</CardTitle>
            <Button variant="outline" size="sm" onClick={loadData}>Atualizar</Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map(profile => {
              const role = getUserRole(profile.user_id);
              const activeSub = getUserSubscription(profile.user_id);

              return (
                <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{profile.display_name || 'Sem nome'}</p>
                      {role === 'admin' && <Badge variant="default" className="bg-primary text-xs">Admin</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Cadastro: {new Date(profile.created_at).toLocaleDateString()}</span>
                      {activeSub ? (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          Assinatura ativa até {new Date(activeSub.expires_at).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-xs">Sem assinatura</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoading === profile.user_id + '-reset'}
                      onClick={() => resetPassword(profile.user_id)}
                      title="Resetar senha e enviar por e-mail"
                    >
                      {actionLoading === profile.user_id + '-reset' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><KeyRound className="h-4 w-4 mr-1" /> Resetar Senha</>
                      )}
                    </Button>
                    <Button
                      variant={role === 'admin' ? 'destructive' : 'outline'}
                      size="sm"
                      disabled={actionLoading === profile.user_id + '-role'}
                      onClick={() => toggleAdmin(profile.user_id, role)}
                    >
                      {actionLoading === profile.user_id + '-role' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : role === 'admin' ? (
                        <><ShieldOff className="h-4 w-4 mr-1" /> Remover Admin</>
                      ) : (
                        <><Shield className="h-4 w-4 mr-1" /> Tornar Admin</>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
