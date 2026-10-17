import fs from 'node:fs';
import path from 'node:path';
const pages=JSON.parse(fs.readFileSync('src/pages.json','utf8'));
const content=JSON.parse(fs.readFileSync('content/portfolio.json','utf8'));
const settings=JSON.parse(fs.readFileSync('content/settings.json','utf8'));
const assets=fs.existsSync('content/assets.json')?JSON.parse(fs.readFileSync('content/assets.json','utf8')):{};
const localize=value=>{for(const [url,local]of Object.entries(assets)){value=value.replaceAll(url,local).replaceAll(url.replaceAll('&','&amp;'),local)}return value};
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const siteUrl=new URL(settings.siteUrl).origin;
const domain=fs.readFileSync('CNAME','utf8').trim();
if(new URL(siteUrl).hostname!==domain)throw new Error('CNAME must match settings.siteUrl');
if(settings.googleAnalyticsId&&!/^G-[A-Z0-9]+$/.test(settings.googleAnalyticsId))throw new Error('Invalid Google Analytics measurement ID');
// Keep the former template article paths as aliases; new links use /posts/<slug>/.
const aliases=new Map(pages.filter(page=>page.slug.startsWith('blog--')).map(page=>['/blog/'+page.route.split('/').filter(Boolean).at(-1),page.route]));
// Generated files must never survive after their source has been removed.
if(fs.existsSync('dist')&&fs.lstatSync('dist').isSymbolicLink())throw new Error('dist must not be a symlink');
fs.rmSync('dist',{recursive:true,force:true});
fs.mkdirSync('dist/assets',{recursive:true});
if(fs.existsSync('public'))fs.cpSync('public','dist',{recursive:true});
fs.writeFileSync('dist/CNAME',domain+'\n');
fs.writeFileSync('dist/.nojekyll','');
fs.copyFileSync('src/styles/custom.css','dist/assets/custom.css');
fs.copyFileSync('src/interactions.js','dist/assets/interactions.js');
fs.copyFileSync('src/hero-ribbons.js','dist/assets/hero-ribbons.js');
fs.copyFileSync('src/footer-hands.js','dist/assets/footer-hands.js');
fs.copyFileSync('src/opening-dots.js','dist/assets/opening-dots.js');
fs.copyFileSync('src/analytics.js','dist/assets/analytics.js');
fs.copyFileSync('src/site-migration.js','dist/assets/site-migration.js');
fs.writeFileSync('dist/assets/settings.json',JSON.stringify(settings));
for(const page of pages){
 let html=fs.readFileSync('src/pages/'+page.slug+'.html','utf8');
 const navigationLinks=settings.navigation.map(item=>{
  const target=new URL(item.href,'https://portfolio.local');
  const current=!target.hash&&(target.pathname===page.route||page.route.startsWith(target.pathname+'/'));
  const contact=target.hash==='#contact';
  return `<a class="portfolio-nav-link${contact?' portfolio-nav-contact':''}" href="${escape(item.href)}"${current?' aria-current="page"':''}>${escape(item.label)}</a>`;
 }).join('\n');
 html=html.replaceAll('<!--HEADER-->',fs.readFileSync('src/components/Header.html','utf8').replaceAll('{{displayName}}',escape(settings.displayName)).replaceAll('{{navigationLinks}}',navigationLinks));
 page.components.forEach((name,i)=>{html=html.replace('<!--COMPONENT:'+i+'-->',fs.readFileSync('src/components/'+name+'.html','utf8'))});
 for(const [key,field]of Object.entries(content[page.slug])){
  if(field.type==='html'||field.type==='text'){const re=new RegExp('(<(h[1-6]|p)\\b[^>]*data-edit="'+key+'"[^>]*>)[\\s\\S]*?<\\/\\2>','g');html=html.replace(re,(_,open,tag)=>open+(field.type==='text'?escape(field.value):field.value)+'</'+tag+'>')}
  else {const marker=field.type==='image'?'data-edit-image':'data-edit-link';const re=new RegExp('<(?:img|a)\\b[^>]*'+marker+'="'+key+'"[^>]*>','g');html=html.replace(re,tag=>{const attr=field.type==='image'?'src':'href';tag=tag.replace(new RegExp(attr+'="[^"]*"'),attr+'="'+escape(field.value)+'"');if(field.type==='image')tag=tag.replace(/alt="[^"]*"/,'alt="'+escape(field.alt||'')+'"');return tag})}
 }
 const dir=path.join('dist',page.route);fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync('dist/assets/'+page.slug+'.css',localize(fs.readFileSync('src/styles/'+page.slug+'.css','utf8')));
 html=localize(html);
 // Give long brand names a usable static fit; the browser refines it with the loaded font.
 html=html.replace(/(<svg\b[^>]*data-framer-component-type="RichTextContainer"[^>]*>)([\s\S]*?)<\/svg>/g,(match,open,body)=>{
  if(!body.includes('framer-fit-text'))return match;
  const size=Math.min(416.95,1180/(Math.max(1,settings.displayName.length)*.65));
  open=open.replace(/viewBox="[^"]*"/,'viewBox="0 0 1200 '+(size*.9)+'"').replace('<svg ','<svg data-brand-wordmark="true" ');
  body=body.replace(/--framer-font-size:[^;]+;/,'--framer-font-size:'+size+'px;');
  return open+body+'</svg>';
 });
 html=html.replace(/(<footer\b[^>]*>)/g, '$1'+fs.readFileSync('src/components/FooterHands.html','utf8'));
 html=html.replace(/(<div\b[^>]*class="[^"]*\bframer-zpn31\b[^"]*"[^>]*>)/, '$1'+fs.readFileSync('src/components/HeroRibbons.html','utf8').replace('{{ribbonLayout}}',page.slug==='home'?'hero':'page'));
 html=html.replaceAll('href="./','href="/');
 for(const [oldRoute,newRoute]of aliases)html=html.replaceAll('href="'+oldRoute+'"','href="'+newRoute+'"').replaceAll('href="'+oldRoute+'/"','href="'+newRoute+'"');
 html=html.replace(/href="(\/[^"#]+)(#[^"]*)?"/g,(match,target,hash='')=>{if(pages.some(p=>p.route===target))return match;const found=pages.find(p=>p.route.split('/').filter(Boolean).at(-1)===target.slice(1));return found?'href="'+found.route+hash+'"':match});
 if(page.slug==='home')html=html.replace('data-framer-name="Hero Section" id="hero-section">','data-framer-name="Hero Section" id="hero-section"><span class="hero-copyright">©'+settings.copyrightYear+'</span>');
 const icons=fs.readFileSync('src/components/Icons.html','utf8');
 const opening=page.slug==='home'&&settings.openingDots?.enabled!==false?fs.readFileSync('src/components/OpeningDots.html','utf8').replaceAll('{{openingText}}',escape(String(settings.openingDots?.text||'['+settings.displayName+']').slice(0,32))).replaceAll('{{openingDuration}}',String(Math.max(2500,Math.min(10000,Number(settings.openingDots?.duration)||5600)))).replaceAll('{{openingOnce}}',String(settings.openingDots?.oncePerSession!==false)):'';
 const canonical=siteUrl+(page.route==='/'?'/':page.route.replace(/\/$/,'')+'/');
 const seo=`<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:type" content="${page.route.startsWith('/posts/')?'article':'website'}"><meta property="og:site_name" content="${escape(settings.displayName)}"><meta name="google-site-verification" content="${escape(settings.googleSiteVerification||'')}">`;
 const analytics=`<script defer src="/assets/site-migration.js"></script>`+(settings.googleAnalyticsId?`<script defer src="/assets/analytics.js" data-measurement-id="${escape(settings.googleAnalyticsId)}" data-site-origin="${escape(siteUrl)}"></script>`:'');
 const doc=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}">${seo}${analytics}<link rel="stylesheet" href="/assets/${page.slug}.css"><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-tight-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/fonts/fonts.css"><link rel="stylesheet" href="/assets/custom.css"></head><body>${opening}${icons}${html}<script type="module" src="/assets/interactions.js"></script></body></html>`;
 fs.writeFileSync(path.join(dir,'index.html'),doc);
}
for(const [oldRoute,target]of aliases){
 const dir=path.join('dist',oldRoute);fs.mkdirSync(dir,{recursive:true});
 const canonical=siteUrl+target;
 fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${escape(canonical)}"><meta http-equiv="refresh" content="0;url=${escape(target)}"><title>Article moved</title></head><body><a href="${escape(target)}">Continue to article</a></body></html>`);
}
fs.writeFileSync('dist/robots.txt',`User-agent: *\nDisallow: /norobots/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
const urls=pages.map(page=>siteUrl+(page.route==='/'?'/':page.route.replace(/\/$/,'')+'/'));
fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('dist/404.html',`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found - ${escape(settings.displayName)}</title></head><body><main><h1>Page not found</h1><p>The address may be incorrect or the page may have moved.</p><a href="/">Back home</a> · <a href="/blog/">Browse articles</a></main></body></html>`);
console.log('Built '+pages.length+' pages into dist/.');
