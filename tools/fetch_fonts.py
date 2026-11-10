"""Self-host Google Fonts (latin + cyrillic woff2) into site/assets/fonts and write site/assets/css/fonts.css."""
import re, os, urllib.request
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = f'{ROOT}/site/assets/fonts'
CSS = f'{ROOT}/site/assets/css/fonts.css'
URL = ('https://fonts.googleapis.com/css2?family=Forum&family=Jost:wght@300..600'
       '&family=IBM+Plex+Mono:wght@400;500&display=swap')
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
css = urllib.request.urlopen(urllib.request.Request(URL, headers={'User-Agent': UA})).read().decode()
blocks = re.findall(r'/\* ([\w-]+) \*/\s*(@font-face \{.*?\})', css, re.S)
out = []
for subset, block in blocks:
    if subset not in ('latin', 'cyrillic', 'latin-ext'):
        continue
    fam = re.search(r"font-family: '([^']+)'", block).group(1).replace(' ', '')
    weight = re.search(r'font-weight: ([\d ]+)', block).group(1).strip().replace(' ', '-')
    url = re.search(r'url\((https://[^)]+)\)', block).group(1)
    name = f'{fam}-{weight}-{subset}.woff2'
    path = f'{OUT}/{name}'
    if not os.path.exists(path):
        open(path, 'wb').write(urllib.request.urlopen(url).read())
    out.append(block.replace(url, f'../fonts/{name}'))
    print(name, os.path.getsize(path) // 1024, 'KB')
open(CSS, 'w').write('\n'.join(out) + '\n')
