# Voxly — сайт студии

Статический лендинг Voxly для GitHub Pages. Без сборки и зависимостей: чистый HTML, CSS и JS.

## Структура

```
Voxly-site/
├─ index.html          # разметка лендинга
├─ styles/main.css     # дизайн-система: токены, стекло, свечения, адаптив
├─ scripts/main.js     # меню, sticky-header, reveal, активная навигация, релизы
├─ releases.json       # ссылки на сборки (необязательно)
├─ .nojekyll           # отключает Jekyll на GitHub Pages
└─ README.md
```

## Локальный запуск

Из папки `Voxly-site`:

```bash
python -m http.server 8080
```

Открыть `http://localhost:8080`. Можно и просто двойным щелчком по `index.html`, но тогда `releases.json` не подхватится (ограничение `file://`).

## Ссылки на сборки

Репозиторий: <https://github.com/xmessengers-arch/voxly-site>
Сайт: <https://xmessengers-arch.github.io/voxly-site/>

Тяжёлые файлы (установщик, portable, APK) лежат не в репозитории, а в GitHub Releases —
у GitHub лимит 100 МБ на файл в репозитории и 2 ГБ на файл релиза.

Текущие ссылки (`releases.json`):

```json
{
  "setup": "https://github.com/xmessengers-arch/voxly-site/releases/download/v0.1.0/VoxlyCode-Setup-0.1.0.exe",
  "portable": "https://github.com/xmessengers-arch/voxly-site/releases/download/v0.1.0/VoxlyCode-Portable-0.1.0.exe",
  "apk": "https://github.com/xmessengers-arch/voxly-site/releases/download/v0.1.0/Voxly-Android.apk"
}
```

Правки ссылок — в `releases.json` (без правок кода) или в объекте `RELEASES` в `scripts/main.js`.
Поддерживаются и абсолютные `https://`, и относительные пути к файлам рядом с сайтом.

Если ссылки не заданы, кнопки ведут на `#`, а под ними остаётся подсказка по умолчанию.

## Публикация на GitHub Pages

Сайт уже опубликован из ветки `main`, папка `/ (root)`:

```bash
cd Voxly-site
git add .
git commit -m "Обновление сайта"
git push origin main
```

Обновить релиз со сборками:

```bash
gh release upload v0.1.0 "путь/к/VoxlyCode-Setup-0.1.0.exe" --clobber
gh release upload v0.1.0 "путь/к/Voxly-Android.apk" --clobber
```

## Что внутри дизайна

- Тёмная монохромная палитра с холодным акцентом (`--accent`, `--accent-2`).
- Стеклянные карточки с градиентной обводкой на hover и мягким свечением.
- Градиентный заголовок (`.grad`), пульсирующий бейдж, дрейфующее свечение hero.
- Reveal-анимации через `IntersectionObserver` с каскадной задержкой.
- Sticky-header: прозрачный сверху, размытый при скролле.
- Мобильное меню-панель с бургером, закрытие по `Esc`, клику и ресайзу.
- Активный пункт навигации по видимой секции.
- Поддержка `prefers-reduced-motion`, видимый `:focus-visible`, skip-link, стили печати.

## Правки

- Цвета и радиусы — в `:root` в начале `styles/main.css`.
- Контент — прямо в `index.html` (секции `#features`, `#projects`, `#download`, `#faq`).
- Отступы секций: `--wrap` (ширина) и `clamp()` в `.section`.
