import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, BarChart3, Shield, Search } from 'lucide-react';

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_days: number;
  starts_at: string;
  expires_at: string;
  payment_method: string;
  payment_status: string;
  approved_at: string | null;
  created_at: string;
  notes: string | null;
  profiles: { display_name: string | null } | null;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
  created_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeSubscriptions: 0, pendingApprovals: 0, totalExams: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'subscriptions' | 'users' | 'stats'>('subscriptions');

  // New subscription form
  const [newSubUserId, setNewSubUserId] = useState('');
  const [newSubDays, setNewSubDays] = useState('30');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
    }
  }, [adminLoading, isAdmin]);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  async function loadData() {
    setLoading(true);

    const [subsRes, profilesRes, examsRes] = await Promise.all([
      supabase
        .from('user_subscriptions')
        .select('*, profiles!user_subscriptions_user_id_fkey(display_name)')
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('user_id, display_name, created_at').order('created_at', { ascending: false }),
      supabase.from('exams').select('id', { count: 'exact', head: true }),
    ]);

    // If join fails, load profiles separately for display
    let subs = (subsRes.data || []) as unknown as SubscriptionRow[];
    
    // If profiles join didn't work, enrich manually
    if (subs.length > 0 && !subs[0]?.profiles) {
      const profileMap = new Map<string, string>();
      for (const p of (profilesRes.data || []) as UserProfile[]) {
        profileMap.set(p.user_id, p.display_name || 'Sem nome');
      }
      subs = subs.map(s => ({
        ...s,
        profiles: { display_name: profileMap.get(s.user_id) || s.user_id.slice(0, 8) },
      }));
    }

    setSubscriptions(subs);
    setProfiles((profilesRes.data || []) as UserProfile[]);

    const activeCount = subs.filter(s => s.payment_status === 'approved' && new Date(s.expires_at) > new Date()).length;
    const pendingCount = subs.filter(s => s.payment_status === 'pending').length;

    setStats({
      totalUsers: (profilesRes.data || []).length,
      activeSubscriptions: activeCount,
      pendingApprovals: pendingCount,
      totalExams: examsRes.count || 0,
    });

    setLoading(false);
  }

  async function approveSubscription(subId: string) {
    const now = new Date().toISOString();
    await supabase
      .from('user_subscriptions')
      .update({ payment_status: 'approved', approved_by: user!.id, approved_at: now })
      .eq('id', subId);
    loadData();
  }

  async function rejectSubscription(subId: string) {
    await supabase
      .from('user_subscriptions')
      .update({ payment_status: 'rejected' })
      .eq('id', subId);
    loadData();
  }

  async function createManualSubscription() {
    if (!newSubUserId) return;
    const days = parseInt(newSubDays);
    const now = new Date();
    const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    await supabase.from('user_subscriptions').insert({
      user_id: newSubUserId,
      plan_days: days,
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      payment_method: 'manual',
      payment_status: 'approved',
      approved_by: user!.id,
      approved_at: now.toISOString(),
    });

    setNewSubUserId('');
    loadData();
  }

  if (adminLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const filteredSubs = subscriptions.filter(s => {
    if (filter !== 'all' && s.payment_status !== filter) return false;
    if (search) {
      const name = s.profiles?.display_name?.toLowerCase() || '';
      const uid = s.user_id.toLowerCase();
      const q = search.toLowerCase();
      return name.includes(q) || uid.includes(q);
    }
    return true;
  });

  const statusBadge = (status: string, expiresAt: string) => {
    const expired = new Date(expiresAt) < new Date();
    if (status === 'approved' && !expired) return { label: 'Ativo', color: 'bg-success/15 text-success' };
    if (status === 'approved' && expired) return { label: 'Expirado', color: 'bg-muted text-muted-foreground' };
    if (status === 'pending') return { label: 'Pendente', color: 'bg-warning/15 text-warning' };
    return { label: 'Rejeitado', color: 'bg-destructive/15 text-destructive' };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-warning">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Administração</h1>
              <p className="text-sm opacity-80">Gerenciar acessos e assinaturas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Usuários</p>
                <p className="text-xl font-bold">{stats.totalUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-success">
                <CheckCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-xl font-bold">{stats.activeSubscriptions}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-warning">
                <Clock className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-xl font-bold">{stats.pendingApprovals}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Simulados</p>
                <p className="text-xl font-bold">{stats.totalExams}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {(['subscriptions', 'users', 'stats'] as const).map(t => (
            <Button key={t} variant={tab === t ? 'default' : 'ghost'} size="sm"
              className={tab === t ? 'gradient-primary text-primary-foreground' : ''}
              onClick={() => setTab(t)}>
              {t === 'subscriptions' ? 'Assinaturas' : t === 'users' ? 'Usuários' : 'Estatísticas'}
            </Button>
          ))}
        </div>

        {/* Subscriptions Tab */}
        {tab === 'subscriptions' && (
          <div className="space-y-4 animate-fade-in">
            {/* Create manual subscription */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Liberar Acesso Manual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs text-muted-foreground mb-1 block">Usuário</label>
                    <Select value={newSubUserId} onValueChange={setNewSubUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map(p => (
                          <SelectItem key={p.user_id} value={p.user_id}>
                            {p.display_name || p.user_id.slice(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-muted-foreground mb-1 block">Plano</label>
                    <Select value={newSubDays} onValueChange={setNewSubDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={createManualSubscription} className="gradient-primary text-primary-foreground" disabled={!newSubUserId}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Liberar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscriptions List */}
            <div className="space-y-2">
              {filteredSubs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma assinatura encontrada.</p>
              ) : filteredSubs.map(sub => {
                const badge = statusBadge(sub.payment_status, sub.expires_at);
                return (
                  <Card key={sub.id} className="border shadow-sm">
                    <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{sub.profiles?.display_name || sub.user_id.slice(0, 8)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{sub.plan_days} dias</span>
                          <span>•</span>
                          <span>{sub.payment_method.toUpperCase()}</span>
                          <span>•</span>
                          <span>Criado: {new Date(sub.created_at).toLocaleDateString('pt-BR')}</span>
                          {sub.payment_status === 'approved' && (
                            <>
                              <span>•</span>
                              <span>Expira: {new Date(sub.expires_at).toLocaleDateString('pt-BR')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badge.color}`}>{badge.label}</span>
                        {sub.payment_status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => approveSubscription(sub.id)} className="text-success border-success/30 hover:bg-success/10">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Aprovar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => rejectSubscription(sub.id)} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="space-y-2 animate-fade-in">
            {profiles.map(p => {
              const userSubs = subscriptions.filter(s => s.user_id === p.user_id);
              const activeSub = userSubs.find(s => s.payment_status === 'approved' && new Date(s.expires_at) > new Date());
              return (
                <Card key={p.user_id} className="border shadow-sm">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{p.display_name || 'Sem nome'}</p>
                      <p className="text-xs text-muted-foreground">
                        Cadastro: {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      activeSub ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {activeSub ? `Ativo até ${new Date(activeSub.expires_at).toLocaleDateString('pt-BR')}` : 'Sem acesso'}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Tab */}
        {tab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Resumo de Assinaturas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total de assinaturas</span>
                  <span className="font-bold">{subscriptions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ativas</span>
                  <span className="font-bold text-success">{stats.activeSubscriptions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pendentes</span>
                  <span className="font-bold text-warning">{stats.pendingApprovals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expiradas/Rejeitadas</span>
                  <span className="font-bold">{subscriptions.length - stats.activeSubscriptions - stats.pendingApprovals}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Uso da Plataforma</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Usuários cadastrados</span>
                  <span className="font-bold">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Simulados realizados</span>
                  <span className="font-bold">{stats.totalExams}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de conversão</span>
                  <span className="font-bold">
                    {stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
