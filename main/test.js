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

  it('should understand preformatted text', function() {
    const preformattedText = '```\nThis is a **preformatted** text\n```';
    const expectedEscapedOutput = '\x1b[7m\nThis is a **preformatted** text\n\x1b[0m';
    const format = 'console';
    const result = transform(preformattedText, format);
    expect(result).to.equal(expectedEscapedOutput);
  });

  it('should work with empty row', function() { 
    const mdText = '';
    const expectedHtml = '<p></p>';
    const format = 'html';
    const result = transform(mdText, format);
    expect(result).to.equal(expectedHtml);
  });

  it('should throw error on nested tags', function() {
    const mdText = '_Some **nested** text_';
    const format = 'html';
    expect(() => transform(mdText, format)).to.throw('MARKDOWN SHOULD NOT HAVE NESTED TAGS!');
  });

  it('should throw errror on unclosed tags', function() {
    const mdText = 'Some **unclosed text';
    const format = 'html';
    expect(() => transform(mdText, format)).to.throw('MARKDOWN SHOULD NOT HAVE UNCLOSED TAGS!');
  });
});
