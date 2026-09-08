import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { InMemoryPrestamoRepository } from '../src/infra/in-memory-prestamo.repository.js';
import { PrestamoService } from '../src/servicios/prestamo.service.js';
import { aResponseDto, type ErrorResponseDto } from '../contratos/prestamo.dto.js';
import { validarCrearPrestamo, manejadorErrores } from './validar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
export const puerto = 3000;

// Repositorio y Servicio de dominio
const repositorio = new InMemoryPrestamoRepository();
export const servicio = new PrestamoService(repositorio);

// Middlewares globales
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'publico')));

// Ruta GET /api/prestamos
app.get('/api/prestamos', async (req, res, next) => {
  try {
    const libroId = req.query.libroId;
    if (!libroId || typeof libroId !== 'string' || libroId.trim() === '') {
      res.status(400).json({
        error: 'El parámetro libroId es obligatorio y no puede estar vacío',
      } satisfies ErrorResponseDto);
      return;
    }

    const lista = await servicio.listarPorLibro(libroId.trim());
    // Convertir cada entidad al DTO de respuesta para no exponer costoReposicion
    const dtos = lista.map((p) => aResponseDto(p));
    res.status(200).json(dtos);
  } catch (err) {
    next(err);
  }
});

// Ruta POST /api/prestamos
app.post('/api/prestamos', async (req, res, next) => {
  try {
    const dto = validarCrearPrestamo(req.body);
    const nuevo = await servicio.crear(dto);

    // Responder 201 Created con cabecera Location
    res.setHeader('Location', `/api/prestamos/${nuevo.folio}`);
    res.status(201).json(aResponseDto(nuevo));
  } catch (err) {
    next(err);
  }
});

// Middleware de manejo de errores
app.use(manejadorErrores);

app.listen(puerto, () => {
  console.log(`Servidor Express escuchando en http://localhost:${puerto}`);
});
