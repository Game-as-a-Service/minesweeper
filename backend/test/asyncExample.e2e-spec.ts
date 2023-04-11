// [Testing Asynchronous Code · Jest](https://jestjs.io/docs/asynchronous)
// [Promise - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
// [Using promises - JavaScript | MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises)
// [TypeScript Promise - Scaler Topics](https://www.scaler.com/topics/typescript/typescript-promise/)
describe.skip('Testing Asynchronous Code', () => {
  // beforeAll(async () => {});

  // afterAll(async () => {});

  // beforeEach(() => {});

  // afterEach(() => {});

  const fetchData = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise<string>(function (resolve, reject) {
      setTimeout(function (): void {
        resolve('peanut butter');
      }, 1000);
    });
  };

  // Chaining 方式
  it('the data is peanut butter', () => {
    return fetchData().then((data) => {
      expect(data).toBe('peanut butter');
    });
  });

  // Await / Async 方式
  it('the data is peanut butter', async () => {
    const data = await fetchData();

    expect(data).toBe('peanut butter');
  });
});
