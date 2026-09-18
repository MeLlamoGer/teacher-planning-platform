import bcrypt from 'bcryptjs';
import { PrismaClient, Rol, Tramo } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminNombre = process.env.SEED_ADMIN_NOMBRE ?? 'Admin Demo';

  if (!adminEmail || !adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required to run the demo seed.');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: { nombre: adminNombre, activo: true },
    create: {
      nombre: adminNombre,
      email: adminEmail,
      passwordHash,
      rol: Rol.DIRECTORA,
    },
  });

  const year = await prisma.anoLectivo.upsert({
    where: { anio: 2026 },
    update: { activo: true },
    create: { anio: 2026, activo: true },
  });

  const clase = await prisma.clase.upsert({
    where: {
      nivel_seccion_anoLectivoId: {
        nivel: '5to',
        seccion: 'A',
        anoLectivoId: year.id,
      },
    },
    update: { nombre: '5to A', tramo: Tramo.PRIMARIA_TRAMO_4 },
    create: {
      nombre: '5to A',
      nivel: '5to',
      seccion: 'A',
      tramo: Tramo.PRIMARIA_TRAMO_4,
      anoLectivoId: year.id,
    },
  });

  const matematica = await prisma.espacioCurricular.upsert({
    where: { nombre: 'Matemática' },
    update: {},
    create: { nombre: 'Matemática', color: '#2563eb', orden: 1 },
  });

  const numeracion = await prisma.unidadCurricular.upsert({
    where: {
      nombre_espacioCurricularId: {
        nombre: 'Numeración',
        espacioCurricularId: matematica.id,
      },
    },
    update: {},
    create: {
      nombre: 'Numeración',
      espacioCurricularId: matematica.id,
      orden: 1,
    },
  });

  const competencia = await prisma.competenciaEspecifica.upsert({
    where: {
      codigo_unidadCurricularId_tramo: {
        codigo: 'CE1',
        unidadCurricularId: numeracion.id,
        tramo: Tramo.PRIMARIA_TRAMO_4,
      },
    },
    update: {},
    create: {
      codigo: 'CE1',
      descripcion: 'Resuelve situaciones numéricas y comunica estrategias de resolución.',
      contribuyeA: ['Pensamiento matemático'],
      unidadCurricularId: numeracion.id,
      tramo: Tramo.PRIMARIA_TRAMO_4,
    },
  });

  let bloque = await prisma.bloqueContenido.findFirst({
    where: {
      unidadCurricularId: numeracion.id,
      tramo: Tramo.PRIMARIA_TRAMO_4,
      nivel: '5to',
      eje: 'Número',
    },
  });

  if (!bloque) {
    bloque = await prisma.bloqueContenido.create({
      data: {
        unidadCurricularId: numeracion.id,
        tramo: Tramo.PRIMARIA_TRAMO_4,
        nivel: '5to',
        eje: 'Número',
        contenidoEstructurante: 'Números racionales',
        criteriosDeLogro: ['Compara y representa fracciones en situaciones contextualizadas.'],
        competencias: {
          create: [{ competenciaEspecificaId: competencia.id }],
        },
        items: {
          create: [
            { texto: 'Fracciones equivalentes', orden: 1 },
            { texto: 'Comparación y representación de fracciones', orden: 2 },
          ],
        },
      },
    });
  }

  const syntheticNames = ['Ana Demo', 'Bruno Demo', 'Carla Demo'];
  for (const nombre of syntheticNames) {
    const exists = await prisma.estudiante.findFirst({
      where: { nombre, claseId: clase.id, anoLectivoId: year.id },
    });
    if (!exists) {
      await prisma.estudiante.create({
        data: {
          nombre,
          claseId: clase.id,
          anoLectivoId: year.id,
        },
      });
    }
  }

  console.log('Synthetic demo seed completed.');
  console.log(`Admin created/updated: ${admin.email}`);
  console.log(`Demo class: ${clase.nombre}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
