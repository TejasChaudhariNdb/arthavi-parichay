import os
import glob
import re

def process_html_file(filepath, outpath, is_index=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', content)
    title = title_match.group(1) if title_match else ""

    # Extract description
    desc_match = re.search(r'<meta name="description"\s*content="(.*?)"', content, re.IGNORECASE | re.DOTALL)
    description = desc_match.group(1).replace('\n', ' ').strip() if desc_match else ""

    # Extract keywords
    kw_match = re.search(r'<meta name="keywords"\s*content="(.*?)"', content, re.IGNORECASE | re.DOTALL)
    keywords = kw_match.group(1).replace('\n', ' ').strip() if kw_match else ""

    # Extract schema
    schema_match = re.search(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL)
    schema = schema_match.group(1).strip() if schema_match else ""

    # Extract main content
    # For body we want everything inside <body>...</body> EXCEPT header, mobile-menu, footer, skip-link, and script tags at bottom.
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL | re.IGNORECASE)
    if not body_match:
        print(f"Skipping {filepath}: No body found")
        return
    body_content = body_match.group(1)

    # Remove skip link if exists
    body_content = re.sub(r'<a href="#main-content" class="skip-link">.*?</a>', '', body_content, flags=re.DOTALL)
    
    # Remove header
    body_content = re.sub(r'<header>.*?</header>', '', body_content, flags=re.DOTALL)
    
    # Remove mobile-menu
    body_content = re.sub(r'<nav class="mobile-menu".*?</nav>', '', body_content, flags=re.DOTALL)
    
    # Remove footer
    body_content = re.sub(r'<footer>.*?</footer>', '', body_content, flags=re.DOTALL)
    
    # Remove <script src="scripts.js" defer></script>
    body_content = re.sub(r'<script src="scripts.js" defer></script>', '', body_content, flags=re.DOTALL)

    # If it is index, we need to keep the inline script for AI tab switcher etc., but wait, the inline scripts at the bottom:
    # "AI tab switcher" and "Hide duplicate nav CTA"
    # Let's extract any trailing <script> tags and keep them. Actually, simpler to just find script blocks that aren't the mobile toggle.
    # The mobile toggle has "mobile-menu toggle" or "hamburger".
    # Let's just remove the mobile toggle part.
    if is_index:
        pass # we can keep the rest of the scripts, we just remove the hamburger logic if it's there.
        body_content = re.sub(r'// Mobile menu toggle.*?if \(hamburger\).*?\}\);?\s*\}', '', body_content, flags=re.DOTALL)

    # Fix .html links
    body_content = re.sub(r'href="([^"]+)\.html(#.*?)*"', r'href="/\1\2"', body_content)
    # Fix self-links like href="index.html" -> href="/"
    body_content = re.sub(r'href="/index(#.*?)*"', r'href="/\1"', body_content)
    body_content = re.sub(r'href="/index"', r'href="/"', body_content)

    # Escape quotes in props
    desc_escaped = description.replace('"', '\\"')
    kw_escaped = keywords.replace('"', '\\"')
    
    schema_prop = f"schema={{JSON.stringify({schema})}}" if schema else ""
    kw_prop = f'keywords="{kw_escaped}"' if keywords else ""

    astro_content = f"""---
import Layout from '../layouts/Layout.astro';

const seo = {{
  title: "{title}",
  description: "{desc_escaped}",
}};
---
<Layout title={{seo.title}} description={{seo.description}} {kw_prop} {schema_prop}>
{body_content}
</Layout>
"""
    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(astro_content)
    print(f"Processed {filepath} -> {outpath}")

# Process index.astro (using its current state as source)
process_html_file('src/pages/index.astro', 'src/pages/index.astro', is_index=True)

# Process all public/*.html
html_files = glob.glob('public/*.html')
for html_file in html_files:
    basename = os.path.basename(html_file)
    # index.html in public is already deleted, but if any others are there
    if basename == 'index.html':
        continue
    name_without_ext = os.path.splitext(basename)[0]
    outpath = f"src/pages/{name_without_ext}.astro"
    process_html_file(html_file, outpath)
    # Remove the html file from public since it's now an Astro page
    os.remove(html_file)

