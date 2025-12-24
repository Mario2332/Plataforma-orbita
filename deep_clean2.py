import os
import re

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição mais específicos
replacements = [
    # Ícones com fundo colorido sólido específicos
    (r'p-3 bg-orange-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-emerald-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-purple-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-teal-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-pink-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-amber-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-rose-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-indigo-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-red-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-blue-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-green-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'p-3 bg-yellow-500 rounded-xl shadow-sm', 'p-3 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    
    # p-4 variants
    (r'p-4 bg-orange-500 rounded-lg shadow-sm', 'p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'p-4 bg-emerald-500 rounded-lg shadow-sm', 'p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'p-4 bg-purple-500 rounded-lg shadow-sm', 'p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'),
    (r'p-4 bg-teal-500 rounded-lg shadow-sm', 'p-4 bg-gray-100 dark:bg-gray-800 rounded-lg'),
    
    # Gradientes em botões específicos
    (r'bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700', 'bg-emerald-600 hover:bg-emerald-700'),
    (r'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400', 'bg-emerald-600 hover:bg-emerald-700'),
    (r'bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500', 'bg-emerald-600 hover:bg-emerald-700'),
    (r'bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl shadow-sm', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'bg-gradient-to-br from-emerald-900/50 to-teal-900/50', 'bg-gray-900'),
    (r'bg-gradient-to-br from-emerald-950 via-indigo-950 to-teal-950', 'bg-gray-950'),
    
    # Gradientes de fundo específicos
    (r'bg-gradient-to-r from-teal-500/20 to-emerald-500/20', 'bg-gray-100 dark:bg-gray-800'),
    (r'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20', 'bg-gray-100 dark:bg-gray-800'),
    
    # Hover com gradiente
    (r'hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent', 'hover:bg-gray-50 dark:hover:bg-gray-800'),
    
    # Sombras coloridas
    (r'shadow-sm shadow-teal-500/50', 'shadow-sm'),
    (r'shadow-sm shadow-emerald-500/50', 'shadow-sm'),
    
    # Barras de progresso coloridas -> neutras
    (r'h-full bg-orange-500 rounded-full', 'h-full bg-emerald-500 rounded-full'),
    
    # Ícones com fundo colorido em cards
    (r'bg-emerald-500 rounded-xl shadow', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'bg-purple-500 rounded-xl shadow', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'bg-amber-500 rounded-xl shadow', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'bg-rose-500 rounded-xl shadow', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'bg-pink-500 rounded-xl shadow', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    (r'bg-indigo-500 rounded-xl shadow', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    
    # Bordas coloridas
    (r'border-2 border-indigo-500', 'border border-gray-200 dark:border-gray-700'),
    (r'border border-emerald-500/30', 'border border-gray-200 dark:border-gray-700'),
    (r'border border-gray-200 dark:border-gray-700/30', 'border border-gray-200 dark:border-gray-700'),
    
    # Ping animations
    (r'bg-teal-500 rounded-full animate-ping', 'bg-emerald-500 rounded-full'),
    
    # Botões específicos
    (r'hover:bg-emerald-500 hover:text-white', 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'),
    (r'hover:bg-indigo-500 hover:text-white', 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'),
    
    # Hover em ícones
    (r'hover:bg-emerald-500/20 hover:text-emerald-600', 'hover:bg-gray-100 dark:hover:bg-gray-800'),
    
    # Gradientes de texto
    (r'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500', 'text-emerald-600 dark:text-emerald-400'),
    (r'bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-500', 'text-gray-900 dark:text-white'),
    (r'bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500', 'text-emerald-600 dark:text-emerald-400'),
    
    # Fundos específicos do modo foco
    (r'bg-teal-500/20', 'bg-gray-100 dark:bg-gray-800'),
]

def clean_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        for pattern, replacement in replacements:
            content = content.replace(pattern, replacement)
        
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
