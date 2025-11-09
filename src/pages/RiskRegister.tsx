import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, AlertCircle, CheckCircle, Plus, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Risk {
  id: string;
  module: string;
  risk_description: string;
  likelihood: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  mitigation: string;
  status: 'active' | 'mitigated' | 'accepted' | 'closed';
  review_date: string;
  last_reviewed_at: string | null;
  created_at: string;
}

const RiskRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    module: '',
    risk_description: '',
    likelihood: 'medium',
    impact: 'medium',
    mitigation: '',
    review_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRisks();
  }, [user, navigate]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('risk_management_register' as any)
        .select('*')
        .order('risk_score', { ascending: false });

      if (error) throw error;
      setRisks((data as any) || []);
    } catch (error) {
      console.error('Error fetching risks:', error);
      toast.error('Failed to load risk register');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('risk_management_register' as any)
        .insert([formData as any]);

      if (error) throw error;

      toast.success('Risk added successfully');
      setIsDialogOpen(false);
      setFormData({
        module: '',
        risk_description: '',
        likelihood: 'medium',
        impact: 'medium',
        mitigation: '',
        review_date: new Date().toISOString().split('T')[0]
      });
      fetchRisks();
    } catch (error) {
      console.error('Error adding risk:', error);
      toast.error('Failed to add risk');
    }
  };

  const updateRiskStatus = async (riskId: string, status: string) => {
    try {
      const { error } = await supabase.functions.invoke('update-rms-status', {
        body: { risk_id: riskId, status }
      });

      if (error) throw error;

      toast.success('Risk status updated');
      fetchRisks();
    } catch (error) {
      console.error('Error updating risk:', error);
      toast.error('Failed to update risk status');
    }
  };

  const getRiskScoreColor = (score: number): 'default' | 'destructive' | 'secondary' => {
    if (score >= 12) return 'destructive';
    if (score >= 6) return 'secondary';
    return 'default';
  };

  const getLikelihoodIcon = (likelihood: string) => {
    switch (likelihood) {
      case 'critical': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
      default: return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'destructive',
      mitigated: 'default',
      accepted: 'secondary',
      closed: 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Risk Register...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Risk Management System
            </h1>
            <p className="text-muted-foreground mt-2">
              EU AI Act Article 9 Compliance - Risk Register & Mitigation
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchRisks} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Risk
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Register New Risk</DialogTitle>
                    <DialogDescription>
                      Document identified risks and mitigation strategies
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="module">Module</Label>
                      <Select
                        value={formData.module}
                        onValueChange={(value) => setFormData({ ...formData, module: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai_act_auditor">AI Act Auditor</SelectItem>
                          <SelectItem value="gdpr_checker">GDPR Checker</SelectItem>
                          <SelectItem value="esg_reporter">ESG Reporter</SelectItem>
                          <SelectItem value="dora_copilot">DORA Copilot</SelectItem>
                          <SelectItem value="nis2_copilot">NIS2 Copilot</SelectItem>
                          <SelectItem value="dma_copilot">DMA Copilot</SelectItem>
                          <SelectItem value="data_lineage">Data Lineage</SelectItem>
                          <SelectItem value="model_registry">Model Registry</SelectItem>
                          <SelectItem value="audit_trail">Audit Trail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="risk_description">Risk Description</Label>
                      <Textarea
                        id="risk_description"
                        value={formData.risk_description}
                        onChange={(e) => setFormData({ ...formData, risk_description: e.target.value })}
                        placeholder="Describe the identified risk..."
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="likelihood">Likelihood</Label>
                        <Select
                          value={formData.likelihood}
                          onValueChange={(value) => setFormData({ ...formData, likelihood: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="impact">Impact</Label>
                        <Select
                          value={formData.impact}
                          onValueChange={(value) => setFormData({ ...formData, impact: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mitigation">Mitigation Strategy</Label>
                      <Textarea
                        id="mitigation"
                        value={formData.mitigation}
                        onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                        placeholder="Describe mitigation measures..."
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="review_date">Next Review Date</Label>
                      <Input
                        type="date"
                        id="review_date"
                        value={formData.review_date}
                        onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Risk</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Risk Description</TableHead>
                <TableHead className="text-center">Likelihood</TableHead>
                <TableHead className="text-center">Impact</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead>Mitigation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {risks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No risks registered. Click "Add Risk" to start.
                  </TableCell>
                </TableRow>
              ) : (
                risks.map((risk) => (
                  <TableRow key={risk.id}>
                    <TableCell className="font-medium">{risk.module.replace(/_/g, ' ')}</TableCell>
                    <TableCell className="max-w-xs">{risk.risk_description}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getLikelihoodIcon(risk.likelihood)}
                        <span className="capitalize">{risk.likelihood}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center capitalize">{risk.impact}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getRiskScoreColor(risk.risk_score)}>
                        {risk.risk_score}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">{risk.mitigation}</TableCell>
                    <TableCell>{getStatusBadge(risk.status)}</TableCell>
                    <TableCell>{new Date(risk.review_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        value={risk.status}
                        onValueChange={(value) => updateRiskStatus(risk.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="mitigated">Mitigated</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default RiskRegister;
