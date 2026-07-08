# Guía de Certificados — CBHE

> **Para**: Responsable de Gestión (Sello CBHE), Responsable de Capacitación
> **Última revisión**: 9 de julio de 2026

---

## Resumen rápido

- **Sello CBHE**: certificado para **empresas** que adquieren el sello de la CBHE. Código con prefijo `CBHE-S-XXXXX`.
- **Certificado de Capacitación**: certificado para **personas** que completaron un curso o certificación de la CBHE. Código con prefijo `CBHE-C-XXXXX`.

---

## 1. Sello CBHE vs Certificado de Capacitación

| Aspecto | Sello CBHE | Certificado de Capacitación |
|---|---|---|
| **¿Para quién?** | Empresas | Personas (cursantes) |
| **¿Quién lo emite?** | Responsable de Gestión | Responsable de Capacitación |
| **Tabla en el sistema** | `sello` | `capacitacion` |
| **Prefijo del código** | `CBHE-S-` | `CBHE-C-` |
| **Campos a completar** | `empresa_nombre`, `fecha_emision` | `cursante_nombre`, `nombre_capacitacion`, `fecha_emision` |
| **¿Quién puede verificar?** | Cualquier persona con el QR | Cualquier persona con el QR |

---

## 2. Cómo funciona el sistema

```mermaid
erDiagram
  capacitacion {
    uuid id PK
    text codigo UK
    text cursante_nombre "nombre del cursante"
    text nombre_capacitacion "nullable"
    date fecha_emision
    text qr_url "nullable, generado automático"
    timestamptz created_at
  }
  sello {
    uuid id PK
    text codigo UK
    text empresa_nombre
    text tipo_certificado "default: Sello CBHE"
    date fecha_emision
    text qr_url "nullable, generado automático"
    timestamptz created_at
  }
```

El sistema tiene **dos tablas independientes** en la base de datos. Cada una tiene su propia numeración automática, su propio trigger de QR y su propio acceso.

- **Prefijo `CBHE-C-`** → la verificación consulta automáticamente la tabla `capacitacion`.
- **Prefijo `CBHE-S-`** → la verificación consulta automáticamente la tabla `sello`.

El código se genera **solo** al guardar el registro. Usted no necesita escribir ni recordar ningún código.

---

## 3. Emitir un Sello CBHE

```mermaid
flowchart TD
  Start([🏢 Inicio]) --> Login[Abrir Supabase Studio]
  Login -->   TableEditor[Table Editor → sello_input]
  TableEditor --> Insert[Insert row]
  Insert --> FillFields["Completar:<br/>empresa_nombre<br/>fecha_emision"]
  FillFields --> Save[Guardar]
  Save --> AutoCode["🔧 Código CBHE-S-XXXXX<br/>generado automático"]
  AutoCode --> Wait["⏳ Esperar ~5 segundos"]
  Wait --> QRReady["✅ QR generado en qr_url"]
  QRReady --> Done([🎉 Sello listo])

  classDef primary fill:#90EE90,stroke:#333,stroke-width:2px,color:darkgreen
  classDef secondary fill:#87CEEB,stroke:#333,stroke-width:2px,color:darkblue
  classDef terminal fill:#F5F5F5,stroke:#333,stroke-width:2px,color:black

  class Start,Done terminal
  class Login,TableEditor,Insert,Save secondary
  class FillFields,AutoCode,Wait,QRReady primary
```

### Pasos

1. **Abrir Supabase Studio** en el navegador. Nicolás le proporciona el acceso.
2. Ir a **Table Editor** → seleccionar la vista **`sello_input`** en el panel izquierdo.
3. Hacer clic en **Insert row**.
4. Completar **dos campos**:
   - `empresa_nombre`: nombre de la empresa que recibe el sello.
   - `fecha_emision`: fecha en que se emite el certificado.
5. Hacer clic en **Guardar**.
6. El sistema genera automáticamente el **código `CBHE-S-XXXXX`** y, en aproximadamente 5 segundos, el **código QR**.
7. El certificado está listo. Verifique que la columna `qr_url` tenga un valor (no esté vacía). Si está vacía, vea la [Sección 8](#8-procedimiento-ante-errores). Para ver el resultado completo con todos los campos, abra la tabla **`sello`**.

> La vista `sello_input` muestra solo los dos campos que usted necesita completar. Los campos del sistema (`id`, `codigo`, `qr_url`, `created_at`, `tipo_certificado`) quedan ocultos para simplificar la pantalla.

---

## 4. Emitir un Certificado de Capacitación

```mermaid
flowchart TD
  Start([👤 Inicio]) --> Login[Abrir Supabase Studio]
  Login -->   TableEditor[Table Editor → capacitacion_input]
  TableEditor --> Insert[Insert row]
  Insert --> FillFields["Completar:<br/>cursante_nombre<br/>nombre_capacitacion<br/>fecha_emision"]
  FillFields --> Save[Guardar]
  Save --> AutoCode["🔧 Código CBHE-C-XXXXX<br/>generado automático"]
  AutoCode --> Wait["⏳ Esperar ~5 segundos"]
  Wait --> QRReady["✅ QR generado en qr_url"]
  QRReady --> Done([🎉 Certificado listo])

  classDef primary fill:#90EE90,stroke:#333,stroke-width:2px,color:darkgreen
  classDef secondary fill:#87CEEB,stroke:#333,stroke-width:2px,color:darkblue
  classDef terminal fill:#F5F5F5,stroke:#333,stroke-width:2px,color:black

  class Start,Done terminal
  class Login,TableEditor,Insert,Save secondary
  class FillFields,AutoCode,Wait,QRReady primary
```

### Pasos

1. **Abrir Supabase Studio** en el navegador. Nicolás le proporciona el acceso.
2. Ir a **Table Editor** → seleccionar la vista **`capacitacion_input`** en el panel izquierdo.
3. Hacer clic en **Insert row**.
4. Completar **tres campos**:
   - `cursante_nombre`: nombre completo de la persona que realizó el curso.
   - `nombre_capacitacion`: nombre del curso o certificación (opcional, puede quedar vacío).
   - `fecha_emision`: fecha en que se emite el certificado.
5. Hacer clic en **Guardar**.
6. El sistema genera automáticamente el **código `CBHE-C-XXXXX`** y, en aproximadamente 5 segundos, el **código QR**.
7. El certificado está listo. Verifique que la columna `qr_url` tenga un valor (no esté vacía). Si está vacía, vea la [Sección 8](#8-procedimiento-ante-errores). Para ver el resultado completo con todos los campos, abra la tabla **`capacitacion`**.

> La vista `capacitacion_input` muestra solo los tres campos que usted necesita completar. Los campos del sistema (`id`, `codigo`, `qr_url`, `created_at`) quedan ocultos para simplificar la pantalla.

---

## 5. El QR se genera solo

No necesita hacer nada adicional. Cuando guarda un registro, el sistema dispara automáticamente esta secuencia:

```mermaid
sequenceDiagram
  participant Studio as Supabase Studio
  participant DB as PostgreSQL
  participant Webhook as pg_net Webhook
  participant Edge as Edge Function<br/>(generate-qr)
  participant Storage as Storage<br/>(certificados-qr)

  Studio->>DB: INSERT INTO capacitacion / sello
  DB->>Webhook: Trigger: después de INSERT
  Webhook->>Edge: POST { record, table }
  Edge->>Edge: Generar QR (librería qrcode)
  Edge->>Storage: upload({codigo}.png)
  Storage-->>Edge: publicUrl
  Edge->>DB: UPDATE SET qr_url = publicUrl
  Note over Studio,DB: ⏱ ~2-5 segundos en total
```

> **El QR se genera una sola vez al crear el registro (INSERT).** Si modifica datos después (nombre, fecha, curso), **el QR no cambia** — el código `CBHE-C-XXXXX` / `CBHE-S-XXXXX` y la URL de verificación permanecen iguales. El QR codifica la URL `cbhe.org.bo/certificados/?c=CBHE-C-XXXXX`, que depende solo del código único.

> **Importante**: después de guardar, **espere unos 5 segundos** y refresque la vista de la tabla. La columna `qr_url` debe mostrar un enlace. Si pasados 30 segundos sigue vacía, vea la [Sección 8](#8-procedimiento-ante-errores).

> **El QR se genera una sola vez al crear el registro.** Si modifica los datos después de creado (nombre, fecha, curso), **el QR no cambia** — el código `CBHE-C-XXXXX` y la URL de verificación permanecen iguales. El QR codifica la URL `cbhe.org.bo/certificados/?c=CBHE-C-XXXXX`, que depende únicamente del código único del certificado, no de los datos que usted completa.

---

## 6. Verificar un certificado

Cualquier persona con el código QR puede verificar la autenticidad escaneándolo con su teléfono:

```mermaid
flowchart TD
  Start([📱 Escanea el código QR]) --> URL["Navega a<br/>cbhe.org.bo/certificados/?c=CODIGO"]
  URL --> Detect{¿Prefijo del código?}
  Detect -->|"CBHE-C-"| QueryC[Consultar tabla<br/>capacitacion]
  Detect -->|"CBHE-S-"| QueryS[Consultar tabla<br/>sello]
  Detect -->|Otro| NotFound["❌ Certificado<br/>No Encontrado"]
  QueryC --> FoundC["Mostrar: cursante,<br/>capacitación, fecha"]
  QueryS --> FoundS["Mostrar: empresa,<br/>tipo, fecha"]
  FoundC --> QRShow[Si tiene QR:<br/>mostrar imagen]
  FoundS --> QRShow
  QRShow --> Verified([✅ Verificado])
  NotFound --> Retry["Verificar el código<br/>e intentar de nuevo"]

  classDef primary fill:#90EE90,stroke:#333,stroke-width:2px,color:darkgreen
  classDef secondary fill:#87CEEB,stroke:#333,stroke-width:2px,color:darkblue
  classDef decision fill:#FFD700,stroke:#333,stroke-width:2px,color:black
  classDef error fill:#FFB6C1,stroke:#DC143C,stroke-width:2px,color:black
  classDef terminal fill:#F5F5F5,stroke:#333,stroke-width:2px,color:black

  class Start,URL secondary
  class Detect decision
  class QueryC,QueryS,FoundC,FoundS,QRShow primary
  class NotFound error
  class Verified,Retry terminal
```

### URL pública de verificación

```
https://cbhe.org.bo/certificados/?c=CBHE-C-Xg7Klm3NpQ
```

Reemplace `CBHE-C-Xg7Klm3NpQ` por el código real del certificado. El sistema detecta automáticamente si es un Sello (`CBHE-S-`) o una Capacitación (`CBHE-C-`) y muestra los datos correspondientes.

### Qué ve el público

| Si es... | El público ve |
|---|---|
| **Sello CBHE** | Nombre de la empresa, tipo de certificado, fecha de emisión, código de verificación y QR |
| **Capacitación** | Nombre del cursante, nombre del curso, fecha de emisión, código de verificación y QR |
| **Código inválido** | "Certificado No Encontrado" |

---

## 7. Roles y permisos

| Quién | Tabla | Qué puede hacer | Cómo accede |
|---|---|---|---|
| **Responsable de Gestión** | `sello` | Emitir sellos CBHE | Solicita a Nicolás, que opera Supabase Studio |
| **Responsable de Capacitación** | `capacitacion` | Emitir certificados de capacitación | Solicita a Nicolás, que opera Supabase Studio |
| **Nicolás** | `capacitacion` y `sello` | Crear, modificar y eliminar registros | Supabase Studio (acceso completo) |
| **Público** | `capacitacion` y `sello` | Verificar certificados (solo lectura) | Escaneando el QR o visitando la URL de verificación |

> **Nota**: el acceso a Supabase Studio está gestionado por Nicolás. Si la Responsable de Gestión o la Responsable de Capacitación necesitan acceso directo en el futuro, se puede configurar.

---

## 8. Procedimiento ante errores

| Error | Causa probable | Solución |
|---|---|---|
| `qr_url` aparece vacío después de guardar | La Edge Function no se ejecutó a tiempo o falló | **Espere 30 segundos** y refresque la tabla. Si sigue vacío, **genere un nuevo certificado**: cree otro registro con los mismos datos. El sistema asignará un código nuevo y generará el QR automáticamente. El registro sin QR queda como fallido — no se usa y no afecta nada. |
| Insertó un sello en la tabla equivocada (o viceversa) | Confusión entre las dos tablas al hacer Insert row | **No elimine el registro erróneo todavía.** Cree un nuevo registro en la tabla correcta (el código y el QR se generan solos). Luego elimine el registro equivocado: seleccione la fila y haga clic en **Delete**. Los códigos eliminados no se reutilizan, no hay riesgo de duplicados. |
| El código generado tiene un formato incorrecto | Fallo del trigger de generación de código | **Genere un nuevo certificado** con los mismos datos (INSERT nuevo). El registro con código defectuoso puede eliminarse o dejarse — no afecta al sistema. |
| "Certificado No Encontrado" al escanear el QR | Registro eliminado o código erróneo | Verifique en Supabase Studio que el registro existe en la tabla correspondiente. Si fue borrado por error, **genere un nuevo certificado** con los mismos datos. El código anterior deja de funcionar. |
| La página de verificación muestra error | Servicio de Supabase caído o problema de conexión | Espere unos minutos y vuelva a intentar. Si el error persiste más de 15 minutos, contacte a Nicolás — es una falla del sistema, no un error de uso. |
| No puede acceder a Supabase Studio | Credenciales vencidas o problema de autenticación | Contacte a Nicolás para restablecer el acceso. |

---

## 9. Resguardo de datos

Para tener un backup local de los certificados emitidos:

1. **En Supabase Studio**, vaya a **SQL Editor** y ejecute:
   ```sql
   SELECT * FROM public.capacitacion ORDER BY created_at DESC;
   ```
   Luego haga lo mismo para `sello`:
   ```sql
   SELECT * FROM public.sello ORDER BY created_at DESC;
   ```
2. **Exporte los resultados** a CSV usando el botón **Export** en el panel de resultados de Supabase Studio.
3. **Guarde el archivo CSV** en una carpeta segura de su computadora o en la carpeta compartida de la CBHE. Repita este procedimiento una vez por mes o después de cada lote grande de emisiones.

> **Recomendación**: guarde también una copia de cada QR generado. Puede descargar la imagen desde la columna `qr_url` en Supabase Studio (clic derecho → Guardar imagen).

---

## 10. Entregar al destinatario

Cuando el certificado está listo (código generado + QR visible en `qr_url`):

1. **Copie la URL del QR** desde la columna `qr_url` en Supabase Studio. Es una URL que termina en `.png`.
2. **Copie el enlace de verificación**:
   ```
   https://cbhe.org.bo/certificados/?c=CBHE-C-Xg7Klm3NpQ
   ```
   (Reemplace por el código real del certificado.)
3. **Envíe al destinatario por correo electrónico**:
   - Adjunte la imagen del QR (descargable desde `qr_url`).
   - Incluya el enlace de verificación en el cuerpo del correo.
   - Mencione que puede verificar la autenticidad escaneando el QR o visitando el enlace.
4. **Opcional**: si la empresa o cursante necesita el certificado impreso, descargue el QR como imagen PNG e insértelo en el documento de certificado que utilice la CBHE.

---

## Soporte técnico

Ante cualquier duda o problema con el sistema de certificados, contactar a:

- **Nicolás** — administrador técnico del sistema

---

## Documentos relacionados

- [README](./README.md) — descripción general del proyecto y costo operativo
- [Documentación Técnica](./DOCUMENTACION-TECNICA.md) — stack tecnológico, arquitectura, build y deploy (para developers)
- [Guía para Editores del Sitio](./GUIA-EDITORES.md) — cómo gestionar el contenido del sitio web (artículos, cursos, empresas)
- [Pendientes de Despliegue](./PENDIENTES-DESPLIEGUE.md) — checklist de handoff y tareas pendientes
