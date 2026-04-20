import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FIELDS_API_METHODS, AGENTS_API_METHODS } from '../-api-methods';
import type { Field } from '../-api-types';
import { useState } from 'react';

interface AssignFieldDialogProps {
  field: Field;
  onSuccess: () => void;
}

export default function AssignFieldDialog({ field, onSuccess }: AssignFieldDialogProps) {
  const queryClient = useQueryClient();
  const [selectedAgentId, setSelectedAgentId] = useState<string>(field.assignedAgentId?.toString() || '');

  const { data: agentsResponse, isLoading: isLoadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: AGENTS_API_METHODS.getAllAgents,
  });

  const mutation = useMutation({
    mutationFn: (agentId: number | null) =>
      FIELDS_API_METHODS.assignField(field.id, { agentId }),
    onSuccess: () => {
      toast.success('Field assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['fields'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign field');
    },
  });

  const handleAssign = () => {
    mutation.mutate(selectedAgentId ? parseInt(selectedAgentId) : null);
  };
  
  console.log('agentsResponse', agentsResponse);

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="agent">Select Agent</Label>
        <Select onValueChange={setSelectedAgentId} value={selectedAgentId}>
          <SelectTrigger className="rounded-none h-11">
            <SelectValue placeholder="Select an agent" />
          </SelectTrigger>
          <SelectContent>
            {/*<SelectItem value="">Unassigned</SelectItem>*/}
            {agentsResponse?.data?.map((agent: any) => (
              <SelectItem key={agent.id} value={agent.id.toString()}>
                {agent.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleAssign}
        className="w-full h-12 bg-green-700 hover:bg-green-800 text-white font-bold rounded-none mt-6"
        disabled={mutation.isPending || isLoadingAgents}
      >
        {mutation.isPending ? 'Assigning...' : 'Assign Field'}
      </Button>
    </div>
  );
}
