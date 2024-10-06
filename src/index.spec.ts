describe('index', () => {
  it('should import correctly', async () => {
    const SVGJSInlineLoader = (await import('./index.js')).default;
    expect(SVGJSInlineLoader).not.toBeNull();
    expect(typeof SVGJSInlineLoader).toBe('function');
  });
});
