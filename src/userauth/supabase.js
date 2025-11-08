import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://jolvceyrpdligwvebgjf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbHZjZXlycGRsaWd3dmViZ2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzQwNzcsImV4cCI6MjA3NTA1MDA3N30.u72wiTUOWmD7xsxoZFNu08Yc8FYarXbIJlPLbbBGGes'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
