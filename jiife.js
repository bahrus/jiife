//@ts-check
const fs = require('fs')
function processFile(filePath, newLines){
    const contents = fs.readFileSync(filePath, 'utf8');
    const lines = contents.split('\n');
    lines.forEach(line =>{
        const tl = line.trimLeft();
        if(tl.startsWith('import ')) return;
        if(tl.startsWith('export ')){
            newLines.push(line.replace('export ', ''));
        }else{
            newLines.push(line);
        }
        
    })
}
const newLines = [];
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
}
