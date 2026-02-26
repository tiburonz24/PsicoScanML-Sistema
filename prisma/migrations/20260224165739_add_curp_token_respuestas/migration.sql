-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ESTUDIANTE', 'PSICOLOGO', 'ORIENTADOR', 'DIRECTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoCaso" AS ENUM ('INCONSISTENCIA', 'SIN_RIESGO', 'IMPRESION_POSITIVA', 'IMPRESION_NEGATIVA', 'CON_RIESGO');

-- CreateEnum
CREATE TYPE "Semaforo" AS ENUM ('VERDE', 'AMARILLO', 'ROJO', 'ROJO_URGENTE');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estudianteId" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "id" TEXT NOT NULL,
    "curp" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "grado" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "escuela" TEXT NOT NULL,
    "tokenEncuesta" TEXT NOT NULL,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RespuestasCuestionario" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estudianteId" TEXT NOT NULL,
    "respuestas" JSONB NOT NULL,
    "procesado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RespuestasCuestionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tamizaje" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estudianteId" TEXT NOT NULL,
    "inc" DOUBLE PRECISION NOT NULL,
    "neg" DOUBLE PRECISION NOT NULL,
    "pos" DOUBLE PRECISION NOT NULL,
    "glo_t" INTEGER NOT NULL,
    "emo_t" INTEGER NOT NULL,
    "con_t" INTEGER NOT NULL,
    "eje_t" INTEGER NOT NULL,
    "ctx_t" INTEGER NOT NULL,
    "rec_t" INTEGER NOT NULL,
    "dep_t" INTEGER NOT NULL,
    "ans_t" INTEGER NOT NULL,
    "asc_t" INTEGER NOT NULL,
    "som_t" INTEGER NOT NULL,
    "pst_t" INTEGER NOT NULL,
    "obs_t" INTEGER NOT NULL,
    "ate_t" INTEGER NOT NULL,
    "hip_t" INTEGER NOT NULL,
    "ira_t" INTEGER NOT NULL,
    "agr_t" INTEGER NOT NULL,
    "des_t" INTEGER NOT NULL,
    "ant_t" INTEGER NOT NULL,
    "sus_t" INTEGER NOT NULL,
    "esq_t" INTEGER NOT NULL,
    "ali_t" INTEGER NOT NULL,
    "fam_t" INTEGER NOT NULL,
    "esc_t" INTEGER NOT NULL,
    "com_t" INTEGER NOT NULL,
    "reg_t" INTEGER NOT NULL,
    "bus_t" INTEGER NOT NULL,
    "aut_t" INTEGER NOT NULL,
    "soc_t" INTEGER NOT NULL,
    "cnc_t" INTEGER NOT NULL,
    "tipoCaso" "TipoCaso" NOT NULL,
    "semaforo" "Semaforo" NOT NULL,
    "observaciones" TEXT,
    "itemsCriticos" JSONB NOT NULL,

    CONSTRAINT "Tamizaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "estudianteId" TEXT NOT NULL,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_estudianteId_key" ON "Usuario"("estudianteId");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_curp_key" ON "Estudiante"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_tokenEncuesta_key" ON "Estudiante"("tokenEncuesta");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestasCuestionario" ADD CONSTRAINT "RespuestasCuestionario_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tamizaje" ADD CONSTRAINT "Tamizaje_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
