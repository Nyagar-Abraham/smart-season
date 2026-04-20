import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Search, Eye, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FIELDS_API_METHODS } from './fields/-api-methods';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FieldForm from './fields/-components/FieldForm';
import FieldUpdateForm from './fields/-components/FieldUpdateForm';
import { Link } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: DashboardOverview,
});

function DashboardOverview() {
  const { user } = useAuth();
  const role = user?.role || 'field_agent';
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [updatingField, setUpdatingField] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: fieldsResponse, isLoading: isLoadingFields } = useQuery({
    queryKey: ['fields'],
    queryFn: FIELDS_API_METHODS.getAllFields,
  });

  const refreshMutation = useMutation({
    mutationFn: (id: number) => FIELDS_API_METHODS.refreshFieldStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      toast.success('Field status refreshed successfully');
    },
    onError: () => {
      toast.error('Failed to refresh field status');
    }
  });

  const fields = fieldsResponse?.data || [];

  const atRiskFields = useMemo(() => {
    return fields.filter(f => f.status === 'At Risk');
  }, [fields]);

  const stats = useMemo(() => {
    return {
      total: fields.length,
      active: fields.filter(f => f.status === 'Active').length,
      atRisk: fields.filter(f => f.status === 'At Risk').length,
      completed: fields.filter(f => f.status === 'Completed').length
    };
  }, [fields]);

  const filteredAssignedFields = useMemo(() => {
    return fields.filter(f => 
      f.assignedAgentId === user?.id && 
      (f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.cropType.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [fields, user, searchTerm]);

  if (role === 'admin') {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user?.fullName || 'Coordinator'}.</p>
            </div>
            <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-700 hover:bg-green-800 rounded-none">+ Add New Field</Button>
              </DialogTrigger>
              <DialogContent className="rounded-none sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-green-900 uppercase">Add New Field</DialogTitle>
                </DialogHeader>
                <FieldForm onSuccess={() => setIsAddFieldOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Total Fields" value={stats.total} sublabel="Current Fields" color="green" />
            <StatsCard label="Active Fields" value={stats.active} sublabel="In Progress" color="green" />
            <StatsCard label="At Risk" value={stats.atRisk} sublabel="Needs Attention" color="red" />
            <StatsCard label="Completed" value={stats.completed} sublabel="Harvested" color="orange" />
          </div>

          {/* At Risk Table */}
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-50">
              <CardTitle className="text-lg font-bold">Recent Fields</CardTitle>
              <Button variant="outline" size="sm" className="rounded-none h-8 text-xs" asChild>
                <Link to="/fields">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 bg-white">
              {isLoadingFields ? (
                <div className="p-8 text-center text-gray-500">Loading fields...</div>
              ) : atRiskFields.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No fields found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[300px]">Field</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskFields.map((field) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{field.name}</span>
                            <span className="text-xs text-gray-400">Created {new Date(field.createdAt).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge status={field.status} />
                            <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">{field.currentStage}</span>
                          </div>
                        </TableCell>
                        <TableCell>{field.cropType}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-none h-8 w-8 p-0"
                              onClick={() => refreshMutation.mutate(field.id)}
                              disabled={refreshMutation.isPending}
                              title="Refresh AI Status"
                            >
                              <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending && refreshMutation.variables === field.id ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-none h-8 text-xs" asChild>
                              <Link to="/fields/$fieldId" params={{ fieldId: field.id.toString() }}>View</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="field_agent">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-600 flex items-center justify-center bg-green-100 text-green-700 font-bold">
              {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-gray-500">Welcome, {user?.fullName?.split(' ')[0] || 'Agent'}.</p>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search assigned fields..." 
              className="pl-9 h-9 rounded-none" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard label="My Fields" value={filteredAssignedFields.length} color="green" />
          <StatsCard label="At Risk" value={filteredAssignedFields.filter(f => f.status === 'At Risk').length} color="red" />
          <StatsCard label="Active" value={filteredAssignedFields.filter(f => f.status === 'Active').length} color="green" />
        </div>

        {/* Assigned Fields List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Assigned Fields</h2>
            <Button variant="ghost" size="sm" className="text-gray-500">View All</Button>
          </div>
          
          {isLoadingFields ? (
            <div className="text-center py-8 text-gray-500">Loading your fields...</div>
          ) : filteredAssignedFields.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No assigned fields found matching your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssignedFields.map((field) => (
                <Card key={field.id} className="border-none shadow-sm rounded-xl overflow-hidden group hover:ring-1 hover:ring-green-600 transition-all cursor-pointer bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-green-50 rounded-lg text-xl">
                        {field.cropType.toLowerCase().includes('corn') ? '🌽' :
                         field.cropType.toLowerCase().includes('soy') ? '🌱' :
                         field.cropType.toLowerCase().includes('wheat') ? '🌾' : '🚜'}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={field.status} />
                        <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">{field.currentStage}</span>
                      </div>
                    </div>
                    <div className="space-y-1 mb-4">
                      <h3 className="font-bold text-gray-900">{field.name}</h3>
                      <p className="text-xs text-gray-500">{field.cropType}</p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex gap-2">
                         <Link to="/fields/$fieldId" params={{ fieldId: field.id.toString() }}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-none border-gray-300">
                                <Eye className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-none border-gray-300"
                          onClick={(e) => {
                            e.preventDefault();
                            refreshMutation.mutate(field.id);
                          }}
                          disabled={refreshMutation.isPending}
                          title="Refresh Status"
                        >
                          <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending && refreshMutation.variables === field.id ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs rounded-none border-gray-300"
                          onClick={() => setUpdatingField(field)}
                        >
                          Update
                        </Button>
                      </div>
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold uppercase tracking-wider">
                        {field.currentStage}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!updatingField} onOpenChange={(open) => !open && setUpdatingField(null)}>
        <DialogContent className="rounded-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-900 uppercase">Update Field State</DialogTitle>
          </DialogHeader>
          {updatingField && (
            <FieldUpdateForm
              field={updatingField}
              onSuccess={() => setUpdatingField(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
