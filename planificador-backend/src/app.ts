import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import anosLectivosRouter from './modules/anos-lectivos/anos-lectivos.router';
import clasesRouter from './modules/clases/clases.router';
import suplenciasRouter from './modules/suplencias/suplencias.router';
import curriculumRouter from './modules/curriculum/curriculum.router';
import planificacionesRouter from './modules/planificaciones/planificaciones.router';
import archivosRouter from './modules/archivos/archivos.router';
import estudiantesRouter from './modules/estudiantes/estudiantes.router';
import { dificultadesEstudianteRouter, dificultadesRouter, clasesDificultadesRouter } from './modules/dificultades/dificultades.router';
import { adaptacionesPlanifRouter, adaptacionesRouter } from './modules/adaptaciones/adaptaciones.router';
import { comentariosPlanifRouter, comentariosRouter } from './modules/comentarios/comentarios.router';
import reportesRouter from './modules/reportes/reportes.router';

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const api = '/api/v1';
app.use(`${api}/auth`, authRouter);
app.use(`${api}/users`, usersRouter);
app.use(`${api}/anos-lectivos`, anosLectivosRouter);
app.use(`${api}/clases`, clasesRouter);
app.use(`${api}/clases/:claseId/estudiantes`, estudiantesRouter);
app.use(`${api}/clases/:claseId/dificultades`, clasesDificultadesRouter);
app.use(`${api}/suplencias`, suplenciasRouter);
app.use(`${api}/curriculum`, curriculumRouter);
app.use(`${api}/planificaciones`, planificacionesRouter);
app.use(`${api}/planificaciones/:planificacionId/adaptaciones`, adaptacionesPlanifRouter);
app.use(`${api}/planificaciones/:planificacionId/comentarios`, comentariosPlanifRouter);
app.use(`${api}/archivos`, archivosRouter);
app.use(`${api}/estudiantes/:estudianteId/dificultades`, dificultadesEstudianteRouter);
app.use(`${api}/dificultades`, dificultadesRouter);
app.use(`${api}/adaptaciones`, adaptacionesRouter);
app.use(`${api}/comentarios`, comentariosRouter);
app.use(`${api}/reportes`, reportesRouter);

if (env.NODE_ENV === 'development') {
  app.use('/uploads', express.static(path.resolve(env.UPLOADS_DIR)));
}

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
  console.log(`Entorno: ${env.NODE_ENV}`);
});

export default app;
