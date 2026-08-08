import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLogout } from "../../hooks/useLogout";

const AdminLayout = () => {
  const { user } = useAuth();
  const handleLogout = useLogout();

  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm px-4">
        <div className="flex-1">
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="opacity-70">{user?.email}</span>
          <Link to="/" className="btn btn-ghost btn-sm">Back to site</Link>
          <button data-testid="logout-button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="flex">
        <aside className="w-56 min-h-[calc(100vh-4rem)] bg-base-100 border-r border-base-300 p-4">
          <ul className="menu">
            <li><Link to="/admin">Users</Link></li>
          </ul>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;