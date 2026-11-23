# max4j docs

React-документация независимой Java-библиотеки [max4j](https://github.com/max4j/max4j) для MAX Bot API.

## Локальный запуск

```bash
npm ci
npm run dev
```

Проверка production-сборки: `npm run build`. Сайт не требует backend и не содержит секретов.

## Версии документации

Примеры зависимостей используют `io.max4j:0.2.0`, опубликованную версию Maven Central. Spring Boot 4 и OpenAPI 0.0.34 описаны как изменения в исходниках 0.3.0 до выхода релиза. После публикации 0.3.0 обновить версии в `src/main.tsx` и проверить примеры.

## Сборка и размещение

В `.github/workflows/verify.yml` запускаются TypeScript/Vite-сборка и проверка манифестов. Ручной workflow `build-and-push.yml` публикует образ в тот же Yandex Container Registry, что и React-сервисы `project8617`: `cr.yandex/crplfa8eqvo7nvc0abpg/app/max4j-docs:<tag>`. Для доступа нужен уже используемый в организации секрет `YC_CLI_KEY` (base64 service account JSON) либо `YC_IAM_TOKEN`; убедитесь, что он доступен новому репозиторию.

После публикации образа в кластере с `nginx` ingress class и pull secret `yc-regcred`:

```bash
kubectl apply -k k8s
kubectl rollout status deployment/max4j-docs
```

Ingress принимает Host `docs.max4j.io`. Внешний DNS и nginx-прокси настраиваются отдельно владельцем домена. Health check: `/healthz`.
