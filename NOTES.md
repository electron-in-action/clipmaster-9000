In the last chapter, we built an application affectionately titled Clipmaster. It was a simple menu that resided in either macOS's menubar or the Window's system tray. In this chapter's we'll build a second version of Clipmaster. This time it will have a more compelling, web-based, user interface.

(Here, I should show the completed application and describe how it's different from the previous version and why this is unique.)

In order to acomplish this, we'll use `menubar`, a well-named library for creating robust menubar—and system tray—applications. The `Tray` module does not officially support renderer processes as menus. `menubar` does this using a trick: the tray icon contains an empty menu. When clicked, it sneakily positions a `BrowserWindow` instances below the icon in order to make it appear that the window is—in fact—connected to the tray icon.

`Menubar` is a constructor that returns an object, which wraps a number of the modules we've used in the past.

One thing you might notice immediately is that we're not requiring `electron`. When we create an instance of `Menubar` it wraps around several Electron modules.

```js
const Menubar = require('menubar');

const menubar = Menubar();

menubar.on('ready', () => {
  console.log('Application is ready.');
});
```

(Okay, show users that we can click on this and see a blank window.)

(Explain what's going on here with `electron-positioner` and the `BrowserWindow` instance.)

(TK: Research what is actually fucking happening here.)

### Exploring the Menubar Module

The first thing you might notice here is that `menubar` behaves supiciously similar to `app` in our previous examples.

`menubar` has the following properties and methods:

- `app`: the `electron.app` instance,
- `window`: the `electron.browser-window` instance,
- `tray`: the `electron.tray` instance,
- `positioner`: the `electron-positioner` instance,
- `setOption(option, value)`: change an option after menubar is created,
- `getOption(option)`: get an menubar option,
- `showWindow()`: show the menubar window,
- `hideWindow()`: hide the menubar window

As you can see, the first three immediately delegate out to modules we've used in the past.

`window` and `tray` in particular point directly to instances of `BrowserWindow` and `Tray` respectively.

As we alluded to just a sentence or two ago, Menubar will create a `BrowserWindow` on our behalf. When it has done so, it will fire an `after-create-window` event. We can listen for this event and load our HTML page accordingly.

### Setting Up the Renderer Process

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Clipmaster 9000</title>
    <link rel="stylesheet" href="style.css" type="text/css">
  </head>
  <body>
    <div class="container">
      <section class="controls">
        <button id="copy-from-clipboard">Copy from Clipboard</button>
      </section>

      <section class="content">
        <div class="clippings-list"></div>
      </section>
    </div>
    <script>
      require('./renderer');
    </script>
  </body>
</html>
```


(Let's punt on the CSS for now and maybe be able to explain what the fuck is happening in there.)

With menubar application up and running, it's time to shift our focus to the implementing the application's primary functionality.

### Next Steps

Okay, so we need a few things in order to get this application off the ground

When the user clicks on the "Copy from Clipboard"  button, we want to read from the clipboard, get the text, create a DOM element to serve as the UI for the element, then we need to put it on the page.

Let's start with creating a DOM element.

```js
const createClippingElement = (clippingText) => {
  const clippingElement = document.createElement('article');

  clippingElement.classList.add('clippings-list-item');

  clippingElement.innerHTML = `
    <div class="clipping-text" disabled="true"></div>
    <div class="clipping-controls">
      <button class="copy-clipping">&rarr; Clipboard</button>
      <button class="publish-clipping">Publish</button>
      <button class="remove-clipping">Remove</button>
    </div>
  `;

  clippingElement.querySelector('.clipping-text').innerText = clippingText;

  return clippingElement;
};
```

Okay, what about adding it to the page?

```js
const addClippingToList = () => {
  const clippingText = clipboard.readText();
  const clippingElement = createClippingElement(clippingText);
  clippingsList.prepend(clippingElement);
};
```

And finally, wiring up the button.

```js
copyFromClipboardButton.addEventListener('click', addClippingToList);
```

Cool, so now we can add some buttons onto the page. That's pretty nice.

Cool, so, we've got a pretty solid basis for this application. Let's get some of the basics working here.