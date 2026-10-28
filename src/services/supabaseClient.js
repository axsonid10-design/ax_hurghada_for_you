import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gwxumpjezcwxhpuicwfi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3eHVtcGplemN3eGhwdWljd2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTA2MDIsImV4cCI6MjEwODY4NjYwMn0.2GdKvVKDOX-425I8kqGa29XkbySEWVj2BlIitL2xMuE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
