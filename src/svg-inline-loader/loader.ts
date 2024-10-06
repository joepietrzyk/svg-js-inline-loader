import type { LoaderContext } from 'webpack';
import { XMLParser } from 'fast-xml-parser';

/**
 * A loader that transforms a .svg file to document.createElement commands instead.
 *
 * @param content - the contents of the file to be transformed
 */
export function SVGJSInlineLoader(this: LoaderContext<object>, content: string): string {
  if (this.cacheable) this.cacheable();

  const parser = new XMLParser();
  const xSvg = parser.parse(content);

  return content;
}
