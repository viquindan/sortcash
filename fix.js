const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('app');
files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes('`n  const')) {
        c = c.replace(/`n  const/g, '\n  const');
        fs.writeFileSync(f, c);
        console.log('Fixed', f);
    }
});
