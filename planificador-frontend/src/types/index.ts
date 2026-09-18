export type Rol = 'MAESTRA' | 'DIRECTORA' | 'SECRETARIA' | 'SUPLENTE';
export type Tramo = 'INICIAL_TRAMO_1' | 'PRIMARIA_TRAMO_2' | 'PRIMARIA_TRAMO_3' | 'PRIMARIA_TRAMO_4';

export interface Usuario { id: string; nombre: string; email: string; rol: Rol; activo: boolean; createdAt?: string; }
export interface AnoLectivo { id: string; anio: number; activo: boolean; }
export interface Clase {
  id: string; nombre: string; nivel: string; seccion: string; tramo: Tramo;
  anoLectivoId: string; anoLectivo: AnoLectivo;
  usuarios?: { usuarioId: string; usuario?: Pick<Usuario, 'id' | 'nombre' | 'rol'> }[];
}
export interface EspacioCurricular { id: string; nombre: string; color: string; orden: number; unidades?: UnidadCurricular[]; }
export interface UnidadCurricular { id: string; nombre: string; espacioCurricularId: string; orden: number; espacioCurricular?: EspacioCurricular; }
export interface Planificacion {
  id: string; titulo?: string; descripcion: string; metasAprendizaje?: string; fecha: string;
  claseId: string; clase?: Clase; espacioCurricularId: string; espacioCurricular: EspacioCurricular;
  unidades: { unidadCurricular: UnidadCurricular }[];
  competenciasEspecificas?: { competenciaEspecificaId: string; competencia?: CompetenciaEspecifica }[];
  contenidos?: { contenidoItemId: string; contenidoItem?: ContenidoItem }[];
  archivos: ArchivoAdjunto[]; adaptaciones?: Adaptacion[]; comentarios?: Comentario[];
  autorCreacion: { id: string; nombre: string }; autorUltimaEdicion: { id: string; nombre: string };
  createdAt: string; updatedAt: string;
}
export interface ArchivoAdjunto { id: string; planificacionId: string; nombreOriginal: string; mimeType: string; tamanoBytes: number; createdAt: string; }
export interface Estudiante { id: string; nombre: string; claseId: string; anoLectivoId: string; activo: boolean; dificultades?: DificultadApoyo[]; }
export interface DificultadApoyo {
  id: string; estudianteId: string; espacioCurricularId?: string; unidadCurricularId?: string; observacion: string;
  espacioCurricular?: EspacioCurricular; unidadCurricular?: UnidadCurricular;
  estudiante?: { id: string; nombre: string; claseId: string };
}
export interface Adaptacion { id: string; planificacionId: string; descripcion: string; estudiantes: { estudiante: { id: string; nombre: string } }[]; }
export interface Comentario { id: string; planificacionId: string; texto: string; autor: { id: string; nombre: string }; createdAt: string; updatedAt: string; }
export interface Suplencia {
  id: string; usuarioId: string; claseId: string; creadoPorId: string; fechaInicio: string; fechaFin: string;
  motivo?: string; activo: boolean; usuario: Pick<Usuario, 'id' | 'nombre' | 'email' | 'rol'>;
  clase: Clase; creadoPor: Pick<Usuario, 'id' | 'nombre'>;
}
export interface CompetenciaEspecifica { id: string; codigo: string; descripcion: string; contribuyeA: string[]; unidadCurricularId: string; tramo: Tramo; }
export interface ContenidoItem { id: string; texto: string; orden: number; bloqueContenidoId: string; }
export interface BloqueContenido {
  id: string; unidadCurricularId: string; tramo: Tramo; nivel: string; eje: string; contenidoEstructurante?: string;
  criteriosDeLogro: string[]; competencias: { competencia: { id: string; codigo: string } }[]; items: ContenidoItem[];
}
export interface AlertaCobertura { claseId: string; claseNombre?: string; espacioNombre: string; diasSinPlanificacion: number; mensaje: string; }
