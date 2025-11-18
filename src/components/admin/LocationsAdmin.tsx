import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { locationsAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { Location } from '@/types';
import { useForm } from 'react-hook-form';

export const LocationsAdmin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: locationsAPI.getAll,
  });

  const locationsList = Array.isArray(locations) ? locations : [];

  const createMutation = useMutation({
    mutationFn: locationsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location created successfully!');
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Location> }) =>
      locationsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully!');
      setIsModalOpen(false);
      setEditingLocation(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: locationsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully!');
    },
  });

  const { register, handleSubmit, reset } = useForm<Omit<Location, 'id'>>({
    defaultValues: editingLocation || {
      code: '',
      name: '',
    },
  });

  const onSubmit = (data: Omit<Location, 'id'>) => {
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAdd = () => {
    setEditingLocation(null);
    reset({ code: '', name: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (location: any) => {
    const normalizedLocation = {
      ...location,
      id: location._id || location.id,
    };
    setEditingLocation(normalizedLocation);
    reset(normalizedLocation);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Locations Management</h2>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Location
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
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
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
                {locationsList.map((location: any) => (
                  <tr key={location._id || location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {location.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{location.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        location.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {location.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(location)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(location._id || location.id)}
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
          setEditingLocation(null);
        }}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Code" {...register('code')} placeholder="e.g., LOC001" required />
          <Input label="Name" {...register('name')} placeholder="e.g., Main Warehouse" required />
          <Button type="submit" className="w-full">
            {editingLocation ? 'Update' : 'Create'} Location
          </Button>
        </form>
      </Modal>
    </>
  );
};

