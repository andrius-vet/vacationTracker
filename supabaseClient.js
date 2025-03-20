import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://etiaigvjbvqaffjiwucd.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0aWFpZ3ZqYnZxYWZmaml3dWNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0NzkyMjgsImV4cCI6MjA1ODA1NTIyOH0.sQqcSCoM0RDdeFwPECzQFNDNhfphvUc00-f3hCA4aUs";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
