import type { LoaderContext } from 'webpack';
import { XMLParser } from 'fast-xml-parser';

/**
 * The options to pass to the SVGJSInlineLoader
 */
export type SVGJSInlineLoaderOptions = {
  /**
   * Set to true to output CJS modules. Defaults to ESM modules.
   */
  cjsModule?: boolean;
};

export type XMLObject = {
  [key: string]: XMLObject[] | string;
};

/**
 * A loader that transforms a .svg file to a function that inserts it using document.createElement commands.
 * @param content - the contents of the file to be transformed
 */
export function SVGJSInlineLoader(this: LoaderContext<SVGJSInlineLoaderOptions>, content: string): string {
  if (this.cacheable) this.cacheable();
  const options = this.getOptions();

  const output: string[] = [];
  if (options.cjsModule) {
    output.push('module.exports=function(){');
  } else {
    output.push('export default function(){');
  }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', preserveOrder: true });
  const svg = parser.parse(content) as XMLObject[] | null;
  if (!svg || !Object.keys(svg[0]).includes('svg')) {
    throw new Error('Unable to parse SVG');
  }
  output.push("const s=document.createElement('svg');");
  handleElement(svg[0], 'svg', output, { val: true });
  output.push('return s;');
  output.push('}');
  return output.join('');
}

interface RootTracker {
  val: boolean;
  hasAdded?: boolean;
}

/**
 * Processes the current element, adding all of its attributes and children recursively to the output array.
 * @param el - the element to process
 * @param elName - the name of the element
 * @param output - the output array to push the lines of JavaScript to
 * @param isRoot - is this the root element?
 */
export function handleElement(el: XMLObject | string | null, elName: string, output: string[], isRoot: RootTracker) {
  if (el === null) return;
  let v = isRoot.val ? 's' : 'e';
  if (typeof el === 'string') {
    output.push(`${v}.setAttribute('${elName}', '${el}');`);
    return;
  }
  if (el[':@']) {
    Object.keys(el[':@']).forEach(a => {
      // @ts-ignore
      output.push(`${v}.setAttribute('${a}','${el[':@'][a]}');`);
    });
  }
  if (el[elName]) {
    Object.keys(el[elName]).forEach(i => {
      // @ts-ignore
      Object.keys(el[elName][i]).forEach(key => {
        v = isRoot.val ? 's' : 'e';
        output.push(`${isRoot.val ? 'let ' : ''}p=${v};`);
        output.push(`${isRoot.val ? 'let ' : ''}e=document.createElement('${key}');`);
        output.push('p.appendChild(e);');
        isRoot.val = false;
        // @ts-ignore
        handleElement(el[elName][i], key, output, isRoot);
      });
    });
  }
}
