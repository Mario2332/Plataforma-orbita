import os
import re

# Diretórios a processar
directories = [
    '/home/ubuntu/Plataforma-orbita/client/src/pages/',
    '/home/ubuntu/Plataforma-orbita/client/src/components/',
]

# Padrões de substituição finais - strings exatas
replacements = [
    # Gradientes de texto em Redações
    ('bg-gradient-to-r from-orange-600 via-red-600 to-amber-600', 'text-gray-900 dark:text-white'),
    ('bg-gradient-to-r from-orange-600 to-red-600', 'text-gray-900 dark:text-white'),
    ('bg-gradient-to-r from-orange-500 to-red-500', 'text-gray-900 dark:text-white'),
    
    # Gradientes de fundo em cards de Redações
    ('bg-gradient-to-r from-orange-100 via-red-100 to-amber-100 dark:from-orange-950/50 dark:via-red-950/50 dark:to-amber-950/50 border border-gray-200 dark:border-gray-700 dark:border-orange-800', 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'),
    ('bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30', 'bg-gray-100 dark:bg-gray-800'),
    
    # Gradientes em badges de tempo
    ('bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border border-gray-200 dark:border-gray-700 dark:border-red-800', 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'),
    ('bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700', 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'),
    ('bg-gradient-to-r from-red-500 to-rose-500 text-white', 'bg-gray-600 text-white'),
    
    # Hover colorido em Redações
    ('hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30', 'hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'),
    ('text-red-500 hover:text-red-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30', 'text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'),
    
    # Focus colorido
    ('focus:border-orange-500', 'focus:border-emerald-500'),
    
    # Gradientes em Diário
    ('bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-500', 'bg-emerald-600'),
    ('bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20', 'bg-gray-50 dark:bg-gray-900'),
    
    # Gradientes em Metas
    ('bg-gradient-to-br from-primary/10 via-primary/5 to-transparent', 'bg-gray-50 dark:bg-gray-900'),
    ('border-2 border-primary/20', 'border border-gray-200 dark:border-gray-700'),
    
    # Gradientes em Estudos
    ('bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600', 'text-emerald-600 dark:text-emerald-400'),
    ('bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600', 'bg-emerald-600 hover:bg-emerald-700'),
    ('shadow-sm hover:shadow-sm hover:shadow-teal-500/30', 'shadow-sm hover:shadow-md'),
    
    # Ícones com fundo colorido em Diário
    ('p-2 bg-orange-500 rounded-xl shadow', 'p-2 bg-gray-100 dark:bg-gray-800 rounded-xl'),
    
    # Badges de energia
    ('"bg-indigo-500"', '"bg-gray-500"'),
    
    # Botões com gradiente
    ('bg-emerald-500 hover:from-emerald-600 hover:to-teal-600', 'bg-emerald-600 hover:bg-emerald-700'),
    
    # Elementos de seleção em Diário
    ('bg-emerald-500 text-white border-transparent shadow', 'bg-emerald-600 text-white border-emerald-600'),
    
    # Ícones de atividade física
    ("'bg-emerald-500' : 'bg-gray-500'", "'bg-emerald-600' : 'bg-gray-400'"),
    
    # Gradientes em cards de estatísticas
    ('"from-red-500/10"', '"from-gray-500/10"'),
    ('"from-red-500/20"', '"from-gray-500/20"'),
    ('"from-red-500 to-rose-500"', '"from-gray-500 to-gray-600"'),
    
    # Gradientes em Metas (tipos)
    ('bg-gradient-to-br ${TIPOS_META[meta.tipo].bgGradient}', 'bg-gray-100 dark:bg-gray-800'),
    
    # Shimmer
    ('bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer', 'bg-transparent'),
    
    # Hover em metas
    ('hover:bg-orange-500/10 hover:border-orange-500 hover:text-orange-600', 'hover:bg-gray-100 dark:hover:bg-gray-800'),
    
    # Badges de status de meta
    ('bg-emerald-500 shadow', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'),
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
