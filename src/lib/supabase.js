import { createClient } from '@supabase/supabase-js';

// Colocamos as chaves diretamente aqui para contornar o problema do .env
const supabaseUrl = 'https://jkpswhcchvyhsxbgjlzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcHN3aGNjaHZ5aHN4YmdqbHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODg0OTgsImV4cCI6MjA5MDA2NDQ5OH0.jUpZnv5Sqey2rdtbPmPyCo9QVA-sfWP8H-Rdd9z7MJs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);