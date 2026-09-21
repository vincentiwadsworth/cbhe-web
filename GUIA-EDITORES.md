# Guía de Editores (CBHE)

> **Para**: Responsable de Comunicación, Responsable de Capacitación, Responsable de Gestión  
> **Última revisión**: 16 de septiembre de 2026

## Resumen rápido

- Cómo entrar al CMS, escribir contenido y publicarlo en el sitio web de la CBHE.
- Diferencia entre **Guardar** (borrador privado) y **Publicar** (visible en el sitio web público).
- Cómo subir imágenes, qué formatos usar y cómo resolver problemas comunes.
- Qué cambios requieren soporte técnico y cómo funcionan las copias de seguridad.

---

## 1. Acceso al CMS

- **URL**: `https://vincentiwadsworth.github.io/cbhe-web/admin/`
- **Nota sobre el dominio**: `cbhe.org.bo` todavía no sirve el sitio (migración en curso). Cuando la migración esté completa, la dirección del CMS pasará a ser `https://cbhe.org.bo/admin/`.
- **Iniciar sesión**: botón _Login with GitHub_ → autorizar con su cuenta de GitHub.
- **Primera vez**: cualquier persona que administre la cuenta GitHub de la CBHE puede generar un **token de acceso personal** con estos pasos:
  1. Entre a `github.com` e inicie sesión con la cuenta GitHub de la CBHE.
  2. Abra **Settings** desde el menú de su perfil, en la esquina superior derecha.
  3. En el menú de la izquierda, vaya a **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
  4. Haga clic en **Generate new token**.
  5. Marque el scope **repo**.
  6. Haga clic en **Generate token** y copie el token. Solo se muestra una vez.
- **Guarde el token** en un lugar seguro. Es su contraseña del CMS.
- **¿No entra?**: revise que el token no haya expirado. Si expiró, genere otro con los pasos anteriores.
- El CMS se llama **Sveltia**. Es el panel donde se escribe, edita y publica todo el contenido del sitio.

---

## 2. Cómo funciona

1. Entre al CMS con su token de GitHub (sección 1).
2. Elija la colección (Cursos, Artículos, Empresas, Testimonios, Directorio o Banner publicitario).
3. Escriba o edite el contenido y use **Save & Publish**: en 2 o 3 minutos el cambio está visible en el sitio.

---

## 3. Publicar contenido

- **Save** = commit con `[skip ci]` → el cambio queda en el CMS pero **no se publica**. Ideal para seguir editando.
- **Save & Publish** = commit sin `[skip ci]` → dispara el build automático y en ~2-3 minutos el contenido está **visible en el sitio público** (`https://vincentiwadsworth.github.io/cbhe-web/`).

Cada elemento tiene además un interruptor llamado **Borrador**. Mientras esté activado, el elemento nunca aparece en el sitio, ni siquiera cuando usa Save and Publish. Son dos controles distintos: Save decide si publica ahora; Borrador decide si el elemento existe en el sitio.

---

## 4. Trabajar con imágenes

- **Formatos**: JPG para fotos, PNG para logos (transparencia), WebP para mejor calidad con menor peso.
- **Tamaño**: máximo 2 MB por imagen, ideal menos de 500 KB. Ancho recomendado: 1920 píxeles. Si la imagen supera los 2 MB, Sveltia puede fallar al guardar.
- **Dónde se guardan**: carpeta `public/images/`. Desde el contenido se referencian como `/images/nombre-archivo.jpg`.

---

## 5. Campos por colección

### Cursos

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Título | ✅ | Texto | Nombre del curso tal como aparece en el catálogo |
| Categoría | ✅ | Select | "Curso" o "Certificación" |
| Modalidad | ✅ | Select | Virtual, Presencial o Híbrido |
| Imagen | No | Imagen | Foto o banner del curso (opcional si hay link a Canva) |
| Fecha de inicio | ✅ | Fecha | Cuándo empieza el curso (formato: DD MMM YYYY) |
| Precio / Inversión | ✅ | Texto | Ej: "950 Bs. (750 Bs. lanzamiento hasta 22 de mayo)" |
| Fecha límite inscripción | No | Datetime (Calendario) | Selector de fecha. Solo si hay precio de lanzamiento con fecha de corte |
| Link a Canva | No | URL | URL del diseño en Canva con toda la info del curso |
| Descripción breve | No | Texto | 1-2 líneas para la vista previa en el catálogo |
| Ponentes / Instructores | No | Lista | Nombre y biografía de cada instructor |
| Contenido completo | No | Markdown | Cuerpo del curso (opcional si el Canva cubre todo) |
| Destacado | No | Switch | Activado = el curso se muestra en la sección de "Cursos destacados" al inicio y se excluye de las listas cronológicas |
| Borrador | No | Switch | Activado = no aparece en el sitio |

### Artículos (Novedades)

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Título | ✅ | Texto | Título del artículo |
| Categoría | ✅ | Select | Noticias, Análisis, Eventos o Capacitación |
| Extracto | ✅ | Texto | Resumen de 1-2 líneas que aparece en la lista de novedades |
| Fecha | ✅ | Fecha | Fecha de publicación (formato: DD MMM YYYY) |
| Imagen | No | Imagen | Imagen principal del artículo |
| Destacado en portada | No | Switch | Activado = aparece destacado al inicio de la página Novedades (se excluye de la grilla general) y en la sección del Home |
| Contenido completo | ✅ | Markdown | Cuerpo del artículo |
| Borrador | No | Switch | Activado = no aparece en el sitio |

### Empresas Afiliadas

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Nombre de la Empresa | ✅ | Texto | Razón social tal como aparece en el directorio |
| Grupo Industrial | ✅ | Select | Upstream, Servicios en pozo, Servicios en superficie, Downstream, Servicios auxiliares, o Adherentes |
| Sitio Web | No | URL | Web de la empresa (ej: `https://empresa.com`) |
| Correo de Contacto | No | Email | Correo público de contacto |
| Logo | No | Imagen | Logo de la empresa (PNG con fondo transparente, ideal) |
| Destacada en portada | No | Switch | Activado = aparece con tarjeta destacada en el home |
| Orden | No | Número | Menor número = aparece primero. Si hay empate, orden alfabético |
| Borrador | No | Switch | Activado = no aparece en el sitio |

### Testimonios

Aparecen en la portada, en la sección de testimonios que rota automáticamente. La colección se llama **Testimonios de la Portada**.

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Nombre de la persona | ✅ | Texto | Nombre tal como se muestra en la tarjeta |
| Cargo | ✅ | Texto | Cargo en la empresa, por ejemplo Gerente General |
| Empresa | ✅ | Texto | Empresa de la persona |
| Testimonio completo | ✅ | Texto | Texto de dos a cuatro líneas que acompaña a la frase destacada |
| Frase destacada | ✅ | Texto | Frase corta que resalta en negrita dentro de la tarjeta |
| Foto | No | Imagen | Foto de la persona. Si no hay, la tarjeta se muestra sin imagen |
| Borrador | No | Switch | Activado = no aparece en el sitio |

### Directorio

Aparece en la página Quiénes somos, en la sección Directorio. Todo se edita desde una sola entrada: los grupos y, dentro de cada grupo, sus miembros.

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Grupo | ✅ | Texto | Nombre del grupo, por ejemplo Upstream o Servicios Auxiliares |
| Miembros | ✅ | Lista | Lista de cargos de ese grupo |
| Cargo | ✅ | Texto | Cargo en el Directorio, por ejemplo Presidente o Director Titular |
| Nombre | ✅ | Texto | Nombre completo de la persona |
| Empresa | ✅ | Texto | Empresa que representa en el Directorio |

### Banner publicitario

Se muestra al final de cada artículo.

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Banner activo | No | Switch | Desactivado = el banner no se muestra |
| Imagen del banner | ✅ | Imagen | 1600 x 200 píxeles, máximo 150 KB |
| Enlace del banner | No | Texto | Dirección web a la que lleva el banner |
| Texto alternativo | No | Texto | Descripción para lectores de pantalla |

Sin imagen no se muestra nada.

### Comportamiento Automático de las Páginas (Web)

Para facilitar la administración, el sitio web aplica reglas automáticas al compilarse (Astro SSG):

#### Página de Capacitación (Cursos)
- **Cursos pasados:** Se ocultan automáticamente si la fecha de inicio del curso es anterior a la fecha actual del día en que se compila el sitio.
- **Cursos destacados:** Si un curso tiene activa la casilla **Destacado**, aparecerá en la sección `Cursos destacados` al inicio del catálogo de cursos (en una rejilla estándar) y será excluido de las listas cronológicas para evitar duplicados. Si no hay cursos destacados, la sección no se muestra.
- **Este mes:** Lista cronológica (ascendente, del más cercano al más lejano) de los cursos activos que inician en el mes corriente. Si no hay cursos este mes, la sección se oculta automáticamente.
- **Próximas capacitaciones:** Lista cronológica (ascendente) de los cursos activos que inician en meses futuros. Si no hay próximos cursos, la sección se oculta automáticamente.

#### Página de Novedades (Noticias y Publicaciones)
- **Artículo Destacado:** El artículo más reciente marcado como **Destacado en portada** aparecerá como un banner destacado de gran formato en la parte superior de la página de Novedades (y también en el carrusel de destacados de la página de inicio). Se excluye de la grilla de noticias general para evitar duplicados.

---

## 6. Markdown rápido

| Elemento | Sintaxis | Ejemplo |
|----------|----------|---------|
| **Negrita** | `**texto**` | `**CBHE**` → **CBHE** |
| *Cursiva* | `*texto*` | `*Importante*` → *Importante* |
| Link | `[texto](url)` | `[CBHE](https://cbhe.org.bo)` |
| Imagen | `![](/images/archivo.jpg)` | `![](/images/curso-h2s.jpg)` |
| Encabezado | `## Título` | `## Objetivos del curso` |
| Sub-encabezado | `### Subtítulo` | `### Dirigido a` |
| Lista con viñetas | `- item` | `- Módulo 1` |
| Lista numerada | `1. item` | `1. Introducción` |
| Cita | `> texto` | `> "La seguridad es primero"` |
| Separador | `---` | Línea horizontal entre secciones |

---

## 7. Qué no se puede cambiar sin soporte

Estas partes del sitio no se editan desde el panel. Están escritas directamente en el código del proyecto y cualquier cambio requiere la intervención del soporte técnico:

- **Portada**: la estructura general del inicio (banner, secciones, orden de bloques, textos de presentación).
- **Quiénes somos**: la historia institucional, pilares y valores. El Directorio se edita desde el panel (ver sección 5).
- **Afiliación**: requisitos, proceso de aprobación, beneficios y grupos industriales.
- **RSE**: contenidos de responsabilidad social empresarial.
- **Contacto**: datos de oficina, formulario y textos de la página.
- **Menú de navegación**: las páginas que aparecen en el menú superior y en el pie de página.
- **Diseño general**: colores, tipografías, estilos visuales.

Para cualquiera de estos cambios, abra un cambio con quien administra la cuenta GitHub de la CBHE y describa lo que necesita. El cambio se realiza en el código y se publica con el mismo proceso automático (commit → build → deploy).

---

## 8. Copia de seguridad: cómo funciona Git

Cada vez que usted publica un cambio, el sistema toma una fotografía completa y numerada del sitio y la guarda en GitHub. Esas fotografías se guardan siempre, no se pueden perder y no se pueden alterar. GitHub actúa además como copia remota: un respaldo fuera de las computadoras de la oficina, en servidores de la empresa más usada del mundo para este fin. Es el estándar de la industria. En resumen, cada publicación deja una copia de seguridad del sitio que permite volver a una versión anterior.

Piense en el historial como un álbum numerado. La fotografía 1 es la primera versión del sitio, la fotografía 2 la siguiente, y así sucesivamente. Cada publicación suma una fotografía nueva. Ninguna se borra.

La consecuencia práctica para usted es simple: **si un cambio sale mal, se restaura la versión anterior**. No se pierde nada que estuviera publicado antes. Si publica un curso con un error o un artículo incompleto, se vuelve a la versión buena y el sitio queda como estaba.

Para restaurar una versión anterior:

1. Entre a `github.com`, abra el repositorio del sitio (`cbhe-web`) y abra el archivo que tiene el error.
2. Haga clic en **History** (historial).
3. Elija la versión correcta de la lista y ábrala.
4. Use el botón de revertir o reemplazar para volver el archivo a esa versión y confirme el cambio (commit).
5. El sitio se reconstruye solo con el proceso automático. Espere unos minutos y verifique en `https://vincentiwadsworth.github.io/cbhe-web/`.

---

## 9. Flujo de trabajo recomendado

1. **Redacte y revise antes de publicar.** Escriba el contenido, guárdelo con Save y revíselo con calma. Pida una segunda lectura a un colega cuando sea un texto importante.
2. **Verifique datos y fechas.** Un curso mal fechado o un precio equivocado generan consultas que se evitan con una revisión de dos minutos.
3. **Publique con Save and Publish** cuando el contenido esté listo.
4. **Espere uno o dos minutos** y revise el resultado en el sitio real, no en el panel. Confirme que el curso aparece en el catálogo, que el artículo se ve completo y que las imágenes cargan.
5. **Si algo salió mal**, no publique otra corrección apurada. Avise al soporte técnico: restaura la versión anterior o corrige el error en el código.

---

## 10. Problemas comunes

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| No puedo entrar al CMS | Token de GitHub expirado o incorrecto | Genere otro token con el procedimiento de la sección 1 (scope `repo`) |
| El sitio no se actualiza después de publicar | Run de deploy fallido o atascado en GitHub | Revise la pestaña **Actions** del repositorio en GitHub. Si el último run de **Deploy to GitHub Pages** está en rojo, el problema es un contenido inválido: no siga guardando cambios y reporte el error a soporte. Si está en amarillo o atascado hace varios minutos, relance el deploy: workflow **Deploy to GitHub Pages** → botón **Run workflow** |
| "Error al guardar" en Sveltia | Imagen demasiado grande (>2 MB) | Redimensione la imagen antes de subirla |
| La imagen no se ve en el sitio | La referencia en Markdown tiene una ruta incorrecta | Use siempre `/images/nombre-archivo.jpg` (con barra inicial) |
| Guardé un artículo pero no aparece | El switch **Borrador** (`draft`) está activado | Desactive el switch y vuelva a publicar |
| El curso no aparece en el catálogo | Filtro de borrador activo o `draft: true` | Verifique que `draft` esté en `false` y vuelva a publicar |
| No encuentro la colección que busco | Solo se muestran colecciones configuradas en el CMS | Cursos, Artículos, Empresas, Testimonios y Directorio están en Sveltia |
| El formulario de contacto no funciona | `WEB3FORMS_KEY` mal configurada | Requiere ajustar una variable del build: quien administra el repositorio la configura en **Settings → Secrets and variables → Actions** |

---

## 11. Mantenimiento: la base de datos de certificados

El verificador de certificados usa una base de datos gratuita de Supabase. Si pasan 7 días sin actividad, Supabase la pausa y los QR dejan de verificar. Un ping automático diario la mantiene activa; no requiere ningún cuidado de su parte.

Alertas del sistema y qué hacer ante cada una:

| Alerta | Dónde aparece | Qué hacer |
|---|---|---|
| Correo de Supabase con la palabra **pause** | `cbhe@cbhe.org.bo` (propietaria de la cuenta) | Entre a supabase.com con la cuenta de la CBHE y pulse **Restore project** |
| Issue **"La base de datos CBHE no responde"** | Repositorio de GitHub | Igual que el caso anterior; cierre el issue al restaurar |
| Issue **"Fallo de deploy: la web no se está actualizando"** | Repositorio de GitHub | Revise los últimos cambios guardados (sección 10); cierre el issue cuando el sitio vuelva a publicar |

La cuenta de Supabase pertenece a la CBHE: `cbhe@cbhe.org.bo` es propietaria, y `tania@cbhe.org.bo` y `alejandra@cbhe.org.bo` son administradoras. Restaurar una pausa no borra datos.

---

## 12. Glosario

| Término | Significado |
|---------|-------------|
| **CBHE** | Cámara Boliviana de Hidrocarburos y Energía |
| **Sveltia** | El CMS (Content Management System), el panel donde se edita el contenido del sitio |
| **Markdown** | Lenguaje simple para escribir texto con formato (negritas, títulos, links) sin necesidad de HTML |
| **Colección** | Grupo de contenido del mismo tipo: Cursos, Artículos, Empresas, Testimonios o Directorio |
| **Save / Guardar** | Guarda el cambio como borrador en GitHub, no se publica en el sitio |
| **Save & Publish / Publicar** | Guarda y dispara el deploy automático, el cambio aparece en el sitio web |
| **Borrador** | Interruptor que oculta un elemento del sitio aunque se publique |
| **Versión** | Fotografía completa del sitio en un momento dado, guardada con su número |
| **Deploy** | Proceso automático que construye el sitio y lo sube a internet |
| **GitHub** | Plataforma donde vive el código del sitio. Sveltia guarda los cambios como _commits_ en GitHub |
| **Token** | Contraseña de acceso personal a GitHub. Cada editor tiene el suyo |
| **RSE** | Responsabilidad Social Empresarial |
| **Sello CBHE** | Certificación que la CBHE otorga a empresas socialmente responsables |
| **Upstream / Downstream** | Segmentos de la industria: exploración/producción vs. transporte/distribución |
| **`[skip ci]`** | Etiqueta en un commit que le dice a GitHub "no hagas deploy". Save la incluye; Save & Publish no |
| **DNS** | Sistema que traduce nombres de dominio (cbhe.org.bo) a direcciones de internet. Como la guía telefónica de la web: sin DNS, un dominio no lleva a ningún lado. Se configura en nic.bo |

---

## 13. Contacto

| Para qué | Quién | Cómo |
|----------|-------|------|
| Problemas del CMS o del sitio (no entra al CMS, deploy trabado, error al guardar) | Quien administra la cuenta GitHub de la CBHE | Correo con captura de pantalla del error |
| Dudas de contenido (campos de una colección, cómo publicar) | Esta guía | Secciones 3 a 6 |
| Quiero emitir un certificado (Sello o Capacitación) | [Guía de Certificados](./GUIA-CERTIFICADOS.md) | Guía paso a paso |

---

## Documentos relacionados

- [README](./README.md): panorama general del proyecto (no técnico)
- [Documentación Técnica](./DOCUMENTACION-TECNICA.md): para developers que necesiten entender el stack técnico
- [Guía de Certificados](./GUIA-CERTIFICADOS.md): para emitir Sellos CBHE y Certificados de Capacitación
- [Pendientes de Despliegue](./PENDIENTES-DESPLIEGUE.md): checklist de handoff para puesta en producción
