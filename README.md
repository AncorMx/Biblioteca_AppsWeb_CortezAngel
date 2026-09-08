# Biblioteca_AppsWeb_CortezAngel

## Preguntas de reflexión

### 1. ¿Hizo falta una base de datos real para probar la regla de negocio? ¿Qué dice eso sobre para qué sirve el patrón Repository?
No, no hizo falta. La regla de no prestar un libro repetido se probó directamente con la colección en memoria. Para eso sirve el Repository: para separar la lógica de negocio de la base de datos, de modo que al servicio no le importe dónde se guardan los datos, solo que cumplan con los métodos para consultarlos y guardarlos.

### 2. El Service recibe el repositorio como `PrestamoRepository`, no `InMemoryPrestamoRepository`. ¿Qué se rompía si usaban la clase concreta?
Se perdía la flexibilidad. Si usábamos la clase concreta, el servicio quedaba atado a la memoria. Usando la interfaz, el servicio no depende de una tecnología fija y podemos cambiar de base de datos más adelante sin tener que modificar el servicio.

### 3. Si cambiaran el Map en memoria por una base de datos real, ¿cuántos archivos tocarían? ¿Por qué tan pocos?
Solo dos: crear la nueva clase en `infra` con la conexión a la base de datos y cambiar la línea en `main.ts` (o `servidor.ts`) donde se instancia el repositorio. Son tan pocos porque todo lo demás (el servicio, las entidades y los DTOs) solo depende de la interfaz, no de la implementación.