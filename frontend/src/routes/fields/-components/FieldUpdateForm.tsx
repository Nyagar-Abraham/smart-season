import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FIELDS_API_METHODS } from '../-api-methods';
import type { Field } from '../-api-types';

const updateSchema = z.object({
  stageUpdate: z.enum(['Planted', 'Growing', 'Ready', 'Harvested']),
  notes: z.string().min(1, 'Please add some observations or notes'),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

interface FieldUpdateFormProps {
  field: Field;
  onSuccess: () => void;
}

export default function FieldUpdateForm({ field, onSuccess }: FieldUpdateFormProps) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      stageUpdate: field.currentStage,
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: UpdateFormValues) =>
      FIELDS_API_METHODS.createFieldUpdate(field.id, values),
    onSuccess: () => {
      toast.success('Field update submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      queryClient.invalidateQueries({ queryKey: ['fieldUpdates', field.id] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit update');
    },
  });

  const onSubmit = (data: UpdateFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="stageUpdate">Update Stage</Label>
        <Controller
          name="stageUpdate"
          control={control}
          render={({ field: selectField }) => (
            <Select onValueChange={selectField.onChange} value={selectField.value}>
              <SelectTrigger className="rounded-none h-11">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planted">Planted</SelectItem>
                <SelectItem value="Growing">Growing</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Harvested">Harvested</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.stageUpdate && <p className="text-xs text-red-600">{errors.stageUpdate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observations / Notes</Label>
        <Controller
          name="notes"
          control={control}
          render={({ field: textAreaField }) => (
            <Textarea
              {...textAreaField}
              id="notes"
              placeholder="Describe current field conditions, pests, weather effects, etc."
              className="rounded-none min-h-[120px]"
            />
          )}
        />
        {errors.notes && <p className="text-xs text-red-600">{errors.notes.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-bold rounded-none mt-6"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Submitting...' : 'Submit Update'}
      </Button>
    </form>
  );
}
