# Eval P3 - ответ главного архитектора: выбор по курсу «Protocol Ouroboros»

**Date**: 2026-09-19
**Reviewed commit**: d38d2f2 (working tree dirty; чтение по дереву на диске)
**Session**: deepseek-flash (evaluation session, Agent Manager)
**Scope**: оценка формулировки p3, решение по четырём действиям, проверка фактов по D:\Colabs
**Mode**: ADVISORY (evaluation freeze; не receipt, не сертифицирует, в протокол не пишет)
**Verdict**: **ACCEPT WITH AMENDMENTS** - принять действия 1, 2, 4 в исправленной форме; действие 3 переформулировать

## 1. Выбор

Принимаю решение по существу: **немедленная остановка Track C и Pilot v2, без B2/B3/B4/C2; архивация исторических обзоров; возврат к продуктам**. Диагноз «самореферентная бюрократия» подтверждается не риторикой, а измеримыми фактами (раздел 6): 35 коммитов за 48 ч, 89 файлов обзоров за 09-19, ноль продуктовых коммитов, незакрытое внешнее аудит-раунд. Единственное действие, которое я не принимаю в предложенной редакции - №3 «остановить скачивание моделей»: скачивать уже нечего, обе модели лежат в Ollama целиком. Это не альтернатива решению, а исправление трёх формулировок, без которых исполнение породит те самые отказы, от которых мы уходим: сломанные receipt'ы, пивот поверх незакоммиченной работы, удаление данных под видом «упрощения».

Три поправки, которые я считаю обязательными:

1. **Cleanup раньше записи evidence, а не наоборот.** Любой перенос файлов меняет tree digest и делает live receipt'ы stale (`verify` падает на сдвинутом дереве). Порядок: классификация -> один batch-перенос -> doctor/gate-check -> один ordered record pass на финальном дереве. Слепой `move` до record-прохода - это Scenario 2 из council (broken gate-check, stale receipts), а не упрощение.
2. **Пивот начинается с триажа, а не с новой задачи.** У Block-Puzzle 43 изменённых файла, у VPN 34; продуктовый код не писался с 17.09, но работа припаркована в рабочих деревьях. «Назначить задачу» поверх 77 грязных файлов - это второй незакрытый фронт, а не фокус.
3. **«Радикальное упрощение» - отдельное действие, а не следствие остановки.** Ни одно из четырёх действий не упрощает протокол: ядро как было 2,826 строк .cjs, так и останется, плюс 17 тестовых файлов (4,441 строка) и validate-protocol.ps1 (744 строки). Без явного scope v2.0 (Node-валидатор, разрыв цикла require, разделение protocol-handoff.cjs) заморозка означает лишь «перестали трогать», а не «стало проще».

## 2. Почему именно так

- **Stop rule - это обязательство.** `PROTO-DEC-0035`: «if Arm B breaches any threshold, ... terminate without MCP adoption». Arm B нарушил порог (broad total +72.79% против требуемых -25%, narrow total +60.20% против +5%). Отказ от исполнения pre-registered правила обесценивает весь evidence-режим: следующему отрицательному результату просто не поверят.
- **Арифметика этой репозитории не оставляет места для B2/B3/B4.** Digest ~88k токенов против 45,470-73,269 fresh токенов работы. B2 («grep по digest, не читать целиком») технически снимает возражение «88k в контексте», но не даёт выигрыша: исходники и так машинно-поисковы на том же уровне гранулярности, а генерация digest - чистая дополнительная стоимость. Продолжение - sunk cost, а не эксперимент.
- **Реальная причина context crisis - не ядро ~21k, а корпус.** 1.30 МБ обзоров, ни одного бюджета (`PROTO-DEC-0026` дал `docs/reviews/` постоянный статус без лимита). Пилот Repomix лечил симптом не той болезни.
- **`PLAN.md` - единственная непроверенная гипотеза проекта.** «Find out whether this protocol reduces rework ... before building anything further for it» (PLAN.md:51-54) и метрики из PLAN.md:63-68 не запускались ни разу. Приоритет «продукты» - это возврат к главному тесту, а не отказ от протокола.

## 3. Что я принимаю по четырём действиям (исправленная редакция)

| # | Промпт | Моя редакция | Дельта-стоимость |
|---|---|---|---|
| 1 | Закрыть Repomix/Track C навсегда, не запускать B2/B3/B4/C2 | Закрыть **для этой репозитории**; документацию advisory-хелпера (`PROTO-DEC-0034`) не удалять; reopen только по `owner-directive` (см. §5 falsifier) + отдельно для больших consumer-репозиториев | 0; одна новая decision-запись |
| 2 | Архивировать >100 файлов из docs/reviews/ | Classify-first: не переносить файлы, цитируемые живыми receipt'ами; один batch + `docs/reviews/archive/INDEX.md` (old -> new); после переноса - doctor + gate-check + один record pass; никогда не удалять, только archive; лимит корпуса в AGENTS.md - отдельным owner-approved решением | ~3-5 ч работы; один re-record; риск stale receipt'ов до record pass |
| 3 | Остановить скачивание omnicoder-2-9b и qwen3:8b | Скачивать нечего: обе модели уже в Ollama (5.7 GB + 5.2 GB). Решение: **не запускать v2-бенчмарки на 8-9B** (variance, выброс 2,306 с); keep-or-remove - только вопрос диска (~11 GB), destructive-операции отложить до конца freeze | 0; опционально `ollama rm` позже |
| 4 | Вернуться к продуктам, назначить задачу | Триаж сначала: по одному репозиторию (первый - Block-Puzzle, ветка `dec-0024/av-polish`): прочитать diff, finish-or-revert, прогнать тесты продукта, один коммит. Затем - пилот `PLAN.md` (10-20 задач, метрики согласованы **до** первой задачи, контроль «one task file + one handoff note»). Owner называет первую цель и метрики письменно (PLAN.md:98-101 до сих пор не выполнено) | ~0.5 дня триажа; без него пивот стартует поверх 43 dirty-файлов |

Альтернативу «оставить один дешёвый прогон B3» я отклоняю: он не меняет решения, но снова открывает цикл и съедает внимание, нужное пилоту. Если owner всё же хочет дословного закрытия - это допустимо, но тогда фиксируйте это как documentary closure, а не как поиск истины.

## 4. Draft decision block (English; for owner approval only)

```markdown
### PROTO-DEC-0036 (draft)

Status: Proposed
Date: 2026-09-19
Reopen-trigger: owner-directive

Context:
The H1 pilot refuted the tested Repomix injection pattern: broad total tokens +72.79%,
narrow total +60.20%, against pre-registered thresholds (>= 25% broad reduction,
<= +5% narrow regression). PROTO-DEC-0035's stop rule was executed on the letter
(no MCP, no Arm C). Follow-on arms B2/B3/B4/C2 on 8-9B local subjects would add
variance, not information: the ~88k digest exceeds the 45-73k fresh-token work it
was meant to save, and this repository's sources are already searchable at the
same granularity. Separately, the review corpus (131 files, ~1.30 MB) is the
dominant context cost; the ~21k-token kernel is not.

Decision:
1. Terminate the Repomix index/MCP track for this repository: no arms B2, B3, B4, C2.
   Keep the on-demand advisory CLI documentation of PROTO-DEC-0034; nothing is
   auto-injected, hooked, or a gate input.
2. Review-corpus budget: classify docs/reviews/, move non-active historical
   material to docs/reviews/archive/ with INDEX.md (old -> new paths), preserve
   every review cited by a live receipt until it is re-recorded. Cleanup happens
   before the final evidence pass, not after.
3. Local subjects: do not run multi-step Git benchmarks on 8B/9B Ollama models.
   Keeping or removing the already-downloaded models is an owner disk decision,
   not a pilot requirement.
4. Product pivot: freeze protocol meta-features (P0 fixes and audit closure only).
   Triage the uncommitted work in D:\Block-Puzzle and D:\VPN first, then run the
   .ai/PLAN.md product pilot with metrics agreed before the first task.
5. v2.0 scope: architectural simplification only (single Node validator, break
   the require cycle, split protocol-handoff.cjs); no new gates or enforcement.

Reasoning:
Honoring pre-registered negative results protects the credibility of every future
measurement. The protocol exists to be tested on product work; PLAN.md:51-54 has
never been executed. Corpus growth, not kernel size, caused the context shortage.

Alternatives rejected:
- Running B2..C2: low information, high variance, sunk-cost escalation.
- Mass move/delete of docs/reviews/: breaks receipt path binding (PROTO-DEC-0032)
  and immutability of historical records (PROTO-DEC-0026).
- Immediate hard purge of receipts/validator/crypto layers: destroys verified
  mechanisms (journal partitioning, tree-anchored evidence, false-green removal)
  for no resource gain.

Consequences:
Track C closed for this repository; review corpus budgeted; engineering attention
returns to products; receipts are re-recorded once on the post-cleanup tree.
This block may be recorded as Accepted only after explicit owner confirmation;
per AGENTS.md section 2, proposals belong in PLAN.md and "Proposed" is forbidden
in DECISIONS.md.

Approved by: _pending owner confirmation_
```

## 5. Первые 24 часа (после подтверждения owner)

1. **T+0**: owner подтверждает пакет (или правит). Только после этого - запись решения под lock; `Approved by` не заполняется агентом без прямой формулировки owner.
2. **T+0..1**: freeze: никаких новых protocol-фич, обзоров, аудитов, pilot-арм; никаких `ollama pull`/`ollama rm`; никаких новых review-промптов. Audit closure: Qoder -> advisory, Codex receipt - re-record на финальном дереве.
3. **T+0..1**: один lock holder приводит `.ai/TASK.md` в соответствие с деревом: C1a отмечен сделанным (коммит d38d2f2), текст Current state/Next исправлен, Open questions сохранены. Сейчас TASK.md противоречит коммиту (F-001 помечен «queued», хотя исправлен).
4. **T+1..4**: классификация `docs/reviews/`: live certifying / цитируемые receipt'ами / prompts-runbooks-discussions-chat / pre-v1.9.5; список переноса и список «не трогать». Проверка doctor + gate-check **до** переноса (сейчас не запускаю намеренно: freeze, runtime-запись).
5. **T+3..6**: один batch-перенос некритичных файлов -> `docs/reviews/archive/` + INDEX.md; никогда не удалять. Повторный doctor + gate-check. Если gate-check ломается - немедленный `git mv` назад, без импровизации.
6. **T+6**: один ordered record pass на очищенном дереве (cleanup раньше evidence; иначе receipt'ы снова stale).
7. **T+6..10**: Block-Puzzle: чтение 43-файлового diff, решение finish-or-revert, прогон тестов продукта, один коммит. VPN - после Block-Puzzle, не одновременно.
8. **T+10..24**: owner фиксирует первую продуктовую цель и метрики; старт pilot-задачи №1; первая строка измерений в журнале продукта.

## 6. Принимаемые риски и фальсификаторы

| Риск | Почему принимаю | Компенсация |
|---|---|---|
| Индексный путь мог бы работать в крупном consumer-репозитории | Арифметика этой репозитории не переносится автоматически на большой продукт | Reopen-условие в §6; B3-подобный прогон только там и только pre-registered |
| Перенос обзоров временно стопорит live receipt'ы | Стоимость одного re-record ниже стоимости вечного роста корпуса | Cleanup до record pass; rollback по gate-check |
| Пивот утонет в триаже и Flutter/Android-тулчейне | 77 грязных файлов нужно закрыть до новой задачи | Один репозиторий, одна задача, одна метрика; VPN позже |
| 8-9B модели остаются на диске (~11 GB) без пользы | Удаление - необратимая операция во время freeze | `ollama rm` по решению owner после закрытия раунда |
| Позднее решение owner'а | Freeze сам по себе останавливает накопление долга | Немедленный односторонний freeze Track C не нарушает ничего: stop rule уже исполнен |

Фальсификаторы, которые разворачивают меня:

- **Track C (для consumer-репозиториев)**: pre-registered controlled run в Block-Puzzle или VPN показывает >= 25% median broad total reduction и <= +5% narrow regression против matched control, на втором семействе моделей, с учётом стоимости ориентации. Тогда reopen по `owner-directive`, но не для этой репозитории.
- **Весь курс «упрощать»**: воспроизводимые доказательства, что протокол предотвратил >= 3 критических дефекта в продуктах, которые иначе дошли бы до пользователей. Тогда maintenance cost оправдан и чинить нужно только бюджет корпуса.
- **Моя последовательность «триаж раньше новой задачи»**: если через 7 дней после решения owner'а в выбранном продукте нет ни одного продуктового коммита и нет внятного блокера - эскалировать до жёсткой версии: полный feature freeze протокола, одна продуктовая задача, ничего параллельного.

## 7. Факты: проверка промпта на d38d2f2 (adversarial)

| Утверждение промпта | Что в дереве | Вердикт |
|---|---|---|
| «Ядро: 2,826 строк JS в .ai/bin/» | 6 файлов `.cjs`: 261+1047+580+286+356+296 = 2,826 | Верно по сумме, но это `.cjs`, и вне счёта остались 17 тестовых файлов (4,441 строка) и `validate-protocol.ps1` (744 строки) |
| «125+ файлов, 1.25 МБ в docs/reviews/» | 131 файл, 1,366,911 байт (1.30 МБ); 89 файлов от 09-19, 39 от 09-18; `docs/reviews/archive/` отсутствует | Занижено и устаревает ежедневно; корпус растёт в том числе во время этой оценки |
| «+72.8% к потреблению токенов» | broad total 846,291 -> 1,462,335 = **+72.79%**; broad fresh +9.10%; narrow total +60.20%; narrow fresh +42.76% | Верно для broad total; «+72.8%» без оговорки - выборочная метрика |
| «Продукты без изменений 2-3 дня» | HEAD: Block-Puzzle 17.09 04:19 +03 (43 dirty, продукт-код до 17.09 22:07); VPN 18.09 03:44 +03 (это protocol upgrade; 34 dirty, продукт-код до 17.09 04:25) | Наполовину верно: коммитов нет, но работа припаркована в рабочих деревьях |
| «Pilot v2: 4 новые ветки и 12 споров» | План (§3) определяет 4 **arms** B2/B3/B4/C2; `git branch -a` - только `main` + remote snapshot; споров действительно 12 (D1-D12) | «Ветки» - неверно; arms, и ни одна ветка не создана |
| «Остановить скачивание omnicoder-2-9b и qwen3:8b» | `ollama list`: qwen3:8b 5.2 GB и carstenuhlig/omnicoder-2-9b 5.7 GB **уже присутствуют**; изменены ~20 мин назад | **Фактическая ошибка**: скачивание завершено, останавливать нечего |
| «95% ресурсов тратится на аудит аудитов» | Нигде не измерено; council сам помечает цифру как unverified estimate | Подано как факт при отсутствии измерения; корректные прокси - 35 коммитов/48 ч, 89 обзоров за 09-19, 0 продуктовых коммитов |
| «Радикальное упрощение протокола» (в решении) | Ни одно из 4 действий не упрощает код; v2.0-упрощение - отдельный stream | Формулировка обещает следствие, которого нет в действиях |

Дополнительные замечания (не в промпте, но критично для исполнения):

- Черновик `PROTO-DEC-0036` в `docs/reviews/2026-09-19-grand-consensus-systemic-course-correction.md:175` уже содержит `Status: Accepted` и `Approved by: RuslanFomenko (direct owner confirmation, 2026-09-19)`. По условиям freeze подтверждения нет; AGENTS.md §2 запрещает писать approval-строку без прямой формулировки owner. В `DECISIONS.md` этот блок вносить нельзя до подтверждения; `Status: Proposed` в `DECISIONS.md` запрещён - предложение живёт в `PLAN.md`.
- `Reopen-trigger: metric-gain-in-consumer-repo` из черновика не входит в шесть ограниченных семантик триггера (AGENTS.md §6). Использовать `owner-directive` (или `new-external-data`), а условие «metric gain in consumer repo» описать в теле блока.
- `PROTO-DEC-0035` дословно покрывает только Arm B/MCP. Запрет B2/B3/B4/C2 - **новое** решение, его нельзя подавать как «исполнение существующего».
- `+72.8%` - это цена протестированного паттерна (B-сессии читали digest целиком и всё равно исследовали репозиторий), а не приговор индексации как таковой. Вывод «закрыть для этой репозитории» выживает на арифметике (88k digest против 45-73k fresh), но в decision-блоке нельзя писать «Repomix доказанно не работает» - формулировка сильнее данных.
- Я намеренно **не запускал** `doctor`, `gate-check`, `record` и не создавал сессию/журнал: freeze запрещает запись, включая `.ai/runtime/`. Все цифры выше получены чтением файлов, `git`, `ollama list`; runtime-проверки перенесены в план после подтверждения owner'а.

## 8. Ответ на вопрос

Да, останавливаем Ouroboros: Track C закрывается, Pilot v2 не запускается, корпус классифицируется и архивируется, внимание уходит в Block-Puzzle и VPN. Но пивот должен начаться с закрытия 77 незакоммиченных файлов в двух продуктах, запись evidence - после cleanup, а «упрощение» - отдельным v2.0-scope, иначе через неделю мы получим тот же протокол, только без индекса.
