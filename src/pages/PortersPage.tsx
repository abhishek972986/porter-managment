import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { portersAPI } from '@/lib/api';
import { toast } from 'sonner';

const porterSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  designation: z.string().optional(),
});

type PorterFormData = z.infer<typeof porterSchema>;

export const PortersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [search, setSearch] = useState('');
  const [field, setField] = useState<'name' | 'uid' | 'designation'>('name');
  const [activeOnly, setActiveOnly] = useState(false);

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: porters = [], isLoading } = useQuery({
    queryKey: ['porters', { search: debouncedSearch, field, activeOnly }],
    queryFn: () =>
      portersAPI.getAll({
        search: debouncedSearch || undefined,
        field,
        active: activeOnly || undefined,
      }),
  });

  // Ensure porters is always an array
  const portersList = Array.isArray(porters) ? porters : [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PorterFormData>({
    resolver: zodResolver(porterSchema),
  });

  const createMutation = useMutation({
    mutationFn: portersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['porters'] });
      toast.success('Porter added successfully!');
      setIsModalOpen(false);
      reset();
    },
    onError: (error: unknown) => {
      console.error('Create porter error:', error);
      const err = error as { message?: string; errors?: unknown };
      const errorMessage = err?.message || 'Failed to add porter';
      const errorDetails = err?.errors ? JSON.stringify(err.errors) : '';
      toast.error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
    },
  });

  const onSubmit = (data: PorterFormData) => {
    createMutation.mutate({ uid: data.uid, name: data.name, designation: data.designation, active: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Porters</h1>
          <p className="text-gray-600 mt-1">View all registered porters</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Porter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <Input
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-52">
          <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm text-gray-700"
            value={field}
            onChange={(e) => setField(e.target.value as 'name' | 'uid' | 'designation')}
          >
            <option value="name">Name</option>
            <option value="uid">UID</option>
            <option value="designation">Designation</option>
          </select>
        </div>
        <div className="flex items-center gap-2 h-10 md:h-auto md:mb-1">
          <input
            id="activeOnly"
            type="checkbox"
            className="h-4 w-4"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          <label htmlFor="activeOnly" className="text-sm text-gray-700">Active only</label>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500 py-12">Loading...</p>
      ) : portersList.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 mb-4">No porters found</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Porter
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portersList.map((porter) => (
            <Card
              key={porter.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/porters/${porter.id}`)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{porter.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">UID: {porter.uid}</p>
                  {porter.designation && (
                    <p className="text-sm text-gray-600">{porter.designation}</p>
                  )}
                  <span
                    className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                      porter.active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {porter.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title="Add New Porter"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UID *
            </label>
            <Input
              {...register('uid')}
              placeholder="e.g., P009"
              error={errors.uid?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <Input
              {...register('name')}
              placeholder="e.g., John Smith"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <Input
              {...register('designation')}
              placeholder="e.g., Senior Porter"
              error={errors.designation?.message}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Porter'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

