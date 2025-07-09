export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  tags: string[];
  status: 'Lead' | 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  avatar?: string;
}

export interface Task {
  id: string;
  customerId: string;
  title: string;
  description: string;
  deadline: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
  assignee?: string;
}

export interface Activity {
  id: string;
  type: 'customer_created' | 'task_created' | 'task_completed' | 'customer_updated';
  title: string;
  description: string;
  timestamp: string;
  customerId?: string;
  taskId?: string;
}

const CUSTOMERS_KEY = 'crm_customers';
const TASKS_KEY = 'crm_tasks';
const ACTIVITIES_KEY = 'crm_activities';

// Customers
export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  saveCustomers(customers);
  
  // Add activity
  addActivity({
    type: 'customer_created',
    title: 'New Customer Added',
    description: `${customer.name} has been added to the system`,
    customerId: newCustomer.id,
  });
  
  return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  customers[index] = {
    ...customers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveCustomers(customers);
  
  addActivity({
    type: 'customer_updated',
    title: 'Customer Updated',
    description: `${customers[index].name} information has been updated`,
    customerId: id,
  });
  
  return customers[index];
};

export const deleteCustomer = (id: string): boolean => {
  const customers = getCustomers();
  const filtered = customers.filter(c => c.id !== id);
  if (filtered.length === customers.length) return false;
  
  saveCustomers(filtered);
  
  // Also delete related tasks
  const tasks = getTasks().filter(t => t.customerId !== id);
  saveTasks(tasks);
  
  return true;
};

// Tasks
export const getTasks = (): Task[] => {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = (tasks: Task[]): void => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  
  addActivity({
    type: 'task_created',
    title: 'New Task Created',
    description: `Task "${task.title}" has been created`,
    taskId: newTask.id,
    customerId: task.customerId,
  });
  
  return newTask;
};

export const updateTask = (id: string, updates: Partial<Task>): Task | null => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  const wasCompleted = tasks[index].status === 'Done';
  const isNowCompleted = updates.status === 'Done';
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveTasks(tasks);
  
  if (!wasCompleted && isNowCompleted) {
    addActivity({
      type: 'task_completed',
      title: 'Task Completed',
      description: `Task "${tasks[index].title}" has been completed`,
      taskId: id,
      customerId: tasks[index].customerId,
    });
  }
  
  return tasks[index];
};

export const deleteTask = (id: string): boolean => {
  const tasks = getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  if (filtered.length === tasks.length) return false;
  
  saveTasks(filtered);
  return true;
};

// Activities
export const getActivities = (): Activity[] => {
  const data = localStorage.getItem(ACTIVITIES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveActivities = (activities: Activity[]): void => {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
};

export const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>): Activity => {
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  activities.unshift(newActivity); // Add to beginning for recent first
  
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.splice(100);
  }
  
  saveActivities(activities);
  return newActivity;
};

// Initialize demo data
export const initializeDemoData = (): void => {
  if (getCustomers().length === 0) {
    const demoCustomers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1 (555) 123-4567',
        company: 'TechCorp Solutions',
        tags: ['enterprise', 'priority'],
        status: 'Active',
        notes: 'Key decision maker for enterprise solutions',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=32&h=32&fit=crop&crop=face'
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@startup.io',
        phone: '+1 (555) 987-6543',
        company: 'Startup Innovations',
        tags: ['startup', 'tech'],
        status: 'Lead',
        notes: 'Interested in our cloud services package',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.r@designstudio.com',
        phone: '+1 (555) 456-7890',
        company: 'Creative Design Studio',
        tags: ['design', 'creative'],
        status: 'Active',
        notes: 'Regular client, excellent payment history',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
      }
    ];
    
    demoCustomers.forEach(customer => addCustomer(customer));
  }
  
  if (getTasks().length === 0) {
    const customers = getCustomers();
    if (customers.length > 0) {
      const demoTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          customerId: customers[0].id,
          title: 'Schedule product demo',
          description: 'Arrange a comprehensive product demonstration for the client',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Todo',
          priority: 'High',
          assignee: 'John Smith'
        },
        {
          customerId: customers[1].id,
          title: 'Send pricing proposal',
          description: 'Prepare and send detailed pricing proposal based on requirements',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'In Progress',
          priority: 'Medium',
          assignee: 'John Smith'
        },
        {
          customerId: customers[2].id,
          title: 'Follow up on contract',
          description: 'Check on contract status and address any concerns',
          deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Todo',
          priority: 'High',
          assignee: 'John Smith'
        }
      ];
      
      demoTasks.forEach(task => addTask(task));
    }
  }
};
