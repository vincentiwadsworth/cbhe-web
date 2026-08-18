# Informe de entrega del sitio web CBHE (agosto 2026)

## 1. Cambios de esta etapa

| # | Cambio | Dónde |
|---|--------|-------|
| 1 | Requisitos de afiliación: nacionales (8 documentos), extranjeras (7 documentos + apostilla), proceso en 3 pasos, 10 beneficios del asociado. Montos no publicados: se informan por contacto | Afiliación |
| 2 | Directorio completo: 23 cargos por grupo industrial (reemplazó listado parcial desactualizado) | Quiénes Somos |
| 3 | Link de donación de Fundesoc actualizado | RSE |
| 4 | Cinta de alianzas estratégicas movida entre Novedades y Capacitación | Inicio |
| 5 | Estatuto y Código de Ética en página privada, no indexada. Acceso solo por link | Link directo |
| 6 | Guía de edición para el equipo + explicación de copias de seguridad (Git) | Documentación entregada |
| 7 | Testimonios y Directorio editables desde el CMS, sin programar | Sveltia |
| 8 | Blindaje del CMS: corrección de errores latentes, versión fijada, pruebas de extremo a extremo | Sveltia |

## 2. Páginas del sitio (30)

### Públicas

La URL base es https://vincentiwadsworth.github.io/cbhe-web/. Los enlaces son relativos a ella.

| Página | URL | Contenido |
|--------|-----|-----------|
| [Inicio](https://vincentiwadsworth.github.io/cbhe-web/) | / | Datos del sector, grupos, testimonios, formulario de afiliación, novedades, alianzas, cursos |
| [Quiénes Somos](https://vincentiwadsworth.github.io/cbhe-web/quienes-somos/) | /quienes-somos/ | Historia, misión, visión, Directorio (23 cargos), filosofía ACTUAR |
| [Empresas Afiliadas](https://vincentiwadsworth.github.io/cbhe-web/afiliadas/) | /afiliadas/ | Directorio de empresas con buscador, por grupo |
| [Afiliación](https://vincentiwadsworth.github.io/cbhe-web/afiliacion/) | /afiliacion/ | Requisitos, proceso, beneficios |
| [Capacitación](https://vincentiwadsworth.github.io/cbhe-web/capacitacion/) | /capacitacion/ | Catálogo y cursos individuales |
| [Novedades](https://vincentiwadsworth.github.io/cbhe-web/novedades/) | /novedades/ | Noticias y artículos |
| [RSE / Fundesoc](https://vincentiwadsworth.github.io/cbhe-web/rse/) | /rse/ | Responsabilidad social, link de donación |
| [Contacto](https://vincentiwadsworth.github.io/cbhe-web/contacto/) | /contacto/ | Formulario, mapa, datos |
| [Certificados](https://vincentiwadsworth.github.io/cbhe-web/certificados/) | /certificados/ | Verificación pública por código |
| [Privacidad](https://vincentiwadsworth.github.io/cbhe-web/privacidad/) | /privacidad/ | Política de privacidad |
| [Términos](https://vincentiwadsworth.github.io/cbhe-web/terminos/) | /terminos/ | Términos y condiciones |

### Privada

| Página | URL | Acceso |
|--------|-----|--------|
| [Documentos internos](https://vincentiwadsworth.github.io/cbhe-web/documentos-internos/) | /documentos-internos/ | Solo por link compartible. Estatuto y Código de Ética |

### Utilitarias

/gracias/ y 404.

## 3. Sveltia CMS (/admin/)

| Colección | Qué controla |
|-----------|--------------|
| Cursos | Catálogo de capacitación y sus detalles |
| Artículos | Novedades y noticias del sitio |
| Empresas Afiliadas | Directorio de empresas por grupo |
| Testimonios | Carrusel de testimonios de la portada |
| Directorio | Mesa directiva que se ve en Quiénes Somos |

Save guarda los cambios sin publicar. Save and Publish publica en 1 a 2 minutos.

Backups automáticos: cada publicación queda versionada en GitHub y es reversible.

## 4. Documentación entregada

| Documento | Uso |
|-----------|-----|
| GUIA-EDITORES | Pasos para editar contenido y administrar el sitio |
| GUIA-CERTIFICADOS | Emisión y verificación de certificados con QR |
| GUIA-DOMINIO | Migración a cbhe.org.bo paso a paso |
| DOCUMENTACION-TECNICA | Arquitectura, stack y mantenimiento del proyecto |

## 5. Cambio de dominio

El paso a cbhe.org.bo está documentado paso a paso en la guía GUIA-DOMINIO (incluida en este paquete). La guía mantiene el correo de Microsoft 365 funcionando durante todo el proceso e incluye un plan de reversión. Se ejecuta después de esta reunión.

## 6. Accesos que quedan en poder de la CBHE (tras la transferencia)

- GitHub (repositorio y CMS)
- Cloudflare (dominio)
- Supabase (certificados)
- Microsoft 365 (correo)
