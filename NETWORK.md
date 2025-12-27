Exponer la aplicación en la red local

Pasos para ejecutar el servidor HTTP local y acceder desde otros equipos en la misma red:

1. Ejecutar la aplicación (recomendado):

   - Con Electron (inicia la app y el servidor integrado):
     ```bash
     npm start
     ```

   - Ejecutar solo el servidor (opcional):
     ```bash
     npm run server
     ```

2. Ver la IP local y puerto: el servidor imprime en consola algo como:

   "Servidor escuchando en http://0.0.0.0:3000"
   "Accesible desde la red en: http://192.168.1.4:3000"

   Usa la IP que muestre la salida, por ejemplo: `http://192.168.1.4:3000`

3. Abrir el puerto en Windows (ejecutar PowerShell como Administrador):

   ```powershell
   netsh advfirewall firewall add rule name="InventarioApp" dir=in action=allow protocol=TCP localport=3000
   ```

4. Autenticación (API key):

   - El servidor puede requerir una **X-API-KEY** en las solicitudes a las rutas que modifican datos (POST/DELETE). Debes exportar la variable de entorno `API_KEY` en el equipo principal antes de ejecutar el servidor:

     ```powershell
     $Env:API_KEY = "mi_clave_secreta"
     npm run server
     ```

   - Ejemplo de petición protegida con curl:

     ```bash
     curl -X POST http://192.168.1.4:3000/api/products \
       -H "Content-Type: application/json" \
       -H "x-api-key: mi_clave_secreta" \
       -d '{"nombre":"Lapicero","descripcion":"Azul","tipoUnidad":"Pzas","cantidad":10}'
     ```

5. Notificaciones en tiempo real:

   - El servidor emite eventos por socket.io en `inventory:changed` con la lista actualizada de productos cuando hay cambios.
   - La UI servida incluye el cliente de socket.io por defecto y se actualizará en tiempo real.

6. Seguridad y recomendaciones:

   - Si vas a exponer datos sensibles añade autenticación fuerte y HTTPS.
   - Considera usar mDNS (Bonjour) para descubrimiento automático en la red.
   - Si no quieres que escuche todas las interfaces, cambia el bind en `server.js` de `0.0.0.0` a la IP específica o `127.0.0.1`.

Si quieres, puedo añadir un script que configure la regla del firewall automáticamente, montar HTTPS con certificados auto-firmados o integrar ngrok para acceso externo seguro.