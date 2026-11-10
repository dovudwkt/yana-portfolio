# YANA CH. — Private Interior Architect

Сайт-портфолио (RU / EN). Статический сайт без сборки и зависимостей: HTML + CSS + JS + картинки.

## Структура

```
portfolio/
├── site/                  ← ЭТУ папку деплоим (корень сайта)
│   ├── index.html         весь текст сайта, RU и EN рядом
│   ├── favicon.svg
│   └── assets/
│       ├── css/style.css  стили (цвета и шрифты — переменные в начале файла)
│       ├── css/fonts.css  подключение шрифтов (лежат локально, без Google)
│       ├── js/main.js     анимации, переключатель языка, галерея
│       ├── js/projects.js список рендеров для галерей проектов (секция 09)
│       ├── img/           рендеры: name.webp (до 1920px) + name-s.webp (до 760px)
│       ├── dwg/           чертежи, перерисованные в едином стиле
│       ├── prod/          фото товаров из ведомости комплектации
│       └── fonts/         Cormorant Garamond, Oswald, Manrope (woff2)
├── tools/                 скрипты подготовки картинок (Python)
├── _src/                  исходники с Google Drive (в git и на хостинг не попадают)
├── netlify.toml           настройки для Netlify
└── .github/workflows/     автодеплой на GitHub Pages
```

## Посмотреть локально

```bash
python3 -m http.server 8800 --directory site
```

Затем открыть http://localhost:8800

## Деплой

Публикуется только папка `site/`. Подойдёт любой из вариантов:

- **Netlify, без git.** Зайти на app.netlify.com → Add new site → Deploy manually и перетащить папку `site`.
- **Netlify из git.** В корне лежит `netlify.toml` (`publish = "site"`), достаточно подключить репозиторий.
- **Vercel.** New Project → Root Directory: `site`, Framework: Other, без команды сборки.
- **GitHub Pages.** Запушить репозиторий, затем Settings → Pages → Source: GitHub Actions. Workflow `.github/workflows/pages.yml` публикует `site/` при каждом пуше в `main`.

После деплоя замените в `site/index.html` относительный путь в `og:image` на полный адрес вида `https://ваш-домен/assets/img/og.jpg`. Тогда в WhatsApp, Telegram и Instagram у ссылки появится превью с картинкой.

## Как редактировать

- **Текст.** В `index.html` у каждой фразы две версии: `<span lang="ru">…</span><span lang="en">…</span>`. Правьте обе.
- **Язык по умолчанию.** Берётся из браузера посетителя. Можно задать явно ссылкой: `…/?lang=en` или `…/?lang=ru`. Выбор посетителя запоминается.
- **Контакты.** Секция `12 CONTACTS` в `index.html`: ссылки `wa.me/79112136655` и `instagram.com/yana.ch_`.
- **Добавить рендер в галерею проекта.** Положите `key.webp` и `key-s.webp` в `assets/img/`, затем добавьте строку в `assets/js/projects.js`.
- **Добавить чертёж.** Скопируйте любой блок `<figure class="sht">` в секции `05` и поменяйте файл, подписи и `data-cat` (`plan`, `eng` или `elev`).

## Подготовка картинок (если нужно пересобрать)

Нужен Python 3 с Pillow и numpy, а также `pdftoppm` (poppler).

```bash
python3 tools/fetch_renders.py   # скачать выбранные рендеры с Drive в _src/renders
python3 tools/build_assets.py    # webp-версии, «линейные» версии рендеров, фото товаров
python3 tools/reink.py           # перерисовать PDF-чертежи в единый стиль → site/assets/dwg
python3 tools/fetch_fonts.py     # скачать шрифты в site/assets/fonts
```

«Линейные» картинки (обложка и слайдер «Линия ⇄ 3D») получены из рендеров обработкой контуров, это стилизация, а не исходные эскизы.
