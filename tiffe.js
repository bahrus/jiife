//@ts-check
const fs = require('fs');
function processFile(filePath, newLines){
    const contents = fs.readFileSync(filePath, 'utf8');
    const lines = contents.split('\n');
    let inTaggedLiteral = false;
    const constants = {};
    const types = {};
    lines.forEach(line =>{
        if(line.startsWith('const ')){
            const parsed = line.split(' ');
            const newConst = parsed[1];
            if(constants[newConst]) return;
            constants[newConst] = true;
        }else if(line.startsWith('type ')){
            if(types[line]) return;
            types[line] = true;
        }
        const tl = line.trimLeft();
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
    const newContent =  `
    (function () {
    ${newLines.join('\n')}
    })();  
        `;
    fs.writeFileSync(outputFilePath, newContent, 'utf8');
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

