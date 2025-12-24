import os

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição - adicionar mais cores
replacements = [
    # Metas - ícones
    ('p-2 rounded-lg bg-gray-100 dark:bg-gray-800', 'p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30'),
    
    # Métricas - header
    ('relative bg-gray-100 dark:bg-gray-800 p-3 rounded-lg shadow-sm', 'relative bg-emerald-500 p-3 rounded-lg shadow-sm'),
    
    # Tabs
    ('grid w-full grid-cols-3 p-1 bg-gray-100 dark:bg-gray-800 border-2', 'grid w-full grid-cols-3 p-1 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800'),
    
    # Cronograma - ícones grandes
    ('w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center shadow', 'w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center shadow'),
    ('w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shadow', 'w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shadow'),
    
    # Cronograma - cards
    ('bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-sm', 'bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 shadow-sm border border-emerald-100 dark:border-emerald-800'),
    
    # Redações - ícone de histórico
    ('p-2 rounded-full bg-gray-100 dark:bg-gray-800', 'p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30'),
    
    # Redações - ícone grande
    ('relative bg-gray-100 dark:bg-gray-800 p-4 rounded-full', 'relative bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full'),
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
