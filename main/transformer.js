'use strict'

const nestedRegex = [/^(\s*-\s+.+(\n|$))+/gm,/^(#+)\s+.+(\n|$)/gm,/^(>\s+.+(\n|$))+/gm,]
const regex = /(?<=^|\s)[_(\*\*)`]+(?=\s|$)/g;

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
  const markdownTagsRegex = /(?<=[a-zA-Z])(\*\*|`|_)(?![a-zA-Z])|(?<![a-zA-Z])(\*\*|`|_)(?=[a-zA-Z])/g;
  if (!processUnderScores(md)) throw new Error('MARKDOWN SHOULD NOT HAVE UNCLOSED TAGS!'); return md.match(markdownTagsRegex);
}

const hasNestedAndPairedTags = (tags) => {
  if (!tags) return;
  if (tags.length % 2) throw new Error('MARKDOWN SHOULD NOT HAVE UNCLOSED TAGS!');
  for (let i = 0; i < tags.length; i+=2) { if (tags[i] !== tags[i+1]) { throw new Error('MARKDOWN SHOULD NOT HAVE NESTED TAGS!'); } }
}

function* symbolGenerator() { for (let index = 0; ; index++) { yield Symbol(index); } }
const removeEmptyUnderscores = (md) => { return md.replace(regex, ''); }

function transformToFormat(text) {
  const html = text.replace(/(?<=[ ,.:;\n\t]|^)\*\*(?=\S)(.+?)(?<=\S)\*\*(?=[ ,.:;\n\t]|$)/g,'<b>$1</b>')
    .replace(/(?<=[ ,.:;\n\t]|^)_(?=\S)(.+?)(?<=\S)_(?=[ ,.:;\n\t]|$)/g,'<i>$1</i>')
    .replace(/(?<=[ ,.:;\n\t]|^)`(?=\S)(.+?)(?<=\S)`(?=[ ,.:;\n\t]|$)/g,'<tt>$1</tt>');

  const paragraphed =html.replace(/(?:\r\n|\r|\n){2,}/g, '</p><p>');
  const preformatted = returnMarkDown(paragraphed);
  const modifiedPreformatted = preformatted.replace(/```([\s\S]*?)```/g,'<pre>$1</pre>');
  return'<p>' + modifiedPreformatted + '</p>';
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
  const tags = withoutEmptyUnderScores.match(underScoreTagsRegex).join(',') || '';
  const tagsUnderscores = tags.match(underscoreRegex).length || 0;
  const snakeCases = withoutEmptyUnderScores.match(underScoresInUnicodeRegex).length || 0;
  const snakeCasesInTags = tags.match(underScoresInUnicodeRegex).length || 0;
  const validatedUnderscores = tagsUnderscores + snakeCases - snakeCasesInTags || 0;
  return withoutEmptyUnderScores.match(underscoreRegex)?.length || 0 === validatedUnderscores;
}

const transform = (md) => {
  const formattedText = removePreformatted(md);
  processNested(formattedText);
  processTags(formattedText);
  return transformToFormat(formattedText);
}

export { transform };