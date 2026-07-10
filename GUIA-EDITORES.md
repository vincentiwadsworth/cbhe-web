# Guía de Editores — CBHE

> **Para**: Responsable de Comunicación, Responsable de Capacitación, Responsable de Gestión  
> **Última revisión**: 9 de julio de 2026

## Resumen rápido

- Cómo entrar al CMS, escribir contenido y publicarlo en el sitio web de la CBHE.
- Diferencia entre **Guardar** (borrador privado) y **Publicar** (visible en `cbhe.org.bo`).
- Cómo subir imágenes, qué formatos usar y cómo resolver problemas comunes.

---

## 1. Acceso al CMS

- **URL**: `https://cbhe.org.bo/admin/`
- **Iniciar sesión**: botón _Login with GitHub_ → autorizar con su cuenta de GitHub.
- **Primera vez**: Nicolás crea la cuenta de GitHub y da un **token de acceso personal**. Guárdelo en un lugar seguro (es su contraseña del CMS).
- **¿No entra?**: revise que el token no haya expirado. Si expiró, pedirle uno nuevo a Nicolás.
- El CMS se llama **Sveltia** — es el panel donde se escribe, edita y publica todo el contenido del sitio.

---

## 2. Cómo funciona

```mermaid
flowchart TD
    Start(🏠 Acceder a Sveltia CMS) --> Login(🔑 Iniciar sesión con GitHub)
    Login --> SelectCollection(📂 Seleccionar colección)
    SelectCollection --> CreateNew(➕ Crear nuevo contenido)
    CreateNew --> Write(✏️ Escribir contenido en Markdown)
    Write --> Decision{🤔 ¿Guardar o publicar?}
    Decision -->|💾 Save| Draft(📝 Borrador: visible solo en CMS)
    Decision -->|🚀 Save &amp; Publish| PublishCommit(📤 Commit sin [skip ci])
    PublishCommit --> Build(⚙️ GitHub Actions build)
    Build --> Deploy(🌐 Deploy a cbhe.org.bo)
    Deploy --> Live(✅ Visible en el sitio)
    Draft --> DraftNote(🔄 Editable, no aparece en el sitio)

    classDef primary fill:#90EE90,stroke:#333,stroke-width:2px,color:darkgreen
    classDef secondary fill:#87CEEB,stroke:#333,stroke-width:2px,color:darkblue
    classDef decision fill:#FFD700,stroke:#333,stroke-width:2px,color:black
    classDef terminal fill:#F5F5F5,stroke:#333,stroke-width:2px,color:black

    class Start,Deploy primary
    class Login,SelectCollection,CreateNew,Write,PublishCommit,Build secondary
    class Decision decision
    class Draft,DraftNote,Live terminal
```

---

## 3. Publicar contenido

```mermaid
sequenceDiagram
    participant Editor as ✏️ Editor
    participant Sveltia as 🖥️ Sveltia CMS
    participant GitHub as 📦 GitHub
    participant Actions as ⚙️ GitHub Actions
    participant Pages as 🌐 GitHub Pages
    participant DNS as 🔗 cbhe.org.bo

    Editor->>Sveltia: Save &amp; Publish
    Sveltia->>GitHub: git commit (sin [skip ci])
    GitHub->>Actions: Dispara workflow deploy.yml
    Actions->>Actions: npm ci + npx astro build
    Actions->>Pages: Sube archivos a gh-pages
    Pages->>DNS: Sitio actualizado

    Note over Editor,DNS: ⏱️ ~2-3 minutos en total
```

- **Save** = commit con `[skip ci]` → el cambio queda en el CMS pero **no se publica**. Ideal para borradores.
- **Save & Publish** = commit sin `[skip ci]` → dispara el build automático y en ~2-3 minutos el contenido está **visible en `cbhe.org.bo`**.

---

## 4. Trabajar con imágenes

```mermaid
flowchart TD
    Start(📷 Seleccionar imagen) --> CheckFormat{📐 ¿Formato correcto?}
    CheckFormat -->|✅ Sí| CheckSize{📏 ¿Tamaño adecuado?}
    CheckFormat -->|❌ No| Convert(🔄 Convertir a JPG / PNG / WebP)
    Convert --> CheckSize
    CheckSize -->|✅ Sí| Upload(☁️ Subir desde Sveltia Media)
    CheckSize -->|❌ No| Resize(🔧 Redimensionar: máx 2 MB, 1920 px ancho)
    Resize --> Upload
    Upload --> Reference(🔗 Referenciar: ![](/images/archivo.jpg))
    Reference --> Done(✅ Listo)

    classDef primary fill:#90EE90,stroke:#333,stroke-width:2px,color:darkgreen
    classDef secondary fill:#87CEEB,stroke:#333,stroke-width:2px,color:darkblue
    classDef decision fill:#FFD700,stroke:#333,stroke-width:2px,color:black
    classDef error fill:#FFB6C1,stroke:#DC143C,stroke-width:2px,color:black
    classDef terminal fill:#F5F5F5,stroke:#333,stroke-width:2px,color:black

    class Start,Upload primary
    class Convert,Resize,Reference secondary
    class CheckFormat,CheckSize decision
    class Done terminal
```

- **Formatos**: JPG para fotos, PNG para logos (transparencia), WebP para mejor calidad con menor peso.
- **Tamaño máximo**: 2 MB por imagen, 1920 píxeles de ancho. Si la imagen es más grande, Sveltia puede fallar al guardar.
- **Dónde se guardan**: carpeta `public/images/`. Desde el contenido se referencian como `/images/nombre-archivo.jpg`.

---

## 5. Campos por colección

### Cursos

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Título | ✅ | Texto | Nombre del curso tal como aparece en el catálogo |
| Categoría | ✅ | Select | "Curso" o "Certificación" |
| Modalidad | ✅ | Select | Virtual, Presencial o Híbrido |
| Imagen | — | Imagen | Foto o banner del curso (opcional si hay link a Canva) |
| Fecha de inicio | ✅ | Fecha | Cuándo empieza el curso (formato: DD MMM YYYY) |
| Precio / Inversión | ✅ | Texto | Ej: "950 Bs. (750 Bs. lanzamiento hasta 22 de mayo)" |
| Fecha límite inscripción | — | Texto | Solo si hay precio de lanzamiento con fecha de corte |
| Link a Canva | — | URL | URL del diseño en Canva con toda la info del curso |
| Descripción breve | — | Texto | 1-2 líneas para la vista previa en el catálogo |
| Ponentes / Instructores | — | Lista | Nombre y biografía de cada instructor |
| Contenido completo | — | Markdown | Cuerpo del curso (opcional si el Canva cubre todo) |
| Destacado | — | Switch | Activado = el curso se muestra en la sección de "Cursos destacados" al inicio y se excluye de las listas cronológicas |
| Borrador | — | Switch | Activado = no aparece en el sitio |

### Artículos (Novedades)

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Título | ✅ | Texto | Título del artículo |
| Categoría | ✅ | Select | Noticias, Análisis, Eventos o Capacitación |
| Extracto | ✅ | Texto | Resumen de 1-2 líneas que aparece en la lista de novedades |
| Fecha | ✅ | Fecha | Fecha de publicación (formato: DD MMM YYYY) |
| Imagen | — | Imagen | Imagen principal del artículo |
| Destacado en portada | — | Switch | Activado = aparece destacado al inicio de la página Novedades (se excluye de la grilla general) y en la sección del Home |
| Contenido completo | ✅ | Markdown | Cuerpo del artículo |
| Borrador | — | Switch | Activado = no aparece en el sitio |

### Empresas Afiliadas

| Campo | Obligatorio | Tipo | Qué significa |
|-------|:-----------:|------|---------------|
| Nombre de la Empresa | ✅ | Texto | Razón social tal como aparece en el directorio |
| Grupo Industrial | ✅ | Select | Upstream, Servicios en pozo, Servicios en superficie, Downstream, Servicios auxiliares, o Adherentes |
| Sitio Web | — | URL | Web de la empresa (ej: `https://empresa.com`) |
| Correo de Contacto | — | Email | Correo público de contacto |
| Logo | — | Imagen | Logo de la empresa (PNG con fondo transparente, ideal) |
| Destacada en portada | — | Switch | Activado = aparece con tarjeta destacada en el home |
| Orden | — | Número | Menor número = aparece primero. Si hay empate, orden alfabético |
| Borrador | — | Switch | Activado = no aparece en el sitio |

> **Nota**: Los **Testimonios** no se editan desde Sveltia CMS — se gestionan directamente en los archivos del proyecto. Si necesita agregar o modificar un testimonio, coordínelo con Nicolás.

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

## 7. Problemas comunes

| Problema | Causa probable | Solución |
|----------|---------------|----------|
| No puedo entrar al CMS | Token de GitHub expirado o incorrecto | Pedirle un token nuevo a Nicolás (scope `repo`) |
| El sitio no se actualiza después de publicar | El job de deploy está trabado en GitHub | Avisarle a Nicolás — puede disparar el deploy manualmente |
| "Error al guardar" en Sveltia | Imagen demasiado grande (>2 MB) | Redimensione la imagen antes de subirla |
| La imagen no se ve en el sitio | La referencia en Markdown tiene una ruta incorrecta | Use siempre `/images/nombre-archivo.jpg` (con barra inicial) |
| Guardé un artículo pero no aparece | El switch **Borrador** (`draft`) está activado | Desactive el switch y vuelva a publicar |
| El curso no aparece en el catálogo | Filtro de borrador activo o `draft: true` | Verifique que `draft` esté en `false` y vuelva a publicar |
| No encuentro la colección que busco | Solo se muestran colecciones configuradas en el CMS | Cursos, Artículos y Empresas están en Sveltia. Testimonios se editan a mano |
| El formulario de contacto no funciona | `WEB3FORMS_KEY` mal configurada | Avisarle a Nicolás — es una variable de entorno del build |

---

## 8. Glosario

| Término | Significado |
|---------|-------------|
| **CBHE** | Cámara Boliviana de Hidrocarburos y Energía |
| **Sveltia** | El CMS (Content Management System) — panel donde se edita el contenido del sitio |
| **Markdown** | Lenguaje simple para escribir texto con formato (negritas, títulos, links) sin necesidad de HTML |
| **Colección** | Grupo de contenido del mismo tipo: Cursos, Artículos, Empresas |
| **Save / Guardar** | Guarda el cambio como borrador en GitHub — no se publica en el sitio |
| **Save & Publish / Publicar** | Guarda y dispara el deploy automático — el cambio aparece en `cbhe.org.bo` |
| **Deploy** | Proceso automático que construye el sitio y lo sube a internet |
| **GitHub** | Plataforma donde vive el código del sitio. Sveltia guarda los cambios como _commits_ en GitHub |
| **Token** | Contraseña de acceso personal a GitHub. Cada editor tiene el suyo |
| **RSE** | Responsabilidad Social Empresarial |
| **Sello CBHE** | Certificación que la CBHE otorga a empresas socialmente responsables |
| **Upstream / Downstream** | Segmentos de la industria: exploración/producción vs. transporte/distribución |
| **`[skip ci]`** | Etiqueta en un commit que le dice a GitHub "no hagas deploy". Save la incluye; Save & Publish no |
| **DNS** | Sistema que traduce nombres de dominio (cbhe.org.bo) a direcciones de internet. Como la guía telefónica de la web: sin DNS, un dominio no lleva a ningún lado. Se configura en nic.bo |

---

## 9. Contacto

| Para qué | Quién | Cómo |
|----------|-------|------|
| No puedo entrar al CMS (token expirado) | Nicolás | WhatsApp o correo |
| El sitio no se actualiza (deploy trabado) | Nicolás | WhatsApp o correo |
| Quiero agregar un Testimonio nuevo | Nicolás | Coordinar por correo |
| Tengo dudas sobre los campos de una colección | Nicolás | WhatsApp — es rápida |
| Quiero emitir un certificado (Sello o Capacitación) | Ver [Guía de Certificados](./GUIA-CERTIFICADOS.md) | Guía paso a paso |
| Error técnico que no sé resolver | Nicolás | Correo con captura de pantalla del error |

---

## Documentos relacionados

- [README](./README.md) — panorama general del proyecto (no técnico)
- [Documentación Técnica](./DOCUMENTACION-TECNICA.md) — para developers que necesiten entender el stack técnico
- [Guía de Certificados](./GUIA-CERTIFICADOS.md) — para emitir Sellos CBHE y Certificados de Capacitación
- [Pendientes de Despliegue](./PENDIENTES-DESPLIEGUE.md) — checklist de handoff para puesta en producción
