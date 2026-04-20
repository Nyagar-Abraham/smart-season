import { createFileRoute, redirect } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FIELDS_API_METHODS } from '../fields/-api-methods';
import { format } from 'date-fns';

const fieldUpdateSchema = z.object({
  fieldId: z.string().min(1, 'Please select a field'),
  stage: z.enum(['Planted', 'Growing', 'Ready', 'Harvested']),
  notes: z.string().min(1, 'Notes are required'),
});

type FieldUpdateValues = z.infer<typeof fieldUpdateSchema>;

export const Route = createFileRoute('/updates')({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/auth/login' });
    }
  },
  component: UpdatesPage,
});

function UpdatesPage() {
  const queryClient = useQueryClient();
  
  const { data: fieldsResponse } = useQuery({
    queryKey: ['my-fields'],
    queryFn: FIELDS_API_METHODS.getMyFields,
  });

  const { data: updatesResponse, isLoading: updatesLoading } = useQuery({
    queryKey: ['my-updates'],
    queryFn: FIELDS_API_METHODS.getMyUpdates,
  });

  const createUpdateMutation = useMutation({
    mutationFn: ({ fieldId, ...data }: FieldUpdateValues) => 
      FIELDS_API_METHODS.createFieldUpdate(parseInt(fieldId), {
        stageUpdate: data.stage,
        notes: data.notes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-updates'] });
      queryClient.invalidateQueries({ queryKey: ['my-fields'] });
      toast.success('Field update saved successfully!');
      reset();
    },
    onError: () => {
      toast.error('Failed to save update. Please try again.');
    }
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FieldUpdateValues>({
    resolver: zodResolver(fieldUpdateSchema),
    defaultValues: {
      fieldId: '',
      stage: 'Growing',
      notes: '',
    },
  });

  const selectedFieldId = watch('fieldId');
  const selectedField = fieldsResponse?.data.find(f => f.id.toString() === selectedFieldId);

  const onSubmit = (data: FieldUpdateValues) => {
    createUpdateMutation.mutate(data);
  };

  const fields = fieldsResponse?.data || [];
  const updates = updatesResponse?.data || [];

  return (
    <DashboardLayout role="field_agent">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">Add Field Update</h1>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
              {selectedField ? `${selectedField.name} - ${selectedField.cropType}` : 'Select a field to begin'}
            </p>
          </div>

          <Card className="border-none shadow-sm rounded-none">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="pt-8 space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="fieldId" className="text-gray-600 font-bold uppercase text-xs tracking-widest">Field:</Label>
                  <Controller
                    name="fieldId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="fieldId" className="h-12 border-gray-300 rounded-none focus:ring-green-600 text-base">
                          <SelectValue placeholder="Select a field" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          {fields.map((f) => (
                            <SelectItem key={f.id} value={f.id.toString()}>
                              {f.name} ({f.cropType})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.fieldId && <p className="text-xs text-red-600">{errors.fieldId.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="stage" className="text-gray-600 font-bold uppercase text-xs tracking-widest">Stage:</Label>
                  <Controller
                    name="stage"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="stage" className="h-12 border-gray-300 rounded-none focus:ring-green-600 text-base">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent className="rounded-none">
                          <SelectItem value="Planted">Planted</SelectItem>
                          <SelectItem value="Growing">Growing</SelectItem>
                          <SelectItem value="Ready">Ready</SelectItem>
                          <SelectItem value="Harvested">Harvested</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.stage && <p className="text-xs text-red-600">{errors.stage.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-gray-600 font-bold uppercase text-xs tracking-widest">Notes:</Label>
                  <Controller
                    name="notes"
                    control={control}
                    render={({ field }) => (
                      <Textarea 
                        {...field}
                        id="notes" 
                        placeholder="Record observations..." 
                        className="min-h-[150px] border-gray-300 rounded-none focus-visible:ring-green-600 text-base py-3"
                      />
                    )}
                  />
                  {errors.notes && <p className="text-xs text-red-600">{errors.notes.message}</p>}
                </div>
              </CardContent>
              <CardFooter className="pb-8">
                <Button 
                  type="submit" 
                  disabled={createUpdateMutation.isPending}
                  className="w-full bg-green-700 hover:bg-green-800 h-14 text-lg font-bold rounded-none"
                >
                  {createUpdateMutation.isPending ? 'Saving...' : 'Save Update'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Field Updates</h2>
          </div>

          <Card className="border-none shadow-sm rounded-none overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 border-b border-gray-200">
                    <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider h-12">Date</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider h-12">Field</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider h-12">Stage</TableHead>
                    <TableHead className="font-bold text-gray-700 uppercase text-xs tracking-wider h-12">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updatesLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">Loading updates...</TableCell>
                    </TableRow>
                  ) : updates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">No updates found.</TableCell>
                    </TableRow>
                  ) : (
                    updates.map((update) => {
                      const field = fields.find(f => f.id === update.fieldId);
                      return (
                        <TableRow key={update.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <TableCell className="font-semibold py-4">
                            {format(new Date(update.createdAt), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="py-4">
                            {field ? field.name : `Field #${update.fieldId}`}
                          </TableCell>
                          <TableCell className="py-4">
                            {update.stageUpdate ? <StatusBadge status={update.stageUpdate as any} /> : '-'}
                          </TableCell>
                          <TableCell className="py-4 max-w-xs truncate" title={update.notes || ''}>
                            {update.notes}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
