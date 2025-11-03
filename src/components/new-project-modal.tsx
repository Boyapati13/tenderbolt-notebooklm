'use client';

import { useState } from "react";
import { X, Plus, Calendar, DollarSign, User, Tag, Link as LinkIcon } from "lucide-react";

type NewProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client: "",
    value: "",
    deadline: "",
    status: "discovery",
    priority: "medium",
    tags: "",
    oneDriveLink: "",
    googleDriveLink: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          value: formData.value ? parseInt(formData.value) : undefined,
          deadline: formData.deadline || undefined,
          organizationId: "org_demo",
        }),
      });

      if (response.ok) {
        onSuccess();
        handleClose();
      } else {
        alert("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      client: "",
      value: "",
      deadline: "",
      status: "discovery",
      priority: "medium",
      tags: "",
      oneDriveLink: "",
      googleDriveLink: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create New Project</h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Government IT Infrastructure Modernization"
              className="input w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project..."
              rows={3}
              className="input w-full"
            />
          </div>

          {/* Client and Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <User size={16} className="mr-2" />
                Client Name
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="e.g., Department of Technology"
                className="input w-full"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <DollarSign size={16} className="mr-2" />
                Project Value ($)
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="e.g., 2500000"
                className="input w-full"
              />
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Stage
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input w-full bg-white dark:bg-slate-800"
              >
                <option value="discovery">Discovery</option>
                <option value="interested">Interested</option>
                <option value="working">Working</option>
                <option value="submitted">Submitted</option>
                <option value="closed">Closed</option>
                <option value="not_interested">Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input w-full bg-white dark:bg-slate-800"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Calendar size={16} className="mr-2" />
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="input w-full"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Tag size={16} className="mr-2" />
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., IT, Infrastructure, Government"
              className="input w-full"
            />
          </div>

          {/* External Links */}
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <h3 className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
              <LinkIcon size={16} className="mr-2" />
              External Resources (Optional)
            </h3>
            
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                OneDrive Folder URL
              </label>
              <input
                type="url"
                value={formData.oneDriveLink}
                onChange={(e) => setFormData({ ...formData, oneDriveLink: e.target.value })}
                placeholder="https://onedrive.live.com/..."
                className="input input-sm w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Google Drive Folder URL
              </label>
              <input
                type="url"
                value={formData.googleDriveLink}
                onChange={(e) => setFormData({ ...formData, googleDriveLink: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="input input-sm w-full"
              />
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800 z-10">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit} // Added this to trigger form submission
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Create Project</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
