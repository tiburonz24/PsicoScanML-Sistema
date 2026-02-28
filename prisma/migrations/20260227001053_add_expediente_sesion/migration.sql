-- CreateEnum
CREATE TYPE "EstadoExpediente" AS ENUM ('ACTIVO', 'CERRADO', 'DERIVADO', 'EN_ESPERA');

-- CreateEnum
CREATE TYPE "TipoSesion" AS ENUM ('EVALUACION_INICIAL', 'SEGUIMIENTO', 'INTERVENCION', 'CRISIS', 'CIERRE', 'DEVOLUCION');

-- CreateTable
CREATE TABLE "ExpedienteClinico" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "motivoConsulta" TEXT,
    "antecedentes" TEXT,
    "diagnosticoPreliminar" TEXT,
    "planIntervencion" TEXT,
    "estado" "EstadoExpediente" NOT NULL DEFAULT 'ACTIVO',
    "abiertaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpedienteClinico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoSesion" NOT NULL DEFAULT 'SEGUIMIENTO',
    "motivo" TEXT,
    "notas" TEXT NOT NULL,
    "acuerdos" TEXT,
    "planActualizado" TEXT,
    "citaId" TEXT,
    "estudianteId" TEXT NOT NULL,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExpedienteClinico_estudianteId_key" ON "ExpedienteClinico"("estudianteId");

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_citaId_key" ON "Sesion"("citaId");

-- AddForeignKey
ALTER TABLE "ExpedienteClinico" ADD CONSTRAINT "ExpedienteClinico_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita"("id") ON DELETE SET NULL ON UPDATE CASCADE;
