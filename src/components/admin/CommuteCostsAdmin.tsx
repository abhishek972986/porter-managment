import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { commuteCostsAPI, locationsAPI, carriersAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { CommuteCost } from '@/types';
import { useForm } from 'react-hook-form';
import { formatCurrency } from '@/lib/utils';

export const CommuteCostsAdmin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<CommuteCost | null>(null);
  const queryClient = useQueryClient();

  const { data: costs = [], isLoading } = useQuery({
    queryKey: ['commute-costs'],
    queryFn: commuteCostsAPI.getAll,
  });

  const costsList = Array.isArray(costs) ? costs : [];

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsAPI.getAll,
  });

  const { data: carriers = [] } = useQuery({
    queryKey: ['carriers'],
    queryFn: carriersAPI.getAll,
  });

  // Ensure arrays
  const locationsList = Array.isArray(locations) ? locations : [];
  const carriersList = Array.isArray(carriers) ? carriers : [];

  const createMutation = useMutation({
    mutationFn: commuteCostsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commute-costs'] });
      toast.success('Cost created successfully!');
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CommuteCost> }) =>
      commuteCostsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commute-costs'] });
      toast.success('Cost updated successfully!');
      setIsModalOpen(false);
      setEditingCost(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: commuteCostsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commute-costs'] });
      toast.success('Cost deleted successfully!');
    },
  });

  const { register, handleSubmit, reset } = useForm<Omit<CommuteCost, 'id'>>({
    defaultValues: editingCost || {
      fromLocation: '',
      toLocation: '',
      carrier: '',
      cost: 0,
    },
  });

  const onSubmit = (data: Omit<CommuteCost, 'id'>) => {
    if (editingCost) {
      updateMutation.mutate({ id: editingCost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAdd = () => {
    setEditingCost(null);
    reset({
      fromLocation: '',
      toLocation: '',
      carrier: '',
      cost: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (cost: any) => {
    const normalizedCost = {
      id: cost._id || cost.id,
      fromLocation: typeof cost.fromLocation === 'object' ? (cost.fromLocation._id || cost.fromLocation.id) : cost.fromLocation,
      toLocation: typeof cost.toLocation === 'object' ? (cost.toLocation._id || cost.toLocation.id) : cost.toLocation,
      carrier: typeof cost.carrier === 'object' ? (cost.carrier._id || cost.carrier.id) : cost.carrier,
      cost: cost.cost,
      active: cost.active,
    };
    setEditingCost(normalizedCost);
    reset(normalizedCost);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this cost entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const getLocationName = (location: any) => {
    if (!location) return 'Unknown';
    // Handle populated object
    if (typeof location === 'object') {
      return location.name || location.code || 'Unknown';
    }
    // Handle ID string
    const loc = locationsList.find((l: any) => (l._id || l.id) === location);
    return loc?.name || loc?.code || 'Unknown';
  };

  const getCarrierName = (carrier: any) => {
    if (!carrier) return 'Unknown';
    // Handle populated object
    if (typeof carrier === 'object') {
      return carrier.name ? carrier.name.replace(/-/g, ' ') : 'Unknown';
    }
    // Handle ID string
    const carr = carriersList.find((c: any) => (c._id || c.id) === carrier);
    return carr?.name ? carr.name.replace(/-/g, ' ') : 'Unknown';
  };

  const locationOptions = [
    { value: '', label: 'Select location' },
    ...locationsList.map((l: any) => ({ value: l._id || l.id, label: l.name })),
  ];

  const carrierOptions = [
    { value: '', label: 'Select carrier' },
    ...carriersList.map((c: any) => ({ 
      value: c._id || c.id, 
      label: c.name ? c.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Unknown'
    })),
  ];

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Commute Costs Management</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cost
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Carrier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {costsList.map((cost: any) => (
                  <tr key={cost._id || cost.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLocationName(cost.fromLocation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLocationName(cost.toLocation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {getCarrierName(cost.carrier)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {formatCurrency(cost.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(cost)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cost._id || cost.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCost(null);
        }}
        title={editingCost ? 'Edit Commute Cost' : 'Add New Commute Cost'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="From Location" options={locationOptions} {...register('fromLocation')} required />
          <Select label="To Location" options={locationOptions} {...register('toLocation')} required />
          <Select label="Carrier" options={carrierOptions} {...register('carrier')} required />
          <Input
            label="Cost ($)"
            type="number"
            step="0.01"
            {...register('cost', { valueAsNumber: true })}
            required
          />
          <Button type="submit" className="w-full">
            {editingCost ? 'Update' : 'Create'} Cost
          </Button>
        </form>
      </Modal>
    </>
  );
};

