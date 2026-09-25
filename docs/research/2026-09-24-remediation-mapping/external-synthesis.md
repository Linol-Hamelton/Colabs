> Transcribed from chat by claude-eb97ac9d13050014 on the owner's instruction (PROTO-DEC-0060 item 4), model: not named by the owner (external synthesis), date: 2026-09-24

# External synthesis (persisted from the owner's message of 2026-09-24)

- Status: advisory input, `[MODE: READ-ONLY ADVISORY]` by origin. Not a decision; not certifying.
- Source: the owner's message in the conversation with `claude-eb97ac9d13050014`, sections headed
  "Внешний синтез:" and "Попытка сводного синтеза:". Copied verbatim below; nothing was edited.
- Where it is used: `docs/core-arch/CORE-ARCH-1.md` (source E), `docs/core-arch/stage-1/P-L0-002-stop-and-ask.md`.
- Known issues recorded in CORE-ARCH-1 §5: the Python rewrite and the Graph Memory runtime conflict
  with PROTO-DEC-0034, 0036, 0039 item 3 and 0045; the HTTP endpoints and the "90 %" figure are
  unverified.

---

## Part 1 — «Внешний синтез»

## 🎯 Стратегический выбор: три варианта

Вы задаёте правильный вопрос. Ответ — **не форкать, не переписывать, а использовать как референс и заимствовать лучшие практики через MCP-интерфейс**. Вот почему:

### Что Graph Memory уже умеет (и это совпадает с Colabs на 90%):

| Компонент Graph Memory | Соответствие в Colabs | Статус |
|---|---|---|
| **TaskGraph** + `task-types.ts` | Слой 5: Состояние и артефакты (рамка задачи, SHA, ledger) | ✅ **Идеальное попадание** |
| **KnowledgeGraph** + `knowledge-types.ts` | Слой 2-3: Процедуры и инструменты | ✅ **Прямое соответствие** |
| **Access resolution** (`access.ts`) с 5-уровневой цепочкой | Ваши 3 уровня доступа (exists/summary/full) | ✅ **Уже реализовано лучше** |
| **Frontmatter parsing** (`frontmatter.ts`) | Схема `front-matter` из Спринта 1 | ✅ **Готовый парсер YAML** |
| **SkillGraph** | Слой 3: Инструменты (skills = tools) | ✅ **Совпадает** |
| **DocGraph** | Слой 6: Проза (исследования, споры, отчёты) | ✅ **MD first-class** |
| **BM25 + Hybrid search** | FTS5 + детерминированный поиск | ✅ **Аналог без ML-зависимостей** |
| **MCP-сервер** (70 инструментов) | Интерфейс для агентов | ✅ **Готовый протокол** |

### Что не нужно из Graph Memory:

- **Embeddings** (`@huggingface/transformers`) — вы сознательно отказались от ML для детерминированности. Но BM25 в Graph Memory работает и без них.
- **UI (React)** — у вас будет свой интерфейс или вообще CLI-ориентированный протокол.
- **File mirror watchers** — избыточно, если вы работаете только с ядром.

---

## 💡 Три варианта стратегии

### Вариант А: Подстраивать Colabs под Graph Memory
**Что делать:** Взять Graph Memory как есть, адаптировать вашу иерархию под его типы графов.
- Ваши "Роли" → хранить в `KnowledgeGraph` как тип `role`
- Ваши "Процедуры" → хранить в `KnowledgeGraph` как тип `procedure`
- Ваши "Артефакты" → использовать `TaskGraph`

**Плюсы:**
- Минимум кода. Вы используете готовое решение с 1809 тестами.
- MCP-интерфейс сразу работает со всеми агентами (Claude, Codex, Gemini).
- Access resolution уже реализован (5 уровней вместо ваших 3 — это даже лучше).

**Минусы:**
- Вы зависите от roadmap чужого проекта.
- Embeddings могут конфликтовать с вашей философией детерминированности (хотя их можно отключить).
- Вы не контролируете, какие фичи появятся в будущем.

**Вердикт:** **Слишком жёсткая привязка.** Вы теряете контроль над протоколом.

---

### Вариант Б: Подстраивать Graph Memory под Colabs
**Что делать:** Форкнуть Graph Memory, переписать его под вашу архитектуру.
- Переименовать `SkillGraph` → `ToolGraph`
- Добавить `RoleGraph` как отдельный тип
- Переписать access resolution под 3 уровня вместо 5
- Убрать embeddings

**Плюсы:**
- Полный контроль над кодом.
- Идеальное соответствие архитектуре Colabs.

**Минусы:**
- **Огромный объём работы.** 1809 тестов, сложная TypeScript-кодовая база.
- Вы берёте на себя поддержку чужого кода.
- Потеряете обновления от upstream (новые фичи, багфиксы).
- Это противоречит философии "лёгких слоёв" — вы получаете монолит на 50k+ строк.

**Вердикт:** **Категорически не рекомендую.** Это антипаттерн "Not Invented Here" + неподъёмная техническая задолженность.

---

### Вариант В: Использовать Graph Memory как референс (РЕКОМЕНДУЮ) ⭐
**Что делать:** Взять Graph Memory как **эталонную реализацию**, но реализовать свой **тонкий слой-адаптер** поверх него или параллельно с ним.

#### Подход 1: Graph Memory как внешний сервис (MCP)
```
[Ваш Colabs Core Protocol] 
        ↓
[Тонкий адаптер на Python/Node] 
        ↓ (MCP API calls)
[Graph Memory Server] (запущен как отдельный процесс)
```

**Как это работает:**
1. Вы запускаете Graph Memory как MCP-сервер (он уже это умеет).
2. Ваш Colabs Core (реализация каскада из Спринтов 1-4) обращается к нему через MCP-инструменты.
3. Для каждой роли/задачи вы вызываете готовые инструменты:
   - `knowledge_search` → найти процедуры по роли
   - `task_create` → создать артефакт задачи
   - `skill_list` → получить доступные инструменты
4. Ваша логика каскада (загрузчик, фильтры, валидатор) живёт в Colabs Core, а хранение — в Graph Memory.

**Плюсы:**
- **Ноль дублирования кода.** Вы используете 1809 протестированных функций.
- **Контроль над протоколом.** Colabs Core — ваш код, ваши правила.
- **Изоляция.** Если Graph Memory сломается, вы можете заменить его на свой SQLite-прототип (из Спринта 1) без переписывания логики.
- **Масштабируемость.** Graph Memory работает как сервис, Colabs Core — как клиент.

**Минусы:**
- Два процесса вместо одного (но это несущественно).
- Зависимость от MCP-протокола (но он стандартный).

---

#### Подход 2: Заимствование лучших практик (Reference Architecture)
**Что делать:** Изучить код Graph Memory и **переписать ключевые компоненты на Python** (ваш основной стек), используя те же паттерны.

**Что заимствовать:**

1. **Схема типов (TypeScript → Python dataclasses)**
   ```python
   # Из code-types.ts → Python
   @dataclass
   class SymbolNode:
       id: str
       name: str
       kind: str  # 'function', 'class', 'method'
       file_path: str
       start_line: int
       end_line: int
       children: List[str]
   ```

2. **Access Resolution Chain** (`access.ts` → Python)
   ```python
   # Из access.ts: 5-level chain
   class AccessResolver:
       LEVELS = ['public', 'team', 'project', 'role', 'private']
       
       def resolve(self, user_role: str, node: Node) -> AccessLevel:
           # Реализация цепочки проверок
           if node.access == 'public':
               return AccessLevel.FULL
           # ... остальные проверки
   ```

3. **BM25 Index** (`bm25.ts` → `rank_bm25` Python библиотека)
   ```python
   from rank_bm25 import BM25Okapi
   
   # Вместо FTS5 использовать BM25 для гибридного поиска
   bm25 = BM25Okapi(corpus)
   scores = bm25.get_scores(query)
   ```

4. **Frontmatter Parser** (`frontmatter.ts` → `python-frontmatter`)
   ```python
   import frontmatter
   
   post = frontmatter.load('procedure.md')
   roles = post.get('roles', [])
   stages = post.get('stages', [])
   ```

**Плюсы:**
- Полный контроль, свой стек (Python).
- Лёгкий код (только нужные компоненты).
- Нет зависимостей от TypeScript/Node.js.

**Минусы:**
- Больше работы, чем Вариант А.
- Нужно писать тесты.

---

## 🚀 Финальная рекомендация: Гибридный подход (Вариант В + Подход 2)

### Этап 1: Быстрый старт (1-2 дня)
**Запустите Graph Memory как MCP-сервер и используйте его через готовый API.**

```bash
# Установка Graph Memory
git clone https://github.com/graph-memory/graphmemory.git
cd graphmemory
npm install
npm run build

# Запуск MCP-сервера
npm start

# Теперь он слушает на localhost:3000 с 70 инструментами
```

**Ваш Colabs Core (Python) обращается к нему:**
```python
import httpx

# Поиск процедур для роли 'researcher'
response = httpx.post('http://localhost:3000/api/knowledge/search', json={
    'query': 'procedure',
    'filters': {'roles': ['researcher'], 'type': 'procedure'}
})
procedures = response.json()

# Создание артефакта задачи
task = httpx.post('http://localhost:3000/api/tasks/create', json={
    'title': 'Исследование кодовой базы',
    'environment_manifest': {'tools': ['git_read', 'grep']}
}).json()
```

**Результат:** У вас работающий прототип за 1 день. Вы можете тестировать каскадную логику на реальном хранилище.

---

### Этап 2: Постепенная миграция (2-4 недели)
**Переписывайте критичные компоненты на Python, используя Graph Memory как референс.**

**Приоритеты:**

1. **Access Resolution** (критично для безопасности)
   - Изучите `access.ts` (5-уровневая цепочка).
   - Реализуйте свою версию на Python с 3 уровнями (exists/summary/full).
   - Покрытие тестами (как в Graph Memory).

2. **Frontmatter Validator** (критично для Спринта 1)
   - Изучите `frontmatter.ts`.
   - Напишите валидатор схемы на Python (используйте `pydantic` или `cerberus`).

3. **BM25 Search** (для детерминированности)
   - Изучите `bm25.ts`.
   - Используйте `rank_bm25` библиотеку в Python.
   - Это даст вам гибридный поиск без ML.

4. **TaskGraph Manager** (для артефактов)
   - Изучите `task.ts` и `task-types.ts`.
   - Реализуйте свою версию на SQLite + Python.

**Параллельно:** Продолжайте использовать Graph Memory для некритичных компонентов (DocGraph для прозы, CodeGraph для кода).

---

### Этап 3: Полная автономность (опционально)
**Если Graph Memory начнёт конфликтовать с вашей roadmap, замените его полностью.**

К этому моменту у вас уже будет:
- Своя реализация Access Resolution.
- Свой валидатор frontmatter.
- Свой TaskGraph.
- Свой BM25-поиск.

Останется только заменить Graph Memory на ваш Python-код, и вы получите **полностью автономный Colabs Core** без внешних зависимостей.

---

## 📊 Сравнительная таблица подходов

| Критерий | Вариант А (Под Graph Memory) | Вариант Б (Форк) | **Вариант В (Референс)** ⭐ |
|---|---|---|---|
| **Время до первого прототипа** | 1 день | 2-3 недели | 1 день (MCP) → 2-4 недели (миграция) |
| **Контроль над протоколом** | Низкий | Высокий | **Высокий** |
| **Технический долг** | Зависимость от upstream | Огромный (поддержка форка) | **Минимальный** |
| **Совместимость с агентами** | Отличная (MCP) | Отличная | **Отличная (MCP)** |
| **Масштабируемость** | Ограничена Graph Memory | Ограничена вашим ресурсом | **Неограниченная** |
| **Сложность поддержки** | Низкая | Очень высокая | **Средняя** |

---

## 💎 Итоговая рекомендация

**Не подстраивайтесь. Заимствуйте.**

1. **Сегодня:** Запустите Graph Memory как MCP-сервер. Используйте его готовые 70 инструментов для тестирования каскадной логики Colabs.
2. **На этой неделе:** Изучите ключевые файлы (`access.ts`, `frontmatter.ts`, `task.ts`) и начните переписывать их на Python для Спринта 1.
3. **В течение месяца:** Постепенно заменяйте компоненты Graph Memory на свои Python-реализации, сохраняя MCP-интерфейс для совместимости с агентами.
4. **Через 2-3 месяца:** У вас будет полностью автономный Colabs Core, вдохновлённый лучшими практиками Graph Memory, но полностью под вашим контролем.

**Graph Memory — это не конкурент и не платформа. Это эталонная реализация тех же идей, которые вы хотите воплотить.** Используйте его как учебник, а не как фундамент.

---

## 🛠️ Практический первый шаг

Хотите, я помогу вам:

1. **Настроить Graph Memory** как MCP-сервер и написать первый Python-клиент для него?
2. **Изучить `access.ts`** и написать Python-версию Access Resolution с 3 уровнями?
3. **Написать валидатор frontmatter** на Python, используя `python-frontmatter` и `pydantic`?

Отличный шаг. Чтобы Спринт 1 не был абстрактным, нам нужны **эталонные шаблоны**, которые закроют те самые дыры, которые вы выявили: инцидент с `agy` (отсутствие манифеста окружения), парадокс ревьюера (доступ к инструментам) и правило «не найдено — спроси».

Ниже представлены **три готовых шаблона процедур** (Уровень 2), написанных в строгом соответствии с утвержденной архитектурой и схемой `front-matter`. Вы можете сразу копировать их в папку `colabs-core/procedures/`.

---

### Шаблон 1: Рамка задачи и Манифест окружения
**Зачем:** Закрывает системный вывод из инцидента `agy`. Запрещает начинать работу, пока не задекларированы требуемые права и инструменты.

```markdown
---
id: "proc-lifecycle-task-frame-01"
title: "Инициация задачи: Рамка и Манифест окружения"
type: "procedure"
category: "lifecycle"
roles: ["coordinator", "implementer", "researcher"]
stages: ["initiation", "framing"]
access_level: "full"
permissions_required: ["read_core", "write_artifacts", "escalation"]
supersedes: []
deprecated: false
---

# Процедура: Инициация задачи и Манифест окружения

## 1. Цель и Триггер
**Цель:** Зафиксировать границы задачи, требуемые артефакты и права доступа до начала любых действий.
**Триггер:** Получение новой задачи от Владельца или Координатора.

## 2. Правила чтения
Данная процедура обязательна для прочтения любой ролью, которая получает новую задачу. Игнорирование процедуры ведет к отклонению результатов на этапе приёмки.

## 3. Шаги исполнения
1. **Анализ контракта:** Прочитать постановку задачи. Определить ожидаемый результат (артефакт).
2. **Поиск прецедентов:** Использовать полнотекстовый поиск (FTS) по слою Прозы (Уровень 6), чтобы найти похожие задачи или ограничения.
3. **Формирование Рамки задачи (Task Frame):** Создать черновик артефакта `task-frame`. Зафиксировать:
   - Цель (что считается успешным завершением).
   - Границы (что явно НЕ входит в задачу).
   - Замороженный SHA кодовой базы (если применимо).
4. **Декларация Окружения (Environment Manifest):**
   - Определить список инструментов, необходимых для выполнения задачи (например, `git_read`, `shell_exec`, `grep`).
   - Зафиксировать их в артефакте `environment-manifest`.
   - **КРИТИЧЕСКОЕ ПРАВИЛО:** Если инструмент не заявлен в манифесте, его использование запрещено. Если инструмент заблокирован системой (например, `soft-denying`), агент обязан перейти к процедуре эскалации.

## 4. Артефакты (Выход)
- `task-frame.md` (сохраняется в слой Состояния).
- `environment-manifest.json` (передается диспетчеру для выдачи грантов).

## 5. Стоп-условия (Эскалация)
- Цель задачи размыта или допускает двоякое толкование.
- Требуемые инструменты выходят за рамки прав роли.
- **Действие:** Остановить работу, перейти к `proc-lifecycle-escalation-01`.
```

---

### Шаблон 2: Кросс-агентная сертификация (Ревью)
**Зачем:** Реализует ваше правило «Ревьюер обязан читать то, что проверяет» и решает парадокс доступа к чужим инструментам.

```markdown
---
id: "proc-lifecycle-certification-01"
title: "Сертификация и приёмка работы исполнителя"
type: "procedure"
category: "lifecycle"
roles: ["certifier", "reviewer"]
stages: ["acceptance", "review"]
access_level: "full"
permissions_required: ["read_artifacts", "read_tools", "write_ledger"]
supersedes: []
deprecated: false
---

# Процедура: Кросс-агентная сертификация

## 1. Цель и Триггер
**Цель:** Независимая проверка результатов работы исполнителя на соответствие Рамке задачи и правилам Ядра.
**Триггер:** Исполнитель завершил этап и создал `receipt` (квитанцию о выполнении).

## 2. Права доступа (Асимметрия ревью)
Для выполнения данной процедуры роль `certifier` получает **сквозной доступ (read-through)**:
- Разрешено читать полный текст всех Инструментов (Уровень 3), которые заявлены в `environment-manifest` исполнителя.
- Разрешено читать Процедуры (Уровень 2), которые использовал исполнитель.
- **Запрещено:** Читать процедуры и инструменты других ролей, если они не были использованы в проверяемой задаче.

## 3. Шаги исполнения
1. **Чтение контракта:** Открыть `task-frame` и `environment-manifest` исполнителя.
2. **Аудит инструментов:** Проверить, что исполнитель использовал ТОЛЬКО заявленные инструменты. Если найдены следы использования незаявленных инструментов (попытки обхода `soft-denying`, использование хаков) — **НЕМЕДЛЕННОЕ ОТКЛОНЕНИЕ**.
3. **Верификация артефактов:** Проверить, что выходные артефакты соответствуют цели из `task-frame`.
4. **Оценка оптимальности:** Имея доступ к описанию инструментов, оценить: не было ли более эффективного способа решения задачи? (Фиксируется в метриках).
5. **Выдача вердикта:** Создать `certification-report` с резолюцией: `APPROVED`, `REJECTED` (с указанием причин) или `ESCALATED` (если найдена ошибка в самом Ядре).

## 4. Артефакты (Выход)
- `certification-report.md` (запись в Ledger задачи).

## 5. Стоп-условия
- Исполнитель не предоставил `receipt` или `environment-manifest`.
- Обнаружено, что исполнитель изменил файлы Ядра без резолюции Владельца.
```

---

### Шаблон 3: Протокол эскалации и Стоп-вопроса
**Зачем:** Формализует правило «не найдено — спроси» и закрепляет формат отчета, который вы назвали эталонным (как в отчете `agy`).

```markdown
---
id: "proc-lifecycle-escalation-01"
title: "Эскалация и Стоп-вопрос владельцу"
type: "procedure"
category: "lifecycle"
roles: ["all"]
stages: ["any"]
access_level: "full"
permissions_required: ["write_worklog", "notify_owner"]
supersedes: []
deprecated: false
---

# Процедура: Эскалация и Стоп-вопрос

## 1. Аксиома
Если правило не найдено, инструмент заблокирован, или полномочия недостаточны — **агент обязан остановиться и спросить Владельца**. Запрещается изобретать правила, использовать `--dangerously-skip-permissions` без прямой резолюции или обходить ограничения.

## 2. Триггеры для эскалации
- Полнотекстовый поиск (FTS) по Ядру дал 0 результатов по спорному вопросу.
- Инструмент вернул ошибку прав доступа (например, `soft-denying`).
- Возник конфликт между Уровнем 0 (Мета-корень) и инструкциями задачи.

## 3. Шаги исполнения
1. **Фиксация состояния:** Записать в `worklog` статус `BLOCKED`. Сохранить текущий контекст в артефакты, чтобы не потерять прогресс.
2. **Формирование Стоп-вопроса:** Составить запрос к Владельцу строго по шаблону ниже.
3. **Ожидание:** Приостановить выполнение задачи. Не предпринимать попыток обхода.

## 4. Шаблон Стоп-вопроса (Эталонный формат)
Каждый стоп-вопрос должен содержать 5 блоков:
1. **Контекст:** Какую задачу выполнял и на каком шаге застрял.
2. **Проблема:** Что именно пошло не так (ошибка системы, отсутствие правила, конфликт).
3. **Варианты:** 2-4 варианта решения с их плюсами и минусами.
4. **Рекомендация:** Какой вариант агент считает лучшим (но не решает сам!).
5. **Ожидание:** Явная фраза: «Жду вашего выбора/резолюции».

## 5. Стоп-условия
- Владелец ответил «Действуй по обстановке» (это нарушение протокола со стороны Владельца, требует повторного запроса конкретных полномочий).
```

---

### 🛠️ Как это будет проверять Валидатор (из Спринта 1)

Когда вы напишете скрипт-валидатор для этих файлов, он должен будет проверить:
1. **Синтаксис:** Все поля в `front-matter` присутствуют и имеют корректный тип.
2. **Связи:** Поле `roles: ["certifier"]` ссылается на файл `colabs-core/roles/certifier.md`, который существует.
3. **Логика:** В шаблоне сертификации (`proc-lifecycle-certification-01`) есть поле `permissions_required: ["read_tools"]`, что легитимизирует «сквозной доступ» для графа `Graph Memory`.

---

## Part 2 — «Попытка сводного синтеза»

Да, можно рационально свести все три синтеза в единый документ. Ключ — разделить их на два уровня: **стратегический** (архитектура и выбор инструментов) и **технический** (детали реализации протокола). Отчеты Claude и Codex дают вам техническую спецификацию протокола, а мой синтез по Graph Memory — инструментальную базу для её реализации.

## 🎯 Единый синтез: Colabs Protocol + Graph Memory Integration

### Уровень 1: Стратегическая архитектура (ваш выбор)

**Graph Memory как эталонная реализация** (Вариант В из моего предыдущего синтеза):
- Не форкать, не подстраиваться, а заимствовать лучшие практики
- Использовать как MCP-сервер на этапе прототипирования
- Постепенно мигрировать критичные компоненты на Python/SQLite

**Почему это работает с вашим протоколом:**
- Graph Memory уже имеет TaskGraph (→ ваши артефакты и ledger)
- KnowledgeGraph (→ ваши процедуры и роли)
- Access Resolution (→ ваши 3 уровня доступа: exists/summary/full)
- BM25 search (→ детерминированный поиск без ML)

---

### Уровень 2: Техническая реализация (интеграция отчетов Claude/Codex)

Вот как конкретные элементы протокола из синтезов маппятся на компоненты Graph Memory:

#### 2.1. Роли и Grammar (S-claude-01, S-codex-02)

**Протокол требует:**
- Фиксированная грамматика: `- <agent> [<scope>]: <role>{, <role>}`
- Merge rule: union of matching scope lines
- Закрытый набор ролей (certifier, reviewer, researcher и т.д.)

**Реализация через Graph Memory:**
```
KnowledgeGraph узлы типа "role":
- id: "role-certifier"
- access_level: "full" (для всех агентов)
- metadata: {
    scope: "all | batch:<id> | stream:<id> | candidate:<hex40>",
    permissions: ["read_artifacts", "read_tools"],
    excluded_roles: ["author", "executor", "controller"]
  }
```

**Access Resolution** (из `access.ts` Graph Memory) проверяет:
1. Существует ли узел с `type: "role"` и `id: "role-certifier"`?
2. Совпадает ли scope агента с scope роли?
3. Есть ли агент в списке excluded?

---

#### 2.2. Collection и Exhaustion (S-claude-05, S-codex-03)

**Протокол требует:**
- Фиксированный scope collection: `docs/reviews/*findings*.md` + target
- EXHAUSTED state после failed attempt 2
- Запрет на attempt 3 без owner exception

**Реализация через Graph Memory:**
```
TaskGraph узлы типа "attempt":
- id: "attempt-batch-42-root-cause-7"
- metadata: {
    batch_id: "42",
    root_cause: "7",
    attempt_num: 2,
    disposition: "confirmed | unresolved | deferred-by-owner",
    status: "EXHAUSTED",
    evidence_path: "docs/reviews/batch-42-attempt-results.jsonl"
  }
```

**BM25 search** находит все attempts для данного root_cause, проверяет максимальный attempt_num, и если disposition="confirmed" и attempt_num=2 → возвращает EXHAUSTED.

---

#### 2.3. Producer Evidence и Reproductions (S-claude-08, S-codex-04)

**Протокол требует:**
- Digest equality к Candidate (не "clean tree")
- `record --candidate <sha>`: check ancestry, run validator/suite в worktree, digest ls-tree
- Reproduction locator: structured data (script path, interpreter, argv, expected exit, hash)

**Реализация через Graph Memory:**
```
KnowledgeGraph узлы типа "evidence":
- id: "evidence-candidate-4ded1be"
- metadata: {
    baseline_sha: "4ded1bee1c2acf2392fdeededf50935f59138302",
    candidate_sha: "4ded1be...",
    tree_digest: "sha256:abc123...",
    validator_exit: 0,
    suite_exit: 0,
    worktree_path: "/tmp/worktree-xyz"
  }

TaskGraph узлы типа "reproduction":
- id: "reproduction-rc-7-attempt-2"
- metadata: {
    script_path: "docs/reviews/probes/rc-7-probe.cjs",
    interpreter: "node",
    argv: ["--flag1", "value1"],
    expected_exit: 1,
    script_hash: "sha256:def456..."
  }
```

**Access Resolution** проверяет:
- Для роли `certifier`: access_level="full" → может читать все evidence и reproduction узлы
- Для роли `implementer`: access_level="summary" → видит только metadata, не содержимое

---

#### 2.4. Watchdog и Wake-then-fail (S-claude-11, S-codex-05)

**Протокол требует:**
- Watch 4 signals: dispatcher stdout, transcript, report/journal, CPU delta
- 300s без qualified size change → WAKE-1/2/3
- На 3-м неудачном wake → FALLEN + terminate process tree

**Реализация через Graph Memory:**
```
TaskGraph узлы типа "watchdog":
- id: "watchdog-session-claude-7b78af2b"
- metadata: {
    session_id: "claude-7b78af2bb24149a9",
    checkout_root: "D:/Colabs",
    process_pid: 12345,
    last_signal_time: "2026-09-24T20:05:56Z",
    wake_count: 2,
    signals: ["stdout", "transcript", "journal"]
  }
```

**BM25 search** находит все watchdog узлы для данной session_id, проверяет wake_count < 3 и last_signal_time.

---

#### 2.5. Dispatch и Registry (S-claude-13, S-codex-06)

**Протокол требует:**
- `.ai/client-registry.json`: cli, version, verified, argv, env, permission, timeBound, sessionIdFrom, resume, artifacts, failureModes
- Dispatch reads prompt file, spawns executable+argv, verifies cwd

**Реализация через Graph Memory:**
```
KnowledgeGraph узлы типа "client":
- id: "client-claude-code"
- metadata: {
    cli: "claude",
    version: "2.1.278",
    verified_date: "2026-09-24",
    argv: ["claude", "--dangerously-skip-permissions", "--prompt", "{prompt_file}"],
    env: {"CLAUDE_CONFIG_DIR": "~/.claude"},
    permission_profile: "advisory",
    time_bound: 3600,
    session_id_from: "first stream-json event",
    resume_template: "Continue from {checkpoint}",
    artifacts: ["report", "journal"],
    failure_modes: [
      {"cause": "timeout", "countermeasure": "wake", "signal": "stdout"},
      {"cause": "permission_denied", "countermeasure": "escalate", "signal": "journal"}
    ]
  }
```

---

#### 2.6. Signals Ledger (S-claude-15, S-codex-07)

**Протокол требует:**
- `.ai/SIGNALS.jsonl`: append-only, strict schema v1
- Required fields: id, UTC date, participant, type, evidence, cost, disposition, rootCause, batchId
- Types: procedure-gap, script-candidate, fall

**Реализация через Graph Memory:**
```
TaskGraph узлы типа "signal":
- id: "signal-2026-09-24-001"
- metadata: {
    type: "procedure-gap",
    participant: "claude-7b78af2b",
    evidence_path: "docs/reviews/batch-42-attempt-results.jsonl",
    cost: {"attempts": 2, "minutes": 45, "owner_interventions": 1},
    disposition: "open",
    root_cause: "7",
    batch_id: "42",
    supersedes_event: null
  }
```

**BM25 search** находит все signals с disposition="open" для данного root_cause, группирует по batch_id.

---

#### 2.7. Research Cycle и Kernel-Change (S-claude-16, S-codex-08)

**Протокол требует:**
- 3 rounds + 4-step close
- Independent round-3 syntheses (без mutual reads)
- Owner-named drafter + 2 critiques + fixer

**Реализация через Graph Memory:**
```
KnowledgeGraph узлы типа "research_round":
- id: "research-round-3-batch-42"
- metadata: {
    round_num: 3,
    batch_id: "42",
    syntheses: [
      {"participant": "claude", "file": "r3-claude-synthesis.md", "read_others": false},
      {"participant": "codex", "file": "r3-codex-synthesis.md", "read_others": false},
      {"participant": "gemini", "file": "r3-gemini-synthesis.md", "read_others": false}
    ],
    drafter: "claude",
    critiques: ["codex", "deepseek"],
    fixer: "claude",
    owner_adoption: null
  }
```

**Access Resolution** проверяет:
- Для роли `synthesizer` в round 3: access_level="full" к своему synthesis, "exists" к другим (видит, что они есть, но не читает)

---

### Уровень 3: Интеграционный план (Sprints 0-5)

Объединяя ваш план спринтов с техническими требованиями из отчетов:

#### Sprint 0: Фундамент (сейчас)
**Что:** Решение по agy (вариант 2 с таймбоксом)
**Graph Memory:** Не требуется (это hotfix)

#### Sprint 1: Спецификация
**Что:** Схема frontmatter, канон слоёв, валидатор
**Graph Memory:**
- Запустить как MCP-сервер
- Создать KnowledgeGraph узлы для всех ролей (certifier, reviewer, researcher и т.д.)
- Создать KnowledgeGraph узлы для всех процедур (lifecycle-task-frame, lifecycle-certification, lifecycle-escalation)
- Настроить Access Resolution на 3 уровня (exists/summary/full)

**Валидатор проверяет:**
- Все `roles` в frontmatter процедур существуют в KnowledgeGraph
- Все `permissions_required` в процедурах соответствуют permissions в узлах ролей
- Access Resolution корректно фильтрует узлы по роли и stage

#### Sprint 2: Загрузчик
**Что:** Детерминированный resolver (роль, задача) → ordered doc set
**Graph Memory:**
- Реализовать `build_context(role, task)` через MCP API:
  1. Найти все KnowledgeGraph узлы типа "procedure" с access_level="full" для данной роли
  2. Отфильтровать по stage из TaskGraph (текущий stage задачи)
  3. Добавить узлы типа "tool" с access_level="full" для процедур из шага 1
  4. Отсортировать по priority (L0 → L1 → L2 → L3)

**Тест:** Два агента с одинаковой ролью+задачей получают идентичные наборы документов (проверяется через hash)

#### Sprint 3: Состояние
**Что:** Единая схема артефактов, environment-manifest, resume после разрыва
**Graph Memory:**
- Создать TaskGraph узлы типа "task_frame" и "environment_manifest"
- При инициации задачи: создать task_frame узел с metadata (goal, boundaries, frozen_sha)
- При декларации окружения: создать environment_manifest узел с metadata (tools: ["git_read", "grep", "shell_exec"])
- При resume: найти task_frame узел по session_id, прочитать metadata, продолжить с checkpoint

**Тест:** Убить агента на середине → второй агент продолжает по артефактам без вопросов владельцу

#### Sprint 4: Метрики + жизненный цикл правил
**Что:** 3-5 метрик, процедуры amendment/deprecation
**Graph Memory:**
- Создать TaskGraph узлы типа "metric":
  - `metric-escalation_rate`: доля задач без эскалации
  - `metric-stop_questions`: стоп-вопросов на задачу
  - `metric-context_budget`: % бюджета на инструкции vs работу
- Создать KnowledgeGraph узлы типа "amendment":
  - metadata: {procedure_id, amendment_date, reason, owner_approval}

**Тест:** Правило, не читавшееся N спринтов, помечается кандидатом на deprecation (проверяется через BM25 search по access logs)

#### Sprint 5+: MCP, скиллы
**Что:** После стабилизации ядра
**Graph Memory:** Полностью интегрирован, все агенты используют MCP API для доступа к KnowledgeGraph и TaskGraph

---

### 📊 Итоговая карта интеграции

| Компонент протокола | Graph Memory узел | Access Level | Search Method |
|---|---|---|---|
| Роли (S-claude-01) | KnowledgeGraph type="role" | exists для всех, full для своей роли | BM25 по id |
| Процедуры (S-codex-02) | KnowledgeGraph type="procedure" | full для matching role+stage | BM25 по title+roles |
| Attempts (S-claude-06) | TaskGraph type="attempt" | summary для implementer, full для certifier | BM25 по root_cause |
| Evidence (S-claude-08) | KnowledgeGraph type="evidence" | full для certifier | BM25 по candidate_sha |
| Reproductions (S-claude-10) | TaskGraph type="reproduction" | full для certifier | BM25 по script_path |
| Watchdog (S-claude-11) | TaskGraph type="watchdog" | full для dispatcher | BM25 по session_id |
| Clients (S-claude-13) | KnowledgeGraph type="client" | full для coordinator | BM25 по cli |
| Signals (S-claude-15) | TaskGraph type="signal" | summary для всех, full для coordinator | BM25 по disposition |
| Research (S-claude-16) | KnowledgeGraph type="research_round" | full для своего synthesis, exists для других | BM25 по batch_id |

---

### 💎 Финальный синтез

**Да, можно рационально свести все три синтеза в единый документ** через разделение на уровни:

1. **Стратегический уровень** (мой синтез): Graph Memory как эталонная реализация с постепенной миграцией на Python/SQLite
2. **Технический уровень** (отчеты Claude/Codex): Конкретные требования протокола (роли, grammar, collection, exhaustion, evidence, watchdog, dispatch, signals, research cycle)
3. **Интеграционный уровень** (маппинг): Каждый компонент протокола маппится на конкретный тип узла в Graph Memory с определенным access_level и search method

**Ключевой принцип:** Graph Memory предоставляет инфраструктуру (KnowledgeGraph, TaskGraph, Access Resolution, BM25), а ваш протокол определяет семантику (что хранить, кто имеет доступ, как искать).

**Следующий шаг:** Начать Sprint 1 с создания KnowledgeGraph узлов для всех ролей и процедур из отчетов Claude/Codex, настроить Access Resolution на 3 уровня (exists/summary/full), и написать валидатор, проверяющий соответствие frontmatter процедур этим узлам.
