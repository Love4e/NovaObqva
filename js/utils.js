<script>
window.utils = {
money(n) { try { return new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(Number(n)); } catch { return n; } },
ago(ts) { try { return new Intl.RelativeTimeFormat('bg', { numeric: 'auto' }).format(Math.round((new Date(ts) - new Date())/60000/60/24), 'day'); } catch { return ts; } },
qs(sel, root=document){ return root.querySelector(sel); },
qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; },
toast(msg){
const t = document.createElement('div');
t.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-xl shadow-lg z-50';
t.textContent = msg;
document.body.appendChild(t);
setTimeout(()=>t.remove(), 2500);
},
parseQuery(){ return Object.fromEntries(new URL(location.href).searchParams.entries()); },
async uploadFiles(files, bucket){
const uploaded = [];
for (const [i,f] of [...files].entries()){
const ext = f.name.split('.').pop();
const path = `${crypto.randomUUID()}.${ext}`;
const { error } = await supabaseClient.storage.from(bucket).upload(path, f, { upsert:false });
if(error) throw error;
const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
uploaded.push({ url: data.publicUrl, position: i });
}
return uploaded;
}
}
</script>
