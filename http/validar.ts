import type { Request, Response, NextFunction } from 'express';
import type { CrearPrestamoRequestDto, ErrorResponseDto } from '../contratos/prestamo.dto.js';
import { EjemplarPrestadoError } from '../src/errores/ejemplar-prestado.error.js';

export class ValidacionError extends Error {
  constructor(public readonly errores: string[]) {
    super(errores.join('; '));
    this.name = 'ValidacionError';
  }
}

export function validarCrearPrestamo(dato: unknown): CrearPrestamoRequestDto {
  const errores: string[] = [];

  if (!dato || typeof dato !== 'object') {
    throw new ValidacionError(['El cuerpo de la petición debe ser un objeto JSON']);
  }

  const body = dato as Record<string, unknown>;

  if (typeof body.libroId !== 'string' || body.libroId.trim() === '') {
    errores.push('El campo libroId es obligatorio y debe ser una cadena de texto no vacía');
  }

  if (typeof body.socioId !== 'string' || body.socioId.trim() === '') {
    errores.push('El campo socioId es obligatorio y debe ser una cadena de texto no vacía');
  }

  if (!Array.isArray(body.ejemplares)) {
    errores.push('El campo ejemplares debe ser un arreglo');
  } else if (body.ejemplares.length === 0) {
    errores.push('El campo ejemplares no puede estar vacío');
  } else {
    const todosSonNumerosValidos = body.ejemplares.every(
      (e) => typeof e === 'number' && !Number.isNaN(e) && Number.isInteger(e) && e > 0
    );
    if (!todosSonNumerosValidos) {
      errores.push('Todos los ejemplares deben ser números enteros positivos');
    }
  }

  if (errores.length > 0) {
    throw new ValidacionError(errores);
  }

  return {
    libroId: (body.libroId as string).trim(),
    socioId: (body.socioId as string).trim(),
    ejemplares: body.ejemplares as number[],
  };
}

export function manejadorErrores(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    const respuesta: ErrorResponseDto = {
      error: 'JSON malformado en el cuerpo de la petición',
    };
    res.status(400).json(respuesta);
    return;
  }

  if (err instanceof ValidacionError) {
    const respuesta: ErrorResponseDto = {
      error: err.message,
      detalles: err.errores,
    };
    res.status(400).json(respuesta);
    return;
  }

  if (err instanceof EjemplarPrestadoError) {
    const respuesta: ErrorResponseDto = {
      error: err.message,
    };
    res.status(409).json(respuesta);
    return;
  }

  console.error('Error interno no controlado:', err);
  const respuesta: ErrorResponseDto = {
    error: 'Error interno del servidor',
  };
  res.status(500).json(respuesta);
}
