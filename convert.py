import os
import glob
import re

# We will read index.astro to extract the components
with open('src/pages/index.astro', 'r', encoding='utf-8') as f:
    index_content = f.read()

# Extract <style> block
style_match = re.search(r'<style>(.*?)</style>', index_content, re.DOTALL)
global_styles = style_match.group(1) if style_match else ""

# Extract <header>
header_match = re.search(r'<header>.*?</header>', index_content, re.DOTALL)
header_html = header_match.group(0) if header_match else ""

# Extract mobile menu
mobile_menu_match = re.search(r'<nav class="mobile-menu".*?</nav>', index_content, re.DOTALL)
mobile_menu_html = mobile_menu_match.group(0) if mobile_menu_match else ""

header_component = f"""---
---
{header_html}
{mobile_menu_html}

<script>
// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
function closeMobileMenu() {{
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
}}
if (hamburger) {{
    hamburger.addEventListener('click', function () {{
        const open = mobileMenu.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }});
}}
// Make links close menu
document.querySelectorAll('.mobile-menu a').forEach(link => {{
    link.addEventListener('click', closeMobileMenu);
}});
</script>
"""
os.makedirs('src/components', exist_ok=True)
with open('src/components/Header.astro', 'w', encoding='utf-8') as f:
    f.write(header_component.replace('.html"', '"').replace('.html#', '#'))

# Extract <footer>
footer_match = re.search(r'<footer>.*?</footer>', index_content, re.DOTALL)
footer_html = footer_match.group(0) if footer_match else ""

footer_component = f"""---
---
{footer_html.replace('.html"', '"')}
"""
with open('src/components/Footer.astro', 'w', encoding='utf-8') as f:
    f.write(footer_component)

# Layout Component
layout_content = f"""---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {{
  title: string;
  description: string;
  keywords?: string;
  schema?: string;
  canonical?: string;
}}

const {{ title, description, keywords, schema, canonical = "https://arthavi.com" + Astro.url.pathname }} = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <meta name="description" content={{description}}>
    {{keywords && <meta name="keywords" content={{keywords}}>}}
    
    <link rel="canonical" href={{canonical}}>
    <link rel="icon" href="/images/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content={{canonical}}>
    <meta property="og:title" content={{title}}>
    <meta property="og:description" content={{description}}>
    <meta property="og:image" content="https://arthavi.com/images/og-image.png">
    <meta property="og:site_name" content="Arthavi">
    <meta property="og:locale" content="en_IN">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content={{canonical}}>
    <meta property="twitter:title" content={{title}}>
    <meta property="twitter:description" content={{description}}>
    <meta property="twitter:image" content="https://arthavi.com/images/og-image.png">
    <meta name="twitter:creator" content="@arthavi_app">

    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#0B0E14">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="/styles.css">

    <!-- HTTPS redirect -->
    <script is:inline>
        if (location.protocol === 'http:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {{
            location.replace('https:' + location.href.substring(location.protocol.length));
        }}
    </script>

    <!-- Google tag (gtag.js) -->
    <script async is:inline src="https://www.googletagmanager.com/gtag/js?id=G-RQMEP6S2H9"></script>
    <script is:inline>
        window.dataLayer = window.dataLayer || [];
        function gtag() {{ dataLayer.push(arguments); }}
        gtag('js', new Date());
        gtag('config', 'G-RQMEP6S2H9');
    </script>

    {{schema && <script type="application/ld+json" set:html={{schema}}></script>}}
</head>
<body>
    <Header />
    <slot />
    <Footer />
    
    <script is:inline src="/scripts.js" defer></script>
</body>
</html>
"""
os.makedirs('src/layouts', exist_ok=True)
with open('src/layouts/Layout.astro', 'w', encoding='utf-8') as f:
    f.write(layout_content)

os.makedirs('src/styles', exist_ok=True)
with open('src/styles/global.css', 'w', encoding='utf-8') as f:
    f.write(global_styles)

print("Layout, Header, Footer created.")
