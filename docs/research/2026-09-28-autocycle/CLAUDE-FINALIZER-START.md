# Start prompt for the Claude finalizer session (the owner pastes it before sleeping)

Open Claude Code on the workstation in `D:\Colabs`. Model: Opus 5.5, effort **High** (not higher).
Keep the session and the PC awake all night: Windows power settings, no sleep on AC.
Paste the text below as the first message.

```text
Ты — финализатор AUTOCYCLE-1 (Claude, effort High). Правила — docs/research/2026-09-28-autocycle/AUTOCYCLE-PROMPT.md,
разделы 5, 6 и 9; прочитай их и STATE.md целиком. Ты ничего не исполняешь, не сертифицируешь и не голосуешь;
ты только фиксируешь итоговый промпт цикла.

Подготовка (один раз):
1. git -C D:\Colabs fetch origin
2. Если ветки autocycle-claude нет: git -C D:\Colabs worktree add .ai/runtime/claude-final -b autocycle-claude origin/v2.0.0
   Если есть: git -C D:\Colabs worktree add .ai/runtime/claude-final autocycle-claude
3. Работай только в D:\Colabs\.ai\runtime\claude-final. Начни сессию протокола как обычно (журнал создаёт SessionStart).

Ожидание (без /loop, чтобы не тратить токены):
- Запусти в ФОНЕ (run_in_background) из корня worktree:
  node docs/research/2026-09-28-autocycle/tools/mailbox.cjs wait-request --interval 180
  Он завершится только когда появится запрос; тогда ты проснёшься. Пока ждёшь — ничего не делай.

Когда пришло «PENDING cycle=Cnn»:
1. git fetch origin; git merge --no-edit origin/v2.0.0 (без rebase).
2. Прочитай cycles/Cnn/05-FINAL-REQUEST.md (в нём уже есть STATE; дополнительно читай только то, на что он ссылается;
   всего не больше 60 КБ).
3. Напиши cycles/Cnn/06-FINAL-PROMPT.md (≤ 200 строк, структура как у cycles/C01/00-PROMPT.md), строго по правилам:
   (1) каждый ACCEPTED-пункт — директивой, с его id; (2) ни одного нового решения от себя;
   (3) можно добавлять детали исполнения — команды, пути, проверки; (4) пункт, противоречащий .ai/DECISIONS.md
   или разделу 6 (делегирование и зарезервированные категории), — в OWNER-QUEUE с причиной, не в исполнение;
   (5) перечисли HYPOTHESES, DROPPED, OWNER; (6) хотя бы один шаг внедрения уже утверждённой работы ядра (раздел 12);
   (7) рекомендуемые участники следующего цикла — по E из MEASUREMENTS (раздел 8), без Sol, MiMo и Claude;
   (8) последняя строка — STATUS: READY.
4. Запись в журнал (пять меток), node .ai/bin/protocol-handoff.cjs record --quick --owner <твоя сессия>.
5. git add только 06-FINAL-PROMPT.md и свой журнал; commit; git push origin autocycle-claude. В v2.0.0 не сливай — это делает оператор.
6. Снова запусти фоновое ожидание (шаг «Ожидание»).

Стоп: после NIGHT_END (2026-09-28 09:00 МСК) или MAX_CYCLES=8 — не запускай ожидание снова, напиши в журнал «finalizer stopped».
Если запрос содержит строки WAKE — просто обработай его. Ничего вне своих двух файлов не меняй. Подагентов не запускай.
С владельцем — по-русски.
```
