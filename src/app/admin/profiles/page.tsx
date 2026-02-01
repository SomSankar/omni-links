'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

const ITEMS_PER_PAGE = 10

export default function ManageProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    slug: '',
  })
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching profiles:', error)
    } else {
      setProfiles(data || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (isCreateMode) {
      const { error } = await supabase.from('profiles').insert({
        name: formData.name,
        bio: formData.bio,
        slug: formData.slug,
      })

      if (error) {
        alert('Error creating profile: ' + error.message)
      } else {
        closeModal()
        fetchProfiles()
      }
    } else if (editingProfile) {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          bio: formData.bio,
          slug: formData.slug,
        })
        .eq('id', editingProfile.id)

      if (error) {
        alert('Error updating profile: ' + error.message)
      } else {
        closeModal()
        fetchProfiles()
      }
    }

    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteProfile) return

    setIsDeleting(true)

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', deleteProfile.id)

    if (error) {
      alert('Error deleting profile: ' + error.message)
    } else {
      setDeleteProfile(null)
      fetchProfiles()
    }

    setIsDeleting(false)
  }

  async function handleToggleStatus(profile: Profile) {
    const newStatus = profile.status === 'active' ? 'inactive' : 'active'

    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', profile.id)

    if (error) {
      console.error('Error updating status:', error)
    } else {
      setProfiles(profiles.map(p => p.id === profile.id ? { ...p, status: newStatus } : p))
    }
  }

  function openCreateModal() {
    setIsCreateMode(true)
    setEditingProfile(null)
    setFormData({ name: '', bio: '', slug: '' })
    setIsModalOpen(true)
  }

  function openEditModal(profile: Profile) {
    setIsCreateMode(false)
    setEditingProfile(profile)
    setFormData({
      name: profile.name,
      bio: profile.bio || '',
      slug: profile.slug,
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingProfile(null)
    setIsCreateMode(false)
    setFormData({ name: '', bio: '', slug: '' })
  }

  // Pagination
  const totalPages = Math.ceil(profiles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProfiles = profiles.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Profiles</h1>
          <p className="text-sm text-zinc-500 mt-1">Create and manage your profile pages</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Profile
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-6 h-6 border-2 border-zinc-700 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-zinc-500 mb-4">No profiles yet</p>
            <button
              onClick={openCreateModal}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Create your first profile
            </button>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">
                    Profile
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">
                    Slug
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">
                    Views
                  </th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4 w-20">
                    Status
                  </th>
                  <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {paginatedProfiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${profile.status === 'active' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-zinc-800'}`}>
                          <span className={`text-sm font-semibold ${profile.status === 'active' ? 'text-white' : 'text-zinc-500'}`}>
                            {profile.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className={`font-medium ${profile.status === 'inactive' ? 'text-zinc-500' : 'text-white'}`}>{profile.name}</p>
                          {profile.bio && (
                            <p className="text-sm text-zinc-500 truncate max-w-xs">{profile.bio}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${profile.status === 'inactive' ? 'text-zinc-600' : 'text-zinc-400'}`}>@{profile.slug}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${profile.status === 'inactive' ? 'text-zinc-600' : 'text-zinc-400'}`}>{profile.views}</span>
                    </td>
                    <td className="px-6 py-4 w-20">
                      <button
                        onClick={() => handleToggleStatus(profile)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          profile.status === 'active' ? 'bg-purple-600' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            profile.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/${profile.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-zinc-500 hover:text-purple-400 transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        <button
                          onClick={() => openEditModal(profile)}
                          className="p-2 text-zinc-500 hover:text-purple-400 transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteProfile(profile)}
                          className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                <p className="text-sm text-zinc-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, profiles.length)} of {profiles.length} profiles
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isCreateMode ? 'Add Profile' : 'Edit Profile'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="john-doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              rows={3}
              placeholder="A short description"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-3 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-500 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : isCreateMode ? 'Create' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteProfile}
        onClose={() => setDeleteProfile(null)}
        onConfirm={handleDelete}
        title="Delete Profile"
        message={`Are you sure you want to delete "${deleteProfile?.name}"? This will also delete all associated links. This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  )
}
