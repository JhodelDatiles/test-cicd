import { useAuth } from "../hooks/useAuth";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <h1 data-testid="home-welcome" className="text-2xl font-semibold">
        {user ? `Welcome, ${user.email}` : "Welcome"}
      </h1>
    </div>
  );
};

export default Home;