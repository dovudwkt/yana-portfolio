# YANA CH. — Private Interior Architect

Сайт-портфолио (RU / EN), концепция «Анфилада»: при прокрутке камера проходит сквозь арки, сцены собраны в 3D. Статический сайт без сборки: HTML + CSS + JS, библиотеки и шрифты лежат локально.

Адрес: https://dovudwkt.github.io/yana-portfolio/

## Структура

```
portfolio/
├── site/                  ← ЭТУ папку деплоим (корень сайта)
│   ├── index.html         весь текст сайта, RU и EN рядом
│   ├── favicon.svg
│   └── assets/
│       ├── css/style.css  стили (цвета и шрифты — переменные в начале файла)
│       ├── css/fonts.css  подключение шрифтов (лежат локально, без Google)
│       ├── js/main.js     сцены прокрутки, меню, язык, галерея, кнопка «Написать»
│       ├── js/projects.js список рендеров для галерей проектов
│       ├── js/vendor/     GSAP, ScrollTrigger, Lenis
│       ├── img/           рендеры: name.webp (до 1920px) + name-s.webp (до 760px)
│       ├── dwg/           чертежи в едином стиле: прозрачный лист, графитовая линия
│       ├── prod/          фото товаров из ведомости комплектации
│       └── fonts/         Forum, Jost, IBM Plex Mono (woff2)
├── tools/                 скрипты подготовки картинок (Python)
├── _src/                  исходники с Google Drive (в git и на хостинг не попадают)
├── netlify.toml           настройки для Netlify
└── .github/workflows/     автодеплой на GitHub Pages
```

## Посмотреть локально

```bash
python3 -m http.server 8800 --directory site
```

Затем открыть http://localhost:8800 (язык: `?lang=ru` или `?lang=en`).

## Деплой

Публикуется только папка `site/`. Workflow `.github/workflows/pages.yml` выкладывает её на GitHub Pages при каждом пуше в `main`. Для Netlify в корне лежит `netlify.toml` (`publish = "site"`).

Картинка превью ссылки (`og:image` в `site/index.html`) задана полным адресом. При смене домена поменяйте его там же.

## Как редактировать

- **Текст.** В `index.html` у каждой фразы две версии: `<span lang="ru">…</span><span lang="en">…</span>`. Правьте обе.
- **Язык по умолчанию.** Берётся из браузера посетителя. Выбор посетителя запоминается.
- **Контакты.** Ссылки `wa.me/79112136655` и `instagram.com/yana.ch_` в `index.html`. Текст, который подставляется в WhatsApp, задаётся в `main.js` (`waText`).
- **Добавить рендер в галерею проекта.** Положите `key.webp` и `key-s.webp` в `assets/img/`, затем добавьте строку в `assets/js/projects.js`.
- **Сцены.** Высокая секция (`.tall`) содержит закреплённый блок `.pin`; анимация привязана к прокрутке секции в `main.js`.

## Подготовка картинок (если нужно пересобрать)

Нужен Python 3 с Pillow и numpy, а также `pdftoppm` (poppler).

```bash
python3 tools/fetch_renders.py     # скачать выбранные рендеры с Drive в _src/renders
python3 tools/build_assets.py      # webp-версии рендеров и фото товаров → site/assets
python3 tools/reink.py             # перерисовать PDF-чертежи в единый стиль → _src/dwg_paper
python3 tools/restyle_drawings.py  # прозрачные листы для сайта → site/assets/dwg
python3 tools/fetch_fonts.py       # скачать шрифты в site/assets/fonts
```

Первая версия сайта осталась в истории git (коммит `2527c60`).
