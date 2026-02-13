import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Ticket, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setCoupons(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setSaving(true);
    try {
      const payload: any = {
        code: code.trim().toUpperCase(),
        discount_percent: discountPercent,
        is_active: true,
      };
      if (maxUses) payload.max_uses = parseInt(maxUses);
      if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString();

      const { error } = await (supabase.from as any)('coupons').insert(payload);
      if (error) throw error;
      toast.success('Cupom criado!');
      setCode('');
      setDiscountPercent(10);
      setMaxUses('');
      setExpiresAt('');
      loadCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar cupom');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    const { error } = await (supabase.from as any)('coupons')
      .update({ is_active: !coupon.is_active })
      .eq('id', coupon.id);
    if (error) toast.error(error.message);
    else loadCoupons();
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await (supabase.from as any)('coupons')
      .delete()
      .eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Cupom removido');
      loadCoupons();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create coupon form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Criar Cupom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Código</Label>
              <Input
                placeholder="EX: DESCONTO20"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Desconto (%)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={discountPercent}
                onChange={e => setDiscountPercent(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Máximo de usos (vazio = ilimitado)</Label>
              <Input
                type="number"
                min={1}
                value={maxUses}
                onChange={e => setMaxUses(e.target.value)}
                placeholder="Ilimitado"
              />
            </div>
            <div className="space-y-1">
              <Label>Expira em (opcional)</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />}
                Criar Cupom
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Coupon list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" /> Cupons Cadastrados ({coupons.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadCoupons}>Atualizar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {coupons.map(coupon => {
              const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
              const isMaxed = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;

              return (
                <div key={coupon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="font-bold text-sm bg-muted px-2 py-0.5 rounded">{coupon.code}</code>
                      <Badge variant="outline" className="text-xs">{coupon.discount_percent}% OFF</Badge>
                      {!coupon.is_active && <Badge variant="secondary" className="text-xs">Inativo</Badge>}
                      {isExpired && <Badge variant="destructive" className="text-xs">Expirado</Badge>}
                      {isMaxed && <Badge variant="destructive" className="text-xs">Esgotado</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>Usos: {coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</span>
                      {coupon.expires_at && <span>Expira: {new Date(coupon.expires_at).toLocaleDateString()}</span>}
                      <span>Criado: {new Date(coupon.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={() => toggleActive(coupon)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteCoupon(coupon.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {coupons.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhum cupom cadastrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}