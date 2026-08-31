(() => {
  const renderMermaid = async () => {
    const nodes = [...document.querySelectorAll("pre.mermaid")].map((pre) => {
      const diagram = document.createElement("div");
      diagram.className = "mermaid";
      diagram.textContent = pre.textContent.trim();
      pre.replaceWith(diagram);
      return diagram;
    });

    if (nodes.length === 0 || !window.mermaid) {
      return;
    }

    try {
      await window.mermaid.run({ nodes });
    } catch (error) {
      console.error("Mermaid diagram rendering failed.", error);
    }
  };

  if (!window.mermaid) {
    return;
  }

  window.mermaid.initialize({ startOnLoad: false });
  void renderMermaid();

  if (typeof document$ !== "undefined") {
    document$.subscribe(() => void renderMermaid());
  }
})();
