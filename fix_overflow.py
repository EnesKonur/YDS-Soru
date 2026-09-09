import re

with open('app.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Fix openWordModal missing overflow hidden entirely
app_content = app_content.replace('async openWordModal(word) {\n    if (!word) return;\n\n    const modal = document.getElementById("wordInspectorModal");',
                                  'async openWordModal(word) {\n    if (!word) return;\n    document.body.style.overflow = "hidden";\n    document.documentElement.style.overflow = "hidden";\n    const modal = document.getElementById("wordInspectorModal");')

# Fix all other places
app_content = app_content.replace('document.body.style.overflow = "hidden";', 'document.body.style.overflow = "hidden";\n    document.documentElement.style.overflow = "hidden";')
app_content = app_content.replace('document.body.style.overflow = "";', 'document.body.style.overflow = "";\n    document.documentElement.style.overflow = "";')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Done")
