import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FIELDS_API_METHODS } from '../-api-methods';
import  type { Field } from '../-api-types';
import { ImageUpload } from '@/components/ImageUpload';

const fieldSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  cropType: z.string().min(1, 'Crop type is required'),
  plantingDate: z.string().min(1, 'Planting date is required'),
  currentStage: z.enum(['Planted', 'Growing', 'Ready', 'Harvested']),
  images: z.array(z.instanceof(File)).optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

interface FieldFormProps {
  field?: Field;
  onSuccess: () => void;
}

export default function FieldForm({ field, onSuccess }: FieldFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!field;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: field?.name || '',
      cropType: field?.cropType || '',
      plantingDate: field?.plantingDate ? new Date(field.plantingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      currentStage: field?.currentStage || 'Planted',
      images: [],
    },
  });

  const selectedImages = watch('images') || [];

  const mutation = useMutation({
    mutationFn: (values: FieldFormValues) =>
      isEditing
        ? FIELDS_API_METHODS.updateField(field.id, values)
        : FIELDS_API_METHODS.createField(values),
    onSuccess: () => {
      toast.success(`Field ${isEditing ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} field`);
    },
  });

  const onSubmit = (data: FieldFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name">Field Name</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input {...field} id="name" placeholder="e.g. North Farm - Plot B" className="rounded-none h-11" />
          )}
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cropType">Crop Type</Label>
        <Controller
          name="cropType"
          control={control}
          render={({ field }) => (
            <Input {...field} id="cropType" placeholder="e.g. Soybeans" className="rounded-none h-11" />
          )}
        />
        {errors.cropType && <p className="text-xs text-red-600">{errors.cropType.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="plantingDate">Planting Date</Label>
        <Controller
          name="plantingDate"
          control={control}
          render={({ field }) => (
            <Input {...field} id="plantingDate" type="date" className="rounded-none h-11" />
          )}
        />
        {errors.plantingDate && <p className="text-xs text-red-600">{errors.plantingDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentStage">Current Stage</Label>
        <Controller
          name="currentStage"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
        {errors.currentStage && <p className="text-xs text-red-600">{errors.currentStage.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Field Images</Label>
        <ImageUpload
          value={selectedImages}
          onChange={(files) => setValue('images', files)}
          onRemove={(file) => setValue('images', selectedImages.filter((f) => f !== file))}
        />
        {field?.images && field.images.length > 0 && !isEditing && (
           <div className="mt-2 text-xs text-gray-500">
             Note: This field already has {(field as Field).images.length} images.
           </div>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-bold rounded-none mt-6"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Saving...' : isEditing ? 'Update Field' : 'Create Field'}
      </Button>
    </form>
  );
}
