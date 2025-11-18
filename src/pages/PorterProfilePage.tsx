import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { portersAPI, payrollAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export const PorterProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const defaultMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [month, setMonth] = useState<string>(defaultMonth);

  const { data: porter } = useQuery({
    queryKey: ['porter', id],
    queryFn: () => portersAPI.getById(id!),
    enabled: !!id,
  });

  const { data: payroll, isFetching: isPayrollLoading } = useQuery({
    queryKey: ['porter-payroll', id, month],
    queryFn: () => payrollAPI.getPorterPayroll(id!, month),
    enabled: !!id && !!month,
  });

  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const payMutation = useMutation({
    mutationFn: (amount: number) =>
      payrollAPI.setPaymentStatus(id!, { month, isPaid: true, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['porter-payroll', id, month] });
      setPaymentAmount('');
    },
  });

  if (!porter) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const totalTrips = payroll?.totalTrips ?? 0;
  const totalMonthlyCost = payroll?.totalSalary ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Porter Profile</h1>
        <p className="text-gray-600 mt-1">View porter details and activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{porter.name}</h2>
            
          </div>
          <div className="mt-6 space-y-3">
            {porter.createdAt && typeof porter.createdAt === 'string' && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">Joined {formatDate(porter.createdAt)}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Monthly Summary */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
            <input
              type="month"
              className="border rounded-md px-3 py-2 text-sm text-gray-700"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Commutes</p>
              <p className="text-3xl font-bold text-blue-900">{totalTrips}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Total Salary</p>
              <p className="text-3xl font-bold text-green-900">
                {formatCurrency(totalMonthlyCost)}
              </p>
            </div>
          </div>

          {/* Payment Section */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Payment Management</h4>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">Total Salary</p>
                <p className="text-xl font-bold text-blue-900">
                  {formatCurrency(totalMonthlyCost)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium">Already Paid</p>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(payroll?.payment?.amount || 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-700 font-medium">Left to Pay</p>
                <p className="text-xl font-bold text-orange-900">
                  {formatCurrency(Math.max(0, totalMonthlyCost - (payroll?.payment?.amount || 0)))}
                </p>
              </div>
            </div>

            {/* Payment Form */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={paymentAmount}
                    placeholder="Enter amount to pay"
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    min={0}
                    step={1}
                    disabled={payMutation.isPending || isPayrollLoading}
                  />
                </div>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={() => {
                    const amount = Number(paymentAmount);
                    if (amount > 0) {
                      const newTotal = (payroll?.payment?.amount || 0) + amount;
                      payMutation.mutate(newTotal);
                    }
                  }}
                  disabled={payMutation.isPending || isPayrollLoading || !paymentAmount || Number(paymentAmount) <= 0}
                >
                  {payMutation.isPending ? 'Processing...' : 'Pay Amount'}
                </button>
              </div>
              {payroll?.payment?.paidAt && (
                <p className="text-xs text-gray-600 mt-2">
                  Last payment on {formatDate(payroll.payment.paidAt)}
                </p>
              )}
            </div>
          </div>

          {/* Recent entries listing intentionally omitted for now to focus on salary & payment */}
        </Card>
      </div>
    </div>
  );
};
