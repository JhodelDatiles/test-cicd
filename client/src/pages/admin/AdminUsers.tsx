import { useEffect, useState } from "react";
import { fetchUsers, type AdminUser } from "../../lib/api";
import EditUserModal from "../../components/EditUserModal";

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const handleDeleted = (id: string) => {
    setUsers((prev) => prev.filter((u) => u._id !== id));
  };

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load users"),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const handleUpdated = (updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Users</h1>
      {isLoading && <p className="text-sm opacity-70">Loading users...</p>}
      {error && <p className="text-sm text-error">{error}</p>}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="table table-zebra" data-testid="admin-users-table">
            <thead>
              <tr>
                <th>First name</th>
                <th>Last name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  data-testid={`admin-user-row-${u._id}`}
                  className="cursor-pointer hover"
                  onClick={() => setSelectedUser(u)}
                >
                  <td className="capitalize">{u.firstName}</td>
                  <td className="capitalize">{u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${u.role === "admin" ? "badge-primary" : "badge-ghost"}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="mt-4 text-sm opacity-70">No users found.</p>
          )}
        </div>
      )}
      <EditUserModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />{" "}
    </div>
  );
};

export default AdminUsers;
