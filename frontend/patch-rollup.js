import fs from 'fs';
import path from 'path';

const nativeJsPath = path.resolve('node_modules', 'rollup', 'dist', 'native.js');

if (fs.existsSync(nativeJsPath)) {
  let content = fs.readFileSync(nativeJsPath, 'utf8');
  if (!content.includes('@rollup/wasm-node')) {
    const target = 'const nativeModule = requireWithFriendlyError(';
    const replacement = `let nativeModule;\ntry {\n\tnativeModule = requireWithFriendlyError(`;
    const endTarget = 'const { parse, parseAsync';
    const endReplacement = `} catch (e) {\n\ttry {\n\t\tnativeModule = require('@rollup/wasm-node/dist/native.js');\n\t} catch (err) {\n\t\tthrow e;\n\t}\n}\n\nconst { parse, parseAsync`;
    
    if (content.includes(target) && content.includes(endTarget)) {
      content = content.replace(target, replacement);
      content = content.replace(endTarget, endReplacement);
      fs.writeFileSync(nativeJsPath, content, 'utf8');
      console.log('[patch-rollup] Successfully applied wasm fallback to rollup native.js');
    }
  }
}
