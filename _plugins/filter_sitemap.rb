Jekyll::Hooks.register :site, :post_write do |site|
  sitemap = File.join(site.dest, "sitemap.xml")

  if File.exist?(sitemap)
    content = File.read(sitemap)

    filtered = content.gsub(
      %r{
        <url>\s*
        <loc>https?://[^<]*/(?:tags|categories|page\d+|archives)(?:/[^<]*)?</loc>
        .*?
        </url>
      }mx,
      ""
    )

    filtered = filtered.gsub(
      %r{
        <url>\s*
        <loc>https?://[^<]*/assets/muhammad-zubair-resume\.pdf</loc>
        .*?
        </url>
      }mx,
      ""
    )

    File.write(sitemap, filtered)
  end
end