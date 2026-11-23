# max4j docs

React-документация независимой Java-библиотеки [max4j](https://github.com/max4j/max4j) для MAX Bot API.

## Локальный запуск

```bash
npm ci
npm run dev
```

Проверка production-сборки: `npm run build`. Сайт не требует backend и не содержит секретов.

## Версии документации

Сайт описывает `io.max4j:0.4.2`. При изменении версии обновите примеры зависимостей и обозначение версии в `src/main.tsx`.

## Сборка и размещение

В `.github/workflows/verify.yml` запускаются TypeScript/Vite-сборка и проверка манифестов. Ручной workflow `build-and-push.yml` публикует образ в тот же Yandex Container Registry, что и React-сервисы `project8617`: `cr.yandex/crplfa8eqvo7nvc0abpg/app/max4j-docs:<tag>`. Для доступа нужен уже используемый в организации секрет `YC_CLI_KEY` (base64 service account JSON) либо `YC_IAM_TOKEN`; убедитесь, что он доступен новому репозиторию.

После публикации образа в кластере с `nginx` ingress class и pull secret `yc-regcred`:

```bash
kubectl apply -k k8s
kubectl rollout status deployment/max4j-docs
```

Ingress принимает Host `docs.max4j.io`. Внешний DNS и nginx-прокси настраиваются отдельно владельцем домена. Health check: `/healthz`.
