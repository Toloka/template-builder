# lang.json

Инструменты для работы с JSON (без специфики DSL tb)

## scanner.ts & parser.ts

Парсер устойчивый к ситаксическим ошибкам. Для токенизации используется jsonc-parser.

## ast.ts

Типы узлов ast и ошибок

## Разработка

Сделать `npx lerna bootstrap` в корне репозитория
Рекомендуется поглядывать на тесты `npm run dev`