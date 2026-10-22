import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { addArticleHeadingIds } from './article-headings.mjs';
import { highlightCodeBlocks } from './highlight-code.mjs';
import { renderNotFound } from './error-page.mjs';
import { loadSiteContent, renderContentPage, renderPostCard, renderProjectCard } from './content.mjs';
import { canonicalRoute, localPageUrl, canonicalPageUrl, pageMetadata, renderPageSeo, sitemapPages } from './seo.mjs';
import { renderServicesPage, serviceBooking } from './services.mjs';
const {pages,posts,projects}=loadSiteContent({includeDrafts:process.argv.includes('--drafts')});
const content=JSON.parse(fs.readFileSync('content/portfolio.json','utf8'));
const settings=JSON.parse(fs.readFileSync('content/settings.json','utf8'));
const assets=fs.existsSync('content/assets.json')?JSON.parse(fs.readFileSync('content/assets.json','utf8')):{};
const localize=value=>{for(const [url,local]of Object.entries(assets)){value=value.replaceAll(url,local).replaceAll(url.replaceAll('&','&amp;'),local)}return value};
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const customCssVersion=createHash('sha256').update(fs.readFileSync('src/styles/custom.css')).digest('hex').slice(0,12);
const brandIcons='<link rel="icon" href="/favicon.ico?v=ascii-b" sizes="any"><link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32.png?v=ascii-b"><link rel="icon" type="image/png" sizes="16x16" href="/assets/brand/favicon-16.png?v=ascii-b"><link rel="icon" type="image/svg+xml" sizes="any" href="/assets/brand/favicon-ascii-b.svg"><link rel="apple-touch-icon" sizes="180x180" href="/assets/brand/apple-touch-icon.png?v=ascii-b"><meta name="theme-color" content="#080809">';
const siteUrl=new URL(settings.siteUrl).origin;
const tabBrand=settings.seo?.titleBrand||settings.displayName;
// Validate every Markdown page before replacing the last successful output.
const renderedContent=new Map(pages.filter(page=>page.entry).map(page=>[page.slug,renderContentPage(page.entry,{shareUrl:siteUrl+page.route,posts})]));
const pageSeo=new Map(pages.map(page=>[page.slug,renderPageSeo(page,settings,pages)]));
if(settings.seo?.defaultImage?.startsWith('/assets/')&&!fs.existsSync(path.join('public',settings.seo.defaultImage)))throw new Error('The default SEO image does not exist in public/: '+settings.seo.defaultImage);
const domain=fs.readFileSync('CNAME','utf8').trim();
if(new URL(siteUrl).hostname!==domain)throw new Error('CNAME must match settings.siteUrl');
if(settings.googleAnalyticsId&&!/^G-[A-Z0-9]+$/.test(settings.googleAnalyticsId))throw new Error('Invalid Google Analytics measurement ID');
const booking = serviceBooking(settings);
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
fs.copyFileSync('src/form-submit.js','dist/assets/form-submit.js');
fs.copyFileSync('src/service-booking.js','dist/assets/service-booking.js');
fs.copyFileSync('src/article-toc.js','dist/assets/article-toc.js');
fs.copyFileSync('src/article-share.js','dist/assets/article-share.js');
fs.copyFileSync('src/article-back-to-top.js','dist/assets/article-back-to-top.js');
fs.copyFileSync('src/hero-ribbons.js','dist/assets/hero-ribbons.js');
fs.copyFileSync('src/footer-hands.js','dist/assets/footer-hands.js');
fs.copyFileSync('src/opening-dots.js','dist/assets/opening-dots.js');
fs.copyFileSync('src/analytics.js','dist/assets/analytics.js');
fs.copyFileSync('src/site-migration.js','dist/assets/site-migration.js');
fs.writeFileSync('dist/assets/settings.json',JSON.stringify(settings));
function applyContent(html,fields){
 for(const [key,field]of Object.entries(fields)){
  if(field.type==='html'||field.type==='text'){const re=new RegExp('(<(h[1-6]|p)\\b[^>]*data-edit="'+key+'"[^>]*>)[\\s\\S]*?<\\/\\2>','g');html=html.replace(re,(_,open,tag)=>open+(field.type==='text'?escape(field.value):field.value)+'</'+tag+'>')}
  else {const marker=field.type==='image'?'data-edit-image':'data-edit-link';const re=new RegExp('<(?:img|a)\\b[^>]*'+marker+'="'+key+'"[^>]*>','g');html=html.replace(re,tag=>{const attr=field.type==='image'?'src':'href';tag=tag.replace(new RegExp(attr+'="[^"]*"'),attr+'="'+escape(field.value)+'"');if(field.type==='image')tag=tag.replace(/alt="[^"]*"/,'alt="'+escape(field.alt||'')+'"');return tag})}
 }
 return html;
}
for(const page of pages){
 const style=page.entry?'content':page.style||page.slug;
 let html=fs.readFileSync('src/pages/'+(page.entry?'content':page.template||page.slug)+'.html','utf8');
 if(page.template==='services')html=html.replace('<!--SERVICES-->',()=>renderServicesPage(page,settings));
 const navigationItems=settings.navigation.map(item=>{
  const target=new URL(item.href,'https://portfolio.local');
  const current=!target.hash&&(target.pathname===page.route||page.route.startsWith(target.pathname+'/')||(page.entry?.kind==='post'&&target.pathname==='/blog')||(page.entry?.kind==='project'&&target.pathname==='/work'));
  const contact=target.hash==='#contact';
  return {contact,html:`<a class="portfolio-nav-link${contact?' portfolio-nav-contact':''}" href="${escape(item.href)}"${current?' aria-current="page"':''}>${escape(item.label)}</a>`};
 });
 const navigationLinks=navigationItems.filter(item=>!item.contact).map(item=>item.html).join('\n');
 const contactLink=navigationItems.filter(item=>item.contact).map(item=>item.html).join('\n');
 html=html.replaceAll('<!--HEADER-->',fs.readFileSync('src/components/Header.html','utf8').replaceAll('{{displayName}}',escape(settings.displayName)).replaceAll('{{headerDisplayName}}',escape(settings.headerDisplayName||settings.displayName)).replaceAll('{{navigationLinks}}',navigationLinks).replaceAll('{{contactLink}}',contactLink));
 if(page.entry){
  html=html.replace('<!--CONTENT-->',()=>renderedContent.get(page.slug)).replace('<!--FOOTER-->',()=>applyContent(fs.readFileSync('src/components/home--7--phone.html','utf8'),content.home));
 }else{
  page.components.forEach((name,i)=>{html=html.replace('<!--COMPONENT:'+i+'-->',fs.readFileSync('src/components/'+name+'.html','utf8'))});
  html=applyContent(html,content[page.slug]||{});
 }
 for(const [type,entries,render,limit]of [['POST',posts,renderPostCard,3],['PROJECT',projects,renderProjectCard,4]]){
  for(const scope of ['HOME','ALL']){
   const selected=scope==='HOME'?entries.filter(entry=>entry.featured).slice(0,limit):entries;
   html=html.replace(`<!--${type}-CARDS:${scope}-->`,()=>selected.map(render).join('\n')||'<p class="content-empty">More coming soon.</p>');
  }
 }
 html=highlightCodeBlocks(html);
 if(page.route.startsWith('/posts/'))html=addArticleHeadingIds(html);
 // Static pages can also opt into the homepage's populated footer.
 if(page.sharedFooter){
  const footer=applyContent(fs.readFileSync('src/components/home--7--phone.html','utf8'),content.home);
  html=html.replace(/<footer\b[\s\S]*?<\/footer>/,()=>footer);
 }
 const dir=path.join('dist',page.route);fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync('dist/assets/'+style+'.css',localize(fs.readFileSync('src/styles/'+style+'.css','utf8')));
 html=localize(html);
 // Give long brand names a usable static fit; the browser refines it with the loaded font.
 html=html.replace(/(<svg\b[^>]*data-framer-component-type="RichTextContainer"[^>]*>)([\s\S]*?)<\/svg>/g,(match,open,body)=>{
  if(!body.includes('framer-fit-text'))return match;
  const size=Math.min(416.95,1180/(Math.max(1,settings.displayName.length)*.65));
  open=open.replace(/viewBox="[^"]*"/,'viewBox="0 0 1200 '+(size*.9)+'"').replace('<svg ','<svg data-brand-wordmark="true" ');
  body=body.replace(/--framer-font-size:[^;]+;/,'--framer-font-size:'+size+'px;');
  body=body.replace(/(<p\b[^>]*>)[\s\S]*?<\/p>/g,(_,start)=>start+escape(settings.displayName.toUpperCase())+'</p>');
  return open+body+'</svg>';
 });
 html=html.replace(/(<footer\b[^>]*>)/g, '$1'+fs.readFileSync('src/components/FooterHands.html','utf8'));
 html=html.replaceAll('<!--FOOTER-BOOKING-->',booking?`<a class="portfolio-glass-button portfolio-glass-button-secondary portfolio-footer-booking" href="/services/#enquire" aria-label="Book a security call (${booking.duration} minutes)">Book a security call</a>`:'');
 const heroBackground=fs.readFileSync('src/components/HeroBackground.html','utf8');
 html=html.replace(/(<div\b[^>]*class="[^"]*\bframer-zpn31\b[^"]*"[^>]*>)/, '$1'+heroBackground);
 html=html.replaceAll('href="./','href="/');
 for(const [oldRoute,newRoute]of aliases)html=html.replaceAll('href="'+oldRoute+'"','href="'+newRoute+'"').replaceAll('href="'+oldRoute+'/"','href="'+newRoute+'"');
 html=html.replace(/href="(\/[^"#?]*)(#[^"]*)?"/g,(match,target,hash='')=>{const found=pages.find(p=>canonicalRoute(p.route)===canonicalRoute(target))||pages.find(p=>p.route.split('/').filter(Boolean).at(-1)===target.slice(1));return found?'href="'+canonicalRoute(found.route)+hash+'"':match});
 if(page.slug==='home')html=html.replace('data-framer-name="Hero Section" id="hero-section">','data-framer-name="Hero Section" id="hero-section"><span class="hero-copyright">©'+settings.copyrightYear+'</span>');
 const icons=fs.readFileSync('src/components/Icons.html','utf8');
 const opening=page.slug==='home'&&settings.openingDots?.enabled!==false?fs.readFileSync('src/components/OpeningDots.html','utf8').replaceAll('{{openingText}}',escape(String(settings.openingDots?.text||'['+settings.displayName+']').slice(0,32))).replaceAll('{{openingDuration}}',String(Math.max(2500,Math.min(10000,Number(settings.openingDots?.duration)||5600)))).replaceAll('{{openingOnce}}',String(settings.openingDots?.oncePerSession!==false)):'';
 const metadata=pageMetadata(page,settings);
 const seo=pageSeo.get(page.slug);
 const analytics=`<script defer src="/assets/site-migration.js"></script>`+(settings.googleAnalyticsId?`<script defer src="/assets/analytics.js" data-measurement-id="${escape(settings.googleAnalyticsId)}" data-site-origin="${escape(siteUrl)}"></script>`:'');
 const doc=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(metadata.title)}</title>${seo}${brandIcons}${analytics}<link rel="stylesheet" href="/assets/${style}.css"><link rel="preload" href="/assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-tight-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/assets/fonts/fonts.css"><link rel="stylesheet" href="/assets/custom.css?v=${customCssVersion}"></head><body>${opening}${icons}${html}<script type="module" src="/assets/interactions.js"></script></body></html>`;
 fs.writeFileSync(path.join(dir,'index.html'),doc);
}
for(const [oldRoute,target]of aliases){
 const dir=path.join('dist',oldRoute);fs.mkdirSync(dir,{recursive:true});
 const canonical=canonicalPageUrl(pages.find(page=>page.route===target),siteUrl);
 fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow">${brandIcons}<link rel="canonical" href="${escape(canonical)}"><meta http-equiv="refresh" content="0;url=${escape(target)}"><title>Article moved | ${escape(tabBrand)}</title></head><body><a href="${escape(target)}">Continue to article</a></body></html>`);
}
fs.writeFileSync('dist/robots.txt',`User-agent: *\nDisallow: /norobots/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
const urls=sitemapPages(pages,siteUrl).map(page=>({url:localPageUrl(page,siteUrl),updated:page.entry?.updated}));
fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({url,updated})=>`  <url><loc>${escape(url)}</loc>${updated?`<lastmod>${updated}</lastmod>`:''}</url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync('dist/404.html', renderNotFound({ brand: tabBrand, icons: brandIcons }));
console.log('Built '+pages.length+' pages into dist/.');
