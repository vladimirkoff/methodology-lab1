'use strict'

const nestedRegex = [/^(\s*-\s+.+(\n|$))+/gm,/^(#+)\s+.+(\n|$)/gm,/^(>\s+.+(\n|$))+/gm,]
const regex = /(?<=^|\s)_+(?=\s|$)/g;

const preformattedTextMap = new Map();

const processNested = (md) => {
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

function transformToHtml(text) {
  const html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/(?<=[ ,.:;\n\t]|^)_(?=\S)(.+?)(?<=\S)_(?=[ ,.:;\n\t]|$)/g, '<i>$1</i>').replace(/`([^`]+)`/g, '<tt>$1</tt>').replace(/(?:\r\n|\r|\n){2,}/g, '</p><p>')
  const preformatted = returnMarkDown(html);
  const modifiedPreformatted = preformatted.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
  return '<p>' + modifiedPreformatted + '</p>';
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

const transform = (md) => {
  const formattedText = removePreformatted(md);
  processNested(formattedText)
  processTags(formattedText);
  return transformToHtml(formattedText)
}

export { transform };