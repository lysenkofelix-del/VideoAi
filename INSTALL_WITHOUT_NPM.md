# 📦 Установка без NPM - Готовый .exe файл

Если у вас **нет npm**, вы можете получить готовый .exe файл через GitHub Actions!

---

## 🚀 Способ 1: Автоматическая сборка через GitHub Actions

GitHub Actions автоматически создаст .exe файл при каждом push!

### Шаги:

1. **Push код на GitHub:**
```bash
git push origin claude/refactor-complex-mkm3w4f6gnarpw6h-OkYBc
```

2. **Открыть GitHub Actions:**
   - Перейти на https://github.com/lysenkofelix-del/VideoAi/actions
   - Найти workflow "Build and Release"
   - Дождаться завершения (обычно 5-10 минут)

3. **Скачать .exe:**
   - Открыть завершенный workflow
   - Раздел "Artifacts"
   - Скачать `windows-installer.zip`
   - Распаковать и запустить!

### Артефакты включают:

- `AI-Video-Editor-PRO-Setup.exe` - **Installer** (рекомендуется)
- `AI-Video-Editor-PRO-Portable.exe` - **Portable** версия

---

## 🎯 Способ 2: GitHub Release

Для создания официального релиза:

1. **Создать тег:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. **GitHub Actions автоматически:**
   - Соберет .exe файлы
   - Создаст GitHub Release
   - Прикрепит .exe к релизу

3. **Скачать:**
   - Перейти на https://github.com/lysenkofelix-del/VideoAi/releases
   - Скачать .exe из последнего релиза

---

## 💻 Способ 3: Использовать компьютер с npm

Если у вас есть другой компьютер с npm:

```bash
# 1. Clone repository
git clone https://github.com/lysenkofelix-del/VideoAi.git
cd VideoAi

# 2. Install dependencies
npm install

# 3. Build .exe
npm run dist:win

# 4. Find .exe in dist/ folder
# - AI-Video-Editor-PRO-Setup.exe (installer)
# - AI-Video-Editor-PRO-Portable.exe (portable)
```

Затем скопировать .exe файлы на свой компьютер.

---

## 📋 Что будет в .exe:

### Installer (Setup.exe)
- Полная установка с shortcuts
- Desktop shortcut
- Start Menu entry
- Auto-updater
- Uninstaller

### Portable (Portable.exe)
- Запуск без установки
- Можно запустить с USB
- Не требует прав администратора
- Настройки в папке приложения

---

## ⚙️ Требования для запуска .exe:

**Минимальные:**
- Windows 10/11
- 4 GB RAM
- 500 MB свободного места

**Рекомендуемые:**
- Windows 11
- 8 GB+ RAM
- SSD
- Dedicated GPU (для 4K)

---

## 🔧 Первый запуск:

1. **Запустить .exe файл**
2. **Приветственное окно:**
   - Опционально: Ввести Claude/OpenAI API ключи
   - Или пропустить (работает без AI)
3. **Начать редактирование!**

---

## 🆘 Troubleshooting

### "Windows protected your PC"
1. Кликнуть "More info"
2. Кликнуть "Run anyway"
3. Это нормально для неподписанных .exe

### Антивирус блокирует
1. Добавить в исключения
2. Или использовать Portable версию

### .exe не запускается
1. Установить Visual C++ Redistributable:
   https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Перезагрузить компьютер

---

## 📝 Проверка сборки

GitHub Actions workflow создаст:
```
dist/
├── AI-Video-Editor-PRO-Setup.exe      (Installer ~150MB)
├── AI-Video-Editor-PRO-Portable.exe   (Portable ~150MB)
└── latest.yml                          (Auto-update info)
```

---

## 🎉 Готово!

Теперь у вас есть 3 способа получить .exe без npm:
1. ✅ **GitHub Actions** - Автоматически при push
2. ✅ **GitHub Release** - Официальные релизы
3. ✅ **Другой компьютер** - Собрать и скопировать

**Рекомендуется:** Использовать GitHub Actions для автоматической сборки!

---

## 🔗 Полезные ссылки:

- GitHub Repository: https://github.com/lysenkofelix-del/VideoAi
- GitHub Actions: https://github.com/lysenkofelix-del/VideoAi/actions
- Releases: https://github.com/lysenkofelix-del/VideoAi/releases

---

**Создано для VideoAI PRO** 🎬
