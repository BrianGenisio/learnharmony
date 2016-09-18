const glob = require('glob');
const fs = require('fs');

const frontmatter = require('front-matter');
const markdown = require('marked');
const hljs = require('highlight.js');

markdown.setOptions({highlight: codeHighlighter});

processFolder('content', 'src/content.json');

function processFolder(folder, output) {
    glob(`${folder}/**/*.md`, {}, function (er, files) {
        const content = files.map(file => parseFile(file, folder));
        const json = JSON.stringify(content, null, 4);
        fs.writeFileSync(output, json);
    });
}

function parseFile(file, folder) {
    const content = fs.readFileSync(file, 'utf8');

    try {
        var parsed = frontmatter(content);
    } catch(e) {
       console.log('failed to parse front matter (' + file + '): ' + e.problem + ' line ' + e.problem_mark.line);
    }

    
    parsed.body = markdown(parsed.body);
        
    const result = parsed.attributes;
    result.intro = parsed.body;
    result.source = file;
    result.route = file.replace(`${folder}/`, '').replace('.md', '');

    return result;
}

function codeHighlighter(code, lang) {
    try {
        return hljs.highlight(lang, code).value;
    } catch(e) {
        return hljs.highlightAuto(code).value;
    }
}