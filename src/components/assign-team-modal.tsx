"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Search } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  avatar: string | null;
};

type AssignTeamModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string;
  tenderTitle: string;
  onSuccess: () => void;
};

export function AssignTeamModal({ isOpen, onClose, tenderId, tenderTitle, onSuccess }: AssignTeamModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [projectRole, setProjectRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !projectRole) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId,
          userId: selectedUser,
          role: projectRole,
        }),
      });

      if (response.ok) {
        onSuccess();
        handleClose();
      } else {
        alert("Failed to assign team member");
      }
    } catch (error) {
      console.error("Error assigning team member:", error);
      alert("Error assigning team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUser("");
    setProjectRole("");
    setSearchTerm("");
    onClose();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assign Team Member</h2>
            <p className="text-sm text-gray-600 mt-1">{tenderTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Search Users */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Team Member *
            </label>
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* User List */}
            <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-lg">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedUser === user.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      name="user"
                      value={user.id}
                      checked={selectedUser === user.id}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {user.name || user.email}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {user.role || "Team Member"}
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus size={32} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Role *
            </label>
            <select
              required
              value={projectRole}
              onChange={(e) => setProjectRole(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select a role...</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Bid Writer">Bid Writer</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="Commercial Lead">Commercial Lead</option>
              <option value="Subject Matter Expert">Subject Matter Expert</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Contributor">Contributor</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUser || !projectRole}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Assign Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

