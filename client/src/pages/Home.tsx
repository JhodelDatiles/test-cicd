import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLogout } from "../hooks/useLogout";

const Home = () => {
  const { user } = useAuth();
  const handleLogout = useLogout();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-200">
      <h1 data-testid="home-welcome" className="text-2xl font-semibold">
        {user ? `Welcome, ${user.email}` : "Welcome"}
      </h1>
      {user?.role === "admin" && (
        <Link to="/admin" data-testid="admin-link" className="btn btn-primary">
          Admin dashboard
        </Link>
      )}
      {user && (
        <button data-testid="logout-button" className="btn btn-outline" onClick={handleLogout}>
          Log out
        </button>
      )}
    </div>
  );
};

export default Home;