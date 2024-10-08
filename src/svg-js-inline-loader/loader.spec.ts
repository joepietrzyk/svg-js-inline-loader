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
});
