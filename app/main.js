const Menubar = require('menubar');
const { globalShortcut } = require('electron');

const menubar = Menubar();

menubar.on('ready', () => {
  console.log('Application is ready.');

  const createClipping = globalShortcut.register('CommandOrControl+!', () => {
    console.log('createClipping');
    menubar.window.webContents.send('create-new-clipping');
  });

  const writeClipping = globalShortcut.register('CmdOrCtrl+Alt+@', () => {
    menubar.window.webContents.send('write-to-clipboard');
  });

  const publishClipping = globalShortcut.register('CmdOrCtrl+Alt+#', () => {
    menubar.window.webContents.send('publish-clipping');
  });

  if (!createClipping) { console.error('Registration failed', 'createClipping'); }
  if (!writeClipping) { console.error('Registration failed', 'writeClipping'); }
  if (!publishClipping) { console.error('Registration failed', 'publishClipping'); }
});

menubar.on('after-create-window', () => {
  menubar.window.loadURL(`file://${__dirname}/index.html`);
});
