Jekyll::Hooks.register :site, :post_write do |site|
  patterns = [
    File.join(site.dest, "tags", "**", "index.html"),
    File.join(site.dest, "categories", "**", "index.html"),
    File.join(site.dest, "page*", "index.html")
  ]

  patterns.each do |pattern|
    Dir.glob(pattern).each do |file|
      content = File.read(file)
      next if content.include?('name="robots"')
      content = content.sub("</head>", "  <meta name=\"robots\" content=\"noindex, follow\">\n</head>")
      File.write(file, content)
    end
  end
end
