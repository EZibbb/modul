# NAV_INDEX — Где какой файл лежит
# @file: NAV_INDEX

> Индекс проекта Modul comp. Обновляется по ходу — каждый раз когда добавляется новый файл уровня каркаса.

---

## Корневые файлы

| Файл | Что |
|---|---|
| `CLAUDE.md` | Главный маршрутизатор. Стартовое чтение в каждой сессии |
| `.gitignore` | Generic исключения для git |
| `.graphifyignore` | Исключения для knowledge-graph builder |
| `skills-lock.json` | Зафиксированный список скиллов |

---

## `_claude/` — мозг проекта

| Файл | Что |
|---|---|
| `INSTRUCTIONS.md` | Свод правил работы (режимы, верификация, эскалация, аудит) |
| `WORKFLOW.md` | Методология задач (чеклист + уровни + @last формат) |
| `NAV_INDEX.md` | Этот файл — индекс |
| `SESSION_CONTEXT.md` | Журнал сессий + @last |
| `SKILL_MAP.md` | Карта скиллов с триггерами активации |
| `DOCS_MAP.md` | «Какой документ для чего» |
| `tasks/README.md` | Методология иерархии задач |
| `tasks/active.md` | Активные задачи (от глобальных этапов до атомарных) |
| `tasks/done.md` | Выполненные задачи |
| `research/decisions.md` | D### registry — все принятые решения и D-кандидаты |
| `research/inbox.md` | Входящие материалы (ссылки, заметки, идеи к разбору) |
| `research/notes/` | Свободные исследовательские заметки (опционально) |
| `concept/` | Концепт-документы (создаются в Этапе 1 — заполни по ходу) |

---

## `concept/` — концепция продукта

> Будет заполнено в Этапе 1. Шаблон по практике УЛЕЯ:
>
> | Файл | Что |
> |---|---|
> | `01_overview.md` | Что за продукт, целевая аудитория, value proposition |
> | `02_architecture.md` | Системная архитектура (C4 / слои / data flow) |
> | `03_features/` | Каталог фич (по доменам — platform / smm / crm / admin / team / analytics) |
> | `04_monetization.md` | Тарифы, биллинг, активация |
> | `05_roadmap.md` | Этапы развития |
> | `06_agents_spec.md` | ТЗ AI-агентов (если применимо) |
> | `07_tech_stack.md` | Технологический стек |
> | `07_data_models.md` | Модели данных (SQL DDL / API) |
> | `08_ui_wireframes.md` | UI/UX концепт |
> | `09_integration_plan.md` | План интеграции дизайна → код |
> | `clients/[name].md` | Кейсы пилотных клиентов |

---

## `graphify-out/` — knowledge graph

> Создаётся при первом запуске `/graphify`. Не редактировать руками.

| Файл | Что |
|---|---|
| `graph.html` | Интерактивная визуализация (открывать в браузере) |
| `graph.json` | Сырые данные графа |
| `GRAPH_REPORT.md` | Сводка: god nodes / communities / surprising connections |
| `manifest.json` | Diff с прошлым запуском |
| `cost.json` | Кумулятивный счётчик токенов |
| `cache/` | Кеш для `--update` (не трогать) |

---

## `.claude/` — настройки Claude Code

| Файл | Что |
|---|---|
| `settings.json` | Hooks + permissions allowlist |
| `hooks/markdown_changed.py` | Ставит флаг при правке markdown |
| `hooks/graph_stale_check.py` | Напоминает «граф устарел» при завершении сессии |
| `skills/` | Junction-link на `~/.claude/skills/` (создаётся per-machine) |

---

## `backups/decisions/`

> Снапшоты `_claude/` после ключевых этапов. Формат: `YYYY-MM-DD_короткое_описание/`. В каждой папке — `_АКТУАЛЬНЫЙ.md` с описанием что именно бэкапилось.

---

## Маркерная система `@section:`

> Большие файлы (>200 строк) помечаются маркерами `@section: BLOCK_NAME` для быстрой навигации через Grep.

Список маркеров заполнить по ходу:

| Файл | Маркеры |
|---|---|
| (пусто) | — |

---

## Команды быстрого доступа

- `НАЧАЛО` → читаю `SESSION_CONTEXT.md → @last`
- `ИНДЕКС` → показываю этот файл
- `КОНЦЕПТ` → открываю `_claude/concept/01_overview.md`
- `/graphify --update` → переиндексация графа
