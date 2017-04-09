In the last chapter, we built an application that was effectly an application menu that resided in either the macOS menubar or the Window's system tray. In this chapter's we'll build another version of Clipmaster that has a more application-link interface a la Firesale.

To do this, we'll use `menubar` a well-named library for creating robust menubar—and system tray—applications. The `Tray` module does not officially support renderer processes as menus. `menubar` does this using a trick: the tray icon contains an empty menu. When clicked, it sneakily positions a `BrowserWindow` instances below the icon in order to make it appear that the window is—in fact—connected to the tray icon.

`Menubar` is a constructor that returns an object, which wraps a number of the modules we've used in the past.

One thing you might notice immediately is that we're not requiring `electron`. When we create an instance of `Menubar` it wraps around several Electron modules.

```js
const Menubar = require('menubar');

const menubar = Menubar();

menubar.on('ready', () => {
  console.log('Application is ready.');
});
```

The first thing you might notice here is that `menubar` behaves supiciously similar to `app` in our previous examples.

`menubar` has the following properties and methods:

- `app`: the electron require('app') instance,
- `window`: the electron require('browser-window') instance,
- `tray`: the electron require('tray') instance,
- `positioner`: the electron-positioner instance,
- `setOption(option, value)`: change an option after menubar is created,
- `getOption(option)`: get an menubar option,
- `showWindow()`: show the menubar window,
- `hideWindow()`: hide the menubar window

As you can see, the first three immediately delegate out to modules we've used in the past.

`window` and `tray` in particular point directly to instances of `BrowserWindow` and `Tray` respectively.

