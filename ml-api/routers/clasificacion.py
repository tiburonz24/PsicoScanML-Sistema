from fastapi import APIRouter, HTTPException
from schemas.tamizaje import TamizajeInput, TamizajeOutput
from services.clasificador import ClasificadorML

router = APIRouter()
clasificador = ClasificadorML()


@router.post("/clasificar", response_model=TamizajeOutput)
def clasificar_tamizaje(datos: TamizajeInput):
    """
    Recibe las escalas del SENA y devuelve el tipo de caso y semaforo ML.
    """
    try:
        resultado = clasificador.predecir(datos)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/modelo/info")
def info_modelo():
    """Devuelve informacion sobre el modelo entrenado."""
    return clasificador.info()
