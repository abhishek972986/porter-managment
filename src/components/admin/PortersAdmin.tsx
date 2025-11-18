import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { portersAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { Porter } from '@/types';
import { useForm } from 'react-hook-form';

export const PortersAdmin: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPorter, setEditingPorter] = useState<Porter | null>(null);
  const queryClient = useQueryClient();

  const { data: porters = [], isLoading } = useQuery({
    queryKey: ['porters'],
    queryFn: portersAPI.getAll,
  });

  const portersList = Array.isArray(porters) ? porters : [];

  const createMutation = useMutation({
    mutationFn: portersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['porters'] });
      toast.success('Porter created successfully!');
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Porter> }) =>
      portersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['porters'] });
      toast.success('Porter updated successfully!');
      setIsModalOpen(false);
      setEditingPorter(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: portersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['porters'] });
      toast.success('Porter deleted successfully!');
    },
  });

  const { register, handleSubmit, reset } = useForm<Omit<Porter, 'id' | 'createdAt'>>({
    defaultValues: editingPorter || {
      uid: '',
      name: '',
      designation: '',
      active: true,
    },
  });

  const onSubmit = (data: Omit<Porter, 'id' | 'createdAt'>) => {
    if (editingPorter) {
      updateMutation.mutate({ id: editingPorter.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAdd = () => {
    setEditingPorter(null);
    reset({ uid: '', name: '', designation: '', active: true });
    setIsModalOpen(true);
  };

  const handleEdit = (porter: any) => {
    const normalizedPorter = {
      ...porter,
      id: porter._id || porter.id,
    };
    setEditingPorter(normalizedPorter);
    reset(normalizedPorter);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this porter?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Porters Management</h2>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Porter
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
                    UID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Designation
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
                {portersList.map((porter: any) => (
                  <tr key={porter._id || porter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {porter.uid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {porter.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {porter.designation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          porter.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {porter.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(porter)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(porter._id || porter.id)}
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
          setEditingPorter(null);
        }}
        title={editingPorter ? 'Edit Porter' : 'Add New Porter'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="UID" {...register('uid')} placeholder="e.g., P009" required />
          <Input label="Name" {...register('name')} placeholder="e.g., John Smith" required />
          <Input label="Designation" {...register('designation')} placeholder="e.g., Senior Porter" />
          <Select
            label="Status"
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            {...register('active')}
          />
          <Button type="submit" className="w-full">
            {editingPorter ? 'Update' : 'Create'} Porter
          </Button>
        </form>
      </Modal>
    </>
  );
};

