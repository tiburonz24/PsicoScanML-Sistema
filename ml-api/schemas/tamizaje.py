from pydantic import BaseModel, Field
from typing import Optional


class TamizajeInput(BaseModel):
    """Datos de entrada: escalas del SENA extraidas del PDF de TEA Ediciones."""

    # Identificacion
    estudiante_id: str

    # Escalas de control
    inc: float = Field(..., description="Inconsistencia")
    neg: float = Field(..., description="Impresion negativa")
    pos: float = Field(..., description="Impresion positiva")

    # Indices globales (puntuacion T)
    glo_t: int
    emo_t: int
    con_t: int
    eje_t: int
    ctx_t: int
    rec_t: int

    # Problemas interiorizados
    dep_t: int
    ans_t: int
    asc_t: int
    som_t: int
    pst_t: int
    obs_t: int

    # Problemas exteriorizados
    ate_t: int
    hip_t: int
    ira_t: int
    agr_t: int
    des_t: int
    ant_t: int

    # Otros problemas
    sus_t: int
    esq_t: int
    ali_t: int

    # Problemas contextuales
    fam_t: int
    esc_t: int
    com_t: int

    # Vulnerabilidades
    reg_t: int
    bus_t: int

    # Recursos personales
    aut_t: int
    soc_t: int
    cnc_t: int

    # Items criticos (numero de items activos)
    items_criticos_count: int = 0

    # Cadena de 188 respuestas brutas (requerida cuando el modelo ML esta activo)
    respuestas: Optional[str] = Field(None, description="Cadena de 188 digitos (1-5)")

    # Datos demográficos (opcionales, mejoran la predicción del modelo)
    edad: Optional[int] = Field(None, description="Edad del estudiante en años")
    sexo: Optional[str] = Field(None, description="MASCULINO | FEMENINO | OTRO")


class TamizajeOutput(BaseModel):
    """Resultado de la clasificacion ML."""

    estudiante_id: str
    tipo_caso: str = Field(..., description="INCONSISTENCIA | SIN_RIESGO | IMPRESION_POSITIVA | IMPRESION_NEGATIVA | CON_RIESGO")
    semaforo: str = Field(..., description="VERDE | AMARILLO | ROJO | ROJO_URGENTE")
    confianza: Optional[float] = Field(None, description="Probabilidad de la clase predicha (0-1)")
    observaciones: Optional[str] = None
