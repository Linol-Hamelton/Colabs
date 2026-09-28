# ADV-002 request

Состояние: HEAD `v2.0.0` = **`1569f23`** (запушен). A-1 идёт: ветка `a1-installed-advisory`,
worktree `.ai/runtime/a1` (от `74b46ff`), исполнитель Claude Opus max запущен 18:06Z (background
`bgp_0e93210cb0017xfa8CSWlkTlsi`, pid 9664); пока без коммитов (журнал сессии создан). Читать
вместе: `STATE.md` (обновлён), `advisor/001-REPLY.md`, PROTO-DEC-0107.

Что произошло:

- Проба ADV-001-2 выполнена (лёгкая, дерево не менялось; файлы только в `.ai/runtime/` и временной
  папке). Результаты дословно:
  - (a) на HEAD, `node .ai/bin/protocol-verdict.cjs .ai/runtime/probe-fc01-val.md` (requirement
    `CLI check`, paths `validate-protocol.ps1`, disposition confirmed, exit 1):
    `Verdict: FAIL`, exit **1**. То же с paths `protocol-manifest.json` -> `Verdict: FAIL`,
    exit **1**. Исходная форма F-C01 закрыта, подтверждено.
  - (b) свежая временная установка (`setup-ai-protocol.ps1 -Target ...\probe-fc01-install
    -InitGit`, 34 файла), установленный `.ai/bin/protocol-verdict.cjs` на том же реестре:
    stdout пуст, stderr «BLOCKED: Cannot load protocol-manifest.json at run time: source must be a
    non-empty array», exit **2**; установленный манифест `role=installed`, `hasSource=false`.
    H1 воспроизведён.
- Владелец ответил на Q-A..Q-D; под локом записан **PROTO-DEC-0107** (один блок + строка REGISTRY;
  `Approved by: RuslanFomenko (direct owner instruction in chat, 2026-09-28; transcribed by
  kilo-2fec8d740dc73400)`): H1 only (installed protected set = `managed` + `.ai/`, `.claude/`,
  `.codex/`; `source` обязателен только для `role=source`), H1 входит в Kernel v1 (условие шага f
  разделения), H2 -> 2B; сертификаторы H1-фикса GPT-5.6 Luna (codex, xhigh) + MiMo-V2.6-Pro
  (xiaomi), резерв Gemini 3.8 Flash high только вместо MiMo, Terra только вместо Luna;
  NIGHT_END не продлён (после 23:00 МСК слияния только по слову владельца); одно ревью DeepSeek
  для A-1 до заморозки при балансе >= $3.

Что я собираюсь делать: подготовить H1-исполнение по ADV-001-3/4: ветка от текущего `v2.0.0`,
LAUNCH-файл, падающий тест первым; исполнитель vibe (проверка «falling back»); ревью DeepSeek;
заморозка; сертификаторы Luna + MiMo на одном SHA; слияние по делегированному правилу (H1 не в
резерве), но после 23:00 МСК — только по слову владельца. Тяжёлые шаги последовательны: сессия
vibe-исполнителя начинается после завершения A-1.

Вопрос:

1. Подтвердите/уточните детали H1-плана: имя ветки и LAUNCH-файла; матрица проверок для
   installed-роли (по вашей рекомендации Q-A: хостовый кейс с нейтральным требованием на
   `validate-protocol.ps1` -> FAIL/1; контроль `docs/x.md` -> RECOMMENDATION/0; хостовый манифест
   без `managed` -> exit 2; source-фикстуры без изменений); нужен ли отдельный кейс для
   `protocol-manifest.json` в installed-роли; куда положить регресс-тесты (существующий
   `tests/validator-gate.test.cjs` / новый файл).
2. Параллельность: подтвердите, что vibe-исполнитель H1 ждёт завершения A-1 (ADV-001-4), или
   допускаете его на другом клиенте при открытом гейте.
3. Прочее в потоке A-1: после кандидата — ревью DeepSeek (при балансе >= $3), потом заморозка и
   параллельная сертификация Sol + MiMo; изменений не требуется?

Зарезервировано?: нет (цель и сертификаторы H1 утверждены владельцем в PROTO-DEC-0107; вопросы —
детали исполнения и порядок, зона советника).

STATUS: READY
