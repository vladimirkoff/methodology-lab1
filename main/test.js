import { expect } from 'chai';
import { transform } from './transformer.js';

describe('transform', function() {
  it('should convert Markdown to HTML', function() {
    const mdText = '_Some_ **text**';
    const expectedHtml = '<p><i>Some</i> <b>text</b></p>';
    const format = 'html';
    const result = transform(mdText, format);
    expect(result).to.equal(expectedHtml);
  });

  it('should escape console output', function() {
    const consoleOutput = '_Some_ **text**';
    const expectedEscapedOutput = '\x1b[3mSome\x1b[0m \x1b[1mtext\x1b[0m';
    const format = 'console';
    const result = transform(consoleOutput, format);
    expect(result).to.equal(expectedEscapedOutput);
  });
});
