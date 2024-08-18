# Desarrollo de extensiones para el Api Neutralino

Mi primera extension desarrollada con GO, para neutralino JS
el objetivo es conectar el API de desarrollo personalizado en 
cualquier lenguaje de programacion.

## Antes de comenzar
Debes asegurarte que la carpeta de extensiones este creada
y colocar el codigo backend alli.

### Recomendacion
utlizar la siguiente estructuras de capetas para crear extensiones

```
    extensions/
        extension_name/
            bin/  # solo si se utiliza lenguajes de programacion que compilan a binario
                linux/  # ejecutables linux
                mac/    # ejecutables mac
                win/    # ejecutables win
            src/ # codigo fuente de tu extension
```

una vez estruturado tu extension debes configurar el neutralino.config.json con la 
siguente estructura para realizar la conexion:

```
    "enableExtensions": true, # activa las extensiones
    "nativeAllowList": [
        "app.*",
        "extensions.*"  # habilita libreria de extensiones de Neutralino. 
    ],
    "extensions": [
        {
            "id": "js.neutralino.sampleextension",
            "commandLinux": "${NL_PATH}/extensions/sampleextension/bin/linux/ext_bin",
            "commandDarwin": "${NL_PATH}/extensions/sampleextension/bin/mac/ext_bin",
            "commandWindows": "${NL_PATH}/extensions/sampleextension/bin/win/ext_bin.exe"
        },
        {   # en caso de utilizar un lenguaje interpretado
            "id": "js.neutralino.binaryextension",
            "command": "node ${NL_PATH}/extensions/binary/main.js",
        }
    ]
    "cli" : {
        "extensionsPath": "/extensions/", # ruta de las extensiones
        ...resto de propiedades
    }
    ...resto de propiedades
```

## Como evaluar si la conexion con la extension se realizo correctamente
Desde la codigo del lado navegador puedes colocar la siguente bloque de codigo
dentro de una funcion asincrona para comprobar la conexion:

```
    (async () => {
        try {
            // verificamos el listado de extensiones en la app
            let stats = await Neutralino.extensions.getStats();
            console.log({
                message: 'Extension conectada con éxito',
                stats
            })

            // mandamos a la extension
            await Neutralino.extensions.dispatch(extension, event, 'hello extension!!');
        
        } catch (error) {
            console.error(error);

        }
    })();
```

