import re
with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'optBtn\.innerHTML = `\s*<span class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">\s*\$\{key\}\s*<\/span>\s*<div class="flex-1 pt-0\.5 text-gray-800 dark:text-gray-100 leading-relaxed font-medium break-words min-w-0">\s*\$\{interactiveOptText\}\s*<\/div>\s*\$\{badgeHtml\}\s*`;'

replacement = """optBtn.innerHTML = `
<div class="flex flex-col w-full min-w-0">
  ${badgeHtml ? `<div class="w-full flex justify-start sm:justify-end mb-2">${badgeHtml}</div>` : ''}
  <div class="flex items-start gap-3 w-full">
    <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors mt-0.5">
      ${key}
    </span>
    <div class="flex-1 text-gray-800 dark:text-gray-100 leading-relaxed font-medium break-words min-w-0 pt-1">
      ${interactiveOptText}
    </div>
  </div>
</div>
`;"""

content = re.sub(pattern, replacement, content)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
