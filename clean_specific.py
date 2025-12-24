import os

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição
replacements = [
    # Badges de tempo em Redações
    ('bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700', 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'),
    ('bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700', 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'),
    ('bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700', 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'),
    
    # Simulados - barras decorativas
    ('bg-gradient-to-b from-teal-500 to-emerald-500', 'bg-emerald-500'),
    ('bg-gradient-to-b from-emerald-500 to-emerald-500', 'bg-emerald-500'),
    ('bg-gradient-to-b from-indigo-500 to-emerald-500', 'bg-emerald-500'),
    ('bg-gradient-to-b from-emerald-500 to-teal-500', 'bg-emerald-500'),
    
    # CronogramaDinamico
    ('bg-gradient-to-br from-indigo-500 to-purple-600', 'bg-gray-100 dark:bg-gray-800'),
    ("'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow shadow-emerald-200'", "'bg-emerald-600 text-white shadow'"),
    ("'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow shadow-purple-200'", "'bg-emerald-600 text-white shadow'"),
    ('bg-gradient-to-br from-gray-500 to-gray-600', 'bg-gray-100 dark:bg-gray-800'),
    ('bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50', 'bg-gray-50 dark:bg-gray-900'),
    ('border border-purple-100/50', 'border border-gray-200 dark:border-gray-700'),
    
    # CronogramaWrapper
    ("'bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-md'", "'bg-emerald-600 text-white shadow-md'"),
    
    # MateriaPage
    ('bg-gradient-to-r from-emerald-600 to-indigo-600 text-white hover:from-emerald-700 hover:to-indigo-700', 'bg-emerald-600 text-white hover:bg-emerald-700'),
    ('hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50', 'hover:bg-gray-50 dark:hover:bg-gray-800'),
    
    # PainelGeral
    ('bg-gradient-to-r from-emerald-50 to-teal-50', 'bg-gray-50 dark:bg-gray-900'),
    
    # CronogramaAnual
    ('hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10', 'hover:bg-gray-50 dark:hover:bg-gray-800'),
    
    # Metas redesign
    ('`p-2 rounded-lg bg-gradient-to-br ${TIPOS_META[meta.tipo].bgGradient}`', '`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`'),
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
