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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'views' | 'created_at' | 'updated_at'> & {
          id?: string
          views?: number
          status?: ProfileStatus
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Profile>
      }
      links: {
        Row: Link
        Insert: Omit<Link, 'id' | 'order' | 'views' | 'created_at' | 'updated_at'> & {
          id?: string
          order?: number
          is_hot?: boolean
          views?: number
          status?: LinkStatus
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Link>
      }
    }
  }
}
