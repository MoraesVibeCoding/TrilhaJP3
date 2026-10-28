#!/bin/sh
# Modo i-have-adhd sempre ativo neste projeto (pedido do Pedro, 2026-10-28): injeta as regras da skill
# .claude/skills/i-have-adhd/SKILL.md (MIT, github.com/ayghri) no início de cada sessão. Nunca bloqueia o início.
skill="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/i-have-adhd/SKILL.md"
[ -f "$skill" ] || exit 0
printf 'ADHD MODE ACTIVE (always-on neste projeto). As regras abaixo valem para toda resposta. "stop adhd mode" desliga nesta sessão.\n\n'
# tira o bloco YAML do topo (--- ... ---)
awk 'NR==1 && /^---[[:space:]]*$/ {fm=1; next} fm && /^---[[:space:]]*$/ {fm=0; next} !fm' "$skill" || exit 0
