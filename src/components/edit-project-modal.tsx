"use client";

import { useState, useEffect } from "react";
import { X, Save, Calendar, DollarSign, User, Tag, Link as LinkIcon } from "lucide-react";

type EditProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  currentData: {
    title: string;
    description?: string | null;
    client?: string | null;
    value?: number | null;
    deadline?: string | null;
    status: string;
    priority?: string | null;
    tags?: string | null;
    oneDriveLink?: string | null;
    googleDriveLink?: string | null;
  };
};

export function EditProjectModal({ isOpen, onClose, onSuccess, projectId, currentData }: EditProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: currentData.title,
    description: currentData.description || "",
    client: currentData.client || "",
    value: currentData.value?.toString() || "",
    deadline: currentData.deadline ? currentData.deadline.split('T')[0] : "",
    status: currentData.status,
    priority: currentData.priority || "medium",
    tags: currentData.tags || "",
    oneDriveLink: currentData.oneDriveLink || "",
    googleDriveLink: currentData.googleDriveLink || "",
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: currentData.title,
        description: currentData.description || "",
        client: currentData.client || "",
        value: currentData.value?.toString() || "",
        deadline: currentData.deadline ? currentData.deadline.split('T')[0] : "",
        status: currentData.status,
        priority: currentData.priority || "medium",
        tags: currentData.tags || "",
        oneDriveLink: currentData.oneDriveLink || "",
        googleDriveLink: currentData.googleDriveLink || "",
      });
    }
  }, [isOpen, currentData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tenders/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: formData.value ? parseInt(formData.value) : null,
          deadline: formData.deadline || null,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert("Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Error updating project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Project</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Government IT Infrastructure Modernization"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Client and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User size={16} className="inline mr-1" />
                Client Name
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="e.g., Department of Technology"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-1" />
                Project Value ($)
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="e.g., 2500000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status and Priority - HIGHLIGHTED */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                🔄 Stage / Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-semibold"
              >
                <option value="discovery">🔍 Discovery</option>
                <option value="interested">💡 Interested</option>
                <option value="working">⚙️ Working</option>
                <option value="submitted">📤 Submitted</option>
                <option value="closed">✅ Closed (Won)</option>
                <option value="not_interested">❌ Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                ⭐ Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-semibold"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., IT, Infrastructure, Government"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* External Links */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700">
              <LinkIcon size={16} className="inline mr-1" />
              External Resources
            </h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                OneDrive Folder URL
              </label>
              <input
                type="url"
                value={formData.oneDriveLink}
                onChange={(e) => setFormData({ ...formData, oneDriveLink: e.target.value })}
                placeholder="https://onedrive.live.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Google Drive Folder URL
              </label>
              <input
                type="url"
                value={formData.googleDriveLink}
                onChange={(e) => setFormData({ ...formData, googleDriveLink: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

