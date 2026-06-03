# Husky pre-commit setup (для web-проектов)

> Применяется когда в проекте появляется фронтенд (TS/JS/React/Next.js).
> Запускает lint-staged на staged-файлах перед коммитом.

---

## Установка (monorepo-style, hooks в корне репо)

### 1. Установить husky + lint-staged в web/

```powershell
cd web
npm install --save-dev husky lint-staged
```

### 2. Добавить в `web/package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  }
}
```

### 3. Скопировать `.husky/pre-commit` из этой папки в корень репо

```powershell
mkdir .husky
Copy-Item -Path "_OPTIONAL/husky-setup/pre-commit" -Destination ".husky/pre-commit"
```

### 4. Сделать hook исполняемым (только если используешь Git Bash)

```bash
chmod +x .husky/pre-commit
```

### 5. Указать husky на эту папку

В корне проекта создать `.husky/_/husky.sh` (husky это делает автоматически при `npx husky init`, но в monorepo-стиле мы храним hooks вручную).

Альтернатива — добавить в корневой `package.json`:
```json
{
  "scripts": {
    "prepare": "cd web && npx husky"
  }
}
```

Или **проще**: просто положить `pre-commit` в `.husky/` и убедиться что git его видит:
```powershell
git config core.hooksPath .husky
```

### 6. Проверить

Сделай любую правку в `web/*.ts`, `git add .`, `git commit -m "test"` — должен запуститься eslint + prettier.

---

## Скрипт `pre-commit`

См. файл `pre-commit` в этой папке. Логика:

- Если есть staged изменения в `web/` → `cd web && npx lint-staged`
- Если нет → пропустить (например, правки только в `_claude/`)
