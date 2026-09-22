# Независимый аудит paired work cycle и экспертное заключение

Reviewer: GPT-6 / Codex
Date: 2026-09-20 UTC
Reviewed commit: d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1
Working tree: dirty
Mode: CERTIFYING
Receipt-Owner: codex-3b6dc3f1bacb8871
Receipt: .ai/worklog/codex-3b6dc3f1bacb8871.md
Scope: paired-cycle v1.9.6, A-I, независимая проверка совета и предложения.
Verdict: FAIL

---

## Вердикт

FAIL для приёмки текущего ранбука как законченного переиспользуемого процесса. Новая документация допускает преждевременное Completed, её adversarial-шаблон не проходит существующий валидатор, а новый managed-документ неверно классифицируется при адаптации хостом. Это воспроизводимые дефекты, несмотря на 255/255 зелёных регрессий. Они не означают, что надо останавливать продуктовые пилоты или начинать переработку всего протокола.
Freeze-исключение подтверждено прямым текущим сообщением владельца; вопрос F-005 относится к долговременной записи этого решения, а не к праву владельца его дать. Изменение не следует называть неавторизованным только потому, что запись неполна.
Mode основан на предоставленных средой прямых доступах к репозиторию, записи ФС и shell/receipt tooling. Исходники и общие документы не редактировались. Пробы установки выполнялись только в TEMP-fixtures, как штатные тесты; реальные хосты не затрагивались.

## Находки

Статус относится к утверждению в своей строке. F-001..003 блокируют приёмку ранбука; остальные имеют указанный ниже контекст.

| id | severity | Утверждение | Воспроизведение | Статус |
|---|---|---|---|---|
| F-001 | MEDIUM | Правка нового managed-документа ошибочно считается правкой runtime | Проба P: append в PAIRED-CYCLE → exit 1; COPILOT → exit 0/WARN; `validate-protocol.ps1:657-686` | VERIFIED |
| F-002 | HIGH | Phase 3 разрешает Completed до обязательного adversarial review; полного пути закрытия core нет | `.ai/docs/PAIRED-CYCLE.md:39-61` против `AGENTS.md:87-114`; в Phase 6 только prompt+stop, Template 4 ADVISORY | VERIFIED |
| F-003 | MEDIUM | Заголовок Template 4 не проходит completion gate | Проба P: `Mandatory Adversarial Review Prompt` → exit 1, требуется `unified`; `validate-protocol.ps1:537-538` | VERIFIED |
| F-004 | LOW | Заявленный deep-check не включает архивную цепочку | PAIRED-CYCLE:134 без `--deep`; `.ai/bin/protocol-handoff.cjs:366-368,681-687`; PROTO-DEC-0025 п.2 | VERIFIED |
| F-005 | MEDIUM | Исключение из freeze и bump не оформлены отдельным долговременным решением/переходом | TASK:35,47; DECISIONS заканчивается 0039; REGISTRY содержит старый accepted/owner-directive 0039, но не переход об исключении 2026-09-20 | VERIFIED |
| F-006 | MEDIUM | Облегчённый docs/config путь 0038 не реализован существующим completion gate | Проба P: Completed для опечатки README + независимый PASS в журнале → exit 1; `validate-protocol.ps1:499-554` | VERIFIED; ранее существовавшее расхождение |
| F-007 | LOW | Нет теста, фиксирующего обязательное присутствие PAIRED-CYCLE в managed | `rg -n 'PAIRED-CYCLE|1\.9\.6' tests` → нет совпадений; manifest/upgrade проверяют элементы полученного списка | VERIFIED; статический анализ |
| F-008 | LOW | Phase 6 допускает prompt только в чате и создание нового файла после receipt | PAIRED-CYCLE:60-61 против AGENTS §5.3; guardrail:68 не задаёт повторную запись после Phase 6 | VERIFIED; неполная последовательность |
| F-009 | INFO | Отсутствие v1.9.6 tag уже нарушает атомарность релиза | `git tag --list 'v1.9.*'`; PROTO-DEC-0025:1159-1161 регулирует release commits, нового коммита ещё нет | FALSE |
| F-010 | INFO | Текущие проверки дают 0 warnings и исходный receipt свежий | Validator: 1 warning; verify Gemini: stale/exit 1 | FALSE; дрейф состояния |

## A. Противоречия и границы процесса

VERIFIED: лок перечисленных shared-документов, собственный журнал, пять меток и запрет коммитов согласованы с AGENTS. Передача implementer → независимый reviewer разумна.
FALSE: процесс полностью согласован с завершением core. Phase 3 допускает завершение до Phase 6; обязательный prompt возложен на controller, тогда как AGENTS §2 требует его от implementer. Phase 6 не описывает исполнение adversarial review, обработку результатов и финальную сертификацию. Это не доказательство реально выполненного обхода: TASK сейчас In progress, gate не отключён.
В CERTIFY нет обязательного набора полей итогового отчёта `Reviewer`, `Date`, `Receipt-Owner` и указания связать путь отчёта с записью журнала. Наличие `Mode: CERTIFYING` в запросе не создаёт эти поля в ответе. Требования можно наследовать из AGENTS, но шаблон сам по себе недостаточен.
Guardrail «Any subsequent edit ... invalidates» чрезмерно широк: worklog/runtime исключены из tree digest. Новые review-файлы включены; запись review после receipt закономерно делает прежний receipt stale. Это не повреждение истории.
F-006 нельзя исправить одной ссылкой на 0038: валидатор требует два файла при любом Completed, включая installed. Коллизия docs внутри `.ai/` также требует однозначного приоритета правил риска; сейчас решение одновременно называет «anything under .ai/» core и допускает docs-only путь.

## B. Свежая сессия и шаблоны

VERIFIED: `verify --journal <path>` существует (handoff:686); перечисленные runtime-команды доступны в установленном проекте. `[id]`, `[reviewer]`, `[implementer]` — заменяемые плейсхолдеры, не ошибочные CLI-флаги. Нельзя исполнять их буквально; надо назвать owner из вывода SessionStart, а не путать с отдельным Session id.
FALSE: шаблоны полностью готовы к копированию. F-003/F-004 воспроизведены; шаблон CERTIFY не задаёт итоговый header/привязку, а «test suite» не различает host testCommand и source suite. Запуск новой сессии без оговорки об уже активном SessionStart может создать второй журнал.
В Template 4 нет обязательного source-only пути: упоминание PROTO-DEC-0039 в Template 1 — явно пример ограничения, не требование его наличия в каждом хосте. Формат плейсхолдеров сам по себе не дефект.
Для installed-проекта надо брать путь review из решения хозяина хоста (AGENTS §5.1), а не навязывать `docs/reviews/` через guardrail. Эта несовместимость частично унаследована от действующего hardcoded gate; без решения владельца менять namespace хоста нельзя.

## C. Манифест, версии, новая установка

Команда: `rg -n '1\.9\.[0-9]+' AGENTS.md protocol-manifest.json setup-ai-protocol.ps1 .ai/docs tests`.
VERIFIED: три текущих объявления равны 1.9.6 (AGENTS:3, manifest:3, installer:1); исторические 1.9.0 в комментариях tests/upgrade корректны. Новый путь присутствует в managed:13; документ имеет 161 строку.
Уточнение: source-манифест НЕ содержит contentDigest. Установщик генерирует digest в installed-копии. Проба P получила `role: installed`, `protocolVersion: 1.9.6`, digest `sha256:81d7bbaa236c173e76d7644efe554566eaa56737dd55a35c8d5811112dc0948f`.
Базовая установленная копия валидируется, exit 0. Три предупреждения пустого тестового хоста не равны предупреждениям source-репозитория. Локальная правка нового документа даёт F-001, отсутствие файла даёт корректный missing-file FAIL.

## D. Регрессии и границы покрытия

`powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1` → exit 0, `Protocol OK. 1 warning(s).`, 35 session journals.
`powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1` → exit 0; tests 255, pass 255, fail 0, skipped 0; duration 109390.9503 ms.
Штатный wrapper включает `PROTOCOL_TEST_FAST_CHECKS=1`; helpers оставляет реальные валидаторы для installer/upgrade/manifest/validator и ряда других suites. 255/255 не означает 255 полных запусков валидатора.
Удаление только managed-записи: по анализу не найден тест, который должен упасть. Перечисление manifest → disk не доказывает полноту самого manifest. Мутацию списка в D:\Colabs не выполнял; это явно рассуждение, как требовал dispatch.
Удаление файла при сохранённой записи уронит `every managed and integration entry exists in this repository`, установочные тесты из manifest.test и preflight установщика. Это другой сценарий.
Согласованность версии косвенно покрыта: `tests/review-findings.test.cjs:192`, тест `a version that disagrees with the manifest fails validation`. Пина именно 1.9.6 нет; фиксировать номер каждой версии в тесте необязательно. Пин нового публичного installed-пути полезен.

## E. Полный diff и дисциплина

`git diff --numstat HEAD -- .ai/DECISIONS.md docs/decisions/REGISTRY.md .ai/ARCHIVE.md` → соответственно 124/0, 4/0, 394/0.
FALSE: ledgers «не тронуты» относительно anchor. VERIFIED: удалений в diff нет, добавлены новые блоки/строки; валидатор подтвердил неизменность 35 committed decision blocks. Авторство этих добавлений конкретной paired-cycle сессией из общего dirty tree не следует.
`git diff --name-status HEAD -- '*.cjs'` → только R100 архивного review-probe. Kernel `.ai/bin/*.cjs`, hooks и validator не изменены. Installer меняет только строку версии. TASK:3 остаётся `Status: In progress`.
В AGENTS diff есть ещё risk-scaling и cap от предыдущего этапа. Нельзя приписать весь dirty diff одному deliverable по его журналу.

## F. Governance

VERIFIED: durable-запись недостаточна для явного исключения из запрета 0039 п.1/2f. Конкретные основания: AGENTS §1 (DECISIONS выше TASK), §2 (approved block), §6 (при reopening нужен новый trigger row). Текущая accepted/owner-directive строка 0039 относится к принятию freeze, не к новому исключению.
Сам 0039 НЕ содержит общего разрешения на docs-only изменения. Поэтому тезис Qoder «freeze allows docs-only exceptions» без отдельного решения неверен. Владелец такое исключение может дать и в текущем сообщении его подтвердил.
Минимум: при отдельном разрешённом оформлении записать узкую область исключения, допустимые файлы/проверки/версию и provenance в новом approved-блоке и append-only registry transition. Не переписывать 0039 и не размораживать прочие работы. Для обычной документации, не меняющей принятого решения, новый DEC на каждую правку не нужен.
В этом аудите записи не добавлялись: владелец запросил проверку без исправлений, не оформление решения.

## G. Реальный путь обновления в fixtures

Проверены локальные tag-снимки через `git archive --format=tar -o <TEMP>/release.tar v1.9.4` и аналогично v1.9.5; распаковка `tar -xf <archive> -C <TEMP>`.
Для каждого: старый `setup-ai-protocol.ps1 -Target <fixture>`, затем текущий `setup-ai-protocol.ps1 -Target <fixture> [ -Force ]`; запускается установленный `validate-protocol.ps1 -Quiet`. Все TEMP-roots созданы/очищены штатным tests/helpers.cjs с проверкой границ удаления.

| Исходная версия | Обновление | Installer exit | Новый файл / manifest | Validator exit |
|---|---|---|---|---|
| 1.9.4 | обычное | 0 | есть / 1.9.6 | 1 |
| 1.9.4 | -Force | 0 | есть / 1.9.6 | 0 |
| 1.9.5 | обычное | 0 | есть / 1.9.6 | 1 |
| 1.9.5 | -Force | 0 | есть / 1.9.6 | 0 |

Обычный запуск оставляет прежний AGENTS (version mismatch), старые hooks/session; для 1.9.4 также validator/lock/handoff. Exit 0 установщика не означает здоровый upgrade. Это существующая семантика, не новая регрессия.
Удалённый PAIRED-CYCLE восстанавливается даже обычной установкой; утверждение «только -Force» излишне. `-Verify` при отсутствии файла → exit 1, `Missing: .ai/docs/PAIRED-CYCLE.md`.
Preflight отсутствующих исходников/невалидных JSON/структуры hooks/markers покрыт прочитанными installer.test и зелёным suite. Это не транзакционная гарантия на произвольный отказ записи: после начала Write-Bytes rollback всех предыдущих файлов в коде отсутствует; I/O-fault не инъецировал.

## H. Дополнительные риски

VERIFIED: default gemini/deepseek может выглядеть назначением, но Phase 0 требует owner-assigned Roles. Правильно заменить defaults на примеры и явно запретить самоназначение; утверждение о жёсткой зависимости от этих моделей неверно.
Corpus guardrail уже существует: тезис CodeGeeX «cap не учтён» FALSE. До моих файлов было 50 активных файлов / 466668 B, ниже 60/600 KB. Валидатор/архиватор не содержат проверки именно этого review-cap; это ранее существовавший разрыв обещания AGENTS §8. Количество журналов после моего SessionStart — 35, до него 34; вклад этой сессии отмечен явно.
Фаза 6 добавляет файл и потенциально делает receipt Фазы 3 stale; нужны конечное дерево и последовательная повторная запись receipts после всех артефактов. Сохранение текста только в чате нарушает AGENTS §5.3.
В installed-роли пропускается лишь проверка свежести через Node gate-check. PowerShell всё равно проверяет Completion gate, оба файла, маркер unified, Reviewer и verdict. Формулировка «у хостов вообще нет машинной проверки» FALSE.
F-009: bump в dirty tree — подготовка версии, не уже сделанный неатомарный release commit. Тег нужен при выпуске; откат версии только из-за отсутствия тега сейчас не обоснован.

## I. Проверка исходных claims

`node .ai/bin/protocol-handoff.cjs verify --owner gemini-8f96a135c4637578` → exit 1, `evidence is stale`.
Recorded: `sha256:8d763a6a8277dc504cca6e2537f7cb671dcd4c52a65d4cde60257dd132b0e1b0` (218 файлов); текущее дерево до моих audit-файлов: `sha256:48b77f0ff6601046c3cdd025c22d3f62665e59a38beb255364229d179675cbf4` (221 файл).
`node .ai/bin/protocol-handoff.cjs verify --owner gemini-e4d65c510f35d0bc --deep` до моих audit-файлов → exit 0, evidence matches the current tree. Следовательно, дрейф исходного receipt не равен сломанному verify.
255/255 и validator exit 0 — VERIFIED. Текущие «0 warnings», «30/30» и свежий исходный receipt — FALSE. Исторические 0 warnings на момент записи независимо не восстановлены: UNREPRODUCIBLE в текущем дереве.
Исходный quick receipt честно говорит `scope: validator only`; он не доказывает ручной suite-run. Но запись «All tests pass» не опровергается самим --quick: suite мог запускаться отдельно. Не приравниваю ограниченный Evidence к фальсификации.

## Проба P: воспроизведение ключевых отказов без изменения исходников

Из D:\Colabs выполнить PowerShell-блок. Это сокращённая воспроизводимая форма реально выполненной пробы; она использует только TEMP и helpers, без установки в продукты.

```powershell
@'
const fs=require('fs'),p=require('path');
const {makeFixture,runPowerShell,write,repoRoot}=require('./tests/helpers.cjs');
const clean=[],t={after:f=>clean.push(f)},r=makeFixture(t);
const v=label=>{const x=runPowerShell('validate-protocol.ps1',['-Quiet'],r);
 console.log(label,x.status,x.stdout+x.stderr);};
try {
 const x=runPowerShell('setup-ai-protocol.ps1',['-Target',r],repoRoot);
 if(x.status)throw Error(x.stdout+x.stderr);
 const f=p.join(r,'.ai/docs/PAIRED-CYCLE.md'),original=fs.readFileSync(f);
 fs.appendFileSync(f,'\nLocal note.\n');v('paired edit: expect 1');
 fs.writeFileSync(f,original);
 fs.appendFileSync(p.join(r,'.ai/docs/COPILOT.md'),'\nLocal note.\n');
 v('copilot edit: expect 0 and WARN');
 fs.copyFileSync(p.join(repoRoot,'.ai/docs/COPILOT.md'),p.join(r,'.ai/docs/COPILOT.md'));
 write(r,'.ai/TASK.md','# Task\nStatus: Completed\n## Objective\nREADME typo.\n');
 write(r,'.ai/worklog/reviewer.md','# Review\n\n## 2026-09-20 - Review\n\nAgent: reviewer\n\nAction: Reviewed README typo.\n\nResult: PASS.\n\nNext step: Handoff.\n\nOpen: None.\n');
 v('light path: expect 1, missing Completion gate');
 write(r,'docs/reviews/prompt.md','# Mandatory Adversarial Review Prompt: typo\n');
 write(r,'docs/reviews/review.md','Reviewer: independent\nDate: 2026-09-20\nMode: CERTIFYING\nReceipt-Owner: reviewer\nVerdict: PASS\n');
 write(r,'.ai/TASK.md','# Task\nStatus: Completed\n## Completion gate\n- Adversarial review prompt: docs/reviews/prompt.md\n- Independent review: docs/reviews/review.md\n');
 v('template title: expect 1, unified adversarial audit prompt');
} finally {for(const f of clean.reverse())f();}
'@ | node
```

## Оценка аргументов совета

CodeGeeX: PASS не обеспечен показанными воспроизведениями; дата 2023-11-15 не соответствует текущему аудиту. «DECISIONS не менялся», покрытие удаления записи и взаимоисключающие выводы про cap опровергнуты. Это advisory input, не основание приёмки.
Qoder: «0 warnings (1 warning)» внутренне противоречиво; итерация managed не ловит удаление элемента. Наличие общего docs-only исключения в 0039 опровергнуто. Полезны только независимо подтверждённые факты установки/версий.
DeepSeek/Gemini: F-001 и проблема завершения подтверждены. Их довод об обязательном немедленном теге отклонён; обычный verify проверяет всю активную journal-chain, а не только последнюю запись, --deep добавляет архив. Текущий статус receipt — снимок времени. Нельзя одновременно считать находки обязательными до релиза и выдавать допускающий gate вердикт RECOMMENDATION без чёткой границы scope.
Сходство двух отчётов само по себе не доказывает ни независимость, ни заимствование. Решающими здесь являются мои отдельные запуски и пробы.

## Минимальные исправления и экспертные предложения

1. До приёмки runbook: добавить новый документ в docDigests и регрессию на host-edit WARN; deletion обязан остаться FAIL. Это маленькая правка validator, но уже не docs-only: явно отразить её в разрешённой области remediation, не выдавать за одну лишь редактуру.
2. Исправить маршрут core: implementer сохраняет unified prompt → независимый adversarial CERTIFYING review → remediation/review при FAIL → заполнение gate и финальная запись evidence → явный gate-check/validator. До этого TASK In progress. Phase 6 может быть точкой передачи на ревью, но не завершением задачи.
3. В шаблонах: `Unified Adversarial Audit Prompt`, `--deep`, итоговый header с Receipt-Owner, точные source/host tests, путь журнала/отчёта и правило переиспользования journal при активных hooks. Финальный adversarial review для gate должен быть CERTIFYING; дополнительные advisory мнения остаются необязательными.
4. Оформить уже данное исключение в append-only решении/registry; отдельно определить границы версии и исправлений. Не менять историю, не снимать freeze целиком, не требовать новый DEC на обычную правку текста.
5. F-006 вынести как отдельную согласованную remediation-задачу: реализовать уже одобренное риск-масштабирование в существующих проверках, без нового gate/сервиса. До этого явно документировать ограничение: обещанный лёгкий путь с текущим validator не закрывается. Обязательны положительный тест docs-only и отрицательный тест обхода core; не классифицировать риск лишь по словам автора.
6. Добавить один тест обязательного installed-пути и один тест пригодности заполненных шаблонов к существующему gate. Не размножать статические списки версии и не создавать систему тестирования промтов ради четырёх шаблонов.
7. Организация: один reviewer по умолчанию; второй — при споре/высоком риске. Одна общая таблица findings с воспроизведением и ответственным вместо повторных почти одинаковых отчётов. RECOMMENDATION только для действительно необязательных улучшений; обязательные исправления → FAIL.
8. После этого вернуться к уже утверждённым пилотам. Измерить продуктовую ценность, стоимость ревью и повторных receipts существующими метриками. Новые MCP, автоматические контроллеры, мониторинг и расширение ядра до результатов пилота не предлагаю. Будущее упрощение должно уменьшать число артефактов/шагов при сохранении заработанных проверок.

## Ограничения и персистенция

Не проверял продуктовые задачи, реальные установки Block-Puzzle/VPN, работу двух живых моделей по полному циклу, I/O-fault rollback или чужой исторический ручной test-run. Нельзя надёжно приписать каждому агенту хунки общего dirty tree. Прежний receipt не реконструировал через правку/удаление истории.
Сохранён scope-prompt: `docs/reviews/2026-09-20-codex-paired-cycle-audit-prompt.md`; этот отчёт: `docs/reviews/2026-09-20-codex-paired-cycle-review.md`. Вместе они занимают два свободных места corpus. TASK, PLAN, DECISIONS, REGISTRY, ARCHIVE и аудируемый код остаются без моих изменений.
Команды завершения: `node .ai/bin/protocol-handoff.cjs record --owner codex-3b6dc3f1bacb8871 --quick`, затем `node .ai/bin/protocol-handoff.cjs verify --owner codex-3b6dc3f1bacb8871 --deep`. Quick Evidence удостоверяет validator; полный suite выполнен отдельно, его результат указан в D и журнале. Не заявляю, что quick receipt содержит suite exit code. Изменение дерева последующими сессиями штатно состарит и этот receipt.
