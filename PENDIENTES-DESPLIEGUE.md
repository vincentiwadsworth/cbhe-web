# Migración del dominio cbhe.org.bo

> **Última revisión**: 18 de agosto de 2026
>
> Esta guía explica, paso a paso, cómo trasladar el dominio `cbhe.org.bo` al sitio
> nuevo (Astro, alojado en GitHub Pages), mantener el correo electrónico
> funcionando y cancelar el hosting viejo (HostGator) sin perder nada.
>
> Está escrita para el personal administrativo de la CBHE, sin conocimientos
> técnicos. Cada término técnico se explica la primera vez que aparece y al
> final hay un glosario. Los valores de DNS de esta guía provienen de una
> consulta real al dominio, capturada el día de la revisión. Cópielos exactos.

## 1. Objetivo y panorama

**Qué se logra con esta migración:**

- El dominio `cbhe.org.bo` muestra la web nueva (Astro, alojada en GitHub Pages).
- El correo electrónico `@cbhe.org.bo` (Microsoft 365) sigue funcionando igual que hoy.
- El hosting viejo (HostGator) se puede cancelar al final, porque ni la web ni el correo dependerán de él.

**Orden de trabajo.** Siga los pasos en este orden y no salte ninguno:

1. **Paso 1**: crear la zona del dominio en Cloudflare y copiar los registros.
2. **Paso 2**: cambiar los nameservers en nic.bo y probar el correo.
3. **Paso 3**: apuntar la web a GitHub Pages en Cloudflare.
4. **Paso 4**: activar el dominio en GitHub.
5. **Paso 5**: ajuste final del código (lo hace Nicolás, sin acción de la CBHE).

Cada paso termina con un punto de verificación (CHECKPOINT). No pase al siguiente paso hasta cumplirlo.

## 2. Estado actual del dominio

El **DNS** (Sistema de Nombres de Dominio) es la guía telefónica de internet: traduce el nombre `cbhe.org.bo` a las direcciones numéricas donde están el sitio y el correo. Cada línea de configuración del DNS se llama **registro**.

La siguiente tabla es el inventario real del dominio, capturado con una consulta DNS pública. Úsela como referencia en el Paso 1: Cloudflare debe quedar con estos mismos valores.

| Tipo | Nombre | Valor | Para qué sirve | ¿Sostiene el correo? |
|---|---|---|---|---|
| NS | @ | ns141.websitewelcome.com | Nameserver 1 de HostGator | No |
| NS | @ | ns142.websitewelcome.com | Nameserver 2 de HostGator | No |
| MX (prioridad 0) | @ | cbhe-org-bo.mail.protection.outlook.com | Indica dónde internet deja los mails de `@cbhe.org.bo` | Sí |
| TXT (SPF) | @ | "v=spf1 ip4:192.185.2.29 include:spf.protection.outlook.com -all" | Autoriza qué servidores pueden enviar mails en nombre de la CBHE | Sí |
| TXT | @ | "MS=ms24194867" | Verificación de que la CBHE es dueña del dominio ante Microsoft 365 | Sí |
| CNAME | autodiscover | autodiscover.outlook.com | Permite que Outlook encuentre la configuración del correo automáticamente | Sí |
| CNAME | enterpriseregistration | enterpriseregistration.windows.net | Permite el inicio de sesión corporativo en Microsoft 365 | Sí |
| A | @ | 104.131.166.96 | Web vieja (Joomla en un servidor propio) | No |
| A | www | 104.131.166.96 | Web vieja, alias de `@` | No |
| A | mail | 192.185.26.157 | Correo del hosting viejo de HostGator | No |

**Registros que NO existen hoy (verificado):** DKIM, DMARC, SRV de Teams y msoid. El dominio tampoco tiene firma DNSSEC. No los busque ni los agregue en Cloudflare; se tratan como pendiente en la sección 11.

**Cuáles sostienen el correo.** Los 5 registros marcados con «Sí» son los que mantienen el correo de la CBHE en Microsoft 365:

- **MX**: el valor `cbhe-org-bo.mail.protection.outlook.com` dice «el correo de la CBHE vive en Microsoft 365». Si este registro cambia o se pierde, los mails entrantes dejan de llegar.
- **SPF**: la lista de servidores autorizados a enviar correo en nombre de la CBHE. Si se pierde, los mails salientes pueden ser rechazados o caer en spam.
- **MS**: la verificación que Microsoft 365 usa para confirmar la propiedad del dominio. Si se pierde, Microsoft 365 puede pedirla de nuevo.
- **autodiscover**: configura Outlook automáticamente.
- **enterpriseregistration**: permite el acceso corporativo a Microsoft 365.

Los registros A apuntan a los servidores donde está alojada la web. Hoy apuntan al sitio viejo de Joomla; en el Paso 3 se cambian a GitHub Pages. Los registros del correo se copian tal cual en Cloudflare y no se tocan más.

## 3. Antes de empezar

1. **Rescatar el contenido del sitio viejo (opcional).** La web vieja (Joomla) vive en un servidor propio (`104.131.166.96`). Cuando los registros A cambien en el Paso 3, esa web deja de ser visible desde el dominio. Si hay contenido que quiera conservar, descárguelo o copie los textos y las imágenes antes del Paso 3.
2. **Tener a mano las credenciales de nic.bo.** `nic.bo` es la entidad que administra todos los dominios `.bo`. Necesita el usuario y la contraseña de la cuenta que administra `cbhe.org.bo`. Si no los tiene, pídalos al titular registrado del dominio.
3. **Crear la cuenta de Cloudflare.** Entre a `cloudflare.com` y cree la cuenta gratuita con el correo `cbhe@cbhe.org.bo`. El plan gratuito no pide tarjeta de crédito.

## 4. Paso 1: Crear la zona en Cloudflare

1. Entre a `cloudflare.com` con la cuenta de la CBHE.
2. En el panel, haga clic en **Add a site** (Agregar un sitio).
3. Escriba el dominio exacto: `cbhe.org.bo`. Haga clic en **Continue**.
4. Elija el plan **Free** (gratuito). Haga clic en **Continue**.
5. Cloudflare escanea el dominio y le muestra los registros que encontró. No guarde todavía.

**CHECKPOINT: comparar lo importado contra el inventario.**

1. Abra la tabla de la sección 2 y compárela registro por registro con lo que Cloudflare importó.
2. El escaneo automático suele omitir los registros SPF, `MS=ms24194867` y autodiscover. Agregue a mano los que falten con el botón **Add record**.
3. Verifique que los 5 registros del correo queden exactos. Copie los valores de esta tabla, sin espacios ni cambios:

| Registro | Nombre | Valor exacto |
|---|---|---|
| MX (prioridad 0) | @ | cbhe-org-bo.mail.protection.outlook.com |
| TXT (SPF) | @ | "v=spf1 ip4:192.185.2.29 include:spf.protection.outlook.com -all" |
| TXT | @ | "MS=ms24194867" |
| CNAME | autodiscover | autodiscover.outlook.com |
| CNAME | enterpriseregistration | enterpriseregistration.windows.net |

4. El registro **A mail** (`192.185.26.157`) apunta al correo del hosting viejo de HostGator. Como ese hosting se va a cancelar, impórtelo solo si todavía lo usa. Si no está seguro, déjelo fuera: el correo de la CBHE vive en Microsoft 365 y no depende de él.
5. Cuando los 5 registros del correo estén exactos, haga clic en **Continue** y siga el asistente hasta la pantalla que muestra los nameservers (el botón suele decir **Done, check nameservers**).

Cloudflare le mostrará dos nameservers nuevos, con nombres que terminan en `.ns.cloudflare.com`. **Anote los dos nombres completos:** los necesita en el Paso 2. El dominio quedará en estado *Pending* (pendiente) hasta que los nameservers cambien; es normal.

## 5. Paso 2: Cambiar los nameservers en nic.bo

**Qué es un nameserver:** el **nameserver** (servidor de nombres) es la computadora autorizada que guarda los registros del dominio y los entrega a quien pregunta. Hoy los nameservers son de HostGator. Al cambiarlos a los de Cloudflare, internet empezará a preguntarle a Cloudflare, que ya tiene los registros copiados en el Paso 1.

**Importante:** `nic.bo` solo permite gestionar los nameservers. No permite editar registros individuales (A, CNAME, MX, TXT). Por eso los registros se copian en Cloudflare en el Paso 1 y en nic.bo solo se cambian los nameservers.

1. Entre a `nic.bo` y abra la cuenta que administra `cbhe.org.bo`.
2. Abra la gestión del dominio `cbhe.org.bo` y busque el formulario de nameservers. El campo se llama **Nombre de Servidor DNS**.
3. En el primer campo, borre `ns141.websitewelcome.com` y escriba el primer nameserver que Cloudflare le mostró.
4. En el segundo campo, borre `ns142.websitewelcome.com` y escriba el segundo nameserver de Cloudflare.
5. Deje el campo **IP** en blanco. Solo se completa cuando el nameserver termina en `.bo`; los de Cloudflare no.
6. Guarde los cambios. Los campos de nameserver que queden vacíos deben seguir vacíos.

**Propagación.** Los cambios de DNS tardan en difundirse por internet. Lo típico es 15 a 30 minutos; puede llegar a 48 horas. Durante ese tiempo, el sitio y el correo siguen funcionando con la configuración vieja.

**CHECKPOINT: probar el correo.**

1. Espere al menos 15 minutos después de guardar los nameservers.
2. Envíe un mail de prueba desde una cuenta de la CBHE hacia una cuenta externa (por ejemplo, Gmail).
3. Responda ese mail desde la cuenta externa y confirme que llega a la CBHE.
4. Si el correo falla, haga rollback: en nic.bo vuelva a poner los nameservers `ns141.websitewelcome.com` y `ns142.websitewelcome.com`. Eso restaura la configuración anterior y el correo vuelve a funcionar.

Cuando Cloudflare detecte el cambio, el estado del dominio pasará a *Active* (activo).

## 6. Paso 3: Apuntar la web a GitHub

Ahora que Cloudflare es el nameserver del dominio, agregue los registros que llevan la web al sitio nuevo (GitHub Pages).

1. En Cloudflare, abra el dominio `cbhe.org.bo` y vaya a **DNS** → **Records**.
2. Elimine los dos registros A que apuntan a `104.131.166.96` (el `@` y el `www`). Si se quedan, parte de los visitantes seguirá viendo la web vieja de Joomla. Este es el momento en que el sitio viejo deja de ser visible.
3. Agregue 4 registros **A** con nombre `@`, uno por cada dirección:

| Nombre | Valor |
|---|---|
| @ | 185.199.108.153 |
| @ | 185.199.109.153 |
| @ | 185.199.110.153 |
| @ | 185.199.111.153 |

4. Agregue 1 registro **CNAME**:

| Nombre | Valor |
|---|---|
| www | vincentiwadsworth.github.io |

5. Los 5 registros de este paso deben quedar en modo **DNS only** (la nube gris). Si algún registro muestra la nube naranja, haga clic en la nube para cambiarla a gris. GitHub Pages no funciona a través del proxy naranja de Cloudflare.

La web nueva será visible recién cuando complete el Paso 4, porque GitHub Pages solo sirve el sitio cuando el dominio está declarado en su configuración.

## 7. Paso 4: Activar el dominio en GitHub

GitHub Pages solo entrega el sitio cuando el dominio está declarado en la configuración del repositorio.

1. Entre a `github.com`, abra el repositorio del sitio (`cbhe-web`) y vaya a **Settings** → **Pages**.
2. En **Custom domain**, escriba `cbhe.org.bo` y haga clic en **Save**.
3. GitHub verifica el dominio y genera el certificado de seguridad. Espere unos minutos.
4. Cuando el certificado esté listo, marque la casilla **Enforce HTTPS**.

**Nota:** en este proyecto el despliegue lo hace GitHub Actions y el archivo CNAME del repositorio se ignora. La configuración del dominio se hace aquí, de forma manual, y queda guardada en el repositorio.

**CHECKPOINT:** abra `https://cbhe.org.bo` en el navegador y confirme que se ve el sitio nuevo. Si el navegador aún muestra el sitio viejo, espere unos minutos y vuelva a cargar la página (la propagación puede tardar).

## 8. Paso 5: Ajuste final del código

Lo hace el soporte técnico (Nicolás). Se cambian dos valores en el archivo `astro.config.mjs` del proyecto: `site` (la URL de producción) y `base` (el prefijo de las rutas), para que el sitio se sirva desde `https://cbhe.org.bo` sin el prefijo `/cbhe-web/`. Después se vuelve a desplegar y se verifica el build.

**La CBHE no necesita hacer nada en este paso.** Solo confirmar cuando Nicolás avise que quedó publicado.

## 9. Verificación final

Haga estas comprobaciones antes de dar por terminada la migración:

1. Navegue 3 o 4 páginas internas del sitio en `cbhe.org.bo` (por ejemplo, la portada, una página de servicios y una novedad) y confirme que cargan bien.
2. Abra `https://cbhe.org.bo/admin/` y confirme que pide iniciar sesión con GitHub. Ese es el panel del CMS.
3. Verifique un certificado QR real: escanee el QR de un certificado emitido o abra su URL de verificación, que tiene la forma `https://cbhe.org.bo/certificados/?c=CBHE-C-XXXX` (reemplace `XXXX` por el código real). Confirme que muestra los datos del certificado.
4. Envíe y reciba otro mail de prueba hacia y desde una cuenta externa, igual que en el Paso 2.

## 10. Rollback completo

Si algo sale mal, puede volver a la situación anterior:

1. Entre a `nic.bo`.
2. Vuelva a poner los nameservers `ns141.websitewelcome.com` y `ns142.websitewelcome.com`.
3. Guarde.

Con eso, el dominio vuelve a usar la configuración de HostGator tal como estaba: la web vieja y el correo quedan restaurados, siempre que el hosting de HostGator siga activo. **Por eso no cancele el hosting de HostGator hasta que el dominio nuevo funcione sin problemas durante unos días.** Si lo cancela antes, desaparece el respaldo y el rollback deja de ser posible.

## 11. Pendientes fuera del alcance de esta entrega

### Correo: DKIM y DMARC

Hoy el dominio no tiene registros DKIM ni DMARC. Sin ellos, los mails enviados desde la CBHE pueden caer en la carpeta de spam de los destinatarios. Para activarlos se usan los paneles de Microsoft 365 (Exchange Admin Center), no Cloudflare. Es un paso recomendado y conviene hacerlo con ayuda del soporte técnico.

### Repositorio en la cuenta de GitHub de la CBHE

El objetivo final es que el repositorio del sitio pertenezca a la CBHE y no a una cuenta personal.

**Qué se necesita:** crear una cuenta gratuita en `github.com` con el correo institucional `cbhe@cbhe.org.bo`. El nombre de usuario puede ser `cbhe-org` o similar.

**Por qué:** GitHub Pages requiere que el repositorio sea público para el hosting gratuito. Mientras el repositorio esté en la cuenta personal de Nicolás, la CBHE no puede administrar accesos por sí misma. Transferido a la cuenta institucional, la CBHE decide quién tiene permisos de lectura, escritura o administración.

**Cómo se hace (en la reunión de entrega):**

1. Crear la cuenta en `github.com` con `cbhe@cbhe.org.bo`.
2. Nicolás transfiere el repositorio `cbhe-web` a la nueva cuenta.
3. Actualizar el backend del CMS con la nueva cuenta y generar un token nuevo de GitHub para que el CMS siga guardando los cambios.
4. Verificar que GitHub Pages sigue funcionando después de la transferencia.
5. La URL del repositorio cambia de `github.com/vincentiwadsworth/cbhe-web` a `github.com/cbhe-org/cbhe-web`.

## 12. Glosario breve

- **DNS (Sistema de Nombres de Dominio)**: la guía telefónica de internet. Traduce el nombre `cbhe.org.bo` a las direcciones numéricas donde están el sitio y el correo.
- **Nameserver (servidor de nombres)**: la computadora autorizada que guarda los registros del dominio y los entrega a quien pregunta. Hoy es de HostGator; después de la migración será de Cloudflare.
- **Registro**: cada línea de configuración del dominio dentro del DNS.
- **Registro A**: asocia el nombre del dominio con la dirección numérica (IP) de un servidor. Se usa para la web.
- **Registro CNAME**: redirige un nombre (por ejemplo, `www.cbhe.org.bo`) a otro nombre (por ejemplo, `vincentiwadsworth.github.io`).
- **Registro MX**: indica dónde recibe el correo del dominio. Si cambia o se pierde, los mails entrantes dejan de llegar.
- **Registro TXT**: texto que se usa para verificaciones, como el SPF (quién puede enviar correo en nombre de la CBHE) y la verificación de Microsoft 365.
- **Propagación**: el tiempo que tarda un cambio de DNS en difundirse por internet. Lo típico es 15 a 30 minutos; puede llegar a 48 horas.
- **Cloudflare**: servicio gratuito que guardará los registros del dominio y los entregará a quien pregunta.
- **GitHub Pages**: el servicio gratuito que aloja el sitio nuevo y lo entrega en `cbhe.org.bo`.

## Después del despliegue

Una vez completados los pasos de esta guía:

- El sitio estará disponible en `cbhe.org.bo`.
- El equipo de la CBHE operará el CMS y los certificados según las guías:
  - [Guía de Editores](./GUIA-EDITORES.md)
  - [Guía de Certificados](./GUIA-CERTIFICADOS.md)
- Nicolás queda disponible como soporte técnico para:
  - Cambios que requieran programación.
  - Problemas con los certificados o el sitio.
  - Actualizaciones de dependencias.

## Contacto

- **Nicolás**: desarrollador a cargo de la entrega técnica.
- *(Completar con datos de contacto antes de la reunión de entrega)*
