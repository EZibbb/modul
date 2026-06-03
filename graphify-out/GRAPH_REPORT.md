# Graph Report - .  (2026-06-03)

## Corpus Check
- Corpus is ~22,523 words - fits in a single context window. You may not need a graph.

## Summary
- 123 nodes · 167 edges · 11 communities (9 shown, 2 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.79)
- Token cost: 162,465 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Каталог · Совместимость · Карточка|Каталог · Совместимость · Карточка]]
- [[_COMMUNITY_База знаний · Сервис · Контент|База знаний · Сервис · Контент]]
- [[_COMMUNITY_Среда Claude и правила|Среда Claude и правила]]
- [[_COMMUNITY_Личный кабинет · UX · Дизайн|Личный кабинет · UX · Дизайн]]
- [[_COMMUNITY_Решения проекта · ИИ-слой|Решения проекта · ИИ-слой]]
- [[_COMMUNITY_Данныеseed · Задачи · ТЗ|Данные/seed · Задачи · ТЗ]]
- [[_COMMUNITY_Архитектура · Roadmap · Стек|Архитектура · Roadmap · Стек]]
- [[_COMMUNITY_Graphify enhancer (код)|Graphify enhancer (код)]]
- [[_COMMUNITY_Граф-визуализация (hoveredges)|Граф-визуализация (hover/edges)]]
- [[_COMMUNITY_Husky pre-commit|Husky pre-commit]]
- [[_COMMUNITY_Setup-инструменты|Setup-инструменты]]

## God Nodes (most connected - your core abstractions)
1. `L. ИИ-слой (инженерный со-пилот)` - 10 edges
2. `SESSION_CONTEXT — журнал сессий + @last` - 9 edges
3. `B. Совместимость (killer-фича, спека)` - 9 edges
4. `INSTRUCTIONS — свод правил агента` - 8 edges
5. `01 Overview — концепция Modul comp` - 8 edges
6. `02 Карта функционала + тиры (A–N)` - 8 edges
7. `K. Данные / seed (фундамент)` - 8 edges
8. `04 Архитектура (модель данных, API, потоки)` - 7 edges
9. `Product (модель товара)` - 7 edges
10. `CLAUDE.md — главный маршрутизатор` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Graphify knowledge graph (D004)` --references--> `_apply_enhancements main() injector`  [EXTRACTED]
  CLAUDE.md → _OPTIONAL/graphify-enhancements/_apply_enhancements.py
- `CLAUDE.md — главный маршрутизатор` --references--> `01 Overview — концепция Modul comp`  [EXTRACTED]
  CLAUDE.md → _claude/concept/01_overview.md
- `Индивидуальные/оптовые цены (F6)` --shares_data_with--> `Product (модель товара)`  [INFERRED]
  _claude/concept/03_features/F_account.md → _claude/concept/03_features/K_data.md
- `CLAUDE.md — главный маршрутизатор` --references--> `INSTRUCTIONS — свод правил агента`  [EXTRACTED]
  CLAUDE.md → _claude/INSTRUCTIONS.md
- `CLAUDE.md — главный маршрутизатор` --references--> `SESSION_CONTEXT — журнал сессий + @last`  [EXTRACTED]
  CLAUDE.md → _claude/SESSION_CONTEXT.md

## Hyperedges (group relationships)
- **Свод правил работы агента (router + instructions + workflow + docsmap)** — claudemd_router, instructions, workflow, docsmap, session_context [INFERRED 0.85]
- **Спина модели данных совместимости (каталог/карточка/архитектура держатся на B)** — feat_b_data_model, arch_compatibility_m2m, feat_a_compatiblewith, feat_c_card [INFERRED 0.85]
- **Production-на-seed: продукт растёт подключением источников, не переписывается** — overview_production_seed, arch_seed_strategy, arch_production_bridge, feat_e_quote [INFERRED 0.75]
- **ИИ-слой grounded на каталог через tools** — l_ai_tool_use_grounded, l_ai_search_products_tool, l_ai_get_compatibility_tool, k_data_product_model [EXTRACTED 0.85]
- **Калькулятор оптбюджета переиспользуется L2/M4/G1** — g_knowledge_calc_optical_budget_tool, g_knowledge_optical_budget_calc, l_ai_solution_picker, m_eng_tools_line_configurator [EXTRACTED 0.85]
- **Seed-данные как фундамент фасетов, карточки и ИИ** — k_data_seed, k_data_attribute_definition, tz_raw_v1_faceted_search, l_ai_layer [INFERRED 0.75]

## Communities (11 total, 2 thin omitted)

### Community 0 - "Каталог · Совместимость · Карточка"
Cohesion: 0.12
Nodes (24): Compatibility M2M (Product↔DeviceModel), Единая Prisma-модель данных, Product (гибрид core + JSONB атрибуты), Мост в production (рост, не переписывание), A. Каталог и поиск (спека), Фильтр compatibleWith (мост к B), Динамические фасеты + счётчики (groupBy), B. Совместимость (killer-фича, спека) (+16 more)

### Community 1 - "База знаний · Сервис · Контент"
Cohesion: 0.11
Nodes (24): D-007 — Вариант прошивок А (один SKU + услуга), G4 Блог/статьи (Article), calc_optical_budget (tool), G3 Глоссарий (GlossaryTerm + tooltip), G2 Справочник длин волн / ITU-сетки (ItuChannel), G. База знаний, G1 Калькулятор оптического бюджета, H1 Программирование/кодировка модулей (+16 more)

### Community 2 - "Среда Claude и правила"
Cohesion: 0.16
Nodes (18): Idempotent re-runnable injection, _apply_enhancements main() injector, CLAUDE.md — главный маршрутизатор, DOCS_MAP — карта целей документов, Принцип «одна цель → один документ», Graphify knowledge graph (D004), gstack скиллы (17 + базовый), INSTRUCTIONS — свод правил агента (+10 more)

### Community 3 - "Личный кабинет · UX · Дизайн"
Cohesion: 0.17
Nodes (13): Design Brief Prompt (дизайн-система), Бенчмарк FS.com + Linear/Vercel/Stripe, F. Личный кабинет (B2B), Иерархические корп-аккаунты (F2), Индивидуальные/оптовые цены (F6), NextAuth авторизация, История заказов с повтором (F3), SavedConfig (избранное/шаблоны/конфигурации) (+5 more)

### Community 4 - "Решения проекта · ИИ-слой"
Cohesion: 0.23
Nodes (12): D001 — Полное рабочее демо, не production, D002 — Настоящий продукт на seed-данных, D003 — Стек: Next.js + Prisma + Claude API, D-006 — Запасной офлайн-режим ИИ, Реестр решений (DECISIONS), Доменно-достоверный seed (доверие аудитории), L3 Парсер конфига/ТЗ, L4 Диагностика DOM (+4 more)

### Community 5 - "Данные/seed · Задачи · ТЗ"
Cohesion: 0.21
Nodes (12): TASKS — активные задачи, TASKS — выполненные задачи, inbox 001 — Исходное ТЗ, INBOX — входящие материалы, AttributeDefinition (словарь фасетов), CSV-импортёр (имитация выгрузки из 1С), Гибридная модель: core + JSONB + AttributeDefinition, K. Данные / seed (фундамент) (+4 more)

### Community 6 - "Архитектура · Roadmap · Стек"
Cohesion: 0.25
Nodes (8): ИИ tool use поток (Claude API + Prisma, grounded), Seed-стратегия (TS/CSV → prisma db seed), 04 Архитектура (модель данных, API, потоки), Стек D003 (Next.js+TS+Tailwind+shadcn+Prisma+Claude API+Vercel), 05 Roadmap — демо vs дорожная карта, Порядок сборки Этапа 2, Стратегия демонстрации (P0/P1 работает, P2 рост), Тиры P0/P1/P2

### Community 7 - "Graphify enhancer (код)"
Cohesion: 0.67
Nodes (3): load_hyperedges(), main(), Apply visual enhancements to graphify-out/graph.html. Re-runnable: idempotent. R

### Community 8 - "Граф-визуализация (hover/edges)"
Cohesion: 0.67
Nodes (3): drawGradientEdge (gradient edge rendering), Hover focus mode (focusOnNode/clearFocus), ulayApplyEnhancements (graph visual enhancer)

## Knowledge Gaps
- **31 isolated node(s):** `Apply visual enhancements to graphify-out/graph.html. Re-runnable: idempotent. R`, `drawGradientEdge (gradient edge rendering)`, `Hover focus mode (focusOnNode/clearFocus)`, `Idempotent re-runnable injection`, `Принцип «одна цель → один документ»` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Product (модель товара)` connect `База знаний · Сервис · Контент` to `Личный кабинет · UX · Дизайн`, `Данные/seed · Задачи · ТЗ`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `SESSION_CONTEXT — журнал сессий + @last` connect `Среда Claude и правила` to `Каталог · Совместимость · Карточка`, `Архитектура · Roadmap · Стек`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `K. Данные / seed (фундамент)` connect `Данные/seed · Задачи · ТЗ` to `База знаний · Сервис · Контент`, `Решения проекта · ИИ-слой`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **What connects `Apply visual enhancements to graphify-out/graph.html. Re-runnable: idempotent. R`, `drawGradientEdge (gradient edge rendering)`, `Hover focus mode (focusOnNode/clearFocus)` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Каталог · Совместимость · Карточка` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `База знаний · Сервис · Контент` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._