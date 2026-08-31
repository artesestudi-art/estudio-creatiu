-- Esquema del estudio (Neon Postgres).
-- Se aplica con: npm run migrar
-- Todo es CREATE IF NOT EXISTS: lanzarlo dos veces no rompe nada.

  CREATE TABLE IF NOT EXISTS cursos (
    id              SERIAL PRIMARY KEY,
    slug            TEXT UNIQUE NOT NULL,
    titulo          TEXT NOT NULL,
    disciplina      TEXT,
    modalidad       TEXT NOT NULL DEFAULT 'presencial',
    nivel           TEXT,
    resumen         TEXT,
    descripcion     TEXT,
    temario         TEXT,
    duracion        TEXT,
    horario         TEXT,
    precio_texto    TEXT,
    precio_centimos INTEGER,
    plazas          INTEGER,
    profesor        TEXT,
    imagen          TEXT,
    imagen_alt      TEXT,
    seo_titulo      TEXT,
    seo_descripcion TEXT,
    orden           INTEGER NOT NULL DEFAULT 0,
    publicado       BOOLEAN NOT NULL DEFAULT false,
    destacado       BOOLEAN NOT NULL DEFAULT false,
    creado          TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado     TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS convocatorias (
    id        SERIAL PRIMARY KEY,
    curso_id  INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    etiqueta  TEXT,
    inicio    DATE,
    fin       DATE,
    horario   TEXT,
    modalidad TEXT,
    plazas    INTEGER,
    estado    TEXT NOT NULL DEFAULT 'abierta',
    orden     INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS convocatorias_curso ON convocatorias (curso_id);

  CREATE TABLE IF NOT EXISTS inscripciones (
    id                 SERIAL PRIMARY KEY,
    creado             TIMESTAMPTZ NOT NULL DEFAULT now(),
    nombre             TEXT NOT NULL,
    email              TEXT NOT NULL,
    telefono           TEXT,
    curso_id           INTEGER REFERENCES cursos(id) ON DELETE SET NULL,
    convocatoria_id    INTEGER REFERENCES convocatorias(id) ON DELETE SET NULL,
    curso_titulo       TEXT NOT NULL,
    convocatoria_texto TEXT,
    modalidad          TEXT,
    experiencia        TEXT,
    mensaje            TEXT,
    origen             TEXT NOT NULL DEFAULT '/',
    estado             TEXT NOT NULL DEFAULT 'nueva',
    notas              TEXT,
    aviso_enviado      BOOLEAN NOT NULL DEFAULT false,
    aviso_error        TEXT
  );
  CREATE INDEX IF NOT EXISTS inscripciones_creado ON inscripciones (creado DESC);

  CREATE TABLE IF NOT EXISTS contactos (
    id            SERIAL PRIMARY KEY,
    creado        TIMESTAMPTZ NOT NULL DEFAULT now(),
    nombre        TEXT NOT NULL,
    email         TEXT NOT NULL,
    telefono      TEXT,
    asunto        TEXT,
    mensaje       TEXT NOT NULL,
    origen        TEXT NOT NULL DEFAULT '/',
    estado        TEXT NOT NULL DEFAULT 'nuevo',
    notas         TEXT,
    aviso_enviado BOOLEAN NOT NULL DEFAULT false,
    aviso_error   TEXT
  );
  CREATE INDEX IF NOT EXISTS contactos_creado ON contactos (creado DESC);

  CREATE TABLE IF NOT EXISTS suscriptores (
    id         SERIAL PRIMARY KEY,
    creado     TIMESTAMPTZ NOT NULL DEFAULT now(),
    email      TEXT UNIQUE NOT NULL,
    nombre     TEXT,
    origen     TEXT NOT NULL DEFAULT '/',
    baja       BOOLEAN NOT NULL DEFAULT false,
    baja_fecha TIMESTAMPTZ,
    token      TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contenidos (
    clave       TEXT PRIMARY KEY,
    valor       JSONB NOT NULL,
    actualizado TIMESTAMPTZ NOT NULL DEFAULT now()
  );


-- ─────────────────────── Catalán ───────────────────────
-- La traducción vive en una columna JSON y no en veinte columnas `_ca`:
-- añadir un campo traducible no obliga entonces a migrar la tabla otra vez.
-- `ADD COLUMN IF NOT EXISTS` es idempotente: se puede relanzar sin miedo.

ALTER TABLE cursos ADD COLUMN IF NOT EXISTS ca JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE convocatorias ADD COLUMN IF NOT EXISTS ca JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Índice sobre el slug catalán: es por donde entra Google a /ca/cursos/…
CREATE INDEX IF NOT EXISTS cursos_slug_ca ON cursos ((ca->>'slug'));
