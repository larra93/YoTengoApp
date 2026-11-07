import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = dirname(fileURLToPath(import.meta.url));

const icons = `
<svg class="sprite" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></symbol>
  <symbol id="i-bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></symbol>
  <symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></symbol>
  <symbol id="i-chev-right" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9L12 3Z"/></symbol>
  <symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></symbol>
  <symbol id="i-camera" viewBox="0 0 24 24"><path d="M4 7h3l1.5-2h7L17 7h3v12H4z"/><circle cx="12" cy="13" r="3.5"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-chat" viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/></symbol>
  <symbol id="i-user" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></symbol>
  <symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></symbol>
  <symbol id="i-more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 15-5-5L5 19"/></symbol>
  <symbol id="i-dollar" viewBox="0 0 24 24"><path d="M12 2v20"/><path d="M17 6.5c0-2-2.2-3.5-5-3.5S7 4.5 7 6.5 9.2 10 12 10s5 1.5 5 3.5-2.2 3.5-5 3.5-5-1.5-5-3.5"/></symbol>
  <symbol id="i-repeat" viewBox="0 0 24 24"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></symbol>
  <symbol id="i-swap" viewBox="0 0 24 24"><path d="M7 7h11l-3-3M17 17H6l3 3"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="m20 6-11 11-5-5"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
  <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></symbol>
  <symbol id="i-tag" viewBox="0 0 24 24"><path d="M20 13 13 20a2 2 0 0 1-3 0L4 14V4h10l7 7a2 2 0 0 1 0 3Z"/><circle cx="8" cy="8" r="1.5"/></symbol>
  <symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 4l3 3M14 6l3 3"/></symbol>
  <symbol id="i-settings" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/></symbol>
  <symbol id="i-edit" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></symbol>
  <symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-.8.6-1.5 1.1-1.5 2.5"/><path d="M12 17h.01"/></symbol>
  <symbol id="i-logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></symbol>
  <symbol id="i-drill" viewBox="0 0 24 24"><path d="M3 10h9l2-3h5v6h-5l-2-3H3z"/><path d="M7 13v6h4v-6"/><path d="M19 11h2"/></symbol>
  <symbol id="i-helmet" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><rect x="7" y="10" width="10" height="5" rx="2.5"/><path d="M12 4v2"/><circle cx="17.5" cy="6.5" r="1"/></symbol>
  <symbol id="i-board" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 4v16M15 4v16M4 9h16M4 15h16"/></symbol>
  <symbol id="i-signal" viewBox="0 0 24 24"><rect x="2" y="12" width="3" height="6" rx="1"/><rect x="7" y="9" width="3" height="9" rx="1"/><rect x="12" y="6" width="3" height="12" rx="1"/><rect x="17" y="3" width="3" height="15" rx="1"/></symbol>
  <symbol id="i-wifi" viewBox="0 0 24 24"><path d="M2 9a15 15 0 0 1 20 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-battery" viewBox="0 0 24 24"><rect x="2" y="7" width="18" height="10" rx="2"/><rect x="4" y="9" width="13" height="6" rx="1" fill="currentColor" stroke="none"/><path d="M22 10v4"/></symbol>
  <symbol id="i-send" viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></symbol>
  <symbol id="i-sparkles" viewBox="0 0 24 24"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="M19 17v4M17 19h4"/></symbol>
  <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></symbol>
</svg>`;

const ic = (name, cls = "") => `<svg class="icon ${cls}"><use href="#${name}"></use></svg>`;

const statusbar = () => `
  <div class="statusbar">
    <span>9:41</span>
    <div class="status-icons">
      ${ic("i-signal", "fill")}
      ${ic("i-wifi")}
      ${ic("i-battery", "fill")}
    </div>
  </div>`;

const tabbar = (active) => {
  const tab = (id, label, icon, cls = "") => `
    <div class="tab ${active === id ? "active" : ""} ${cls}">
      ${id === "publish"
        ? `<div class="plus">${ic(icon)}</div><span>${label}</span>`
        : `${ic(icon)}<span>${label}</span>`}
    </div>`;
  return `
    <nav class="tabbar">
      ${tab("explore", "Explorar", "i-search")}
      ${tab("publish", "Publicar", "i-plus")}
      ${tab("negotiations", "Negociaciones", "i-chat", "badge-dot")}
      ${tab("profile", "Perfil", "i-user")}
    </nav>`;
};

const shell = ({ title, body, activeTab }) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title} — YoTengoApp</title>
  <link rel="stylesheet" href="mockups.css">
</head>
<body class="screen">
  ${icons}
  <div class="phone">
    ${statusbar()}
    ${body}
    ${activeTab ? tabbar(activeTab) : ""}
  </div>
</body>
</html>
`;

const thumb = (type, icon) => `<div class="thumb ${type}">${ic(icon)}</div>`;

const needCard = ({
  type,
  icon,
  deal,
  dealIcon,
  dealLabel,
  distance,
  title,
  dates,
  offers,
  initials,
  author,
  rating,
  price,
}) => `
  <article class="need-card">
    ${thumb(type, icon)}
    <div class="need-body">
      <div class="row between">
        <span class="badge ${deal}">${ic(dealIcon)} ${dealLabel}</span>
        <span class="muted tiny">${distance}</span>
      </div>
      <h3>${title}</h3>
      <div class="meta">${ic("i-calendar")} ${dates}<span class="dot"></span>${offers}</div>
      <div class="cardfoot">
        <div class="author"><span class="mini">${initials}</span>${author} <span class="star">${ic("i-star")} ${rating}</span></div>
        <span class="price">${price}</span>
      </div>
    </div>
  </article>`;

const screenExplore = shell({
  title: "Explorar pedidos",
  activeTab: "explore",
  body: `
  <div class="apphead">
    <div class="row between">
      <div>
        <p class="greeting">Buenas tardes</p>
        <h1 class="title">Hola, Camila</h1>
      </div>
      <div class="row gap8">
        <div class="iconbtn">${ic("i-bell")}</div>
        <div class="avatar">CR<span class="online"></span></div>
      </div>
    </div>
    <div class="row location-row">
      ${ic("i-pin")} Ñuñoa, Santiago
      <span class="pill-soft">${ic("i-pin")} 5 km</span>
    </div>
  </div>

  <div class="search">
    ${ic("i-search")}
    <span>¿Qué necesitas hoy?</span>
    ${ic("i-filter", "filter")}
  </div>

  <div class="chips">
    <span class="chip active">Todos</span>
    <span class="chip">Disfraces</span>
    <span class="chip">Herramientas</span>
    <span class="chip">Libros</span>
    <span class="chip">Juegos</span>
  </div>

  <div class="section-head">
    <h2>Cerca de ti</h2>
    <span>12 pedidos abiertos</span>
  </div>

  ${needCard({
    type: "costume",
    icon: "i-helmet",
    deal: "rent",
    dealIcon: "i-key",
    dealLabel: "Arriendo",
    distance: "1,2 km",
    title: "Disfraz de astronauta para niño",
    dates: "12–15 nov",
    offers: "3 ofertas",
    initials: "VR",
    author: "Valentina R.",
    rating: "4.9",
    price: "$8.000<span>/día</span>",
  })}

  ${needCard({
    type: "tool",
    icon: "i-drill",
    deal: "loan",
    dealIcon: "i-repeat",
    dealLabel: "Préstamo",
    distance: "2,4 km",
    title: "Taladro percutor para mueble",
    dates: "10 nov",
    offers: "1 oferta",
    initials: "JM",
    author: "Javier M.",
    rating: "4.8",
    price: "Café + devolución",
  })}

  ${needCard({
    type: "game",
    icon: "i-board",
    deal: "swap",
    dealIcon: "i-swap",
    dealLabel: "Trueque",
    distance: "3,1 km",
    title: "Juego de mesa Catan",
    dates: "Este finde",
    offers: "5 ofertas",
    initials: "PS",
    author: "Pedro S.",
    rating: "4.7",
    price: "Trueque por juego",
  })}`,
});

const screenPublish = shell({
  title: "Publicar necesidad",
  activeTab: "publish",
  body: `
  <div class="apphead">
    <h1 class="title">Publicar necesidad</h1>
    <p class="subtitle">Cuéntale a tus vecinos qué buscas.</p>
  </div>

  <div class="form">
    <div class="field">
      <label>¿Qué necesitas?</label>
      <div class="input"><span class="placeholder">Ej: Disfraz de astronauta talla 6</span></div>
    </div>

    <div class="field">
      <label>Tipo de trato</label>
      <div class="segment">
        <button class="active">${ic("i-key")} Arrendar</button>
        <button>${ic("i-repeat")} Préstamo</button>
        <button>${ic("i-swap")} Trueque</button>
      </div>
    </div>

    <div class="two-col">
      <div class="field">
        <label>Categoría</label>
        <div class="input">Disfraces ${ic("i-chev-right", "chev")}</div>
      </div>
      <div class="field">
        <label>Fechas</label>
        <div class="input">${ic("i-calendar")} 12 – 15 nov</div>
      </div>
    </div>

    <div class="field">
      <label>Descripción</label>
      <div class="input placeholder">Cuéntanos para qué lo necesitas...</div>
    </div>

    <div class="field">
      <label>Presupuesto o qué ofreces</label>
      <div class="input"><span class="placeholder">Ej: $8.000 por día o trueque por juego</span></div>
    </div>

    <div class="field">
      <label>Foto de referencia (opcional)</label>
      <div class="upload">
        ${ic("i-camera")}
        <span>Agregar foto</span>
        <span class="tiny muted">JPG o PNG · máx. 5 MB</span>
      </div>
    </div>

    <button class="btn primary block">Publicar necesidad</button>
  </div>`,
});

const offerCard = ({ initials, name, rating, time, status, statusLabel, type, icon, item, detail, price, quote }) => `
  <article class="offer-card">
    <div class="top">
      <div class="who">
        <div class="avatar sm">${initials}</div>
        <div>
          <p class="name">${name} <span class="star">${ic("i-star")} ${rating}</span></p>
          <p class="sub">Ofreció ${time}</p>
        </div>
      </div>
      <span class="badge ${status}">${statusLabel}</span>
    </div>
    <div class="offer-item">
      <div class="thumb ${type}">${ic(icon)}</div>
      <div class="oi-copy">
        <strong>${item}</strong>
        <span>${detail}</span>
      </div>
      <div class="price">${price}</div>
    </div>
    <p class="quote">${quote}</p>
    <div class="offer-actions">
      <button class="btn ghost small">Rechazar</button>
      <button class="btn primary small">Aceptar oferta</button>
    </div>
  </article>`;

const screenNegotiations = shell({
  title: "Negociaciones",
  activeTab: "negotiations",
  body: `
  <div class="apphead">
    <h1 class="title">Negociaciones</h1>
    <p class="subtitle">Gestiona las ofertas de tus pedidos.</p>
  </div>

  <div class="tabs">
    <button class="active">Recibidas <span class="count">3</span></button>
    <button>Enviadas <span class="count">2</span></button>
  </div>

  <div class="banner">
    <div class="bicon">${ic("i-check")}</div>
    <div>
      <p class="bt">Oferta aceptada</p>
      <p class="bs">Coordina la entrega con Javier por chat.</p>
    </div>
    <button class="btn primary small">Chat</button>
  </div>

  ${offerCard({
    initials: "JM",
    name: "Javier M.",
    rating: "4.8",
    time: "hace 2 h",
    status: "pending",
    statusLabel: "Pendiente",
    type: "tool",
    icon: "i-drill",
    item: "Taladro Bosch GSB 550",
    detail: "Incluye brocas y maletín",
    price: "$5.000<span>/día</span>",
    quote: "“Está disponible desde el viernes. Te lo puedo dejar en el metro Chile España.”",
  })}

  ${offerCard({
    initials: "ML",
    name: "María L.",
    rating: "5.0",
    time: "hace 5 h",
    status: "pending",
    statusLabel: "Pendiente",
    type: "costume",
    icon: "i-helmet",
    item: "Disfraz completo talla 6",
    detail: "Casco, mochila y botas",
    price: "$6.000<span>/día</span>",
    quote: "“Lo usamos una sola vez, está impecable. Puedo entregarlo el viernes en la tarde.”",
  })}`,
});

const screenProfile = shell({
  title: "Mi perfil",
  activeTab: "profile",
  body: `
  <div class="apphead">
    <div class="row between">
      <div>
        <h1 class="title">Mi perfil</h1>
        <p class="subtitle">Tu reputación en la comunidad.</p>
      </div>
      <div class="iconbtn">${ic("i-settings")}</div>
    </div>
  </div>

  <div class="profile-card">
    <div class="top">
      <div class="avatar lg">CR<span class="online"></span></div>
      <div>
        <h2>Camila Rojas</h2>
        <div class="loc">${ic("i-pin")} Ñuñoa, Santiago</div>
        <div class="rating">
          <span class="star">${ic("i-star")} 4.9</span>
          <span class="muted">(12 reseñas)</span>
          <span class="verified">${ic("i-shield")} Verificada</span>
        </div>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><div class="n">8</div><div class="l">Pedidos</div></div>
      <div class="stat"><div class="n">14</div><div class="l">Ofertas</div></div>
      <div class="stat"><div class="n">6</div><div class="l">Trueques</div></div>
    </div>
  </div>

  <div class="section-head" style="margin-top:14px">
    <h2>Mis publicaciones</h2>
    <span>Ver todas</span>
  </div>

  <div class="mini-list">
    <div class="mini-item">
      <div class="thumb costume">${ic("i-helmet")}</div>
      <div class="copy">
        <strong>Disfraz de astronauta</strong>
        <span>Arriendo · 3 ofertas recibidas</span>
      </div>
      <span class="badge open">Abierto</span>
    </div>
    <div class="mini-item">
      <div class="thumb game">${ic("i-board")}</div>
      <div class="copy">
        <strong>Juego de mesa Catan</strong>
        <span>Trueque · 5 ofertas recibidas</span>
      </div>
      <span class="badge accepted">Matched</span>
    </div>
  </div>

  <div class="menu">
    <div class="menu-item">${ic("i-edit")} Editar perfil ${ic("i-chev-right", "chev")}</div>
    <div class="menu-item">${ic("i-star")} Mis reseñas ${ic("i-chev-right", "chev")}</div>
    <div class="menu-item">${ic("i-bell")} Notificaciones ${ic("i-chev-right", "chev")}</div>
    <div class="menu-item">${ic("i-help")} Ayuda y soporte ${ic("i-chev-right", "chev")}</div>
    <div class="menu-item logout">${ic("i-logout")} Cerrar sesión ${ic("i-chev-right", "chev")}</div>
  </div>`,
});

const screenDetail = shell({
  title: "Detalle del pedido",
  body: `
  <div class="navbar">
    <div class="iconbtn">${ic("i-arrow-left")}</div>
    <div class="navtitle">Detalle del pedido</div>
    <div class="spacer">
      <div class="iconbtn">${ic("i-share")}</div>
      <div class="iconbtn">${ic("i-more")}</div>
    </div>
  </div>

  <div class="content-scroll">
    <div class="hero">
      ${ic("i-helmet", "heroicon")}
      <div class="badges">
        <span class="badge rent">${ic("i-key")} Arriendo</span>
        <span class="badge open">${ic("i-clock")} Hace 2 h</span>
      </div>
      <div></div>
    </div>

    <div class="detail-body">
      <h1>Disfraz de astronauta para niño</h1>
      <div class="detail-meta">
        ${ic("i-calendar")} 12–15 nov
        <span class="dot"></span>
        ${ic("i-pin")} Ñuñoa · a 1,2 km
      </div>

      <div class="person">
        <div class="avatar sm">VR</div>
        <div>
          <p class="name">Valentina R.</p>
          <p class="sub"><span class="star">${ic("i-star")} 4.9</span> · 12 reseñas · Responde rápido</p>
        </div>
        <span class="link">Ver perfil</span>
      </div>

      <p class="desc">Necesito un disfraz de astronauta talla 6 para el cumpleaños de mi hijo. Idealmente con casco y mochila. Lo cuidamos mucho y lo devolvemos limpio.</p>

      <div class="offer-box">
        <div class="row between">
          <div class="big">$8.000 <span>/ día</span></div>
          <span class="badge open">Presupuesto</span>
        </div>
        <ul>
          <li>Incluye casco y mochila</li>
          <li>Retiro y devolución en Ñuñoa</li>
        </ul>
      </div>

      <div class="minimap">
        <div class="pin">${ic("i-pin")}</div>
        <div>
          <div class="place">Ñuñoa, Santiago</div>
          <div class="addr">A 1,2 km de tu ubicación · Zona aproximada</div>
        </div>
      </div>
    </div>
  </div>

  <div class="bottom-cta">
    <div class="cta-copy">
      <div class="k">Presupuesto</div>
      <div class="v">$8.000 / día</div>
    </div>
    <button class="btn primary">${ic("i-plus")} Tengo esto</button>
  </div>`,
});

const screenOffer = shell({
  title: "Enviar oferta",
  body: `
  <div class="navbar">
    <div class="iconbtn">${ic("i-arrow-left")}</div>
    <div class="navtitle">Enviar oferta</div>
    <div class="spacer"><div class="iconbtn">${ic("i-more")}</div></div>
  </div>

  <div class="summary">
    <div class="thumb costume">${ic("i-helmet")}</div>
    <div>
      <h3>Disfraz de astronauta para niño</h3>
      <p>Arriendo · 12–15 nov · Ñuñoa</p>
    </div>
  </div>

  <div class="form">
    <div class="field">
      <label>Foto de tu objeto</label>
      <div class="upload">
        ${ic("i-camera")}
        <span>Agregar foto</span>
        <span class="tiny muted">Muestra lo que tienes para ofrecer</span>
      </div>
    </div>

    <div class="field">
      <label>¿Qué tienes?</label>
      <div class="input"><span class="placeholder">Ej: Disfraz completo talla 6</span></div>
    </div>

    <div class="two-col">
      <div class="field">
        <label>Precio por día</label>
        <div class="input">${ic("i-dollar")} 5.000</div>
      </div>
      <div class="field">
        <label>Disponibilidad</label>
        <div class="input">${ic("i-calendar")} Desde el viernes</div>
      </div>
    </div>

    <div class="field">
      <label>Condiciones</label>
      <div class="input placeholder">Incluye casco, mochila y botas. Entrego en metro Chile España.</div>
    </div>

    <div class="hint">
      ${ic("i-info")}
      <span>Tu oferta se envía al creador del pedido. Si la acepta, se habilita el chat para coordinar la entrega.</span>
    </div>

    <button class="btn primary block">Enviar oferta</button>
  </div>`,
});

const screenChat = shell({
  title: "Chat",
  body: `
  <div class="chat-head">
    <div class="iconbtn">${ic("i-arrow-left")}</div>
    <div class="avatar sm">JM<span class="online"></span></div>
    <div class="who">
      <p class="name">Javier M.</p>
      <div class="status">En línea</div>
    </div>
    <div class="iconbtn">${ic("i-more")}</div>
  </div>

  <div class="context">
    ${ic("i-helmet")}
    Disfraz de astronauta · 12–15 nov
    <span class="badge accepted">Aceptada</span>
  </div>

  <div class="chat-body">
    <div class="day">Hoy</div>
    <div class="msg in">Hola Camila, tengo el disfraz talla 6. Está impecable, lo usamos una sola vez.<span class="time">18:02</span></div>
    <div class="msg out">Hola Javier. ¿Incluye el casco y las botas?<span class="time">18:03</span></div>
    <div class="msg in">Sí, incluye casco, mochila y botas. Te lo puedo dejar el viernes en el metro Chile España.<span class="time">18:04</span></div>
    <div class="msg out">Perfecto. ¿Te sirve a las 18:30?<span class="time">18:05</span></div>
    <div class="msg in">Me sirve. Nos vemos ahí. Te mando una foto cuando salga.<span class="time">18:06</span></div>
    <div class="msg out">Genial, gracias. Lo devuelvo el lunes limpio.<span class="time">18:06</span></div>
    <div class="msg in">Trato hecho. ¡Que lo disfrute!<span class="time">18:07</span></div>
  </div>

  <div class="quick">
    <span>Proponer punto de entrega</span>
    <span>Confirmar devolución</span>
  </div>

  <div class="chat-input">
    <div class="plusbtn">${ic("i-plus")}</div>
    <div class="field">Escribe un mensaje...</div>
    <div class="send">${ic("i-send")}</div>
  </div>`,
});

const screens = [
  { file: "01-explorar.html", title: "Explorar pedidos", caption: "Feed cercano y filtros", html: screenExplore },
  { file: "02-publicar.html", title: "Publicar necesidad", caption: "Formulario rápido", html: screenPublish },
  { file: "03-negociaciones.html", title: "Negociaciones", caption: "Ofertas recibidas", html: screenNegotiations },
  { file: "04-perfil.html", title: "Mi perfil", caption: "Reputación y actividad", html: screenProfile },
  { file: "05-detalle.html", title: "Detalle del pedido", caption: "Vista del proveedor", html: screenDetail },
  { file: "06-oferta.html", title: "Enviar oferta", caption: "Flujo \"Tengo esto\"", html: screenOffer },
  { file: "07-chat.html", title: "Chat", caption: "Coordinación post-aceptación", html: screenChat },
];

for (const screen of screens) {
  writeFileSync(join(outDir, screen.file), screen.html, "utf8");
}

const gallery = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YoTengoApp — Pantallas del MVP</title>
  <link rel="stylesheet" href="mockups.css">
</head>
<body class="gallery">
  <div class="gallery-wrap">
    <header class="gallery-header">
      <div>
        <p class="eyebrow">YoTengoApp · MVP</p>
        <h1>Pantallas del producto</h1>
        <p>Mockups estáticos del flujo principal: explorar pedidos cercanos, publicar una necesidad, recibir ofertas, negociar, chatear y construir reputación.</p>
      </div>
      <div class="stamp">7 pantallas</div>
    </header>

    <div class="gallery-grid">
      ${screens
        .map(
          (screen) => `
        <figure class="screen-card">
          <div class="caption">
            <strong>${screen.title}</strong>
            <span>${screen.caption}</span>
          </div>
          <div class="device">
            <iframe src="${screen.file}" title="${screen.title}" scrolling="no" loading="eager"></iframe>
          </div>
        </figure>`
        )
        .join("")}
    </div>
  </div>
</body>
</html>
`;

writeFileSync(join(outDir, "index.html"), gallery, "utf8");

console.log(`Generadas ${screens.length} pantallas + index.html en ${outDir}`);
