<!-- Включва се преди нашите скриптове: -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
const SUPABASE_URL = "https://brlfymnsgaibkozprrrq.supabase.co"; // замени
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJybGZ5bW5zZ2FpYmtvenBycnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDg3MjcsImV4cCI6MjA3MjQ4NDcyN30.Jw7_mwGjZNfshrMqk4z2RYkMRDvFRFXpI8W4IXqaUZI"; // замени
window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Прост маркер за админ достъп в клиент (MVP). Смени с твой секрет (напр. query ?admin=...)
window.NOVAOBQVA_ADMIN_ID = "brlfymns-admin";
</script>
