const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const components = ['Auth', 'Dashboard', 'OverlapTimeline', 'TaskCard'];

components.forEach(comp => {
    const originalFile = path.join(componentsDir, `${comp}.js`);
    if (!fs.existsSync(originalFile)) return;

    const content = fs.readFileSync(originalFile, 'utf8');
    const styleIndex = content.indexOf('const styles = StyleSheet.create({');

    if (styleIndex === -1) {
        console.log(`No styles found in ${comp}.js`);
        return;
    }

    // Split content
    let logicContent = content.substring(0, styleIndex);
    let styleContent = content.substring(styleIndex);

    // Prepare Style file
    // Add imports needed for StyleSheet if they don't exist. Usually just react-native.
    styleContent = `import { StyleSheet } from 'react-native';\n\n` + styleContent;
    styleContent += `\nexport default styles;\n`;

    // Prepare Logic file
    // Add import styles from './[Name]Styles' after the last import
    const lastImportIndex = logicContent.lastIndexOf('import ');
    const endOfLastImport = logicContent.indexOf('\n', lastImportIndex);
    
    logicContent = logicContent.substring(0, endOfLastImport + 1) +
                   `import styles from './${comp}Styles';\n` +
                   logicContent.substring(endOfLastImport + 1);

    // Convert multi-line arrow functions to named functions
    logicContent = logicContent.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{/g, 'async function $1($2) {');
    logicContent = logicContent.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>\s*\{\n/g, 'function $1($2) {\n');

    // Create folder
    const compDir = path.join(componentsDir, comp);
    if (!fs.existsSync(compDir)) {
        fs.mkdirSync(compDir);
    }

    // Write files
    fs.writeFileSync(path.join(compDir, `${comp}.js`), logicContent);
    fs.writeFileSync(path.join(compDir, `${comp}Styles.js`), styleContent);
    fs.writeFileSync(path.join(compDir, `index.js`), `export { default } from './${comp}';\n`);

    // Delete original file
    fs.unlinkSync(originalFile);
    console.log(`Successfully refactored ${comp}`);
});

console.log('Mobile architecture refactoring complete!');
