# PsicoScan ML

**Sistema Inteligente de Tamizaje Psicologico Estudiantil**
CECyTEN Tepic — II Concurso Estatal de Creatividad e Innovacion Tecnologica 2026

---

## Descripcion

PsicoScan ML es una plataforma web que automatiza la interpretacion del cuestionario **SENA** (Sistema de Evaluacion de Ninos y Adolescentes) para detectar de forma temprana riesgo emocional y conductual en estudiantes de bachillerato.

El sistema clasifica cada tamizaje en uno de **5 tipos de caso** y asigna un **semaforo de riesgo** de 4 niveles, permitiendo al personal de orientacion priorizar la atencion de los estudiantes que mas lo necesitan.

### Contexto

Nayarit registra una tasa de suicidio significativamente alta entre jovenes de 15 a 24 anos. La deteccion temprana mediante instrumentos estandarizados y herramientas digitales es clave para una intervencion oportuna en el entorno escolar.

---

## Caracteristicas

- Autenticacion con control de roles (Psicologo, Orientador, Director, Admin, Estudiante)
- Dashboard con graficas interactivas de distribucion de riesgo
- Expedientes individuales con 31 escalas clinicas del SENA
- Visualizacion por semaforo: VERDE / AMARILLO / ROJO / ROJO_URGENTE
- Items criticos agrupados por categoria de riesgo
- API de clasificacion ML con motor de reglas heuristicas (modelo XGBoost en desarrollo)
- Base de datos relacional con historial de tamizajes y citas

---

## Stack Tecnologico

### Frontend
| Tecnologia | Version | Uso |
|---|---|---|
| Next.js | 16.1.6 | Framework full-stack (App Router) |
| React | 19 | Interfaz de usuario |
| TypeScript | 5 | Tipado estatico |
| Tailwind CSS | 4 | Estilos |
| Recharts | 3.7 | Graficas interactivas |
| NextAuth | 4.24 | Autenticacion JWT |
| Prisma | 7.4 | ORM |

### Backend ML
| Tecnologia | Version | Uso |
|---|---|---|
| FastAPI | 0.115 | API REST |
| Uvicorn | 0.32 | Servidor ASGI |
| Scikit-learn | 1.6 | Modelos ML |
| XGBoost | 2.1 | Clasificador principal |
| Pandas / NumPy | 2.x | Procesamiento de datos |
| pdfplumber | 0.11 | Extraccion de PDFs SENA |
| Pydantic | 2.10 | Validacion de esquemas |

### Infraestructura
- **Base de datos:** PostgreSQL (Supabase)
- **Deploy frontend:** Vercel
- **Deploy API ML:** Railway / Render

---

## Estructura del Proyecto

```
Sistema/
├── app/                          # Frontend Next.js
│   ├── (auth)/
│   │   └── login/                # Pagina de inicio de sesion
│   ├── (dashboard)/              # Rutas protegidas
│   │   ├── layout.tsx
│   │   ├── dashboard/            # Panel principal
│   │   ├── estudiantes/          # Tabla de estudiantes
│   │   ├── estudiantes/[id]/     # Expediente individual
│   │   └── cuestionario/         # Aplicacion del SENA (en desarrollo)
│   └── api/
│       └── auth/                 # Endpoints NextAuth
├── components/
│   ├── dashboard/                # Graficas y tarjetas del panel
│   ├── semaforo/                 # Badge de nivel de riesgo
│   └── ui/                      # Sidebar y componentes base
├── lib/
│   ├── auth.ts                   # Configuracion NextAuth
│   ├── db.ts                     # Cliente Prisma
│   ├── types.ts                  # Tipos y constantes globales
│   └── data/mock.ts              # 5 casos tipo para desarrollo
├── ml-api/                       # API Python FastAPI
│   ├── main.py
│   ├── routers/clasificacion.py  # Endpoint POST /clasificar
│   ├── schemas/tamizaje.py       # Esquemas Pydantic
│   ├── services/clasificador.py  # Motor de clasificacion
│   └── requirements.txt
├── prisma/
│   └── schema.prisma             # Esquema de base de datos
└── .env                          # Variables de entorno (no incluido en repo)
```

---

## Instalacion y Uso

### Requisitos

- Node.js >= 18
- Python >= 3.11
- PostgreSQL (o cuenta en Supabase)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tiburonz24/PsicoScanML-Sistema.git
cd PsicoScanML-Sistema
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raiz con:

```env
DATABASE_URL="postgresql://usuario:password@host:5432/psicoscan"
NEXTAUTH_SECRET="tu-secreto-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Instalar dependencias del frontend

```bash
npm install
npx prisma generate
npx prisma db push
```

### 4. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El frontend estara disponible en `http://localhost:3000`.

### 5. Configurar e iniciar la API de ML

```bash
cd ml-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

La API estara disponible en `http://localhost:8000`.

---

## Usuarios de Prueba

| Email | Password | Rol |
|---|---|---|
| psicologo@cecyten.edu.mx | psico123 | PSICOLOGO |
| admin@cecyten.edu.mx | admin123 | ADMIN |
| director@cecyten.edu.mx | dir123 | DIRECTOR |

---

## Clasificacion de Riesgo

El sistema asigna cada tamizaje a uno de los siguientes tipos de caso:

| Tipo de Caso | Semaforo | Criterio | Accion |
|---|---|---|---|
| INCONSISTENCIA | AMARILLO | INC >= 1.2 | Solicitar repeticion del cuestionario |
| SIN_RIESGO | VERDE | Indices normales, sin sesgo | Seguimiento periodico |
| IMPRESION_POSITIVA | AMARILLO | POS >= 8 (sesgo positivo) | Revision con psicologo |
| IMPRESION_NEGATIVA | ROJO | NEG >= 5 y GLO >= 70 | Atencion prioritaria |
| CON_RIESGO | ROJO / ROJO_URGENTE | GLO elevado + indicadores criticos | Atencion inmediata |

### Escalas clinicas incluidas (31 en total)

| Grupo | Escalas |
|---|---|
| Control | INC, NEG, POS |
| Indices globales | GLO, EMO, CON, EJE, CTX, REC |
| Problemas interiorizados | DEP, ANS, ASC, SOM, PST, OBS |
| Problemas exteriorizados | ATE, HIP, IRA, AGR, DES, ANT |
| Otros problemas | SUS, ESQ, ALI |
| Contextuales | FAM, ESC, COM |
| Vulnerabilidades | REG, BUS |
| Recursos personales | AUT, SOC, CNC |

Todas las escalas se expresan en **puntuacion T** (media 50, DE 10). Rango normal: 33-59.

---

## API de Clasificacion ML

**Base URL:** `http://localhost:8000`

### Endpoints

#### `GET /health`
```json
{ "status": "healthy" }
```

#### `GET /api/v1/modelo/info`
```json
{
  "version": "0.1.0-reglas",
  "modelo_cargado": false,
  "tipo": "Reglas heuristicas",
  "clases": ["INCONSISTENCIA", "SIN_RIESGO", "IMPRESION_POSITIVA", "IMPRESION_NEGATIVA", "CON_RIESGO"]
}
```

#### `POST /api/v1/clasificar`

**Body:**
```json
{
  "estudiante_id": "est-5",
  "inc": 0.9,
  "neg": 1,
  "pos": 0,
  "glo_t": 66,
  "dep_t": 86,
  "items_criticos_count": 19
}
```

**Respuesta:**
```json
{
  "estudiante_id": "est-5",
  "tipo_caso": "CON_RIESGO",
  "semaforo": "ROJO_URGENTE",
  "confianza": 0.892,
  "observaciones": "Riesgo emocional alto confirmado. Atencion urgente requerida."
}
```

---

## Hoja de Ruta

- [x] Diseno del esquema de base de datos (Prisma)
- [x] Autenticacion y control de roles (NextAuth)
- [x] Dashboard con graficas (Recharts)
- [x] Expedientes individuales con escalas clinicas
- [x] API FastAPI con motor de reglas heuristicas
- [x] 5 casos tipo integrados para desarrollo
- [ ] Integracion real con PostgreSQL (Supabase)
- [ ] Extraccion automatica de PDFs del software TEA
- [ ] Entrenamiento del modelo XGBoost con dataset real (~2,000 tamizajes)
- [ ] Modulo de aplicacion digital del cuestionario SENA (188 items)
- [ ] Sistema de alertas y notificaciones
- [ ] Gestion de citas desde la plataforma

---

## Nota Etica

El cuestionario SENA es un instrumento con derechos registrados de **TEA Ediciones**. Este sistema es un prototipo academico desarrollado para fines de investigacion y concurso escolar. No se distribuyen ni reproducen los reactivos del instrumento. El uso en produccion requiere la licencia correspondiente.

Los datos de los estudiantes son altamente sensibles. El sistema debe operarse exclusivamente por personal autorizado y bajo protocolos de confidencialidad.

---

## Licencia

Proyecto academico — CECyTEN Tepic, 2026.
Uso educativo y no comercial.
