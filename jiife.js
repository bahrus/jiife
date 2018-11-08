//@ts-check
const fs = require('fs');
const Terser = require("terser");
function processFile(filePath, newLines){
    const contents = fs.readFileSync(filePath, 'utf8');
    const lines = contents.split('\n');
    let inTaggedLiteral = false;
    lines.forEach(line =>{
        const tl = line.trimLeft();
        if(line.indexOf('import.meta') > -1) return;
        if(line.indexOf('//# sourceMappingURL') > -1) return;
        if(!inTaggedLiteral){
            if(tl.startsWith('import ')) return;
        }
        if(tl.startsWith('export ')){
            newLines.push(line.replace('export ', ''));
        }else{
            newLines.push(line);
        }
        if(line.trimRight().endsWith('`')){
            inTaggedLiteral = true;
        }else if(line.trimRight().endsWith('`;')){
            inTaggedLiteral = false; 
        }
    })
}
let newLines = [];
exports.processFiles = function(filePaths, outputFilePath){
    filePaths.forEach(filePath  =>{
        processFile(filePath, newLines);
    })
    const newContent = `
    //@ts-check
    (function () {
    ${newLines.join('\n')}
    })();  
        `;
    fs.writeFileSync(outputFilePath, newContent, 'utf8');
    const minContent = Terser.minify(newContent).code;
    fs.writeFileSync(outputFilePath.replace('.js', '.min.js'), minContent, 'utf8');
    newLines = [];
}

function addFile(filePath, newLines){
    const contents = fs.readFileSync(filePath, 'utf8');
    const lines = contents.split('\n');
    lines.forEach(line =>{
        newLines.push(line);
    })
}

exports.addFiles = function(filePaths){
    filePaths.forEach(filePath  => {
        addFile(filePath, newLines);
    })
}

