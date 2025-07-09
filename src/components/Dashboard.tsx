
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Target,
  Activity,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { getCustomers, getTasks, getActivities, Customer, Task, Activity as ActivityType } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStats {
  totalCustomers: number;
  activeLeads: number;
  tasksPending: number;
  tasksCompleted: number;
  customersThisMonth: number;
  tasksThisWeek: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeLeads: 0,
    tasksPending: 0,
    tasksCompleted: 0,
    customersThisMonth: 0,
    tasksThisWeek: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityType[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const customers = getCustomers();
    const tasks = getTasks();
    const activities = getActivities();

    // Calculate stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const newStats: DashboardStats = {
      totalCustomers: customers.length,
      activeLeads: customers.filter(c => c.status === 'Lead').length,
      tasksPending: tasks.filter(t => t.status !== 'Done').length,
      tasksCompleted: tasks.filter(t => t.status === 'Done').length,
      customersThisMonth: customers.filter(c => new Date(c.createdAt) >= startOfMonth).length,
      tasksThisWeek: tasks.filter(t => new Date(t.createdAt) >= startOfWeek).length,
    };

    setStats(newStats);
    setRecentActivities(activities.slice(0, 10));
    
    // Get upcoming tasks (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcoming = tasks
      .filter(t => t.status !== 'Done' && new Date(t.deadline) <= nextWeek)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5);
    setUpcomingTasks(upcoming);
  };

  const getActivityIcon = (type: ActivityType['type']) => {
    switch (type) {
      case 'customer_created':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'task_created':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'customer_updated':
        return <Activity className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTaskPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-crm rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Good morning! 👋</h2>
        <p className="text-blue-100">Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUp className="h-3 w-3 mr-1" />
              {stats.customersThisMonth} this month
            </div>
          </CardContent>
        </Card>

        {/* Active Leads */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLeads}</div>
            <div className="text-xs text-gray-600 mt-1">
              {((stats.activeLeads / stats.totalCustomers) * 100).toFixed(1)}% of total
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksPending}</div>
            <div className="flex items-center text-xs text-blue-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.tasksThisWeek} created this week
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksCompleted}</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.tasksPending + stats.tasksCompleted > 0 
                ? ((stats.tasksCompleted / (stats.tasksPending + stats.tasksCompleted)) * 100).toFixed(1) 
                : 0}% completion rate
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
              ) : (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getTaskPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </Badge>
                        <span className={`text-xs ${isOverdue(task.deadline) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          {isOverdue(task.deadline) ? 'Overdue' : formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
