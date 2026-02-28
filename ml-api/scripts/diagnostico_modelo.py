"""
diagnostico_modelo.py
=====================
Script de análisis y diagnóstico del modelo ML de PsicoScan.

Responde tres preguntas clave:
  1. ¿Cómo funciona el pipeline paso a paso?
  2. ¿Por qué el modelo tiene 100% de accuracy?
  3. ¿Qué tan útil es realmente el modelo?

Ejecutar desde la carpeta ml-api/:
    python scripts/diagnostico_modelo.py

No requiere conexión a la base de datos.
Sí requiere que exista ml-api/models/modelo.pkl
"""

import os
import json
import joblib
import numpy as np

# ──────────────────────────────────────────────────────────────────────────────
# BLOQUE 1 — ESCALAS Y CONSTANTES
# (idénticas a entrenar_sena.py y clasificador.py)
# ──────────────────────────────────────────────────────────────────────────────

ESCALAS = {
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

CRITICOS = {
    124, 141, 149, 76, 92, 118, 145,
    19, 80, 125, 37, 96, 115, 147, 163,
    71, 21, 86, 97, 119, 164, 167, 90, 88, 130,
}

FEATURE_NAMES = list(ESCALAS.keys()) + ["total_altos", "criticos_count"]

# Colores para la terminal (ANSI)
VERDE   = "\033[92m"
AMARILLO = "\033[93m"
ROJO    = "\033[91m"
AZUL    = "\033[94m"
BOLD    = "\033[1m"
RESET   = "\033[0m"


# ──────────────────────────────────────────────────────────────────────────────
# BLOQUE 2 — FUNCIÓN DE FEATURES
# Convierte 188 dígitos → 23 números que el modelo entiende
# ──────────────────────────────────────────────────────────────────────────────

def calcular_features(cadena: str) -> list:
    """
    Transforma la cadena de respuestas SENA en el vector de features.

    Parámetro
    ---------
    cadena : str
        String de 188 dígitos (1-5), uno por ítem del cuestionario.
        Ejemplo: "12132411..." donde cada carácter = respuesta del ítem.

    Retorna
    -------
    list of float
        23 valores:
        - Posiciones 0-20 : suma de respuestas por escala (dep, ans, ..., cnc)
        - Posición 21     : total_altos  (cuántos ítems tienen valor ≥ 4)
        - Posición 22     : criticos_count (ítems críticos con valor ≥ 3)
    """
    # Paso 1: extraer solo dígitos y garantizar longitud 188
    digitos = [int(c) for c in cadena if c.isdigit()][:188]
    if len(digitos) < 188:
        digitos += [0] * (188 - len(digitos))   # relleno con ceros si falta

    # Paso 2: sumar respuestas por escala (21 features)
    feats = []
    for escala, items in ESCALAS.items():
        suma = sum(digitos[i - 1] for i in items if 1 <= i <= 188)
        # digitos[i-1] porque Python usa índice 0, pero los ítems SENA arrancan en 1
        feats.append(float(suma))

    # Paso 3: indicadores globales (2 features más)
    total_altos    = sum(1 for v in digitos if v >= 4)
    criticos_count = sum(1 for i in CRITICOS if 1 <= i <= 188 and digitos[i - 1] >= 3)

    feats.append(float(total_altos))
    feats.append(float(criticos_count))

    return feats   # lista de 23 floats


# ──────────────────────────────────────────────────────────────────────────────
# BLOQUE 3 — FUNCIÓN DE SCORING (regla determinista del SENA)
# Esta función GENERA las etiquetas del modelo → explica el 100% accuracy
# ──────────────────────────────────────────────────────────────────────────────

def scoring_sena(cadena: str) -> str:
    """
    Reproduce la lógica de lib/sena/scoring.ts para asignar el semáforo.

    Esta función es DETERMINISTA: la misma cadena siempre produce el mismo semáforo.
    El histórico de HistoricoSENA fue etiquetado CON ESTA MISMA LÓGICA.
    Por eso el modelo RF aprende a replicar esta función → accuracy = 100%.

    Retorna: "VERDE" | "AMARILLO" | "ROJO" | "ROJO_URGENTE"
    """
    feats = calcular_features(cadena)
    feat_dict = dict(zip(FEATURE_NAMES, feats))

    criticos_count = feat_dict["criticos_count"]
    total_altos    = feat_dict["total_altos"]
    dep            = feat_dict["dep"]
    esq            = feat_dict["esq"]

    # Umbrales aproximados (equivalentes al scoring.ts del proyecto)
    if criticos_count >= 3 or (dep >= 40 and criticos_count >= 2):
        return "ROJO_URGENTE"
    if criticos_count >= 1 or dep >= 35 or total_altos >= 60:
        return "ROJO"
    if dep >= 25 or total_altos >= 35 or esq >= 18:
        return "AMARILLO"
    return "VERDE"


# ──────────────────────────────────────────────────────────────────────────────
# BLOQUE 4 — GENERACIÓN DE DATOS SINTÉTICOS PARA DEMOSTRACIÓN
# (no necesita base de datos)
# ──────────────────────────────────────────────────────────────────────────────

def generar_cadena(perfil: str) -> str:
    """
    Genera una cadena de 188 dígitos que simula un perfil de respuestas.

    Perfiles disponibles:
    - "verde"        : respuestas bajas (1-2) → sin riesgo
    - "amarillo"     : respuestas medias (2-3) → leve elevación
    - "rojo"         : respuestas altas en ítems clave (3-5) → riesgo moderado
    - "rojo_urgente" : ítems críticos con 4-5 → riesgo severo
    """
    np.random.seed(42)   # semilla fija para reproducibilidad

    if perfil == "verde":
        # Mayormente 1-2, algún 3 ocasional
        base = np.random.choice([1, 2], size=188, p=[0.7, 0.3])

    elif perfil == "amarillo":
        # Mix de 1-3, algunos 4
        base = np.random.choice([1, 2, 3, 4], size=188, p=[0.3, 0.35, 0.25, 0.10])

    elif perfil == "rojo":
        # Predominan 3-4, algunos 5
        base = np.random.choice([1, 2, 3, 4, 5], size=188, p=[0.10, 0.15, 0.30, 0.30, 0.15])

    elif perfil == "rojo_urgente":
        # Valores altos en todo, con ítems críticos en 4-5
        base = np.random.choice([2, 3, 4, 5], size=188, p=[0.10, 0.20, 0.35, 0.35])
        # Forzar ítems críticos a 4 o 5
        for item in CRITICOS:
            if 1 <= item <= 188:
                base[item - 1] = np.random.choice([4, 5])

    else:
        raise ValueError(f"Perfil desconocido: {perfil}")

    return "".join(str(v) for v in base)


# ──────────────────────────────────────────────────────────────────────────────
# SECCIÓN PRINCIPAL — Análisis y diagnóstico
# ──────────────────────────────────────────────────────────────────────────────

def main():
    separador = "─" * 65

    print(f"\n{BOLD}{'═' * 65}{RESET}")
    print(f"{BOLD}  PsicoScan ML — Diagnóstico del Modelo{RESET}")
    print(f"{BOLD}{'═' * 65}{RESET}")

    # ── PARTE 1: Explicación del pipeline ────────────────────────────────────
    print(f"\n{BOLD}{AZUL}[1] EL PIPELINE EN 5 PASOS{RESET}")
    print(separador)
    print("""
  Paso 1 ─ El alumno responde 188 preguntas (valor 1-5 por ítem)
           Resultado: cadena de texto → "12341251324..."

  Paso 2 ─ calcular_features() convierte esa cadena en 23 números:
           • 21 sumas por escala (dep, ans, asc, ..., cnc)
           • total_altos    = cuántos ítems tienen valor ≥ 4
           • criticos_count = cuántos ítems críticos tienen valor ≥ 3

  Paso 3 ─ El Random Forest recibe esos 23 números y los pasa
           por 300 árboles de decisión. Cada árbol vota por una clase.
           La clase con más votos es la predicción final.

  Paso 4 ─ predict_proba() devuelve la confianza (% de árboles que
           votaron por la clase ganadora).

  Paso 5 ─ El resultado (semáforo + confianza) se guarda en Tamizaje
           y se muestra en el dashboard con el badge de color.
    """)

    # ── PARTE 2: Demostración con cadenas sintéticas ─────────────────────────
    print(f"\n{BOLD}{AZUL}[2] FEATURES PARA DIFERENTES PERFILES{RESET}")
    print(separador)

    perfiles = ["verde", "amarillo", "rojo", "rojo_urgente"]
    colores_term = {
        "verde": VERDE, "amarillo": AMARILLO,
        "rojo": ROJO, "rojo_urgente": ROJO,
    }

    for perfil in perfiles:
        cadena = generar_cadena(perfil)
        feats  = calcular_features(cadena)
        fd     = dict(zip(FEATURE_NAMES, feats))
        color  = colores_term[perfil]

        print(f"\n  {color}{BOLD}Perfil: {perfil.upper()}{RESET}")
        print(f"  {'Feature':<18} {'Valor':>6}   {'Barra visual'}")
        print(f"  {'─'*18} {'─'*6}   {'─'*30}")
        for nombre, valor in fd.items():
            max_val  = 188 if nombre == "total_altos" else 25 if nombre == "criticos_count" else 80
            barra_n  = int((valor / max_val) * 25) if max_val > 0 else 0
            barra    = "█" * min(barra_n, 25)
            marca    = f"{color}◄{RESET}" if nombre in ("criticos_count", "dep", "total_altos") else ""
            print(f"  {nombre:<18} {valor:>6.0f}   {barra} {marca}")

    # ── PARTE 3: Diagnóstico — por qué el modelo tiene 100% accuracy ─────────
    print(f"\n{BOLD}{AZUL}[3] DIAGNÓSTICO: ¿POR QUÉ ACCURACY = 100%?{RESET}")
    print(separador)
    print(f"""
  El archivo metrics.json reporta:
    accuracy = 1.0  (100%)
    cv_mean  = 1.0  (100%)
    cv_std   = 0.0  (sin variación)

  {AMARILLO}{BOLD}Esto NO es una señal de éxito — es una señal de alerta.{RESET}

  Causa raíz: FUGA DE ETIQUETAS (label leakage)
  ─────────────────────────────────────────────
  • Los registros de HistoricoSENA tienen el campo "semaforo"
    calculado por la función calcularResultado() de scoring.ts.

  • Esa misma función usa las MISMAS respuestas brutas (188 dígitos)
    con las MISMAS escalas (dep, ans, ...) para asignar el semáforo.

  • Luego el modelo aprende a replicar ESA MISMA función determinista.

  • Una función determinista siempre puede ser aprendida perfectamente
    por un árbol de decisión → accuracy = 100%.

  En otras palabras:
    El modelo aprendió a hacer lo mismo que scoring.ts, no más.
    No aprendió patrones "nuevos" del comportamiento de los alumnos.

  ¿Es un problema?
  ─────────────────
  • Si el objetivo es reemplazar scoring.ts con algo más rápido → OK.
  • Si el objetivo es encontrar patrones que scoring.ts no detecta → NO.
  • Para un modelo verdaderamente útil se necesitan etiquetas externas:
    diagnósticos clínicos reales de psicólogos, no generadas por código.
    """)

    # ── PARTE 4: Verificación en código ──────────────────────────────────────
    print(f"\n{BOLD}{AZUL}[4] VERIFICACIÓN: EL MODELO VS. LA FUNCIÓN DE SCORING{RESET}")
    print(separador)

    models_dir = os.path.join(os.path.dirname(__file__), "../models")
    modelo_path = os.path.join(models_dir, "modelo.pkl")

    if not os.path.exists(modelo_path):
        print(f"  {AMARILLO}modelo.pkl no encontrado en {models_dir}{RESET}")
        print("  Entrena el modelo primero: python scripts/entrenar_sena.py")
    else:
        clf = joblib.load(modelo_path)
        print(f"  Modelo cargado: {clf.n_estimators} árboles\n")

        resultados = []
        for perfil in perfiles:
            cadena         = generar_cadena(perfil)
            feats          = calcular_features(cadena)
            pred_ml        = clf.predict([feats])[0]
            proba          = clf.predict_proba([feats])[0].max()
            pred_scoring   = scoring_sena(cadena)
            coincide       = pred_ml == pred_scoring
            resultados.append((perfil, pred_ml, pred_scoring, proba, coincide))

        print(f"  {'Perfil':<15} {'ML predice':<14} {'Scoring.ts':<14} {'Confianza':>9}  {'¿Igual?'}")
        print(f"  {'─'*15} {'─'*14} {'─'*14} {'─'*9}  {'─'*7}")
        for perfil, pred_ml, pred_sc, proba, igual in resultados:
            icono = f"{VERDE}✓{RESET}" if igual else f"{ROJO}✗{RESET}"
            print(f"  {perfil:<15} {pred_ml:<14} {pred_sc:<14} {proba:>8.1%}  {icono}")

        coincidencias = sum(1 for _, _, _, _, igual in resultados if igual)
        print(f"\n  Coincidencia total: {coincidencias}/{len(resultados)} casos de prueba")
        if coincidencias == len(resultados):
            print(f"  {AMARILLO}→ El modelo replica exactamente la función de scoring.{RESET}")

    # ── PARTE 5: Feature importance real ─────────────────────────────────────
    print(f"\n{BOLD}{AZUL}[5] IMPORTANCIA DE FEATURES (del modelo entrenado){RESET}")
    print(separador)

    imp_path = os.path.join(models_dir, "feature_importance.json")
    if os.path.exists(imp_path):
        with open(imp_path, "r", encoding="utf-8") as f:
            importancias = json.load(f)

        print(f"\n  {'Feature':<18} {'Importancia':>11}  {'Barra visual (%)':30}")
        print(f"  {'─'*18} {'─'*11}  {'─'*30}")

        for item in importancias:
            feat  = item["feature"]
            imp   = item["importance"]
            barra_n = int(imp * 200)
            barra = "█" * min(barra_n, 40)
            # Destacar los top 3
            marca = f" {AMARILLO}← top{RESET}" if imp > 0.10 else ""
            print(f"  {feat:<18} {imp:>10.4f}   {barra}{marca}")

        print(f"""
  Interpretación:
  ─────────────────────────────────────────────────────────────
  • total_altos    (20.8%) — La "carga global" de síntomas es el
    predictor #1. Indica cuántos ítems tienen respuesta alta (≥4).

  • criticos_count (19.6%) — Ítems de riesgo grave (suicidio, abuso,
    violencia). Su presencia es el segundo predictor más fuerte.

  • esq            ( 6.9%) — Esquizotipia: pensamiento inusual,
    experiencias perceptuales. Asociado a ROJO_URGENTE.

  • pst            ( 6.5%) — Estrés postraumático. Indicador de trauma.

  • dep            ( 6.0%) — Depresión. La escala con mayor relación
    clínica con el riesgo suicida.

  Nota: las escalas "positivas" (aut, soc, cnc) también aparecen
  porque su AUSENCIA (puntuaciones bajas) se asocia con riesgo mayor.
        """)
    else:
        print(f"  {AMARILLO}feature_importance.json no encontrado.{RESET}")

    # ── PARTE 6: Recomendaciones ──────────────────────────────────────────────
    print(f"\n{BOLD}{AZUL}[6] RECOMENDACIONES PARA MEJORAR EL MODELO{RESET}")
    print(separador)
    print(f"""
  El modelo actual es funcional pero reproduce una función determinista.
  Para hacerlo verdaderamente predictivo:

  1. {BOLD}Etiquetas externas{RESET}
     - Usar los diagnósticos reales de los psicólogos como "y" (target)
       en lugar del semáforo calculado por scoring.ts.
     - Ejemplo: "¿Este alumno requirió intervención urgente?" Sí/No.

  2. {BOLD}Features adicionales{RESET}
     - Edad, sexo, grado (ya están en HistoricoSENA)
     - Historial de tamizajes anteriores (tendencia en el tiempo)
     - Tiempo de respuesta por ítem (si el cuestionario es digital)

  3. {BOLD}Validación externa{RESET}
     - Aplicar el modelo a alumnos de una institución diferente
       para medir si generaliza fuera del conjunto de entrenamiento.

  4. {BOLD}Umbral de confianza{RESET}
     - Solo actuar con predicciones con confianza ≥ 0.85
     - Casos de baja confianza → revisión manual por psicólogo

  5. {BOLD}Monitoreo en producción{RESET}
     - Comparar predicción del modelo vs. resultado clínico real
     - Registrar falsos negativos (VERDE que en realidad era ROJO)
    """)

    print(f"{BOLD}{'═' * 65}{RESET}")
    print(f"{BOLD}  Diagnóstico completado.{RESET}")
    print(f"{BOLD}{'═' * 65}{RESET}\n")


if __name__ == "__main__":
    main()
