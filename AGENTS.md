# Agentes de IA - Instrucciones Especiales

Este proyecto utiliza el framework **Superpowers** para la metodología de desarrollo.

## Regla de Oro
**DEBES** consultar y seguir las habilidades definidas en el directorio `./superpowers-skills/skills/` ANTES de realizar cualquier tarea importante.

## Habilidades Disponibles
- **brainstorming**: Usar antes de escribir código para refinar ideas.
- **writing-plans**: Usar para desglosar tareas complejas.
- **test-driven-development (TDD)**: Seguir el ciclo RED-GREEN-REFACTOR.
- **systematic-debugging**: Usar para corregir errores de forma estructurada.
- **frontend-design**: Usar para crear interfaces de alta calidad estética y evitar diseños genéricos de IA.
- **claude-mem**: Usar para gestionar la memoria persistente y el contexto entre sesiones.
- **code-review**: Usar al finalizar tareas o recibir feedback para asegurar rigor técnico y calidad sin acuerdos performativos.
- **security-review**: Usar para auditar el código en busca de vulnerabilidades, secretos expuestos y fallos de seguridad (OWASP 2025).

## Cómo Invocar una Habilidad
Lee el archivo `SKILL.md` correspondiente dentro de:
- `superpowers-skills/skills/[nombre-habilidad]/SKILL.md` (incluye `requesting-code-review` y `receiving-code-review`)
- `frontend-design-skill/SKILL.md` (específico para diseño)
- `claude-mem-skills/plugin/skills/[nombre-habilidad]/SKILL.md`
- `security-review-skill/SKILL.md` (específico para seguridad)
y sigue sus instrucciones al pie de la letra.
