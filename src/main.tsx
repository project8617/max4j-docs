import React from 'react';
import { createRoot } from 'react-dom/client';
import packageInfo from '../package.json';
import './style.css';

type SectionId = 'overview' | 'quickstart' | 'core' | 'spring' | 'webhook' | 'reference' | 'operations' | 'help';
type NavItem = { id: SectionId; title: string; group: string; keywords: string };

const navigation: NavItem[] = [
  { id: 'overview', title: 'Обзор', group: 'Начало', keywords: 'max4j java библиотека' },
  { id: 'quickstart', title: 'Быстрый старт', group: 'Начало', keywords: 'maven dependency установка token' },
  { id: 'core', title: 'Клиент Java', group: 'Работа с API', keywords: 'core MaxClient BotsApi client' },
  { id: 'spring', title: 'Spring Boot', group: 'Работа с API', keywords: 'starter boot 3 boot 4 yaml configuration' },
  { id: 'webhook', title: 'Обновления и webhook', group: 'Работа с API', keywords: 'subscription handler polling secret updates' },
  { id: 'reference', title: 'Группы методов', group: 'Справочник', keywords: 'bots chats messages comments subscriptions uploads' },
  { id: 'operations', title: 'Запуск и безопасность', group: 'Справочник', keywords: 'production token timeout tls security' },
  { id: 'help', title: 'Вопросы и ссылки', group: 'Справочник', keywords: 'github issue documentation faq' },
];

const dependency = (artifactId: string, version: string) => `<dependency>\n  <groupId>io.max4j</groupId>\n  <artifactId>${artifactId}</artifactId>\n  <version>${version}</version>\n</dependency>`;
const versionPattern = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const coreCode = `import io.max4j.core.MaxClient;\nimport io.max4j.core.model.BotInfo;\n\nMaxClient max = MaxClient.create(System.getenv("MAX_BOT_TOKEN"));\nBotInfo me = max.bots().getMyInfo();\nSystem.out.println(me.getUsername());`;
const yaml = `max4j:\n  enabled: true\n  token: \${MAX_BOT_TOKEN}\n  connect-timeout: 10s\n  read-timeout: 30s`;
const webhookYaml = `max4j:\n  enabled: true\n  token: \${MAX_BOT_TOKEN}\n  webhook:\n    enabled: true\n    path: /max/webhook\n    secret: \${MAX_WEBHOOK_SECRET}`;
const webhookCode = `@Configuration\nclass MaxBotConfiguration {\n\n  @Bean\n  MaxUpdateHandler maxUpdates() {\n    return update -> System.out.println(update.getUpdateType());\n  }\n}`;
const subscriptionCode = `subscriptionsApi.subscribe(new SubscriptionRequestBody()\n    .url("https://example.org/max/webhook")\n    .secret(System.getenv("MAX_WEBHOOK_SECRET")));`;

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? '↗' : '→'}</span>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <a className="brand" href="#overview" aria-label="max4j — на главную">
    <span className="brand-mark"><span>m</span><i>4</i></span>
    {!compact && <span className="brand-name">max4j<span className="brand-dot">.</span><small>docs</small></span>}
  </a>;
}

function Code({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return <div className="code-card">
    <div className="code-bar"><span className="code-dots"><i /><i /><i /></span><span>{label}</span><button onClick={copy} aria-label={`Скопировать ${label}`}>{copied ? 'Скопировано ✓' : 'Копировать'}</button></div>
    <pre><code>{value}</code></pre>
  </div>;
}

function SectionHead({ eyebrow, title, text, id }: { eyebrow: string; title: string; text: string; id: SectionId }) {
  return <div className="section-head" id={id}><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>;
}

function App() {
  const [version, setVersion] = React.useState(packageInfo.version);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [active, setActive] = React.useState<SectionId>('overview');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let mounted = true;
    const refreshVersion = async () => {
      try {
        const response = await fetch('/config/version.json', { cache: 'no-store' });
        if (!response.ok) return;
        const config: unknown = await response.json();
        if (mounted && typeof config === 'object' && config !== null && 'version' in config
          && typeof config.version === 'string' && versionPattern.test(config.version)) {
          setVersion(config.version);
        }
      } catch {
        // Keep the last known version if the configuration is temporarily unavailable.
      }
    };
    void refreshVersion();
    const timer = window.setInterval(() => { void refreshVersion(); }, 60_000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setSearchOpen(true);
      }
      if (event.key === 'Escape') { setSearchOpen(false); setMenuOpen(false); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  React.useEffect(() => {
    const sections = navigation.map(item => document.getElementById(item.id)).filter((node): node is HTMLElement => !!node);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id as SectionId);
    }, { rootMargin: '-100px 0px -60% 0px' });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const matches = navigation.filter(item => `${item.title} ${item.group} ${item.keywords}`.toLowerCase().includes(query.toLowerCase().trim()));
  const go = (id: SectionId) => { setSearchOpen(false); setMenuOpen(false); setQuery(''); window.location.hash = id; };

  return <>
    <header className="topbar">
      <div className="topbar-inner"><Brand /><span className="top-divider" /><span className="top-label">Документация</span>
        <div className="top-actions"><button className="search-trigger" onClick={() => setSearchOpen(true)}><span className="search-icon">⌕</span><span>Поиск по документации</span><kbd>Ctrl K</kbd></button>
          <a className="github-link" href="https://github.com/max4j/max4j" target="_blank" rel="noreferrer">GitHub <Arrow diagonal /></a>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Открыть навигацию">☰</button>
        </div></div>
    </header>

    <div className="layout">
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Разделы документации"><div className="sidebar-inner">
        <div className="version-picker"><span className="version-light" /> <span>Документация</span><strong>v{version}</strong></div>
        {['Начало', 'Работа с API', 'Справочник'].map(group => <div className="nav-group" key={group}><p>{group}</p>{navigation.filter(item => item.group === group).map(item => <a key={item.id} href={`#${item.id}`} className={active === item.id ? 'active' : ''} onClick={() => setMenuOpen(false)}>{item.title}</a>)}</div>)}
        <div className="sidebar-bottom"><span className="mini-line" />Создано для Java-разработчиков.<br />Независимый open source проект.</div>
      </div></aside>

      <main>
        <section className="hero" id="overview"><div className="hero-glow" /><div className="hero-content"><span className="hero-label"><span className="hero-label-dot" /> JAVA SDK ДЛЯ MAX BOT API</span>
          <h1>Боты MAX.<br /><em>Понятно</em> на Java.</h1>
          <p>Клиент для MAX Bot API и готовый starter для Spring Boot. От первого запроса до webhook — в одном месте.</p>
          <div className="hero-buttons"><a href="#quickstart" className="button-primary">Начать за 5 минут <Arrow /></a><a href="https://github.com/max4j/max4j" target="_blank" rel="noreferrer" className="button-ghost">Исходный код <Arrow diagonal /></a></div>
          <div className="hero-meta"><span>Java 21+</span><span>Spring Boot 3 / 4</span><span>Apache 2.0</span></div>
        </div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-card hero-card-back"><span className="card-line" /><span className="card-line short" /><span className="card-line medium" /></div><div className="hero-card hero-card-front"><div className="hero-card-icon">m<span>4</span></div><div className="hero-card-chat"><span /><span /><span /></div><div className="hero-card-bottom"><span>MAX CONNECTED</span><i /></div></div><div className="spark spark-a">✳</div><div className="spark spark-b">✦</div></div></section>

        <div className="content-wrap">
          <div className="intro-grid"><a href="#quickstart" className="intro-card"><span className="intro-icon">01</span><h3>Быстрый старт</h3><p>Подключите зависимость, передайте токен и проверьте связь с MAX.</p><Arrow /></a><a href="#spring" className="intro-card"><span className="intro-icon">02</span><h3>Spring Boot</h3><p>Автоконфигурация клиента и приём обновлений в вашем приложении.</p><Arrow /></a><a href="#reference" className="intro-card"><span className="intro-icon">03</span><h3>Методы API</h3><p>Сообщения, чаты, подписки и другие группы под рукой.</p><Arrow /></a></div>

          <SectionHead id="quickstart" eyebrow="01 / ПЕРВЫЕ ШАГИ" title="Запустите первого бота" text={`Достаточно токена бота из MAX и одной Maven-зависимости. Примеры относятся к версии ${version}.`} />
          <div className="steps"><div><span>1</span><h3>Добавьте starter</h3><p>Для Spring Boot 3 используйте готовую автоконфигурацию. Для приложения без Spring — модуль core.</p></div><Code label="pom.xml · Spring Boot 3" value={dependency('spring-boot-3-starter', version)} /><div><span>2</span><h3>Укажите токен</h3><p>Храните токен в переменной окружения. Starter создаст <code>MaxClient</code> и API beans.</p></div><Code label="application.yaml" value={yaml} /></div>
          <div className="note"><span className="note-symbol">↗</span><div><strong>Уже есть бот?</strong><p>Создайте токен в MAX для бизнеса и передайте его как <code>MAX_BOT_TOKEN</code>. Не добавляйте токен в Git.</p></div><a href="https://dev.max.ru/docs-api" target="_blank" rel="noreferrer">Документация MAX <Arrow diagonal /></a></div>

          <SectionHead id="core" eyebrow="02 / БЕЗ SPRING" title="Прямой доступ к API" text="Модуль core подходит для обычного Java-приложения, консольного инструмента или вашего собственного фреймворка." />
          <div className="split-block"><div><h3>Один клиент — группы методов</h3><p><code>MaxClient</code> создаёт типизированные API-группы по мере обращения. Базовый URL и таймауты можно настроить через builder.</p><div className="tag-row"><span>bots</span><span>messages</span><span>chats</span><span>subscriptions</span></div></div><div><Code label="pom.xml · Core" value={dependency('core', version)} /><Code label="Java · Проверка связи" value={coreCode} /></div></div>

          <SectionHead id="spring" eyebrow="03 / АВТОКОНФИГУРАЦИЯ" title="Spring Boot без лишней настройки" text="Starter подключает клиент и группы MAX API через обычные Spring beans. Webhook включается отдельно." />
          <div className="feature-grid"><div className="feature"><span>◎</span><h3>Spring Boot 3</h3><p>Starter <code>spring-boot-3-starter</code> подключает клиент и свойства <code>max4j</code>.</p></div><div className="feature"><span>◇</span><h3>Spring Boot 4</h3><p>Отдельный <code>spring-boot-4-starter</code> работает с Java 25.</p></div><div className="feature"><span>⏱</span><h3>Контроль соединения</h3><p>Задайте <code>connect-timeout</code>, <code>read-timeout</code> или свой <code>base-url</code> при необходимости.</p></div></div>
          <div className="boot4-dependency"><Code label="pom.xml · Spring Boot 4 · Java 25" value={dependency('spring-boot-4-starter', version)} /></div>

          <SectionHead id="webhook" eyebrow="04 / СОБЫТИЯ" title="Получайте обновления" text="Для постоянно работающего бота используйте webhook: MAX отправит событие вашему HTTPS-адресу, а starter передаст его обработчику." />
          <div className="webhook-flow"><div><span>01</span>MAX Bot API</div><b>→</b><div><span>02</span>Webhook endpoint</div><b>→</b><div><span>03</span>Ваш обработчик</div></div>
          <div className="two-code"><Code label="application.yaml" value={webhookYaml} /><Code label="Java · обработчик обновлений" value={webhookCode} /></div>
          <p className="body-copy">После публикации HTTPS-адреса зарегистрируйте подписку. Секрет должен совпадать со значением <code>max4j.webhook.secret</code>; входящий заголовок <code>X-Max-Bot-Api-Secret</code> проверяется starter-ом.</p>
          <Code label="Java · регистрация подписки" value={subscriptionCode} />
          <div className="inline-alert">Для локальной разработки доступен long polling через <code>SubscriptionsApi#getUpdates</code>. Одновременно с webhook его не запускают.</div>

          <SectionHead id="reference" eyebrow="05 / ВОЗМОЖНОСТИ" title="Группы методов" text="Типизированные классы API и модели формируются из OpenAPI-схемы MAX. В исходниках зафиксирована схема 0.0.34." />
          <div className="api-grid">{[
            ['Bots', 'Сведения о боте и команды', 'max.bots()'],
            ['Messages', 'Отправка, получение и изменение сообщений', 'max.messages()'],
            ['Chats', 'Чаты, участники и администраторы', 'max.chats()'],
            ['Comments', 'Комментарии к сообщениям', 'max.comments()'],
            ['Subscriptions', 'Webhook-подписки и обновления', 'max.subscriptions()'],
            ['Uploads', 'Загрузка вложений', 'max.uploads()'],
          ].map(([title, description, method]) => <div className="api-item" key={title}><div><strong>{title}</strong><p>{description}</p></div><code>{method}</code></div>)}</div>
          <a href="https://github.com/max4j/max4j/tree/main/core/src/main/openapi" target="_blank" rel="noreferrer" className="text-link">Посмотреть OpenAPI-схему <Arrow diagonal /></a>

          <SectionHead id="operations" eyebrow="06 / В ПРОДАКШЕНЕ" title="Запускайте уверенно" text="Несколько практических правил для долгоживущего бота." />
          <div className="rules"><div><span>01</span><strong>Держите токен в секрете</strong><p>Переменная окружения или secret-хранилище. Не пишите токен в логи и примеры.</p></div><div><span>02</span><strong>Проверяйте webhook</strong><p>Задайте секрет подписки, используйте HTTPS и ограничьте доступ к endpoint.</p></div><div><span>03</span><strong>Настройте таймауты</strong><p>Время подключения и чтения подбирайте под вашу сеть и обработку сообщений.</p></div></div>

          <SectionHead id="help" eyebrow="07 / ДАЛЬШЕ" title="Вопросы и обратная связь" text="Код, релизы и обсуждение библиотеки живут в открытом репозитории max4j." />
          <div className="help-links"><a href="https://github.com/max4j/max4j" target="_blank" rel="noreferrer"><span>Репозиторий и релизы</span><Arrow diagonal /></a><a href="https://github.com/max4j/max4j/issues" target="_blank" rel="noreferrer"><span>Сообщить о проблеме</span><Arrow diagonal /></a><a href="https://dev.max.ru/docs-api" target="_blank" rel="noreferrer"><span>Официальный MAX Bot API</span><Arrow diagonal /></a></div>
        </div>
      </main>
    </div>

    <footer><Brand compact /><span>max4j — независимый open source проект</span><a href="https://github.com/max4j/max4j/blob/main/LICENSE" target="_blank" rel="noreferrer">Apache 2.0 <Arrow diagonal /></a></footer>

    {searchOpen && <div className="search-backdrop" onClick={() => setSearchOpen(false)}><div className="search-modal" role="dialog" aria-modal="true" aria-label="Поиск по документации" onClick={event => event.stopPropagation()}><div className="search-input-wrap"><span>⌕</span><input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="Найти раздел..." /><button onClick={() => setSearchOpen(false)}>ESC</button></div><div className="search-results">{matches.length ? matches.map(item => <button key={item.id} onClick={() => go(item.id)}><span><small>{item.group}</small>{item.title}</span><Arrow /></button>) : <p>Раздел не найден. Попробуйте другой запрос.</p>}</div></div></div>}
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
