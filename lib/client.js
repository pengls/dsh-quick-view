window.__ModuleLoader__.load({ id: "@pengls/dsh-quick-view", factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.ts
var index_exports = {};
__export(index_exports, {
  NS: () => NS,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/locales.ts
var en = {
  title: "Previous inputs",
  jump: "Jump to",
  empty: "(empty)"
};
var zh = {
  title: "\u4E4B\u524D\u7684\u8F93\u5165",
  jump: "\u8DF3\u8F6C\u5230",
  empty: "\uFF08\u7A7A\uFF09"
};

// src/client/QuickViewPanel.tsx
var import_react = require("react");
var import_react_dom = require("react-dom");
var import_jsx_runtime = require("react/jsx-runtime");
function preview(content) {
  const text = content.map((block) => block.type === "text" ? block.text : "").join(" ").trim().replace(/\s+/g, " ");
  return text.length <= 80 ? text : `${text.slice(0, 80).trimEnd()}\u2026`;
}
function userMessages(order, nodes) {
  const out = [];
  for (const key of order) {
    const node = nodes.get(key);
    if (node !== void 0 && node.kind === "user") {
      out.push({ key, preview: preview(node.data.content) });
    }
  }
  return out;
}
function scrollToKey(key) {
  const scrollport = document.querySelector("[data-conversation-scroll]");
  if (scrollport === null) return;
  const row = scrollport.querySelector(`[data-chat-anchor-key="${key}"]`);
  if (row === null) return;
  const top = row.getBoundingClientRect().top - scrollport.getBoundingClientRect().top;
  scrollport.scrollTop += top - 64;
}
var anchorStyle = {
  position: "fixed",
  top: "50%",
  right: "16px",
  transform: "translateY(-50%)",
  zIndex: 40
};
var panelBaseStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "10px",
  borderRadius: "12px",
  border: "1px solid transparent",
  background: "transparent",
  transition: "background 180ms ease, box-shadow 180ms ease, border-color 180ms ease"
};
var panelOpenStyle = {
  border: "1px solid rgba(127,127,127,0.35)",
  background: "var(--dsw-surface, rgba(28,28,31,0.94))",
  boxShadow: "0 10px 32px rgba(0,0,0,0.45)"
};
var rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "10px",
  minHeight: "22px",
  border: "none",
  borderRadius: "8px",
  background: "transparent",
  color: "inherit",
  cursor: "pointer"
};
var rowHoverStyle = {
  ...rowStyle,
  background: "rgba(127,127,127,0.16)"
};
var textStyle = {
  maxWidth: "0px",
  opacity: 0,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  transition: "max-width 180ms ease, opacity 180ms ease"
};
var textOpenStyle = {
  maxWidth: "230px",
  opacity: 1
};
function dashColor(isSelected, isHovered) {
  if (isHovered) return "#ffffff";
  return isSelected ? "var(--dsw-alias-state-business-primary, #2f6fed)" : "rgba(120,120,128,0.9)";
}
function dashStyle(isSelected, isHovered) {
  return {
    flex: "none",
    width: "12px",
    height: "3px",
    borderRadius: "2px",
    background: dashColor(isSelected, isHovered),
    transition: "background 120ms ease"
  };
}
function textColor(isSelected, isHovered) {
  if (isHovered) return "#ffffff";
  return isSelected ? "var(--dsw-alias-state-business-primary, #2f6fed)" : "var(--dsw-text, #ececf1)";
}
function QuickViewPanel({ useSession, t }) {
  const [hovered, setHovered] = (0, import_react.useState)(false);
  const [hoverKey, setHoverKey] = (0, import_react.useState)(null);
  const [selectedKey, setSelectedKey] = (0, import_react.useState)(null);
  const order = useSession((s) => s.chat.order);
  const nodes = useSession((s) => s.chat.nodes);
  const list = (0, import_react.useMemo)(() => userMessages(order, nodes), [order, nodes]);
  if (list.length <= 1) return null;
  const activeKey = selectedKey ?? list[list.length - 1].key;
  return (0, import_react_dom.createPortal)(
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "div",
      {
        style: anchorStyle,
        role: "navigation",
        "aria-label": t("title"),
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => {
          setHovered(false);
          setHoverKey(null);
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: hovered ? { ...panelBaseStyle, ...panelOpenStyle } : panelBaseStyle, children: list.map(({ key, preview: text }) => {
          const isSelected = activeKey === key;
          const isHovered = hoverKey === key;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              type: "button",
              style: {
                ...isHovered ? rowHoverStyle : rowStyle,
                color: textColor(isSelected, isHovered)
              },
              title: text === "" ? t("empty") : `${t("jump")}: ${text}`,
              onMouseEnter: () => setHoverKey(key),
              onMouseLeave: () => setHoverKey(null),
              onClick: () => {
                setSelectedKey(key);
                scrollToKey(key);
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: hovered ? { ...textStyle, ...textOpenStyle } : textStyle, children: text === "" ? t("empty") : text }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: dashStyle(isSelected, isHovered) })
              ]
            },
            key
          );
        }) })
      }
    ),
    document.body
  );
}

// src/client/index.ts
var NS = "quickView";
var inject = ["slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-quick-view: dictionaries");
  ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register(
    { name: "conversation.session.header.utilities", id: NS, order: 0, locale: NS },
    QuickViewPanel
  ));
}
return module.exports; } });
//# sourceMappingURL=client.js.map
