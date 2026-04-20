import { createFileRoute, Link, Outlet, useLocation, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Eye, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { FIELDS_API_METHODS, AGENTS_API_METHODS } from './-api-methods';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import FieldForm from './-components/FieldForm';
import AssignFieldDialog from './-components/AssignFieldDialog';
import type { Field } from './-api-types';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export const Route = createFileRoute('/fields')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: FieldsListPage,
});

function FieldsListPage() {
  const { pathname } = useLocation();
  const isDetailsPage = pathname.startsWith('/fields/') && pathname !== '/fields' && pathname !== '/fields/';

  if (isDetailsPage) {
    return <Outlet />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [assigningField, setAssigningField] = useState<Field | null>(null);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: fieldsResponse, isLoading: isLoadingFields } = useQuery({
    queryKey: ['fields'],
    queryFn: FIELDS_API_METHODS.getAllFields,
  });

  const { data: agentsResponse } = useQuery({
    queryKey: ['agents'],
    queryFn: AGENTS_API_METHODS.getAllAgents,
  });

  const fields = fieldsResponse?.data || [];
  const agents = agentsResponse?.data || [];

  const filteredFields = useMemo(() => {
    return fields.filter(field =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.cropType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [fields, searchTerm]);

  const getAgentName = (agentId: number | null) => {
    if (!agentId) return 'Unassigned';
    const agent = agents.find((a: any) => a.id === agentId);
    return agent ? agent.fullName : 'Unknown Agent';
  };
  
  console.log({filteredFields})

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Fields Management</h1>
          <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800 rounded-none">+ Add Field</Button>
            </DialogTrigger>
            <DialogContent className="rounded-none sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-green-900 uppercase">Add New Field</DialogTitle>
              </DialogHeader>
              <FieldForm onSuccess={() => setIsAddFieldOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm rounded-xl overflow-hidden ">
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-white">
            <CardTitle className="text-lg font-bold">All Fields</CardTitle>
            <div className="flex items-center gap-2 max-w-xs w-full">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search fields..."
                  className="pl-9 h-9 rounded-none border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            {isLoadingFields ? (
              <div className="p-8 text-center text-gray-500">Loading fields...</div>
            ) : filteredFields.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No fields found.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredFields.map((field) => (
                  <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      {field.images && field.images.length > 0 ? (
                        <div 
                          className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setLightboxImages(field.images);
                            setLightboxIndex(0);
                          }}
                        >
                          <img src={field.images[0]} alt={field.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl text-green-600">
                          {field.cropType.toLowerCase().includes('corn') ? '🌽' :
                           field.cropType.toLowerCase().includes('soy') ? '🌱' :
                           field.cropType.toLowerCase().includes('wheat') ? '🌾' : '🚜'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{field.name}</p>
                        <p className="text-xs text-gray-500">
                          {field.cropType} • Agent: <span className={field.assignedAgentId ? 'text-gray-900 font-medium' : 'text-orange-500 font-medium italic'}>
                            {getAgentName(field.assignedAgentId)}
                          </span>
                        </p>
                        {field.aiRiskReason && field.status === 'At Risk' && (
                          <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                            <span className="font-bold">AI Note:</span> {field.aiRiskReason.length > 60 ? field.aiRiskReason.substring(0, 60) + '...' : field.aiRiskReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={field.status} />
                        <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">{field.currentStage}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link to="/fields/$fieldId" params={{ fieldId: field.id.toString() }}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-none border-gray-300">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none h-8 text-xs border-gray-300"
                          onClick={() => setEditingField(field)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none h-8 text-xs border-gray-300"
                          onClick={() => setAssigningField(field)}
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Field Dialog */}
      <Dialog open={!!editingField} onOpenChange={(open) => !open && setEditingField(null)}>
        <DialogContent className="rounded-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-900 uppercase">Edit Field</DialogTitle>
          </DialogHeader>
          {editingField && (
            <FieldForm
              field={editingField}
              onSuccess={() => setEditingField(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Field Dialog */}
      <Dialog open={!!assigningField} onOpenChange={(open) => !open && setAssigningField(null)}>
        <DialogContent className="rounded-none sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-900 uppercase">Assign Agent</DialogTitle>
          </DialogHeader>
          {assigningField && (
            <AssignFieldDialog
              field={assigningField}
              onSuccess={() => setAssigningField(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Lightbox
        open={!!lightboxImages}
        index={lightboxIndex}
        close={() => setLightboxImages(null)}
        slides={lightboxImages?.map(src => ({ src })) || []}
      />
    </DashboardLayout>
  );
}
