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

### Getting to the Developer Tools

(Show readers how to get to the developer tools.)

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

### Removing Clipboard Contents

Clippings are going to come and go and we don't necessarily want to worry about memory leaks, so let's use event delegation.

Events will bubble up from the button to the clippings list.

When the even hints our listener, we'll look at where it came from and decide what to do.

```js
clippingsList.addEventListener('click', (event) => {
  const hasClass = className => event.target.classList.contains(className);
  if (hasClass('remove-clipping')) console.log('Remove clipping');
  if (hasClass('copy-clipping')) console.log('Copy clipping');
  if (hasClass('publish-clipping')) console.log('Publish clipping');
});
```

Okay, now, let's traverse up and remove the node entirely.

```js
const removeClipping = (target) => {
  target.parentNode.parentNode.remove();
};
```

```js
clippingsList.addEventListener('click', (event) => {
  const hasClass = className => event.target.classList.contains(className);
  if (hasClass('remove-clipping')) removeClipping(event.target);
  if (hasClass('copy-clipping')) console.log('Copy clipping');
  if (hasClass('publish-clipping')) console.log('Publish clipping');
});
```

Alright nice. Now, let's go ahead and get the other two buttons working.

These buttons share something in common, they both need the text from inside the element. So, let's write a helper function for that case.

In fact, all of them need the parent in some regard, in an effort to keep our code dry and maintainable, let's give outselves some helper functions.

```js
const getButtonParent = (target) => {
  return target.parentNode.parentNode;
};

const getClippingText = (clippingListItem) => {
  return clippingListItem.querySelector('.clipping-text').innerText;
};
```

Now we can do some refactoring

```js
const removeClipping = (target) => {
  getButtonParent().remove();
};
```

```js
clippingsList.addEventListener('click', (event) => {
  const hasClass = className => event.target.classList.contains(className);
  
  const clippingListItem = (getButtonParent(event));

  if (hasClass('remove-clipping')) removeClipping(clippingListItem);
  if (hasClass('copy-clipping')) console.log('Copy clipping', getClippingText(clippingListItem));
  if (hasClass('publish-clipping')) console.log('Publish clipping', getClippingText(clippingListItem));;
});
```

### Writing the Text Back to the Clipboard

```js
const writeToClipboard = (clippingText) => {
  clipboard.writeText(clippingText);
};
```

```js
clippingsList.addEventListener('click', (event) => {
  const hasClass = className => event.target.classList.contains(className);

  const clippingListItem = (getButtonParent(event));

  if (hasClass('remove-clipping')) removeClipping(clippingListItem);
  if (hasClass('copy-clipping')) writeToClipboard(getClippingText(clippingListItem));
  if (hasClass('publish-clipping')) console.log('Publish Clipping', getClippingText(clippingListItem));
});
```

### Publishing Clippings

```js
const request = require('request');
```


It'd be nice to configure `request` with some defaults.

```js
const request = require('request').defaults({
  url: 'https://api.github.com/gists',
  headers: { 'User-Agent': 'Clipmaster 9000' }
});
```

The Gist API expects a JSON payload, so let's create a helper function.

```js
const toJSON = (clippingText) => {
  return {
    body: JSON.stringify({
      description: "Created with Clipmaster 9000",
      public: "true",
      files:{
        "clipping.txt": { content: clippingText }
      }
    })
  }
}
```

Cool, let's wrap this up in a function.

```js
const publishClipping = (clippingText) => {
  request.post(toJSON(clippingText), (err, response, body) => {
    if (err) { return alert(JSON.parse(err).message); }

    const gistUrl = JSON.parse(body).html_url;

    alert(gistUrl);
    clipboard.writeText(gistUrl);
  });
};
```

```js
clippingsList.addEventListener('click', (event) => {
  const hasClass = className => event.target.classList.contains(className);

  const clippingListItem = (getButtonParent(event));

  if (hasClass('remove-clipping')) removeClipping(clippingListItem);
  if (hasClass('copy-clipping')) writeToClipboard(getClippingText(clippingListItem));
  if (hasClass('publish-clipping')) publishClipping(getClippingText(clippingListItem));
});
```

### Pulling back in Notifications

Okay, that `alert` isn't very graceful, is it?

Let's bring back notifications, but let's also build on what we did in the last chapter.

```js
const { clipboard, shell } = require('electron');
```

```js
const publishClipping = (clippingText) => {
  request.post(toJSON(clippingText), (err, response, body) => {
    if (err) {
      return new Notification('Error Publishing Your Clipping', {
        body: JSON.parse(err).message
      });
    }

    const gistUrl = JSON.parse(body).html_url;
    const notification = new Notification('Your Clipping Has Been Published', {
      body: `Click to open ${gistUrl} in your browser.`
    });

    notification.onclick = shell.openExternal(gistUrl);

    clipboard.writeText(gistUrl);
  });
};
```

### Adding Global Shortcuts

Electron can register global shortcuts with the operating system. Let's take this for a spin in `main.js`.

We'll start by creating a reference to Electron `globalShortcut` module.

```js
const { globalShortcut } = require('electron');
```

When the `ready` event is fired, we'll register our shortcut.

```js
menubar.on('ready', function () {
  console.log('Application is ready.');

  const createClipping = globalShortcut.register('CommandOrControl+!', () => {
    console.log('This will eventually trigger creating a new clipping.');
  });

  if (!createClipping) { console.error('Registration failed', 'createClipping'); }
});
```

In our specific application, all of our clippings are managed by the renderer process. So, when the global shortcut is hit, we'll have to let the renderer process know.

Let's modify the event listener to send a message to the renderer process.

```js
const createClipping = globalShortcut.register('CommandOrControl+!', () => {
  menubar.window.webContents.send('create-new-clipping');
});

const writeClipping = globalShortcut.register('CmdOrCtrl+Alt+@', () => {
  menubar.window.webContents.send('write-to-clipboard');
});

const publishClipping = globalShortcut.register('CmdOrCtrl+Alt+#', () => {
  menubar.window.webContents.send('publish-clipping');
});
```

In `renderer.js`, we'll listen for this message. First, we'll require the `ipcRenderer` module.

```js
const { clipboard, ipcRenderer, shell } = require('electron');
```

We'll then listen for an event on the `create-new-clipping` channel.

```js
ipcRenderer.on('create-new-clipping', (event) => {
  addClippingToList();
  new Notification('Clipping Added', {
    body: `${clipboard.readText()}`
  });
});

ipcRenderer.on('write-to-clipboard', (event) => {
  const clipping = clippingsList.firstChild;
  writeToClipboard(getClippingText(clipping);
});

ipcRenderer.on('publish-clipping', (event) => {
  const clipping = clippingsList.firstChild;
  publishClipping(getClippingText(clipping);
});
```
