# Biblioteca_AppsWeb_CortezAngel

## Preguntas de reflexión

### 1. ¿Hizo falta una base de datos real para probar la regla de negocio? ¿Qué dice eso sobre para qué sirve el patrón Repository?
No, para nada. Las validaciones y la regla de no prestar un libro repetido se probaron completamente en memoria. Esto deja claro que el patrón Repository sirve para separar la lógica del almacenamiento: al dominio no le importa de dónde vienen los datos (si es un Map, SQL o Mongo), solo necesita un contrato que le permita consultar y guardar entidades.

### 2. El Service recibe el repositorio como `PrestamoRepository`, no `InMemoryPrestamoRepository`. ¿Qué se rompía si usaban la clase concreta?
Se rompía el desacoplamiento (inversión de dependencias). Si tipábamos con la clase concreta, el servicio quedaba amarrado a la memoria. Usando la interfaz, el servicio no depende de una tecnología específica y podemos cambiar el repositorio más adelante sin tocar una sola línea del servicio.

### 3. Si cambiaran el Map en memoria por una base de datos real, ¿cuántos archivos tocarían? ¿Por qué tan pocos?
Tocaríamos prácticamente dos: crear la nueva implementación en `src/infra/` (por ejemplo con Prisma o TypeORM) y cambiar una sola línea en `src/main.ts` para instanciar esa nueva clase. Son tan pocos porque las reglas de negocio, los DTOs y las entidades no dependen de la infraestructura, solo del contrato de la interfaz.