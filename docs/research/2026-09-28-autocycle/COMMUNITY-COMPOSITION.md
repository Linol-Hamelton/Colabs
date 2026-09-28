# Community-состав: таблицы «остаётся / уходит» (PROTO-DEC-0106 п.9)

Построено механически 2026-09-28 18:42Z оператором (kilo-2fec8d740dc73400). Метод: установка протокола установщиком в пустую временную папку
(`setup-ai-protocol.ps1 -Target <temp> -InitGit`, 34 файла) + сравнение с `git ls-files`
`D:\Colabs` @ `63de03058521b921011e86520c468acd510731bb`. Ничего не удалено; это только таблицы для решения владельца.

Состав по правилу PROTO-DEC-0106 п.9: остаётся то, что получает ПУСТОЙ проект при установке
(managed + integration + создаваемое установщиком), плюс исключения: LICENSE, README.md,
QUICKSTART.md, setup-ai-protocol.ps1 и читаемые им шаблоны (`templates/`).

## Пограничные случаи (вопрос владельцу; механика их не решает)

1. **Пять файлов состояния создаёт установщик, но PROTO-DEC-0106 п.9 называет содержимое
   «уходит»**: `.ai/TASK.md`, `.ai/PLAN.md`, `.ai/DECISIONS.md`, `.ai/ARCHIVE.md`,
   `.ai/worklog/README.md` (плюс сами журналы). В пустой установке это скелеты из `templates/ai/`;
   в исходном дереве - накопленная история. Механическое чтение: в публичном коммите эти пути
   остаются, но с содержимым-скелетом (накопленный текст уходит). **Решение о форме заморозки -
   за владельцем** (скелет вместо содержимого vs иное); строка в OWNER-QUEUE.
2. **Пять файлов из «уходит», на которые ссылается `validate-protocol.ps1`** (долг владельцу по ADV-003
   item 2; рекомендация: оставить исключениями, если это протокольный код/тесты; решение владельца):

   | путь | что это | есть ли что-то кроме протокольного | ссылка в валидаторе |
   |---|---|---|---|
   | `.editorconfig` | стиль-конфиг репозитория (UTF-8/LF/final newline, отступы 2/4, md без trim) | нет: чистая конфигурация стиля | `validate-protocol.ps1:216` (textNames), `:694` (config allowlist) |
   | `.codex/config.toml` | конфигурация клиента Codex (approval_policy=on-request, sandbox_mode=workspace-write; хуки в hooks.json) | нет: только параметры клиента протокола | `:203` (исключён из программной проверки) |
   | `.github/workflows/protocol.yml` | CI протокола: валидатор + набор + anchor + установка в чистую папку + идемпотентность reinstall | нет: только протокольные шаги (упоминает suite/installer) | `:206` |
   | `test-protocol.ps1` | полный регрессионный набор протокола (Node 22, ASCII, LF) | нет: тесты протокола | `:654` (rootProtectedFiles) |
   | `docs/decisions/REGISTRY.md` | append-only реестр переходов статусов решений (governance-метаданные) | не код и не тесты: только метаданные решений (включая упоминания закрытой части) | `:475-478`, `:531`: отсутствие -> **WARN** (не FAIL); удаление строк -> WARN |

   Рекомендация оператора: первые четыре оставить в публичной версии (протокольный код/конфиг/тесты);
   `REGISTRY.md` - метаданные решений, не идеи/планы/данные; если владелец решит исключить, валидатор
   даёт только WARN в source-роли.

   **Решение владельца 2026-09-28 (selection=owner):**
   - `.editorconfig` и `.codex/config.toml` - **остаются** в публичной версии исключениями;
   - `docs/decisions/REGISTRY.md` - **заменить заготовкой** (только шапка таблицы, пустой реестр),
     согласованно со скелетом `.ai/DECISIONS.md`;
   - `test-protocol.ps1` и `.github/workflows/protocol.yml` - решение отложено; факты ниже.

   **Факты для отложенного решения (отправлены владельцу 2026-09-28):**
   - (а) Отсутствие в `role=source`: `validate-protocol.ps1:144-146` добавляет `manifest.source` +
     `manifest.tests` в `$Required`; `:154-158` на каждый отсутствующий файл пишет
     `FAIL "missing file: <rel>"`. `test-protocol.ps1` входит в `manifest.source` -> его удаление
     из source-дерева = **FAIL** (если не менять список манифеста). `protocol.yml` не входит ни в
     один список манифеста; `:206` срабатывает только при наличии файла (protocol-owned для
     encoding-проверок) -> удаление **безмолвно** (ни FAIL, ни WARN).
   - (б) От `tests/fixtures/prompts/**` зависят только `tests/dispatch.test.cjs`: T5 (`:153-175`)
     копирует каталог целиком (40 файлов) и требует `check` exit 0 с числом слотов; T18 (`:526-542`)
     гоняет `check` по `DISPATCH.json`. `tests/runrecord.test.cjs` читает промпт r6 из объекта git
     `fd789ac` (история, достижима), а не из фикстуры. В каталоге: `DISPATCH.json` + 39
     исторических research-промптов (`run/*.md`), всего 73.1 KB.
   - (в) В `tests/` кроме протокольного кода: 29 `.cjs` (код тестов) + 66 файлов `fixtures/`
     (prompts 40, signals 10, dispatch 9, resolver 4, runrecord 3). Единственное не-кодовое
     содержимое - фикстуры: 39 `run/*.md` (исторические research-промпты, входы для тестов
     dispatch), логи usage, goldens, «плохие примеры» signals. Идей/планов/данных сверх этого нет.

3. Размеры в таблицах - из исходного дерева на указанном SHA; в пустой установке те же пути
   существуют, но меньше по размеру (скелеты). `.ai/runtime/` и прочие игнорируемые файлы в
   состав не входят (их нет в `git ls-files`). Untracked-файлы текущих сессий также не входят.

## Остаётся (Community Edition)

| путь | размер | что это |
|---|---|---|
| `.ai/ARCHIVE.md` | 1027.0 KB | создаётся установщиком |
| `.ai/DECISIONS.md` | 354.0 KB | создаётся установщиком |
| `.ai/PLAN.md` | 23.0 KB | создаётся установщиком |
| `.ai/TASK.md` | 13.4 KB | создаётся установщиком |
| `.ai/bin/protocol-archive.cjs` | 10.8 KB | managed (манифест протокола) |
| `.ai/bin/protocol-handoff.cjs` | 56.6 KB | managed (манифест протокола) |
| `.ai/bin/protocol-hooks.cjs` | 28.5 KB | managed (манифест протокола) |
| `.ai/bin/protocol-index.cjs` | 7.6 KB | managed (манифест протокола) |
| `.ai/bin/protocol-ledger.cjs` | 13.4 KB | managed (манифест протокола) |
| `.ai/bin/protocol-lock.cjs` | 13.6 KB | managed (манифест протокола) |
| `.ai/bin/protocol-scope.cjs` | 19.3 KB | managed (манифест протокола) |
| `.ai/bin/protocol-session.cjs` | 16.8 KB | managed (манифест протокола) |
| `.ai/bin/protocol-verdict.cjs` | 26.9 KB | managed (манифест протокола) |
| `.ai/bin/protocol.cjs` | 11.2 KB | managed (манифест протокола) |
| `.ai/docs/CLI-AGENTS.md` | 12.8 KB | managed (манифест протокола) |
| `.ai/docs/CODEX.md` | 3.8 KB | managed (манифест протокола) |
| `.ai/docs/COPILOT.md` | 3.1 KB | managed (манифест протокола) |
| `.ai/docs/GLM.md` | 3.0 KB | managed (манифест протокола) |
| `.ai/docs/PAIRED-CYCLE.md` | 31.7 KB | managed (манифест протокола) |
| `.ai/docs/PROTOCOL.md` | 34.3 KB | managed (манифест протокола) |
| `.ai/worklog/README.md` | 1.1 KB | создаётся установщиком |
| `.claude/hooks/protocol-hooks.cjs` | 0.2 KB | managed (манифест протокола) |
| `.claude/hooks/session-start.sh` | 0.4 KB | managed (манифест протокола) |
| `.claude/hooks/stop-worklog-check.sh` | 0.4 KB | managed (манифест протокола) |
| `.claude/settings.json` | 1.1 KB | integration (манифест протокола) |
| `.codex/hooks.json` | 0.9 KB | integration (манифест протокола) |
| `.codex/hooks/protocol.cjs` | 0.2 KB | managed (манифест протокола) |
| `.gitattributes` | 0.3 KB | integration (манифест протокола) |
| `.github/copilot-instructions.md` | 2.0 KB | managed (манифест протокола) |
| `.gitignore` | 0.3 KB | integration (манифест протокола) |
| `AGENTS.md` | 20.8 KB | managed (манифест протокола) |
| `CLAUDE.md` | 1.4 KB | managed (манифест протокола) |
| `protocol-manifest.json` | 2.9 KB | managed (манифест протокола) |
| `validate-protocol.ps1` | 61.1 KB | managed (манифест протокола) |
| `LICENSE` | 1.0 KB | лицензия MIT (исключение состава) |
| `README.md` | 10.4 KB | README Community (исключение) |
| `QUICKSTART.md` | 6.0 KB | quickstart (исключение) |
| `setup-ai-protocol.ps1` | 19.5 KB | установщик (исключение) |
| `templates/ai/ARCHIVE.md` | 1.3 KB | шаблон, который читает установщик (исключение) |
| `templates/ai/DECISIONS.md` | 1.3 KB | шаблон, который читает установщик (исключение) |
| `templates/ai/PLAN.md` | 0.9 KB | шаблон, который читает установщик (исключение) |
| `templates/ai/TASK.md` | 1.5 KB | шаблон, который читает установщик (исключение) |
| `templates/ai/worklog/README.md` | 1.1 KB | шаблон, который читает установщик (исключение) |
| `templates/prompts/COMMON.md` | 1.9 KB | шаблон, который читает установщик (исключение) |
| `templates/reviews/REVIEW.md` | 4.6 KB | шаблон, который читает установщик (исключение) |

Всего: 45 файлов, 1853.4 KB.

## Уходит (сводка по группам)

| группа | файлов | размер | что это |
|---|---|---|---|
| `docs/research/` | 1386 | 3764.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/reviews/` | 269 | 2839.8 KB | ревью, аудиты и сертификаты |
| `tests/` | 95 | 605.4 KB | регрессионный набор (source-роль) |
| `.ai/` | 114 | 546.3 KB | состояние протокола (TASK/PLAN/DECISIONS/ARCHIVE) |
| `docs/core-arch/` | 61 | 533.3 KB | материалы CORE-ARCH |
| `OwnerIdeas/` | 11 | 339.8 KB | идеи владельца |
| `tools/` | 10 | 58.2 KB | инструменты |
| `docs/decisions/` | 1 | 41.2 KB | реестр решений |
| `docs/ops/` | 5 | 28.6 KB | операционные материалы (экономика, бэклог, прогоны) |
| `docs/specs/` | 4 | 26.7 KB | спецификации |
| `(корень)` | 5 | 7.8 KB | настройки редактора |
| `.github/` | 1 | 2.4 KB | CI и интеграционные файлы GitHub |
| `.codex/` | 1 | 0.3 KB | настройки и хуки Codex |

Всего уходит: 1963 файлов, 8793.7 KB.

## Отдельно отмечено: файлы из «уходит», на которые ссылается установщик/валидатор

- `.codex/config.toml` — упомянут в: validate-protocol.ps1
- `.editorconfig` — упомянут в: validate-protocol.ps1
- `.github/workflows/protocol.yml` — упомянут в: validate-protocol.ps1
- `docs/decisions/REGISTRY.md` — упомянут в: validate-protocol.ps1
- `test-protocol.ps1` — упомянут в: validate-protocol.ps1

## Полный список «уходит» (path, size, группа)

| путь | размер | группа |
|---|---|---|
| `.ai/SIGNALS.md` | 19.9 KB | состояние протокола (TASK/PLAN/DECISIONS/ARCHIVE) |
| `.ai/bin/protocol-dispatch.cjs` | 85.1 KB | инструменты протокола (source-роль) |
| `.ai/bin/protocol-runrecord.cjs` | 37.5 KB | инструменты протокола (source-роль) |
| `.ai/bin/protocol-signals.cjs` | 35.0 KB | инструменты протокола (source-роль) |
| `.ai/docs/clients.json` | 9.6 KB | документация протокола для агентов |
| `.ai/docs/dispatch/repair.md` | 0.2 KB | документация протокола для агентов |
| `.ai/docs/dispatch/wake.md` | 0.1 KB | документация протокола для агентов |
| `.ai/worklog/claude-3fdb2418bfa55427.md` | 4.3 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-658029b20c3f1e69.md` | 3.8 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-7dcc4d0185595bcf.md` | 5.7 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-ad7cc4169e888ea8.md` | 4.5 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-b00262b88c55444b.md` | 3.0 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-c73232724159e5bd.md` | 4.3 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-d27f9702a692fe4b.md` | 5.3 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-d990acada995d601.md` | 2.4 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-e108f8be9e0e2049.md` | 7.2 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-e59d6a50882e9e39.md` | 3.0 KB | журналы сессий (история работы) |
| `.ai/worklog/claude-eb97ac9d13050014.md` | 3.0 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-129b857dadc9ecbc.md` | 1.2 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-2386381c48088cee.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-7be1bfbd1a87788a.md` | 2.3 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-7ce3410e67968c14.md` | 2.5 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-8459a69abda6f8ba.md` | 2.4 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-9402a2825c3eafe9.md` | 3.8 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-96801ade53c50a18.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-b21040e3f1a34b22.md` | 4.4 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-b256ad8b1a3d1e04.md` | 5.5 KB | журналы сессий (история работы) |
| `.ai/worklog/codex-ebacaa892db4dcce.md` | 4.7 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-08b98f3e57049e13.md` | 5.5 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-115f8847b115ec32.md` | 3.3 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-16f781043961697d.md` | 3.4 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-1e398b568bb78796.md` | 3.9 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-25ba5a48071ffe96.md` | 3.9 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-2c5353485fab789c.md` | 4.4 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-335f0800369818b5.md` | 2.8 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-4aed8a4bc19ae6e8.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-4b14bd5a14a991a1.md` | 5.5 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-4d3f660bb34a4daf.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-4f70203222c3ae0b.md` | 3.8 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-55173c7a252994d3.md` | 4.0 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-5bc361c5907ce179.md` | 3.6 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-617a575f50d1ad5e.md` | 3.4 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-6db5c8f69f491940.md` | 3.2 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-7ca79f41c34b762a.md` | 2.8 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-a271dafb79d5d421.md` | 3.7 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-a3813c0b8b1bb117.md` | 4.0 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-b0bee51da3d8e0d2.md` | 3.6 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-c030df77bbee54bf.md` | 3.2 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-cab3a8dba0dcb6b2.md` | 3.4 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-d08af75d8444685c.md` | 3.2 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-de4b5c30af414f21.md` | 6.3 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-e37eab7bb9169627.md` | 3.1 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-e3c0dd4948c00613.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/deepseek-fdcb7c2e7af91ffb.md` | 4.7 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-1b2cca790088eb8a.md` | 2.0 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-30a714e7f0272d3f.md` | 5.5 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-504809281e1dcdbc.md` | 3.3 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-53697fa4d1b45f33.md` | 3.4 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-573e1c9757d07529.md` | 3.5 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-5f99a438de423714.md` | 3.2 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-5fc14557972bfb5f.md` | 2.4 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-64401c9d1745781d.md` | 3.1 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-7a2adb82d9f9d90b.md` | 3.5 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-7d0c7382e95a1024.md` | 2.6 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-85778f5b66412208.md` | 2.6 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-b3f4dce8b3181319.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-b569642056824e5c.md` | 1.9 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-ce0485aa5fe54c98.md` | 2.6 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-d7d44e9eac34702c.md` | 4.6 KB | журналы сессий (история работы) |
| `.ai/worklog/gemini-ea64253888f6cae5.md` | 3.0 KB | журналы сессий (история работы) |
| `.ai/worklog/kilo-2fec8d740dc73400.md` | 4.4 KB | журналы сессий (история работы) |
| `.ai/worklog/kilo-70ef1574cc26c869.md` | 3.3 KB | журналы сессий (история работы) |
| `.ai/worklog/kilo-9a9b18229cce57fd.md` | 9.3 KB | журналы сессий (история работы) |
| `.ai/worklog/kilo-a5143d29cc7dd8ff.md` | 7.8 KB | журналы сессий (история работы) |
| `.ai/worklog/kilo-c4e38342c421fb77.md` | 1.7 KB | журналы сессий (история работы) |
| `.ai/worklog/kilo-e1b4dd4a82b08b8e.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/kilo-f22faac486b5e567.md` | 4.3 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-1ef9f06682472de8.md` | 3.8 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-322149376b1a661c.md` | 1.8 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-4056c8cfeceed587.md` | 2.1 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-4128de4654dc504d.md` | 4.1 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-45cb92f3f5122329.md` | 2.2 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-77834798f3f06db8.md` | 1.8 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-81cce3cbfd726c28.md` | 4.4 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-ba9a2160051850f3.md` | 2.1 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-cf8e4ec45a137b1b.md` | 2.6 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-d34872b5cafaf481.md` | 2.5 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-dc858d3b6d3e7e84.md` | 2.2 KB | журналы сессий (история работы) |
| `.ai/worklog/kimi-e509df2930c43e35.md` | 3.4 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-07aa87d3db94ee8d.md` | 3.3 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-0e0610cd95c1e83e.md` | 3.2 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-370f15396465bd07.md` | 2.8 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-3ab2dc556d959969.md` | 3.6 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-695fcfb3b47f3125.md` | 3.3 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-6b87e681088760d6.md` | 3.5 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-9ff25216f4c36caf.md` | 2.2 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-a59c7fed6ea7a79c.md` | 3.9 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-e4c410e6b1de3851.md` | 2.8 KB | журналы сессий (история работы) |
| `.ai/worklog/mimo-fcc73665e9b94ff9.md` | 2.2 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-0d03d4481ac46858.md` | 2.8 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-11f7b47fbc2a17b0.md` | 2.1 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-31c0a7ec3787702f.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-31cf948c41b2498a.md` | 1.6 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-336cc83e64fea6b8.md` | 1.5 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-4df87b80d0841779.md` | 1.6 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-645fa37d2a969412.md` | 2.0 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-66840984467b96ee.md` | 3.0 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-6a0cf8dbb9d808a5.md` | 2.3 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-788ad077f9100953.md` | 1.7 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-d3fc8eeecf806c9a.md` | 2.3 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-dbafced31ad20a45.md` | 2.9 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-e5b0a7370dee2904.md` | 3.9 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-e67399c73e9dc26b.md` | 1.6 KB | журналы сессий (история работы) |
| `.ai/worklog/mistral-verify-001.md` | 2.5 KB | журналы сессий (история работы) |
| `.codex/config.toml` | 0.3 KB | настройки и хуки Codex |
| `.editorconfig` | 0.2 KB | настройки редактора |
| `.github/workflows/protocol.yml` | 2.4 KB | CI и интеграционные файлы GitHub |
| `CONTRIBUTING.md` | 2.4 KB | правила контрибуции |
| `OwnerIdeas/Google_AX.md` | 32.1 KB | идеи владельца |
| `OwnerIdeas/H-AUTH-02.md` | 1.6 KB | идеи владельца |
| `OwnerIdeas/H-PROMPT-DELIVERY-01_canonical-task-file-vs-orchestrator-loading.md` | 4.1 KB | идеи владельца |
| `OwnerIdeas/MCP_Server.md` | 50.0 KB | идеи владельца |
| `OwnerIdeas/RISK_COUNCIL.md` | 54.3 KB | идеи владельца |
| `OwnerIdeas/Rust.md` | 24.4 KB | идеи владельца |
| `OwnerIdeas/benchmark.md` | 54.3 KB | идеи владельца |
| `OwnerIdeas/executor.md` | 23.2 KB | идеи владельца |
| `OwnerIdeas/performers.md` | 25.5 KB | идеи владельца |
| `OwnerIdeas/scripts.md` | 31.7 KB | идеи владельца |
| `OwnerIdeas/task_profife.md` | 38.6 KB | идеи владельца |
| `SECURITY.md` | 1.3 KB | политика безопасности |
| `cleanup-pilot-data.ps1` | 2.5 KB | служебный скрипт уборки |
| `docs/core-arch/CORE-ARCH-1.md` | 40.2 KB | материалы CORE-ARCH |
| `docs/core-arch/CORE-ARCH-2.md` | 38.6 KB | материалы CORE-ARCH |
| `docs/core-arch/CORE-ARCH-3.md` | 23.0 KB | материалы CORE-ARCH |
| `docs/core-arch/CORE-ARCH-4.md` | 22.1 KB | материалы CORE-ARCH |
| `docs/core-arch/CORE-ARCH-5.md` | 16.9 KB | материалы CORE-ARCH |
| `docs/core-arch/CORE-ARCH-6.md` | 18.7 KB | материалы CORE-ARCH |
| `docs/core-arch/CORE-ARCH-7.md` | 19.9 KB | материалы CORE-ARCH |
| `docs/core-arch/OWNER-DECISION-execution-model-2026-09-25.md` | 33.9 KB | материалы CORE-ARCH |
| `docs/core-arch/PROPOSAL-node-validator.md` | 6.9 KB | материалы CORE-ARCH |
| `docs/core-arch/PROPOSAL-role-resolver-supervisor.md` | 8.5 KB | материалы CORE-ARCH |
| `docs/core-arch/SCRIPTS-REFERENCE.md` | 6.1 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/L0-ROOT.md` | 8.7 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-001-procedure-lifecycle.md` | 12.1 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-002-stop-and-ask.md` | 5.8 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-003-source-conflict.md` | 4.1 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-004-layer-consistency.md` | 5.2 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-005-decision-change.md` | 5.0 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-006-retire-or-improve-candidates.md` | 4.7 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-007-comparative-test.md` | 5.6 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-008-research-governor.md` | 20.3 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/P-L0-009-authorised-action.md` | 4.8 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/RULE-MAP.md` | 9.3 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/S1-SUMMARY.md` | 7.0 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/SPEC-protocol-core.md` | 6.0 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/procedure.schema.md` | 11.2 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/trial/P-L2-008-freeze-candidate.md` | 3.9 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/trial/P-L5-001-shared-documents.md` | 3.3 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/trial/S-003-research-cycle.md` | 5.0 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-1/trial/TRIAL-NOTES.md` | 4.6 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/P-L1-001-orientation.md` | 4.5 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/P-L1-002-independence.md` | 5.6 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/P-L2-002-model-selection.md` | 9.1 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/SCHEMA-assignment.md` | 9.8 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/WORK-CYCLE.md` | 3.5 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-auditor.md` | 1.8 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-certifier.md` | 2.4 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-coordinator.md` | 2.4 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-critic.md` | 1.8 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-dispatcher.md` | 2.1 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-drafter.md` | 1.7 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-fixer.md` | 1.8 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-implementer.md` | 2.1 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-owner.md` | 2.2 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-procedure-author.md` | 1.7 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-researcher.md` | 1.9 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-reviewer.md` | 2.8 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-shadow-certifier.md` | 1.7 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/roles/ROLE-synthesiser.md` | 1.6 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/trial/P-L2-002-rubric-trial.md` | 4.1 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-2/trial/S2-T10-packet-trial.md` | 8.1 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/L-CORRECTION-4-AUDIT-C2.md` | 2.5 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/L-CORRECTION-4-AUDIT.md` | 5.9 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/L-CORRECTION-4.md` | 8.2 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/MODEL-MATRIX.md` | 14.4 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/P-L3-002-model-discovery.md` | 5.6 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/P-L3-003-model-ranking.md` | 5.0 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/P-L3-004-route-failover.md` | 22.8 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/P-L3-005-client-model-effort.md` | 3.9 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/kilo-routes.cjs` | 5.5 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/kilo-routes.json` | 15.3 KB | материалы CORE-ARCH |
| `docs/core-arch/stage-4/workflowAI.md` | 9.9 KB | материалы CORE-ARCH |
| `docs/decisions/REGISTRY.md` | 41.2 KB | реестр решений |
| `docs/ops/BACKLOG.md` | 9.4 KB | операционные материалы (экономика, бэклог, прогоны) |
| `docs/ops/MODEL-ECONOMICS.md` | 8.3 KB | операционные материалы (экономика, бэклог, прогоны) |
| `docs/ops/PROBLEMS.md` | 2.7 KB | операционные материалы (экономика, бэклог, прогоны) |
| `docs/ops/RUNS.jsonl` | 4.2 KB | операционные материалы (экономика, бэклог, прогоны) |
| `docs/ops/model-ladder.json` | 4.0 KB | операционные материалы (экономика, бэклог, прогоны) |
| `docs/research/2026-09-23-kernel-architecture/BRIEF.md` | 7.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-23-kernel-architecture/DISCUSSION.md` | 22.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/BRIEF.md` | 7.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/PROCEDURE-MAP.md` | 9.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/ROUND2.md` | 5.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/copilot-z3-diff-cert.md` | 10.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/external-synthesis.md` | 43.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/gemini-z1-grammar.md` | 13.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/mistral-z2-budget-scope.md` | 9.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/prompts/launch-round2.cjs` | 6.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/prompts/r2-copilot.md` | 2.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/prompts/r2-deepseek.md` | 1.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/prompts/r2-gemini.md` | 2.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/prompts/r2-mistral.md` | 1.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/prompts/r3-synthesis.md` | 5.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/qwen-z4-idle-exit.md` | 7.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/r2-copilot-z2-z4.md` | 17.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/r2-deepseek-synthesis.md` | 16.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/r2-gemini-z4-z2.md` | 12.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/r2-mistral-z1-z3.md` | 14.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/r3-claude-synthesis.md` | 19.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/r3-codex-synthesis.md` | 37.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/r3-deepseek-synthesis.md` | 28.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-24-remediation-mapping/r3c-deepseek-critique.md` | 9.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/BRIEF.md` | 53.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/README.md` | 6.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/A-research.md` | 8.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/A-synthesis.md` | 4.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/B-research.md` | 7.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/B-synthesis.md` | 3.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/K-launch.md` | 7.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/jobs.json` | 4.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/launch-fake-client.cjs` | 4.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/launch-test.cjs` | 43.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/launch.cjs` | 72.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/run/a-deepseek.md` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/run/a-gemini.md` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/run/a-sol.md` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/run/a-synth.md` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/run/b-grok.md` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/run/b-kimi.md` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/run/b-mistral.md` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-improvement-research/prompts/run/b-synth.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-validator-migration-council/final-plan-2.md` | 62.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-validator-migration-council/tools/ps-probe.cjs` | 1.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-validator-migration-council/tools/r2-dispatch.cjs` | 10.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-25-validator-migration-council/tools/run-chain.cjs` | 19.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/COST-ZERO-ROUTES.md` | 10.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/EVIDENCE.md` | 8.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/FREE-UNTIL-BALANCE.md` | 6.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/GAPS.md` | 7.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/OWNER-PROMPT.md` | 7.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/PRICES-OFFICIAL.md` | 9.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/README.md` | 5.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/USAGE-VERIFIER.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/USAGE.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/prompts/DISPATCH-VERIFIER.json` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/prompts/DISPATCH.json` | 2.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/prompts/run/collector-a.md` | 5.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/prompts/run/collector-b.md` | 5.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/prompts/run/verifier.md` | 3.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/round1/COLLECTOR-A.md` | 17.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/round1/COLLECTOR-B.md` | 28.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-cost-routes-research/round2/VERIFICATION.md` | 12.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-ops-layer/PROMPT.md` | 12.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-ops-layer/README.md` | 4.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/LAUNCH-PROFILE-ADDENDUM.md` | 2.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/M1-LAUNCH.md` | 1.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/M1-REPORT.md` | 3.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PERF-REVIEW-TASK.md` | 2.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1-ADDENDUM.md` | 2.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1.md` | 3.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/report.txt` | 4.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/samples.json` | 11.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-archive.test.cjs-38872.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-archive.test.cjs-42908.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-archive.test.cjs-50004.json` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-archive.test.cjs-8132.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-codex.test.cjs-37428.json` | 1.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-context-policy.test.cjs-23860.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-1188.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-16780.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-20060.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-29956.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-32916.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-32976.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-36912.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-41348.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-41472.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-41808.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-42012.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-43664.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-44460.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch-fake-client.cjs-49476.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-dispatch.test.cjs-48512.json` | 1.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-gate.test.cjs-18444.json` | 1.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-handoff-chain.test.cjs-35220.json` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-handoff.test.cjs-29524.json` | 1.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-hooks.test.cjs-17568.json` | 1.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-index.test.cjs-32552.json` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-installer.test.cjs-30532.json` | 1.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-ledger.test.cjs-8496.json` | 1.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-lock.test.cjs-43284.json` | 0.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-manifest.test.cjs-18004.json` | 1.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-no-evidence-client.cjs-23340.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-no-evidence-client.cjs-38096.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-operator.test.cjs-15628.json` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-archive.cjs-22296.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-archive.cjs-25472.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-archive.cjs-36168.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-10088.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-11652.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-12044.json` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-20628.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-20768.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-22436.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-22744.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-2336.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-24388.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-24768.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-25464.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-28824.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-30696.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-30772.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-31012.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-31644.json` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-32204.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-32320.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-33740.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-34292.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-34844.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-35964.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-3800.json` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-38336.json` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-38584.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-39988.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-40176.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-41152.json` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-4156.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-43076.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-43620.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-43632.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-44192.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-45652.json` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-46492.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-49556.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-49620.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-49820.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-dispatch.cjs-8272.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-10216.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-11472.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-12868.json` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-12876.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-12920.json` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-1304.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-13612.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-14508.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-14872.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-15300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-16016.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-16340.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-16548.json` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-16616.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-17024.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-17200.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-17360.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-17800.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-17868.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-18124.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-18176.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-18584.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-18716.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-18912.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-19512.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-19576.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-19712.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-19756.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-19980.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-20524.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-20656.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-20904.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-2108.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-21200.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-21496.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-21620.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-21648.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-21732.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-21748.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-22276.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-22604.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-23104.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-23736.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-23932.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-24260.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-24444.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-25828.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-25992.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-26924.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-26932.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-27036.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-27052.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-27264.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-28072.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-28144.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-28624.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-28720.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-28760.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-29232.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-29248.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-29252.json` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-29432.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-29588.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-29956.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-29960.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-29988.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-30012.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-30280.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-30668.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-30756.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-30768.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-30772.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-30868.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-30992.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-31132.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-31240.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-31604.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-3168.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-31800.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-31932.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-31936.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-31984.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-32056.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-32076.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-32184.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-32192.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-32520.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-32828.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-33644.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-33892.json` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-33900.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-34152.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-34224.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-34268.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-34272.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-34796.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-34984.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35068.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35096.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35224.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35260.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35332.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35392.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35680.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35724.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35740.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-35788.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-36028.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-36092.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-36236.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-36328.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-36452.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-36996.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-37416.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-37464.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-37808.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-37960.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38052.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38100.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38276.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38328.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-3836.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38536.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38544.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38588.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38800.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38872.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-38932.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-39104.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-39268.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-39792.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-39848.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-39852.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-40076.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-40200.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-4024.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-40404.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-40468.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-40764.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-40772.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-40824.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-41024.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-41136.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-41188.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-41276.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-41332.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-41796.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-41800.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-42084.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-42196.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-42596.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-42796.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-42876.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-4328.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-43412.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-43488.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-43792.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-43964.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-44004.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-44456.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-45208.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-45344.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-45356.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-45556.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-46368.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-46436.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-46536.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-46696.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-46700.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-46764.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-4688.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-47540.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-47832.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-47920.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48116.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48204.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48224.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48252.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48328.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48668.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48688.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48720.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48860.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48876.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48912.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-48916.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49028.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49048.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49236.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49492.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49512.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49800.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49896.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49924.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-49948.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-5260.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-5276.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-5648.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-6320.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-6444.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-6536.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-7216.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-7864.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-8344.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-8616.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-9468.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-9608.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-handoff.cjs-9652.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-10412.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-10440.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-10452.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-10496.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-10728.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-10788.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-10884.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-11124.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-12052.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-12836.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-13216.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-13388.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-13620.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-14020.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-15292.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-15296.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-15708.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-1596.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-1600.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17184.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17196.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17204.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17208.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17288.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17352.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17360.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17372.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17704.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-17884.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18024.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18164.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18176.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18448.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18484.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18512.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18628.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18688.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18712.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18716.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18896.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18952.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-18964.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19024.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19252.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19316.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19512.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19540.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19688.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19756.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19816.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-19884.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-20020.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-20088.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-20468.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-20600.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-20812.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-20824.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-20916.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-21108.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-21172.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-21496.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-21564.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-21604.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-21608.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-21748.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-21964.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-2200.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-22012.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-22076.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-22400.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-22744.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-23356.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-23512.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-23704.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-23864.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-23868.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-23960.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24220.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24260.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24284.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24288.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24452.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-2448.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24608.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24812.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24888.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24900.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-24936.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-25912.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-25916.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-25960.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-26256.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-26324.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-26472.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-26572.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-26584.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-27256.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-27316.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-27348.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-27400.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-27788.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-27844.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-27852.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-28256.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-28412.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-28448.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-28844.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-29140.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-29192.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-29492.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-29612.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-2972.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-29736.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-29916.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-30160.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-30300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-30736.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-30756.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-30984.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-31136.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-31268.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-31444.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-31600.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-31704.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-31932.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-31972.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-32196.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-32524.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-32648.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-32976.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33068.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33168.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33256.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33404.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33568.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33604.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33652.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33748.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-33856.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34056.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34112.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34160.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34232.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34272.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34456.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34532.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34604.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34672.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-34848.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35064.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35088.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35124.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35340.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35404.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35536.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35604.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35696.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35756.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-3580.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-35848.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36092.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36212.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36276.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36388.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36588.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36608.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36776.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36940.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-36984.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37116.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37212.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37408.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37428.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37456.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37512.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37540.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37564.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-37708.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38108.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38160.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38252.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38276.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38348.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38476.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38488.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38560.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38592.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38760.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38772.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38860.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-38908.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-39204.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-39236.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-39248.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-39436.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-39532.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-39772.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-39848.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-40140.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-40432.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-40512.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-40516.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-40776.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-40928.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-41128.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-41336.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-41436.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-41792.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-42268.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-4264.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-42796.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-42908.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-42988.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-43124.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-43212.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-43264.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-43268.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-4328.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-43344.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-43476.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-43692.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-43948.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44060.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44176.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44248.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44356.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44368.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44424.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44444.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44456.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44460.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44752.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-44952.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45092.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45096.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45116.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45144.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45156.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45208.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45468.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45560.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45632.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45652.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45712.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45752.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45756.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-45856.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46008.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46072.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46184.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46264.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46304.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46388.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46432.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46472.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46584.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46768.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-46876.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-47080.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-47088.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-47252.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-47416.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-47488.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-4760.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-47704.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-47904.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48056.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48184.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48452.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48508.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48540.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48588.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48608.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48668.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48680.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48716.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48868.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48932.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-48940.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49196.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49204.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49256.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49396.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49476.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49520.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49592.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49636.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49692.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49756.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49800.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49880.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-49996.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-5044.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-5260.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-5480.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-5560.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-6308.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-6432.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-6684.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-6796.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-6900.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-7420.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-7648.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-7676.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-7728.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-7736.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-7768.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-8072.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-8336.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-8440.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-8480.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-8848.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-hooks.cjs-9612.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-index.cjs-33572.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-index.cjs-42816.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-index.cjs-49740.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-ledger.cjs-18676.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-ledger.cjs-20624.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-ledger.cjs-21740.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-ledger.cjs-30628.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-ledger.cjs-38300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-ledger.cjs-45592.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-ledger.cjs-46140.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-10800.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-11232.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-12412.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-12920.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-15300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-16212.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-17704.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-18340.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-19284.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-19292.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-19996.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-20872.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-21620.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-21740.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-21932.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-23048.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-23104.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-23736.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-24432.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-25136.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-26996.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-27104.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-27732.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-27960.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-28072.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-2820.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-28348.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-28764.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-28892.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-28952.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-29140.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-29584.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-30112.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-31620.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-32172.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-32252.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-32748.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-32920.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-34264.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-34984.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-35316.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-36400.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-3676.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-36944.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-37984.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-38232.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-38552.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-3896.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-39208.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-42876.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-4300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-43100.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-43736.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-43796.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-44176.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-44748.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-45356.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-4536.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-45776.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-46788.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-48600.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-48720.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-5236.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-7596.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-8800.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-9468.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-9516.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-lock.cjs-9620.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-runrecord.cjs-10800.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-runrecord.cjs-33568.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-runrecord.cjs-35716.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-runrecord.cjs-38920.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-runrecord.cjs-44204.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-runrecord.cjs-612.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-runrecord.cjs-9628.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-10452.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-10788.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-17448.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-18004.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-19688.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-19828.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-19980.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-20768.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-23764.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-25976.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-26504.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-26548.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-30708.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-30768.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-33940.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-34312.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-34388.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-35996.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-36588.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-37564.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-37644.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-38328.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-39772.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-39908.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-40596.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-42772.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-42860.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-44004.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-44768.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-46204.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-46504.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-47112.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-scope.cjs-48224.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-10884.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-12920.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-13596.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-14496.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-15380.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-16564.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-17052.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-17196.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-17200.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-17312.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-17748.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-18148.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-1912.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-19412.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-19512.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-20232.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-21584.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-25368.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-26076.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-26376.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-26488.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-26800.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-28356.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-28520.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-29900.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-29956.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-3020.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-30992.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-32392.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-3256.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-32920.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-33068.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-33496.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-33788.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-33916.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-35076.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-35404.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-35552.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-35724.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-36388.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-36668.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-37668.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-37892.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-38860.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-39268.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-40164.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-40404.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-40496.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-41100.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-41184.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-42244.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-42476.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-43588.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-44444.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-44692.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-45324.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-45428.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-45468.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-45484.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-45828.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-47096.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-4752.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-47580.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-47964.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-48156.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-48552.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-48844.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-5488.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-6556.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-7348.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-session.cjs-8464.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-10952.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-12356.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-17204.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-17804.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-19508.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-22140.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-22716.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-23356.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-26656.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-28308.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-28864.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-28892.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-32008.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-35052.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-36020.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-36440.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-36912.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-37260.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-38604.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-39176.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-42340.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-44444.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-46064.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-47372.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-48056.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-48224.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-48324.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-48584.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-49112.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-49732.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-49756.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-7320.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-7864.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-signals.cjs-9772.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-10028.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-11888.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-12464.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-13652.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-14020.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-14420.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-16284.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-17052.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-18264.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-18600.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-18680.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-18836.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-19504.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-19688.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-2044.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-20656.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-20820.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-21140.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-21708.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-22056.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-22916.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-23008.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-24264.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-24740.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-24916.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-25712.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-26672.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-27036.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-27788.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-28412.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-28864.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-29580.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-29760.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-30276.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-31728.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-32184.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-33496.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-34296.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-34456.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-34532.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-34604.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-34876.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-3524.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-35328.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-35484.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-36032.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-36472.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-36532.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-36708.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-36724.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-3688.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-37000.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-3784.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-38236.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-38604.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-38752.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-39300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-40148.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-40240.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-40472.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-40484.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-42000.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-42156.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-42732.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-43332.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-43628.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-43684.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-44144.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-44692.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-45120.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-45212.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-45428.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-46428.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-46436.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-46788.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-47096.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-47440.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-47508.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-47512.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-4760.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-48192.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-48264.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-48420.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-48492.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-48932.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-48996.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-5000.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-5248.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-7420.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-8228.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-8276.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol-verdict.cjs-9536.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-10072.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-10304.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-10884.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-11116.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-11548.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-12496.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-12784.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-14364.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-14572.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-15452.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-1612.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-16148.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-16264.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-16744.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-18620.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-18644.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-18896.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-19280.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-19484.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-19648.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-19852.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-20244.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-20560.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-20632.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-20808.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-20816.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-21460.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-21484.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-21924.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-22056.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-22244.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-22300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-22504.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-23068.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-23148.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-23432.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-23704.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-23744.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-24252.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-24500.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-2460.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-25136.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-25240.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-25752.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-25916.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-26004.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-26440.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-2696.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-26996.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-27304.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-28348.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-28360.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-28416.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-28504.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-28800.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-29248.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-29648.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-29960.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-30184.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-30452.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-30624.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-30768.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-30828.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-31092.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-31528.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-31564.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-31932.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-32632.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-32916.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-32920.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-3316.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-33220.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-33328.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-33772.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-33784.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-34008.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-34576.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-34732.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-35440.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-35740.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-36204.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-36660.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-36724.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-37112.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-37392.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-38348.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-38620.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39240.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39300.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39344.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39588.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39692.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39772.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39796.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39952.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39984.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-39996.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-40092.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-40100.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-40148.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-40312.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-40404.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-40604.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-41932.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-41980.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-42024.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-42316.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-42652.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-42816.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-42936.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-43216.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-43476.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-43796.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-43968.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-43972.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-44036.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-44476.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-44608.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-44972.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-45084.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-45372.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-45428.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-45540.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-45744.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-46024.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-46264.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-46316.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-46380.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-46572.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-46584.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-46788.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-46984.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-47016.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-47128.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-47428.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-47552.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-48212.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-48436.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-49024.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-49344.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-49464.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-49960.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-6320.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-7348.json` | 0.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-7464.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-8068.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-9608.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-protocol.cjs-9628.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-registry.test.cjs-22608.json` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-resolver.test.cjs-44784.json` | 0.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-review-findings.test.cjs-38724.json` | 1.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-rulebook.test.cjs-29444.json` | 1.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-runner.cjs-21752.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-runner.cjs-49560.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-runrecord.test.cjs-28268.json` | 0.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-session.test.cjs-34692.json` | 1.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-signals.test.cjs-24428.json` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-upgrade.test.cjs-43056.json` | 1.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-validator-decisions.test.cjs-4412.json` | 1.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-validator-gate.test.cjs-5780.json` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-validator-lightpath.test.cjs-38476.json` | 1.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-validator-syntax.test.cjs-25408.json` | 1.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-validator.test.cjs-37960.json` | 1.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-worker.cjs-15380.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/stats/stats-worker.cjs-36896.json` | 0.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/suite.tap` | 91.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/summary.json` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-perf/PROFILE-1/summary.jsonl` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/2A-RECOVERY3-FALLEN.md` | 1.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/BASELINE.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-CERT-MIMO.md` | 2.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-CERT-SOL.md` | 2.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-CERT2-MIMO.md` | 2.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-CERT2-SOL.md` | 2.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-FIX-REVIEW.md` | 3.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-FIX-ROUND2.md` | 2.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-RECOVERY2.md` | 2.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-RECOVERY3-VIBE.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-RECOVERY3.md` | 3.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A-RESUME.md` | 2.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-2A.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-W1-FIX.md` | 3.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/LAUNCH-W1.md` | 5.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/PACKET-1.md` | 3.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/PROMPT.md` | 12.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/SUPERVISOR-PREREG.md` | 12.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/W1-EXECUTION.md` | 11.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/W1-REVIEW-TASK.md` | 3.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/W2A-EXECUTION.md` | 7.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/W2A-REVIEW-TASK.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-27-roadmap-queue/W2A-REVIEW2-TASK.md` | 2.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/AUTOCYCLE-PROMPT.md` | 26.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/CLAUDE-FINALIZER-START.md` | 3.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/LAUNCH-A1.md` | 4.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/LAUNCH-H1.md` | 5.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/LAUNCH-REGISTRY-FIX-REVIEW.md` | 2.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/LAUNCH-REGISTRY-FIX.md` | 1.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/MEASUREMENTS.jsonl` | 34.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/OWNER-DRAFT.md` | 5.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/OWNER-QUEUE.md` | 7.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/README.md` | 2.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/STATE.md` | 14.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/advisor/001-REPLY.md` | 15.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/advisor/001-REQUEST.md` | 6.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/advisor/002-REPLY.md` | 11.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/advisor/002-REQUEST.md` | 4.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/advisor/ADVISOR-BRIEF.md` | 6.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/advisor/CHANNEL.md` | 4.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/cycles/C01/00-PROMPT.md` | 7.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-autocycle/tools/mailbox.cjs` | 7.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/2026-09-28-bench-catalog/README.md` | 2.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/CLOSURES.jsonl` | 8.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/FRAMES.md` | 10.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-20-cycle-architecture/claude-final-decision.md` | 52.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-20-cycle-history/analyze.cjs` | 5.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-20-cycle-history/evidence.json` | 97.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-22-jev-decision-fabric-evaluation.md` | 95.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-22-kilo-candidate-tool-evaluation.md` | 21.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-r0-decision-dataset/README.md` | 2.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-r0-decision-dataset/archive_classification.csv` | 37.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-r0-decision-dataset/findings.csv` | 2.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-r0-decision-dataset/review_depth.csv` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-r0-decision-dataset/round_outcomes.csv` | 0.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/INDEX-draft.md` | 16.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q01-provider-rotation.md` | 10.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q02-domain-role-specialisation.md` | 11.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q05-escalation-and-attempt-cycles.md` | 16.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q06-jev-offline-decision-forecast.md` | 9.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q08-cost-saving-limits.md` | 6.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q09-predictable-leave.md` | 15.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q10-time-saving.md` | 19.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q11-deputies.md` | 19.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q12-metrics-logging.md` | 12.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q14-certification-model.md` | 32.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-23-routing/Q15-tool-governance.md` | 14.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/MEASUREMENTS.md` | 4.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/OWNER-DECISION-R3.md` | 16.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/OWNER-PROMPT.md` | 25.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/README.md` | 12.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/critique-A-checks.json` | 8.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/critique-A.md` | 29.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/critique-b.md` | 13.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/draft-decision.md` | 49.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/final-plan.md` | 61.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/C-critique.md` | 1.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/C-draft.md` | 1.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/C-final-plan.md` | 1.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/C-revise.md` | 1.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/C-verify.md` | 2.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/COMMON.md` | 8.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/K-dispatch-r2.md` | 2.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/K-dispatch-r3.md` | 1.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/R1-A-contract-tcb.md` | 3.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/R1-B-performance-migration.md` | 2.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/R1-C-adversarial-simplifier.md` | 2.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/R2-challenge.md` | 1.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/R2-issue-matrix.md` | 2.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/R3-ADDENDUM.md` | 3.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/R3-DISPATCH.json` | 4.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/R3-synthesis.md` | 1.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/COMMON-LAUNCH.md` | 1.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/critique-a.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/critique-b.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/draft.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/final.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/r3-a.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/r3-b.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/reverify.md` | 0.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/revise.md` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/verify-repair.md` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/prompts/run-r3/verify.md` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/A-contract-tcb.md` | 19.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/B-baseline-check.json` | 6.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/B-performance-migration.md` | 33.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/C-adversarial-simplifier.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/DECISION-BOUNDARY.md` | 18.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/IMPLEMENTATION-DAG.md` | 25.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/NOT-IN-SCOPE.md` | 1.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/VALIDATOR-CALL-GRAPH.md` | 13.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round1/VALIDATOR-CONTRACT-MAP.md` | 20.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round2/ISSUE-MATRIX.md` | 3.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round2/challenge-A.md` | 16.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round2/challenge-B.md` | 23.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round2/challenge-C.md` | 16.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round3/B-input-check.json` | 13.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round3/CORPUS.txt` | 1.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round3/USAGE.md` | 1.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round3/synthesis-A.md` | 34.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round3/synthesis-B-retry-codex-b256ad8b1a3d1e04.md` | 51.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round3/synthesis-B.md` | 52.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/round3/synthesis-C.md` | 13.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/verification-2.md` | 10.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-validator-migration-council/verification.md` | 9.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/USAGE.md` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/critique.md` | 11.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/positions/A.md` | 8.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/positions/B.md` | 7.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/COMMON.md` | 2.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/CRITIQUE.md` | 0.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/DISCUSS.md` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/DISPATCH.json` | 1.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/SYNTHESIS.md` | 0.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/run/critique.md` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/run/discuss-a.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/run/discuss-b.md` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/prompts/run/synthesis.md` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-25-workflowai-review/synthesis.md` | 14.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/README.md` | 11.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/USAGE.md` | 0.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/prompts/DISPATCH.json` | 1.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/prompts/run/collector-a.md` | 2.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/prompts/run/collector-b.md` | 1.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/prompts/run/verifier.md` | 1.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round1/CITATIONS.md` | 9.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round1/COVERAGE-A.md` | 9.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round1/COVERAGE-B.md` | 10.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round1/COVERAGE.md` | 7.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round1/benchmark-registry.json` | 20.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round1/methodology.md` | 4.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round1/model-benchmark-evidence.jsonl` | 40.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round2/GATE-REPORT.md` | 3.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round2/VERIFICATION.md` | 5.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round2/benchmark-registry.json` | 20.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round2/model-benchmark-evidence.jsonl` | 42.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round2/registry_verification.json` | 2.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round2/row_verification.json` | 6.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-model-layer/round2/verification_plan.json` | 0.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/CORPUS.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/DISPATCH-OWNER.md` | 36.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/README.md` | 5.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/USAGE.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/archive/INDEX.md` | 1.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/archive/SYNTHESIS-2026-09-25-cross-document.md` | 11.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/directives/CLOSURE-DISPOSITION-0085-PROMPT.md` | 18.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/directives/F-02-ADMISSION-PROMPT.md` | 23.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/directives/MASTER-RESUME-AFTER-STAGE4.md` | 11.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/directives/README.md` | 1.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/directives/RESEARCH-GOVERNOR-0.2-PROMPT.md` | 34.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/directives/RESUME-OWNERIDEAS-AFTER-STAGE3.md` | 12.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/CERTIFY.md` | 4.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/CLEANUP.md` | 2.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/COMMON.md` | 2.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/CRITIQUE.md` | 3.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/FINAL-RESOLUTION.md` | 6.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/FIX-STAGE7.md` | 2.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/IMPLEMENT.md` | 2.3 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/IMPLEMENTATION-REVIEW.md` | 1.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/PLAN-AMENDMENT.md` | 1.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/PRE-CHECK.md` | 2.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/R1-REVIEW.md` | 6.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/REPAIR.md` | 2.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/RESOLUTION.md` | 3.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/REVIEW-P-L0-008.md` | 3.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/STREAM-CONT.md` | 1.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/SYNTHESIS.md` | 3.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/prompts/VERIFY.md` | 2.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round1/REVIEW-CLAUDE.md` | 48.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round1/REVIEW-DEEPSEEK.md` | 36.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round1/REVIEW-GEMINI.md` | 47.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round1/REVIEW-MISTRAL.md` | 25.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round2/CORPUS.txt` | 1.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round2/SYNTHESIS-KIMI.md` | 30.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round2/SYNTHESIS-MIMO.md` | 47.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round3/CORPUS.txt` | 2.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round3/RESOLUTION-CLAUDE.md` | 52.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round4/CLEANUP-GEMINI.md` | 3.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round4/PLAN-DEEPSEEK.md` | 28.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round5/CRITIQUE-KIMI.md` | 12.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round5/CRITIQUE-MIMO.md` | 13.1 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round6/FINAL-RESOLUTION-CLAUDE.md` | 34.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round6/packages/PKG-1.md` | 27.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round6/packages/PKG-2.md` | 18.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round6/packages/PKG-3.md` | 24.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round6/packages/PKG-4.md` | 27.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round6/packages/PKG-5.md` | 27.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round7/FIX-CLAUDE.md` | 6.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round7/PRE-CHECK-DEEPSEEK.md` | 11.5 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round7/RECHECK-DEEPSEEK.md` | 6.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-KIMI-PKG2-R2.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-KIMI-PKG2-R3.md` | 6.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-KIMI-W1.md` | 4.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-KIMI.md` | 4.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-MIMO-PKG2-R2.md` | 5.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-MIMO-PKG2-R3.md` | 9.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-MIMO-W1.md` | 7.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/CERT-MIMO.md` | 8.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/IMPLEMENT-E1-GEMINI.md` | 19.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/IMPLEMENT-E2-MISTRAL.md` | 25.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round8/IMPLEMENTATION-REVIEW-DEEPSEEK.md` | 11.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/FINAL-DEEPSEEK.md` | 13.4 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/PROCESS-STATE.md` | 2.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/REPAIR-HYGIENE-GEMINI.md` | 14.0 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/REPAIR-PKG2-GEMINI.md` | 7.6 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/REPAIR-PKG2-R3-GEMINI.md` | 8.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/REPAIR-PKG5-GEMINI.md` | 9.2 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/REPAIR-USAGE-GEMINI.md` | 8.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/STAGE12-READY.md` | 4.8 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/2026-09-26-ownerideas-revision/round9/VERIFY-SOL.md` | 6.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/CLOSURE-MANIFEST-2026-09-26.md` | 6.9 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/research/archive/INDEX.md` | 3.7 KB | исследовательские материалы (roadmap, autocycle) |
| `docs/reviews/2026-09-16-council-review.md` | 3.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-17-three-repository-review.md` | 13.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-18-grand-council-consensus-v1.9.0.md` | 8.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-deepseek-flash-c1-audit-addendum.md` | 1.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-deepseek-flash-c1-audit.md` | 4.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-deepseek-flash-certification-adjudication.md` | 8.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-deepseek-flash-item6-audit.md` | 5.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-deepseek-flash-mcp-selection-analysis.md` | 16.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-deepseek-flash-stop-cycle-fix-audit.md` | 2.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-deepseek-flash-trackc-audit.md` | 3.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-final-v1.9.5-adversarial-review-prompt.md` | 7.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-h1-pilot-design.md` | 17.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-h1-pilot-report-correction.md` | 3.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-mistral-vibe-v1.9.5-certification.md` | 8.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-owner-rulings-course-correction.md` | 3.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-qoder-trackc-h1-audit.md` | 6.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-qoder-v1.9.5-certification.md` | 4.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-19-track-c-h1-external-audit-prompt.md` | 6.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-claude-paired-cycle-wave-c-final-spot.md` | 12.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-claude-paired-cycle-wave-c-re-review.md` | 17.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-codex-cycle-final-council-prompt.md` | 8.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-codex-cycle-history-research.md` | 25.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-codex-cycle-improvement-plan.md` | 25.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-codex-independent-mcp-architecture-audit.md` | 10.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-codex-paired-cycle-remediation-reaudit.md` | 22.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-codex-paired-cycle-review.md` | 28.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-deepseek-cycle-closure-review-round2.md` | 13.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-deepseek-flash-paired-cycle-review.md` | 19.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-deepseek-gemini-cycle-architecture-dispatch.md` | 21.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-deepseek-gemini-paired-cycle-remediation-prompt.md` | 18.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review-addendum.md` | 3.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-deepseek-paired-cycle-wave-c-review-round2.md` | 4.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-gemini-cycle-architecture-adversarial-prompt.md` | 7.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-gemini-paired-cycle-remediation-adversarial-prompt.md` | 6.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-gemini-paired-cycle-review.md` | 7.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-20-mcp-council-final-round2-synthesis.md` | 16.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-21-claude-cycle-architecture-certification-round2.md` | 8.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-21-claude-cycle-architecture-certification-round3.md` | 4.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-21-claude-cycle-architecture-reverification.md` | 6.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-21-codex-cycle-architecture-certification-round3.md` | 3.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-21-codex-cycle-architecture-certification-round5.md` | 3.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-22-claude-layers-abc-adversarial-prompt.md` | 8.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-22-deepseek-layers-abc-certification.md` | 14.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-22-gemini-layers-abc-certification.md` | 8.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-batch-findings-round3.md` | 2.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-batch-findings.md` | 5.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-claude-batch-certification-round2.md` | 15.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-claude-batch-certification-round3.md` | 13.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-claude-batch-certification.md` | 13.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-codex-batch-certification-round3.md` | 13.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-codex-batch-certification.md` | 19.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-codex-path-contract-assessment-prompt.md` | 1.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-codex-path-contract-assessment.md` | 9.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-codex-routing-architecture-prompt.md` | 1.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-codex-routing-architecture.md` | 21.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-deepseek-batch-certification-round2.md` | 14.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-deepseek-batch-certification-round3.md` | 10.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-deepseek-batch-certification.md` | 10.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-gemini-batch-adversarial-prompt.md` | 6.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-23-mistral-shadow-certification-round3.md` | 5.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-claude-core-arch-stage1-control-prompt.md` | 7.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-claude-core-arch-stage1-fix-response-r2.md` | 3.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-claude-core-arch-stage1-fix-response.md` | 7.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-claude-core-arch-stage1-recheck-prompt.md` | 3.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-claude-core-arch-stage1-recheck2-prompt.md` | 2.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-claude-core-arch-stage1-t07-t10-fix-response.md` | 6.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-claude-core-arch-stage1-t07-t10-review-prompt.md` | 4.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-core-arch-stage1-findings.md` | 16.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-deepseek-core-arch-stage1-control-r2.md` | 7.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-deepseek-core-arch-stage1-control-r3.md` | 4.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-deepseek-core-arch-stage1-control.md` | 17.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-deepseek-core-arch-stage1-recheck.md` | 8.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-deepseek-core-arch-stage1-recheck2.md` | 4.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-deepseek-core-arch-stage1-t07-t10-review-r2.md` | 10.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-24-deepseek-core-arch-stage1-t07-t10-review.md` | 12.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response-addendum-1.md` | 10.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response-addendum-2.md` | 7.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-claude-core-arch-stage2-fix-response.md` | 19.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-claude-core-arch-stage2-review-prompt.md` | 7.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-claude-stage2-and-launch-review-prompt.md` | 8.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-core-arch-stage2-findings.md` | 11.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-deepseek-core-arch-L-correction-4-response.md` | 15.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-attempt2.md` | 12.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review-packageL-third-pass.md` | 17.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-deepseek-core-arch-stage2-review.md` | 13.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-deepseek-research-launch-review-attempt2.md` | 16.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-deepseek-research-launch-review.md` | 16.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-gemini-core-arch-L-correction-4-audit.md` | 8.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-25-mistral-core-arch-L-correction-4-audit.md` | 9.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-26-gemini-ownerideas-pkg-1-audit-prompt.md` | 4.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-26-gemini-ownerideas-pkg-3-audit-prompt.md` | 5.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-26-gemini-ownerideas-pkg-5-audit-prompt.md` | 4.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-26-mistral-ownerideas-pkg-2-audit-prompt.md` | 7.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-26-mistral-p-l0-008-0.2-review.md` | 18.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-26-mistral-p-l0-008-0.3-f02-admission-review.md` | 1.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-26-mistral-p-l0-008-0.4-closure-review.md` | 9.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-claude-f01-stage12-closure.md` | 11.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-claude-powershell-refactor-assessment.md` | 17.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-consensus-round-discussion.md` | 8.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-deepseek-perf-wave1-review.md` | 11.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-deepseek-roadmap-2a-review.md` | 11.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-deepseek-roadmap-w1-review.md` | 15.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-m1-consensus-discussion.md` | 12.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-profile1-consensus-discussion.md` | 14.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-round4-consensus-discussion.md` | 12.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-round5-consensus-discussion.md` | 15.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-round6-consensus-inputs.md` | 22.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-27-round6-consensus-task.md` | 2.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-28-deepseek-2a-fix-review.md` | 12.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-28-deepseek-registry-fix-review.md` | 8.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-28-mimo-wave2a-certification-r2.md` | 16.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-28-mimo-wave2a-certification.md` | 13.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-28-sol-wave2a-certification-r2.md` | 8.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-28-sol-wave2a-certification.md` | 9.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/2026-09-28-vibe-wave2a-adversarial-prompt.md` | 8.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-12-claude-v1.2-audit.md` | 24.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-adversarial-audit-v1.9.4.md` | 4.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-claude-opus-v1.9.3-audit.md` | 18.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-claude-v1.9.3-audit.md` | 7.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-codegeex-audit-v1.9.md` | 4.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-copilot-audit-v1.9.3-audit.md` | 5.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-copilot-audit-v1.9.md` | 10.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-copilot-consensus-critical-analysis.md` | 10.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-copilot-sdk-adversarial-audit-v1.9.4.md` | 11.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-audit-v1.9.md` | 22.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-adversarial-audit-v1.9.3.md` | 18.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-consensus-verification.md` | 9.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-p1-gate-review.md` | 6.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-p2-gate-review.md` | 6.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-p2-regate-review.md` | 4.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-p2f3-p1-regate-review.md` | 4.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-p3-gate-review.md` | 3.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-p4-gate-review.md` | 3.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-p5-gate-review.md` | 4.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-p5-regate-review.md` | 4.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-performance-analysis.md` | 14.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-v1.9.3-audit-r2.md` | 28.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-v1.9.3-audit.md` | 24.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-v1.9.4-consolidated-final-plan.md` | 19.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-deepseek-flash-v1.9.4-final-hardening-plan.md` | 20.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-gemini-v1.9.3-audit.md` | 17.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-gemini-v1.9.4-adversarial-audit.md` | 13.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-grand-adversarial-consensus-v1.9.4.md` | 13.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-mistral-medium-3.5-adversarial-audit-v2.md` | 21.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-mistral-medium-3.5-adversarial-audit.md` | 14.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-mistral-vibe-audit-v1.9.md` | 13.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-mistral-vibe-v1.9.3-audit.md` | 20.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-multi-model-consensus-refutation.md` | 5.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-performance-analysis.md` | 12.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-qwen-audit-v1.9.md` | 3.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-qwen-hostile-audit-v1.9.3.md` | 7.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-qwen-v1.9.3-audit.md` | 11.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-unified-adversarial-audit-prompt.md` | 11.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-18-v1.9.4-final-adversarial-audit-prompt.md` | 12.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-claude-opus-delta-certification-request.md` | 2.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-claude-opus-v1.9.5-certification.md` | 12.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-claude-opus-v1.9.5-delta-certification.md` | 8.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-claude-v1.9.4-release-certification.md` | 10.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-codex-trackc-h1-audit.md` | 22.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-codex-trackc-h1-probes.cjs` | 9.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-copilot-v1.9.4-release-certification.md` | 5.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-council-synthesis-course-correction.md` | 12.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-course-correction-adversarial-audit-prompt.md` | 5.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-course-correction-certification-round2.md` | 12.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-course-correction-certification.md` | 12.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-a1-audit.md` | 9.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-a2-audit-addendum.md` | 5.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-a2-audit.md` | 7.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-a3-audit.md` | 6.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-a3-reaudit.md` | 4.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-a4-audit.md` | 5.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-a5-b-audit-addendum.md` | 2.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-a5-b-audit.md` | 5.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-c1a-audit.md` | 3.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-certification-integrity-and-consolidation.md` | 9.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-ci-hotfix-audit.md` | 3.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-consolidated-v1.9.5-plan-r2.md` | 31.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-final-followup-plan-v1.9.5.md` | 15.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-final-plan-probe-review.md` | 26.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-interim-council-plan-review.md` | 14.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-interim-council-plan.md` | 7.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-interim-plan-addendum-context-and-decision-freeze.md` | 5.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-release-tag-erratum.md` | 2.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-systemic-audit-response.md` | 14.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-deepseek-flash-v1.9.4-adversarial-support.md` | 7.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-eval-p1-owner-approval.md` | 17.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-eval-p2-decision-maker.md` | 26.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-eval-p3-architect-choice.md` | 22.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-eval-p4-directive-execution.md` | 19.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-final-course-decision-prompt.md` | 11.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-final-plan-adversarial-review-prompt.md` | 6.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-c1-docfix-prompt.md` | 1.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-c1-instrumentation-prompt.md` | 5.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-c1a-prompt.md` | 3.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-ci-hotfix-prompt.md` | 2.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-course-correction-implementation-prompt.md` | 10.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-course-correction-implementation-report.md` | 11.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-final-plan-adversarial-review.md` | 19.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-interim-plan-adversarial-review.md` | 22.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-mcp-candidates-deep-research.md` | 30.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-opus-final-plan-adversarial-review.md` | 27.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-remediation-advice.md` | 11.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-stop-cycle-fix-prompt.md` | 2.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-systemic-repository-audit.md` | 26.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-trackc-h1-audit.md` | 14.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-trackc-m0-c2-prompt.md` | 4.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.4-release-audit.md` | 9.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-certification.md` | 14.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-implementation-prompt.md` | 10.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-item2-prompt.md` | 6.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-item3-prompt.md` | 3.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-item4-prompt.md` | 6.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-item4-remediation-prompt.md` | 3.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-item5-prompt.md` | 6.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-item5-testfix-prompt.md` | 1.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-gemini-v1.9.5-item6-remediation-prompt.md` | 4.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-glm-final-plan-adversarial-review.md` | 9.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-grand-consensus-systemic-course-correction-v2.md` | 16.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-grand-consensus-systemic-course-correction.md` | 17.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-h1-pilot-cost-policy-addendum.md` | 2.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-h1-pilot-postmortem-and-repomix-paths.md` | 4.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-h1-pilot-report.md` | 4.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-h1-pilot-runbook-addendum-agents.md` | 2.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-h1-pilot-runbook.md` | 4.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-h1-pilot-smoke-report.md` | 4.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-h1-pilot-trial-prompt-template.md` | 7.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-interim-plan-adversarial-review-prompt.md` | 8.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-mcp-context-layer-discussion-basis.md` | 9.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-mistral-mcp-candidates-research.md` | 25.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-mistral-vibe-final-v1.9.5-followup-plan-review.md` | 42.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-mistral-vibe-interim-council-plan-review.md` | 29.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-mistral-vibe-v1.9.4-release-certification.md` | 15.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-open-disagreements-prompt.md` | 3.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-owner-release-tag-decision.md` | 1.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-owner-run-policy.md` | 1.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-qoder-adversarial-review-v1.9.5.md` | 6.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-remediation-council-prompt.md` | 3.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-systemic-course-correction-prompt.md` | 7.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-universal-council-prompt-mcp-context-layer.md` | 7.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-v2-arms-thresholds-discussion.md` | 3.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-19-v2-remediation-plan.md` | 7.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-claude-cycle-architecture-statistical-audit.md` | 16.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-claude-paired-cycle-wave-c-re-review-round2.md` | 18.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-codex-cycle-architecture-certification-round2.md` | 6.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-codex-cycle-architecture-certification.md` | 6.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-codex-paired-cycle-audit-prompt.md` | 2.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-cycle-architecture-council-prompt.md` | 10.8 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-cycle-architecture-review.md` | 5.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-cycle-closure-review.md` | 14.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-gemini-cycle-resume-prompt.md` | 6.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-gemini-wave-c-remediation-prompt.md` | 19.5 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-paired-cycle-remediation-dispatch.md` | 7.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-paired-cycle-remediation-review.md` | 4.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-paired-cycle-wave-a-review-round2.md` | 2.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-paired-cycle-wave-a-review.md` | 4.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-paired-cycle-wave-b-review.md` | 3.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-deepseek-paired-cycle-wave-c-review.md` | 3.7 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-final-cycle-architecture-adversarial-prompt.md` | 7.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-final-cycle-architecture-strategy.md` | 19.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-gemini-cycle-architecture-adversarial-review.md` | 14.3 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-gemini-cycle-closure-report.md` | 9.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-mcp-architecture-council-prompt.md` | 6.6 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-mcp-council-round2-synthesis.md` | 7.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-mcp-research-consolidation.md` | 14.1 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-20-mcp-stack-council-round1-prompt.md` | 10.4 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-21-claude-cycle-architecture-certification.md` | 12.2 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-21-codex-cycle-architecture-certification-round4.md` | 3.9 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/2026-09-24-claude-core-arch-stage0-1-review-prompt.md` | 6.0 KB | ревью, аудиты и сертификаты |
| `docs/reviews/archive/INDEX.md` | 24.2 KB | ревью, аудиты и сертификаты |
| `docs/specs/2026-09-23-executable-rulebook-spec.md` | 11.5 KB | спецификации |
| `docs/specs/bin-output-schema.md` | 2.4 KB | спецификации |
| `docs/specs/run-record.schema.md` | 9.6 KB | спецификации |
| `docs/specs/signals-ledger.md` | 3.2 KB | спецификации |
| `test-protocol.ps1` | 1.4 KB | полный регрессионный набор (source) |
| `tests/archive.test.cjs` | 16.1 KB | регрессионный набор (source-роль) |
| `tests/codex.test.cjs` | 6.6 KB | регрессионный набор (source-роль) |
| `tests/context-policy.test.cjs` | 1.4 KB | регрессионный набор (source-роль) |
| `tests/dispatch-fake-client.cjs` | 6.3 KB | регрессионный набор (source-роль) |
| `tests/dispatch.test.cjs` | 69.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/R3-DISPATCH.json` | 4.7 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/hang-launch.md` | 0.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/t21-launch.md` | 0.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/usage/codex.log` | 0.1 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/usage/copilot.log` | 0.1 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/usage/kilo.log` | 0.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/usage/mimo.log` | 0.1 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/usage/negative.log` | 0.1 KB | регрессионный набор (source-роль) |
| `tests/fixtures/dispatch/usage/no-usage.log` | 0.1 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/DISPATCH.json` | 15.4 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r1-claude.md` | 0.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r1-deepseek.md` | 0.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r1-gemini.md` | 0.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r1-mistral.md` | 0.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r12-final-deepseek.md` | 3.5 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r12-gate-commit.md` | 0.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r2-kimi.md` | 1.1 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r2-mimo.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r3-claude.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r3-clean-gemini.md` | 0.8 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r3-plan-deepseek.md` | 1.5 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r4-mistral-review.md` | 0.7 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r5-kimi-critique.md` | 0.8 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r5-mimo-critique.md` | 0.7 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r6-claude-final.md` | 1.6 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r6-review-p-l0-008-0.3.md` | 1.6 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r7-precheck-deepseek.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r7-review-p-l0-008-0.4.md` | 1.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r7b-claude-fix.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r7c-deepseek-recheck.md` | 1.3 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8-cert-kimi.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8-cert-mimo.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8-exec-e1.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8-exec-e2.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8-review-deepseek.md` | 1.1 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8b-cont-e1.md` | 0.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8b-cont-e2.md` | 0.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8d-cert-kimi-pkg2.md` | 1.5 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8d-cert-mimo-pkg2.md` | 1.6 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8e-cert-kimi-pkg2.md` | 1.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r8e-cert-mimo-pkg2.md` | 1.8 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r9-repair-gemini.md` | 1.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r9-verify-codex.md` | 0.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r9b-repair-pkg5.md` | 1.4 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r9c-repair-hygiene.md` | 5.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r9d-repair-pkg2.md` | 2.4 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r9e-repair-pkg2-r3.md` | 2.3 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r9f-repair-usage.md` | 3.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/prompts/run/r9g-freeze-candidate.md` | 3.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/resolver/fixture-dispatch.json` | 2.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/resolver/fixture-ladder.json` | 3.9 KB | регрессионный набор (source-роль) |
| `tests/fixtures/resolver/launch.md` | 0.0 KB | регрессионный набор (source-роль) |
| `tests/fixtures/resolver/real-ladder.json` | 0.4 KB | регрессионный набор (source-роль) |
| `tests/fixtures/runrecord/golden.jsonl` | 3.4 KB | регрессионный набор (source-роль) |
| `tests/fixtures/runrecord/golden.md` | 0.4 KB | регрессионный набор (source-роль) |
| `tests/fixtures/runrecord/pattern-test.jsonl` | 1.6 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/bad-cost.md` | 0.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/bad-date.md` | 0.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/bad-disposition.md` | 0.3 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/dotdot-path.md` | 0.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/extra-field.md` | 0.3 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/golden.md` | 0.8 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/immutable-field.md` | 0.4 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/missing-field.md` | 0.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/unknown-type.md` | 0.2 KB | регрессионный набор (source-роль) |
| `tests/fixtures/signals/wrong-separator.md` | 0.2 KB | регрессионный набор (source-роль) |
| `tests/gate.test.cjs` | 38.8 KB | регрессионный набор (source-роль) |
| `tests/handoff-chain.test.cjs` | 24.0 KB | регрессионный набор (source-роль) |
| `tests/handoff.test.cjs` | 31.7 KB | регрессионный набор (source-роль) |
| `tests/helpers.cjs` | 5.7 KB | регрессионный набор (source-роль) |
| `tests/hooks.test.cjs` | 21.7 KB | регрессионный набор (source-роль) |
| `tests/index.test.cjs` | 3.3 KB | регрессионный набор (source-роль) |
| `tests/installer.test.cjs` | 16.6 KB | регрессионный набор (source-роль) |
| `tests/ledger.test.cjs` | 8.1 KB | регрессионный набор (source-роль) |
| `tests/lock.test.cjs` | 18.9 KB | регрессионный набор (source-роль) |
| `tests/manifest.test.cjs` | 14.2 KB | регрессионный набор (source-роль) |
| `tests/operator.test.cjs` | 1.5 KB | регрессионный набор (source-роль) |
| `tests/registry.test.cjs` | 7.1 KB | регрессионный набор (source-роль) |
| `tests/resolver.test.cjs` | 13.0 KB | регрессионный набор (source-роль) |
| `tests/review-findings.test.cjs` | 12.8 KB | регрессионный набор (source-роль) |
| `tests/rulebook.test.cjs` | 57.4 KB | регрессионный набор (source-роль) |
| `tests/runrecord.test.cjs` | 28.2 KB | регрессионный набор (source-роль) |
| `tests/session.test.cjs` | 37.7 KB | регрессионный набор (source-роль) |
| `tests/signals.test.cjs` | 17.6 KB | регрессионный набор (source-роль) |
| `tests/upgrade.test.cjs` | 9.5 KB | регрессионный набор (source-роль) |
| `tests/validator-decisions.test.cjs` | 12.3 KB | регрессионный набор (source-роль) |
| `tests/validator-gate.test.cjs` | 7.1 KB | регрессионный набор (source-роль) |
| `tests/validator-lightpath.test.cjs` | 11.8 KB | регрессионный набор (source-роль) |
| `tests/validator-syntax.test.cjs` | 5.2 KB | регрессионный набор (source-роль) |
| `tests/validator.test.cjs` | 8.4 KB | регрессионный набор (source-роль) |
| `tools/perf/README.md` | 2.9 KB | инструменты |
| `tools/perf/baseline-2026-09-27.json` | 2.6 KB | инструменты |
| `tools/perf/bench.cjs` | 7.0 KB | инструменты |
| `tools/perf/evidence-history.cjs` | 2.0 KB | инструменты |
| `tools/perf/fixtures.cjs` | 7.1 KB | инструменты |
| `tools/perf/gate-slice.cjs` | 11.5 KB | инструменты |
| `tools/perf/lib.cjs` | 3.0 KB | инструменты |
| `tools/perf/preload.cjs` | 5.2 KB | инструменты |
| `tools/perf/ps-profile.cjs` | 8.5 KB | инструменты |
| `tools/perf/report.cjs` | 8.2 KB | инструменты |
