import { useEffect, useRef } from "react";
import type { AdminUser } from "../lib/api";
import EditUserForm from "./EditUserForm";

interface EditUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onUpdated: (user: AdminUser) => void;
}

const EditUserModal = ({ user, onClose, onUpdated }: EditUserModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (user) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [user]);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose} data-testid="edit-user-modal">
      <div className="modal-box">
        <h3 className="mb-4 text-lg font-semibold">Edit user</h3>
        {user && <EditUserForm key={user._id} user={user} onClose={onClose} onUpdated={onUpdated} />}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default EditUserModal;