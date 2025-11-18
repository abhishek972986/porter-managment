import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { TrendingUp, Users, Truck, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { reportsAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['monthly-report', selectedMonth],
    queryFn: () => reportsAPI.getMonthlyReport(selectedMonth),
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, 'yyyy-MM');
  });

  const monthOptions = months.map((m) => ({
    value: m,
    label: format(new Date(m + '-01'), 'MMMM yyyy'),
  }));

  const summary = reportData?.summary;
  const porters = reportData?.porters || [];
  const stats = reportData?.statistics;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive analytics and porter salaries</p>
        </div>
        <div className="w-64">
          <Select
            label=""
            options={monthOptions}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Porters</p>
              <p className="text-3xl font-bold text-blue-900">{summary?.totalPorters || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Trips</p>
              <p className="text-3xl font-bold text-green-900">{summary?.totalTrips || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Total Payroll</p>
              <p className="text-3xl font-bold text-purple-900">
                {formatCurrency(summary?.totalPayroll || 0)}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">Avg per Trip</p>
              <p className="text-3xl font-bold text-orange-900">
                {summary?.totalTrips
                  ? formatCurrency(Math.round((summary.totalPayroll || 0) / summary.totalTrips))
                  : '₹0'}
              </p>
            </div>
            <Truck className="w-10 h-10 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Porter Salaries Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Porter Salaries</h3>
        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Loading report data...</p>
        ) : porters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porter ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg per Trip
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {porters.map((porter) => (
                  <tr key={porter._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {porter.porterUid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {porter.porterName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {porter.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {porter.totalTrips}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {formatCurrency(porter.totalSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(Math.round(porter.totalSalary / porter.totalTrips))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No data for selected month</p>
        )}
      </Card>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carrier Statistics */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Carrier Usage
            </h3>
            {stats.carriers.length > 0 ? (
              <div className="space-y-3">
                {stats.carriers.map((carrier) => (
                  <div key={carrier._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {carrier.carrierName.replace(/-/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-600">{carrier.count} trips</p>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(carrier.totalCost)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No carrier data</p>
            )}
          </Card>

          {/* Top Locations */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Top Locations
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Most Common Origins</p>
                <div className="space-y-2">
                  {stats.topFromLocations.slice(0, 5).map((loc) => (
                    <div key={loc._id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{loc.locationName}</span>
                      <span className="font-medium text-gray-900">{loc.count} trips</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Most Common Destinations</p>
                <div className="space-y-2">
                  {stats.topToLocations.slice(0, 5).map((loc) => (
                    <div key={loc._id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{loc.locationName}</span>
                      <span className="font-medium text-gray-900">{loc.count} trips</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
