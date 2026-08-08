import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { accessToken, user } = await registerUser({ firstName, lastName, email, password });
      setSession(user, accessToken);
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <form onSubmit={handleSubmit} data-testid="register-form" className="card w-full max-w-sm bg-base-100 p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-semibold">Create account</h1>

        <label className="label" htmlFor="firstName">First name</label>
        <input id="firstName" data-testid="register-firstName" className="input input-bordered mb-3 w-full"
          value={firstName} onChange={(e) => setFirstName(e.target.value)} required />

        <label className="label" htmlFor="lastName">Last name</label>
        <input id="lastName" data-testid="register-lastName" className="input input-bordered mb-3 w-full"
          value={lastName} onChange={(e) => setLastName(e.target.value)} required />

        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" data-testid="register-email" className="input input-bordered mb-3 w-full"
          value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" data-testid="register-password" className="input input-bordered mb-4 w-full"
          value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p data-testid="register-error" className="mb-4 text-sm text-error">{error}</p>}

        <button type="submit" data-testid="register-submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="link">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;