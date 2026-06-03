# Graphify enhancements (iOS minimalist + cosmos backdrop + gradient edges)

> Преобразует дефолтный `graphify-out/graph.html` в iOS-minimalist стиль с on-hover focus-эффектами. Применяется **после каждого** запуска `/graphify` или `/graphify --update`.

---

## Когда применять

**После каждого `/graphify`** — обязательно. Это правило из memory `graph-visual-enhancements`.

## Что делает скрипт `_apply_enhancements.py`

- Дефолтный `graph.html` информативен но визуально перегружен (надписи на каждой ноде, постоянные pulses, glow)
- Скрипт переписывает CSS + JS в `graph.html`:
  - По умолчанию: **чистый граф**, без надписей, без pulses
  - При hover на ноду: она и соседи **яркие** (opacity 1.0), остальное **гаснет** (opacity 0.06)
  - Label **fade-in** для focused-узлов
  - Pulses бегут **только** на edges связанных с focused-узлом
  - Cosmos backdrop (тёмное звёздное небо)
  - Gradient edges (цветные градиенты по communities)
- Также инжектит hyperedges если они есть в `graph.json`

## Установка в новый проект

После первого `/graphify` (когда папка `graphify-out/` появится):

```powershell
# Скопировать скрипт в graphify-out/
Copy-Item -Path "_OPTIONAL/graphify-enhancements/_apply_enhancements.py" -Destination "graphify-out/_apply_enhancements.py"

# Прогнать enhancements
python graphify-out/_apply_enhancements.py

# Открыть graph.html в браузере — должен быть iOS-minimalist стиль
```

## После каждого `/graphify --update`

```powershell
python graphify-out/_apply_enhancements.py
```

Без этого граф вернётся к дефолтному перегруженному виду.
