import type { Prestamo, EstadoPrestamo } from '../src/dominio/prestamo.entity.js';

export interface PrestamoResponseDto {
  folio: string;
  libroId: string;
  ejemplares: number[];
  socioId: string;
  estado: EstadoPrestamo;
  creadoEn: string;
}

export interface CrearPrestamoRequestDto {
  libroId: string;
  socioId: string;
  ejemplares: number[];
}

export interface ErrorResponseDto {
  error: string;
  detalles?: string[];
}

export function aResponseDto(p: Prestamo): PrestamoResponseDto {
  return {
    folio: p.folio,
    libroId: p.libroId,
    ejemplares: p.ejemplares,
    socioId: p.socioId,
    estado: p.estado,
    creadoEn: p.creadoEn.toISOString(),
  };
}
