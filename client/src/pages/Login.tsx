import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginUser } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { accessToken, user } = await loginUser({ email, password });
      setSession(user, accessToken);
      toast.success("Welcome back");
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <form onSubmit={handleSubmit} data-testid="login-form" className="card w-full max-w-sm bg-base-100 p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-semibold">Log in</h1>

        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" data-testid="login-email" className="input input-bordered mb-3 w-full"
          value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" data-testid="login-password" className="input input-bordered mb-4 w-full"
          value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p data-testid="login-error" className="mb-4 text-sm text-error">{error}</p>}

        <button type="submit" data-testid="login-submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm">
          Need an account? <Link to="/register" className="link">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;