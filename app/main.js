const Menubar = require('menubar');

const menubar = Menubar();

menubar.on('ready', () => {
  console.log('Application is ready.');
});

menubar.on('after-create-window', () => {
  menubar.window.loadURL(`file://${__dirname}/index.html`);
});
