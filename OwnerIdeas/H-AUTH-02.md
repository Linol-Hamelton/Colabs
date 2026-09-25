
# H-AUTH-02 — BOUNDED EXECUTION AUTHORIZATION

Проверить, может ли owner один раз разрешить класс действий
без превращения owner в runtime bottleneck
и без неявного расширения authority.

Главный принцип для проверки:

already authorized
+
current machine-verifiable state
+
exactly one permitted transition
→
execute without repeated owner confirmation.

Но:

LLM judgement that an action is "obvious", "rational",
"equivalent" or "already implied"
НЕ считается deterministic authorization.

Исследовать необходимость capability envelope:

scope-id
run-id
participant/session identity
allowed read paths
allowed write paths
allowed tools
allowed command classes
network authority
secret authority
git authority
expiry / terminal state
delegated judgement boundaries.

Проверить отдельно:

1. narrow working directory != sandbox;
2. git diff != prevention boundary;
3. ignored/untracked/external filesystem side effects;
4. process/network/global-config side effects;
5. restart/resume/fallback inheritance of permissions;
6. stale or superseded authorization;
7. whether broad CLI flags can be wrapped by a narrower
   deterministic enforcement layer.

Required outcome:

define precisely when:
EXECUTE
DELEGATED-JUDGEMENT
OWNER-DECISION
STOP

without relying on free-form model interpretation.
