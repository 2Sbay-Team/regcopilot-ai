import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
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

interface DSARRequest {
  id: string;
  request_type: string;
  data_subject_email: string;
  data_subject_name: string | null;
  request_date: string;
  deadline: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'expired';
  aggregated_data: any;
  export_file_path: string | null;
  notes: string | null;
}

const DSARQueue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DSARRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    request_type: 'access',
    data_subject_email: '',
    data_subject_name: '',
    notes: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dsar_queue' as any)
        .select('*')
        .order('request_date', { ascending: false });

      if (error) throw error;
      setRequests((data as any) || []);
    } catch (error) {
      console.error('Error fetching DSAR requests:', error);
      toast.error('Failed to load DSAR queue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('dsar_queue' as any)
        .insert([formData as any]);

      if (error) throw error;

      toast.success('DSAR request created successfully');
      setIsDialogOpen(false);
      setFormData({
        request_type: 'access',
        data_subject_email: '',
        data_subject_name: '',
        notes: ''
      });
      fetchRequests();
    } catch (error) {
      console.error('Error creating DSAR request:', error);
      toast.error('Failed to create DSAR request');
    }
  };

  const processRequest = async (requestId: string, action: 'aggregate' | 'delete') => {
    try {
      setProcessing(requestId);
      const { data, error } = await supabase.functions.invoke('process-dsar-request', {
        body: { dsar_id: requestId, action }
      });

      if (error) throw error;

      toast.success(data.message || 'DSAR request processed successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error processing DSAR request:', error);
      toast.error('Failed to process DSAR request');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any }> = {
      pending: { variant: 'outline', icon: Clock },
      processing: { variant: 'secondary', icon: AlertTriangle },
      completed: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      expired: { variant: 'destructive', icon: AlertTriangle }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      access: 'Right to Access',
      rectification: 'Right to Rectification',
      erasure: 'Right to Erasure',
      portability: 'Right to Portability',
      restriction: 'Right to Restriction',
      objection: 'Right to Objection'
    };
    return labels[type] || type;
  };

  const isDeadlineNear = (deadline: string) => {
    const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading DSAR Queue...</p>
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
              <FileText className="h-8 w-8 text-primary" />
              DSAR Queue
            </h1>
            <p className="text-muted-foreground mt-2">
              Data Subject Access Requests (GDPR Art. 15-20)
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create DSAR Request</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>New DSAR Request</DialogTitle>
                  <DialogDescription>
                    Create a new Data Subject Access Request
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="request_type">Request Type</Label>
                    <Select
                      value={formData.request_type}
                      onValueChange={(value) => setFormData({ ...formData, request_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="access">Right to Access (Art. 15)</SelectItem>
                        <SelectItem value="rectification">Right to Rectification (Art. 16)</SelectItem>
                        <SelectItem value="erasure">Right to Erasure (Art. 17)</SelectItem>
                        <SelectItem value="portability">Right to Portability (Art. 20)</SelectItem>
                        <SelectItem value="restriction">Right to Restriction (Art. 18)</SelectItem>
                        <SelectItem value="objection">Right to Objection (Art. 21)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="data_subject_email">Data Subject Email</Label>
                    <Input
                      id="data_subject_email"
                      type="email"
                      value={formData.data_subject_email}
                      onChange={(e) => setFormData({ ...formData, data_subject_email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="data_subject_name">Data Subject Name (Optional)</Label>
                    <Input
                      id="data_subject_name"
                      value={formData.data_subject_name}
                      onChange={(e) => setFormData({ ...formData, data_subject_name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Type</TableHead>
                <TableHead>Data Subject</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No DSAR requests in queue
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {getRequestTypeLabel(request.request_type)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.data_subject_email}</div>
                        {request.data_subject_name && (
                          <div className="text-sm text-muted-foreground">{request.data_subject_name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(request.request_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className={isDeadlineNear(request.deadline) ? 'text-destructive font-medium' : ''}>
                        {new Date(request.deadline).toLocaleDateString()}
                        {isDeadlineNear(request.deadline) && (
                          <div className="text-xs">Urgent!</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            {(request.request_type === 'access' || request.request_type === 'portability') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => processRequest(request.id, 'aggregate')}
                                disabled={processing === request.id}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Export Data
                              </Button>
                            )}
                            {request.request_type === 'erasure' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => processRequest(request.id, 'delete')}
                                disabled={processing === request.id}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete Data
                              </Button>
                            )}
                          </>
                        )}
                        {request.status === 'completed' && request.aggregated_data && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            View Result
                          </Button>
                        )}
                      </div>
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

export default DSARQueue;
