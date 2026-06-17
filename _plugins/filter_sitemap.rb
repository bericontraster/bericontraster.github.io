Jekyll::Hooks.register :site, :post_write do |site|
  sitemap = File.join(site.dest, "sitemap.xml")
  if File.exist?(sitemap)
    content = File.read(sitemap)
    filtered = content.gsub(
      %r{<url>\s*<loc>https?://[^<]*/(tags|categories|page\d+)/.*?</url>}m,
      ""
    )
    File.write(sitemap, filtered)
  end
end
