import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCartIcon, CheckCircleIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { getDashboardData } from '@/api/fakeApi';
import Card from '@/components/Card';

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  });


  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg shadow p-6 h-64 animate-pulse mb-4"></div>
        <div className="bg-white rounded-lg shadow p-6 h-40 animate-pulse"></div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Card title="Total Orders" value={data.totalOrders} />
        <Card title="Total Revenue" value={`$${data.totalRevenue}`} />
        <Card title="Total Customers" value={data.totalCustomers} />
        <Card title="Total Products" value={data.totalProducts} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2 text-gray-800">Orders & Revenue by Month</h3>
          <LineChart width={400} height={200} data={data.ordersByMonth}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
          </LineChart>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2 text-gray-800">Products by Category</h3>
          <PieChart width={400} height={200}>
            <Pie 
              data={data.productCategories} 
              dataKey="count" 
              nameKey="category" 
              cx="50%" cy="50%" 
              outerRadius={80} 
            >
              {data.productCategories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-3 text-gray-800">Recent Activity</h3>
        <ul>
          {data.recentActivity.map((event, idx) => {
            let icon = null;
            let iconBgClass = "";
            if (event.type === "order_placed") {
              icon = <ShoppingCartIcon className="h-4 w-4 text-blue-600" />;
              iconBgClass = "bg-blue-100";
            } else if (event.type === "order_completed") {
              icon = <CheckCircleIcon className="h-4 w-4 text-green-600" />;
              iconBgClass = "bg-green-100";
            } else if (event.type === "customer_new") {
              icon = <UserPlusIcon className="h-4 w-4 text-purple-600" />;
              iconBgClass = "bg-purple-100";
            }
            return (
              <li key={idx} className="flex items-center mb-2 last:mb-0">
                <span className={`p-2 rounded-full mr-3 ${iconBgClass}`}>
                  {icon}
                </span>
                <div className="text-sm text-gray-700">
                  {event.message}
                  <span className="text-gray-500 text-xs ml-2">{event.time}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default DashboardPage;
