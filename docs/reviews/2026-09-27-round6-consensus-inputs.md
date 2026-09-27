# Round 6 synthesis - inputs (owner, 2026-09-27)

This file carries the operator report, the owner's instruction and the three expert opinions
verbatim, for the GLM synthesizer session.

---

## A. Operator report sent to the experts (context)

Штатно; оба потока закрылись, wave-3 собрана.

**Ревью 2A (DeepSeek/kilo)** — сессия вышла: вердикт **RECOMMENDATION** (ADVISORY, раунд 1; «Every
focus item is substantively correct and independently reproduced»), коммит `5bc9940` на
`kernel-batch-1`.

**Wave 3 — DIG-реестр собран:**
- DIG-GEMINI дописан и закоммичен (`26a6e40`); итоги: **331 строка — 292 built / 29 partial /
  10 not built** (Mistral 129: 118/11/0; Gemini 91: 87/3/1; DeepSeek 111: 87/15/9).
- **cover/dup** записаны в `drafts/COVER-DUP.md` (`f592ae0`): cover по зеркальной конвенции —
  units 3 / без записи 0 / лишних 0; прямой прогон по drafts даёт известное несовпадение конвенции
  (4/4/5) — отмечено; cross-producer **dup = across 0 / within 0** (копирования нет).
- **Probe GLM-5.3 — INCONCLUSIVE**: алиас не отвергнут, но модель самоотчиталась «I'm Mistral Vibe
  (CLI agent) running **Mistral Large 24.02**. 2+2=4.», model-id клиент не отдаёт (логи тоже);
  зафиксировано в `drafts/GLM-PROBE.md` (`605528c`) с причиной замены Sol.

**Журнал/record**: `2d51f8a` + автоархив `0df6d92` (обе записи пушнуты; ветки: `v2.0.0` 0df6d92,
`kernel-batch-1` 5bc9940, `roadmap-wave3` 605528c, `perf-wave-1` f8e20b2).

**Ждёт owner:**
- решение по **GLM probe** (и, если «retry» — способ);
- **2A**: заморозка кандидата готова по вердикту, но ≤150-строчный адверсариальный промпт по
  заданию пишет *исполнитель 2A* — сессия мертва, recovery 3 только аварийно; **нужно слово
  владельца, кто пишет промпт** (иначе сертификаторы MiMo+Sol не запустить);
- **Mistral advisory**-проход — после решения по GLM;
- второе слияние `perf-wave-1` — по слову; запуск **A-1** — по слову; слияние `kernel-batch-1` —
  после сертификации.

---

## B. Owner instruction

Надо свести все мнения в их предложениях, где они имеют максимальный консенсус (100%) и значимый
консенсус (80-99%). Это фиксируем как решения, а то, что ниже, напишем в отдельный файл для
обсуждения. Всё, что ниже 40%, отсекаем без обсуждения.

Owner closing note: вход через команду vibe в PowerShell, настройки модели и глубины рассуждений
установлены в нужное положение по умолчанию. Скажи агенту сохранить весь вывод в промт — возврата
вердикта комиссии совета.

---

## C. Expert 1

Я сверил с origin: второй эксперт прав. **`kernel-batch-1` на origin стоит на `5a6cad1`,
`perf-wave-1` — на `4c25741`.** Ревью 2A (`5bc9940`) и Addendum (`f8e20b2`) есть только на вашей
машине. Если сейчас перезагрузиться или что-то сломается, эта работа существует в одном
экземпляре. Поэтому первым шагом идёт push, потом память и перезагрузка, и только после этого
работа.

**Где эксперты расходятся и что я выбрал:**
- **Память.** Перезапуска TextInputHost и VS Code недостаточно: 5,9 ГБ в пулах ядра освобождает
  только перезагрузка. Поэтому **перезагрузка** (позиция первого эксперта). До неё — ни новых
  замеров, ни тяжёлых параллельных сессий. Контрольный чек-лист тишины перед замерами (идея
  второго эксперта) тоже берём.
- **GLM.** Одна проверка по метаданным, а не по словам модели. Это совпадает с моим прошлым
  предложением: файл вашей ручной сессии `9b54336c` и конфиг. Если в файле указан GLM и оператор
  воспроизвёл это без интерактива, маршрут принимается. Если нет — FAIL, и MiMo берёт оба слота:
  сертификатор A-1 и верификатор DIG. Повторов больше не делаем.
- **Порядок после перезагрузки.** Один цикл идёт последовательно. Исключение — два сертификатора
  2A: независимость требует, чтобы они работали параллельно.

Итоговый промпт (text of the proposed operator directive) follows in the source message; its
content: Step 0 save state (fetch; ancestor checks for kernel-batch-1 5bc9940 and perf-wave-1
f8e20b2; push both; ls-remote four branches = 5bc9940 / f8e20b2 / 605528c / 0df6d92 or newer;
git status across all worktrees incl. kb1, perf1, perf1a, w3, core-ia and the main copy; do not
touch other sessions' uncommitted work); Step 1 decision block (environment gate: no perf
measurements and no heavy parallel agent sessions until a clean post-reboot baseline; old
PROFILE-1/M1 not annulled; the silence checklist: >= 8 GB RAM free, no background processes > 5%
CPU, TextInputHost not in the top, kernel pools journaled, 2-3 sessions after reboot without
regrowth; GLM-5.3 one metadata check without retries, PASS only if the vibe session file contains
a GLM model - in the owner's manual session `9b54336c` and in the operator's non-interactive run
with the same selection method; the model self-report is not a source; otherwise FAIL "route
identity cannot be verified"; on FAIL MiMo-V2.6-Pro takes both GLM slots - A-1 certifier and the
DIG verifier; on PASS GLM keeps both; before MiMo work a probe through OpenRouter with the
`model` field recorded as modelRan, otherwise STOP; Mistral Medium 3.5 - advisory only and only
over the Gemini and DeepSeek ranges; 2A: recovery 3 of the same Gemini executor strictly for one
artifact - the unified adversarial prompt <= 150 lines bound to the frozen candidate SHA plus
journal and record; code, tests, fixes, items 4-6 forbidden; a fall means FALLEN, the prompt
author is not replaced without the owner; the DeepSeek review recommendations (5bc9940) are
accepted as recorded notes, enter the prompt as known points, no new DeepSeek round; the 2A
certification is MiMo-V2.6-Pro + GPT-5.6 Sol (PROTO-DEC-0090), in parallel and independent; A-1:
Claude Opus 5.5 (Claude Code) at effort max, launched after the environment stabilises);
Step 2 memory and reboot (snapshot with Get-Counter for Pool Nonpaged Bytes, Pool Paged Bytes,
Committed Bytes, Commit Limit plus the top processes by private commit and CPU, poolmon top-10 if
available; Stop-Process TextInputHost and re-measure in a minute; Kilo PID 42968 child processes
listed, taskkill only when all tasks are closed; report "ready for reboot"; after reboot measure
before VS Code, then 10-15 minutes after opening one workspace; if the pools grow again report and
diagnose with PoolMon, no Driver Verifier); Step 3 one strictly sequential cycle (origin check;
the GLM metadata check; MiMo probe via OpenRouter; recovery 3 narrowly, then prompt, verify,
push; freeze the 2A SHA, then the parallel MiMo + Sol CERTIFYING certification; on both allow,
report - the merge only on the owner's word with --no-ff, full suite, push; then the DIG
verification (GLM on PASS else MiMo) over 20% plus every "not built" and "partial" row and
"built" rows with prose proof, with a COVER-DUP.md line explaining the cover convention mismatch
first; Mistral advisory over the Gemini and DeepSeek ranges; the second perf-wave-1 merge only
with the Addendum confirmation line, after the range check, on the owner's word; the A-1 launch;
after the kernel-batch-1 merge and the silence checklist, the control run, then V3; parallelism
returns only after 2-3 sessions without regrowth and the owner's word). Rules: explicit-path
adds, fetch before push, no force/rebase/amend/PR/tags/merge to main, merges only on the owner's
word, Evidence only via record and never in the silence windows, no secrets (config.toml keys
never leave the file), nothing from D:\mcp-stack, every session records model, effort and usage.

---

## D. Expert 2

Я бы не отправлял предыдущий объединённый текст как есть. После проверки актуальной документации
Vibe нашлась важная техническая ошибка именно в GLM-probe, плюс в отчёте по памяти есть пара
мест, где выводы слишком категоричны.

**Главное исправление: GLM пока не FAIL.** Текущая официальная документация Vibe прямо
указывает, что Z.ai GLM 5.3 поддерживается как модель с ID `zai-glm-5-3`, а модель можно задавать
непосредственно через `--model`. Также Vibe загружает `./.vibe/config.toml` текущего проекта
раньше пользовательского `~/.vibe/config.toml`; это хорошо объясняет, почему запуск из разных
каталогов мог вести себя по-разному. Более того, `VIBE_ACTIVE_MODEL`, которым оператор делал
предыдущий probe, не указан в текущей официальной configuration reference как документированный
способ выбора модели. Документированный механизм — `active_model` в конфиге, `/model`
интерактивно или `--model` в CLI.

Поэтому предыдущий INCONCLUSIVE остаётся исторически корректным, но его нельзя повышать до FAIL.
Сам probe был методологически слабым.

После перезагрузки правильный probe:
`vibe --help | Select-String -- "--model"`, затем явный выбор документированного ID
`vibe --model zai-glm-5-3 --prompt "Answer only: 2+2=4" --max-turns 1 --output streaming --trust`.
Это значительно лучше, чем спрашивать модель «кто ты?». Self-report модели вообще не является
аттестацией backend. Дополнительно проверить, не было ли локального override:
`Test-Path C:\Projects\test\.vibe\config.toml` и строки `active_model|name|alias|provider` в
`$HOME\.vibe\config.toml` (ключи не печатать). Если `--model zai-glm-5-3` принимается и запрос
выполняется, маршрут GLM подтверждён на уровне Vibe routing. Если протокол требует именно
server-returned modelRan, Vibe такой telemetry не предоставляет — это уже другое, более строгое
требование.

**По памяти: STOP и reboot поддерживаю.** Но цифру «физически занято 21 ГБ из 32» не фиксировать
как факт, пока не доказано, что Kilo/Bun не входит одновременно в подсчитанное «дерево VS Code»
(double counting). Зато три факта серьёзные: TextInputHost с ~9 ГБ private commit аномален; его
~3.2 CPU cores загрязнят perf-измерения; kernel pools ~5.9 ГБ подозрительны. `taskkill /f /im
TextInputHost.exe` — низкорисковая диагностика, но не «нулевой риск» (IME/emoji могут временно
пострадать). Если PoolMon/RAMMap уже есть — снять pool tags перед reboot; если нет — не
откладывать перезагрузку ради установки.

Рабочие решения: память — STOP новых агентов → сохранить Git-состояние → TextInputHost stop →
snapshot → reboot; GLM — не FAIL, после reboot один новый probe через `--model zai-glm-5-3`;
Wave 3 DIG — если Sol снова доступен, вернуть GPT-5.6 Sol основным verifier, GLM здесь больше не
блокер; 2A prompt — recovery 3 того же Gemini-executor только для adversarial prompt ≤150 строк
без code changes; 2A certifiers — MiMo-V2.6-Pro + GPT-5.6 Sol; A-1 executor — Claude Opus 5.5 max;
A-1 certifiers — Sol + GLM после исправленного probe, MiMo резервом; perf-wave-1 — второй merge
после точного range-check; V3/perf — никаких новых измерений до reboot и стабильного baseline.
Не перепутать пары: MiMo + Sol — штатная пара для 2A, а Sol + GLM — A-1.

Затем: после reboot baseline до тяжёлых сессий; падения agy из-за memory pressure — только
hypothesis, не установленная причина; точную команду, exit/status и session ID GLM-probe
зафиксировать в GLM-PROBE.md; при PASS GLM route (уровень Vibe routing) — GLM остаётся; при
отказе `--model`/маршрута — probe FAIL → MiMo–V2.6-Pro reserve; Sol при доступности — основной DIG
verifier; VS Code exclude `**/.ai/runtime/**` в watcherExclude и search.exclude (files.exclude —
опционально).

---

## E. Expert 3

Да. Здесь появились новые факты, которые реально меняют порядок действий. Самое важное — **сейчас
ввести временный environment gate**: новые perf-замеры и новые тяжёлые параллельные агентские
сессии не запускать до очистки памяти. `TextInputHost` с ~9.08 ГБ private commit и ~3.2 ядра CPU
плюс ~5.9 ГБ kernel pools — достаточный источник шума и падений, чтобы результаты
производительности перестали быть доверенными.

| Развилка | Решение |
|---|---|
| **GLM-5.3 probe** | **Считать FAIL/UNVERIFIABLE для Vibe-route.** Не принимать его как GLM. Повтор тем же Vibe с другим prompt не нужен. |
| **Wave-3 verifier** | **MiMo-V2.6-Pro** вместо GLM. Mistral Medium 3.5 остаётся вторым advisory cross-check. |
| **2A adversarial prompt** | **Авторизовать Recovery 3 того же Gemini-исполнителя**, но исключительно для mandatory prompt ≤150 строк; никаких правок кода. |
| **DeepSeek 2A RECOMMENDATION** | Достаточно для перехода к freeze/certification, если действительно нет mandatory/blocking findings. Новый DeepSeek-round не нужен. |
| **2A certification** | По `PROTO-DEC-0090`: **MiMo-V2.6-Pro + GPT-5.6 Sol**, не GLM. |
| **Второй merge perf-wave-1** | **Разрешён после точного range-check**, но не безусловный merge HEAD. |
| **A-1** | Решение об исполнителе сохраняется: **Claude Opus 5.5 max**. Но запускать **после стабилизации Windows**, не сейчас. |
| **Perf/profile/V3** | Полностью заморозить до чистого reboot-baseline. Старые результаты автоматически не аннулировать. |

**GLM: почему именно probe-fail.** `VIBE_ACTIVE_MODEL=glm-5.3` доказал только, что алиас не
вызвал ошибки клиента. Он не доказал фактическую модель. Единственный наблюдаемый сигнал заявил
`Mistral Large 24.02`, а Vibe не предоставляет model ID ни в output, ни в журнале. Правильная
формулировка: **Route identity cannot be verified; mandatory GLM probe failed.** Если позже
появится другой маршрут с authoritative provider/model ID, GLM можно перепробовать там; ещё один
self-report через тот же Vibe доказательность не повысит. Для Wave 3: owner-ruling —
**MiMo-V2.6-Pro — primary DIG verifier всех трёх producer-файлов; Mistral Medium 3.5 — advisory
только по чужим диапазонам Gemini + DeepSeek.**

**2A: Recovery 3 оправдана** — инженерная работа закончена, но отсутствует обязательный
implementer-authored artifact. Запуск предельно узкий: ONLY read frozen candidate and review;
write the unified adversarial prompt ≤150 lines; bind it to the exact frozen candidate SHA;
journal + record; exit. FORBIDDEN: implementation changes, test changes, fixes, refactoring,
reopening items 4–6. Падение → FALLEN, автора prompt не подменять без owner-decision. После
prompt: freeze exact 2A candidate → MiMo-V2.6-Pro и GPT-5.6 Sol параллельно и независимо.

**Сначала — инцидент памяти.** Сейчас не запускать Recovery 3, MiMo, Sol, Mistral или Claude —
оба потока закрылись, идеальная точка очистки. Порядок: зафиксировать всё ценное, проверить
`git status` во всех worktree, `git ls-remote origin refs/heads/kernel-batch-1
refs/heads/perf-wave-1 refs/heads/roadmap-wave3 refs/heads/v2.0.0` прямо с машины (GitHub-коннектор
эксперта всё ещё видит `kernel-batch-1 = 5a6cad1`, `perf-wave-1 = 4c25741` — возможно, задержка
или непушенный локальный HEAD; проверить до любого merge/freeze); затем reboot Windows (не
«долечивать» commit pressure по процессам; TextInputHost можно завершить для диагностики — если
private commit мгновенно освобождается, это user-mode runaway, но reboot всё равно нужен из-за
kernel pools); после загрузки, до VS Code, снять baseline (Get-Counter Pool Nonpaged Bytes, Pool
Paged Bytes, Committed Bytes, Commit Limit; TextInputHost Private/WorkingSet/CPU), затем открыть
ОДИН Colabs workspace и повторить через 10–15 минут; если пулы снова растут — PoolMon по тегам,
Driver Verifier не запускать; старое дерево Kilo/Bun PID 42968 после закрытия задач не должно
жить — но сохранить репозитории и перезагрузиться надёжнее.

**Для perf:** ни одного нового control PROFILE / 5×c16 до чистого baseline; PROFILE-1/M1 задним
числом не аннулировать (нет доказательства, что утечка существовала тогда), но новый контрольный
run после 2A должен идти после reboot на стабильной системе. Порядок после reboot (один цикл,
параллелизм убрать): проверить origin SHA; Recovery 3 prompt-only; freeze 2A; MiMo + Sol
certification; если оба позволяют → merge kernel-batch-1; MiMo Wave-3 DIG verification; Mistral
advisory; второй точный perf research/Addendum merge; запуск A-1 (Claude Opus 5.5 max); после
merge 2A → clean control PROFILE → только потом V3. После 2–3 сессий без роста TextInputHost,
Kilo/Bun и kernel pools вернуть разумный параллелизм. Итог: GLM-route отклоняем как unverifiable;
2A prompt пишет Recovery 3 того же Gemini-исполнителя; 2A сертифицируют MiMo+Sol; Wave 3
проверяет MiMo с Mistral advisory; A-1 остаётся за Claude Opus 5.5 max. Первое действие сейчас —
сохранить состояние и перезагрузить машину: найденная память стала инфраструктурным дефектом
среды исполнения.

Дополнение эксперта 3: очень похоже, что проблема была не в `glm-5.3` как таковой, а в контексте
запуска Vibe из конкретного рабочего каталога (в `C:\Projects\test` мог подхватываться local
config, переопределявший активную модель на Mistral). Для протокола записать: предыдущий GLM
probe признать недостоверным из-за возможного cwd/project-config override; выполнить один clean
re-probe из нейтрального каталога; если в `C:\Projects\test` найдётся `.vibe`/`vibe.toml`/
`config.toml`, это почти наверняка причина ложного ответа `Mistral Large 24.02`; пока не
активировать MiMo как замену GLM — статус: previous run = contaminated / inconclusive; current
route = apparently operational; next = one clean neutral-directory probe; при чистом probe
оставить GLM-5.3 основным verifier/certifier, MiMo снова в резерв; скрытую зависимость model
routing от cwd стоит потом записать в `clients.json` как failure mode.

---

## F. Owner's final clarification (for the synthesizer)

The owner has since set the vibe default (model and reasoning depth) through the `vibe` command in
PowerShell: `active_model = "glm-5-3"`. The owner asks the synthesizer to save its ENTIRE output
into the verdict-prompt file.
