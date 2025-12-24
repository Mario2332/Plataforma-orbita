import os
import re

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição finais
replacements = [
    # Gradientes de fundo em banners
    ('bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-500', 'bg-emerald-600'),
    ('bg-gradient-to-br from-primary/10 via-primary/5 to-transparent', 'bg-gray-50 dark:bg-gray-900'),
    ('bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20', 'bg-gray-50 dark:bg-gray-900'),
    ('bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600', 'bg-emerald-600 hover:bg-emerald-700'),
    ('bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600', 'text-emerald-600 dark:text-emerald-400'),
    
    # Botões com gradiente
    ('bg-emerald-500 hover:from-emerald-600 hover:to-teal-600', 'bg-emerald-600 hover:bg-emerald-700'),
    
    # Ícones com fundo colorido
    ('p-2 bg-orange-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('p-2 bg-emerald-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('p-2 bg-purple-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('p-2 bg-teal-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('p-2 bg-pink-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('p-2 bg-amber-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('p-2 bg-rose-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    ('p-2 bg-indigo-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    
    # Badges coloridos
    ('bg-green-500', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'),
    ('bg-orange-500', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'),
    ('bg-yellow-500', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'),
    ('bg-red-500', 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'),
    
    # Bordas coloridas
    ('border-2 border-primary/20', 'border border-gray-200 dark:border-gray-700'),
    ('border border-emerald-200/50', 'border border-gray-200 dark:border-gray-700'),
    
    # Gradientes em tipos de meta
    ('bg-gradient-to-br ${TIPOS_META[meta.tipo].bgGradient}', 'bg-gray-100 dark:bg-gray-800'),
    
    # Hover colorido
    ('hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-600', 'hover:bg-gray-100 dark:hover:bg-gray-800'),
    
    # Sombras coloridas
    ('shadow-teal-500/30', 'shadow-sm'),
    
    # Barras de progresso
    ('h-full bg-emerald-500 rounded-full', 'h-full bg-emerald-500 rounded-full'),  # Manter emerald para progresso
    
    # Elementos de seleção
    ('bg-emerald-500 text-white border-transparent shadow', 'bg-emerald-600 text-white border-emerald-600'),
    
    # Ícones de atividade física
    ('bg-emerald-500\' : \'bg-gray-500\'', 'bg-emerald-600\' : \'bg-gray-400\''),
    
    # Shimmer animation
    ('bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer', 'bg-transparent'),
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
