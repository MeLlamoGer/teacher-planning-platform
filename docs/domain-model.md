# Domain model

The project is intentionally modeled around a real school-planning workflow rather than around generic CRUD entities.

## Core relationships

```mermaid
erDiagram
    USUARIO ||--o{ USUARIO_CLASE : assigned_to
    CLASE ||--o{ USUARIO_CLASE : has
    USUARIO ||--o{ ACCESO_SUPLENCIA : receives
    CLASE ||--o{ ACCESO_SUPLENCIA : grants

    CLASE ||--o{ PLANIFICACION : contains
    ESPACIO_CURRICULAR ||--o{ PLANIFICACION : categorizes
    PLANIFICACION ||--o{ PLANIFICACION_UNIDAD : selects
    UNIDAD_CURRICULAR ||--o{ PLANIFICACION_UNIDAD : selected_by

    PLANIFICACION ||--o{ ARCHIVO_ADJUNTO : has
    PLANIFICACION ||--o{ COMENTARIO : has
    PLANIFICACION ||--o{ ADAPTACION : has

    CLASE ||--o{ ESTUDIANTE : contains
    ESTUDIANTE ||--o{ DIFICULTAD_APOYO : has
    ADAPTACION ||--o{ ADAPTACION_ESTUDIANTE : targets
    ESTUDIANTE ||--o{ ADAPTACION_ESTUDIANTE : receives
```

## Why temporary substitute access is its own entity

A substitute teacher should not receive a permanent class assignment simply because they cover a class for a few days. `AccesoTemporalSuplencia` therefore stores:

- substitute user;
- class;
- start/end dates;
- creator;
- active status;
- optional reason.

Authorization checks evaluate that date window at request time.

## Curriculum structure

The curriculum is split into:

1. curricular spaces;
2. curricular units;
3. specific competencies;
4. content blocks;
5. individual content items.

A lesson plan references the selected curriculum elements rather than copying their text into one free-form field. That makes later coverage reporting possible.

## Student support

Support needs are stored independently from lesson-plan adaptations:

- `DificultadApoyo` describes an ongoing support need associated with a student and optionally a curriculum area/unit.
- `Adaptacion` describes a concrete adaptation for one lesson plan and may target multiple students.

This distinction keeps persistent student context separate from one-off instructional decisions.
