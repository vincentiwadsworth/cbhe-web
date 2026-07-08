# Pendientes para despliegue y entrega final — CBHE

> **Última revisión**: 9 de julio de 2026
>
> Este documento lista lo que falta para que el sitio esté disponible en `cbhe.org.bo`
> y la CBHE tenga control total sobre el código y las cuentas.

## 1. Cuenta de GitHub de la CBHE

**Objetivo**: que el repositorio del sitio pertenezca a la CBHE, no a Nicolás.

### Qué se necesita
- Crear una cuenta gratuita en [github.com](https://github.com) usando el correo institucional `cbhe@cbhe.org.bo`
- El nombre de usuario puede ser `cbhe-org` o similar

### Por qué
GitHub Pages requiere que el repositorio sea público para hosting gratuito. Mientras el repositorio esté en la cuenta personal de Nicolás, la CBHE no puede administrar accesos por sí misma. Transferido a la cuenta institucional, la CBHE decide quién tiene permiso de lectura, escritura o administración.

### Cómo se hace (en la reunión de entrega)
1. Acceder a github.com y crear la cuenta con `cbhe@cbhe.org.bo`
2. Nicolás transfiere el repositorio `cbhe-web` a la nueva cuenta
3. Verificar que GitHub Pages sigue funcionando después de la transferencia
4. La URL del repositorio cambia de `github.com/vincentiwadsworth/cbhe-web` a `github.com/cbhe-org/cbhe-web`

## 2. Dominio cbhe.org.bo

**Objetivo**: que el sitio esté disponible en `cbhe.org.bo` en lugar de `vincentiwadsworth.github.io/cbhe-web`.

### ¿Qué es un DNS?

Imagínese que internet es una ciudad. Cada sitio web vive en una dirección numérica —por ejemplo, `185.199.108.153`— así como cada casa tiene una dirección en una calle. Pero recordar números para cada sitio que uno visita sería imposible.

El **DNS** (Sistema de Nombres de Dominio) funciona como la guía telefónica de internet: traduce nombres que las personas recuerdan (`cbhe.org.bo`) a direcciones numéricas que las computadoras entienden (`185.199.108.153`).

Cuando alguien escribe `cbhe.org.bo` en su navegador, el DNS responde: «el sitio de la CBHE está alojado en los servidores de GitHub, diríjase a esta dirección». Sin esta configuración, el dominio `cbhe.org.bo` no lleva a ningún lado.

### ¿Qué es nic.bo?

`nic.bo` es la entidad que administra todos los dominios `.bo` (el dominio de Bolivia). Es donde se registró `cbhe.org.bo` y donde se configura hacia dónde apunta.

### Qué se necesita

Acceder al panel de administración de `nic.bo` con las credenciales de la cuenta que administra `cbhe.org.bo`. Una vez dentro, configurar los registros DNS para que apunten a GitHub Pages.

### Paso a paso

1. Acceder a `nic.bo` con las credenciales del dominio `cbhe.org.bo`
2. Ir a la sección de **DNS** o **Zona DNS** o **Registros DNS**
3. Agregar los siguientes registros:

**Registro CNAME** (para `www.cbhe.org.bo`):
- Tipo: `CNAME`
- Nombre: `www`
- Valor: `vincentiwadsworth.github.io`
- TTL: `3600` (o automático)

**Registros A** (para `cbhe.org.bo` sin www):
- Tipo: `A` — Nombre: `@` — Valor: `185.199.108.153`
- Tipo: `A` — Nombre: `@` — Valor: `185.199.109.153`
- Tipo: `A` — Nombre: `@` — Valor: `185.199.110.153`
- Tipo: `A` — Nombre: `@` — Valor: `185.199.111.153`

4. En GitHub, en el repositorio transferido: **Settings → Pages → Custom domain** → escribir `cbhe.org.bo` → **Save**
5. Marcar la casilla **Enforce HTTPS** (aparece después de guardar el dominio)

### ⚠️ Importante: no modificar los registros MX

Los registros **MX** controlan el correo electrónico (`@cbhe.org.bo`). Si se modifican o eliminan, el correo de la CBHE deja de funcionar. Al editar los registros DNS, **no tocar ninguna línea que diga MX**.

### Tiempo de propagación

Los cambios de DNS pueden tardar hasta 48 horas en reflejarse en todo el mundo, aunque normalmente se completan en 15 a 30 minutos. Durante ese tiempo, algunas personas pueden ver el sitio nuevo y otras el anterior. Es normal.

## 3. Después del despliegue

Una vez completados los pasos 1 y 2:

- El sitio estará disponible en `cbhe.org.bo`
- La CBHE será dueña del repositorio, el código y los datos
- El equipo de la CBHE operará el CMS y los certificados según las guías:
  - [Guía de Editores](./GUIA-EDITORES.md)
  - [Guía de Certificados](./GUIA-CERTIFICADOS.md)
- Nicolás queda disponible como soporte técnico para:
  - Cambios que requieran programación
  - Problemas con los certificados o el sitio
  - Actualizaciones de dependencias

## Contacto

- **Nicolás** — Desarrollador a cargo de la entrega técnica
- *(Completar con datos de contacto antes de la reunión de entrega)*
