import os
import re

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição para limpeza profunda
replacements = [
    # Ícones com fundo colorido sólido -> fundo neutro
    (r'bg-emerald-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-purple-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-orange-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-teal-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-pink-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-amber-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-rose-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-indigo-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-red-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-blue-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-green-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    (r'bg-yellow-500 p-\d+ rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'),
    
    # Gradientes em ícones -> fundo neutro
    (r'bg-gradient-to-br from-emerald-500[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'bg-gradient-to-br from-purple-500[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'bg-gradient-to-br from-orange-500[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'bg-gradient-to-br from-primary[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'bg-gradient-to-br from-green-500[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'bg-gradient-to-br from-yellow-500[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'bg-gradient-to-br from-red-500[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'bg-gradient-to-br from-pink-500[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'bg-gradient-to-br from-teal-500[^"]*rounded-(?:xl|lg)', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    
    # Botões com gradiente -> botões sólidos
    (r'bg-gradient-to-r from-emerald-500[^"]*hover:from-emerald-600[^"]*', 'bg-emerald-600 hover:bg-emerald-700'),
    (r'bg-gradient-to-r from-orange-500[^"]*hover:from-orange-600[^"]*', 'bg-emerald-600 hover:bg-emerald-700'),
    (r'bg-gradient-to-r from-purple-500[^"]*hover:from-purple-600[^"]*', 'bg-emerald-600 hover:bg-emerald-700'),
    (r'bg-gradient-to-r from-primary[^"]*hover:from-primary[^"]*', 'bg-emerald-600 hover:bg-emerald-700'),
    
    # Cards com bordas coloridas -> bordas neutras
    (r'border-2 border-emerald-\d+', 'border border-gray-200 dark:border-gray-700'),
    (r'border-2 border-orange-\d+', 'border border-gray-200 dark:border-gray-700'),
    (r'border-2 border-purple-\d+', 'border border-gray-200 dark:border-gray-700'),
    (r'border-2 border-green-\d+', 'border border-gray-200 dark:border-gray-700'),
    (r'border-2 border-red-\d+', 'border border-gray-200 dark:border-gray-700'),
    (r'border-2 border-amber-\d+', 'border border-gray-200 dark:border-gray-700'),
    (r'border-2 border-pink-\d+', 'border border-gray-200 dark:border-gray-700'),
    (r'border-2 border-teal-\d+', 'border border-gray-200 dark:border-gray-700'),
    
    # Gradientes de fundo em cards -> fundos sólidos
    (r'bg-gradient-to-br from-emerald-50[^"]*dark:from-emerald-950[^"]*', 'bg-white dark:bg-gray-900'),
    (r'bg-gradient-to-br from-orange-50[^"]*dark:from-orange-950[^"]*', 'bg-white dark:bg-gray-900'),
    (r'bg-gradient-to-br from-purple-50[^"]*dark:from-purple-950[^"]*', 'bg-white dark:bg-gray-900'),
    (r'bg-gradient-to-br from-green-50[^"]*dark:from-green-950[^"]*', 'bg-white dark:bg-gray-900'),
    (r'bg-gradient-to-br from-red-50[^"]*dark:from-red-950[^"]*', 'bg-white dark:bg-gray-900'),
    (r'bg-gradient-to-br from-amber-50[^"]*dark:from-amber-950[^"]*', 'bg-white dark:bg-gray-900'),
    (r'bg-gradient-to-br from-pink-50[^"]*dark:from-pink-950[^"]*', 'bg-white dark:bg-gray-900'),
    (r'bg-gradient-to-br from-teal-50[^"]*dark:from-teal-950[^"]*', 'bg-white dark:bg-gray-900'),
    
    # Gradientes de texto -> texto sólido
    (r'bg-gradient-to-r from-emerald-\d+[^"]*bg-clip-text text-transparent', 'text-gray-900 dark:text-white'),
    (r'bg-gradient-to-r from-orange-\d+[^"]*bg-clip-text text-transparent', 'text-gray-900 dark:text-white'),
    (r'bg-gradient-to-r from-purple-\d+[^"]*bg-clip-text text-transparent', 'text-gray-900 dark:text-white'),
    
    # Remover blur decorativo
    (r'<div className="absolute inset-0 bg-[^"]*blur[^"]*" />', ''),
    (r'<div className="absolute inset-0 bg-[^"]*blur[^"]*opacity[^"]*" />', ''),
    
    # Hover com gradiente -> hover simples
    (r'hover:bg-gradient-to-r hover:from-[^"]*hover:to-[^"]*hover:text-white hover:border-transparent', 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'),
    
    # Sombras coloridas -> sombras neutras
    (r'shadow-emerald-\d+/\d+', 'shadow-sm'),
    (r'shadow-purple-\d+/\d+', 'shadow-sm'),
    (r'shadow-orange-\d+/\d+', 'shadow-sm'),
    (r'hover:shadow-emerald-\d+/\d+', 'hover:shadow-md'),
    (r'hover:shadow-purple-\d+/\d+', 'hover:shadow-md'),
    (r'hover:shadow-orange-\d+/\d+', 'hover:shadow-md'),
]

def clean_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Erro em {filepath}: {e}")
        return False

# Processar todos os arquivos
modified_files = []
for directory in directories:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                if clean_file(filepath):
                    modified_files.append(filepath)

print(f"Arquivos modificados: {len(modified_files)}")
for f in modified_files:
    print(f"  - {f}")
