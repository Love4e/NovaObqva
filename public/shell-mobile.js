// Единен мобилен док + бейдж за непрочетени + realtime нотификации
// Включи този файл в края на всяка страница (вече е добавен в ads/submit/chat).

(function(){
  if (!window.supabase || !window.ENV) return;
  const sb = supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);

  // ---- Render dock ----
  const dock = document.createElement('div');
  dock.innerHTML = `
    <nav id="nova-dock" class="md:hidden fixed bottom-3 inset-x-0 z-[60] flex justify-center pointer-events-none">
      <div class="pointer-events-auto bg-white/95 backdrop-blur border rounded-2xl shadow-lg mx-3 px-3 py-2 flex items-center justify-around gap-2 w-full max-w-xl">
        <a href="index.html" class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-50">
          <svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="currentColor" d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>
          <span class="text-[11px]">Обяви</span>
        </a>
        <a href="submit.html" class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-50">
          <svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="currentColor" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
          <span class="text-[11px]">Създай</span>
        </a>
        <a href="chat.html" class="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-50">
          <svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="currentColor" d="M4 4h16v10H6l-2 2z"/></svg>
          <span class="text-[11px]">Чат</span>
          <span id="dockBadge" class="hidden absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-600 text-white"></span>
        </a>
      </div>
    </nav>
  `;
  document.body.appendChild(dock);

  const badge = document.getElementById('dockBadge');

  let me=null, convIds=[], unread=0, rt=null;
  initUnread();

  async function initUnread(){
    const { data:{ user } } = await sb.auth.getUser();
    if (!user){ setBadge(0); return; }
    me = user;

    // conversations for me
    const { data: parts } = await sb.from('conversation_participants').select('conversation_id').eq('user_id', me.id);
    convIds = (parts||[]).map(p=>p.conversation_id);
    if (convIds.length===0){ setBadge(0); return; }

    // initial unread
    const { data: rows } = await sb.from('messages')
      .select('id,conversation_id').in('conversation_id', convIds)
      .is('read_at', null).neq('sender_id', me.id);
    unread = (rows||[]).length;
    setBadge(unread);

    // realtime subscribe
    if (rt) { sb.removeChannel(rt); rt=null; }
    rt = sb.channel('rt-dock')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'messages' }, async (payload)=>{
        const m = payload.new;
        if (!convIds.includes(m.conversation_id)) return;
        if (m.sender_id === me.id) return;

        unread += 1; setBadge(unread);

        // Web Notifications (по желание)
        if (document.hidden && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Ново съобщение', { body: (m.body||'').slice(0,80) });
          } else if (Notification.permission === 'default') {
            try{ await Notification.requestPermission(); }catch(_){}
          }
        }
      })
      .subscribe();

    // слушай вътрешно събитие от chat.html за прочитане
    window.addEventListener('novaobqva:unread-updated', async ()=>{
      const { data: rows2 } = await sb.from('messages')
        .select('id').in('conversation_id', convIds)
        .is('read_at', null).neq('sender_id', me.id);
      unread = (rows2||[]).length;
      setBadge(unread);
    });
  }

  function setBadge(n){
    if (!badge) return;
    if (!n || n<=0){ badge.classList.add('hidden'); badge.textContent=''; }
    else { badge.classList.remove('hidden'); badge.textContent = n>99 ? '99+' : String(n); }
  }
})();
