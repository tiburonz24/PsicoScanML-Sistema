-- CreateEnum
CREATE TYPE "TipoContacto" AS ENUM ('LLAMADA', 'MENSAJE_TEXTO', 'CONTACTO_POR_ALUMNO', 'CITA_PADRES');

-- CreateEnum
CREATE TYPE "ResultadoContacto" AS ENUM ('CONTESTO', 'NO_CONTESTO', 'MENSAJE_ENVIADO', 'SIN_RESPUESTA', 'ACUDIO', 'NO_ACUDIO');

-- CreateEnum
CREATE TYPE "TipoInstitucion" AS ENUM ('PUBLICA', 'PRIVADA');

-- CreateEnum
CREATE TYPE "EstadoCanalizacion" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'SIN_SEGUIMIENTO');

-- AlterTable
ALTER TABLE "ExpedienteClinico" ADD COLUMN     "nivelRiesgo" INTEGER;

-- CreateTable
CREATE TABLE "ContactoPadres" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" "TipoContacto" NOT NULL,
    "resultado" "ResultadoContacto" NOT NULL,
    "notas" TEXT,

    CONSTRAINT "ContactoPadres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Canalizacion" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "tipoInstitucion" "TipoInstitucion" NOT NULL DEFAULT 'PUBLICA',
    "tipoAtencion" TEXT,
    "motivo" TEXT NOT NULL,
    "nivelRiesgo" INTEGER,
    "urgente" BOOLEAN NOT NULL DEFAULT false,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoCanalizacion" NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "firmaPadres" BOOLEAN NOT NULL DEFAULT false,
    "documentoRecibido" BOOLEAN NOT NULL DEFAULT false,
    "tipoDocumento" TEXT,
    "fechaDocumento" TIMESTAMP(3),

    CONSTRAINT "Canalizacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContactoPadres" ADD CONSTRAINT "ContactoPadres_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Canalizacion" ADD CONSTRAINT "Canalizacion_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
