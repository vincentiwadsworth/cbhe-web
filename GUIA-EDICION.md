# Guía de edición del sitio web de la CBHE

Para el personal de la CBHE que actualiza el contenido del sitio sin conocimientos de programación. Esta guía explica qué puede editar usted mismo, cómo funciona el editor, qué cambios requieren apoyo técnico y cómo funcionan las copias de seguridad.

---

## 1. Qué puede actualizar usted mismo

El sitio tiene un panel de edición llamado Sveltia CMS. Se abre en:

**https://cbhe.org.bo/admin/**

Para entrar, presione el botón **Login with GitHub** y autorice con la cuenta de GitHub que le entregaron. La primera vez, el soporte técnico le crea la cuenta y le da un token de acceso personal. Ese token es su contraseña del panel. Si la sesión vence, vuelva a iniciar sesión; si no puede entrar, pida ayuda al soporte.

Desde el panel se editan cinco tipos de contenido. Cada tipo se llama **colección**: un grupo de contenido con la misma forma. Estas son las cinco colecciones disponibles y lo que hace cada una.

### Cursos

Aparecen en el catálogo de la página Capacitación y en la portada cuando están marcados como destacados.

| Campo | ¿Obligatorio? | Para qué sirve |
|-------|:-----------:|----------------|
| Título | Sí | Nombre del curso tal como se muestra en el catálogo |
| Categoría | Sí | Curso o Certificación |
| Modalidad | Sí | Virtual, Presencial o Híbrido |
| Imagen | Opcional | Foto o banner del curso. Si no tiene, puede publicar solo con el link de Canva |
| Fecha de inicio | Sí | Cuándo empieza el curso |
| Precio / Inversión | Sí | Texto libre. Ejemplo: "950 Bs. (750 Bs. lanzamiento hasta 22 de mayo)" |
| Fecha límite de inscripción | Opcional | Solo si hay un precio de lanzamiento con fecha de corte |
| Link a Canva | Opcional | URL del diseño en Canva con toda la información del curso |
| Descripción breve | Opcional | Una o dos líneas para la tarjeta del catálogo |
| Ponentes / Instructores | Opcional | Nombre y biografía de cada instructor |
| Contenido completo | Opcional | Cuerpo del curso. Puede dejarlo vacío si el diseño de Canva cubre toda la información |
| Destacado | Opcional | Interruptor. Activado, el curso se muestra en la sección Cursos destacados al inicio del catálogo |
| Borrador | Opcional | Interruptor. Activado, el curso nunca aparece en el sitio |

### Artículos (Novedades)

Aparecen en la página Novedades y en la sección de novedades de la portada.

| Campo | ¿Obligatorio? | Para qué sirve |
|-------|:-----------:|----------------|
| Título | Sí | Título del artículo |
| Categoría | Sí | Noticias, Análisis, Eventos o Capacitación |
| Extracto | Sí | Resumen de una o dos líneas que se muestra en la lista de novedades |
| Fecha | Sí | Fecha de publicación del artículo |
| Imagen | Opcional | Imagen principal del artículo |
| Destacado en portada | Opcional | Interruptor. Activado, el artículo aparece como banner destacado en la parte superior de Novedades y en la portada |
| Contenido completo | Sí | Cuerpo del artículo |
| Borrador | Opcional | Interruptor. Activado, el artículo nunca aparece en el sitio |

### Empresas Afiliadas

Aparecen en la página Empresas Afiliadas y en los logos de la portada.

| Campo | ¿Obligatorio? | Para qué sirve |
|-------|:-----------:|----------------|
| Nombre de la Empresa | Sí | Razón social tal como se muestra en el sitio |
| Grupo Industrial | Sí | Exploración y explotación, pozo, superficie, transporte y distribución, servicios auxiliares o adherentes |
| Sitio Web | Opcional | Dirección web de la empresa |
| Correo de Contacto | Opcional | Correo público de contacto |
| Logo | Opcional | Logo de la empresa. Idealmente PNG con fondo transparente |
| Destacada en portada | Opcional | Interruptor. Activado, la empresa aparece con tarjeta destacada en la portada |
| Orden | Opcional | Número. Menor número, más arriba aparece. Si hay empate, se ordena alfabéticamente |
| Borrador | Opcional | Interruptor. Activado, la empresa nunca aparece en el sitio |

### Testimonios

Aparecen en la portada, en la sección de testimonios que rota automáticamente.

| Campo | ¿Obligatorio? | Para qué sirve |
|-------|:-----------:|----------------|
| Nombre de la persona | Sí | Nombre tal como se muestra en la tarjeta |
| Cargo | Sí | Cargo en la empresa, por ejemplo Gerente General |
| Empresa | Sí | Empresa de la persona |
| Testimonio completo | Sí | Texto de dos a cuatro líneas que acompaña a la frase destacada |
| Frase destacada | Sí | Frase corta que resalta en negrita dentro de la tarjeta |
| Foto | Opcional | Foto de la persona. Si no hay, la tarjeta se muestra sin imagen |
| Borrador | Opcional | Interruptor. Activado, el testimonio nunca aparece en el sitio |

### Directorio

Aparece en la página Quiénes somos, en la sección Directorio. Todo se edita desde una sola entrada: los grupos y, dentro de cada grupo, sus miembros.

| Campo | ¿Obligatorio? | Para qué sirve |
|-------|:-----------:|----------------|
| Grupo | Sí | Nombre del grupo, por ejemplo Upstream o Servicios Auxiliares |
| Miembros | Sí | Lista de cargos de ese grupo |
| Cargo | Sí | Cargo en el Directorio, por ejemplo Presidente o Director Titular |
| Nombre | Sí | Nombre completo de la persona |
| Empresa | Sí | Empresa que representa en el Directorio |

---

## 2. Cómo funciona el editor

El panel guarda cada cambio en la plataforma GitHub, donde vive el proyecto del sitio. GitHub es la misma plataforma que usa el sitio para publicarse y para guardar el historial. No necesita saber nada de GitHub para trabajar: solo necesita entender dos botones.

### Save (Guardar)

Haga clic en **Save** cuando quiera guardar su trabajo sin publicarlo. El cambio queda guardado en el proyecto y otros editores lo verán al abrir el panel, pero el sitio público no cambia. Úselo para borradores en los que todavía está trabajando.

### Save and Publish (Guardar y publicar)

Haga clic en **Save and Publish** cuando el contenido esté listo para verse en el sitio. Este botón guarda el cambio y dispara la publicación automática. El sitio se reconstruye y en aproximadamente uno o dos minutos el contenido nuevo está visible en cbhe.org.bo.

### El interruptor Borrador

Cada elemento tiene un campo adicional llamado **Borrador**. Mientras ese interruptor esté activado, el elemento nunca se muestra en el sitio, ni siquiera cuando usted usa Save and Publish. Es un doble control: Save decide si publica ahora; Borrador decide si el elemento existe en el sitio.

### Imágenes

Las imágenes se suben desde el mismo panel con el botón de imagen de cada campo. Quedan guardadas en la carpeta de imágenes del proyecto. Para detalles sobre formatos y tamaños recomendados, vea la [Guía de Editores](./GUIA-EDITORES.md).

### Orden de los elementos

El sitio aplica reglas automáticas al publicarse. Los cursos con fecha pasada se ocultan solos, los artículos se ordenan por fecha, y los cursos y artículos marcados como destacados se excluyen de las listas cronológicas para no repetirse. No tiene que hacer nada: ocurre solo en cada publicación.

---

## 3. Qué no se puede cambiar sin soporte

Estas partes del sitio no se editan desde el panel. Están escritas directamente en el código del proyecto y cualquier cambio requiere la intervención del soporte técnico:

- **Portada**: la estructura general del inicio (banner, secciones, orden de bloques, textos de presentación).
- **Quiénes somos**: la historia institucional, pilares y valores. El Directorio se edita desde el panel (ver sección 1).
- **Afiliación**: requisitos, proceso de aprobación, beneficios y grupos industriales.
- **RSE**: contenidos de responsabilidad social empresarial.
- **Contacto**: datos de oficina, formulario y textos de la página.
- **Menú de navegación**: las páginas que aparecen en el menú superior y en el pie de página.
- **Diseño general**: colores, tipografías, estilos visuales.

Para cualquiera de estos cambios, contacte al soporte técnico (Nicolás) con una descripción de lo que necesita. El cambio se realiza en el código y se publica con el mismo proceso automático.

---

## 4. Copias de seguridad: así funciona Git

Cada vez que usted publica un cambio, el sistema toma una fotografía completa y numerada del sitio y la guarda en GitHub. Esas fotografías se guardan siempre, no se pueden perder y no se pueden alterar. GitHub actúa además como copia remota: un respaldo fuera de las computadoras de la oficina, en servidores de la empresa más usada del mundo para este fin. Es el estándar de la industria.

Piense en el historial como un álbum numerado. La fotografía 1 es la primera versión del sitio, la fotografía 2 la siguiente, y así sucesivamente. Cada publicación suma una fotografía nueva. Ninguna se borra.

La consecuencia práctica para usted es simple: **si un cambio sale mal, se restaura la versión anterior**. No se pierde nada que estuviera publicado antes. Si publica un curso con un error o un artículo incompleto, se vuelve a la versión buena y el sitio queda como estaba.

Restaurar una versión anterior no lo hace usted desde el panel. Lo hace el soporte técnico, con unos pocos clics, y el sitio vuelve a publicarse con el historial intacto.

---

## 5. Flujo de trabajo recomendado

1. **Redacte y revise antes de publicar.** Escriba el contenido, guárdelo con Save y revíselo con calma. Pida una segunda lectura a un colega cuando sea un texto importante.
2. **Verifique datos y fechas.** Un curso mal fechado o un precio equivocado generan consultas que se evitan con una revisión de dos minutos.
3. **Publique con Save and Publish** cuando el contenido esté listo.
4. **Espere uno o dos minutos** y revise el resultado en el sitio real, no en el panel. Confirme que el curso aparece en el catálogo, que el artículo se ve completo y que las imágenes cargan.
5. **Si algo salió mal**, no publique otra corrección apurada. Avise al soporte técnico: restaura la versión anterior o corrige el error en el código.

---

## 6. Fase futura

Existe la opción técnica de exponer los textos de la Portada y de Quiénes somos como colecciones editables desde el panel, igual que los cursos y los artículos. Es una mejora planificada que se puede implementar más adelante si la CBHE lo solicita. Hoy no está activa.

---

## Glosario

| Término | Significado |
|---------|-------------|
| **Sveltia CMS** | El panel de edición del sitio. Se abre en cbhe.org.bo/admin/ |
| **Colección** | Grupo de contenido del mismo tipo: Cursos, Artículos, Empresas Afiliadas, Testimonios o Directorio |
| **Save** | Botón que guarda el cambio sin publicarlo |
| **Save and Publish** | Botón que guarda y publica el cambio en el sitio |
| **Borrador** | Interruptor que oculta un elemento del sitio, aunque se publique |
| **GitHub** | Plataforma donde vive el proyecto del sitio y su historial completo de versiones |
| **Versión** | Fotografía completa del sitio en un momento dado, guardada con su número |
| **Token** | Contraseña personal de acceso al panel. Cada editor tiene la suya |
| **Deploy** | Publicación automática: el proceso que reconstruye el sitio y lo sube a internet |

## Documentos relacionados

- [Guía de Editores](./GUIA-EDITORES.md): manual detallado del panel, con imágenes, Markdown y solución de problemas.
- [Guía de Certificados](./GUIA-CERTIFICADOS.md): para emitir Sellos CBHE y Certificados de Capacitación.
