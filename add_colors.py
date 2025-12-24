import os

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição - adicionar cor verde esmeralda
replacements = [
    # Ícones principais - fundo verde claro elegante
    ('p-3 bg-gray-100 dark:bg-gray-800 rounded-xl', 'p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl'),
    ('p-3 bg-gray-100 dark:bg-gray-800 rounded-lg', 'p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'),
    ('p-2 bg-gray-100 dark:bg-gray-800 rounded-xl', 'p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl'),
    ('p-2 bg-gray-100 dark:bg-gray-800 rounded-lg', 'p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'),
    ('p-4 bg-gray-100 dark:bg-gray-800 rounded-xl', 'p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl'),
    ('p-4 bg-gray-100 dark:bg-gray-800 rounded-lg', 'p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'),
    
    # Badges de matérias - fundo verde claro
    ('px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-semibold border border-gray-200 dark:border-gray-700', 'px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-sm font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'),
    
    # Indicadores de status - verde
    ('bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 backdrop-blur-sm', 'bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800'),
    
    # Ícones em headers - manter com fundo verde
    ('relative bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm', 'relative bg-emerald-500 rounded-lg shadow-sm'),
    
    # Cards de ação rápida
    ('relative p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm', 'relative p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shadow-sm'),
    ('relative p-3 bg-gray-100 dark:bg-gray-800 rounded-lg shadow', 'relative p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shadow'),
    
    # Ícones de cronômetro
    ('w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl', 'w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl'),
    
    # Badges de competências em Redações - cores variadas
    ('bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700', 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'),
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
