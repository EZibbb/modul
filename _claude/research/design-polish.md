# Дизайн-полировка обеих тем — чек-лист (40 доработок)

> Источник: анализ скриншотов + ui-ux-pro-max + Linear/Vercel-референсы. ⭐ = топ-эффект.
> Статусы: `[ ]` / `[x]`. Делаем батчами, коммит на батч.

## ☀️ СВЕТЛАЯ

Поверхности/глубина
- [ ] L1 ⭐ Тинт-бэнды секций (чередование белые / `215 30% 97%`)
- [ ] L2 Спектр-разделители между секциями главной
- [ ] L3 Единый resting-shadow у всех карточек
- [x] L4 Таблица «Популярное»: hover-строка + плотнее zebra
- [x] L5 ⭐ Footer тонированный + верхняя spectrum-полоса
- [x] L6 Utility-bar: лёгкий primary-tint фон

Бренд
- [x] L7 Hero-CTA градиент primary→cyan
- [x] L8 ⭐ Trust-иконки: tinted кружок-подложка
- [x] L9 Бейдж «в наличии» насыщеннее (solid dot + tint)
- [x] L10 Wavelength-шкала: ярче точки/подписи
- [ ] L11 Активный пункт навигации — primary-подсветка
- [ ] L12 Search-поле: focus-ring primary + тень

Иерархия/типографика
- [ ] L13 H1 hero крупнее (5xl→6xl) + tracking-tighter
- [x] L14 ⭐ Kicker-лейблы над H2 секций
- [ ] L15 Цены tabular + solid success-chip экономии
- [ ] L16 Контраст мелкого 2xs muted (4.5:1)

Моушн
- [ ] L17 ⭐ Skeleton-загрузка каталога/поиска
- [ ] L18 Плавный theme-switch (кросс-фейд)
- [ ] L19 Reveal на внутренних страницах
- [ ] L20 Hero-сетка: вторичная мелкая + точки на пересечениях

## 🌙 ТЁМНАЯ

Поверхности/elevation
- [x] D1 ⭐ Тиры elevation + hover-поднятие card (10→12% L)
- [x] D2 ⭐ Glow при hover карточек (cyan/15)
- [x] D3 Border-подсветка cyan на hover
- [ ] D4 Hero glow-пятна сильнее (primary+cyan)
- [ ] D5 Таблицы: zebra тоньше, hover-row cyan-tint
- [x] D6 ⭐ Footer dark отделить (card + spectrum)

Акцент
- [x] D7 cyan активнее в разделителях/иконках
- [ ] D8 Primary-кнопки лёгкое свечение
- [x] D9 Success/warning бейджи ярче
- [x] D10 Глифы категорий — внешнее свечение сильнее
- [x] D11 Wavelength-точки сильнее glow
- [x] D12 spectrum-rule opacity .55→.7

Глубина/текстура
- [ ] D13 Grid у текста видимее (.07→.10)
- [ ] D14 Радиальные primary/cyan меш-пятна за секциями
- [x] D15 ⭐ Inner top-highlight карточек (1px)
- [ ] D16 Scrim drawer/модалок 50–60%

Иерархия/типографика
- [ ] D17 Заголовки светлее (92→94%) + cyan kicker
- [ ] D18 Цены tabular, акцент primary-light
- [ ] D19 Контраст secondary ≥3:1
- [ ] D20 Focus-ring ярче + offset

## Общие (один раз на обе)
- L17/D-моушн skeleton · L18 theme-switch · L19 reveal-везде

## Порядок батчей
- **Б1 структура+бренд:** L14 L2 L5/D6 L8 L7 L9/D9 L4/D5 L6
- **Б2 глубина/акцент:** L3 D1 D2 D3 D15 D7 D12 D10 D11 L10
- **Б3 типографика:** L13 L15 L16 D17 D18 D19 D20 L11 L12
- **Б4 моушн:** L18 theme-switch · L17 skeleton · L19/reveal-inner
- **Б5 hero/текстура:** L20 D4 D13 D14 D16 L1 тинт-бэнды
