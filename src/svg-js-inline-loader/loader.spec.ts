import { SVGJSInlineLoader, type SVGJSInlineLoaderOptions } from './loader.js';
import { type LoaderContext } from 'webpack';

// Mock for LoaderContext (from Webpack)
const mockLoaderContext: Partial<LoaderContext<SVGJSInlineLoaderOptions>> = {
  cacheable: jest.fn(), // Mocking the cacheable function
  getOptions: jest.fn(() => ({ cjsModule: false })), // Mocking getOptions to return options with module set to true
};

function createContext() {
  return mockLoaderContext as unknown as LoaderContext<SVGJSInlineLoaderOptions>;
}

describe('SVGJSInlineLoader', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should output CJS compatible code when cjsModule=true', () => {
    const svg = '<svg></svg>';
    mockLoaderContext.getOptions = jest.fn(() => ({ cjsModule: true }));
    const actualOutput = SVGJSInlineLoader.call(createContext(), svg);
    expect(actualOutput).toContain('module.exports');
  });

  it('should default to ESM compatible code', () => {
    const svg = '<svg></svg>';
    mockLoaderContext.getOptions = jest.fn(() => ({}));
    const actualOutput = SVGJSInlineLoader.call(createContext(), svg);
    expect(actualOutput).toContain('export default');
  });

  it('should output ESM compatible code when cjsModule=false', () => {
    const svg = '<svg></svg>';
    mockLoaderContext.getOptions = jest.fn(() => ({ cjsModule: false }));
    const actualOutput = SVGJSInlineLoader.call(createContext(), svg);
    expect(actualOutput).toContain('export default');
  });

  it('should error when an invalid SVG is passed in', () => {
    const notSVG = '<div><span>not an SVG!</span></div>';
    mockLoaderContext.getOptions = jest.fn(() => ({ cjsModule: true }));
    expect(() => {
      SVGJSInlineLoader.call(createContext(), notSVG);
    }).toThrow();
  });

  it("should invoke 'this.cacheable'", () => {
    const svg = '<svg></svg>';
    mockLoaderContext.getOptions = jest.fn(() => ({ cjsModule: false }));
    SVGJSInlineLoader.call(createContext(), svg);
    expect(mockLoaderContext.cacheable).toHaveBeenCalled();
  });
});

describe('handleElement', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should add attributes on the root node', () => {
    const svg = '<svg test="hi"></svg>';
    const output = SVGJSInlineLoader.call(createContext(), svg);
    expect(output).toContain("s.setAttribute('test','hi')");
  });

  it('should add child elements', () => {
    const svg = '<svg><div></div></svg>';
    const output = SVGJSInlineLoader.call(createContext(), svg);
    expect(output).toContain(".createElement('div');p.appendChild(e)");
  });

  it('should add attributes on child elements', () => {
    const svg = '<svg><div test="hi"></div></svg>';
    const output = SVGJSInlineLoader.call(createContext(), svg);
    expect(output).toContain(".createElement('div');p.appendChild(e)");
    expect(output).toContain("e.setAttribute('test','hi')");
  });

  it('should handle the root element having an attribute and child element', () => {
    const svg = '<svg one="1"><div></div></svg>';
    const output = SVGJSInlineLoader.call(createContext(), svg);
    expect(output).toContain("s.setAttribute('one','1')");
    expect(output).toContain(".createElement('div');p.appendChild(e)");
  });

  it('should only assign p=s once', () => {
    const svg = '<svg one="1" two="2"><div three="3"></div><div four="4"></div></svg>';
    const output = SVGJSInlineLoader.call(createContext(), svg);
    const count = output.split('p=s').length - 1;
    expect(count).toBe(1);
  });

  it('should handle a real SVG', () => {
    const svg =
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">' +
      '    <circle cx="100" cy="100" r="100" fill="#5865F2" />' +
      '    <path d="M 75 150 h -20 a 5 5 0 0 1 -5 -5 v -27 a 0 0 0 0 0 -10 -5 a 0 0 0 0 0 10 -5 v -27 a 5 5 0 0 1 5 -5 h 20" stroke="white" stroke-width="10" fill ="none" />' +
      '    <path d="M 125 150 h 20 a 5 5 0 0 0 5 -5 v -27 a 0 0 0 0 0 10 -5 a 0 0 0 0 0 -10 -5 v -27 a 5 5 0 0 0 -5 -5 h -20" stroke="white" stroke-width="10" fill ="none" />' +
      '    <line x1="100" y1="41" x2="100" y2="113" stroke="white" stroke-width="10" stroke-linecap="round" />' +
      '    <path d="M 100 41 l 18 18" stroke="white" stroke-width="10" stroke-linecap="round"/>' +
      '    <path d="M 100 41 l -18 18" stroke="white" stroke-width="10" stroke-linecap="round"/>' +
      '</svg>';
    const output = SVGJSInlineLoader.call(createContext(), svg);
    console.log(output);
  });
});
