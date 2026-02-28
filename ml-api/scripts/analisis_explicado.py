# =============================================================================
#  ARCHIVO DE ANÁLISIS — PsicoScan ML
#  Explicación línea por línea del pipeline completo de Machine Learning
#
#  Este archivo es de LECTURA / ESTUDIO. No modifica ningún dato.
#  Puedes ejecutarlo con:  python analisis_explicado.py
#
#  Temas que cubre:
#   1. Qué es y para qué sirve cada librería importada
#   2. Cómo se construyen los "features" (variables de entrada) desde el SENA
#   3. Cómo el Random Forest aprende a clasificar el riesgo
#   4. Cómo se evalúa que el modelo sea confiable
#   5. Cómo el clasificador decide VERDE / AMARILLO / ROJO / ROJO_URGENTE
# =============================================================================


# =============================================================================
# SECCIÓN 1 — IMPORTACIONES
# Cada "import" trae una herramienta externa al programa.
# =============================================================================

import os           # Permite leer/escribir rutas del sistema operativo (carpetas, archivos)
import sys          # Permite salir del programa con sys.exit() cuando hay un error fatal
import json         # Convierte diccionarios Python ↔ texto JSON (para guardar métricas)
import urllib.parse as _up  # Manipula URLs (añadir "?sslmode=require" a la URL de la BD)

import joblib       # Guarda/carga el modelo entrenado en un archivo .pkl (más eficiente que pickle)
import psycopg2     # Conector PostgreSQL — permite hacer SELECT a la base de datos Neon

import pandas as pd         # DataFrame: tabla en memoria, como Excel pero en Python
import numpy as np          # Arrays numéricos de alta velocidad; sklearn los necesita

# scikit-learn — la librería principal de Machine Learning
from sklearn.ensemble import RandomForestClassifier
#   RandomForestClassifier  → el algoritmo que entrenamos: "Bosque Aleatorio"
#   Un "bosque" = muchos árboles de decisión entrenados sobre muestras aleatorias
#   La clase final es la que más árboles votan (voto mayoritario)

from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
#   train_test_split  → divide los datos en entrenamiento (75%) y prueba (25%)
#   StratifiedKFold   → divide manteniendo la proporción de clases en cada "fold"
#   cross_validate    → evalúa el modelo N veces con distintas particiones (validación cruzada)

from sklearn.metrics import classification_report, accuracy_score
#   accuracy_score        → % de predicciones correctas totales
#   classification_report → precision, recall, f1-score por cada clase

from dotenv import load_dotenv  # Lee el archivo .env para obtener DATABASE_URL sin hardcodearla


# =============================================================================
# SECCIÓN 2 — CONSTANTES GLOBALES
# Definen el "conocimiento del dominio" que se codifica manualmente.
# =============================================================================

TRAIN_SIZE = 0.75
# El 75% de los registros se usará para entrenar el modelo.
# El 25% restante se reserva como "prueba" — el modelo nunca los ve durante el entrenamiento.
# Esto simula datos nuevos y mide si el modelo generaliza bien.

TARGET = "semaforo"
# Nombre de la columna que queremos predecir.
# Los valores posibles son: "VERDE", "AMARILLO", "ROJO", "ROJO_URGENTE"
# En ML esto se llama "variable objetivo" o "label".


# =============================================================================
# SECCIÓN 3 — ESCALAS DEL SENA
# =============================================================================

ESCALAS = {
    # Clave  : nombre de la escala (abreviatura del SENA)
    # Valor  : lista de números de ítem (1-188) que componen esa escala

    "dep": [4, 11, 14, 27, 38, 50, 58, 75, 82, 84, 85, 111, 137, 141, 153, 162],
    # "dep" = Depresión. 16 ítems del cuestionario SENA.
    # La puntuación de la escala = suma de las respuestas en esos 16 ítems.
    # Cada respuesta va de 1 (nunca) a 5 (siempre). Máximo teórico: 16 × 5 = 80.

    "ans": [5, 10, 30, 34, 35, 43, 77, 83, 98, 112, 129, 132, 169, 170],
    # "ans" = Ansiedad. 14 ítems.

    "asc": [6, 30, 52, 64, 98, 110, 133],
    # "asc" = Aislamiento social. 7 ítems.

    "som": [4, 11, 18, 48, 58, 63, 79, 121, 144, 165],
    # "som" = Somatización (síntomas físicos sin causa médica). 10 ítems.

    "pst": [21, 26, 42, 71, 86, 97, 128, 140],
    # "pst" = Estrés postraumático. 8 ítems.

    "obs": [44, 66, 101, 108, 151, 178, 184],
    # "obs" = Obsesión-compulsión. 7 ítems.

    "ate": [8, 12, 31, 39, 65, 91, 117, 150, 155, 183],
    # "ate" = Problemas de atención. 10 ítems.

    "hip": [3, 13, 28, 47, 67, 100, 131, 154, 161, 185],
    # "hip" = Hiperactividad / impulsividad. 10 ítems.

    "ira": [9, 23, 34, 51, 56, 69, 89, 114, 135, 148, 171, 176],
    # "ira" = Ira. 12 ítems.

    "agr": [9, 23, 49, 59, 78, 89, 103, 113, 120, 139, 168],
    # "agr" = Agresión. 11 ítems.

    "des": [62, 68, 87, 102, 127, 138, 158, 174],
    # "des" = Desafío / conducta desafiante. 8 ítems.

    "ant": [25, 41, 49, 70, 78, 109, 160, 168, 173, 180],
    # "ant" = Conducta antisocial. 10 ítems.

    "sus": [55, 74, 94, 106, 142, 159],
    # "sus" = Consumo de sustancias. 6 ítems.

    "esq": [79, 90, 119, 122, 128, 149, 164, 167, 175],
    # "esq" = Esquizotipia (experiencias inusuales de pensamiento). 9 ítems.

    "ali": [16, 20, 53, 61, 88, 130, 152, 177],
    # "ali" = Problemas de alimentación. 8 ítems.

    "fam": [19, 40, 80, 99, 125, 134, 181],
    # "fam" = Problemas familiares. 7 ítems.

    "esc": [36, 57, 72, 73, 123, 138, 174],
    # "esc" = Problemas escolares. 7 ítems.

    "com": [24, 54, 107, 143, 172],
    # "com" = Problemas comunitarios. 5 ítems.

    "aut": [1, 7, 15, 29, 81, 93, 179, 186, 187],
    # "aut" = Autoestima (recurso POSITIVO). 9 ítems.

    "soc": [7, 33, 54, 81, 93, 107, 143, 172, 188],
    # "soc" = Competencia social (recurso POSITIVO). 9 ítems.

    "cnc": [32, 46, 68, 156],
    # "cnc" = Conciencia emocional (recurso POSITIVO). 4 ítems.
}
# Total: 21 escalas. Estas serán 21 de los 23 "features" del modelo.


# =============================================================================
# SECCIÓN 4 — ÍTEMS CRÍTICOS
# =============================================================================

CRITICOS = {
    124,  # "Quiero morirme"                      → ideación suicida directa
    141,  # "Pienso que mi vida no tiene sentido"  → ideación pasiva
    149,  # "Siento que me estoy volviendo loco"   → desconexión de realidad
     76,  # "Siento que voy a perder el control"   → crisis inminente
     92,  # (ítem de autolesión)
    118,  # "Hay cosas que van mal y necesito ayuda"
    145,  # "Lo estoy pasando mal y necesito que me ayuden"
     19,  # "Mis padres me pegan"                  → violencia doméstica
     80,  # (ítem de abuso)
    125,  # (ítem de abuso)
     37,  # (ítem de riesgo)
     96,  # "Me insultan por teléfono o internet"  → ciberbullying
    115,  # (ítem de acoso)
    147,  # (ítem de acoso)
    163,  # "Me amenazan en el instituto"           → acoso escolar
     71,  # (ítem de trauma)
     21,  # (ítem de estrés traumático)
     86,  # "Me han pasado cosas horribles"         → trauma grave
     97,  # (ítem de trauma)
    119,  # "Creo que otras personas pueden leer mis pensamientos"
    164,  # (ítem de pensamiento desorganizado)
    167,  # (ítem de alucinación)
     90,  # (ítem de psicosis)
     88,  # "Busco situaciones de riesgo"           → conducta peligrosa
    130,  # (ítem de alimentación grave)
}
# Son 25 ítems. Una respuesta ≥ 3 ("algunas veces") en cualquiera de ellos
# se considera crítica y suma al contador "criticos_count".


# =============================================================================
# SECCIÓN 5 — NOMBRES DE FEATURES (para reportes e importancia)
# =============================================================================

FEATURE_NAMES = list(ESCALAS.keys()) + ["total_altos", "criticos_count"]
# list(ESCALAS.keys()) → ["dep", "ans", "asc", ..., "cnc"]  (21 nombres)
# + ["total_altos", "criticos_count"]                        (2 nombres extra)
# Total: 23 features. Estos son las "columnas de entrada" del modelo.

# ¿Qué son "total_altos" y "criticos_count"?
#   total_altos    = cuántos ítems (de los 188) tienen respuesta ≥ 4 ("muchas veces")
#                    Captura la "carga global" sin importar la escala.
#   criticos_count = cuántos de los 25 ítems críticos tienen respuesta ≥ 3
#                    Es el indicador directo de riesgo grave.


# =============================================================================
# SECCIÓN 6 — CONSTRUCCIÓN DE FEATURES
# La función más importante del pipeline: convierte texto → números.
# =============================================================================

def calcular_features(cadena: str) -> list:
    """
    Recibe la cadena de 188 dígitos y devuelve una lista de 23 números (features).

    Ejemplo de cadena: "12132411523..." (cada dígito = respuesta de 1 ítem, valor 1-5)
    La cadena viene directamente del cuestionario SENA respondido por el alumno.
    """

    # --- Paso 6.1: Extraer solo dígitos y ajustar longitud ---
    digitos = [int(c) for c in cadena if c.isdigit()][:188]
    # [int(c) for c in cadena if c.isdigit()]
    #   → "list comprehension": recorre cada carácter de la cadena,
    #     si es un dígito ("0"–"9") lo convierte a entero y lo agrega a la lista.
    # [:188]
    #   → toma solo los primeros 188 elementos (por si la cadena fuera más larga)

    if len(digitos) < 188:
        digitos += [0] * (188 - len(digitos))
    # Si la cadena era más corta de 188, rellena con ceros al final.
    # Esto garantiza que siempre tengamos exactamente 188 valores.
    # [0] * N → lista de N ceros: [0, 0, 0, ...]

    # --- Paso 6.2: Calcular suma por escala (21 features) ---
    feats = []
    # Inicia una lista vacía donde iremos acumulando los features.

    for escala, items in ESCALAS.items():
        # Itera sobre cada escala: escala = "dep", items = [4, 11, 14, ...]
        suma = sum(digitos[i - 1] for i in items if 1 <= i <= 188)
        # digitos[i - 1] → accede al índice 0-basado (el ítem 1 está en posición 0)
        # if 1 <= i <= 188 → seguridad por si algún número de ítem estuviera fuera de rango
        # sum(...) → suma todas las respuestas de los ítems de esa escala
        feats.append(float(suma))
        # float() convierte el entero a decimal para que numpy lo procese bien

    # Resultado: feats tiene ahora 21 números, uno por escala.

    # --- Paso 6.3: Features globales (2 features más) ---
    total_altos = sum(1 for v in digitos if v >= 4)
    # Cuenta cuántos ítems tienen valor ≥ 4 (respuesta "muchas veces" o "siempre")
    # sum(1 for v in digitos if v >= 4) → por cada valor en digitos,
    #   si es ≥ 4 suma 1, si no suma 0.

    criticos_count = sum(1 for i in CRITICOS if 1 <= i <= 188 and digitos[i - 1] >= 3)
    # Para cada ítem crítico (de los 25 en CRITICOS):
    #   - Verifica que el número esté en rango (1–188)
    #   - Si la respuesta fue ≥ 3 (al menos "algunas veces"), cuenta como crítico

    feats.append(float(total_altos))
    feats.append(float(criticos_count))
    # Agrega los dos indicadores globales al vector de features.

    return feats
    # Devuelve lista de 23 números: [dep_score, ans_score, ..., cnc_score, total_altos, criticos_count]

# ¿Por qué NO usamos las puntuaciones T del SENA directamente?
# Las puntuaciones T son normalizadas por baremo (edad/sexo) y requieren tablas externas.
# Las sumas brutas capturan la misma información y son calculables sin tablas,
# lo que hace el modelo más robusto y portable.


# =============================================================================
# SECCIÓN 7 — CARGA DE DATOS DESDE POSTGRESQL
# =============================================================================

def cargar_datos():
    """
    Conecta a Neon PostgreSQL y trae todos los registros históricos SENA
    que tienen la cadena de 188 respuestas.
    Devuelve un DataFrame con columnas: ["respuestas", "semaforo"]
    """

    # --- Paso 7.1: Obtener URL de la base de datos ---
    load_dotenv()
    # Carga las variables del archivo .env (DATABASE_URL, DIRECT_URL, etc.)
    # Sin esto, os.getenv() devolvería None.

    db_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    # Intenta leer DIRECT_URL primero (más eficiente con Neon — conexión directa sin pool)
    # Si no existe, usa DATABASE_URL (conexión pooled vía PgBouncer)
    # Si ninguna existe, la línea siguiente detiene el programa.

    if not db_url:
        sys.exit("ERROR: Variable DIRECT_URL o DATABASE_URL no definida.")
    # sys.exit() termina el script con el mensaje de error.
    # Equivale a "lanzar una excepción fatal" en otros lenguajes.

    # --- Paso 7.2: Normalizar URL y forzar SSL ---
    db_url = db_url.replace("postgres://", "postgresql://")
    # psycopg2 requiere "postgresql://" pero algunos proveedores usan "postgres://"
    # .replace() es una sustitución de texto simple.

    parsed = _up.urlparse(db_url)
    # Divide la URL en partes: scheme, netloc, path, params, query, fragment
    # Ejemplo: "postgresql://user:pass@host:5432/dbname?sslmode=require"
    #   parsed.scheme   = "postgresql"
    #   parsed.netloc   = "user:pass@host:5432"
    #   parsed.path     = "/dbname"
    #   parsed.query    = "sslmode=require"

    params = dict(_up.parse_qsl(parsed.query))
    # parse_qsl() convierte la cadena de query a lista de tuplas: [("sslmode","require")]
    # dict() convierte esa lista al diccionario: {"sslmode": "require"}

    params.pop("sslrootcert", None)
    # Elimina "sslrootcert" si existe (causa errores en Windows con Neon)
    # .pop(key, None) → elimina la clave si existe; si no existe, devuelve None sin error.

    params["sslmode"] = "require"
    # Asegura que la conexión use SSL (obligatorio en Neon para seguridad)

    db_url = _up.urlunparse(parsed._replace(query=_up.urlencode(params)))
    # _up.urlencode(params) → convierte el diccionario de vuelta a "sslmode=require&..."
    # parsed._replace(query=...) → crea una nueva URL con el query actualizado
    # _up.urlunparse(...) → ensambla todas las partes de vuelta en una cadena URL

    # --- Paso 7.3: Ejecutar la consulta SQL ---
    print("Conectando a la base de datos...")
    conn = psycopg2.connect(db_url)
    # Abre la conexión TCP con el servidor PostgreSQL.
    # Si falla (credenciales incorrectas, red caída) lanza una excepción.

    cur = conn.cursor()
    # Crea un "cursor": el objeto que ejecuta consultas y recupera resultados.

    cur.execute(
        'SELECT "respuestas", "semaforo" FROM "HistoricoSENA" WHERE "respuestas" IS NOT NULL'
    )
    # Ejecuta una consulta SQL:
    #   - Trae solo las columnas "respuestas" y "semaforo"
    #   - De la tabla "HistoricoSENA" (nombre con mayúsculas → necesita comillas en PostgreSQL)
    #   - WHERE "respuestas" IS NOT NULL → solo registros que tienen cadena de respuestas
    #     (algunos registros del histórico no tienen la cadena, solo tienen T-scores)

    rows = cur.fetchall()
    # Trae TODOS los resultados de la consulta a memoria.
    # rows = [(cadena1, "ROJO"), (cadena2, "VERDE"), ...]
    # Cada elemento es una tupla con los valores de las columnas seleccionadas.

    cur.close()    # Cierra el cursor (libera recursos en el servidor)
    conn.close()   # Cierra la conexión TCP (devuelve la conexión al pool de Neon)

    if not rows:
        sys.exit("ERROR: No hay registros con respuestas. Importa el histórico primero.")
    # Si la lista está vacía, no hay datos para entrenar — el script termina.

    # --- Paso 7.4: Crear el DataFrame ---
    df = pd.DataFrame(rows, columns=["respuestas", TARGET])
    # pd.DataFrame(lista_de_tuplas, columns=[...])
    # Convierte la lista de tuplas en una tabla organizada:
    #
    #   respuestas                    semaforo
    #   "12132411523..."              "ROJO"
    #   "21111312113..."              "VERDE"
    #   ...
    #
    # Es el equivalente a una hoja de cálculo en Python.

    print(f"Registros con respuestas: {len(df)}")
    # len(df) = número de filas del DataFrame

    print(f"Distribución de clases:\n{df[TARGET].value_counts().to_string()}")
    # df["semaforo"].value_counts() → cuenta cuántos registros hay de cada clase:
    #   VERDE          4231
    #   AMARILLO        892
    #   ROJO            156
    #   ROJO_URGENTE     23
    # Esta distribución desbalanceada es importante para la siguiente sección.

    return df


# =============================================================================
# SECCIÓN 8 — PREPARAR X e y
# Separa la entrada (X) de la salida esperada (y).
# =============================================================================

def preparar_datos(df):
    """
    Transforma el DataFrame de texto en matrices numéricas para sklearn.
    Devuelve X (matriz de features) y y (vector de etiquetas).
    """

    print("\nCalculando features desde respuestas brutas...")

    X = np.array(
        [calcular_features(r) for r in df["respuestas"]],
        dtype=float
    )
    # [calcular_features(r) for r in df["respuestas"]]
    #   → Para cada cadena de respuestas, calcula sus 23 features.
    #   → Resultado: lista de listas [[feat1, feat2, ..., feat23], [feat1, ...], ...]
    #
    # np.array(..., dtype=float)
    #   → Convierte la lista de listas en una matriz NumPy de tipo float64.
    #   → Shape: (N_registros, 23)  ← "N filas, 23 columnas"
    #   → Esto es lo que sklearn espera como entrada.

    y = df[TARGET].values
    # df["semaforo"].values → extrae la columna "semaforo" como un array NumPy.
    # y = ["ROJO", "VERDE", "ROJO", "AMARILLO", ...]
    # Estas son las "respuestas correctas" que el modelo debe aprender a predecir.

    print(f"Matriz de features: {X.shape[0]} muestras × {X.shape[1]} features")
    # X.shape → (filas, columnas). Por ejemplo: (5302, 23)

    return X, y


# =============================================================================
# SECCIÓN 9 — ENTRENAMIENTO Y EVALUACIÓN
# El núcleo del aprendizaje automático.
# =============================================================================

def entrenar(X, y):
    """
    Entrena el Random Forest y lo evalúa. Devuelve el modelo + métricas.
    """

    # --- Paso 9.1: Dividir en entrenamiento y prueba ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        train_size=TRAIN_SIZE,   # 0.75 → 75% para entrenar
        stratify=y,              # Mantiene la misma proporción de clases en ambas particiones
        random_state=42          # Semilla fija → el split es reproducible (mismo resultado siempre)
    )
    # train_test_split baraja aleatoriamente los datos y los divide.
    # X_train: 75% de las filas, columnas = 23 features
    # X_test:  25% restante (datos que el modelo nunca verá durante el entrenamiento)
    # y_train: etiquetas correspondientes a X_train
    # y_test:  etiquetas correspondientes a X_test

    # ¿Por qué stratify=y?
    # Sin stratify, si hay pocos ROJO_URGENTE, podrían quedar TODOS en train y
    # el modelo nunca evaluaría esa clase. stratify garantiza que cada clase
    # tenga representación proporcional en train y test.

    print(f"\nSplit 75/25: {len(X_train)} entrenamiento, {len(X_test)} prueba")

    # --- Paso 9.2: Definir el modelo ---
    clf = RandomForestClassifier(
        n_estimators=300,
        # Número de árboles en el bosque.
        # Más árboles = más estabilidad, pero más lento de entrenar.
        # 300 es un buen balance para este tamaño de datos.

        max_depth=None,
        # Profundidad máxima de cada árbol. None = sin límite.
        # Cada árbol crece hasta que todas las hojas son "puras" (una sola clase).
        # Esto puede causar overfitting en un árbol solo, pero el bosque lo compensa.

        class_weight="balanced",
        # CRÍTICO para nuestro caso: los datos están desbalanceados.
        # Sin esto, el modelo ignoraría ROJO_URGENTE (pocos casos) y solo
        # acertaría en VERDE (muchos casos).
        # "balanced" = cada clase tiene peso inversamente proporcional a su frecuencia.
        # Si ROJO_URGENTE tiene 23 casos y VERDE tiene 4231, el peso de
        # cada muestra URGENTE será ~184 veces mayor que cada muestra VERDE.

        random_state=42,
        # Semilla aleatoria: hace que el entrenamiento sea reproducible.
        # Con el mismo random_state y los mismos datos, siempre obtienes el mismo modelo.

        n_jobs=-1,
        # Usa TODOS los núcleos de CPU disponibles para entrenar en paralelo.
        # -1 = "usa todos". Reduce el tiempo de entrenamiento de ~10min a ~2min.
    )

    # --- Paso 9.3: Validación cruzada (para detectar overfitting) ---
    n_splits = min(5, int(pd.Series(y_train).value_counts().min()))
    # pd.Series(y_train).value_counts().min() → cuántos ejemplos tiene la clase MENOS frecuente
    # min(5, ...) → no puedes tener más folds que ejemplos de la clase más pequeña
    # Ejemplo: si ROJO_URGENTE tiene 17 ejemplos en train, usamos 5-fold (17 > 5)
    #          si solo tiene 3 ejemplos, usamos 3-fold.

    if n_splits < 2:
        n_splits = 2  # Mínimo 2 folds para que la validación cruzada funcione

    print(f"Ejecutando {n_splits}-fold StratifiedKFold CV...")

    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    # StratifiedKFold divide los datos en N grupos (folds) MANTENIENDO la proporción de clases.
    # Con 5-fold y 4000 datos de train:
    #   fold 1: entrena con 80% (3200), evalúa con 20% (800)
    #   fold 2: entrena con un 80% diferente, evalúa con otro 20%
    #   ... y así 5 veces, usando partes distintas en cada iteración.

    cv_results = cross_validate(clf, X_train, y_train, cv=cv, scoring="accuracy")
    # cross_validate ejecuta el ciclo de N folds y regresa un diccionario con scores.
    # scoring="accuracy" → métrica usada en cada fold: % de predicciones correctas.
    # cv_results["test_score"] = [0.985, 0.981, 0.979, 0.984, 0.982]  (un valor por fold)

    cv_mean = float(cv_results["test_score"].mean())
    # Media de los 5 scores. Un cv_mean ≈ 0.982 significa 98.2% de precisión promedio.

    cv_std = float(cv_results["test_score"].std())
    # Desviación estándar. Un cv_std bajo (< 0.005) indica que el modelo es estable:
    # no varía mucho de un fold a otro → no tiene overfitting severo.

    print(f"CV accuracy: {cv_mean:.4f} ± {cv_std:.4f}")

    # --- Paso 9.4: Entrenar el modelo final ---
    print("Entrenando modelo final sobre conjunto de entrenamiento...")
    clf.fit(X_train, y_train)
    # .fit(X, y) → AQUÍ OCURRE EL APRENDIZAJE.
    # El algoritmo construye 300 árboles de decisión:
    #   1. Para cada árbol, toma una muestra aleatoria de los datos (bootstrapping).
    #   2. En cada nodo del árbol, prueba un subconjunto aleatorio de features.
    #   3. Elige el feature y el umbral que mejor separa las clases.
    #   4. Repite recursivamente hasta que cada hoja tiene una sola clase.
    # Los 300 árboles votan en conjunto para la predicción final.

    # --- Paso 9.5: Evaluar en datos de prueba ---
    y_pred = clf.predict(X_test)
    # .predict(X_test) → el modelo ya entrenado predice la clase para cada muestra de prueba.
    # Cada árbol vota y la clase con más votos gana.
    # y_pred = ["VERDE", "ROJO", "AMARILLO", "VERDE", ...]

    acc = accuracy_score(y_test, y_pred)
    # Compara y_pred con y_test (las respuestas correctas).
    # accuracy = (predicciones correctas) / (total de predicciones)
    # Si acc = 0.9949 → el modelo acierta en 99.49% de los casos de prueba.

    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    # Genera un reporte detallado POR CLASE:
    #
    #                  precision  recall  f1-score  support
    #   AMARILLO          0.97     0.96     0.97       223
    #   ROJO              0.98     0.99     0.98        39
    #   ROJO_URGENTE      1.00     1.00     1.00         6
    #   VERDE             0.99     0.99     0.99      1058
    #
    # precision  = de los que predije como ROJO, ¿cuántos realmente son ROJO?
    # recall     = de los que SÍ son ROJO, ¿cuántos predije correctamente?
    # f1-score   = media armónica de precision y recall (balance entre ambas)
    # support    = cuántos casos de esa clase hay en el conjunto de prueba
    # zero_division=0 → si una clase no aparece en test, pone 0 en vez de error

    print(f"\nTest accuracy (25% holdout): {acc:.4f}")
    print(classification_report(y_test, y_pred, zero_division=0))

    # --- Paso 9.6: Re-entrenar con TODOS los datos para producción ---
    print("Re-entrenando sobre todos los datos para producción...")
    clf.fit(X, y)
    # Ahora que ya evaluamos el modelo con X_test, podemos usar TODOS los datos para
    # el modelo final que irá a producción. Esto le da más información para aprender.
    # (Si usáramos clf entrenado solo con X_train en producción, desperdiciaríamos el 25%)

    return clf, acc, cv_mean, cv_std, report


# =============================================================================
# SECCIÓN 10 — GUARDAR ARTEFACTOS
# Serializa el modelo y las métricas a archivos para que FastAPI los use.
# =============================================================================

def guardar(clf, acc, cv_mean, cv_std, report, n_registros):
    """
    Guarda el modelo entrenado y las métricas como archivos.
    """

    MODELS_DIR = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(MODELS_DIR, exist_ok=True)
    # os.makedirs(..., exist_ok=True) → crea la carpeta si no existe.
    # exist_ok=True → no da error si la carpeta ya existe.

    # --- Guardar el modelo ---
    modelo_path = os.path.join(MODELS_DIR, "modelo.pkl")
    joblib.dump(clf, modelo_path)
    # joblib.dump(objeto, ruta) → serializa cualquier objeto Python a un archivo binario.
    # .pkl = "pickle" (formato de serialización de Python).
    # joblib es más eficiente que pickle estándar para arrays NumPy grandes.
    # El archivo .pkl contiene los 300 árboles con todos sus nodos y umbrales.

    # --- Guardar métricas en JSON ---
    metrics = {
        "accuracy":     round(acc, 4),       # Precisión en conjunto de prueba
        "cv_mean":      round(cv_mean, 4),    # Precisión promedio en validación cruzada
        "cv_std":       round(cv_std, 4),     # Variabilidad del modelo (debe ser baja)
        "train_size":   TRAIN_SIZE,           # Fracción de datos usada para entrenar (0.75)
        "n_registros":  n_registros,          # Total de registros en el corpus
        "report":       report,               # Reporte completo por clase (diccionario)
        "features":     FEATURE_NAMES,        # Lista de 23 nombres de features
        "n_estimators": clf.n_estimators,     # Número de árboles (300)
    }
    metrics_path = os.path.join(MODELS_DIR, "metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)
    # json.dump(objeto, archivo) → escribe el diccionario como texto JSON.
    # ensure_ascii=False → permite caracteres como "é", "ó" sin escaparlos como \u00e9.
    # indent=2 → indenta el JSON para que sea legible por humanos (2 espacios).

    # --- Guardar importancia de features ---
    importance = [
        {"feature": feat, "importance": round(float(imp), 6)}
        for feat, imp in sorted(
            zip(FEATURE_NAMES, clf.feature_importances_),
            key=lambda x: x[1],
            reverse=True
        )
    ]
    # clf.feature_importances_ → array de 23 valores (uno por feature).
    #   Cada valor indica qué tanto contribuyó ese feature a las decisiones del bosque.
    #   Los valores suman 1.0 (son proporciones).
    #   Ejemplo: dep = 0.18 significa que la escala de Depresión fue
    #   responsable del 18% de las decisiones de clasificación.
    #
    # zip(FEATURE_NAMES, clf.feature_importances_)
    #   → empareja nombres con valores: [("dep", 0.18), ("ans", 0.12), ...]
    #
    # sorted(..., key=lambda x: x[1], reverse=True)
    #   → ordena de mayor a menor importancia
    #   lambda x: x[1] → "ordena por el segundo elemento de cada par (el valor numérico)"
    #
    # El resultado es una lista de diccionarios ordenada:
    #   [{"feature": "dep", "importance": 0.18}, {"feature": "criticos_count", "importance": 0.15}, ...]

    imp_path = os.path.join(MODELS_DIR, "feature_importance.json")
    with open(imp_path, "w", encoding="utf-8") as f:
        json.dump(importance, f, ensure_ascii=False, indent=2)

    print("\nTop 10 features más importantes:")
    for item in importance[:10]:
        # item[:10] → los primeros 10 de la lista ordenada
        barra = "█" * int(item["importance"] * 200)  # Barra visual proporcional
        print(f"  {item['feature']:15s}  {item['importance']:.4f}  {barra}")


# =============================================================================
# SECCIÓN 11 — EL CLASIFICADOR EN PRODUCCIÓN (ClasificadorML)
# Cómo FastAPI usa el modelo guardado para clasificar nuevos estudiantes.
# =============================================================================

class ClasificadorMLExplicado:
    """
    Versión comentada del ClasificadorML que usa FastAPI.
    El clasificador real está en ml-api/services/clasificador.py
    """

    def __init__(self):
        # El constructor se ejecuta una vez cuando FastAPI arranca.
        self.modelo = None      # Aquí se cargará el RandomForest (o None si no existe)
        self.metricas = {}      # Diccionario con accuracy, cv_mean, etc.
        self.version = "0.1.0-reglas"   # Versión por defecto (sin modelo entrenado)
        self._cargar_modelo()   # Intenta cargar el modelo inmediatamente

    def _cargar_modelo(self):
        """Carga el modelo desde disco si existe. Si no, el sistema usa reglas."""

        base = os.path.dirname(__file__)
        ruta_modelo = os.path.join(base, "../models/modelo.pkl")
        # os.path.dirname(__file__) → carpeta donde está este script
        # os.path.join(...) → construye la ruta completa al archivo .pkl

        if os.path.exists(ruta_modelo):
            # Solo carga si el archivo existe (puede que aún no se haya entrenado)
            self.modelo = joblib.load(ruta_modelo)
            # joblib.load() → deserializa el archivo y reconstruye el RandomForest
            # en memoria. Ahora self.modelo es el bosque completo con 300 árboles.
            self.version = "1.0.0-ml"

        ruta_metricas = os.path.join(base, "../models/metrics.json")
        if os.path.exists(ruta_metricas):
            with open(ruta_metricas, "r", encoding="utf-8") as f:
                self.metricas = json.load(f)
            # json.load() → lee el archivo JSON y lo convierte a diccionario Python.

    def predecir(self, respuestas_cadena: str, estudiante_id: str = "demo") -> dict:
        """
        Punto de entrada principal. Recibe la cadena de respuestas del estudiante
        y devuelve el semáforo y tipo de caso.
        """
        if self.modelo is not None and respuestas_cadena:
            return self._predecir_ml(respuestas_cadena, estudiante_id)
        else:
            return {"modo": "reglas", "nota": "Modelo no entrenado — usando heurísticas"}
            # Si no hay modelo .pkl, se llama a _predecir_reglas() con los T-scores

    def _predecir_ml(self, cadena: str, estudiante_id: str) -> dict:
        """Predicción usando el Random Forest entrenado."""

        features = calcular_features(cadena)
        # Convierte la cadena de 188 dígitos en los 23 features numéricos.
        # features = [16.0, 14.0, 7.0, ..., 45.0, 8.0]  (23 números)

        semaforo = self.modelo.predict([features])[0]
        # self.modelo.predict([features])
        #   → Pasa el vector de 23 features por los 300 árboles.
        #   → Cada árbol vota por una clase.
        #   → Devuelve la clase con más votos.
        #   → [features] → wrapeado en lista porque sklearn espera matriz (aunque sea 1 fila)
        # [0] → extrae el primer (único) resultado. semaforo = "ROJO_URGENTE"

        proba = self.modelo.predict_proba([features])[0].max()
        # predict_proba() → en vez de la clase ganadora, devuelve la probabilidad
        #   de cada clase. Ejemplo: [0.02, 0.01, 0.05, 0.92]
        #   → VERDE: 2%, AMARILLO: 1%, ROJO: 5%, ROJO_URGENTE: 92%
        # [0] → primera (única) fila
        # .max() → la probabilidad más alta (la de la clase predicha)
        # Esto es la "confianza" del modelo. 0.92 = 92% seguro.

        return {
            "estudiante_id": estudiante_id,
            "semaforo":      semaforo,
            "tipo_caso":     self._semaforo_a_tipo(semaforo),
            "confianza":     round(float(proba), 3),
            "modo":          "ml",
        }

    def _semaforo_a_tipo(self, semaforo: str) -> str:
        """Convierte el semáforo al tipo de caso clínico."""
        mapping = {
            "VERDE":        "SIN_RIESGO",
            "AMARILLO":     "INCONSISTENCIA",
            "ROJO":         "CON_RIESGO",
            "ROJO_URGENTE": "CON_RIESGO",
        }
        return mapping.get(semaforo, "SIN_RIESGO")
        # .get(clave, valor_por_defecto) → si la clave no existe, devuelve "SIN_RIESGO"


# =============================================================================
# SECCIÓN 12 — DEMOSTRACIÓN INTERACTIVA
# Muestra el pipeline completo con datos de ejemplo.
# Ejecutar: python analisis_explicado.py
# =============================================================================

if __name__ == "__main__":
    # Este bloque solo se ejecuta si corres el archivo directamente.
    # Si otro script hace "import analisis_explicado", este bloque se OMITE.

    print("=" * 65)
    print("  PsicoScan ML — Demostración del pipeline")
    print("=" * 65)

    # ── Demo 1: Construcción de features ──────────────────────────────────────
    print("\n[1] CONSTRUCCIÓN DE FEATURES DESDE UNA CADENA REAL\n")

    # Cadena simulada: mayormente valores bajos (1-2) → estudiante sin riesgo
    cadena_verde = "1" * 188
    # "1" * 188 → string de 188 unos: "11111...1" (responde "nunca" a todo)

    cadena_rojo = (
        "4" * 50       # Primeros 50 ítems con valor 4 ("muchas veces")
        + "5" * 50     # Siguientes 50 con valor 5 ("siempre")
        + "3" * 50     # Siguientes 50 con valor 3 ("algunas veces")
        + "2" * 38     # Últimos 38 con valor 2 ("pocas veces")
    )
    # Esta cadena simula un estudiante con síntomas severos en muchos ítems.

    features_verde = calcular_features(cadena_verde)
    features_rojo  = calcular_features(cadena_rojo)

    print(f"Features del estudiante hipotético 'VERDE' (responde todo '1'):")
    for nombre, valor in zip(FEATURE_NAMES, features_verde):
        print(f"  {nombre:20s} = {valor:.0f}")

    print(f"\nFeatures del estudiante hipotético 'ROJO' (responde valores altos):")
    for nombre, valor in zip(FEATURE_NAMES, features_rojo):
        print(f"  {nombre:20s} = {valor:.0f}")

    # ── Demo 2: Usar el clasificador si el modelo existe ──────────────────────
    print("\n[2] CLASIFICADOR ML (requiere modelo.pkl entrenado)\n")

    clf_demo = ClasificadorMLExplicado()

    if clf_demo.modelo is not None:
        resultado_verde = clf_demo.predecir(cadena_verde, "demo-001")
        resultado_rojo  = clf_demo.predecir(cadena_rojo,  "demo-002")

        print("Predicción para cadena de valores bajos:")
        print(f"  Semáforo:  {resultado_verde['semaforo']}")
        print(f"  Tipo caso: {resultado_verde['tipo_caso']}")
        print(f"  Confianza: {resultado_verde.get('confianza', 'N/A')}")

        print("\nPredicción para cadena de valores altos:")
        print(f"  Semáforo:  {resultado_rojo['semaforo']}")
        print(f"  Tipo caso: {resultado_rojo['tipo_caso']}")
        print(f"  Confianza: {resultado_rojo.get('confianza', 'N/A')}")

        print(f"\nMétricas del modelo cargado:")
        print(f"  Accuracy (test):    {clf_demo.metricas.get('accuracy', 'N/A')}")
        print(f"  CV mean:            {clf_demo.metricas.get('cv_mean', 'N/A')}")
        print(f"  CV std:             {clf_demo.metricas.get('cv_std', 'N/A')}")
        print(f"  Registros usados:   {clf_demo.metricas.get('n_registros', 'N/A')}")
    else:
        print("  modelo.pkl no encontrado.")
        print("  Para entrenarlo: cd ml-api && python scripts/entrenar_sena.py")

    # ── Demo 3: Conteo de ítems críticos ──────────────────────────────────────
    print("\n[3] ANÁLISIS DE ÍTEMS CRÍTICOS EN LA CADENA ROJA\n")

    digitos_rojo = [int(c) for c in cadena_rojo if c.isdigit()][:188]
    if len(digitos_rojo) < 188:
        digitos_rojo += [0] * (188 - len(digitos_rojo))

    print("Ítems críticos con respuesta ≥ 3:")
    for item_num in sorted(CRITICOS):
        if 1 <= item_num <= 188:
            valor = digitos_rojo[item_num - 1]
            if valor >= 3:
                marcador = "🔴" if valor >= 4 else "🟡"
                print(f"  {marcador} Ítem #{item_num:3d}: respuesta = {valor}")

    # ── Resumen didáctico ──────────────────────────────────────────────────────
    print("\n" + "=" * 65)
    print("  RESUMEN DEL PIPELINE")
    print("=" * 65)
    print("""
  1. El alumno responde 188 preguntas (valor 1-5 cada una).
     Resultado: cadena de 188 dígitos → "12132451..."

  2. calcular_features() convierte esa cadena en 23 números:
     - 21 sumas de ítems por escala (dep, ans, asc, ..., cnc)
     - total_altos: cuántos ítems tienen respuesta ≥ 4
     - criticos_count: cuántos ítems críticos tienen respuesta ≥ 3

  3. El Random Forest (300 árboles) toma esos 23 números y vota:
     Cada árbol dice "yo creo que es ROJO" o "VERDE", etc.
     La clase con más votos gana.

  4. predict_proba() da la confianza: si 280 de 300 árboles votan
     ROJO_URGENTE, la confianza es 280/300 = 93%.

  5. El resultado (semáforo + tipo_caso + confianza) se guarda
     en la tabla Tamizaje y se muestra en el dashboard.

  Features más importantes (según datos reales):
     ► criticos_count  → indica riesgo directo (ítems como "quiero morir")
     ► dep             → depresión (escala más predictiva del semáforo)
     ► total_altos     → carga global de síntomas
     ► esq             → esquizotipia (asociada a ROJO_URGENTE)
     ► fam             → problemas familiares
    """)
