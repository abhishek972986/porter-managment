import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, FileText, Calendar, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { attendanceAPI, portersAPI, activitiesAPI, type Activity } from '@/lib/api';
import type { AttendanceEntry, Porter } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: recentAttendance = [], isLoading: attendanceLoading } = useQuery<AttendanceEntry[]>({
    queryKey: ['recent-attendance'],
    queryFn: () => attendanceAPI.getAll(),
    select: (data) => {
      const sorted = Array.isArray(data) ? [...data] : [] as AttendanceEntry[];
      return sorted.sort((a, b) => 
        new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      ).slice(0, 10);
    },
    refetchInterval: 30000,
  });

  const { data: allPorters = [] } = useQuery<Porter[]>({
    queryKey: ['porters'],
    queryFn: () => portersAPI.getAll(),
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: () => activitiesAPI.getAll(15),
    refetchInterval: 30000,
  });

  const portersList: Porter[] = Array.isArray(allPorters) ? allPorters : [];
  const activePorters = portersList.filter((p) => p.active).length;
  const todayAttendance = Array.isArray(recentAttendance) 
    ? recentAttendance.filter((a) => {
        const entryDate = new Date(a.date);
        const today = new Date();
        return entryDate.toDateString() === today.toDateString();
      })
    : [];
  const totalCostToday = todayAttendance.reduce((sum: number, a) => sum + (a.computedCost || 0), 0);
  
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthlyAttendance = Array.isArray(recentAttendance)
    ? recentAttendance.filter((a) => {
        const entryMonth = format(new Date(a.date), 'yyyy-MM');
        return entryMonth === currentMonth;
      })
    : [];
  const totalCostThisMonth = monthlyAttendance.reduce((sum: number, a) => sum + (a.computedCost || 0), 0);

  if (attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Commutes Today',
      value: todayAttendance.length,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtext: `${formatCurrency(totalCostToday)} total`,
    },
    {
      title: 'Cost This Month',
      value: formatCurrency(totalCostThisMonth),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtext: `${monthlyAttendance.length} trips`,
    },
    {
      title: 'Total Entries',
      value: Array.isArray(recentAttendance) ? recentAttendance.length : 0,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      subtext: 'All time',
    },
    {
      title: 'Active Porters',
      value: activePorters,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtext: `of ${portersList.length} total`,
    },
  ];

  const quickActions = [
    {
      title: 'Attendance Calendar',
      description: 'View and manage daily commutes',
      icon: Calendar,
      action: () => navigate('/attendance'),
      color: 'primary',
    },
    {
      title: 'Monthly Reports',
      description: 'Generate salary reports',
      icon: BarChart3,
      action: () => navigate('/reports'),
      color: 'secondary',
    },
    {
      title: 'Document Generator',
      description: 'Create monthly documents',
      icon: FileText,
      action: () => navigate('/documents'),
      color: 'secondary',
    },
    {
      title: 'Master Data',
      description: 'Manage porters and locations',
      icon: Users,
      action: () => navigate('/admin'),
      color: 'secondary',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.subtext && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={action.action}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <action.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No recent activities</p>
            <p className="text-sm">System activities will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const activityDate = new Date(activity.createdAt);
              const isToday = activityDate.toDateString() === new Date().toDateString();
              
              // Determine icon and color based on activity type
              let icon = Calendar;
              let bgColor = 'bg-blue-100';
              let iconColor = 'text-blue-600';
              
              if (activity.type.includes('created')) {
                icon = FileText;
                bgColor = 'bg-green-100';
                iconColor = 'text-green-600';
              } else if (activity.type.includes('updated')) {
                icon = BarChart3;
                bgColor = 'bg-yellow-100';
                iconColor = 'text-yellow-600';
              } else if (activity.type.includes('deleted')) {
                icon = TrendingUp;
                bgColor = 'bg-red-100';
                iconColor = 'text-red-600';
              } else if (activity.type === 'user_login') {
                icon = Users;
                bgColor = 'bg-purple-100';
                iconColor = 'text-purple-600';
              }
              
              const Icon = icon;
              const userName = activity.user?.name || 'System';
              
              return (
                <div
                  key={activity._id}
                  className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-600">
                      by {userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isToday 
                        ? format(activityDate, 'HH:mm') + ' today'
                        : format(activityDate, 'MMM dd, yyyy HH:mm')
                      }
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;