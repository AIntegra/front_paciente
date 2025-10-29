import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lxkwdepaupezwoqicctx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4a3dkZXBhdXBlendvcWljY3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzYxMjAsImV4cCI6MjA3NzE1MjEyMH0.y4mHc1WHgwnN_uX4st3beKw79NqH2-H79iIk1eNpnkg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
