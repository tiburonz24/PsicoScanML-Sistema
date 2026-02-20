import { MockTamizaje } from "@/lib/data/mock"

type Props = { tamizaje: MockTamizaje }

function FilaEscala({ label, valor }: { label: string; valor: number }) {
  const color =
    valor >= 70 ? "text-red-600 font-bold" :
    valor >= 60 ? "text-orange-500 font-semibold" :
    valor <= 35 ? "text-blue-600 font-semibold" :
    "text-gray-700"

  const barra =
    valor >= 70 ? "bg-red-400" :
    valor >= 60 ? "bg-orange-400" :
    valor <= 35 ? "bg-blue-400" :
    "bg-gray-300"

  const pct = Math.min((valor / 110) * 100, 100)

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-gray-500 w-36 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${barra} h-2 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs w-8 text-right ${color}`}>{valor}</span>
    </div>
  )
}

export default function TarjetaEscalas({ tamizaje: t }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-1 overflow-y-auto max-h-[360px]">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">
        Escalas numericas (T)
      </h2>

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-2">Indices globales</p>
      <FilaEscala label="Global (GLO)"          valor={t.glo_t} />
      <FilaEscala label="Emocional (EMO)"        valor={t.emo_t} />
      <FilaEscala label="Conductual (CON)"       valor={t.con_t} />
      <FilaEscala label="Ejecutivo (EJE)"        valor={t.eje_t} />
      <FilaEscala label="Contextual (CTX)"       valor={t.ctx_t} />
      <FilaEscala label="Recursos (REC)"         valor={t.rec_t} />

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-3">Prob. interiorizados</p>
      <FilaEscala label="Depresion (DEP)"        valor={t.dep_t} />
      <FilaEscala label="Ansiedad (ANS)"         valor={t.ans_t} />
      <FilaEscala label="Somatizacion (SOM)"     valor={t.som_t} />
      <FilaEscala label="Aislamiento (ASC)"      valor={t.asc_t} />
      <FilaEscala label="Postrauma (PST)"        valor={t.pst_t} />
      <FilaEscala label="Obsesion (OBS)"         valor={t.obs_t} />

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-3">Prob. exteriorizados</p>
      <FilaEscala label="Atencion (ATE)"         valor={t.ate_t} />
      <FilaEscala label="Hiperactividad (HIP)"   valor={t.hip_t} />
      <FilaEscala label="Ira (IRA)"              valor={t.ira_t} />
      <FilaEscala label="Agresion (AGR)"         valor={t.agr_t} />
      <FilaEscala label="Desafio (DES)"          valor={t.des_t} />
      <FilaEscala label="Antisocial (ANT)"       valor={t.ant_t} />

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-3">Otros / Contextuales</p>
      <FilaEscala label="Esquizotipia (ESQ)"     valor={t.esq_t} />
      <FilaEscala label="Alimentacion (ALI)"     valor={t.ali_t} />
      <FilaEscala label="Familia (FAM)"          valor={t.fam_t} />
      <FilaEscala label="Escuela (ESC)"          valor={t.esc_t} />
      <FilaEscala label="Comunidad (COM)"        valor={t.com_t} />

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-3">Recursos personales</p>
      <FilaEscala label="Autoestima (AUT)"       valor={t.aut_t} />
      <FilaEscala label="Social (SOC)"           valor={t.soc_t} />
      <FilaEscala label="Consciencia (CNC)"      valor={t.cnc_t} />
    </div>
  )
}
