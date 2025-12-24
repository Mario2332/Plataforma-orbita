import os

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição finais
replacements = [
    # Redações - gradientes dinâmicos
    ('`absolute inset-0 bg-gradient-to-br ${', '`absolute inset-0 bg-gray-100 dark:bg-gray-800 ${'),
    ('`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${', '`absolute top-0 right-0 w-40 h-40 bg-gray-100 dark:bg-gray-800 ${'),
    ('`absolute inset-0 bg-gradient-to-br ${', '`absolute inset-0 bg-gray-100 dark:bg-gray-800 ${'),
    ('`relative p-3 bg-gradient-to-br ${', '`relative p-3 bg-gray-100 dark:bg-gray-800 ${'),
    
    # Simulados - barras decorativas
    ('bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full', 'bg-emerald-500 rounded-full'),
    ('bg-gradient-to-b from-emerald-500 to-emerald-500 rounded-full', 'bg-emerald-500 rounded-full'),
    ('bg-gradient-to-b from-indigo-500 to-emerald-500 rounded-full', 'bg-emerald-500 rounded-full'),
    ('bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full', 'bg-emerald-500 rounded-full'),
    
    # CronogramaDinamico
    ('bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow shadow-emerald-200', 'bg-emerald-600 text-white shadow'),
    ('bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow shadow-purple-200', 'bg-emerald-600 text-white shadow'),
    ('bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl', 'bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 rounded-lg p-4 shadow-sm border border-purple-100/50', 'bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700'),
    
    # CronogramaWrapper
    ('bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-md', 'bg-emerald-600 text-white shadow-md'),
    
    # MateriaPage
    ('bg-gradient-to-r from-emerald-600 to-indigo-600 text-white hover:from-emerald-700 hover:to-indigo-700 shadow', 'bg-emerald-600 text-white hover:bg-emerald-700 shadow'),
    ('hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50', 'hover:bg-gray-50 dark:hover:bg-gray-800'),
    
    # PainelGeral
    ('bg-gradient-to-r from-emerald-50 to-teal-50', 'bg-gray-50 dark:bg-gray-900'),
    
    # CronogramaAnual
    ('hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10', 'hover:bg-gray-50 dark:hover:bg-gray-800'),
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
