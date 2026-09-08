import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { InMemoryPrestamoRepository } from '../src/infra/in-memory-prestamo.repository.js';
import { PrestamoService } from '../src/servicios/prestamo.service.js';
import { aResponseDto } from '../contratos/prestamo.dto.js';
import { validarCrearPrestamo, manejadorErrores } from './validar.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
export const puerto = 3000;

const repositorio = new InMemoryPrestamoRepository();
export const servicio = new PrestamoService(repositorio);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'publico')));

app.get('/api/prestamos', async (req, res, next) => {
  try {
    const libroId = req.query.libroId;
    if (!libroId || typeof libroId !== 'string' || libroId.trim() === '') {
      res.status(400).json({ error: 'Falta el parametro libroId' });
      return;
    }

    const lista = await servicio.listarPorLibro(libroId.trim());
    res.status(200).json(lista.map(aResponseDto));
  } catch (err) {
    next(err);
  }
});

app.post('/api/prestamos', async (req, res, next) => {
  try {
    const dto = validarCrearPrestamo(req.body);
    const nuevo = await servicio.crear(dto);

    res.setHeader('Location', `/api/prestamos/${nuevo.folio}`);
    res.status(201).json(aResponseDto(nuevo));
  } catch (err) {
    next(err);
  }
});

app.use(manejadorErrores);

app.listen(puerto, () => {
  console.log(`Servidor en http://localhost:${puerto}`);
});
