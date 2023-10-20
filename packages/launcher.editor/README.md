# Редактор конфигурации

1. инициализируйте проект

   ```
   npx lerna bootstrap --scope @toloka-tb/launcher.editor --include-dependencies
   ```

1. определитесь с каким реестром вы будете работать: локальным или удаленным. Продакшен реестр доступен по адресу https://tb.toloka.dev/registry2/

1. запустите проект с нужным реестром

   ```
   npx lerna run dev --scope=@toloka-tb/launcher.editor --stream -- -- --env.registry=https://tb.toloka.dev/registry2/
   ```

1. откройте http://localhost:8080/
