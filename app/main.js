const Menubar = require('menubar');

const menubar = Menubar();

menubar.on('ready', () => {
  console.log('Application is ready.');
});
