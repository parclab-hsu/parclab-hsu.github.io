document.querySelectorAll("pre.mermaid").forEach((pre) => {
  const diagram = document.createElement("div");
  diagram.className = "mermaid";
  diagram.textContent = pre.textContent.trim();
  pre.replaceWith(diagram);
});
