"""
Servicio de clasificacion ML para PsicoScan.

Logica de reglas basada en los 5 casos tipo del documento Aranque.txt.
Se reemplazara por modelo entrenado (XGBoost/Scikit-learn) cuando se
tenga el dataset de 2,000 tamizajes procesados.
"""

import os
import pickle
from schemas.tamizaje import TamizajeInput, TamizajeOutput


class ClasificadorML:
    def __init__(self):
        self.modelo = None
        self.version = "0.1.0-reglas"
        self._cargar_modelo()

    def _cargar_modelo(self):
        """Carga el modelo entrenado si existe, de lo contrario usa reglas."""
        ruta_modelo = os.path.join(os.path.dirname(__file__), "../models/modelo.pkl")
        if os.path.exists(ruta_modelo):
            with open(ruta_modelo, "rb") as f:
                self.modelo = pickle.load(f)
                self.version = "1.0.0-ml"

    def predecir(self, datos: TamizajeInput) -> TamizajeOutput:
        if self.modelo:
            return self._predecir_ml(datos)
        return self._predecir_reglas(datos)

    def _predecir_reglas(self, d: TamizajeInput) -> TamizajeOutput:
        """
        Clasificacion por reglas basada en los criterios del SENA.
        Referencia: Aranque.txt — Seccion 3 (Los 5 casos tipo).
        """

        # CASO 1 — Inconsistencia: INC >= 1.2
        if d.inc >= 1.2:
            return TamizajeOutput(
                estudiante_id=d.estudiante_id,
                tipo_caso="INCONSISTENCIA",
                semaforo="AMARILLO",
                observaciones="Cuestionario con inconsistencias. Solicitar repeticion.",
            )

        # CASO 3 — Impresion positiva: POS >= 8
        if d.pos >= 8:
            return TamizajeOutput(
                estudiante_id=d.estudiante_id,
                tipo_caso="IMPRESION_POSITIVA",
                semaforo="AMARILLO",
                observaciones="Sesgo de impresion positiva detectado. Revisar con psicologo.",
            )

        # CASO 4 — Impresion negativa: NEG >= 5 con indices elevados
        if d.neg >= 5 and d.glo_t >= 70:
            return TamizajeOutput(
                estudiante_id=d.estudiante_id,
                tipo_caso="IMPRESION_NEGATIVA",
                semaforo="ROJO",
                observaciones="Impresion negativa con indices elevados. Atencion prioritaria.",
            )

        # CASO 5 — Con riesgo verificado: indices altos sin sesgo
        tiene_riesgo = (
            d.glo_t >= 60 or d.emo_t >= 65 or d.dep_t >= 70
            or d.items_criticos_count >= 10
        )
        es_urgente = (
            d.glo_t >= 65 and d.dep_t >= 80
            or d.items_criticos_count >= 15
        )

        if es_urgente:
            return TamizajeOutput(
                estudiante_id=d.estudiante_id,
                tipo_caso="CON_RIESGO",
                semaforo="ROJO_URGENTE",
                observaciones="Riesgo emocional alto confirmado. Atencion URGENTE e inmediata.",
            )

        if tiene_riesgo:
            return TamizajeOutput(
                estudiante_id=d.estudiante_id,
                tipo_caso="CON_RIESGO",
                semaforo="ROJO",
                observaciones="Riesgo emocional detectado. Programar cita con psicologo.",
            )

        # CASO 2 — Sin riesgo
        return TamizajeOutput(
            estudiante_id=d.estudiante_id,
            tipo_caso="SIN_RIESGO",
            semaforo="VERDE",
            observaciones="Sin indicadores de riesgo. Seguimiento periodico normal.",
        )

    def _predecir_ml(self, datos: TamizajeInput) -> TamizajeOutput:
        """Clasificacion usando el modelo entrenado (XGBoost/Scikit-learn)."""
        features = self._extraer_features(datos)
        tipo_caso = self.modelo.predict([features])[0]
        proba = self.modelo.predict_proba([features])[0].max()
        semaforo = self._tipo_a_semaforo(tipo_caso)
        return TamizajeOutput(
            estudiante_id=datos.estudiante_id,
            tipo_caso=tipo_caso,
            semaforo=semaforo,
            confianza=round(float(proba), 3),
        )

    def _extraer_features(self, d: TamizajeInput) -> list:
        return [
            d.inc, d.neg, d.pos,
            d.glo_t, d.emo_t, d.con_t, d.eje_t, d.ctx_t, d.rec_t,
            d.dep_t, d.ans_t, d.asc_t, d.som_t, d.pst_t, d.obs_t,
            d.ate_t, d.hip_t, d.ira_t, d.agr_t, d.des_t, d.ant_t,
            d.sus_t, d.esq_t, d.ali_t,
            d.fam_t, d.esc_t, d.com_t,
            d.reg_t, d.bus_t,
            d.aut_t, d.soc_t, d.cnc_t,
            d.items_criticos_count,
        ]

    def _tipo_a_semaforo(self, tipo_caso: str) -> str:
        mapping = {
            "SIN_RIESGO": "VERDE",
            "INCONSISTENCIA": "AMARILLO",
            "IMPRESION_POSITIVA": "AMARILLO",
            "IMPRESION_NEGATIVA": "ROJO",
            "CON_RIESGO": "ROJO_URGENTE",
        }
        return mapping.get(tipo_caso, "AMARILLO")

    def info(self) -> dict:
        return {
            "version": self.version,
            "modelo_cargado": self.modelo is not None,
            "tipo": "XGBoost" if self.modelo else "Reglas heuristicas",
            "clases": ["INCONSISTENCIA", "SIN_RIESGO", "IMPRESION_POSITIVA", "IMPRESION_NEGATIVA", "CON_RIESGO"],
        }
