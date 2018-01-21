const Application = require('spectron').Application;
const path = require('path');


let electronPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  'electron'
);

if (process.platform === 'win32') {
  electronPath += '.cmd';
}

describe('Clipmaster 9000', () => {
  let app;

  beforeEach(() => {
    app = new Application({
      path: electronPath,
      args: [path.join(__dirname, './main.js')]
    });
    return app.start();
  });

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it('shows an initial window', async () => {
    const count = await app.client.getWindowCount();
    return expect(count).toEqual(1);
  });

  it('has the correct title', async () => {
    const title = await app.client.waitUntilWindowLoaded().getTitle();
    return expect(title).toEqual('Clipmaster 9000');
  });

  it('does not have the developer tools open', async () => {
    const devToolsAreOpen = await app.client
      .waitUntilWindowLoaded()
      .browserWindow.isDevToolsOpened();
    return expect(devToolsAreOpen).toBe(false);
  });

  it('has a button with the text "Copy from Clipboard"', async () => {
    const buttonText = await app.client.getText('#copy-from-clipboard');
    return expect(buttonText).toBe('Copy from Clipboard');
  });

  it('should not have any clippings when the application starts up', async () => {
    await app.client.waitUntilWindowLoaded();
    const clippings = await app.client.$$('.clippings-list-item');
    return expect(clippings.length).toBe(0);
  });

  it('should have one clipping when the "Copy From Clipboard" button has been pressed', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client.click('#copy-from-clipboard');
    const clippings = await app.client.$$('.clippings-list-item');
    return expect(clippings.length).toBe(1);
  });

  it('should successfully remove a clipping', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.client
      .click('#copy-from-clipboard')
      .moveToObject('.clippings-list-item')
      .click('.remove-clipping');
    const clippings = await app.client.$$('.clippings-list-item');
    return expect(clippings.length).toBe(0);
  });

  it('should have the correct text in a new clipping', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.electron.clipboard.writeText('Vegan Ham');
    await app.client.click('#copy-from-clipboard');
    const clippingText = await app.client.getText('.clipping-text');
    return expect(clippingText).toBe('Vegan Ham');
  });

  it('it should write the text of the clipping to the clipboard', async () => {
    await app.client.waitUntilWindowLoaded();
    await app.electron.clipboard.writeText('Vegan Ham');
    await app.client.click('#copy-from-clipboard');
    await app.electron.clipboard.writeText('Something totally different');
    await app.client.click('.copy-clipping');
    const clipboardText = await app.electron.clipboard.readText();
    return expect(clipboardText).toBe('Vegan Ham');
  });

});
