import {app, init, events, extensions, storage} from '@neutralinojs/lib';

export const extension = 'js.neutralino.filepath';

init();

events.on('windowClose', () => {
  app.exit();
});

events.on('getHomeDirectory', async ({detail: homeDirectory}: CustomEvent<string>) => {
  sessionStorage.setItem('home_directory', homeDirectory);
  
  // establece el path join
  await extensions.dispatch(extension, 'join', [homeDirectory, 'neu-files']);
});

events.on('join', async ({detail: path}: CustomEvent<string>) => {
  sessionStorage.setItem('path', path);
});

// establece el directorio del usuario
extensions.dispatch(extension, 'getHomeDirectory', null);