import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://scgoyggukjedqfapjqbu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZ295Z2d1a2plZHFmYXBqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzg4MDYsImV4cCI6MjA3NTk1NDgwNn0.7emOPhRZoY66YR2lvAzHgnSZ-QTXQe4Dz78cQxZTCBc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
