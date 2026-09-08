import type { Request, Response, NextFunction } from 'express';
import type { CrearPrestamoRequestDto, ErrorResponseDto } from '../contratos/prestamo.dto.js';
import { EjemplarPrestadoError } from '../src/errores/ejemplar-prestado.error.js';

export class ValidacionError extends Error {
  constructor(public readonly errores: string[]) {
    super(errores.join(', '));
    this.name = 'ValidacionError';
  }
}

export function validarCrearPrestamo(dato: unknown): CrearPrestamoRequestDto {
  const errores: string[] = [];

  if (!dato || typeof dato !== 'object') {
    throw new ValidacionError(['Cuerpo invalido']);
  }

  const body = dato as Record<string, unknown>;

  if (typeof body.libroId !== 'string' || body.libroId.trim() === '') {
    errores.push('Falta el libroId');
  }

  if (typeof body.socioId !== 'string' || body.socioId.trim() === '') {
    errores.push('Falta el socioId');
  }

  if (!Array.isArray(body.ejemplares)) {
    errores.push('ejemplares debe ser un arreglo');
  } else if (body.ejemplares.length === 0) {
    errores.push('ejemplares no puede estar vacio');
  } else {
    const invalidos = body.ejemplares.some(
      (e) => typeof e !== 'number' || Number.isNaN(e) || e <= 0
    );
    if (invalidos) {
      errores.push('Los ejemplares deben ser numeros');
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
    res.status(400).json({ error: 'JSON invalido' } satisfies ErrorResponseDto);
    return;
  }

  if (err instanceof ValidacionError) {
    res.status(400).json({
      error: err.message,
      detalles: err.errores,
    } satisfies ErrorResponseDto);
    return;
  }

  if (err instanceof EjemplarPrestadoError) {
    res.status(409).json({
      error: err.message,
    } satisfies ErrorResponseDto);
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Error del servidor' } satisfies ErrorResponseDto);
}
