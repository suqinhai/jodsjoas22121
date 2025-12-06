// vite-plugin-class-obfuscator-simple.js
const crypto = require('crypto');

// 存储映射
const classMap = new Map();

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
  return {
    name: 'vite-plugin-class-obfuscator-simple',
    enforce: 'pre',

    transform(code, id) {
      // 只处理.vue文件
      if (!id.endsWith('.vue')) {
        return null;
      }

      try {
        let result = code;

        // 1. 处理模板中的静态class
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
                .map(cls => obfuscateClassName(cls))
                .join(' ');

              return `class="${obfuscated}"`;
            }
          );

          result = result.replace(
            /<template>[\s\S]*?<\/template>/,
            `<template>${template}</template>`
          );
        }

        // 2. 处理style标签中的类名
        result = result.replace(
          /<style[^>]*>([\s\S]*?)<\/style>/g,
          (match, styleContent) => {
            let css = styleContent;

            // 替换所有映射的类名
            classMap.forEach((obfuscated, original) => {
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