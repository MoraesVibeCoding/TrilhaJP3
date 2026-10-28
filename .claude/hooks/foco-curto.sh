#!/bin/sh
# Skill foco-curto sempre ativa neste projeto (pedido de 2026-10-28): injeta .claude/skills/foco-curto/SKILL.md
# no início de cada sessão. Junta a forma i-have-adhd, o texto enxuto e o código mínimo. Nunca bloqueia o início.
skill="${CLAUDE_PROJECT_DIR:-.}/.claude/skills/foco-curto/SKILL.md"
[ -f "$skill" ] || exit 0
printf 'FOCO-CURTO ATIVO (sempre, neste projeto). As regras abaixo valem para toda resposta. "modo normal" desliga nesta sessão.\n\n'
# tira o bloco YAML do topo (--- ... ---)
awk 'NR==1 && /^---[[:space:]]*$/ {fm=1; next} fm && /^---[[:space:]]*$/ {fm=0; next} !fm' "$skill" || exit 0
