import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { portersAPI, locationsAPI, carriersAPI, commuteCostsAPI, attendanceAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Porter, Location, Carrier } from '@/types';

const entrySchema = z.object({
  porter: z.string().min(1, 'Porter is required'),
  carrier: z.string().min(1, 'Carrier is required'),
  date: z.string().min(1, 'Date is required'),
  locationFrom: z.string().min(1, 'From location is required'),
  locationTo: z.string().min(1, 'To location is required'),
  task: z.string(),
});

type EntryFormData = z.infer<typeof entrySchema>;

interface DailyEntryFormProps {
  defaultDate?: string;
  onSuccess?: () => void;
}

export const DailyEntryForm: React.FC<DailyEntryFormProps> = ({ defaultDate, onSuccess }) => {
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [isLoadingCost, setIsLoadingCost] = useState(false);

  const { data: porters = [], isLoading: isLoadingPorters } = useQuery({
    queryKey: ['porters'],
    queryFn: () => portersAPI.getAll(),
  });

  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsAPI.getAll(),
  });

  const { data: carriers = [], isLoading: isLoadingCarriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: () => carriersAPI.getAll(),
  });

  // Ensure arrays
  const portersList = Array.isArray(porters) ? porters : [];
  const locationsList = Array.isArray(locations) ? locations : [];
  const carriersList = Array.isArray(carriers) ? carriers : [];

  // Try to find WH01 (Main Warehouse) or use the first location
  const factoryLocation = locationsList.find((loc: Location) => loc.code === 'WH01') || locationsList[0];
  const factoryId = factoryLocation?.id || '';

  const form = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: defaultDate || new Date().toISOString().split('T')[0],
      locationFrom: factoryId || '',
      carrier: '',
      porter: '',
      locationTo: '',
      task: '',
    },
  });
  
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = form;

  // Update locationFrom when factoryId changes
  useEffect(() => {
    if (factoryId) {
      setValue('locationFrom', factoryId);
    }
  }, [factoryId, setValue]);

  const createMutation = useMutation({
    mutationFn: attendanceAPI.create,
    onSuccess: () => {
      toast.success('Entry added successfully!');
      reset({
        date: defaultDate || new Date().toISOString().split('T')[0],
        locationFrom: factoryId,
        carrier: '',
        porter: '',
        locationTo: '',
        task: '',
      });
      setEstimatedCost(null);
      onSuccess?.();
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Attendance creation error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add entry';
      toast.error(errorMessage);
    },
  });

  const carrier = watch('carrier');
  const locationFrom = watch('locationFrom');
  const locationTo = watch('locationTo');

  useEffect(() => {
    if (carrier && locationFrom && locationTo && locationFrom !== locationTo) {
      setIsLoadingCost(true);
      commuteCostsAPI
        .findCost(locationFrom, locationTo, carrier)
        .then((data) => {
          setEstimatedCost(data.cost);
        })
        .catch(() => {
          setEstimatedCost(0);
        })
        .finally(() => {
          setIsLoadingCost(false);
        });
    } else {
      setEstimatedCost(null);
    }
  }, [carrier, locationFrom, locationTo]);

  const onSubmit = (data: EntryFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Validation errors:', errors);
    
    const submissionData = {
      porter: data.porter,
      carrier: data.carrier,
      date: data.date,
      locationFrom: data.locationFrom,
      locationTo: data.locationTo,
      task: data.task || 'Regular commute',
    };
    
    console.log('Submitting attendance data:', submissionData);
    createMutation.mutate(submissionData);
  };

  const porterOptions = [
    { value: '', label: isLoadingPorters ? 'Loading porters...' : 'Select a porter' },
    ...portersList.map((p: Porter) => ({ value: p.id, label: p.name })),
  ];

  const carrierOptions = [
    { value: '', label: isLoadingCarriers ? 'Loading carriers...' : 'Select carrier type' },
    ...carriersList.map((c: Carrier) => ({ 
      value: c.id, 
      label: c.name ? c.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Unknown'
    })),
  ];

  const locationOptions = [
    { value: '', label: isLoadingLocations ? 'Loading locations...' : 'Select location' },
    ...locationsList.map((l: Location) => ({ value: l.id, label: l.name })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Porter"
        options={porterOptions}
        error={errors.porter?.message}
        {...register('porter')}
      />

      <Select
        label="Carrier Type"
        options={carrierOptions}
        error={errors.carrier?.message}
        {...register('carrier')}
      />

      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />

      <Select
        label="From Location"
        options={locationOptions}
        error={errors.locationFrom?.message}
        {...register('locationFrom')}
      />

      <Select
        label="To Location"
        options={locationOptions}
        error={errors.locationTo?.message}
        {...register('locationTo')}
      />

      <Textarea
        label="Task Description (Optional)"
        placeholder="Describe the task..."
        error={errors.task?.message}
        {...register('task')}
      />

      {estimatedCost !== null && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Estimated Cost</p>
          <p className="text-2xl font-bold text-blue-900">
            {isLoadingCost ? 'Calculating...' : formatCurrency(estimatedCost)}
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={createMutation.isPending || isLoadingCost || isLoadingPorters || isLoadingCarriers || isLoadingLocations}
      >
        {createMutation.isPending ? 'Adding...' : isLoadingPorters || isLoadingCarriers || isLoadingLocations ? 'Loading...' : 'Add Entry'}
      </Button>
    </form>
  );
};

