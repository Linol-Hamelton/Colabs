# CodeGeeX (GLM) - Adversarial Audit: Protocol v1.9.0 - v1.9.2

**Date**: 2026-09-18T04:30:00Z  
**Reviewed commit**: a6a6d6194e08e313dce1328cc8af971962f91fa5 (HEAD)  
**Working tree**: clean  
**Reviewer**: CodeGeeX (GLM Chat Panel)  
**Scope**: [audit | architecture | edge-cases | security]  
**Verdict**: FAIL (3 критических уязвимости обнаружено)  

> Transcribed from chat by RuslanFomenko, model: CodeGeeX / GLM, date: 2026-09-18T05:00:00Z

---

## Executive Summary

Обнаружены 3 критических уязвимости (F-001, F-002, F-003), требующие исправления перед релизом:
1. Merkle-цепочка уязвима к атаке на разделители записей.
2. Race condition и файловые блокировки при атомарной записи на Windows.
3. Неполная проверка целостности шаблонов рецензий в валидаторе.

---

## Findings

| Id | Severity | Title | Location | Impact | Status |
|---|---|---|---|---|---|
| F-001 | CRITICAL | Merkle-цепочка уязвима к атаке на разделители записей | `.ai/bin/protocol-handoff.cjs:156` | Позволяет вставить запись с подмененным parent-entry при нестандартных разделителях | Open |
| F-002 | CRITICAL | Race condition и блокировки при атомарной записи на Windows | `.ai/bin/protocol-archive.cjs:89` | Риск потери данных или сбоя при отсутствии retry на rename | Open |
| F-003 | HIGH | Неполная проверка полей шаблонов рецензий в валидаторе | `validate-protocol.ps1:234` | Валидатор пропускает рецензии с отсутствующими обязательными полями | Open |

### F-001 - CRITICAL - Merkle-цепочка уязвима к атаке на разделители записей

- **Location**: `.ai/bin/protocol-handoff.cjs:156`
- **Reproduction**:
  ```bash
  # Создать handoff с манипулированным разделителем
  echo "---\nparent-entry: sha256:fake\n---\n" >> worklog.md
  node .ai/bin/protocol-handoff.cjs verify
  ```
- **Impact**: Позволяет легально вставить запись с подмененным parent-entry, нарушая целостность цепочки.
- **Recommendation / Proposed Fix**:
  ```javascript
  // В protocol-handoff.cjs добавить строгую проверку разделителей
  const SECTION_DELIMITER = /^---\n$/m;
  if (!SECTION_DELIMITER.test(section)) {
    return { status: 'tampered', reason: 'Invalid section delimiter' };
  }
  ```

### F-002 - CRITICAL - Race condition при атомарной записи на Windows

- **Location**: `.ai/bin/protocol-archive.cjs:89`
- **Reproduction**:
  ```bash
  # Параллельный или быстрый последовательный запуск архиватора
  node .ai/bin/protocol-archive.cjs &
  node .ai/bin/protocol-archive.cjs &
  ```
- **Impact**: Возможна ошибка EPERM/EBUSY от антивируса или индексатора Windows при fs.renameSync.
- **Recommendation / Proposed Fix**:
  Добавить цикл повторных попыток (retry loop) с экспоненциальной задержкой при блокировках Windows.

### F-003 - HIGH - Неполная проверка целостности шаблонов рецензий

- **Location**: `validate-protocol.ps1:234`
- **Impact**: Валидатор проверяет только наличие файлов, но не проверяет структуру обязательных метаданных в рецензиях.
- **Recommendation / Proposed Fix**:
  Добавить валидацию обязательных полей (`Date`, `Reviewed commit`, `Reviewer`, `Scope`, `Verdict`) в отчётах `docs/reviews/`.
