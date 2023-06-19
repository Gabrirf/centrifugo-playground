# Centrifugo playground

- [Tutorial de despliegue, configuración y conexión](https://centrifugal.dev/docs/getting-started/quickstart)

### Quick install and use

1. Run `npm i`
2. Run `npm run centrifugo`
    1. Enter in container: `docker exec -it centrifugo sh`
    2. Generate token: `centrifugo gentoken -u 123`
    3. Copy token in _index.js_ file
3. Run `npm start`
4. Run `curl -X POST http://localhost:3001/publish/publisher1 -H 'Content-Type: application/json' -d '{"channel": "channel1", "data": { "hello": "world!" }}'`

# Integración básica

## Servidor Centrifugo

Se incluye documento _docker-compose_ preparado para ser ejecutado `docker-compose up`.

### Configuración

```javascript
{
  "token_hmac_secret_key": "bbe7d157-a253-4094-9759-06a8236543f9", // Key para firmar los JWT de los clientes
  "admin": true, // Habilitar la interfaz web de administración
  "admin_password": "d0683813-0916-4c49-979f-0e08a686b727",
  "admin_secret": "4e9eafcf-0120-4ddd-b668-8dc40072c78e",
  "api_key": "d7627bb6-2292-4911-82e1-615c0ed3eebb", // Token para los publicadores
  "allowed_origins": ["*"], // Necesario para permitir la conexión ('*' solo para testing local)
  "allow_subscribe_for_client": true, // Necesario para la subscripción de los clientes
  "namespaces": [ // Los espacios de nombres permiten incluir diferentes configuraciones para distintos prefijos de canales
    {
      "name": "chat",
      "publish": true, // Permite publicar a los clientes conectados
      "allow_subscribe_for_client": true, // Permite que los clientes conectados puedan subscribirse a nuevos canales
      "allow_publish_for_subscriber": true, // Permite publicar a los clientes subscritos
      // "allow_publish_for_client": true, // Permite publicar a los clientes conectados
      "allow_user_limited_channels": true
    },
    {
      "name": "notifica",
      "allow_user_limited_channels": true
    }
  ],
  "proxy_connect_endpoint": "http://host.docker.internal:3001/centrifugo/connect", // Para que Centrifugo actúe como proxy para authorización de conexión
  "proxy_http_headers": ["Authorization"], // Cabeceras que serán reenviadas al backend
  "user_personal_channel_namespace": "chat", // Prefijo (espacio de nombre) para el canal personal
  "user_subscribe_to_personal": true // Autosubscribir a canal personal (canal privado cliente)
}
```

### Creación de usuario

Es necesario generar un token con el que el cliente se autentifique, para ello se puede ejecutar el siguiente comando: 

```bash
centrifugo gentoken -u [CLIENT_ID]
```

> Nota: Aunque permite generar el token sin indicar el ID del cliente, este se generará como usuario anónimo y no permitirá la subscripción a los canales.

## Cliente consumidor

- [Documentación oficial](https://centrifugal.dev/docs/transports/overview)
- [Cliente oficial](https://github.com/centrifugal/centrifuge-js)

### Importar SDK oficial

- NodeJS

```javascript
const { Centrifuge } = require('centrifuge');
const WebSocket = require('ws'); // Necesario para NodeJS ya que no se importa automáticamente como en un navegador
```

- CDN

```html
<script src="https://unpkg.com/centrifuge@3.0.0/dist/centrifuge.js"></script>
```

### Inicializar el cliente

```javascript
const centrifuge = new Centrifuge('ws://localhost:8000/connection/websocket', {
  token: 'GENERATED_TOKEN',
  websocket: WebSocket
});
centrifuge.connect();
```

### Eventos de conexión 

```javascript
centrifuge.on('connected', () => {
  console.log('connected');
})

centrifuge.on('connecting', () => {
  console.log('connecting');
})

centrifuge.on('disconnected', () => {
  console.log('disconnected');
})
```

### Subscribirse a un canal

```javascript
const sub = centrifuge.newSubscription('channel');

sub.on('publication', function(ctx) {
    console.log(ctx.data);
});

sub.subscribe();
```

## Cliente publicador

Como cuenta la documentación, la publicación de mensajes se realiza a través de una API, que se consume a través de peticiones HTTP. La librería `cent.js` facilita su explotación.

- [Documentación oficial](https://centrifugal.dev/docs/server/server_api)
- [Cliente NO oficial](https://github.com/SocketSomeone/cent.js)

### Importar SDK

> No es oficial pero está referenciado desde la guía oficial

Módulo que extiende de axios preparado para consumir la API de Centrifugo

```javascript
const { CentClient } = require('cent.js');
```

### Inicialización del cliente

- **token** Corresponde al campo `api_key` de la configuración de Centrifugo

```javascript
const centrifugeUrl = 'http://localhost:8000/api';
const centrifugeToken = 'd7627bb6-2292-4911-82e1-615c0ed3eebb';

const client = new CentClient({
    url: centrifugeUrl,
    token: centrifugeToken,
})
```

### Publicación de un mensaje

```javascript
client.publish({
    channel: 'channel',
    data: { message: "Hello World!" }
})
```

# Avanzado

## Espacio de nombres (namespaces)

### Configuración

- Se puede definir distintas configuraciones (como las establecidas en el apartado anterior) para cada espacio de nombres.

```json
{
  ...
  "namespaces": [
    {
      "name": "notifica",
      "allow_subscribe_for_client": true,
      "allow_user_limited_channels": true
    }
  ]
}
```

### [Nomenclatura](https://centrifugal.dev/docs/3/server/channels)

El canal es un string, que el servidor interpreta ciertos caracteres reservados. Pero sigue siendo el canal que se indique.

- `:` Definirá el subespacio de un canal. Puede entenderse como grupos
- `#` Definirá un canal privado a un usuario o múltiples usuarios separados por comas. El identificador lo recoge Centrifugo del token.
    - `canal:subcanal#ID(,ID)*`
    - Aplica a un espacio definido, **no** vale para `canal#1`

### Anotaciones

- Subscribirse a un canal no implica subscripción a los subcanales (`:`), ni al revés.
- Es necesario subscribirse a un canal completo con todos los modificadores. Es decir:
    - **Sólo** se recibirá un mensaje privador por `canal:namespace#1` si el cliente se ha subscrito a `canal:namespace#1`.
        - **NO** recibirá el mensaje si sólo se subscribe a `canal:namespace`

## [Autentificación](https://centrifugal.dev/docs/server/authentication)

Para la autentificación es necesario formar un token JWT con el identificador del usuario, indicado por la clave `sub`. ([Ejemplo](./src/playgrounds/notifica.js#L36))

> Como firma del JST usaremos el `token_hmac_secret_key`

### [Centrifugo como proxy](https://centrifugal.dev/docs/3/server/proxy)

Para configurar que Centrifugo delegue el control de acceso, no será necesario indicar ningún token. En caso de enviarlo, no actuará como Proxy.

Es necesario configurar Centrifugo indicándole el endpoint del backend que realizará el control de acceso.

- _config.json_

```json
{
  ...
  "proxy_connect_endpoint": "http://host.docker.internal:3001/centrifugo/connect",
  "proxy_http_headers": ["Authorization"],
}
```

- **proxy_connect_endpoint** Endpoint del backend que realiza el control de acceso
- **proxy_http_headers** Cabeceras de la petición original que serán incluídas en la peticiṕn al endpoint

Para aceptar la conexión, el backend deberá enviar un body indicando el identificador del usuario, así como [otros parámetros opcionales](https://centrifugal.dev/docs/3/server/proxy#connect-result-fields):

- **channels** Para autosubscribir al cliente a los canales indicados
- **subs** Lista de canales a los que el cliente se puede subscribir

[Ver ejemplo](./src/playgrounds/proxy.js#L37)

> Además de la conexión, también se pueden establecer como Proxy para otras acciones, como subscribirse o publicar. [Ver documentación](https://centrifugal.dev/docs/3/server/proxy#subscribe-proxy)