---
name: deploy-shared-hosting
description: Deployment procedures for shared hosting (GoDaddy/cPanel) via SSH/SCP/FTP, handling Windows/Linux path & tar compatibility, Apache .htaccess routing, PHP .env.php.local security, and HTTP status verification.
metadata:
  auto-invoke: 'deploy, ssh, scp, ftp, hosting, godaddy, cpanel, htaccess, env.php.local, production deploy'
---

# Deploy & Shared Hosting (SSH / SCP / Apache / PHP)

Guía y estándares de despliegue para el portfolio estático (`output: 'export'`) sobre hosting compartido (GoDaddy/cPanel) con backend de apoyo PHP.

## 1. Empaquetado y Transferencia (Compatibilidad Windows ↔ Linux)

- **Nunca usar `scp -r` masivo** directamente sobre cientos de archivos individuales desde Windows: puede colgarse en el prompt, fallar en delimitadores de ruta (`\` vs `/`) o corromper enlaces simbólicos.
- **Flujo Estándar de Despliegue**:
  1. **Build Estático**: `pnpm --filter web build` (genera `apps/web/out`).
  2. **Compresión Local (`tar.gz`)**:
     ```powershell
     tar -czf deploy.tar.gz -C apps/web/out .
     ```
  3. **Subida de Archivo Único**:
     ```powershell
     scp deploy.tar.gz montecervino@montecervino.net:~/deploy-portfolio.tar.gz
     ```
  4. **Extracción y Limpieza Remota**:
     ```bash
     ssh montecervino@montecervino.net "cd ~/public_html/jnicob.dev && tar -xzf ~/deploy-portfolio.tar.gz && rm ~/deploy-portfolio.tar.gz"
     ```
  5. **Limpieza Local**: `Remove-Item deploy.tar.gz`

## 2. Enrutado de Apache (`trailingSlash` + `.htaccess`)

- **Estructura de Exportación Next.js**:
  - `next.config.ts` **debe incluir** `trailingSlash: true`. Esto genera estructuras físicas `es/contact/index.html` en vez de `es/contact.html`.
  - Evita errores `403 Forbidden` cuando Apache redirige automáticamente `/es/contact` → `/es/contact/` mediante `mod_dir`.
- **Configuración de `.htaccess` en Producción**:
  ```apache
  DirectoryIndex es.html index.html

  RewriteEngine On

  # Forzar HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Redirección estática de raíces
  RewriteRule ^es/?$ /es/ [L]
  RewriteRule ^en/?$ /en/ [L]

  # Endpoint PHP
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule \.php$ - [L]
  ```

## 3. Seguridad de Entorno Backend (`.env.php.local`)

- **Ubicación de Credenciales**: `~/public_html/jnicob.dev/api/.env.php.local`.
- **Permisos Estrictos**: `chmod 600`. Nunca commitear este archivo en Git.
- **Directorio de Estado Anti-Spam / Rate-Limit**: `~/contact_state` fuera del docroot (`chmod 700`).
- **Plantilla `.env.php.local`**:
  ```php
  <?php return [
      'CONTACT_TO'        => 'j.nico.b@gmail.com',
      'CONTACT_FROM'      => 'no-reply@montecervino.net',
      'MAIL_TRANSPORT'    => 'mail', // 'mail' o 'smtp'
      'ALLOWED_ORIGIN'    => 'https://jnicob.dev',
      'CONTACT_STATE_DIR' => '/home/montecervino/contact_state',
  ];
  ```

## 4. Verificación Post-Despliegue

Ejecutar validación automatizada de respuestas HTTP 200 y headers tras el despliegue:

```bash
ssh montecervino@montecervino.net "
  curl -sI https://jnicob.dev/es/contact/ | head -1;
  curl -sI https://jnicob.dev/en/contact/ | head -1;
  curl -sI https://jnicob.dev/es/cv/ | head -1;
  curl -sI https://jnicob.dev/es/projects/ | head -1;
  curl -sI https://jnicob.dev/api/contact.php | head -1
"
```

**Resultado Esperado**:

- Rutas públicas: `HTTP/2 200`
- Endpoint API PHP: `HTTP/2 405` (método GET no permitido, `allow: POST, OPTIONS`)
