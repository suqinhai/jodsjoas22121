// vite-plugin-class-obfuscator-simple.js
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// 存储映射
const classMap = new Map();

// 全局样式类名集合（从./src/common/style/目录提取）
let globalStyleClasses = new Set();

// 在插件启动时加载全局样式类名
function loadGlobalStyleClasses() {
  const styleDir = path.join(process.cwd(), 'src/common/style');
  
  // 如果目录不存在，直接返回
  if (!fs.existsSync(styleDir)) {
    console.log(`全局样式目录不存在: ${styleDir}`);
    return;
  }

  try {
    // 递归读取所有样式文件
    function readStyleFiles(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          readStyleFiles(fullPath);
        } else if (file.name.endsWith('.css') || 
                   file.name.endsWith('.scss') || 
                   file.name.endsWith('.less') || 
                   file.name.endsWith('.styl')) {
          
          const content = fs.readFileSync(fullPath, 'utf-8');
          extractClassesFromCSS(content);
        }
      }
    }

    // 从CSS内容中提取类名
    function extractClassesFromCSS(css) {
      // 匹配 .className 选择器
      const classRegex = /\.([a-zA-Z_][a-zA-Z0-9_-]*)(?![a-zA-Z0-9_-])/g;
      let match;
      
      while ((match = classRegex.exec(css)) !== null) {
        const className = match[1];
        globalStyleClasses.add(className);
      }
    }

    readStyleFiles(styleDir);
    console.log(`加载了 ${globalStyleClasses.size} 个全局样式类名`);
    // console.log('全局样式类名:', Array.from(globalStyleClasses).slice(0, 10)); // 调试用
    
  } catch (error) {
    console.warn('加载全局样式类名失败:', error);
  }
}

// 混淆函数，生成8位以字母开头的字符串
function obfuscateClassName(original) {
  if (!classMap.has(original)) {
    const hash = crypto.createHash('md5').update(original).digest('hex');
    // 取前7位，前面加上'c'，确保以字母开头
    let hashStr = 'c' + hash.slice(0, 7);
    classMap.set(original, hashStr);
  }
  return classMap.get(original);
}

export default function classObfuscatorSimplePlugin() {
  // 在插件初始化时加载全局样式类名
  loadGlobalStyleClasses();

  return {
    name: 'vite-plugin-class-obfuscator-simple',
    enforce: 'pre',

    transform(code, id) {
      // 1. 跳过非.vue文件
      if (!id.endsWith('.vue')) {
        return null;
      }

      try {
        let result = code;
        
        // 收集script标签中通过DOM方法使用的类名
        const domUsedClasses = new Set();
        
        // 2. 先处理script标签，收集通过DOM方法使用的类名
        const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch) {
          const scriptContent = scriptMatch[1];
          
          // 正则表达式匹配常见的DOM操作方法中的类名
          const domClassPatterns = [
            // querySelector('.classname')
            /\.querySelector\s*\(\s*['"](?:\.([a-zA-Z_][a-zA-Z0-9_-]*))['"]/g,
            // querySelectorAll('.classname')
            /\.querySelectorAll\s*\(\s*['"](?:\.([a-zA-Z_][a-zA-Z0-9_-]*))['"]/g,
            // getElementsByClassName('classname')
            /\.getElementsByClassName\s*\(\s*['"]([a-zA-Z_][a-zA-Z0-9_-]*)['"]/g,
            // 也处理document/element上的这些方法
            /(?:document|el|this\.\$el|refs\.[a-zA-Z_][a-zA-Z0-9_]*|\$\w+)\.(?:querySelector|querySelectorAll)\s*\(\s*['"](?:\.([a-zA-Z_][a-zA-Z0-9_-]*))['"]/g,
            /(?:document|el|this\.\$el|refs\.[a-zA-Z_][a-zA-Z0-9_]*|\$\w+)\.getElementsByClassName\s*\(\s*['"]([a-zA-Z_][a-zA-Z0-9_-]*)['"]/g,
          ];
          
          domClassPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(scriptContent)) !== null) {
              // 匹配到的类名可能在match[1]或match[2]中，取决于正则表达式
              const className = match[1] || match[2];
              if (className) {
                domUsedClasses.add(className);
              }
            }
          });
          
          // 也匹配字符串字面量中的类选择器（更通用的匹配）
          const classSelectorRegex = /['"](?:\.([a-zA-Z_][a-zA-Z0-9_-]+))['"]/g;
          let selectorMatch;
          while ((selectorMatch = classSelectorRegex.exec(scriptContent)) !== null) {
            const className = selectorMatch[1];
            if (className && scriptContent.includes('querySelector') || 
                scriptContent.includes('querySelectorAll') ||
                scriptContent.includes('getElementsByClassName')) {
              // 检查上下文是否确实是DOM方法调用
              const startIndex = Math.max(0, selectorMatch.index - 50);
              const context = scriptContent.substring(startIndex, selectorMatch.index);
              if (context.includes('querySelector') || 
                  context.includes('querySelectorAll') || 
                  context.includes('getElementsByClassName')) {
                domUsedClasses.add(className);
              }
            }
          }
        }
        
        console.log(`在文件 ${path.basename(id)} 中发现 ${domUsedClasses.size} 个DOM方法使用的类名:`, 
          Array.from(domUsedClasses));

        // 3. 处理模板中的静态class
        const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
        if (templateMatch) {
          let template = templateMatch[1];

          // 替换静态class属性
          template = template.replace(
            /\bclass="([^"{}\[\]\:]*?)"/g,
            (match, classString) => {
              if (!classString.trim()) {
                return match;
              }

              const classes = classString.trim().split(/\s+/);
              const obfuscated = classes
                .map(cls => {
                  // 如果类名在全局样式中存在，则不混淆
                  if (globalStyleClasses.has(cls)) {
                    return cls;
                  }
                  // 如果类名在DOM方法中使用，也不混淆
                  if (domUsedClasses.has(cls)) {
                    return cls;
                  }
                  return obfuscateClassName(cls);
                })
                .join(' ');

              return `class="${obfuscated}"`;
            }
          );

          result = result.replace(
            /<template>[\s\S]*?<\/template>/,
            `<template>${template}</template>`
          );
        }

        // 4. 处理style标签中的类名
        result = result.replace(
          /<style[^>]*>([\s\S]*?)<\/style>/g,
          (match, styleContent) => {
            let css = styleContent;

            // 替换所有映射的类名（除了全局样式类名和DOM方法使用的类名）
            classMap.forEach((obfuscated, original) => {
              // 跳过全局样式类名
              if (globalStyleClasses.has(original)) {
                return;
              }
              // 跳过DOM方法使用的类名
              if (domUsedClasses.has(original)) {
                return;
              }
              
              // 使用正则表达式匹配类选择器，注意要匹配完整的类名
              const regex = new RegExp(`\\.${original}(?![a-zA-Z0-9_\\-])`, 'g');
              css = css.replace(regex, `.${obfuscated}`);
            });

            return match.replace(styleContent, css);
          }
        );

        return {
          code: result,
          map: null
        };
      } catch (error) {
        console.warn(`处理文件 ${id} 时出错:`, error);
        return null;
      }
    }
  };
}