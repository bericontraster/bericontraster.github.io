document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("div.highlight").forEach((block) => {
    const button = document.createElement("button");
    button.className = "copy-button";
    button.type = "button";
    button.innerText = "Copy";

    button.addEventListener("click", () => {
      const code = block.querySelector("code");
      if (!code) return;

      navigator.clipboard.writeText(code.innerText).then(() => {
        button.innerText = "Copied!";
        setTimeout(() => (button.innerText = "Copy"), 2000);
      });
    });

    block.appendChild(button);
  });
});
