'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile, Link as LinkType } from '@/types/database'

export default function ProfilePage() {
  const params = useParams()
  const slug = params.slug as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<LinkType[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchProfile()
    }
  }, [slug])

  async function fetchProfile() {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (profileError || !profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)

    // Increment view count
    await supabase
      .from('profiles')
      .update({ views: profileData.views + 1 })
      .eq('id', profileData.id)

    // Fetch only active links, ordered by the order field
    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('profile_id', profileData.id)
      .eq('status', 'active')
      .order('order')

    setLinks(linksData || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <p className="text-xl font-medium text-white mb-2">Profile Not Found</p>
          <p className="text-zinc-500 mb-8">
            The profile you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-md mx-auto px-4 py-16">
        {/* Profile Header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mx-auto mb-5 flex items-center justify-center ring-4 ring-purple-500/20">
            <span className="text-3xl font-bold text-white">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {profile?.name}
          </h1>
          {profile?.bio && (
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        {links.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500">No links yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full p-4 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-800/80 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{link.title}</span>
                  {link.is_hot && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-400 rounded">
                      HOT
                    </span>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-600 hover:text-purple-400 transition-colors"
          >
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent font-medium">
              OmniLinks
            </span>
          </Link>
        </div>
      </main>
    </div>
  )
}
