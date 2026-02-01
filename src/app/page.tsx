'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/database'

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('views', { ascending: false })

    if (error) {
      console.error('Error fetching profiles:', error)
    } else {
      setProfiles(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            OmniLinks
          </div>
          <Link
            href="/admin/profiles"
            className="text-sm text-zinc-500 hover:text-purple-400 transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">
            All your links.
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
              One place.
            </span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-md mx-auto">
            Create a simple profile page with all your important links. Share it anywhere.
          </p>
        </div>
      </section>

      {/* Profiles Grid */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
            Profiles
          </h2>
          {profiles.length > 0 && (
            <span className="text-sm text-zinc-500">{profiles.length} total</span>
          )}
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block w-6 h-6 border-2 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50">
            <p className="text-zinc-500 mb-6">No profiles yet</p>
            <Link
              href="/admin/profiles"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-500 transition-colors"
            >
              Create your first profile
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/${profile.slug}`}
                className="group block p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-purple-500/50 hover:bg-zinc-900 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-white">
                      {profile.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                      {profile.name}
                    </h3>
                    <p className="text-sm text-zinc-500 truncate">@{profile.slug}</p>
                  </div>
                </div>
                {profile.bio && (
                  <p className="mt-4 text-sm text-zinc-400 line-clamp-2">{profile.bio}</p>
                )}
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <span>{profile.views} views</span>
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 text-purple-400 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-zinc-600">
          <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent font-medium">
            OmniLinks
          </span>
        </div>
      </footer>
    </div>
  )
}
