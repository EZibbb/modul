"""
Apply visual enhancements to graphify-out/graph.html.
Re-runnable: idempotent. Run after every /graphify or /graphify --update.

v5 2026-05-17 — Cosmos feel:
  - Gradient edges (custom-drawn, source-community color → target-community color)
  - Native edges hidden (alpha 0) — we own all edge rendering now
  - Stars layer on background (300 stars in network-space — pan/zoom with graph)
  - Subtle radial vignette via CSS
  - Hover focus still primary mode (dim non-neighbors, labels on neighbors,
    pulses on connected edges)
v4 2026-05-17 — iOS-minimalist redesign:
  - Default: NO labels visible, NO pulses, NO glow, NO community names
  - On HOVER over node: focus mode (dim non-neighbors), labels appear on
    hovered + neighbors, pulses run on connected edges only
  - On BLUR: everything restores to clean minimal state
  - Thinner edges, subtle white tones, no flashy background
  - Toggles in sidebar to opt-in to always-on effects

Usage:
    python graphify-out/_apply_enhancements.py
"""
import json
import re
import sys
from pathlib import Path

HTML = Path(__file__).parent / "graph.html"
GRAPH_JSON = Path(__file__).parent / "graph.json"
START_MARKER = "<!-- ULAY_VISUAL_ENHANCEMENTS_START -->"
END_MARKER = "<!-- ULAY_VISUAL_ENHANCEMENTS_END -->"


def load_hyperedges():
    if not GRAPH_JSON.exists():
        return []
    try:
        data = json.loads(GRAPH_JSON.read_text(encoding="utf-8"))
        return data.get("hyperedges", []) or []
    except Exception as e:
        print("WARN: failed to read hyperedges from graph.json:", e, file=sys.stderr)
        return []


ENHANCEMENTS_JS = r"""
<!-- ULAY_VISUAL_ENHANCEMENTS_START -->
<script>
window.ULAY_HYPEREDGES = __HYPEREDGES_JSON__;
</script>
<style>
  body { background: #000; }
  #graph {
    background:
      radial-gradient(ellipse at 30% 20%, rgba(40,30,80,0.18) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 80%, rgba(20,40,70,0.15) 0%, transparent 55%),
      radial-gradient(circle at center, #0d0d14 0%, #050508 70%, #000 100%);
  }
  #graph::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%);
  }
  #sidebar {
    background: rgba(20,20,24,0.92) !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-left: 1px solid rgba(255,255,255,0.06) !important;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI Variable", Inter, sans-serif;
  }
  #sidebar h3 { color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 500; }
  #legend-controls { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; margin-bottom: 10px; }
  #legend-controls label { font-size: 12px; color: rgba(255,255,255,0.72); cursor: pointer; user-select: none; display: flex; align-items: center; gap: 6px; }
  #legend-controls input[type=checkbox] { accent-color: #0a84ff; }
</style>
<script>
console.log('[ulay-vis] enhancements v5 (cosmos + gradient edges) loading...');
function ulayApplyEnhancements() {
  if (typeof network === 'undefined' || typeof nodesDS === 'undefined') {
    return setTimeout(ulayApplyEnhancements, 200);
  }
  try {

  // ============ STATE ============
  window.ULAY_VIS = {
    hoverFocus: true,            // primary mode: dim non-neighbors on hover
    alwaysShowLabels: false,     // show every node's label permanently
    alwaysShowCommunityNames: false,
    alwaysShowPulses: false,
    bloom: false,
    showHyperedges: false,
  };

  // ============ HEX HELPERS ============
  function normHex(h) {
    if (!h) return '#888888';
    h = String(h).trim();
    if (h[0] !== '#') h = '#' + h;
    if (h.length === 4) return '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
    return h.length >= 7 ? h.substring(0, 7) : '#888888';
  }
  function hexToRgba(h, a) {
    h = normHex(h);
    return 'rgba(' + parseInt(h.substring(1,3),16) + ',' + parseInt(h.substring(3,5),16) + ',' + parseInt(h.substring(5,7),16) + ',' + a + ')';
  }

  // ============ INDEX ============
  const NODES = nodesDS.get();
  const EDGES = edgesDS.get();
  const nodeById = {};
  NODES.forEach(n => { nodeById[n.id] = n; });

  const ORIG_NODE_COLORS = {};
  NODES.forEach(n => {
    let bg;
    if (n.color && typeof n.color === 'object') bg = n.color.background;
    else if (typeof n.color === 'string') bg = n.color;
    ORIG_NODE_COLORS[n.id] = normHex(bg || '#888888');
  });

  const communityNodes = {};
  NODES.forEach(n => {
    const cid = n._community;
    if (cid === undefined || cid === null) return;
    (communityNodes[cid] = communityNodes[cid] || []).push(n.id);
  });

  // ============ SET MINIMAL GLOBAL STYLE ============
  // Hide all labels by default, HIDE native edges (we draw them ourselves with gradient)
  network.setOptions({
    nodes: {
      font: { size: 0 },
      borderWidth: 0,
      shadow: false,
    },
    edges: {
      width: 0.001,                                       // native edges invisible
      color: { color: 'rgba(0,0,0,0)', highlight: 'rgba(0,0,0,0)', hover: 'rgba(0,0,0,0)', opacity: 0 },
      smooth: { type: 'continuous', roundness: 0.12 },    // KEEP smooth so getPoint(t) gives a curve
      arrows: { to: { enabled: false } },
      hoverWidth: 0,
      selectionWidth: 0,
    },
    interaction: { hover: true, tooltipDelay: 250, hideEdgesOnDrag: false },
  });

  // ============ STARS LAYER (cosmos backdrop) ============
  const STARS = [];
  for (let i = 0; i < 320; i++) {
    STARS.push({
      x: (Math.random() - 0.5) * 6000,
      y: (Math.random() - 0.5) * 6000,
      r: Math.random() * 1.1 + 0.2,
      a: Math.random() * 0.6 + 0.15,
      // 3 brightness tiers — fakes parallax depth
      tier: Math.random() < 0.15 ? 'near' : (Math.random() < 0.5 ? 'mid' : 'far'),
    });
  }
  function drawStars(ctx) {
    ctx.save();
    STARS.forEach(s => {
      let color;
      if (s.tier === 'near') color = 'rgba(255,255,255,' + (s.a * 0.9) + ')';
      else if (s.tier === 'mid') color = 'rgba(200,210,255,' + (s.a * 0.6) + ')';
      else color = 'rgba(140,150,200,' + (s.a * 0.35) + ')';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ============ EDGES BY NODE (for fast hover lookup) ============
  const edgesByNode = {};
  EDGES.forEach(e => {
    (edgesByNode[e.from] = edgesByNode[e.from] || []).push(e.id);
    (edgesByNode[e.to]   = edgesByNode[e.to]   || []).push(e.id);
  });
  const edgeById = {};
  EDGES.forEach(e => { edgeById[e.id] = e; });

  // ============ HOVER FOCUS ============
  let hoveredId = null;
  let focusActive = false;

  function focusOnNode(nodeId) {
    const neighbors = new Set(network.getConnectedNodes(nodeId));
    neighbors.add(nodeId);

    // Only update NODES (edges are owned by our gradient renderer in beforeDrawing)
    const nodeUpdates = NODES.map(n => {
      const isFocused = neighbors.has(n.id);
      return {
        id: n.id,
        opacity: isFocused ? 1 : 0.08,
        font: isFocused
          ? { size: n.id === nodeId ? 13 : 11, color: 'rgba(255,255,255,0.95)', strokeWidth: 3, strokeColor: '#000' }
          : { size: 0 },
      };
    });
    nodesDS.update(nodeUpdates);

    hoveredId = nodeId;
    focusActive = true;
    startAnimationLoop();
  }

  function clearFocus() {
    const labelSize = window.ULAY_VIS.alwaysShowLabels ? 10 : 0;
    const labelColor = 'rgba(255,255,255,0.75)';
    const nodeUpdates = NODES.map(n => ({
      id: n.id,
      opacity: 1,
      font: { size: labelSize, color: labelColor, strokeWidth: 2, strokeColor: '#000' },
    }));
    nodesDS.update(nodeUpdates);
    hoveredId = null;
    focusActive = false;
    if (!window.ULAY_VIS.alwaysShowPulses) {
      stopAnimationLoop();
      // Single redraw so edges re-render in baseline state
      network.body.emitter.emit('_requestRedraw');
    }
  }

  network.on('hoverNode', function(params) {
    if (window.ULAY_VIS.hoverFocus) focusOnNode(params.node);
  });
  network.on('blurNode', function(params) {
    if (window.ULAY_VIS.hoverFocus) clearFocus();
  });
  // Click — same as hover (sticky focus until next click on empty)
  network.on('click', function(params) {
    if (!window.ULAY_VIS.hoverFocus) return;
    if (params.nodes && params.nodes.length) focusOnNode(params.nodes[0]);
    else clearFocus();
  });

  // ============ ANIMATION LOOP (pulses only when needed) ============
  let pulseT = 0;
  let rafId = null;
  let lastFrame = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    pulseT = (pulseT + dt * 0.4) % 1;
    network.body.emitter.emit('_requestRedraw');
    rafId = requestAnimationFrame(tick);
  }
  function startAnimationLoop() {
    if (rafId !== null) return;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(tick);
  }
  function stopAnimationLoop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    network.body.emitter.emit('_requestRedraw');
  }

  // ============ POINT ON EDGE ============
  function pointOnEdge(edgeId, t) {
    try {
      const be = network.body.edges[edgeId];
      if (be && be.edgeType && be.edgeType.getPoint) {
        const p = be.edgeType.getPoint(t);
        if (p && isFinite(p.x) && isFinite(p.y)) return p;
      }
    } catch (e) {}
    return null;
  }

  // ============ CONVEX HULL (monotone chain) ============
  function convexHull(points) {
    if (points.length < 3) return points.slice();
    const sorted = points.slice().sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
    const cross = (O, A, B) => (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
    const lower = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }

  const ulayHyperedges = (window.ULAY_HYPEREDGES && Array.isArray(window.ULAY_HYPEREDGES)) ? window.ULAY_HYPEREDGES : [];

  // ============ GRADIENT EDGE DRAWING ============
  // Draw an edge as N segments, each with interpolated color between source/target community colors.
  // Smooth curves are followed via vis-network internal getPoint(t).
  function drawGradientEdge(ctx, edge, alpha, width) {
    const cFrom = ORIG_NODE_COLORS[edge.from];
    const cTo   = ORIG_NODE_COLORS[edge.to];
    if (!cFrom || !cTo) return;
    const ar = parseInt(cFrom.substring(1,3),16), ag = parseInt(cFrom.substring(3,5),16), ab = parseInt(cFrom.substring(5,7),16);
    const br = parseInt(cTo.substring(1,3),16),   bg = parseInt(cTo.substring(3,5),16),   bb = parseInt(cTo.substring(5,7),16);
    const SEG = 10;
    let prev = pointOnEdge(edge.id, 0);
    if (!prev) {
      const fromPos = network.getPositions([edge.from])[edge.from];
      const toPos   = network.getPositions([edge.to])[edge.to];
      if (!fromPos || !toPos) return;
      prev = fromPos;
      for (let i = 1; i <= SEG; i++) {
        const t = i / SEG;
        const p = { x: fromPos.x + (toPos.x - fromPos.x) * t, y: fromPos.y + (toPos.y - fromPos.y) * t };
        const r = Math.round(ar + (br - ar) * t);
        const g = Math.round(ag + (bg - ag) * t);
        const b = Math.round(ab + (bb - ab) * t);
        ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        prev = p;
      }
      return;
    }
    for (let i = 1; i <= SEG; i++) {
      const t = i / SEG;
      const p = pointOnEdge(edge.id, t);
      if (!p) break;
      const r = Math.round(ar + (br - ar) * t);
      const g = Math.round(ag + (bg - ag) * t);
      const b = Math.round(ab + (bb - ab) * t);
      ctx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      prev = p;
    }
  }

  // ============ BEFORE DRAWING — stars + gradient edges + community names ============
  network.on('beforeDrawing', function(ctx) {
    // STARS — cosmic backdrop (in network space, so they pan/zoom with graph)
    drawStars(ctx);

    // GRADIENT EDGES — drawn UNDER nodes (beforeDrawing fires before native node render)
    const connectedEdgeIds = hoveredId !== null
      ? new Set(network.getConnectedEdges(hoveredId))
      : null;
    EDGES.forEach(e => {
      let alpha, width;
      if (connectedEdgeIds) {
        if (connectedEdgeIds.has(e.id)) { alpha = 0.85; width = 1.6; }
        else { alpha = 0.05; width = 0.5; }
      } else {
        // No hover — connections clearly visible
        alpha = 0.45;
        width = 1.0;
      }
      drawGradientEdge(ctx, e, alpha, width);
    });

    // COMMUNITY NAMES (toggle)
    if (!window.ULAY_VIS.alwaysShowCommunityNames) return;
    const scale = network.getScale();
    Object.keys(communityNodes).forEach(cid => {
      const ids = communityNodes[cid];
      if (ids.length < 10) return;
      const positions = ids.map(id => network.getPositions([id])[id]).filter(Boolean);
      if (positions.length < 3) return;
      const cx = positions.reduce((s, p) => s + p.x, 0) / positions.length;
      const cy = positions.reduce((s, p) => s + p.y, 0) / positions.length;
      const label = (nodeById[ids[0]] && nodeById[ids[0]]._community_name) || ('C' + cid);
      const trimmed = label.length > 36 ? label.substring(0, 36) + '…' : label;
      ctx.save();
      const fontSize = Math.max(11, Math.min(20, Math.sqrt(ids.length) * 3)) / scale;
      ctx.globalAlpha = 0.10;
      ctx.fillStyle = '#ffffff';
      ctx.font = '300 ' + fontSize + 'px -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(trimmed, cx, cy);
      ctx.restore();
    });
  });

  // ============ AFTER DRAWING — pulses + bloom + hyperedges ============
  network.on('afterDrawing', function(ctx) {
    // PULSES — only on connected edges when a node is focused, or all if toggle
    const showPulsesNow = (hoveredId !== null) || window.ULAY_VIS.alwaysShowPulses;
    if (showPulsesNow) {
      const targetEdges = hoveredId !== null
        ? (edgesByNode[hoveredId] || []).map(id => edgeById[id]).filter(Boolean)
        : EDGES;
      const limit = Math.min(targetEdges.length, hoveredId !== null ? 80 : 40);
      for (let i = 0; i < limit; i++) {
        const edge = targetEdges[i];
        const localT = (pulseT + i * 0.07) % 1;
        const p = pointOnEdge(edge.id, localT);
        if (!p) continue;
        const cFrom = ORIG_NODE_COLORS[edge.from];
        const cTo = ORIG_NODE_COLORS[edge.to];
        if (!cFrom || !cTo) continue;
        const ah = cFrom, bh = cTo;
        const ar = parseInt(ah.substring(1,3),16), ag = parseInt(ah.substring(3,5),16), ab = parseInt(ah.substring(5,7),16);
        const br = parseInt(bh.substring(1,3),16), bg = parseInt(bh.substring(3,5),16), bb = parseInt(bh.substring(5,7),16);
        const r = Math.round(ar + (br - ar) * localT);
        const g = Math.round(ag + (bg - ag) * localT);
        const b = Math.round(ab + (bb - ab) * localT);
        ctx.save();
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',0.18)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      }
    }

    // BLOOM — soft glow on god-nodes (toggle)
    if (window.ULAY_VIS.bloom) {
      NODES.forEach(n => {
        const deg = n._degree || 0;
        if (deg < 25) return;
        const pos = network.getPositions([n.id])[n.id];
        if (!pos) return;
        const color = ORIG_NODE_COLORS[n.id];
        const radius = Math.min(28, 8 + Math.sqrt(deg) * 1.8);
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
        grad.addColorStop(0, hexToRgba(color, 0.22));
        grad.addColorStop(1, hexToRgba(color, 0));
        ctx.save(); ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, radius, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });
    }

    // HYPEREDGES — convex hull (toggle, off by default)
    if (window.ULAY_VIS.showHyperedges && ulayHyperedges.length) {
      ulayHyperedges.forEach(h => {
        if (h.nodes.length > 25) return;
        const positions = h.nodes.map(nid => network.getPositions([nid])[nid]).filter(p => p !== undefined);
        if (positions.length < 3) return;
        const hull = convexHull(positions);
        if (hull.length < 3) return;
        const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
        const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
        const expanded = hull.map(p => ({ x: cx + (p.x - cx) * 1.05, y: cy + (p.y - cy) * 1.05 }));
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = '#0a84ff';
        ctx.beginPath();
        ctx.moveTo(expanded[0].x, expanded[0].y);
        expanded.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#0a84ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#a5c8ff';
        ctx.font = '500 10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(h.label, cx, cy);
        ctx.restore();
      });
    }
  });

  // ============ UI TOGGLES ============
  function attachToggle(id, key, label) {
    const ctrl = document.getElementById('legend-controls');
    if (!ctrl) return;
    let existing = document.getElementById(id);
    if (existing) existing.parentElement.remove();
    const lbl = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = id;
    cb.checked = window.ULAY_VIS[key];
    cb.addEventListener('change', () => {
      window.ULAY_VIS[key] = cb.checked;
      if (key === 'alwaysShowLabels') clearFocus();
      if (key === 'alwaysShowPulses') {
        if (cb.checked) startAnimationLoop(); else if (!focusActive) stopAnimationLoop();
      }
      network.body.emitter.emit('_requestRedraw');
    });
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(' ' + label));
    ctrl.appendChild(lbl);
  }

  // Remove legacy "Show hyperedges" handler (from earlier patches)
  const oldHyper = document.getElementById('hyperedge-cb');
  if (oldHyper && oldHyper.parentElement) oldHyper.parentElement.remove();

  attachToggle('hover-focus-cb', 'hoverFocus', 'Hover focus (dim non-neighbors)');
  attachToggle('always-labels-cb', 'alwaysShowLabels', 'Always show node labels');
  attachToggle('comm-names-cb', 'alwaysShowCommunityNames', 'Show community names');
  attachToggle('always-pulses-cb', 'alwaysShowPulses', 'Always animate pulses');
  attachToggle('bloom-cb', 'bloom', 'Bloom on hubs');
  attachToggle('hyperedge-cb', 'showHyperedges', 'Show hyperedge groups');

  // Initial clean state
  clearFocus();

  console.log('[ulay-vis] v4 ready —', NODES.length, 'nodes,', EDGES.length, 'edges,', ulayHyperedges.length, 'hyperedges. Hover any node to focus.');
  } catch (err) {
    console.error('[ulay-vis] ERROR:', err);
  }
}
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(ulayApplyEnhancements, 100);
} else {
  document.addEventListener('DOMContentLoaded', ulayApplyEnhancements);
}
</script>
<!-- ULAY_VISUAL_ENHANCEMENTS_END -->
"""


def main():
    if not HTML.exists():
        print("ERROR: " + str(HTML) + " not found. Run /graphify first.", file=sys.stderr)
        sys.exit(1)

    html = HTML.read_text(encoding="utf-8")

    # Remove previous injection (idempotent)
    pattern = re.compile(
        re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER) + r"\s*",
        re.DOTALL,
    )
    html_clean = pattern.sub("", html)

    legacy_hyper = re.compile(
        r"<script>\s*\n?// Render hyperedges as shaded regions.*?</script>",
        re.DOTALL,
    )
    html_clean = legacy_hyper.sub("", html_clean)

    legacy_toggle = re.compile(
        r"<script>\s*\n?// Toggle state.*?network\.on\('afterDrawing'.*?\}\);\s*</script>",
        re.DOTALL,
    )
    html_clean = legacy_toggle.sub("", html_clean)

    if "</body>" not in html_clean:
        print("ERROR: no </body> tag found in graph.html", file=sys.stderr)
        sys.exit(2)

    hyperedges = load_hyperedges()
    hyperedges_json = json.dumps(hyperedges, ensure_ascii=False)
    payload = ENHANCEMENTS_JS.replace("__HYPEREDGES_JSON__", hyperedges_json)
    html_new = html_clean.replace("</body>", payload + "\n</body>")

    HTML.write_text(html_new, encoding="utf-8")

    delta = len(html_new) - len(html)
    print("Enhancements v5 (cosmos + gradient edges) applied to " + str(HTML))
    print("Hyperedges injected: " + str(len(hyperedges)))
    print("Delta: " + ("+" if delta >= 0 else "") + str(delta) + " bytes")
    print("Reload graph.html (Ctrl+Shift+R). Hover a node to focus.")


if __name__ == "__main__":
    main()
