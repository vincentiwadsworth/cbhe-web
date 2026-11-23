# Guía de Editores (CBHE)

> **Para**: Responsable de Comunicación, Responsable de Capacitación, Responsable de Gestión · **Última revisión**: 23 de noviembre de 2026

---

## 1. Acceso al panel

- **URL**: `https://cbhe.org.bo/admin/`
- **Iniciar sesión**: botón _Login with GitHub_ → autorizar con su cuenta de GitHub.
- **Primera vez**: genere un **token de acceso personal** desde la cuenta de GitHub con la que va a editar:
  1. Entre a `github.com` e inicie sesión con esa cuenta.
  2. Abra **Settings** desde el menú de su perfil, en la esquina superior derecha.
  3. En el menú de la izquierda, vaya a **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
  4. Haga clic en **Generate new token (classic)**.
  5. Marque el scope **repo**.
  6. Haga clic en **Generate token** y copie el token. Solo se muestra una vez.
- **Guarde el token** en un lugar seguro. Es su contraseña del panel.

---

## 2. Publicación

- **Publish** guarda el cambio en GitHub y publica el sitio. El contenido aparece en `https://cbhe.org.bo/` cuando termina la publicación, alrededor de un minuto.
- **Save without Publishing** guarda el cambio sin publicarlo: el sitio sigue mostrando la última versión publicada y el cambio queda solo en el panel.

Cada elemento tiene además un interruptor llamado **Borrador**. Mientras esté activado, el elemento no aparece en el sitio y su dirección deja de estar publicada. El contenido no se borra.

- Para retirar del sitio algo que ya está publicado: active **Borrador** y guarde con **Publish**.
- Para volver a publicarlo: desactive **Borrador** y guarde con **Publish**.

---

## 3. Imágenes

- **Formatos**: JPG para fotos, PNG para logos con fondo transparente, WebP para fotos que deban pesar menos.
- **Tamaño**: hasta 500 KB y 1920 píxeles de ancho.
- **Dónde se guardan**: carpeta `public/images/`. Desde el contenido se referencian como `/images/nombre-archivo.jpg`.

### Pie de foto

El pie de foto va en el campo **Título** de la imagen. En el cuerpo del contenido la imagen se edita como un bloque con el encabezado «Imagen»: haga clic en el encabezado para desplegar sus campos.

| Campo | Qué es |
|-------|--------|
| Origen | El archivo de la imagen |
| Texto alternativo | Descripción de la imagen para lectores de pantalla y buscadores. No se ve en la página |
| Título | **El pie de foto**: el único de los cuatro campos que se muestra en el sitio, en letra chica debajo de la imagen |
| Enlace | Dirección a la que lleva la imagen al hacer clic |

El pie se muestra cuando el párrafo tiene una sola imagen. Si el párrafo tiene dos imágenes o más, ninguna lleva pie.

---

## 4. Campos por colección

### Cursos

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Título | Sí | Texto | Nombre del curso tal como aparece en el catálogo |
| Categoría | Sí | Select | "Curso" o "Certificación" |
| Modalidad | Sí | Select | Virtual, Presencial o Híbrido |
| Imagen | No | Imagen | Foto o banner del curso (opcional si hay link a Canva) |
| Fecha de inicio | Sí | Fecha | Cuándo empieza el curso. Se elige en el calendario |
| Precio / Inversión | Sí | Texto | Ej: "950 Bs. (750 Bs. lanzamiento hasta 22 de mayo)" |
| Fecha límite inscripción | No | Fecha y hora | Fecha de cierre del precio de lanzamiento |
| Link a Canva | No | Texto | Dirección del diseño en Canva con toda la información del curso |
| Descripción breve | No | Texto | Una o dos líneas para la vista previa en el catálogo |
| Ponentes / Instructores | No | Lista | Nombre y biografía de cada instructor |
| Contenido completo | No | Markdown | Cuerpo del curso (opcional si el Canva cubre todo) |
| Destacado | No | Switch | Activado = el curso aparece en «Cursos destacados», en la portada y en Capacitación, y sale de las listas por fecha |
| Borrador | No | Switch | Activado = no aparece en el sitio |

### Artículos (Novedades)

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Título | Sí | Texto | Título del artículo |
| Categoría | Sí | Select | Noticias, Análisis, Eventos o Capacitación |
| Extracto | Sí | Texto | Resumen de una o dos líneas que aparece en la lista de novedades |
| Fecha | Sí | Fecha | Fecha de publicación. Se elige en el calendario |
| Imagen | No | Imagen | Imagen principal del artículo |
| Destacado en portada | No | Switch | Activado = el artículo aparece como banner al inicio de la página Novedades |
| Contenido completo | Sí | Markdown | Cuerpo del artículo |
| Borrador | No | Switch | Activado = no aparece en el sitio |

### Empresas Afiliadas

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Nombre de la Empresa | Sí | Texto | Razón social tal como aparece en el directorio |
| Grupo Industrial | Sí | Select | Exploración y explotación, Servicios en pozo, Servicios en superficie, Industria y transporte, Servicios auxiliares o Adherentes |
| Sitio Web | No | Texto | Web de la empresa. Si falta `https://`, el sitio lo agrega al publicar |
| Correo de Contacto | No | Email | Correo público de contacto |
| Logo | No | Imagen | Logo de la empresa (PNG con fondo transparente, ideal) |
| Destacada en portada | No | Switch | Activado = la empresa aparece con tarjeta destacada en la página Afiliadas |
| Orden | No | Número | Menor número = aparece primero. Si hay empate, orden alfabético |
| Borrador | No | Switch | Activado = no aparece en el sitio |

### Testimonios

Aparecen en la portada, en la sección de testimonios que rota automáticamente.

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Nombre de la persona | Sí | Texto | Nombre tal como se muestra en la tarjeta |
| Cargo | Sí | Texto | Cargo en la empresa, por ejemplo Gerente General |
| Empresa | Sí | Texto | Empresa de la persona |
| Testimonio completo | Sí | Texto | Texto de dos a cuatro líneas que acompaña a la frase destacada |
| Frase destacada | Sí | Texto | Frase corta que resalta en negrita dentro de la tarjeta |
| Foto | No | Imagen | Foto de la persona. Si falta, la tarjeta se muestra sin imagen |
| Borrador | No | Switch | Activado = no aparece en el sitio |

### Directorio

Aparece en la página Quiénes somos, en la sección Directorio. Todo se edita desde una sola entrada: el Comité Ejecutivo y los grupos con sus miembros.

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Comité Ejecutivo | Sí | Lista | Cargo, nombre y empresa de cada miembro del Comité |
| Grupos | Sí | Lista | Grupos industriales del Directorio |
| Nombre del grupo | Sí | Texto | Por ejemplo Exploración y producción o Servicios auxiliares |
| Miembros | Sí | Lista | Miembros de ese grupo |
| Cargo | Sí | Texto | Cargo en el Directorio, por ejemplo Presidente o Director Titular |
| Nombre completo | Sí | Texto | Nombre de la persona |
| Empresa | Sí | Texto | Empresa que representa en el Directorio |

### Banner publicitario

Se muestra al final de cada artículo.

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Banner activo | No | Switch | Desactivado = el banner no se muestra |
| Imagen del banner | No | Imagen | 1600 x 200 píxeles, máximo 150 KB. Sin imagen el banner no se muestra |
| Enlace del banner | No | Texto | Dirección web a la que lleva el banner |
| Texto alternativo | No | Texto | Descripción para lectores de pantalla |

### Reglas automáticas

El sitio aplica estas reglas al publicar:

- **Cursos pasados:** un curso sale de «Próximas capacitaciones» cuando su fecha de inicio ya pasó, y su página sigue publicada. Para sacarlo del sitio, active **Borrador**.
- **Próximas capacitaciones:** lista los cursos activos que inician más adelante, del más cercano al más lejano.
- **Artículo destacado:** el artículo marcado como **Destacado en portada** aparece como banner de gran formato al inicio de Novedades. El resto se lista del más nuevo al más viejo.

---

## 5. Páginas institucionales

Para cambiar estas páginas, envíe el texto nuevo al soporte técnico del sitio. Se publica en uno a dos días hábiles.

| Página | Qué contiene |
|--------|--------------|
| Misión y visión (`https://cbhe.org.bo/quienes-somos/`) | Misión, visión e historia institucional |
| Datos de contacto (`https://cbhe.org.bo/contacto/`) | Dirección, teléfono, correo y formulario |
| Privacidad y Términos (`https://cbhe.org.bo/privacidad/` y `https://cbhe.org.bo/terminos/`) | Política de Privacidad y Aviso Legal |

El Directorio se edita desde el panel (sección 4).

Otras páginas que se cambian a pedido:

- **Portada**: estructura del inicio (banner, secciones, orden de bloques, textos de presentación).
- **Afiliación**: requisitos, proceso de aprobación, beneficios y grupos industriales.
- **RSE**: contenidos de responsabilidad social empresarial.
- **Menú de navegación**: páginas del menú superior y del pie de página.
- **Diseño general**: colores, tipografías, estilos visuales.

---

## 6. Markdown

| Elemento | Sintaxis | Ejemplo |
|----------|----------|---------|
| **Negrita** | `**texto**` | `**CBHE**` → **CBHE** |
| *Cursiva* | `*texto*` | `*Importante*` → *Importante* |
| Link | `[texto](url)` | `[CBHE](https://cbhe.org.bo)` |
| Imagen | `![](/images/archivo.jpg)` | `![](/images/curso-h2s.jpg)` |
| Imagen con pie de foto | `![](/images/archivo.jpg "Pie de foto")` | `![](/images/curso-h2s.jpg "Módulo 2 en planta")` |
| Encabezado | `## Título` | `## Objetivos del curso` |
| Sub-encabezado | `### Subtítulo` | `### Dirigido a` |
| Lista con viñetas | `- item` | `- Módulo 1` |
| Lista numerada | `1. item` | `1. Introducción` |
| Cita | `> texto` | `> "La seguridad es primero"` |
| Separador | `---` | Línea horizontal entre secciones |

---

## 7. Volver a una versión anterior

Cada publicación deja un commit en GitHub. Si un cambio sale mal, se copia el contenido de la versión anterior y el sitio vuelve a quedar como estaba.

1. Entre a `github.com`, abra el repositorio del sitio (`cbhe-web`) y abra el archivo que tiene el error.
2. Haga clic en **History**.
3. Elija de la lista la versión correcta y ábrala.
4. Copie el contenido de esa versión, vuelva atrás, pegue el contenido en el archivo con **Edit** y confirme el commit.
5. El sitio se reconstruye solo. El estado de la publicación está en la pestaña **Actions**.

---

## 8. Problemas frecuentes

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| No puedo entrar al panel | Token de GitHub expirado o incorrecto | Genere otro token con el procedimiento de la sección 1 (scope `repo`) |
| El sitio no se actualiza después de publicar | Publicación fallida o detenida en GitHub | Revise la pestaña **Actions**. Si el último run de **Deploy to GitHub Pages** está en rojo, hay un contenido inválido: no siga guardando y avise a soporte. Si quedó en amarillo, relance la publicación desde **Actions** → **Deploy to GitHub Pages** → **Run workflow** |
| «Error al guardar» en el panel | El cambio no se pudo guardar | Recargue la página y guarde de nuevo. Si el error sigue, avise a soporte con una captura del mensaje |
| La imagen no se ve en el sitio | La referencia en el texto tiene una ruta incorrecta | Use siempre `/images/nombre-archivo.jpg`, con barra inicial |
| Guardé un artículo pero no aparece | El interruptor **Borrador** está activado | Desactive el interruptor y vuelva a publicar |
| El curso no aparece en el catálogo | El interruptor **Borrador** está activado o la fecha de inicio ya pasó | Desactive **Borrador** y revise la fecha de inicio |

---

## 9. Certificados

La verificación de certificados usa una base de datos en Supabase. Un chequeo automático diario la mantiene activa; si falla, el sistema abre un issue en el repositorio.

| Alerta | Dónde aparece | Qué hacer |
|---|---|---|
| Correo de Supabase con la palabra **pause** | `cbhe@cbhe.org.bo` | Entre a supabase.com con la cuenta de la CBHE y pulse **Restore project** |
| Issue «La base de datos CBHE no responde» | Repositorio de GitHub | Restaure el proyecto y cierre el issue |
| Issue «Fallo de deploy: la web no se está actualizando» | Repositorio de GitHub | Revise los últimos cambios guardados (sección 8) y cierre el issue cuando el sitio vuelva a publicar |

Emitir y verificar certificados está en la [Guía de Certificados](https://github.com/vincentiwadsworth/cbhe-web/blob/main/GUIA-CERTIFICADOS.md).

---

## 10. Glosario

| Término | Significado |
|---------|-------------|
| **CBHE** | Cámara Boliviana de Hidrocarburos y Energía |
| **Sveltia** | El CMS (Content Management System), el panel donde se edita el contenido del sitio |
| **Markdown** | Lenguaje simple para escribir texto con formato (negritas, títulos, links) sin necesidad de HTML |
| **Colección** | Grupo de contenido del mismo tipo: Cursos, Artículos, Empresas Afiliadas, Testimonios, Directorio o Banner publicitario |
| **Publish** | Guarda el cambio en GitHub y publica el sitio |
| **Save without Publishing** | Guarda el cambio sin publicarlo, para seguir editando |
| **Borrador** | Interruptor que oculta un elemento del sitio aunque se publique |
| **Versión** | Estado del sitio en un momento dado, guardado como commit en GitHub |
| **Publicación** | Proceso automático que construye el sitio y lo sube a internet |
| **GitHub** | Plataforma donde vive el código del sitio. El panel guarda los cambios como _commits_ en GitHub |
| **Token** | Contraseña de acceso personal a GitHub |
| **RSE** | Responsabilidad Social Empresarial |

---

## 11. Contacto

| Para qué | Quién | Cómo |
|----------|-------|------|
| Problemas del panel o del sitio (no entra, la publicación se traba, error al guardar) | Quien administra la cuenta GitHub de la CBHE | Correo con captura de pantalla del error |
| Emitir un certificado (Sello o Capacitación) | [Guía de Certificados](https://github.com/vincentiwadsworth/cbhe-web/blob/main/GUIA-CERTIFICADOS.md) | Guía paso a paso |

---

## Documentos relacionados

- [README](https://github.com/vincentiwadsworth/cbhe-web/blob/main/README.md): panorama general del proyecto
- [Documentación Técnica](https://github.com/vincentiwadsworth/cbhe-web/blob/main/DOCUMENTACION-TECNICA.md): stack técnico para developers
- [Guía de Certificados](https://github.com/vincentiwadsworth/cbhe-web/blob/main/GUIA-CERTIFICADOS.md): emisión y verificación de certificados
