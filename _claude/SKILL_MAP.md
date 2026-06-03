# SKILL_MAP — Карта скиллов Modul comp
# @file: SKILL_MAP

> Когда какой скилл вызывать. Полный набор скиллов сейчас: **46 активных** (15 наших + 17 gstack-* + 1 базовый gstack + 13 системных/встроенных, включая graphify).
> Решение по составу: `_claude/research/decisions.md` → **D003**.
> Реестр наших установленных: `skills-lock.json`.
> gstack-исходник: `~/.claude/skills/gstack/`.

---

## 🎯 БЫСТРЫЙ ПОИСК — что взять для какой задачи

| Задача | Скилл |
|---|---|
| Размышляю над идеей, не уверен стоит ли строить | `gstack-office-hours` (6 forcing вопросов) |
| Нужен план фичи/задачи | `writing-plans` → потом `gstack-plan-eng-review` |
| План-ревью на «думать шире» | `gstack-plan-ceo-review` |
| План-ревью на архитектуру | `gstack-plan-eng-review` |
| План-ревью на дизайн | `gstack-plan-design-review` |
| Полный пайплайн ревью одной командой | `gstack-autoplan` |
| Создать дизайн-систему с нуля | `gstack-design-consultation` |
| Сгенерировать 4-6 вариантов мокапов | `gstack-design-shotgun` |
| Превратить мокап в боевой HTML/CSS | `gstack-design-html` |
| Найти визуальные косяки + исправить | `gstack-design-review` |
| UI код-ревью на гайдлайны | `web-design-guidelines` (WIG) |
| UI/UX база (стили, палитры, шрифты) | `ui-ux-pro-max` |
| Production-grade UI компоненты | `frontend-design` |
| QA приложения с автофиксом | `gstack-qa` |
| QA только отчёт без фиксов | `gstack-qa-only` |
| Знания про Playwright | `playwright-best-practices` |
| Дебаг с поиском root cause | `gstack-investigate` |
| Безопасность: OWASP + STRIDE | `gstack-cso` |
| Security review PR | `security-review` (built-in) |
| Code review PR | `gstack-review` или `review` (built-in) |
| Запросить ревью по своей работе | `requesting-code-review` |
| TDD — пишу тесты до кода | `test-driven-development` |
| Верификация перед "готово" | `verification-before-completion` |
| Выполнение готового плана | `executing-plans` |
| API-дизайн (REST/GraphQL) | `api-design-principles` |
| Better Auth конфиг | `better-auth-best-practices` |
| React/Next.js перформанс | `vercel-react-best-practices` |
| Anthropic SDK / Claude API | `claude-api` |
| Word документ | `docx` |
| PDF | `pdf` |
| Excel/CSV | `xlsx` |
| Безопасный режим (rm-rf, force-push warnings) | `gstack-careful` |
| Аудит экономии токенов | `economy` |
| **Knowledge graph проекта (быстрый поиск без чтения raw)** | **`graphify`** (см. D004) |
| Создать новый скилл | `skill-creator` |
| Initial CLAUDE.md | `init` |
| Settings.json/permissions | `update-config` |
| Allowlist permissions | `fewer-permission-prompts` |
| Хоткеи | `keybindings-help` |
| Упростить код | `simplify` |
| Запустить задачу по интервалу | `loop` |
| Cron-расписание | `schedule` |
| Weekly retro | `gstack-retro` |
| Обновить gstack | `gstack-upgrade` |

---

## 📦 ПОЛНЫЙ СПИСОК СКИЛЛОВ (АКТИВ — 45 шт)

### 🟦 gstack-* (17 скиллов + 1 базовый)
Установлены через `~/.claude/skills/gstack/setup --prefix`. Подробности D003.

| Скилл | Назначение |
|---|---|
| `gstack` | Базовый headless браузер для QA |
| `gstack-autoplan` | Полный пайплайн ревью (CEO + design + eng + dx) одной командой |
| `gstack-careful` | Safety guardrails для деструктивных команд |
| `gstack-cso` | OWASP Top 10 + STRIDE + supply chain security аудит |
| `gstack-design-consultation` | Дизайн-система с нуля (DESIGN.md) |
| `gstack-design-html` | Мокап → production HTML/CSS |
| `gstack-design-review` | Аудит визуала, поиск AI-слопа, автофиксы |
| `gstack-design-shotgun` | 4-6 вариантов мокапов с comparison board |
| `gstack-investigate` | Систематический debugging с root cause |
| `gstack-office-hours` | YC office hours — 6 forcing вопросов |
| `gstack-plan-ceo-review` | План-ревью на масштаб (4 режима) |
| `gstack-plan-design-review` | План-ревью дизайна 0-10 |
| `gstack-plan-eng-review` | Архитектура, dataflow, edge cases |
| `gstack-qa` | QA приложения с автофиксом |
| `gstack-qa-only` | QA только отчёт |
| `gstack-retro` | Weekly retrospective |
| `gstack-review` | Pre-landing PR review (SQL safety, LLM trust) |
| `gstack-upgrade` | Обновить gstack |

### 🟩 Наши project skills (15 шт, через `.claude/skills/` junction)
Реестр: `skills-lock.json`.

| Скилл | Назначение |
|---|---|
| `api-design-principles` | REST/GraphQL API design |
| `better-auth-best-practices` | Better Auth конфиг |
| `docx` | Word документы |
| `executing-plans` | Выполнение планов |
| `frontend-design` | Production-grade UI |
| `pdf` | PDF |
| `playwright-best-practices` | Playwright knowledge |
| `requesting-code-review` | Запрос code review |
| `test-driven-development` | TDD |
| `ui-ux-pro-max` | UI/UX база (50+ стилей, 161 палитр) |
| `vercel-react-best-practices` | React/Next.js перформанс |
| `verification-before-completion` | Верификация перед "готово" |
| `web-design-guidelines` | WIG checklist |
| `writing-plans` | Создание планов |
| `xlsx` | Таблицы |

### 🟨 Системные / встроенные (13 шт)

| Скилл | Назначение |
|---|---|
| `economy` | Аудит токенов |
| **`graphify`** | **Knowledge graph проекта (D004)** |
| `skill-creator` | Создание скиллов |
| `update-config` | settings.json |
| `keybindings-help` | Хоткеи |
| `simplify` | Упрощение кода |
| `fewer-permission-prompts` | Allowlist |
| `loop` | Циклы по интервалу |
| `schedule` | Cron агенты |
| `claude-api` | Anthropic SDK |
| `init` | CLAUDE.md initial |
| `review` | PR review (built-in) |
| `security-review` | Security review (built-in) |

---

## 📦 БУФЕР — НЕ установлены сейчас, переустанавливаются по триггеру

> Эти скиллы **физически удалены** из `~/.claude/skills/`, чтобы не шумели в выборе.
> Когда триггер срабатывает — переустанавливаем заново через `cd ~/.claude/skills/gstack && bash setup --prefix`.

### Этап 6-8 (деплой, продакшен) — 8 шт
- `gstack-benchmark` — Core Web Vitals
- `gstack-canary` — мониторинг после деплоя
- `gstack-document-release` — обновление docs после ship
- `gstack-land-and-deploy` — merge + deploy + health
- `gstack-landing-report` — PR queue dashboard
- `gstack-ship` — sync + tests + push + PR
- `gstack-setup-deploy` — настройка деплой-платформы
- `gstack-health` — code quality dashboard

### Этап 7+ (живые клиенты, DX) — 3 шт
- `gstack-pair-agent` — pair remote AI
- `gstack-devex-review` — live DX audit
- `gstack-plan-devex-review` — DX plan review

### Дубль наших систем — 4 шт
- `gstack-context-save`, `gstack-context-restore` — дубль `SESSION_CONTEXT.md`
- `gstack-make-pdf` — дубль `pdf`
- `gstack-learn` — дубль `_claude/research/decisions.md`

### Не нужны для нашего стека — 5 шт
- `gstack-codex` — OpenAI (мы Claude)
- `gstack-browse`, `gstack-scrape`, `gstack-skillify` — браузер/скрейпинг
- `gstack-connect-chrome`, `gstack-open-gstack-browser` — визуальный браузер

### Узкоспециализированные — 9 шт
- `gstack-benchmark-models` — кросс-модельный
- `gstack-plan-tune` — sensitivity tuning
- `gstack-setup-browser-cookies`, `gstack-setup-gbrain`, `gstack-sync-gbrain`
- `gstack-freeze`, `gstack-guard`, `gstack-unfreeze`

---

## 🔄 КАК ВЕРНУТЬ БУФЕРНЫЕ СКИЛЛЫ

```bash
# Полная переустановка gstack — вернёт ВСЕ 44 скилла:
rm -rf ~/.claude/skills/gstack
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && bash setup --prefix
# Затем удалить только те что не нужны (см. список БУФЕР выше)
```

---

## 📋 ИСТОРИЯ ИЗМЕНЕНИЙ

| Дата | Что |
|---|---|
| 2026-05-09 | D003: установлен gstack с `--prefix`, удалены 29 буферных gstack-* + 2 наших (`systematic-debugging`, `webapp-testing`). Активный набор: 45 |
| 2026-05-09 | D004: установлен **graphify** (knowledge graph builder, +1 АКТИВ скилл). Первая индексация: 141 nodes, 218 edges, 11 communities. Outputs в `graphify-out/`. Активный набор: **46** |
