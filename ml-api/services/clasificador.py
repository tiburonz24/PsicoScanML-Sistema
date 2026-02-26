"""
Servicio de clasificacion ML para PsicoScan.

Cuando existe ml-api/models/modelo.pkl se usa el Random Forest entrenado
sobre el historico SENA (features = 21 escalas + 2 indicadores globales,
calculados desde la cadena de 188 respuestas brutas).

Si el modelo no existe se usa la logica de reglas como fallback.
"""

import os
import json
import joblib
from schemas.tamizaje import TamizajeInput, TamizajeOutput

# ── Mapeo ítems → escalas (igual que lib/sena/scoring.ts y entrenar_sena.py) ─
_ESCALAS: dict[str, list[int]] = {
    "dep": [4, 11, 14, 27, 38, 50, 58, 75, 82, 84, 85, 111, 137, 141, 153, 162],
    "ans": [5, 10, 30, 34, 35, 43, 77, 83, 98, 112, 129, 132, 169, 170],
    "asc": [6, 30, 52, 64, 98, 110, 133],
    "som": [4, 11, 18, 48, 58, 63, 79, 121, 144, 165],
    "pst": [21, 26, 42, 71, 86, 97, 128, 140],
    "obs": [44, 66, 101, 108, 151, 178, 184],
    "ate": [8, 12, 31, 39, 65, 91, 117, 150, 155, 183],
    "hip": [3, 13, 28, 47, 67, 100, 131, 154, 161, 185],
    "ira": [9, 23, 34, 51, 56, 69, 89, 114, 135, 148, 171, 176],
    "agr": [9, 23, 49, 59, 78, 89, 103, 113, 120, 139, 168],
    "des": [62, 68, 87, 102, 127, 138, 158, 174],
    "ant": [25, 41, 49, 70, 78, 109, 160, 168, 173, 180],
    "sus": [55, 74, 94, 106, 142, 159],
    "esq": [79, 90, 119, 122, 128, 149, 164, 167, 175],
    "ali": [16, 20, 53, 61, 88, 130, 152, 177],
    "fam": [19, 40, 80, 99, 125, 134, 181],
    "esc": [36, 57, 72, 73, 123, 138, 174],
    "com": [24, 54, 107, 143, 172],
    "aut": [1, 7, 15, 29, 81, 93, 179, 186, 187],
    "soc": [7, 33, 54, 81, 93, 107, 143, 172, 188],
    "cnc": [32, 46, 68, 156],
}
_CRITICOS = {124, 141, 149, 76, 92, 118, 145, 19, 80, 125,
             37, 96, 115, 147, 163, 71, 21, 86, 97, 119, 164, 167, 90, 88, 130}


def _features_desde_respuestas(cadena: str) -> list[float]:
    """Convierte cadena de 188 dígitos en el vector de 23 features."""
    digitos = [int(c) for c in cadena if c.isdigit()][:188]
    if len(digitos) < 188:
        digitos += [0] * (188 - len(digitos))
    feats = [float(sum(digitos[i - 1] for i in items if 1 <= i <= 188))
             for items in _ESCALAS.values()]
    feats.append(float(sum(1 for v in digitos if v >= 4)))
    feats.append(float(sum(1 for i in _CRITICOS if 1 <= i <= 188 and digitos[i - 1] >= 3)))
    return feats


class ClasificadorML:
    def __init__(self):
        self.modelo = None
        self.metricas: dict = {}
        self.version = "0.1.0-reglas"
        self._cargar_modelo()

    def _cargar_modelo(self):
        """Carga el modelo entrenado si existe, de lo contrario usa reglas."""
        base = os.path.dirname(__file__)
        ruta_modelo   = os.path.join(base, "../models/modelo.pkl")
        ruta_metricas = os.path.join(base, "../models/metrics.json")

        if os.path.exists(ruta_modelo):
            self.modelo  = joblib.load(ruta_modelo)
            self.version = "1.0.0-ml"

        if os.path.exists(ruta_metricas):
            with open(ruta_metricas, "r", encoding="utf-8") as f:
                self.metricas = json.load(f)

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
        """Clasificacion usando el modelo Random Forest entrenado."""
        if not datos.respuestas:
            # Sin cadena de respuestas no se pueden calcular los features reales
            return self._predecir_reglas(datos)
        features  = _features_desde_respuestas(datos.respuestas)
        semaforo  = self.modelo.predict([features])[0]
        proba     = self.modelo.predict_proba([features])[0].max()
        tipo_caso = self._semaforo_a_tipo(semaforo)
        return TamizajeOutput(
            estudiante_id=datos.estudiante_id,
            tipo_caso=tipo_caso,
            semaforo=semaforo,
            confianza=round(float(proba), 3),
        )

    def _semaforo_a_tipo(self, semaforo: str) -> str:
        mapping = {
            "VERDE":        "SIN_RIESGO",
            "AMARILLO":     "INCONSISTENCIA",
            "ROJO":         "CON_RIESGO",
            "ROJO_URGENTE": "CON_RIESGO",
        }
        return mapping.get(semaforo, "SIN_RIESGO")

    def info(self) -> dict:
        info: dict = {
            "version": self.version,
            "modelo_cargado": self.modelo is not None,
            "tipo": "Random Forest" if self.modelo else "Reglas heuristicas",
            "clases": ["VERDE", "AMARILLO", "ROJO", "ROJO_URGENTE"],
        }
        if self.metricas:
            info["accuracy"]  = self.metricas.get("accuracy")
            info["cv_mean"]   = self.metricas.get("cv_mean")
            info["cv_std"]    = self.metricas.get("cv_std")
            info["n_estimators"] = self.metricas.get("n_estimators")
        return info
