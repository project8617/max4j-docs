# max4j docs

React-документация независимой Java-библиотеки [max4j](https://github.com/max4j/max4j) для MAX Bot API.

## Локальный запуск

```bash
npm ci
npm run dev
```

Проверка production-сборки: `npm run build`. Сайт не требует backend и не содержит секретов.

## Версии документации

Текущая версия библиотеки хранится в `public/config/version.json` для локального запуска и в `k8s/configmap.yaml` для кластера. Сейчас это `0.4.2`. В Kubernetes достаточно обновить `version.json` в ConfigMap `max4j-docs-config`: бейдж, пояснение и все Maven-примеры обновятся без новой сборки сайта. Открытая страница проверяет конфигурацию раз в минуту; Kubernetes может применить изменение ConfigMap с небольшой задержкой. Образ сайта и его собственная версия в `package.json` обновляются отдельно при изменении кода.

## Сборка и размещение

В `.github/workflows/verify.yml` запускаются TypeScript/Vite-сборка и проверка манифестов. Ручной workflow `build-and-push.yml` публикует образ в тот же Yandex Container Registry, что и React-сервисы `project8617`: `cr.yandex/crplfa8eqvo7nvc0abpg/app/max4j-docs:<tag>`. Для доступа нужен уже используемый в организации секрет `YC_CLI_KEY` (base64 service account JSON) либо `YC_IAM_TOKEN`; убедитесь, что он доступен новому репозиторию.

После публикации образа в кластере с `nginx` ingress class и pull secret `yc-regcred`:

```bash
kubectl apply -k k8s
kubectl rollout status deployment/max4j-docs
```

Ingress принимает Host `docs.max4j.io`. Внешний DNS и nginx-прокси настраиваются отдельно владельцем домена. Health check: `/healthz`.
