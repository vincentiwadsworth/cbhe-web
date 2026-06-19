# CBHE Web — Guía para Editores

**Sitio web de la Cámara Boliviana de Hidrocarburos y Energía. Manual para gestionar el contenido sin conocimientos técnicos.**

Panel de edición: [https://vincentiwadsworth.github.io/cbhe-web/admin/](https://vincentiwadsworth.github.io/cbhe-web/admin/)

---

## Inicio rápido

Necesita una cuenta de GitHub. El área de tecnología se la proporcionará.

1. Abra el panel de edición (enlace arriba)
2. Inicie sesión con su cuenta de GitHub
3. En la barra lateral izquierda, seleccione su colección
4. Haga clic en un contenido para editar, o en **Nuevo** para crear uno
5. Al terminar, use **Save** para publicar en el sitio

El sitio tiene tres secciones editables, una por área:

| Área | Sección del sitio | Colección en el panel |
|------|-------------------|-----------------------|
| Comunicación | Novedades | Artículos |
| Capacitación | Cursos y certificaciones | Cursos |
| Gestión | Empresas afiliadas | Empresas Afiliadas |

---

## Guardar vs Publicar

El botón de guardar tiene un menú desplegable con dos opciones:

| Opción | Qué hace |
|--------|----------|
| **Save** (botón principal) | Guarda **y publica** en el sitio en vivo (tarda 1-2 minutos). |
| **Save without Publishing** (menú desplegable) | Guarda como borrador. El sitio **no cambia**. |

> Use **Save without Publishing** cuando prepare algo que aún no desea mostrar en el sitio. Cuando esté listo, abra el contenido y use **Save**.

---

## Imágenes y borradores

**Imágenes:** arrastre la imagen al campo o selecciónela de su computadora. Formato recomendado: JPG o WebP, menor a 500 KB. Para logos: PNG con fondo transparente.

**Borrador:** cada contenido tiene una casilla **Borrador**. Si la marca, el contenido existe en el panel pero no se muestra en el sitio público. Útil cuando prepare algo que aún no desea mostrar.

---

## Campos por colección

### Artículos (Comunicación)

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Título | Sí | Título del artículo |
| Categoría | Sí | Noticias, Análisis, Eventos o Capacitación |
| Extracto | Sí | Resumen breve (1-2 líneas) para la vista previa |
| Fecha | Sí | Fecha del artículo (usar el calendario) |
| Imagen | No | Imagen destacada |
| Destacado en portada | No | Marcar para mostrar en la página principal |
| Contenido completo | Sí | Texto del artículo en Markdown (ver abajo) |
| Borrador | No | Ocultar del sitio |

### Cursos (Capacitación)

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Título | Sí | Nombre del curso o certificación |
| Categoría | Sí | Curso o Certificación |
| Modalidad | Sí | Virtual, Presencial o Híbrido |
| Imagen | No | Imagen del curso (opcional si hay link de Canva) |
| Fecha de inicio | Sí | Determina el orden en el catálogo (usar el calendario) |
| Precio / Inversión | Sí | Ej: "950 Bs. (750 Bs. lanzamiento hasta el 22 de mayo)" |
| Fecha límite inscripción | No | Solo si hay precio de lanzamiento |
| Link a Canva | No | URL del diseño con la info completa del curso |
| Descripción breve | No | 1-2 líneas para la tarjeta del catálogo |
| Ponentes / Instructores | No | Nombre y biografía de cada uno |
| Contenido completo | No | Texto del curso (opcional si hay link de Canva) |
| Borrador | No | Ocultar del sitio |

### Empresas Afiliadas (Gestión)

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Nombre de la Empresa | Sí | Nombre completo |
| Grupo Industrial | Sí | Uno de seis grupos (ver lista en el formulario) |
| Sitio Web | No | URL del sitio de la empresa |
| Correo de Contacto | No | Email |
| Logo | No | Logo de la empresa |
| Destacada en portada | No | Marcar para mostrar en la página principal |
| Orden | No | Número menor = aparece primero. Empate = orden alfabético |
| Borrador | No | Ocultar del sitio |

**Grupos industriales:**

1. Exploración y explotación de hidrocarburos
2. Servicios y suministros especializados en pozo
3. Servicios y suministros especializados en superficie
4. Industria, transporte y distribución de hidrocarburos y energía
5. Servicios auxiliares
6. Adherentes

---

## Markdown — formato de texto

Los campos de contenido usan Markdown. Escriba estos símbolos para dar formato:

| Escriba | Resultado |
|---------|-----------|
| `**negrita**` | **negrita** |
| `*cursiva*` | *cursiva* |
| `## Subtítulo` | Encabezado de sección |
| `- item` | Lista con viñetas |
| `1. item` | Lista numerada |
| `[texto del enlace](https://url.com)` | Enlace |

---

## Emitir certificados digitales

Los certificados de capacitación se emiten desde GitHub. El sistema genera automáticamente el código único, el código QR y el PDF.

### Pasos

1. Ingrese a [https://github.com/vincentiwadsworth/cbhe-web](https://github.com/vincentiwadsworth/cbhe-web)
2. Vaya a la pestaña **Actions** (Acciones)
3. En el panel izquierdo, seleccione **Issue Certificate**
4. Haga clic en **Run workflow** (botón verde)
5. Complete el formulario:
   - **Nombre de la empresa**: nombre completo de la empresa certificada
   - **Tipo de certificación**: ej: "Inspección de Sistemas contra Incendios"
   - **Fecha de emisión**: formato `2026-06-19` (año-mes-día)
   - **Fecha de vencimiento**: opcional, mismo formato
6. Haga clic en **Run workflow** (verde) para confirmar
7. Espere 1-2 minutos a que termine
8. Haga clic en la ejecución completada (marca verde ✓)
9. Descargue el archivo **certificate** — contiene el PDF y el código QR

### Qué genera el sistema automáticamente

- **Código único**: formato `CBHE-xxxxxxxxxx` (ej: `CBHE-aB3kLm9xQz`)
- **PDF**: certificado en formato A4 horizontal con logo, datos y código QR
- **Código QR**: apunta a la página de verificación pública
- **Registro en la base de datos**: el certificado queda registrado para verificación

### Verificación pública

Quien reciba el certificado puede verificarlo de dos formas:

- Escaneando el código QR del PDF con su celular
- O visitando `https://cbhe.org.bo/certificados/` e ingresando el código

El sistema confirma si el certificado está **vigente**, **vencido** o **revocado**.

---

## Problemas comunes

| Problema | Solución |
|----------|----------|
| No puedo ingresar al panel | Su cuenta de GitHub necesita acceso al repositorio. Contacte al área de tecnología. |
| Guardé con Save without Publishing y el sitio no cambió | Es correcto: es un borrador. Use **Save** para publicar. |
| Guardé con Save and Publish y el sitio no cambia | El despliegue tarda 1-2 minutos. Si pasan 5 minutos sin cambios, contacte al área de tecnología. |
| La imagen no se ve | Verifique que sea JPG, PNG o WebP y pese menos de 500 KB. |
| El certificado no se generó | Verifique que las fechas estén en formato `2026-06-19` (año-mes-día). Si persiste, contacte al área de tecnología. |
| Quiero editar los testimonios de la página principal | Los testimonios no se editan desde el panel. Contacte al área de tecnología. |

---

## Glosario

| Término | Qué significa |
|---------|---------------|
| CMS | Panel donde edita el contenido del sitio. |
| GitHub | Plataforma donde está guardado el sitio. Su cuenta le da acceso. |
| Save | Guarda y publica en el sitio en vivo. |
| Save without Publishing | Guarda como borrador. El sitio no cambia. |
| Markdown | Formato de texto simple para negrita, listas y enlaces. |
| Workflow | Flujo automático en GitHub para emitir certificados. |
| Borrador | Contenido guardado pero oculto del sitio público. |

---

## Para desarrolladores

Stack: Astro 6, Tailwind 4, Sveltia CMS, Supabase (verificación de certificados), GitHub Pages.

```bash
npm ci
npm run dev      # http://localhost:4321
npm run build    # build de producción
npm run preview  # preview del build
```

Variables de entorno (`.env`): `WEB3FORMS_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `PUBLIC_VERIFICATION_URL`.

Estructura: `src/content/` (colecciones: `articulos`, `cursos`, `empresas`, `testimonios`), `src/pages/`, `public/admin/` (Sveltia), `scripts/issue-certificate.mjs`, `supabase/migrations/`.
