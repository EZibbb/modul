/* Modul comp — Product page: tabs, gallery, qty, firmware select, compatibility search. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  document.addEventListener('DOMContentLoaded', () => {
    // tabs
    $$('[data-tab]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.tab;
      $$('[data-tab]').forEach(b => {
        const on = b === btn;
        b.classList.toggle('border-primary', on);
        b.classList.toggle('text-foreground', on);
        b.classList.toggle('border-transparent', !on);
        b.classList.toggle('text-muted-foreground', !on);
      });
      $$('[data-panel]').forEach(p => p.classList.toggle('hidden', p.dataset.panel !== id));
      $('#prod-tabs')?.scrollIntoView({ block: 'nearest' });
    }));

    // gallery
    $$('[data-thumb]').forEach(t => t.addEventListener('click', () => {
      $$('[data-thumb]').forEach(x => x.classList.remove('border-primary', 'ring-2', 'ring-ring/25'));
      t.classList.add('border-primary', 'ring-2', 'ring-ring/25');
      const idx = t.dataset.thumb;
      $$('[data-stage]').forEach(s => s.classList.toggle('hidden', s.dataset.stage !== idx));
    }));

    // qty stepper
    const qtyEl = $('#prod-qty');
    $('#qty-minus')?.addEventListener('click', () => { qtyEl.value = Math.max(1, (+qtyEl.value || 1) - 1); updatePrice(); });
    $('#qty-plus')?.addEventListener('click', () => { qtyEl.value = (+qtyEl.value || 1) + 1; updatePrice(); });
    qtyEl?.addEventListener('input', updatePrice);
    function updatePrice() {
      const q = Math.max(1, +qtyEl.value || 1);
      const unit = q >= 50 ? 2400 : q >= 10 ? 2650 : 2900;
      $('#prod-unit').textContent = unit.toLocaleString('ru-RU') + ' ₽';
      $('#prod-total').textContent = (unit * q).toLocaleString('ru-RU') + ' ₽';
      $('#prod-tier').textContent = q >= 50 ? 'партнёрская 50+' : q >= 10 ? 'опт 10–49' : 'розница 1–9';
    }
    updatePrice();

    // firmware dropdown
    const fw = $('#fw-btn'), fwMenu = $('#fw-menu');
    fw?.addEventListener('click', () => fwMenu.classList.toggle('hidden'));
    $$('[data-fw]').forEach(o => o.addEventListener('click', () => {
      $('#fw-label').textContent = o.dataset.fw;
      fwMenu.classList.add('hidden');
    }));
    document.addEventListener('click', e => { if (fw && !fw.contains(e.target) && !fwMenu.contains(e.target)) fwMenu.classList.add('hidden'); });

    // compatibility search within table
    $('#compat-search')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      $$('#compat-tbody tr').forEach(tr => tr.classList.toggle('hidden', !tr.textContent.toLowerCase().includes(q)));
    });
  });
})();
