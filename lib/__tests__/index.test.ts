import { helloWorld } from "../src";

describe("First Test", () => {
  test("Hello World", () => {
    expect(helloWorld()).toBe("Hello World");
  });
});
