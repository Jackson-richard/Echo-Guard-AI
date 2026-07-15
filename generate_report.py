import json
import os

with open(r'c:\Users\Jackson\OneDrive\Documents\EchoGuard AI\audit_report.json', 'r') as f:
    data = json.load(f)

lines = []
lines.append('# Python Files Audit Report\n')
for d in data:
    file_path = d['file']
    lines_count = d['lines']
    is_empty = 'Yes' if d['empty'] else 'No'
    is_imported = 'Yes' if d['imported'] else 'No'
    is_executed = 'Yes' if d['executed'] else 'No'
    is_placeholder = 'Yes' if d['placeholder'] else 'No'
    
    why_exists_empty = d['why_exists'] if d['empty'] else 'N/A (Not empty)'
    recommend_remove = d['recommend_remove']
    
    lines.append(f'## File: {file_path}')
    lines.append(f'- **1. Lines of Code:** {lines_count}')
    lines.append(f'- **2. Is Empty:** {is_empty}')
    lines.append(f'- **3. Imported anywhere:** {is_imported}')
    lines.append(f'- **4. Actively executed:** {is_executed}')
    lines.append(f'- **5. Is a placeholder:** {is_placeholder}')
    lines.append(f'- **6. Why it exists (Empty):** {why_exists_empty}')
    lines.append(f'- **7. Unused recommendation:** {recommend_remove}')
    lines.append('')

with open(r'c:\Users\Jackson\OneDrive\Documents\EchoGuard AI\audit_markdown.txt', 'w') as out:
    out.write('\n'.join(lines))
