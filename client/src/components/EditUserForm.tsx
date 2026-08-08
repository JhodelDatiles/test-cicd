import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { updateUserById, type AdminUser } from "../lib/api";

interface EditUserFormProps {
  user: AdminUser;
  onClose: () => void;
  onUpdated: (user: AdminUser) => void;
}

const EditUserForm = ({ user, onClose, onUpdated }: EditUserFormProps) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<"user" | "admin">(user.role);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await updateUserById(user._id, {
        firstName,
        lastName,
        email,
        role,
      });
      onUpdated(updated);
      toast.success("User updated");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="label" htmlFor="edit-firstName">
        First name
      </label>
      <input
        id="edit-firstName"
        data-testid="edit-user-firstName"
        className="input input-bordered mb-3 w-full"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />

      <label className="label" htmlFor="edit-lastName">
        Last name
      </label>
      <input
        id="edit-lastName"
        data-testid="edit-user-lastName"
        className="input input-bordered mb-3 w-full"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />

      <label className="label" htmlFor="edit-email">
        Email
      </label>
      <input
        id="edit-email"
        type="email"
        data-testid="edit-user-email"
        className="input input-bordered mb-3 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <label className="label" htmlFor="edit-role">
        Role
      </label>
      <select
        id="edit-role"
        data-testid="edit-user-role"
        className="select select-bordered mb-4 w-full"
        value={role}
        onChange={(e) => setRole(e.target.value as "user" | "admin")}
      >
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>

      {error && (
        <p data-testid="edit-user-error" className="mb-4 text-sm text-error">
          {error}
        </p>
      )}

      <div className="modal-action">
        <button
          type="button"
          data-testid="edit-user-cancel"
          className="btn"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          data-testid="edit-user-submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default EditUserForm;
