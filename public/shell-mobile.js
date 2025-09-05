// public/shell-mobile.js
// Единен мобилен док (вграден/sticky) + бейдж за непрочетени + realtime нотификации
// Включи този файл в края на всяка страница.

(function () {
  if (!window.supabase || !window.ENV) return;

  // ако вече е монтиран – не дублирай
  if (document.getElementById('mobileDock')) return;

  const sb = supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);

  // ---- Render embedded dock (sticky) ----
  const dock = document.createElement('nav');
  dock.id = 'mobileDock';
  dock.setAttribute('data-mobile-dock', '');
  // класовете тук са само козметика; позиционирането е sticky, не fixed
  dock.className =
    'md:hidden sticky bottom-0 left-0 right-0 z-[45] ' +
    'bg-white/95 backdrop-blur border-t shadow-[0_-6px_20px_rgba(0,0,0,0.06)]';

  dock.innerHTML = `
    <div class="max-w-xl mx-auto w-full px-4 py-2">
      <div class="grid grid-cols-3 items-center text-center gap-1">
        <a data-page="index.html" href="index.html"
           class="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 hover:bg-slate-50">
          <svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="currentColor" d="M12 3 2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>
          <span class="text-[11px]">Обяви</span>
        </a>
        <a data-page="submit.html" href="submit.html"
           class="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 hover:bg-slate-50">
          <svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="currentColor" d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/></svg>
          <span class="text-[11px]">Създай</span>
        </a>
        <a data-page="chat.html" href="chat.html"
           class="relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 hover:bg-slate-50">
          <svg viewBox="0 0 24 24" class="w-6 h-6"><path fill="currentColor" d="M4 4h16v10H6l-2 2z"/></svg>
          <span class="text-[11px]">Чат</span>
          <span id="dockBadge"
                class="hidden absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-600 text-white"></span>
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(dock);

  // Активен таб според пътя
  (function setActive() {
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    dock.querySelectorAll('a[data-page]').forEach(a => {
      const on = a.dataset.page === page;
      a.toggleAttribute('aria-current', on);
      a.classList.toggle('text-emerald-700', on);
      a.classList.toggle('font-semibold', on);
    });
  })();

  // ---- Unread badge + realtime ----
  const badge = document.getElementById('dockBadge');
  let me = null, convIds = [], unread = 0, rt = null;
  initUnread();

  async function initUnread() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { setBadge(0); return; }
    me = user;

    // вземи разговорите на потребителя
    const { data: parts, error: e1 } = await sb
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', me.id);
    if (e1) { setBadge(0); return; }

    convIds = (parts || []).map(p => p.conversation_id);
    if (!convIds.length) { setBadge(0); return; }

    // начална бройка непрочетени
    const { data: rows, error: e2 } = await sb
      .from('messages')
      .select('id,conversation_id,sender_id,read_at')
      .in('conversation_id', convIds)
      .is('read_at', null)
      .neq('sender_id', me.id);
    if (e2) { setBadge(0); return; }

    unread = (rows || []).length;
    setBadge(unread);

    // realtime за нови съобщения
    if (rt) { sb.removeChannel(rt); rt = null; }
    rt = sb.channel('rt-dock')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const m = payload.new;
        if (!convIds.includes(m.conversation_id)) return;
        if (m.sender_id === me.id) return;
        unread += 1; setBadge(unread);

        // опционални web notifications
        if (document.hidden && 'Notification' in window) {
          try {
            if (Notification.permission === 'granted') {
              new Notification('Ново съобщение', { body: String(m.body || '').slice(0, 80) });
            } else if (Notification.permission === 'default') {
              await Notification.requestPermission();
            }
          } catch(_) {}
        }
      })
      .subscribe();

    // вътрешно събитие от chat.html при прочитане
    window.addEventListener('novaobqva:unread-updated', async () => {
      const { data: rows2 } = await sb
        .from('messages')
        .select('id')
        .in('conversation_id', convIds)
        .is('read_at', null)
        .neq('sender_id', me.id);
      unread = (rows2 || []).length;
      setBadge(unread);
    });
  }

  function setBadge(n) {
    if (!badge) return;
    if (!n || n <= 0) {
      badge.classList.add('hidden');
      badge.textContent = '';
    } else {
      badge.classList.remove('hidden');
      badge.textContent = n > 99 ? '99+' : String(n);
    }
  }
})();
