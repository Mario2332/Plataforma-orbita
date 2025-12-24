import os
import re

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição
replacements = [
    # Gradientes em Configurações
    ('bg-gradient-to-br from-emerald-50 to-teal-50', 'bg-gray-50 dark:bg-gray-900'),
    ('bg-gradient-to-br from-emerald-100 to-teal-100', 'bg-gray-100 dark:bg-gray-800'),
    ('bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20', 'bg-gray-50 dark:bg-gray-900'),
    
    # Gradientes em Cronograma
    ('bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 hover:from-indigo-600 hover:via-teal-600 hover:to-emerald-600', 'bg-emerald-600 hover:bg-emerald-700'),
    ('bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-gray-200 dark:border-gray-700/10', 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'),
    ('p-2 bg-indigo-500 rounded-lg', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-lg'),
    ('bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-gray-200 dark:border-gray-700/10', 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'),
    ('bg-gradient-to-r from-pink-500/5 to-rose-500/5 border border-gray-200 dark:border-gray-700/10', 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'),
    ('p-2 bg-pink-500 rounded-lg', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-lg'),
    ('bg-gradient-to-r from-rose-500/5 to-orange-500/5 border-2 border-rose-500/10', 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'),
    ('p-2 bg-rose-500 rounded-lg', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-lg'),
    ('bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800', 'bg-gray-50 dark:bg-gray-900'),
    
    # Gradientes em CronogramaPage
    ('bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600', 'text-gray-900 dark:text-white'),
    
    # Gradientes em Metas
    ('bg-gradient-to-br ${TIPOS_META[meta.tipo].bgGradient}', 'bg-gray-100 dark:bg-gray-800'),
    ('bg-gradient-to-br from-primary/20 to-primary/10', 'bg-gray-100 dark:bg-gray-800'),
    
    # Gradientes em Métricas
    ('bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-gray-200 dark:border-gray-700/10 hover:border-purple-500/30', 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300'),
    ('bg-gradient-to-r from-emerald-500 to-green-500 text-white', 'bg-emerald-600 text-white'),
    ('bg-amber-500 text-white', 'bg-gray-500 text-white'),
    ('bg-gradient-to-r from-emerald-500 to-green-500', 'bg-emerald-500'),
    ('bg-amber-500', 'bg-gray-400'),
    ('bg-gradient-to-r from-red-500 to-rose-500', 'bg-gray-500'),
    
    # Gradientes em Redações
    ('bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500', 'text-gray-900 dark:text-white'),
    ('bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg', 'bg-gray-100 dark:bg-gray-800 rounded-lg'),
    ('hover:border-orange-300 hover:shadow', 'hover:border-gray-300 hover:shadow'),
    ('bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950', 'bg-white dark:bg-gray-900'),
    ('bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700', 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'),
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
