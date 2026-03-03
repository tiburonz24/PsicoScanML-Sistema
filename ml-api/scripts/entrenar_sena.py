"""
entrenar_sena.py
Entrena un Random Forest sobre el histórico SENA almacenado en PostgreSQL.

Features : 21 puntuaciones brutas de escala (suma de ítems) + 2 indicadores globales
           + edad + sexo_n. Calculados desde la cadena de 188 respuestas brutas.
Target   : semáforo (VERDE / AMARILLO / ROJO / ROJO_URGENTE)

Salida:
  ml-api/models/modelo.pkl              — modelo serializado
  ml-api/models/metrics.json            — accuracy, cv_mean, cv_std, report
  ml-api/models/feature_importance.json — importancia de cada feature

Uso:
  cd ml-api
  python scripts/entrenar_sena.py
"""

import os
import sys
import json
import urllib.parse as _up
import joblib
import psycopg2
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.metrics import classification_report, accuracy_score
from dotenv import load_dotenv

TRAIN_SIZE = 0.75   # 75% entrenamiento, 25% prueba
TARGET     = "semaforo"

# ── Configuración ────────────────────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

MODELS_DIR = os.path.join(os.path.dirname(__file__), "../models")
os.makedirs(MODELS_DIR, exist_ok=True)

# ── Mapeo ítems → escalas (igual que lib/sena/scoring.ts) ───────────────────
ESCALAS: dict[str, list[int]] = {
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

# Ítems críticos (respuesta ≥ 3 en estos ítems es señal de alerta)
CRITICOS = {124, 141, 149, 76, 92, 118, 145, 19, 80, 125,
            37, 96, 115, 147, 163, 71, 21, 86, 97, 119, 164, 167, 90, 88, 130}

FEATURE_NAMES = list(ESCALAS.keys()) + ["total_altos", "criticos_count", "edad", "sexo_n"]
SEXO_MAP = {"MASCULINO": 0, "FEMENINO": 1, "OTRO": 2}


# ── Calcular features desde cadena de respuestas ────────────────────────────
def calcular_features(cadena: str) -> list[float]:
    """Convierte la cadena de 188 dígitos en el vector de features."""
    # Extraer solo dígitos y rellenar/truncar a 188
    digitos = [int(c) for c in cadena if c.isdigit()][:188]
    if len(digitos) < 188:
        digitos += [0] * (188 - len(digitos))

    feats = []
    for escala, items in ESCALAS.items():
        suma = sum(digitos[i - 1] for i in items if 1 <= i <= 188)
        feats.append(float(suma))

    total_altos    = sum(1 for v in digitos if v >= 4)
    criticos_count = sum(1 for i in CRITICOS if 1 <= i <= 188 and digitos[i - 1] >= 3)

    feats.append(float(total_altos))
    feats.append(float(criticos_count))
    return feats


# ── 1. Cargar datos desde PostgreSQL ────────────────────────────────────────
def cargar_datos() -> pd.DataFrame:
    db_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        sys.exit("ERROR: Variable de entorno DIRECT_URL o DATABASE_URL no definida.")

    db_url = db_url.replace("postgres://", "postgresql://")

    # Forzar sslmode=require (funciona en Windows con Neon)
    parsed = _up.urlparse(db_url)
    params = dict(_up.parse_qsl(parsed.query))
    params.pop("sslrootcert", None)
    params["sslmode"] = "require"
    db_url = _up.urlunparse(parsed._replace(query=_up.urlencode(params)))

    print("Conectando a la base de datos…")
    conn = psycopg2.connect(db_url)
    cur  = conn.cursor()

    cur.execute('SELECT "respuestas", "edad", "sexo", "semaforo" FROM "HistoricoSENA" WHERE "respuestas" IS NOT NULL')
    rows = cur.fetchall()
    cur.close()
    conn.close()

    if not rows:
        sys.exit("ERROR: No hay registros con respuestas en HistoricoSENA. Importa el histórico primero.")

    df = pd.DataFrame(rows, columns=["respuestas", "edad", "sexo", TARGET])
    df["edad"] = pd.to_numeric(df["edad"], errors="coerce").fillna(15)
    df["sexo"] = df["sexo"].map(SEXO_MAP).fillna(0)
    print(f"Registros con respuestas: {len(df)}")
    print(f"Distribución de clases:\n{df[TARGET].value_counts().to_string()}")
    return df


# ── 2. Preparar X, y ─────────────────────────────────────────────────────────
def preparar_datos(df: pd.DataFrame):
    print("\nCalculando features desde respuestas brutas…")
    X_base = np.array([calcular_features(r) for r in df["respuestas"]], dtype=float)
    edad   = df["edad"].values.reshape(-1, 1).astype(float)
    sexo_n = df["sexo"].values.reshape(-1, 1).astype(float)
    X = np.hstack([X_base, edad, sexo_n])
    y = df[TARGET].values
    print(f"Matriz de features: {X.shape[0]} muestras × {X.shape[1]} features")
    return X, y


# ── 3. Entrenar y evaluar ────────────────────────────────────────────────────
def entrenar(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, train_size=TRAIN_SIZE, stratify=y, random_state=42
    )
    print(f"\nSplit {int(TRAIN_SIZE*100)}/{int((1-TRAIN_SIZE)*100)}: "
          f"{len(X_train)} entrenamiento, {len(X_test)} prueba")

    clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    n_splits = min(5, int(pd.Series(y_train).value_counts().min()))
    if n_splits < 2:
        n_splits = 2
        print("AVISO: Pocas muestras en alguna clase. Usando 2-fold CV.")

    print(f"Ejecutando {n_splits}-fold StratifiedKFold CV…")
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    cv_results = cross_validate(clf, X_train, y_train, cv=cv, scoring="accuracy")
    cv_mean = float(cv_results["test_score"].mean())
    cv_std  = float(cv_results["test_score"].std())
    print(f"CV accuracy: {cv_mean:.4f} ± {cv_std:.4f}")

    print("Entrenando modelo final sobre conjunto de entrenamiento…")
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    print(f"\nTest accuracy ({int((1-TRAIN_SIZE)*100)}% holdout): {acc:.4f}")
    print(classification_report(y_test, y_pred, zero_division=0))

    print("Re-entrenando sobre todos los datos para producción…")
    clf.fit(X, y)

    return clf, acc, cv_mean, cv_std, report


# ── 4. Guardar artefactos ────────────────────────────────────────────────────
def guardar(clf, acc, cv_mean, cv_std, report, n_registros):
    modelo_path = os.path.join(MODELS_DIR, "modelo.pkl")
    joblib.dump(clf, modelo_path)
    print(f"\nModelo guardado: {modelo_path}")

    metrics = {
        "accuracy":     round(acc, 4),
        "cv_mean":      round(cv_mean, 4),
        "cv_std":       round(cv_std, 4),
        "train_size":   TRAIN_SIZE,
        "n_registros":  n_registros,
        "report":       report,
        "features":     FEATURE_NAMES,
        "n_estimators": clf.n_estimators,
    }
    metrics_path = os.path.join(MODELS_DIR, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)
    print(f"Métricas guardadas: {metrics_path}")

    importance = [
        {"feature": feat, "importance": round(float(imp), 6)}
        for feat, imp in sorted(
            zip(FEATURE_NAMES, clf.feature_importances_),
            key=lambda x: x[1], reverse=True
        )
    ]
    imp_path = os.path.join(MODELS_DIR, "feature_importance.json")
    with open(imp_path, "w", encoding="utf-8") as f:
        json.dump(importance, f, ensure_ascii=False, indent=2)
    print(f"Feature importance guardada: {imp_path}")
    print("\nTop 10 features:")
    for item in importance[:10]:
        print(f"  {item['feature']:15s}  {item['importance']:.4f}")


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("PsicoScan ML — Entrenamiento Random Forest")
    print("=" * 60)

    df = cargar_datos()
    X, y = preparar_datos(df)

    if len(X) < 50:
        sys.exit(f"ERROR: Se necesitan al menos 50 registros (hay {len(X)}).")

    clf, acc, cv_mean, cv_std, report = entrenar(X, y)
    guardar(clf, acc, cv_mean, cv_std, report, len(X))

    print("\n✓ Entrenamiento completado.")
