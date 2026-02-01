'use client'

import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { supabase } from '@/lib/supabase'
import { Profile, Link as LinkType } from '@/types/database'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'

interface SortableLinkRowProps {
  link: LinkType
  onEdit: (link: LinkType) => void
  onDelete: (link: LinkType) => void
  onToggleStatus: (link: LinkType) => void
  onToggleHot: (link: LinkType) => void
}

function SortableLinkRow({ link, onEdit, onDelete, onToggleStatus, onToggleHot }: SortableLinkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-zinc-800/50 transition-colors ${isDragging ? 'bg-zinc-800' : ''}`}
    >
      <td className="px-2 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className="p-2 text-zinc-500 hover:text-purple-400 cursor-grab active:cursor-grabbing"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${link.status === 'active' ? 'bg-purple-600/20' : 'bg-zinc-800'}`}>
            <svg className={`w-4 h-4 ${link.status === 'active' ? 'text-purple-400' : 'text-zinc-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${link.status === 'inactive' ? 'text-zinc-500' : 'text-white'}`}>{link.title}</span>
            {link.is_hot && (
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-500/20 text-purple-400 rounded">
                HOT
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm hover:text-purple-400 truncate block max-w-xs ${link.status === 'inactive' ? 'text-zinc-600' : 'text-zinc-400'}`}
        >
          {link.url}
        </a>
      </td>
      <td className="px-4 py-4 w-20">
        <button
          onClick={() => onToggleStatus(link)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            link.status === 'active' ? 'bg-purple-600' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              link.status === 'active' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onToggleHot(link)}
            className={`p-2 transition-colors ${link.is_hot ? 'text-purple-400' : 'text-zinc-500 hover:text-purple-400'}`}
            title={link.is_hot ? 'Remove Hot' : 'Mark as Hot'}
          >
            <svg className="w-4 h-4" fill={link.is_hot ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </button>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-500 hover:text-purple-400 transition-colors"
            title="Open"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <button
            onClick={() => onEdit(link)}
            className="p-2 text-zinc-500 hover:text-purple-400 transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(link)}
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
  )
}

export default function ManageLinks() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [links, setLinks] = useState<LinkType[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
  })
  const [editingLink, setEditingLink] = useState<LinkType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  const [deleteLink, setDeleteLink] = useState<LinkType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    if (selectedProfile) {
      fetchLinks(selectedProfile)
    } else {
      setLinks([])
    }
  }, [selectedProfile])

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching profiles:', error)
    } else {
      setProfiles(data || [])
      if (data && data.length > 0) {
        setSelectedProfile(data[0].id)
      }
    }
    setLoading(false)
  }

  async function fetchLinks(profileId: string) {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profileId)
      .order('order')

    if (error) {
      console.error('Error fetching links:', error)
    } else {
      setLinks(data || [])
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id)
      const newIndex = links.findIndex((link) => link.id === over.id)

      const newLinks = arrayMove(links, oldIndex, newIndex)
      setLinks(newLinks)

      const updates = newLinks.map((link, index) => ({
        id: link.id,
        order: index + 1,
      }))

      for (const update of updates) {
        await supabase
          .from('links')
          .update({ order: update.order })
          .eq('id', update.id)
      }
    }
  }

  async function handleToggleStatus(link: LinkType) {
    const newStatus = link.status === 'active' ? 'inactive' : 'active'

    const { error } = await supabase
      .from('links')
      .update({ status: newStatus })
      .eq('id', link.id)

    if (error) {
      console.error('Error updating status:', error)
    } else {
      setLinks(links.map(l => l.id === link.id ? { ...l, status: newStatus } : l))
    }
  }

  async function handleToggleHot(link: LinkType) {
    const { error } = await supabase
      .from('links')
      .update({ is_hot: !link.is_hot })
      .eq('id', link.id)

    if (error) {
      console.error('Error updating hot status:', error)
    } else {
      setLinks(links.map(l => l.id === link.id ? { ...l, is_hot: !l.is_hot } : l))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProfile) {
      alert('Please select a profile first')
      return
    }

    setSaving(true)

    if (isCreateMode) {
      const { error } = await supabase.from('links').insert({
        profile_id: selectedProfile,
        title: formData.title,
        url: formData.url,
      })

      if (error) {
        alert('Error creating link: ' + error.message)
      } else {
        closeModal()
        fetchLinks(selectedProfile)
      }
    } else if (editingLink) {
      const { error } = await supabase
        .from('links')
        .update({
          title: formData.title,
          url: formData.url,
        })
        .eq('id', editingLink.id)

      if (error) {
        alert('Error updating link: ' + error.message)
      } else {
        closeModal()
        fetchLinks(selectedProfile)
      }
    }

    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteLink) return

    setIsDeleting(true)

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', deleteLink.id)

    if (error) {
      alert('Error deleting link: ' + error.message)
    } else {
      setDeleteLink(null)
      fetchLinks(selectedProfile)
    }

    setIsDeleting(false)
  }

  function openCreateModal() {
    setIsCreateMode(true)
    setEditingLink(null)
    setFormData({ title: '', url: '' })
    setIsModalOpen(true)
  }

  function openEditModal(link: LinkType) {
    setIsCreateMode(false)
    setEditingLink(link)
    setFormData({
      title: link.title,
      url: link.url,
    })
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingLink(null)
    setIsCreateMode(false)
    setFormData({ title: '', url: '' })
  }

  const selectedProfileData = profiles.find(p => p.id === selectedProfile)
  const activeLinks = links.filter(l => l.status === 'active')

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Links</h1>
          <p className="text-sm text-zinc-500 mt-1">Add links to your profile pages</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 py-20 text-center">
          <p className="text-zinc-500 mb-6">You need to create a profile first</p>
          <a
            href="/admin/profiles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-500 transition-colors"
          >
            Create a Profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Links</h1>
          <p className="text-sm text-zinc-500 mt-1">Add links to your profile pages</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Link
        </button>
      </div>

      {/* Profile Selector */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
          Select Profile
        </label>
        <div className="flex flex-wrap gap-2">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedProfile === profile.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              {profile.name}
              {profile.status === 'inactive' && (
                <span className="ml-2 text-xs opacity-60">(inactive)</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Table Section */}
        <div className="flex-1 min-w-0">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            {links.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-zinc-500 mb-4">No links yet for {selectedProfileData?.name}</p>
                <button
                  onClick={openCreateModal}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Add your first link
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="w-10"></th>
                      <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-4">
                        Title
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-4">
                        URL
                      </th>
                      <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-4 w-20">
                        Status
                      </th>
                      <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-4 py-4">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    <SortableContext
                      items={links.map(l => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {links.map((link) => (
                        <SortableLinkRow
                          key={link.id}
                          link={link}
                          onEdit={openEditModal}
                          onDelete={setDeleteLink}
                          onToggleStatus={handleToggleStatus}
                          onToggleHot={handleToggleHot}
                        />
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </DndContext>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-3 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16" />
            </svg>
            Drag to reorder links
          </p>
        </div>

        {/* Mobile Preview */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-8">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
              Mobile Preview <span className="text-zinc-600">({activeLinks.length} active)</span>
            </p>

            {/* Phone Frame */}
            <div className="relative mx-auto w-[280px]">
              <div className="bg-zinc-800 rounded-[3rem] p-3 ring-1 ring-zinc-700">
                <div className="bg-black rounded-[2.25rem] overflow-hidden">
                  <div className="h-7 bg-black flex items-center justify-center">
                    <div className="w-20 h-5 bg-zinc-900 rounded-full" />
                  </div>

                  <div className="bg-black h-[500px] overflow-y-auto">
                    <div className="px-4 py-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mx-auto mb-3 flex items-center justify-center ring-2 ring-purple-500/20">
                          <span className="text-xl font-bold text-white">
                            {selectedProfileData?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-white">{selectedProfileData?.name}</h2>
                        {selectedProfileData?.bio && (
                          <p className="text-xs text-zinc-400 mt-1 px-4 line-clamp-2">
                            {selectedProfileData.bio}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        {activeLinks.length === 0 ? (
                          <p className="text-center text-xs text-zinc-500 py-4">No active links</p>
                        ) : (
                          activeLinks.map((link) => (
                            <div
                              key={link.id}
                              className="flex items-center justify-between w-full px-4 py-3 bg-zinc-900 rounded-xl border border-zinc-800 text-sm"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-medium text-white truncate">{link.title}</span>
                                {link.is_hot && (
                                  <span className="px-1 py-0.5 text-[8px] font-bold bg-purple-500/20 text-purple-400 rounded flex-shrink-0">
                                    HOT
                                  </span>
                                )}
                              </div>
                              <svg className="w-4 h-4 text-zinc-600 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-8 text-center">
                        <span className="text-[10px] bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent font-medium">OmniLinks</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-8 bg-black flex items-center justify-center">
                    <div className="w-28 h-1 bg-zinc-800 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {selectedProfileData && (
              <div className="mt-4 text-center">
                <a
                  href={`/${selectedProfileData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-purple-400"
                >
                  Open in new tab
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isCreateMode ? 'Add Link' : 'Edit Link'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="My Website"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="https://example.com"
              required
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
        isOpen={!!deleteLink}
        onClose={() => setDeleteLink(null)}
        onConfirm={handleDelete}
        title="Delete Link"
        message={`Are you sure you want to delete "${deleteLink?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  )
}
