# DeepSeek-Gemini: полное устранение недостатков paired work cycle

Дата: 2026-09-20 UTC. Репозиторий: `D:\Colabs`.
Владелец: RuslanFomenko. Авторизация: PROTO-DEC-0040 в `.ai/DECISIONS.md`.
Anchor документации: `d38d2f2ae4b4c17fe6c2c18f11215cedb2f10eb1`; дерево dirty, заново проверьте состояние.
Адресат первого запуска: **DeepSeek**, контроллер и независимый ревьюер. **Gemini** — исполнитель.
Язык общения с владельцем: русский; код/документация/межагентные материалы могут быть на английском.
Режим: IMPLEMENT → INDEPENDENT CERTIFYING REVIEW → REMEDIATE → RE-CERTIFY.

## Полномочия и результат

Владелец принял независимый аудит и поручил зафиксировать доработки и подготовить этот запуск для полного устранения недостатков. PROTO-DEC-0040 разрешает конечную remediation-задачу, включая необходимые validator/handoff checks и тесты; прежнее обозначение «docs-only» больше не ограничивает эти исправления.
Устраните все обязательные пункты R1-R8 в `.ai/PLAN.md`, подтвердите их воспроизведениями и независимым отчётом. Зелёный старый suite не закрывает findings. Промпт, план, implementation note и старый PASS не заменяют исправленный код и свежую проверку.
Не запрашивайте повторного одобрения на уже разрешённый scope. Реальный конфликт с высшим решением, отсутствие независимого ревьюера или невозможность безопасной архивации оформляйте как конкретный BLOCKED с доказательством; не расширяйте scope молча.
Запреты: commit/tag/push; установка и изменения в Block-Puzzle/VPN из этой сессии; новые MCP/сервисы/мониторинг/receipt formats; v2.0-рефакторинг; изменение frozen product metrics; переписывание исторических reviews/decisions. Реальные проверки установки — только изолированные TEMP-fixtures.

## Прочитать перед работой

1. `AGENTS.md`, `.ai/TASK.md`, `.ai/PLAN.md`, последние журналы, `git status --short --branch`, `git log --oneline -10`.
2. PROTO-DEC-0025, 0037, 0038, 0039, 0040 и последние transitions `docs/decisions/REGISTRY.md`.
3. [Основной аудит Codex](2026-09-20-codex-paired-cycle-review.md): F-001..F-010, A-I, проба P, предложения. Это основной namespace findings, не номера из других отчётов.
4. [Аудит DeepSeek](2026-09-20-deepseek-flash-paired-cycle-review.md), [аудит Gemini](2026-09-20-gemini-paired-cycle-review.md). Перепроверьте, а не копируйте их вердикты.
5. `.ai/docs/PAIRED-CYCLE.md`, `.ai/docs/PROTOCOL.md`, `QUICKSTART.md`, manifest/installer/validator, `.ai/bin/protocol-handoff.cjs`, tests/manifest, installer, upgrade, gate, validator, review-findings и helpers.

## Запуск и ownership

- Если доверенный SessionStart уже создал журнал, используйте его. Иначе `node .ai/bin/protocol-session.cjs start --agent deepseek` либо `--agent gemini`. Одна сессия — один собственный журнал.
- Сохраните отдельно Session id и Owner name. Во всех `--owner` используйте Owner name (basename журнала), а в `stop --session` — Session id. Не передавайте буквальные плейсхолдеры.
- Shared-документы редактируются только после `node .ai/bin/protocol-lock.cjs acquire --owner <OwnerName>`; освобождаются тем же владельцем. Возраст/мёртвый CLI PID не доказывает завершение кооперативного владельца. Чужой активный lock не снимать.
- Прочитайте чужой dirty diff до своей правки. Не делайте checkout/reset/clean/rebase чужих изменений. Для существенного кода согласуйте изолированную ветку/checkout, если работа идёт одновременно; не переключайте общий checkout за спиной других сессий.
- До новых артефактов посчитайте corpus и journals. Архивируйте только допустимую завершённую историю штатными инструментами; сохраняйте active/cited receipts, live/unknown sessions и INDEX mappings. Историю не удалять. Worklog/ARCHIVE и review-corpus — разные процедуры.

## Пакет исправлений

| Пункт | Сделать | Критерий проверки |
|---|---|---|
| R1 / F-001,F-007 | Добавить PAIRED-CYCLE в допустимые reconciled docs; закрепить обязательную managed-запись | Изменение на хосте WARN/exit 0; отсутствие файла FAIL; тест проваливается при потере записи из manifest |
| R2 / F-002 | Перестроить фазы, роли, diagram и критерии завершения | Gemini сохраняет unified prompt до независимого review; нет Completed до полного core review+gate; остановка для передачи не равна завершению |
| R3 / F-003,F-004,B | Исправить четыре шаблона и их команды | `Unified Adversarial Audit Prompt`, `--deep`, output header/binding, точные test commands; заполненные шаблоны пригодны в fresh source/installed session |
| R4 / F-008,A,H | Исправить последовательность записи артефактов и receipts | Prompt/review/TASK/архивация до финального record; producer проверен до consumer edits; отличать excluded journals/runtime от tracked artifacts |
| R5 / F-006 | Отдельной волной согласовать существующие PS/Node completion checks с 0038 | Docs/config low-risk statement проходит; core/security/data не обходятся словом docs; source/installed согласованы |
| R6 / F-005 | Проверить уже записанные 0040/registry/TASK/PLAN | Реальная датированная owner provenance, узкое исключение, старые блоки неизменны; не создавать дубль решения |
| R7 / B,G,H | Сделать роли, host paths и upgrade guidance переносимыми | Gemini/DeepSeek — примеры, а не автоназначения; owner-selected in-repo review path; никакой зависимости host от source-only файлов |
| R8 / H,F-010 | Восстановить бюджеты и правдивые заявления о проверках | <=30 journals и <=60 active review files/600 KB на приёмке; безопасная архивация; существующий validator согласован с 0037 WARN-first без нового слоя |

Общий allow-list и полные критерии — `.ai/PLAN.md`, разделы remediation. Сначала читайте реализацию, затем меняйте её. Не надо добавлять VERSION=1.9.6 во все тесты: проверяйте согласованность версии и публичный installed-путь.
R5 нельзя закрыть одной редактурой ранбука: текущий validator реально требует prompt+report даже для опечатки README. DeepSeek до кодирования формулирует минимальный консервативный контракт в dispatch/note: core при неопределённости; защищённые paths/поведение имеют приоритет над размером diff и авторской меткой; конкретный baseline и scope проверяются, а не берутся на веру из текста задачи.
Формат поля/детекция риска — решение реализации, которое надо обосновать и проверить; этот prompt не утверждает новую архитектуру. Меняйте существующие checks, не создавайте новый gate или внешний классификатор. Reviewers не могут ослабить 0038 собственным ярлыком low-risk.
Разведите source `docs/reviews/` и путь хоста, назначенный его владельцем. Без назначения не пишите в чужой namespace. Проверяйте нормализацию/границы пути, traversal/linked destinations и наличие артефактов; не ломайте действующие source completion bindings.
В шаблоне CERTIFY явно требуйте `Reviewer`, `Date`, commit/tree baseline, `Mode: CERTIFYING`, `Receipt-Owner`, verdict и ссылку на review в пяти-полевой записи журнала. Capability определяется средой, а не заголовком запроса. ADVISORY не удовлетворяет core gate.
Уточните scope --quick: validator-only receipt не удостоверяет suite; он также не доказывает, что suite отдельно не запускался. Финальные core receipts — полный `record`.
Corpus warning должен отражать уже принятое 0037 и реальную стадию миграции; не придумывайте задним числом релиз перехода к FAIL. Сам housekeeping не требует переписывать append-only историю.

## Порядок работы тандема

1. **DeepSeek**: воспроизвести baseline, зафиксировать scope/контракт R5 и ограниченный dispatch для Gemini; не начинать собственную реализацию. Один общий finding checklist R1-R8, без копий одинаковых отчётов.
2. **Gemini**: выполнить R1-R4/R7 и связанные тесты; implementation note может быть частью собственного журнала. Сохранить единый adversarial prompt с реальным итоговым diff, командами, негативными сценариями и перечислением каждого пункта. Передать evidence DeepSeek, TASK остаётся In progress.
3. **DeepSeek**: из независимой сессии проверить evidence до добавления своих artifacts, повторить reproductions и атаковать изменённую реализацию. При FAIL вернуть Gemini конкретные findings/test names. Не исправлять код самому и затем сертифицировать собственные изменения.
4. **Gemini → DeepSeek**: отдельная волна R5; доказать обычный лёгкий путь и невозможность downgrade core. Разрешить R8 до финальной записи. Выпустить итоговый unified prompt, покрывающий также R6 и весь diff обеих волн.
5. **DeepSeek**: финальный независимый CERTIFYING report со статусом каждого R1-R8, фактическими командами/exits и limits. Обязательное незакрытое замечание = FAIL; RECOMMENDATION допускает только необязательные улучшения. Дополнительного независимого эксперта подключать при споре/риске, а не ради числа голосов.
6. Финализировать файлы и acceptance-пункты TASK под локом. Затем каждый участник пишет собственный journal/receipt на том же конечном дереве: Gemini, затем DeepSeek. Не редактировать чужой журнал и не «освежать» чужой receipt.
7. После recording выполнить deep verify и validator без bypass. Изменение hash-covered файла после записи требует повторной оценки scope и нового корректного recording. Не расширять digest exclusions ради зелёной проверки.

## Проверки и отрицательные сценарии

```powershell
powershell -ExecutionPolicy Bypass -File .\validate-protocol.ps1
powershell -ExecutionPolicy Bypass -File .\test-protocol.ps1
node .ai/bin/protocol-handoff.cjs record --owner <OwnerName>
node .ai/bin/protocol-handoff.cjs verify --owner <OwnerName> --deep
node .ai/bin/protocol-handoff.cjs gate-check
```

`<OwnerName>` заменить своим SessionStart Owner name. Full record уже запускает validator/suite; повторять их без новых изменений/неудачи не требуется. В installed-fixture отдельно выполняйте подходящий host testCommand, не ссылайтесь на отсутствующий test-protocol.ps1.
- Позитивные: canonical install; edited-doc WARN; completed core с полноценным fresh binding; docs-only statement; owner-selected safe host path; заполненные 4 шаблона; реальные tag-fixtures v1.9.4/v1.9.5 + текущий -Force.
- Негативные: удалённый managed-файл/entry; прежний title без unified; неполный header; stale/missing receipt; ADVISORY вместо CERTIFYING; Completed до review; core/security/config patch под low-risk меткой; неизвестный риск; traversal/внешний path.
- Сохраните проверки цепочки active journal и --deep archived parents, staging/commit digest stability, source vs installed semantics. Fixtures могут моделировать Completed; не меняйте глобальный TASK на Completed только ради зелёного gate.
- Бюджеты: counts/bytes до и после; пограничные WARN cases по 0037; не считать переполнение «не относящимся к задаче» при заявлении 0 warnings. Если живые сессии препятствуют безопасному <=30, укажите воспроизведение и потребность в решении владельца.
- F-009 опровергнут: отсутствие тега незакоммиченного кандидата не исправлять откатом версии. F-010 — исторический дрейф; переизмерить, а не обвинять прошлые сессии в фальсификации. Arbitrary I/O rollback установщика не доказан и не входит в эту доработку.

## Артефакты и завершение

Сначала резервируйте минимум два review-слота и нужные journals. Prompt <=150 строк, report <=250 строк. При дополнительных раундах сохраняйте новые версии, не перезаписывайте исторические reviews; перед превышением cap выполните разрешённую classify-first архивацию либо сообщите точный блокер.
Рекомендуемые новые пути: `docs/reviews/2026-09-20-gemini-paired-cycle-remediation-adversarial-prompt.md` и `docs/reviews/2026-09-20-deepseek-paired-cycle-remediation-review.md`; при существовании занятых путей используйте новый round suffix. Implementation note допускается в своём журнале, чтобы не раздувать корпус.
Подготовленный здесь launch-prompt не заменяет итоговый unified audit prompt по изменённому коду. Не переиспользуйте исторический Codex FAIL как финальную сертификацию или актуальный receipt.
В реальном umbrella TASK остаются пилоты: после принятия remediation отмечайте только относящиеся к ней acceptance-пункты, общий `Status: In progress` сохраняется. `gate-check` → not applicable для такого TASK честно указывается как N/A; Completed-path acceptance доказывается отдельными fixtures и независимым отчётом, не ложным live PASS.
В финальном сообщении владельцу: verdict, ссылки на final prompt/report, R1-R8 disposition, реальные проверки/receipt owners, оставшиеся ограничения и следующий шаг по уже утверждённым пилотам. Самостоятельно не запускать продуктовые изменения из протокольной сессии.
