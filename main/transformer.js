'use strict'

const nestedRegex = [/^(\s*-\s+.+(\n|$))+/gm,/^(#+)\s+.+(\n|$)/gm,/^(>\s+.+(\n|$))+/gm,]
const regex = /(?<=^|\s)_+(?=\s|$)/g;

const preformattedTextMap = new Map();

const processNested = (md, format) => {

  for (const regex of nestedRegex) { if (md.match(regex)) throw new Error('MARKDOWN SHOULD NOT HAVE NESTED TAGS!'); }
  return false
}

const processTags = (md) => {
  const markdownTags = getTags(md);
  hasNestedAndPairedTags(markdownTags);
}

const getTags = (md) => {
  const markdownTagsRegex = /[\*\`]+/g;
  if (!processUnderScores(md)) throw new Error('MARKDOWN SHOULD NOT HAVE UNCLOSED TAGS!'); return md.match(markdownTagsRegex);
}

const hasNestedAndPairedTags = (tags) => {
  if (!tags) return;
  if (tags.length % 2) throw new Error('MARKDOWN SHOULD NOT HAVE unclosed tags!')
  for (let i = 0; i < tags.length; i+=2) { if (tags[i] !== tags[i+1]) { throw new Error('MARKDOWN HASNESTEDTAGS'); } }
}

function* symbolGenerator() { for (let index = 0; ; index++) { yield Symbol(index); } }
const removeEmptyUnderscores = (md) => { return md.replace(regex, ''); }

function transformToFormat(text, isHtml) {
  const html = text.replace(/\*\*(.*?)\*\*/g, isHtml ? '<b>$1</b>' :'\x1b[1m$1\x1b[0m')
    .replace(/(?<=[ ,.:;\n\t]|^)_(?=\S)(.+?)(?<=\S)_(?=[ ,.:;\n\t]|$)/g, isHtml ? '<i>$1</i>' : '\x1b[3m$1\x1b[0m')
    .replace(/`([^`]+)`/g, isHtml ? '<tt>$1</tt>' : '\x1b[7m$1\x1b[0m');

  const paragraphed = isHtml ? html.replace(/(?:\r\n|\r|\n){2,}/g, '</p><p>') : html;
  const preformatted = returnMarkDown(paragraphed);
  const modifiedPreformatted = preformatted.replace(/```([\s\S]*?)```/g, isHtml ? '<pre>$1</pre>' : '\x1b[7m$1\x1b[0m');
  return isHtml ? '<p>' + modifiedPreformatted + '</p>' : modifiedPreformatted;
}

const removePreformatted = (md) => {
  const hashGenerator = symbolGenerator();
  const preformattedRegex = /```\n([\s\S]*?)\n```/g
  const preformattedText = md.match(preformattedRegex);
  for (const text of preformattedText) {
    let hash = hashGenerator.next();
    preformattedTextMap.set(hash, text);
    md = md.replace(text, hash);
  }
  return md;
}

const returnMarkDown = (md) => {
  for (const [key, value] of preformattedTextMap) { md = md.replace(key,value); }
  return md;
}

const processUnderScores = (markdown) => {
  const underscoreRegex = /_/g;
  const underScoresInUnicodeRegex = /(?<=[^\s.,])_(?=[^\s.,])/g;
  const underScoreTagsRegex = /(?<=[ ,.:;\n\t]|^)_(?=\S)(.+?)(?<=\S)_(?=[ ,.:;\n\t]|$)/g;
  const withoutEmptyUnderScores = removeEmptyUnderscores(markdown);
  const tags = withoutEmptyUnderScores.match(underScoreTagsRegex).join(',')
  const tagsUnderscores = tags.match(underscoreRegex).length;
  const snakeCases = withoutEmptyUnderScores.match(underScoresInUnicodeRegex).length;
  const snakeCasesInTags = tags.match(underScoresInUnicodeRegex).length;
  const validatedUnderscores = tagsUnderscores + snakeCases - snakeCasesInTags;
  return withoutEmptyUnderScores.match(underscoreRegex).length === validatedUnderscores;
}

const transform = (md, format) => {
  const isHtml = format === 'html';
  if (!isHtml && format !== 'console') throw new Error('INCORRECT FORMAT!');

  const formattedText = removePreformatted(md);
  processNested(formattedText)
  processTags(formattedText);
  return transformToFormat(formattedText, isHtml);
}

export { transform };