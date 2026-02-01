export type ProfileStatus = 'active' | 'inactive'
export type LinkStatus = 'active' | 'inactive'

export interface Profile {
  id: string
  name: string
  bio: string | null
  slug: string
  views: number
  status: ProfileStatus
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  profile_id: string
  title: string
  url: string
  order: number
  is_hot: boolean
  views: number
  status: LinkStatus
  created_at: string
  updated_at: string
}

export interface ProfileWithLinks extends Profile {
  links: Link[]
}
