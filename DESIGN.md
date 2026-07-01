# PARC Lab Course Sites Design System

## 1. Atmosphere & Identity

The course sites should feel like a calm engineering notebook: approachable for first-year students, but clearly connected to real mobility and robotics systems. The signature is a practical lab flow: concept, small C program, board behavior, robot/ROS2 extension, and a short self-check.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/primary | `--surface-primary` | Material default | Material slate | MkDocs page background |
| Surface/secondary | `--surface-secondary` | Material card/admonition surface | Material slate elevated | Tables, admonitions, tabs |
| Text/primary | `--text-primary` | Material default | Material default | Body and headings |
| Text/secondary | `--text-secondary` | Material muted | Material muted | Captions and metadata |
| Border/default | `--border-default` | Material divider | Material divider | Tables and code blocks |
| Accent/primary | `--accent-primary` | Teal | Teal | Links, navigation, focus |
| Status/success | `--status-success` | Material success | Material success | Correct answers, completed checks |
| Status/warning | `--status-warning` | Material warning | Material warning | Safety notes and pitfalls |
| Status/error | `--status-error` | Material error | Material error | Critical mistakes |
| Status/info | `--status-info` | Material info | Material info | Learning notes |

### Rules

- Keep MkDocs Material's teal primary/accent palette for course consistency.
- Use admonition types semantically: `tip` for learning advice, `warning` for safety or common mistakes, `success` for answers, `note` for context.
- Do not introduce decorative color systems inside course Markdown.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| H1 | MkDocs Material default | 600 | Default | 0 | Page title |
| H2 | MkDocs Material default | 600 | Default | 0 | Major lecture sections |
| H3 | MkDocs Material default | 600 | Default | 0 | Theory, lab, exercise subsections |
| Body | MkDocs Material default | 400 | Default | 0 | Lecture explanation |
| Code | MkDocs Material code default | 400 | Default | 0 | C, Arduino, shell, ROS2 snippets |

### Font Stack

- Primary: MkDocs Material Korean/system font stack.
- Mono: MkDocs Material code font stack.

### Rules

- Write headings as learning waypoints, not slogans.
- Keep code blocks short enough for students to copy and test.
- Prefer Korean explanations with English technical terms in parentheses on first use.

## 4. Spacing & Layout

### Base Unit

All custom layout should align to a 4px rhythm through MkDocs Material defaults.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Table and list rhythm |
| `--space-4` | 16px | Default paragraph/list separation |
| `--space-6` | 24px | Section grouping |
| `--space-10` | 40px | Major lecture breaks |

### Grid

- Use MkDocs Material's responsive content column and navigation.
- Use Markdown tables for rubrics and comparison matrices.
- Use tabbed blocks only when students must choose one path, such as Serial Bridge vs micro-ROS.

### Rules

- Each lecture page should follow: goals, theory, key terms, lab, assignment, references, self-check.
- Long code should live in `docs/code/` and be linked from the lecture page.

## 5. Components

### Lecture Page

- **Structure**: title, course/CLO metadata, optional image, learning goals, theory, terminology table, labs, assignment, references, checkpoints, practice questions.
- **Variants**: weekly lecture, deep-dive note, exam prep note.
- **Accessibility**: images need descriptive alt text; tables need clear headers.

### Lab Block

- **Structure**: problem, concept bridge, steps, code path, expected output, debugging checklist.
- **States**: basic, challenge, safety-gated.
- **Accessibility**: command/code blocks use language identifiers.

### Safety Admonition

- **Structure**: `!!! warning "안전 최우선"` followed by concrete pre-run checks.
- **Usage**: any robot motion, motor test, network control, or serial command that can move hardware.

## 6. Motion & Interaction

MkDocs Material handles page transitions and navigation. Do not add custom animation for course content. Interactive behavior should come from built-in tabs, details blocks, search, and copyable code blocks.

## 7. Depth & Surface

### Strategy

Use MkDocs Material's mixed strategy: subtle tonal surfaces for admonitions/tabs/code, default table borders for dense technical reference.

### Rules

- Do not nest card-like structures inside admonitions.
- Use code blocks and tables as the primary visual rhythm for technical material.
