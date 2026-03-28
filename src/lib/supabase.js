import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://prxapvfcpljtwmehikul.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByeGFwdmZjcGxqdHdtZWhpa3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NDM4MjYsImV4cCI6MjA5MDIxOTgyNn0.0MvpnBpzZKv0p8z4ENkwIAg7g5irTvbzVuaJRR4upZ8'

export const supabase = createClient(supabaseUrl, supabaseKey)