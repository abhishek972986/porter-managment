import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { carriersAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { Carrier } from '@/types';
import { useForm } from 'react-hook-form';

export const CarriersAdmin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const queryClient = useQueryClient();

  const { data: carriers = [], isLoading } = useQuery({
    queryKey: ['carriers'],
    queryFn: carriersAPI.getAll,
  });

  const carriersList = Array.isArray(carriers) ? carriers : [];

  const createMutation = useMutation({
    mutationFn: carriersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      toast.success('Carrier created successfully!');
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Carrier> }) =>
      carriersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      toast.success('Carrier updated successfully!');
      setIsModalOpen(false);
      setEditingCarrier(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: carriersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] });
      toast.success('Carrier deleted successfully!');
    },
  });

  const { register, handleSubmit, reset } = useForm<Omit<Carrier, 'id'>>({
    defaultValues: editingCarrier || {
      name: 'porter',
      capacityKg: 0,
      active: true,
    },
  });

  const onSubmit = (data: Omit<Carrier, 'id'>) => {
    if (editingCarrier) {
      updateMutation.mutate({ id: editingCarrier.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  const handleAdd = () => {
    setEditingCarrier(null);
    reset({ name: 'porter', capacityKg: 0, active: true });
    setIsModalOpen(true);
  };

  const handleEdit = (carrier: any) => {
    const normalizedCarrier = {
      ...carrier,
      id: carrier._id || carrier.id,
    };
    setEditingCarrier(normalizedCarrier);
    reset(normalizedCarrier);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this carrier?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Carriers Management</h2>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Carrier
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Capacity (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {carriersList.map((carrier: any) => (
                  <tr key={carrier._id || carrier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 capitalize">
                      {carrier.name ? carrier.name.replace(/-/g, ' ') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {carrier.capacityKg || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        carrier.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {carrier.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(carrier)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(carrier._id || carrier.id)}
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
          setEditingCarrier(null);
        }}
        title={editingCarrier ? 'Edit Carrier' : 'Add New Carrier'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Name"
            options={[
              { value: 'porter', label: 'Porter' },
              { value: 'small-donkey', label: 'Small Donkey' },
              { value: 'pickup-truck', label: 'Pickup Truck' },
            ]}
            {...register('name')}
            required
          />
          <Input
            label="Capacity (kg)"
            type="number"
            step="0.1"
            {...register('capacityKg', { valueAsNumber: true })}
            placeholder="e.g., 50"
            required
          />
          <Select
            label="Status"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            {...register('active')}
          />
          <Button type="submit" className="w-full">
            {editingCarrier ? 'Update' : 'Create'} Carrier
          </Button>
        </form>
      </Modal>
    </>
  );
};
