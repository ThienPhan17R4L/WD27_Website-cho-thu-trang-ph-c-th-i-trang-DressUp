import { NavLink } from 'react-router-dom';
import { Squares2X2Icon, TagIcon, CubeIcon, ShoppingCartIcon, UserGroupIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  collapsed: boolean;
}

function Sidebar({ collapsed }: SidebarProps) {
  return (
    <aside className={(collapsed ? 'w-20' : 'w-64') + " h-full bg-white border-r transition-all duration-300"}>
      <div className={"flex items-center py-4 " + (collapsed ? "justify-center" : "justify-start px-4")}>
        {collapsed ? (
          <span className="text-xl font-bold text-primary">FR</span>
        ) : (
          <span className="text-xl font-bold text-primary">FashionRent</span>
        )}
      </div>
      <nav className="flex flex-col px-2">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) =>
            "flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 " + 
            (isActive ? "bg-primary/20 text-primary font-medium" : "")
          }
        >
          <Squares2X2Icon className="h-6 w-6" />
          <span className={"ml-3 " + (collapsed ? "hidden" : "inline")}>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/products" 
          className={({ isActive }) =>
            "flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 " + 
            (isActive ? "bg-primary/20 text-primary font-medium" : "")
          }
        >
          <TagIcon className="h-6 w-6" />
          <span className={"ml-3 " + (collapsed ? "hidden" : "inline")}>Products</span>
        </NavLink>
        <NavLink 
          to="/inventory" 
          className={({ isActive }) =>
            "flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 " + 
            (isActive ? "bg-primary/20 text-primary font-medium" : "")
          }
        >
          <CubeIcon className="h-6 w-6" />
          <span className={"ml-3 " + (collapsed ? "hidden" : "inline")}>Inventory</span>
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) =>
            "flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 " + 
            (isActive ? "bg-primary/20 text-primary font-medium" : "")
          }
        >
          <ShoppingCartIcon className="h-6 w-6" />
          <span className={"ml-3 " + (collapsed ? "hidden" : "inline")}>Orders</span>
        </NavLink>
        <NavLink 
          to="/customers" 
          className={({ isActive }) =>
            "flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 " + 
            (isActive ? "bg-primary/20 text-primary font-medium" : "")
          }
        >
          <UserGroupIcon className="h-6 w-6" />
          <span className={"ml-3 " + (collapsed ? "hidden" : "inline")}>Customers</span>
        </NavLink>
        <NavLink 
          to="/reports" 
          className={({ isActive }) =>
            "flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 " + 
            (isActive ? "bg-primary/20 text-primary font-medium" : "")
          }
        >
          <ChartBarIcon className="h-6 w-6" />
          <span className={"ml-3 " + (collapsed ? "hidden" : "inline")}>Reports</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) =>
            "flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 " + 
            (isActive ? "bg-primary/20 text-primary font-medium" : "")
          }
        >
          <Cog6ToothIcon className="h-6 w-6" />
          <span className={"ml-3 " + (collapsed ? "hidden" : "inline")}>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
