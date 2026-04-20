import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CropProgress } from '@/components/shared/CropProgress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Leaf, 
  Calendar, 
  User, 
  Clock,
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  Info,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FIELDS_API_METHODS } from '../-api-methods';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export const Route = createFileRoute('/fields/$fieldId')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: FieldDetailsPage,
});

function FieldDetailsPage() {
  const { fieldId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const id = parseInt(fieldId);
  const queryClient = useQueryClient();
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const { data: fieldResponse, isLoading: isLoadingField } = useQuery({
    queryKey: ['field', id],
    queryFn: () => FIELDS_API_METHODS.getFieldById(id),
  });

  const { data: updatesResponse, isLoading: isLoadingUpdates } = useQuery({
    queryKey: ['fieldUpdates', id],
    queryFn: () => FIELDS_API_METHODS.getFieldUpdates(id),
  });

  const refreshMutation = useMutation({
    mutationFn: () => FIELDS_API_METHODS.refreshFieldStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field', id] });
      toast.success('Field status refreshed successfully');
    },
    onError: () => {
      toast.error('Failed to refresh field status');
    }
  });

  if (isLoadingField) {
    return <div className="p-8 text-center">Loading field details...</div>;
  }

  const field = fieldResponse?.data;
  if (!field) {
    return <div className="p-8 text-center">Field not found</div>;
  }

  const updates = updatesResponse?.data || [];

  return (
    <DashboardLayout role={user?.role || 'field_agent'}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => navigate({ to: '/' })}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{field.name}</h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-8"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Status'}
              </Button>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={field.status} />
                <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">{field.currentStage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        {field.aiRiskReason && (
          <Card className={`border-none shadow-sm rounded-xl overflow-hidden ${
            field.status === 'At Risk' ? 'bg-amber-50' : 'bg-blue-50'
          }`}>
            <CardContent className="p-4 flex gap-4">
              <div className={`p-2 rounded-lg h-fit ${
                field.status === 'At Risk' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {field.status === 'At Risk' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <p className={`text-sm font-bold ${
                  field.status === 'At Risk' ? 'text-amber-900' : 'text-blue-900'
                }`}>
                  AI Field Insight
                </p>
                <p className={`text-sm ${
                  field.status === 'At Risk' ? 'text-amber-800' : 'text-blue-800'
                }`}>
                  {field.aiRiskReason}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Field Images Gallery */}
        {field.images && field.images.length > 0 && (
          <Card className="border-none shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <CardTitle className="text-sm font-medium text-gray-500">Field Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {field.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity border border-gray-100"
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img src={image} alt={`Field ${index}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Crop Progress Card */}
        <Card className="border-none shadow-sm rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Crop:</p>
                <p className="text-lg font-bold text-gray-900">{field.cropType}</p>
              </div>
            </div>
            <CropProgress currentStage={field.currentStage} className="flex-1" />
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Planting Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {new Date(field.plantingDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Last Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {updates.length > 0 
                    ? new Date(updates[0].createdAt).toLocaleDateString() 
                    : 'No updates yet'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Assigned Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-900">
                  {field.assignedAgentId ? `Agent ID: ${field.assignedAgentId}` : 'Unassigned'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring History */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Monitoring History</h2>
          {isLoadingUpdates ? (
            <div className="text-center py-4">Loading history...</div>
          ) : updates.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-100 bg-transparent shadow-none">
              <CardContent className="flex flex-col items-center justify-center p-8 text-gray-400">
                <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                <p>No monitoring notes recorded yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <Card key={update.id} className="border-none shadow-sm rounded-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={update.stageUpdate || field.currentStage} />
                        <span className="text-xs text-gray-400">
                          {new Date(update.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{update.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={field.images.map(src => ({ src }))}
      />
    </DashboardLayout>
  );
}
