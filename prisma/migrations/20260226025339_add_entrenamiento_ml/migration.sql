-- CreateTable
CREATE TABLE "EntrenamientoML" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nRegistros" INTEGER NOT NULL,
    "trainSize" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "cvMean" DOUBLE PRECISION NOT NULL,
    "cvStd" DOUBLE PRECISION NOT NULL,
    "nEstimators" INTEGER NOT NULL,
    "report" JSONB NOT NULL,
    "importance" JSONB NOT NULL,

    CONSTRAINT "EntrenamientoML_pkey" PRIMARY KEY ("id")
);
