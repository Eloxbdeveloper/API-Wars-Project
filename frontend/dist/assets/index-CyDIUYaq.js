(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function a(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(n){if(n.ep)return;n.ep=!0;const o=a(n);fetch(n.href,o)}})();const W=t=>`<svg viewBox="0 0 24 24" aria-hidden="true">${t}</svg>`,It=[{path:"/",label:"Inicio",icon:W('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>')},{path:"/dashboard",label:"Estadísticas",icon:W('<path d="M5 20V10M12 20V4M19 20v-7"/>')},{path:"/facturas",label:"Facturas",icon:W('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>')},{path:"/notas-credito",label:"Notas crédito",short:"Notas",icon:W('<path d="M9 14l-5-5 5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>')}],$t=(t,e)=>`<a class="nav-link" data-nav="${t.path}" href="#${t.path}">${t.icon}<span>${e}</span></a>`;function ce(t){return t.innerHTML=`
    <a class="skip-link" href="#content">Saltar al contenido</a>
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" href="#/">FactuLocal</a>
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
        <nav aria-label="Principal">${It.map(e=>$t(e,e.label)).join("")}</nav>
        <p class="conn" data-conn role="status">Conectando…</p>
      </aside>
      <div class="main-col">
        <header class="topbar">
          <a class="brand" href="#/">FactuLocal</a>
          <p class="conn" data-conn role="status">Conectando…</p>
        </header>
        <main id="content" tabindex="-1"></main>
      </div>
      <nav class="tabbar" aria-label="Principal">${It.map(e=>$t(e,e.short??e.label)).join("")}</nav>
    </div>`,t.querySelector("#content")}function le(t){document.querySelectorAll("[data-nav]").forEach(e=>{const a=e.dataset.nav;(a==="/"?t==="/":t.startsWith(a))?e.setAttribute("aria-current","page"):e.removeAttribute("aria-current")})}function Mt(t){document.querySelectorAll("[data-conn]").forEach(e=>{e.dataset.state=t?"ok":"down",e.textContent=t?"Conectado":"Sin conexión con el servidor"})}const de="http://localhost:3000/api";async function L(t,e={}){const a={headers:{"Content-Type":"application/json",...e.headers},...e};try{const r=await fetch(`${de}${t}`,a);let n;try{n=await r.json()}catch{throw new Error(`Error ${r.status}: Respuesta del servidor no válida.`)}if(!r.ok||n.success===!1)throw new Error(n.message||`Error ${r.status}: Ocurrió un problema en la solicitud.`);return n}catch(r){throw console.error(`[API Error] ${t}:`,r.message),r}}const ue=()=>L("/health"),qt=()=>L("/customers"),fe=t=>L("/customers",{method:"POST",body:JSON.stringify(t)}),pe=(t,e)=>L(`/customers/${t}`,{method:"PUT",body:JSON.stringify(e)}),Dt=()=>L("/products"),me=t=>L("/products",{method:"POST",body:JSON.stringify(t)}),ge=(t,e)=>L(`/products/${t}`,{method:"PUT",body:JSON.stringify(e)}),ot=async()=>{var e,a;const t=await L("/invoices");return Array.isArray(t)?t:Array.isArray(t==null?void 0:t.data)?t.data:Array.isArray((e=t==null?void 0:t.data)==null?void 0:e.data)?t.data.data:Array.isArray((a=t==null?void 0:t.data)==null?void 0:a.items)?t.data.items:[]},he=t=>L(`/invoices/${encodeURIComponent(t)}`),ye=t=>L("/invoices",{method:"POST",body:JSON.stringify(t)}),be=t=>L(`/invoices/${t}/issue`,{method:"POST"}),ve=async()=>{var e;const t=await L("/credit-notes");return Array.isArray(t)?t:Array.isArray(t==null?void 0:t.data)?t.data:Array.isArray((e=t==null?void 0:t.data)==null?void 0:e.data)?t.data.data:[]},we=async()=>{const t=await L("/credit-notes/concepts");return Array.isArray(t)?t:Array.isArray(t==null?void 0:t.data)?t.data:[]},Ce=t=>L("/credit-notes",{method:"POST",body:JSON.stringify(t)});async function Ee(t){const e=await fetch(`${API_URL}/customers/${t}`,{method:"DELETE",headers:{"Content-Type":"application/json"}});if(!e.ok)throw new Error("Error al eliminar cliente");return e.json()}async function Se(t){const e=await fetch(`${API_URL}/products/${t}`,{method:"DELETE",headers:{"Content-Type":"application/json"}});if(!e.ok)throw new Error("Error al eliminar producto");return e.json()}const Ae=new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}),Te=new Intl.DateTimeFormat("es-CO",{day:"numeric",month:"short",year:"numeric"}),N=t=>Ae.format(Number(t)||0),z=t=>t?Te.format(new Date(t)):"";function v(t=""){return String(t).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}const Ne=new Intl.NumberFormat("es-CO",{notation:"compact",maximumFractionDigits:1}),Le=new Intl.DateTimeFormat("es-CO",{month:"short"}),Ie=t=>Ne.format(Number(t)||0),$e=t=>Le.format(t).replace(".",""),Me={DRAFT:{label:"Borrador",tone:"warn"},ISSUED:{label:"Emitida",tone:"ok"},REJECTED:{label:"Rechazada",tone:"danger"},ERROR:{label:"Error",tone:"danger"},CANCELLED:{label:"Cancelada",tone:"neutral"}},xe={label:"Sin estado",tone:"neutral"},Ct=t=>Me[t]??xe;function K(t){const{label:e,tone:a}=Ct(t);return`<span class="badge badge-${a}">${e}</span>`}function k(t="Cargando…"){return`<div class="skeleton" role="status" aria-live="polite">
    <span class="visually-hidden">${v(t)}</span><span></span><span></span><span></span>
  </div>`}function at({title:t,text:e,actionLabel:a,href:r}){return`<div class="state">
    <h3>${v(t)}</h3>
    <p>${v(e)}</p>
    ${a?`<a class="btn btn-primary" href="${r}">${v(a)}</a>`:""}
  </div>`}function Y({title:t,text:e,actionLabel:a}){return`<div class="state state-error" role="alert">
    <h3>${v(t)}</h3>
    <p>${v(e)}</p>
    ${a?`<button class="btn btn-secondary" type="button" data-retry>${v(a)}</button>`:""}
  </div>`}function Re(t){const e=typeof t.customer=="object"&&t.customer?t.customer:null,a=(e==null?void 0:e.names)||(e==null?void 0:e.name)||(e==null?void 0:e.legal_name)||"Cliente sin nombre",r=t.numbering||t.referenceCode||`Factura #${String(t._id??"").slice(-6)}`,n=t.grandTotal??t.total??0,o=t._id||t.id||"";return`<li>
    <a class="row row-link" href="${o?`#/facturas/${o}`:"#/facturas"}">
      <div class="row-main">
        <p class="row-title">${v(a)}</p>
        <p class="row-sub">${v(r)} · ${z(t.createdAt)}</p>
      </div>
      <div class="row-end"><span class="row-amount">${N(n)}</span>${K(t.status)}</div>
    </a>
  </li>`}const Pe=5;function Be(t){t.innerHTML=`
    <div class="page-head"><h1>Inicio</h1></div>
    <div class="actions">
      <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
    </div>
    <section class="panel" aria-labelledby="recent-title">
      <h2 id="recent-title">Actividad reciente</h2>
      <div data-recent></div>
    </section>`;const e=t.querySelector("[data-recent]");async function a(){e.innerHTML=k("Cargando facturas…");try{const r=await ot();if(!e.isConnected)return;if(r.length===0){e.innerHTML=at({title:"Aún no tienes facturas",text:"Cuando emitas la primera, la verás aquí.",actionLabel:"Crear mi primera factura",href:"#/facturas/nueva"});return}const n=[...r].sort((o,s)=>new Date(s.createdAt)-new Date(o.createdAt)).slice(0,Pe);e.innerHTML=`
        <ul class="rows">${n.map(Re).join("")}</ul>
        <div style="padding: var(--space-4) var(--space-6); border-top: 1px solid var(--line);">
          <a class="btn btn-secondary" href="#/facturas">Ver todas las facturas</a>
        </div>`}catch{if(!e.isConnected)return;e.innerHTML=Y({title:"No pudimos cargar tus facturas",text:"Intenta nuevamente.",actionLabel:"Intentar de nuevo"}),e.querySelector("[data-retry]").addEventListener("click",a)}}a()}const kt=new Set(["qr","qrcode","qrimage","qrurl","codigoqr"]),qe=new Set(["publicurl","pdfurl","pdf","documenturl"]),De=t=>String(t).toLowerCase().replace(/[_\-\s]/g,"");function Ft(t,e=kt,a=6){if(!t||typeof t!="object")return null;const r=[{node:t,depth:0}];for(;r.length>0;){const{node:n,depth:o}=r.shift();if(!(o>a))for(const[s,i]of Object.entries(n)){if(e.has(De(s))&&typeof i=="string"&&i.trim())return i.trim();i&&typeof i=="object"&&(Array.isArray(i)?i.forEach(c=>{c&&typeof c=="object"&&r.push({node:c,depth:o+1})}):r.push({node:i,depth:o+1}))}}return null}function ht(t,e=0){if(!t||e>3)return null;if(typeof t=="object"){const r=t.qr||t.url||t.image||t.qr_image||t.qr_code||null;return ht(r,e+1)}if(typeof t!="string")return null;const a=t.trim();if(!a)return null;if(a.startsWith("{")||a.startsWith("["))try{return ht(JSON.parse(a),e+1)}catch{}return/^(https?:\/\/|data:|blob:)/i.test(a)?a:/^[A-Za-z0-9+/=]+$/.test(a)?`data:image/png;base64,${a}`:a}function _t(t){const e=[t==null?void 0:t.qrCodeUrl,t==null?void 0:t.qr,t==null?void 0:t.qr_code,Ft(t==null?void 0:t.factusResponse,kt)];for(const a of e){const r=ht(a);if(r)return r}return null}function tt(t){const e=[t==null?void 0:t.pdfUrl,t==null?void 0:t.publicUrl,t==null?void 0:t.public_url,Ft(t==null?void 0:t.factusResponse,qe)];for(const a of e){if(typeof a!="string")continue;const r=a.trim();if(r){if(/^https?:\/\//i.test(r))return r;if(r.startsWith("{")||r.startsWith("["))try{const n=JSON.parse(r),o=typeof n=="object"&&(n.public_url||n.pdf_url||n.pdf||n.url)||null;if(o&&/^https?:\/\//i.test(String(o)))return String(o)}catch{}}}return null}var Q={},ke=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then},Ut={},$={};let Et;const Fe=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];$.getSymbolSize=function(e){if(!e)throw new Error('"version" cannot be null or undefined');if(e<1||e>40)throw new Error('"version" should be in range from 1 to 40');return e*4+17};$.getSymbolTotalCodewords=function(e){return Fe[e]};$.getBCHDigit=function(t){let e=0;for(;t!==0;)e++,t>>>=1;return e};$.setToSJISFunction=function(e){if(typeof e!="function")throw new Error('"toSJISFunc" is not a valid function.');Et=e};$.isKanjiModeEnabled=function(){return typeof Et<"u"};$.toSJIS=function(e){return Et(e)};var st={};(function(t){t.L={bit:1},t.M={bit:0},t.Q={bit:3},t.H={bit:2};function e(a){if(typeof a!="string")throw new Error("Param is not a string");switch(a.toLowerCase()){case"l":case"low":return t.L;case"m":case"medium":return t.M;case"q":case"quartile":return t.Q;case"h":case"high":return t.H;default:throw new Error("Unknown EC Level: "+a)}}t.isValid=function(r){return r&&typeof r.bit<"u"&&r.bit>=0&&r.bit<4},t.from=function(r,n){if(t.isValid(r))return r;try{return e(r)}catch{return n}}})(st);function Ht(){this.buffer=[],this.length=0}Ht.prototype={get:function(t){const e=Math.floor(t/8);return(this.buffer[e]>>>7-t%8&1)===1},put:function(t,e){for(let a=0;a<e;a++)this.putBit((t>>>e-a-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(t){const e=Math.floor(this.length/8);this.buffer.length<=e&&this.buffer.push(0),t&&(this.buffer[e]|=128>>>this.length%8),this.length++}};var _e=Ht;function G(t){if(!t||t<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=t,this.data=new Uint8Array(t*t),this.reservedBit=new Uint8Array(t*t)}G.prototype.set=function(t,e,a,r){const n=t*this.size+e;this.data[n]=a,r&&(this.reservedBit[n]=!0)};G.prototype.get=function(t,e){return this.data[t*this.size+e]};G.prototype.xor=function(t,e,a){this.data[t*this.size+e]^=a};G.prototype.isReserved=function(t,e){return this.reservedBit[t*this.size+e]};var Ue=G,Ot={};(function(t){const e=$.getSymbolSize;t.getRowColCoords=function(r){if(r===1)return[];const n=Math.floor(r/7)+2,o=e(r),s=o===145?26:Math.ceil((o-13)/(2*n-2))*2,i=[o-7];for(let c=1;c<n-1;c++)i[c]=i[c-1]-s;return i.push(6),i.reverse()},t.getPositions=function(r){const n=[],o=t.getRowColCoords(r),s=o.length;for(let i=0;i<s;i++)for(let c=0;c<s;c++)i===0&&c===0||i===0&&c===s-1||i===s-1&&c===0||n.push([o[i],o[c]]);return n}})(Ot);var Vt={};const He=$.getSymbolSize,xt=7;Vt.getPositions=function(e){const a=He(e);return[[0,0],[a-xt,0],[0,a-xt]]};var jt={};(function(t){t.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const e={N1:3,N2:3,N3:40,N4:10};t.isValid=function(n){return n!=null&&n!==""&&!isNaN(n)&&n>=0&&n<=7},t.from=function(n){return t.isValid(n)?parseInt(n,10):void 0},t.getPenaltyN1=function(n){const o=n.size;let s=0,i=0,c=0,u=null,f=null;for(let A=0;A<o;A++){i=c=0,u=f=null;for(let h=0;h<o;h++){let y=n.get(A,h);y===u?i++:(i>=5&&(s+=e.N1+(i-5)),u=y,i=1),y=n.get(h,A),y===f?c++:(c>=5&&(s+=e.N1+(c-5)),f=y,c=1)}i>=5&&(s+=e.N1+(i-5)),c>=5&&(s+=e.N1+(c-5))}return s},t.getPenaltyN2=function(n){const o=n.size;let s=0;for(let i=0;i<o-1;i++)for(let c=0;c<o-1;c++){const u=n.get(i,c)+n.get(i,c+1)+n.get(i+1,c)+n.get(i+1,c+1);(u===4||u===0)&&s++}return s*e.N2},t.getPenaltyN3=function(n){const o=n.size;let s=0,i=0,c=0;for(let u=0;u<o;u++){i=c=0;for(let f=0;f<o;f++)i=i<<1&2047|n.get(u,f),f>=10&&(i===1488||i===93)&&s++,c=c<<1&2047|n.get(f,u),f>=10&&(c===1488||c===93)&&s++}return s*e.N3},t.getPenaltyN4=function(n){let o=0;const s=n.data.length;for(let c=0;c<s;c++)o+=n.data[c];return Math.abs(Math.ceil(o*100/s/5)-10)*e.N4};function a(r,n,o){switch(r){case t.Patterns.PATTERN000:return(n+o)%2===0;case t.Patterns.PATTERN001:return n%2===0;case t.Patterns.PATTERN010:return o%3===0;case t.Patterns.PATTERN011:return(n+o)%3===0;case t.Patterns.PATTERN100:return(Math.floor(n/2)+Math.floor(o/3))%2===0;case t.Patterns.PATTERN101:return n*o%2+n*o%3===0;case t.Patterns.PATTERN110:return(n*o%2+n*o%3)%2===0;case t.Patterns.PATTERN111:return(n*o%3+(n+o)%2)%2===0;default:throw new Error("bad maskPattern:"+r)}}t.applyMask=function(n,o){const s=o.size;for(let i=0;i<s;i++)for(let c=0;c<s;c++)o.isReserved(c,i)||o.xor(c,i,a(n,c,i))},t.getBestMask=function(n,o){const s=Object.keys(t.Patterns).length;let i=0,c=1/0;for(let u=0;u<s;u++){o(u),t.applyMask(u,n);const f=t.getPenaltyN1(n)+t.getPenaltyN2(n)+t.getPenaltyN3(n)+t.getPenaltyN4(n);t.applyMask(u,n),f<c&&(c=f,i=u)}return i}})(jt);var it={};const P=st,Z=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],X=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];it.getBlocksCount=function(e,a){switch(a){case P.L:return Z[(e-1)*4+0];case P.M:return Z[(e-1)*4+1];case P.Q:return Z[(e-1)*4+2];case P.H:return Z[(e-1)*4+3];default:return}};it.getTotalCodewordsCount=function(e,a){switch(a){case P.L:return X[(e-1)*4+0];case P.M:return X[(e-1)*4+1];case P.Q:return X[(e-1)*4+2];case P.H:return X[(e-1)*4+3];default:return}};var zt={},ct={};const j=new Uint8Array(512),et=new Uint8Array(256);(function(){let e=1;for(let a=0;a<255;a++)j[a]=e,et[e]=a,e<<=1,e&256&&(e^=285);for(let a=255;a<512;a++)j[a]=j[a-255]})();ct.log=function(e){if(e<1)throw new Error("log("+e+")");return et[e]};ct.exp=function(e){return j[e]};ct.mul=function(e,a){return e===0||a===0?0:j[et[e]+et[a]]};(function(t){const e=ct;t.mul=function(r,n){const o=new Uint8Array(r.length+n.length-1);for(let s=0;s<r.length;s++)for(let i=0;i<n.length;i++)o[s+i]^=e.mul(r[s],n[i]);return o},t.mod=function(r,n){let o=new Uint8Array(r);for(;o.length-n.length>=0;){const s=o[0];for(let c=0;c<n.length;c++)o[c]^=e.mul(n[c],s);let i=0;for(;i<o.length&&o[i]===0;)i++;o=o.slice(i)}return o},t.generateECPolynomial=function(r){let n=new Uint8Array([1]);for(let o=0;o<r;o++)n=t.mul(n,new Uint8Array([1,e.exp(o)]));return n}})(zt);const Jt=zt;function St(t){this.genPoly=void 0,this.degree=t,this.degree&&this.initialize(this.degree)}St.prototype.initialize=function(e){this.degree=e,this.genPoly=Jt.generateECPolynomial(this.degree)};St.prototype.encode=function(e){if(!this.genPoly)throw new Error("Encoder not initialized");const a=new Uint8Array(e.length+this.degree);a.set(e);const r=Jt.mod(a,this.genPoly),n=this.degree-r.length;if(n>0){const o=new Uint8Array(this.degree);return o.set(r,n),o}return r};var Oe=St,Kt={},B={},At={};At.isValid=function(e){return!isNaN(e)&&e>=1&&e<=40};var R={};const Yt="[0-9]+",Ve="[A-Z $%*+\\-./:]+";let J="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";J=J.replace(/u/g,"\\u");const je="(?:(?![A-Z0-9 $%*+\\-./:]|"+J+`)(?:.|[\r
]))+`;R.KANJI=new RegExp(J,"g");R.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g");R.BYTE=new RegExp(je,"g");R.NUMERIC=new RegExp(Yt,"g");R.ALPHANUMERIC=new RegExp(Ve,"g");const ze=new RegExp("^"+J+"$"),Je=new RegExp("^"+Yt+"$"),Ke=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");R.testKanji=function(e){return ze.test(e)};R.testNumeric=function(e){return Je.test(e)};R.testAlphanumeric=function(e){return Ke.test(e)};(function(t){const e=At,a=R;t.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},t.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},t.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},t.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},t.MIXED={bit:-1},t.getCharCountIndicator=function(o,s){if(!o.ccBits)throw new Error("Invalid mode: "+o);if(!e.isValid(s))throw new Error("Invalid version: "+s);return s>=1&&s<10?o.ccBits[0]:s<27?o.ccBits[1]:o.ccBits[2]},t.getBestModeForData=function(o){return a.testNumeric(o)?t.NUMERIC:a.testAlphanumeric(o)?t.ALPHANUMERIC:a.testKanji(o)?t.KANJI:t.BYTE},t.toString=function(o){if(o&&o.id)return o.id;throw new Error("Invalid mode")},t.isValid=function(o){return o&&o.bit&&o.ccBits};function r(n){if(typeof n!="string")throw new Error("Param is not a string");switch(n.toLowerCase()){case"numeric":return t.NUMERIC;case"alphanumeric":return t.ALPHANUMERIC;case"kanji":return t.KANJI;case"byte":return t.BYTE;default:throw new Error("Unknown mode: "+n)}}t.from=function(o,s){if(t.isValid(o))return o;try{return r(o)}catch{return s}}})(B);(function(t){const e=$,a=it,r=st,n=B,o=At,s=7973,i=e.getBCHDigit(s);function c(h,y,b){for(let d=1;d<=40;d++)if(y<=t.getCapacity(d,b,h))return d}function u(h,y){return n.getCharCountIndicator(h,y)+4}function f(h,y){let b=0;return h.forEach(function(d){const E=u(d.mode,y);b+=E+d.getBitsLength()}),b}function A(h,y){for(let b=1;b<=40;b++)if(f(h,b)<=t.getCapacity(b,y,n.MIXED))return b}t.from=function(y,b){return o.isValid(y)?parseInt(y,10):b},t.getCapacity=function(y,b,d){if(!o.isValid(y))throw new Error("Invalid QR Code version");typeof d>"u"&&(d=n.BYTE);const E=e.getSymbolTotalCodewords(y),l=a.getTotalCodewordsCount(y,b),m=(E-l)*8;if(d===n.MIXED)return m;const p=m-u(d,y);switch(d){case n.NUMERIC:return Math.floor(p/10*3);case n.ALPHANUMERIC:return Math.floor(p/11*2);case n.KANJI:return Math.floor(p/13);case n.BYTE:default:return Math.floor(p/8)}},t.getBestVersionForData=function(y,b){let d;const E=r.from(b,r.M);if(Array.isArray(y)){if(y.length>1)return A(y,E);if(y.length===0)return 1;d=y[0]}else d=y;return c(d.mode,d.getLength(),E)},t.getEncodedBits=function(y){if(!o.isValid(y)||y<7)throw new Error("Invalid QR Code version");let b=y<<12;for(;e.getBCHDigit(b)-i>=0;)b^=s<<e.getBCHDigit(b)-i;return y<<12|b}})(Kt);var Qt={};const yt=$,Gt=1335,Ye=21522,Rt=yt.getBCHDigit(Gt);Qt.getEncodedBits=function(e,a){const r=e.bit<<3|a;let n=r<<10;for(;yt.getBCHDigit(n)-Rt>=0;)n^=Gt<<yt.getBCHDigit(n)-Rt;return(r<<10|n)^Ye};var Wt={};const Qe=B;function F(t){this.mode=Qe.NUMERIC,this.data=t.toString()}F.getBitsLength=function(e){return 10*Math.floor(e/3)+(e%3?e%3*3+1:0)};F.prototype.getLength=function(){return this.data.length};F.prototype.getBitsLength=function(){return F.getBitsLength(this.data.length)};F.prototype.write=function(e){let a,r,n;for(a=0;a+3<=this.data.length;a+=3)r=this.data.substr(a,3),n=parseInt(r,10),e.put(n,10);const o=this.data.length-a;o>0&&(r=this.data.substr(a),n=parseInt(r,10),e.put(n,o*3+1))};var Ge=F;const We=B,dt=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function _(t){this.mode=We.ALPHANUMERIC,this.data=t}_.getBitsLength=function(e){return 11*Math.floor(e/2)+6*(e%2)};_.prototype.getLength=function(){return this.data.length};_.prototype.getBitsLength=function(){return _.getBitsLength(this.data.length)};_.prototype.write=function(e){let a;for(a=0;a+2<=this.data.length;a+=2){let r=dt.indexOf(this.data[a])*45;r+=dt.indexOf(this.data[a+1]),e.put(r,11)}this.data.length%2&&e.put(dt.indexOf(this.data[a]),6)};var Ze=_;const Xe=B;function U(t){this.mode=Xe.BYTE,typeof t=="string"?this.data=new TextEncoder().encode(t):this.data=new Uint8Array(t)}U.getBitsLength=function(e){return e*8};U.prototype.getLength=function(){return this.data.length};U.prototype.getBitsLength=function(){return U.getBitsLength(this.data.length)};U.prototype.write=function(t){for(let e=0,a=this.data.length;e<a;e++)t.put(this.data[e],8)};var tn=U;const en=B,nn=$;function H(t){this.mode=en.KANJI,this.data=t}H.getBitsLength=function(e){return e*13};H.prototype.getLength=function(){return this.data.length};H.prototype.getBitsLength=function(){return H.getBitsLength(this.data.length)};H.prototype.write=function(t){let e;for(e=0;e<this.data.length;e++){let a=nn.toSJIS(this.data[e]);if(a>=33088&&a<=40956)a-=33088;else if(a>=57408&&a<=60351)a-=49472;else throw new Error("Invalid SJIS character: "+this.data[e]+`
Make sure your charset is UTF-8`);a=(a>>>8&255)*192+(a&255),t.put(a,13)}};var rn=H,Zt={exports:{}};(function(t){var e={single_source_shortest_paths:function(a,r,n){var o={},s={};s[r]=0;var i=e.PriorityQueue.make();i.push(r,0);for(var c,u,f,A,h,y,b,d,E;!i.empty();){c=i.pop(),u=c.value,A=c.cost,h=a[u]||{};for(f in h)h.hasOwnProperty(f)&&(y=h[f],b=A+y,d=s[f],E=typeof s[f]>"u",(E||d>b)&&(s[f]=b,i.push(f,b),o[f]=u))}if(typeof n<"u"&&typeof s[n]>"u"){var l=["Could not find a path from ",r," to ",n,"."].join("");throw new Error(l)}return o},extract_shortest_path_from_predecessor_list:function(a,r){for(var n=[],o=r;o;)n.push(o),a[o],o=a[o];return n.reverse(),n},find_path:function(a,r,n){var o=e.single_source_shortest_paths(a,r,n);return e.extract_shortest_path_from_predecessor_list(o,n)},PriorityQueue:{make:function(a){var r=e.PriorityQueue,n={},o;a=a||{};for(o in r)r.hasOwnProperty(o)&&(n[o]=r[o]);return n.queue=[],n.sorter=a.sorter||r.default_sorter,n},default_sorter:function(a,r){return a.cost-r.cost},push:function(a,r){var n={value:a,cost:r};this.queue.push(n),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};t.exports=e})(Zt);var on=Zt.exports;(function(t){const e=B,a=Ge,r=Ze,n=tn,o=rn,s=R,i=$,c=on;function u(l){return unescape(encodeURIComponent(l)).length}function f(l,m,p){const g=[];let S;for(;(S=l.exec(p))!==null;)g.push({data:S[0],index:S.index,mode:m,length:S[0].length});return g}function A(l){const m=f(s.NUMERIC,e.NUMERIC,l),p=f(s.ALPHANUMERIC,e.ALPHANUMERIC,l);let g,S;return i.isKanjiModeEnabled()?(g=f(s.BYTE,e.BYTE,l),S=f(s.KANJI,e.KANJI,l)):(g=f(s.BYTE_KANJI,e.BYTE,l),S=[]),m.concat(p,g,S).sort(function(C,T){return C.index-T.index}).map(function(C){return{data:C.data,mode:C.mode,length:C.length}})}function h(l,m){switch(m){case e.NUMERIC:return a.getBitsLength(l);case e.ALPHANUMERIC:return r.getBitsLength(l);case e.KANJI:return o.getBitsLength(l);case e.BYTE:return n.getBitsLength(l)}}function y(l){return l.reduce(function(m,p){const g=m.length-1>=0?m[m.length-1]:null;return g&&g.mode===p.mode?(m[m.length-1].data+=p.data,m):(m.push(p),m)},[])}function b(l){const m=[];for(let p=0;p<l.length;p++){const g=l[p];switch(g.mode){case e.NUMERIC:m.push([g,{data:g.data,mode:e.ALPHANUMERIC,length:g.length},{data:g.data,mode:e.BYTE,length:g.length}]);break;case e.ALPHANUMERIC:m.push([g,{data:g.data,mode:e.BYTE,length:g.length}]);break;case e.KANJI:m.push([g,{data:g.data,mode:e.BYTE,length:u(g.data)}]);break;case e.BYTE:m.push([{data:g.data,mode:e.BYTE,length:u(g.data)}])}}return m}function d(l,m){const p={},g={start:{}};let S=["start"];for(let w=0;w<l.length;w++){const C=l[w],T=[];for(let M=0;M<C.length;M++){const x=C[M],q=""+w+M;T.push(q),p[q]={node:x,lastCount:0},g[q]={};for(let O=0;O<S.length;O++){const I=S[O];p[I]&&p[I].node.mode===x.mode?(g[I][q]=h(p[I].lastCount+x.length,x.mode)-h(p[I].lastCount,x.mode),p[I].lastCount+=x.length):(p[I]&&(p[I].lastCount=x.length),g[I][q]=h(x.length,x.mode)+4+e.getCharCountIndicator(x.mode,m))}}S=T}for(let w=0;w<S.length;w++)g[S[w]].end=0;return{map:g,table:p}}function E(l,m){let p;const g=e.getBestModeForData(l);if(p=e.from(m,g),p!==e.BYTE&&p.bit<g.bit)throw new Error('"'+l+'" cannot be encoded with mode '+e.toString(p)+`.
 Suggested mode is: `+e.toString(g));switch(p===e.KANJI&&!i.isKanjiModeEnabled()&&(p=e.BYTE),p){case e.NUMERIC:return new a(l);case e.ALPHANUMERIC:return new r(l);case e.KANJI:return new o(l);case e.BYTE:return new n(l)}}t.fromArray=function(m){return m.reduce(function(p,g){return typeof g=="string"?p.push(E(g,null)):g.data&&p.push(E(g.data,g.mode)),p},[])},t.fromString=function(m,p){const g=A(m,i.isKanjiModeEnabled()),S=b(g),w=d(S,p),C=c.find_path(w.map,"start","end"),T=[];for(let M=1;M<C.length-1;M++)T.push(w.table[C[M]].node);return t.fromArray(y(T))},t.rawSplit=function(m){return t.fromArray(A(m,i.isKanjiModeEnabled()))}})(Wt);const lt=$,ut=st,an=_e,sn=Ue,cn=Ot,ln=Vt,bt=jt,vt=it,dn=Oe,nt=Kt,un=Qt,fn=B,ft=Wt;function pn(t,e){const a=t.size,r=ln.getPositions(e);for(let n=0;n<r.length;n++){const o=r[n][0],s=r[n][1];for(let i=-1;i<=7;i++)if(!(o+i<=-1||a<=o+i))for(let c=-1;c<=7;c++)s+c<=-1||a<=s+c||(i>=0&&i<=6&&(c===0||c===6)||c>=0&&c<=6&&(i===0||i===6)||i>=2&&i<=4&&c>=2&&c<=4?t.set(o+i,s+c,!0,!0):t.set(o+i,s+c,!1,!0))}}function mn(t){const e=t.size;for(let a=8;a<e-8;a++){const r=a%2===0;t.set(a,6,r,!0),t.set(6,a,r,!0)}}function gn(t,e){const a=cn.getPositions(e);for(let r=0;r<a.length;r++){const n=a[r][0],o=a[r][1];for(let s=-2;s<=2;s++)for(let i=-2;i<=2;i++)s===-2||s===2||i===-2||i===2||s===0&&i===0?t.set(n+s,o+i,!0,!0):t.set(n+s,o+i,!1,!0)}}function hn(t,e){const a=t.size,r=nt.getEncodedBits(e);let n,o,s;for(let i=0;i<18;i++)n=Math.floor(i/3),o=i%3+a-8-3,s=(r>>i&1)===1,t.set(n,o,s,!0),t.set(o,n,s,!0)}function pt(t,e,a){const r=t.size,n=un.getEncodedBits(e,a);let o,s;for(o=0;o<15;o++)s=(n>>o&1)===1,o<6?t.set(o,8,s,!0):o<8?t.set(o+1,8,s,!0):t.set(r-15+o,8,s,!0),o<8?t.set(8,r-o-1,s,!0):o<9?t.set(8,15-o-1+1,s,!0):t.set(8,15-o-1,s,!0);t.set(r-8,8,1,!0)}function yn(t,e){const a=t.size;let r=-1,n=a-1,o=7,s=0;for(let i=a-1;i>0;i-=2)for(i===6&&i--;;){for(let c=0;c<2;c++)if(!t.isReserved(n,i-c)){let u=!1;s<e.length&&(u=(e[s]>>>o&1)===1),t.set(n,i-c,u),o--,o===-1&&(s++,o=7)}if(n+=r,n<0||a<=n){n-=r,r=-r;break}}}function bn(t,e,a){const r=new an;a.forEach(function(c){r.put(c.mode.bit,4),r.put(c.getLength(),fn.getCharCountIndicator(c.mode,t)),c.write(r)});const n=lt.getSymbolTotalCodewords(t),o=vt.getTotalCodewordsCount(t,e),s=(n-o)*8;for(r.getLengthInBits()+4<=s&&r.put(0,4);r.getLengthInBits()%8!==0;)r.putBit(0);const i=(s-r.getLengthInBits())/8;for(let c=0;c<i;c++)r.put(c%2?17:236,8);return vn(r,t,e)}function vn(t,e,a){const r=lt.getSymbolTotalCodewords(e),n=vt.getTotalCodewordsCount(e,a),o=r-n,s=vt.getBlocksCount(e,a),i=r%s,c=s-i,u=Math.floor(r/s),f=Math.floor(o/s),A=f+1,h=u-f,y=new dn(h);let b=0;const d=new Array(s),E=new Array(s);let l=0;const m=new Uint8Array(t.buffer);for(let C=0;C<s;C++){const T=C<c?f:A;d[C]=m.slice(b,b+T),E[C]=y.encode(d[C]),b+=T,l=Math.max(l,T)}const p=new Uint8Array(r);let g=0,S,w;for(S=0;S<l;S++)for(w=0;w<s;w++)S<d[w].length&&(p[g++]=d[w][S]);for(S=0;S<h;S++)for(w=0;w<s;w++)p[g++]=E[w][S];return p}function wn(t,e,a,r){let n;if(Array.isArray(t))n=ft.fromArray(t);else if(typeof t=="string"){let u=e;if(!u){const f=ft.rawSplit(t);u=nt.getBestVersionForData(f,a)}n=ft.fromString(t,u||40)}else throw new Error("Invalid data");const o=nt.getBestVersionForData(n,a);if(!o)throw new Error("The amount of data is too big to be stored in a QR Code");if(!e)e=o;else if(e<o)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+o+`.
`);const s=bn(e,a,n),i=lt.getSymbolSize(e),c=new sn(i);return pn(c,e),mn(c),gn(c,e),pt(c,a,0),e>=7&&hn(c,e),yn(c,s),isNaN(r)&&(r=bt.getBestMask(c,pt.bind(null,c,a))),bt.applyMask(r,c),pt(c,a,r),{modules:c,version:e,errorCorrectionLevel:a,maskPattern:r,segments:n}}Ut.create=function(e,a){if(typeof e>"u"||e==="")throw new Error("No input text");let r=ut.M,n,o;return typeof a<"u"&&(r=ut.from(a.errorCorrectionLevel,ut.M),n=nt.from(a.version),o=bt.from(a.maskPattern),a.toSJISFunc&&lt.setToSJISFunction(a.toSJISFunc)),wn(e,n,r,o)};var Xt={},Tt={};(function(t){function e(a){if(typeof a=="number"&&(a=a.toString()),typeof a!="string")throw new Error("Color should be defined as hex string");let r=a.slice().replace("#","").split("");if(r.length<3||r.length===5||r.length>8)throw new Error("Invalid hex color: "+a);(r.length===3||r.length===4)&&(r=Array.prototype.concat.apply([],r.map(function(o){return[o,o]}))),r.length===6&&r.push("F","F");const n=parseInt(r.join(""),16);return{r:n>>24&255,g:n>>16&255,b:n>>8&255,a:n&255,hex:"#"+r.slice(0,6).join("")}}t.getOptions=function(r){r||(r={}),r.color||(r.color={});const n=typeof r.margin>"u"||r.margin===null||r.margin<0?4:r.margin,o=r.width&&r.width>=21?r.width:void 0,s=r.scale||4;return{width:o,scale:o?4:s,margin:n,color:{dark:e(r.color.dark||"#000000ff"),light:e(r.color.light||"#ffffffff")},type:r.type,rendererOpts:r.rendererOpts||{}}},t.getScale=function(r,n){return n.width&&n.width>=r+n.margin*2?n.width/(r+n.margin*2):n.scale},t.getImageWidth=function(r,n){const o=t.getScale(r,n);return Math.floor((r+n.margin*2)*o)},t.qrToImageData=function(r,n,o){const s=n.modules.size,i=n.modules.data,c=t.getScale(s,o),u=Math.floor((s+o.margin*2)*c),f=o.margin*c,A=[o.color.light,o.color.dark];for(let h=0;h<u;h++)for(let y=0;y<u;y++){let b=(h*u+y)*4,d=o.color.light;if(h>=f&&y>=f&&h<u-f&&y<u-f){const E=Math.floor((h-f)/c),l=Math.floor((y-f)/c);d=A[i[E*s+l]?1:0]}r[b++]=d.r,r[b++]=d.g,r[b++]=d.b,r[b]=d.a}}})(Tt);(function(t){const e=Tt;function a(n,o,s){n.clearRect(0,0,o.width,o.height),o.style||(o.style={}),o.height=s,o.width=s,o.style.height=s+"px",o.style.width=s+"px"}function r(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}t.render=function(o,s,i){let c=i,u=s;typeof c>"u"&&(!s||!s.getContext)&&(c=s,s=void 0),s||(u=r()),c=e.getOptions(c);const f=e.getImageWidth(o.modules.size,c),A=u.getContext("2d"),h=A.createImageData(f,f);return e.qrToImageData(h.data,o,c),a(A,u,f),A.putImageData(h,0,0),u},t.renderToDataURL=function(o,s,i){let c=i;typeof c>"u"&&(!s||!s.getContext)&&(c=s,s=void 0),c||(c={});const u=t.render(o,s,c),f=c.type||"image/png",A=c.rendererOpts||{};return u.toDataURL(f,A.quality)}})(Xt);var te={};const Cn=Tt;function Pt(t,e){const a=t.a/255,r=e+'="'+t.hex+'"';return a<1?r+" "+e+'-opacity="'+a.toFixed(2).slice(1)+'"':r}function mt(t,e,a){let r=t+e;return typeof a<"u"&&(r+=" "+a),r}function En(t,e,a){let r="",n=0,o=!1,s=0;for(let i=0;i<t.length;i++){const c=Math.floor(i%e),u=Math.floor(i/e);!c&&!o&&(o=!0),t[i]?(s++,i>0&&c>0&&t[i-1]||(r+=o?mt("M",c+a,.5+u+a):mt("m",n,0),n=0,o=!1),c+1<e&&t[i+1]||(r+=mt("h",s),s=0)):n++}return r}te.render=function(e,a,r){const n=Cn.getOptions(a),o=e.modules.size,s=e.modules.data,i=o+n.margin*2,c=n.color.light.a?"<path "+Pt(n.color.light,"fill")+' d="M0 0h'+i+"v"+i+'H0z"/>':"",u="<path "+Pt(n.color.dark,"stroke")+' d="'+En(s,o,n.margin)+'"/>',f='viewBox="0 0 '+i+" "+i+'"',h='<svg xmlns="http://www.w3.org/2000/svg" '+(n.width?'width="'+n.width+'" height="'+n.width+'" ':"")+f+' shape-rendering="crispEdges">'+c+u+`</svg>
`;return typeof r=="function"&&r(null,h),h};const Sn=ke,wt=Ut,ee=Xt,An=te;function Nt(t,e,a,r,n){const o=[].slice.call(arguments,1),s=o.length,i=typeof o[s-1]=="function";if(!i&&!Sn())throw new Error("Callback required as last argument");if(i){if(s<2)throw new Error("Too few arguments provided");s===2?(n=a,a=e,e=r=void 0):s===3&&(e.getContext&&typeof n>"u"?(n=r,r=void 0):(n=r,r=a,a=e,e=void 0))}else{if(s<1)throw new Error("Too few arguments provided");return s===1?(a=e,e=r=void 0):s===2&&!e.getContext&&(r=a,a=e,e=void 0),new Promise(function(c,u){try{const f=wt.create(a,r);c(t(f,e,r))}catch(f){u(f)}})}try{const c=wt.create(a,r);n(null,t(c,e,r))}catch(c){n(c)}}Q.create=wt.create;Q.toCanvas=Nt.bind(null,ee.render);Q.toDataURL=Nt.bind(null,ee.renderToDataURL);Q.toString=Nt.bind(null,function(t,e,a){return An.render(t,a)});async function Lt(t){if(!t)return null;const e=String(t).trim();if(!e)return null;if(/^data:image\//i.test(e))return e;try{return await Q.toDataURL(e,{margin:1,width:240,errorCorrectionLevel:"M",color:{dark:"#14231fff",light:"#ffffffff"}})}catch(a){return console.error("[QR] No fue posible generar la imagen del QR:",a.message),null}}async function Tn(t){t.innerHTML=`
    <div class="page-head">
      <h1>Nueva factura</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-secondary" href="#/facturas">Ver facturas</a>
        <a class="btn btn-secondary" href="#/dashboard">Estadísticas</a>
        <a class="btn btn-secondary" href="#/notas-credito">Notas crédito</a>
      </div>
    </div>

    <!-- CONTENEDOR DE ALERTAS / ERRORES -->
    <div id="invoice-alert-container" style="display: none; margin-bottom: 15px;" class="alert-box"></div>

    <!-- SECCIÓN 1: CREAR FACTURA / REVISIÓN -->
    <section id="section-create-invoice" class="card-section">
      <h3>Crear Factura Electrónica</h3>
      <form id="form-invoice-draft">
        <div class="form-group" style="margin-bottom: 15px;">
          <label for="select-customer"><strong>Cliente:</strong></label>
          <select id="select-customer" class="form-control" required style="width: 100%; padding: 8px; margin-top: 5px;">
            <option value="">Cargando clientes...</option>
          </select>
        </div>

        <h4>Productos</h4>
        <div id="items-container" style="margin-bottom: 15px;"></div>
        <button type="button" id="btn-add-item" class="btn btn-small btn-secondary">+ Agregar Producto</button>

        <div class="form-actions" style="margin-top: 1.5rem;">
          <button type="submit" id="btn-save-draft" class="btn btn-primary">Generar Borrador (DRAFT)</button>
        </div>
      </form>

      <!-- PANTALLA DE REVISIÓN Y EMISIÓN -->
      <div id="draft-review-container" style="display: none; margin-top: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 6px;" class="review-box">
        <h4>Revisión del Borrador</h4>
        <div id="review-details" style="margin: 10px 0;"></div>
        <div class="actions">
          <button id="btn-confirm-issue" class="btn btn-success">Confirmar y Emitir a Factus</button>
        </div>
      </div>

      <!-- VISTA DE RESULTADO FINAL (FACTUS) -->
      <div id="issue-result-container" style="display: none; margin-top: 20px; padding: 15px; border: 1px solid #28a745; border-radius: 6px; background-color: #f8fff9;" class="result-box">
        <h3 style="color: #28a745;">¡Factura Emitida Correctamente!</h3>
        <p><strong>Número:</strong> <span id="res-number"></span></p>
        <p><strong>Estado:</strong> <span id="res-status"></span></p>
        <p><strong>CUFE:</strong> <span id="res-cufe" style="word-break: break-all; font-family: monospace;"></span></p>
        <div id="res-qr-container" style="margin: 15px 0;"></div>
        <div style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 10px;">
          <a id="res-public-url" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Ver Documento Público (Factus)</a>
          <a id="res-detail-url" href="#/facturas" class="btn btn-secondary">Ver detalle de la factura</a>
        </div>
        <div style="margin-top: 1.5rem;">
          <button id="btn-new-invoice-again" class="btn btn-secondary">Crear Otra Factura</button>
        </div>
      </div>
    </section>
  `,await Nn(t)}async function Nn(t){let e=[],a=null;const r=t.querySelector("#select-customer"),n=t.querySelector("#items-container"),o=t.querySelector("#btn-add-item"),s=t.querySelector("#form-invoice-draft"),i=t.querySelector("#invoice-alert-container"),c=t.querySelector("#draft-review-container"),u=t.querySelector("#review-details"),f=t.querySelector("#btn-confirm-issue"),A=t.querySelector("#issue-result-container"),h=t.querySelector("#btn-new-invoice-again");function y(l,m=!0){i.style.display="block",i.style.padding="10px",i.style.backgroundColor=m?"#f8d7da":"#d4edda",i.style.color=m?"#721c24":"#155724",i.style.borderColor=m?"#f5c6cb":"#c3e6cb",i.textContent=l}function b(){i.style.display="none",i.textContent=""}h&&h.addEventListener("click",()=>{A.style.display="none",s.style.display="block",s.reset(),n.innerHTML="",E(),a=null});function d(l){return l?Array.isArray(l)?l:Array.isArray(l.data)?l.data:l.data&&Array.isArray(l.data.data)?l.data.data:l.data&&l.data.items&&Array.isArray(l.data.items)?l.data.items:l.docs&&Array.isArray(l.docs)?l.docs:l.results&&Array.isArray(l.results)?l.results:[]:[]}function E(){const l=document.createElement("div");l.className="item-row",l.style.display="flex",l.style.flexWrap="wrap",l.style.gap="10px",l.style.marginBottom="10px";let m='<option value="">Seleccione producto...</option>';e.length===0?m+='<option value="" disabled>(No hay productos disponibles)</option>':e.forEach(p=>{const g=v(p._id||p.id),S=v(p.name||p.title||p.code||"Producto sin nombre"),w=p.price?` ($${p.price})`:"";m+=`<option value="${g}">${S}${w}</option>`}),l.innerHTML=`
      <select class="item-product form-control" required style="flex: 2; padding: 6px;">${m}</select>
      <input type="number" class="item-qty form-control" min="1" value="1" required style="flex: 1; padding: 6px;" />
      <button type="button" class="btn-remove-row btn btn-danger" style="padding: 6px 12px;">X</button>
    `,l.querySelector(".btn-remove-row").addEventListener("click",()=>{n.querySelectorAll(".item-row").length>1?l.remove():y("La factura debe tener al menos un producto.")}),n.appendChild(l)}o.addEventListener("click",()=>{b(),E()});try{const[l,m]=await Promise.all([qt(),Dt()]),p=d(l);e=d(m),r.innerHTML='<option value="">Seleccione un cliente...</option>',!p||p.length===0?r.innerHTML+='<option value="" disabled>(No hay clientes registrados)</option>':p.forEach(g=>{const S=v(g._id||g.id),w=v(g.names||g.name||g.legal_name||g.identificationNumber||"Cliente sin nombre");r.innerHTML+=`<option value="${S}">${w}</option>`}),n.innerHTML="",E()}catch(l){console.error("Error al cargar datos iniciales:",l),y("Error al conectar con el servidor para cargar clientes o productos: "+l.message)}s.addEventListener("submit",async l=>{var S,w;l.preventDefault(),b();const m=r.value,p=n.querySelectorAll(".item-row"),g=Array.from(p).map(C=>({productId:C.querySelector(".item-product").value,quantity:parseInt(C.querySelector(".item-qty").value,10)})).filter(C=>C.productId&&C.quantity>0);if(g.length===0){y("Debe agregar al menos un producto válido.");return}try{const C=await ye({customerId:m,items:g}),T=C.data||C;a=T._id||T.id;const M=T.subtotal??0,x=T.taxTotal??T.taxes??0,q=T.grandTotal??T.total??0,O=v(((S=T.customer)==null?void 0:S.names)||((w=T.customer)==null?void 0:w.name)||"Cliente asociado");let I='<ul style="margin: 5px 0 15px 20px; padding: 0;">';Array.isArray(T.items)&&T.items.forEach(V=>{const oe=v(V.name||"Producto"),ae=V.quantity||1,se=N(V.unitPrice||0),ie=V.taxRate?`${V.taxRate}%`:"0%";I+=`<li>${ae}x ${oe} - P/U: ${se} (Impuesto: ${ie})</li>`}),I+="</ul>",u.innerHTML=`
        <p><strong>ID Borrador:</strong> ${v(a)}</p>
        <p><strong>Cliente:</strong> ${O}</p>
        <p><strong>Productos:</strong></p>
        ${I}
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 10px 0;" />
        <p><strong>Subtotal:</strong> ${N(M)}</p>
        <p><strong>Total Impuestos:</strong> ${N(x)}</p>
        <p><strong>Total Final (Grand Total):</strong> <span style="font-size: 1.1em; color: #007bff; font-weight: bold;">${N(q)}</span></p>
      `,c.style.display="block",c.scrollIntoView({behavior:"smooth"})}catch(C){y("Error creando borrador: "+C.message)}}),f.addEventListener("click",async()=>{if(a){f.disabled=!0,f.textContent="Emitiendo a Factus...",b();try{const l=await be(a),m=l.data||l;c.style.display="none",s.style.display="none",t.querySelector("#res-number").textContent=m.numbering||m.number||"No disponible",t.querySelector("#res-status").textContent=m.status||"No disponible",t.querySelector("#res-cufe").textContent=m.cufe||"No disponible";const p=t.querySelector("#res-qr-container"),g=await Lt(_t(m));g?p.innerHTML=`<img src="${g}" alt="Código QR de la factura" width="180" height="180" />`:p.innerHTML='<p class="muted">QR: No disponible</p>';const S=t.querySelector("#res-public-url"),w=tt(m);w?(S.href=w,S.style.display=""):S.style.display="none";const C=t.querySelector("#res-detail-url"),T=m._id||m.id;T?(C.href=`#/facturas/${T}`,C.style.display=""):C.style.display="none",A.style.display="block",A.scrollIntoView({behavior:"smooth"})}catch(l){y("Error en emisión: "+l.message),f.disabled=!1,f.textContent="Confirmar y Emitir a Factus"}}})}async function Ln(t){t.innerHTML=`
    <div class="page-head">
      <h1>Facturas</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
        <a class="btn btn-secondary" href="#/dashboard">Estadísticas</a>
      </div>
    </div>
    <section class="panel" data-list>${k("Cargando facturas…")}</section>`;const e=t.querySelector("[data-list]");async function a(){var r;e.innerHTML=k("Cargando facturas…");try{const n=await ot();if(!e.isConnected)return;if(!n.length){e.innerHTML=at({title:"Aún no hay facturas",text:"Cuando crees la primera factura aparecerá aquí.",actionLabel:"Crear mi primera factura",href:"#/facturas/nueva"});return}const o=[...n].sort((i,c)=>new Date(c.createdAt||0)-new Date(i.createdAt||0)),s=o.map(i=>{const c=i._id||i.id||"",u=typeof i.customer=="object"&&i.customer?i.customer:null,f=(u==null?void 0:u.names)||(u==null?void 0:u.name)||(u==null?void 0:u.legal_name)||"Cliente sin nombre",A=i.numbering||i.referenceCode||c;return`
          <tr>
            <td>${v(A)}</td>
            <td>${v(f)}</td>
            <td>${i.createdAt?z(i.createdAt):"—"}</td>
            <td class="num">${N(i.subtotal||0)}</td>
            <td class="num">${N(i.taxTotal||i.taxes||0)}</td>
            <td class="num">${N(i.grandTotal||i.total||0)}</td>
            <td>${K(i.status)}</td>
            <td><a class="btn btn-secondary btn-small" href="#/facturas/${v(c)}">Ver detalle</a></td>
          </tr>`}).join("");e.innerHTML=`
        <p class="muted panel-note">${o.length} factura(s) · más recientes primero</p>
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th class="num">Subtotal</th>
                <th class="num">Impuestos</th>
                <th class="num">Total</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>${s}</tbody>
          </table>
        </div>`}catch(n){if(!e.isConnected)return;e.innerHTML=Y({title:"No pudimos cargar las facturas",text:(n==null?void 0:n.message)||"Intenta nuevamente.",actionLabel:"Intentar de nuevo"}),(r=e.querySelector("[data-retry]"))==null||r.addEventListener("click",a)}}await a()}const D=t=>t?v(String(t)):"No disponible";async function ne(t,e){var r;t.innerHTML=`
    <div class="page-head">
      <h1>Detalle de factura</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-secondary" href="#/facturas">Volver a facturas</a>
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
      </div>
    </div>
    <section class="panel" data-detail>${k("Cargando factura…")}</section>`;const a=t.querySelector("[data-detail]");try{const n=await he(e);if(!a.isConnected)return;const o=(n==null?void 0:n.data)||n;if(!o||!o._id)throw Object.assign(new Error("La factura solicitada no existe (404)."),{status:404});const s=typeof o.customer=="object"&&o.customer?o.customer:null,i=(s==null?void 0:s.names)||(s==null?void 0:s.name)||(s==null?void 0:s.legal_name)||null,c=o.numbering||o.referenceCode||null,u=o.status||"DRAFT",f=_t(o),A=await Lt(f),h=tt(o),y=Array.isArray(o.items)?o.items:[],b=y.length?y.map(d=>`
          <tr>
            <td>${v(d.name||"Producto")}</td>
            <td>${v(d.code||"")}</td>
            <td class="num">${Number(d.quantity)||0}</td>
            <td class="num">${N(d.unitPrice||0)}</td>
            <td class="num">${N(d.subtotal||0)}</td>
            <td class="num">${N(d.taxAmount||0)}</td>
            <td class="num">${N(d.total||0)}</td>
          </tr>`).join(""):'<tr><td colspan="7" style="text-align:center;color:var(--ink-soft);">No disponible</td></tr>';if(!a.isConnected)return;a.innerHTML=`
      <div class="detail-head">
        <div>
          <p class="detail-number">${D(c)}</p>
          <p class="detail-customer">${D(i)}${s!=null&&s.identificationNumber?` · ${v(s.identificationNumber)}`:""}</p>
        </div>
        ${K(u)}
      </div>

      <dl class="detail-grid">
        <div><dt>Número</dt><dd>${D(c)}</dd></div>
        <div><dt>Cliente</dt><dd>${D(i)}</dd></div>
        <div><dt>Identificación</dt><dd>${D(s==null?void 0:s.identificationNumber)}</dd></div>
        <div><dt>Fecha</dt><dd>${o.createdAt?z(o.createdAt):"No disponible"}</dd></div>
        <div><dt>Estado</dt><dd>${v(Ct(u).label)} (${v(u)})</dd></div>
        <div><dt>Referencia interna</dt><dd>${D(o.referenceCode)}</dd></div>
      </dl>

      ${o.errorMessage?`<p class="alert-error">Error de emisión: ${v(o.errorMessage)}</p>`:""}

      <h2>Productos</h2>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Producto</th><th>Código</th><th class="num">Cant.</th><th class="num">Precio</th>
              <th class="num">Subtotal</th><th class="num">Impuestos</th><th class="num">Total</th>
            </tr>
          </thead>
          <tbody>${b}</tbody>
        </table>
      </div>

      <dl class="detail-grid totals">
        <div><dt>Subtotal</dt><dd>${N(o.subtotal||0)}</dd></div>
        <div><dt>Impuestos</dt><dd>${N(o.taxTotal||o.taxes||0)}</dd></div>
        <div><dt>Total</dt><dd class="total-strong">${N(o.grandTotal||o.total||0)}</dd></div>
      </dl>

      <h2>Validación DIAN</h2>
      <dl class="detail-grid">
        <div style="grid-column: 1 / -1;"><dt>CUFE</dt><dd class="mono">${D(o.cufe)}</dd></div>
      </dl>

      <div class="qr-block">
        ${A?`<img src="${A}" alt="Código QR de la factura ${v(c||"")}" width="200" height="200" />`:'<p class="muted">QR: No disponible</p>'}
        <div class="qr-links">
          ${f&&/^https?:\/\//i.test(f)?`<a class="btn btn-secondary" href="${v(f)}" target="_blank" rel="noopener noreferrer">Abrir verificación DIAN</a>`:""}
          ${h?`<a class="btn btn-primary" href="${v(h)}" target="_blank" rel="noopener noreferrer">Ver documento público (Factus)</a>`:'<p class="muted">Documento público: No disponible</p>'}
        </div>
      </div>`}catch(n){if(!a.isConnected)return;const o=(n==null?void 0:n.status)===404||/no existe|404|not found/i.test((n==null?void 0:n.message)||"");a.innerHTML=`
      ${Y({title:o?"Factura no encontrada":"No pudimos cargar la factura",text:(n==null?void 0:n.message)||"Error desconocido.",actionLabel:o?null:"Intentar de nuevo"})}
      <div style="text-align:center; padding-bottom: var(--space-6);">
        <a class="btn btn-secondary" href="#/facturas">Volver a facturas</a>
      </div>`,o||(r=a.querySelector("[data-retry]"))==null||r.addEventListener("click",()=>ne(t,e))}}const rt=6,In=t=>t.status==="ISSUED",gt=t=>t.reduce((e,a)=>e+(Number(a.grandTotal??a.total)||0),0);function $n(t){const e=new Date,a=t.filter(In),r=Array.from({length:rt},(o,s)=>{const i=new Date(e.getFullYear(),e.getMonth()-(rt-1-s),1),c=a.filter(u=>{const f=new Date(u.createdAt);return f.getMonth()===i.getMonth()&&f.getFullYear()===i.getFullYear()});return{label:$e(i),total:gt(c),count:c.length}}),n={};return t.forEach(o=>{const s=o.status??"";n[s]=(n[s]??0)+1}),{monthTotal:r[r.length-1].total,monthCount:r[r.length-1].count,totalBilled:gt(a),totalAll:gt(t),total:t.length,issued:a.length,errors:t.filter(o=>Ct(o.status).tone==="danger").length,cancelled:t.filter(o=>o.status==="CANCELLED").length,drafts:t.filter(o=>o.status==="DRAFT").length,months:r,byStatus:Object.entries(n).sort((o,s)=>s[1]-o[1])}}function Bt(t){return[["Total facturado (emitidas)",t?N(t.totalBilled):"—"],["Total registrado",t?N(t.totalAll):"—"],["Facturas",t?t.total:"—"],["Emitidas",t?t.issued:"—"],["Con error",t?t.errors:"—"],["Canceladas",t?t.cancelled:"—"]].map(([a,r])=>`<div class="stat"><p class="stat-label">${a}</p><p class="stat-value">${r}</p></div>`).join("")}function Mn(t){const e=Math.max(...t.map(r=>r.total),0),a=t.map(r=>{const n=e?Math.max(r.total/e*100,r.total?4:0):0;return`<li class="bar">
      <span class="bar-value">${r.total?Ie(r.total):"0"}</span>
      <span class="bar-track"><span class="bar-fill" style="height:${n}%"></span></span>
      <span class="bar-label">${r.label}</span>
    </li>`}).join("");return`<ul class="bars" aria-label="Facturado por mes, últimos ${rt} meses">${a}</ul>`}function xn(t,e){return`<ul class="rows">${t.map(([a,r])=>`
    <li class="row">
      <div class="row-main">${K(a)}</div>
      <div class="meter-wrap"><span class="meter"><span style="width:${e?r/e*100:0}%"></span></span>
      <span class="row-amount">${r}</span></div>
    </li>`).join("")}</ul>`}function Rn(t){t.innerHTML=`
    <div class="page-head">
      <h1>Estadísticas</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-secondary" href="#/facturas">Ver facturas</a>
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
      </div>
    </div>
    <section class="summary" aria-label="Resumen"></section>
    <div data-detail></div>`;const e=t.querySelector(".summary"),a=t.querySelector("[data-detail]");async function r(){var n;e.innerHTML=Bt(null),a.innerHTML=`<section class="panel">${k("Cargando estadísticas…")}</section>`;try{const o=await ot();if(!a.isConnected)return;if(!o.length){a.innerHTML=`<section class="panel">${at({title:"Aún no hay estadísticas",text:"Aparecerán cuando emitas tu primera factura.",actionLabel:"Crear mi primera factura",href:"#/facturas/nueva"})}</section>`;return}const s=$n(o);e.innerHTML=Bt(s),a.innerHTML=`
        <section class="panel stack" aria-labelledby="months-title">
          <h2 id="months-title">Facturado por mes (emitidas, últimos ${rt} meses)</h2>
          ${Mn(s.months)}
        </section>
        <section class="panel stack" aria-labelledby="status-title">
          <h2 id="status-title">Facturas por estado</h2>
          ${xn(s.byStatus,s.total)}
        </section>
        <section class="panel stack" aria-labelledby="period-title">
          <h2 id="period-title">Resumen del mes actual</h2>
          <ul class="rows">
            <li class="row"><div class="row-main">Facturado este mes (emitidas)</div><span class="row-amount">${N(s.monthTotal)}</span></li>
            <li class="row"><div class="row-main">Facturas creadas este mes</div><span class="row-amount">${s.monthCount}</span></li>
            <li class="row"><div class="row-main">Borradores</div><span class="row-amount">${s.drafts}</span></li>
          </ul>
        </section>`}catch(o){if(!a.isConnected)return;a.innerHTML=`<section class="panel">${Y({title:"No pudimos cargar las estadísticas",text:(o==null?void 0:o.message)||"Intenta nuevamente.",actionLabel:"Intentar de nuevo"})}</section>`,(n=a.querySelector("[data-retry]"))==null||n.addEventListener("click",r)}}r()}async function Pn(t){t.innerHTML=`
    <div class="page-head">
      <h1>Notas crédito</h1>
      <div class="actions" style="margin-bottom: 0;">
        <a class="btn btn-secondary" href="#/facturas">Ver facturas</a>
        <a class="btn btn-primary" href="#/facturas/nueva">Nueva factura</a>
      </div>
    </div>

    <section class="panel stack" aria-labelledby="cn-create">
      <h2 id="cn-create">Crear nota crédito sobre una factura emitida</h2>
      <div class="panel-body">
        <div id="cn-alert" style="display:none;" class="alert-inline"></div>

        <div class="form-group">
          <label for="cn-invoice"><strong>Factura emitida:</strong></label>
          <select id="cn-invoice" class="form-control" disabled>
            <option value="">Cargando facturas emitidas…</option>
          </select>
        </div>

        <div id="cn-invoice-info" class="info-box" style="display:none;"></div>

        <div class="form-group">
          <label for="cn-concept"><strong>Concepto de corrección:</strong></label>
          <select id="cn-concept" class="form-control" disabled>
            <option value="">Cargando conceptos…</option>
          </select>
        </div>

        <div class="form-group">
          <label for="cn-observation"><strong>Observación:</strong></label>
          <textarea id="cn-observation" class="form-control" rows="2" placeholder="Motivo de la nota crédito"></textarea>
        </div>

        <div class="form-actions">
          <button id="cn-submit" class="btn btn-primary" disabled>Emitir nota crédito</button>
        </div>

        <div id="cn-result" style="display:none; margin-top: 16px;"></div>
      </div>
    </section>

    <section class="panel stack" aria-labelledby="cn-list" style="margin-top: 1.5rem;">
      <h2 id="cn-list">Notas crédito registradas</h2>
      <div data-notes>${k("Cargando notas crédito…")}</div>
    </section>`;const e=t.querySelector("#cn-invoice"),a=t.querySelector("#cn-concept"),r=t.querySelector("#cn-observation"),n=t.querySelector("#cn-invoice-info"),o=t.querySelector("#cn-alert"),s=t.querySelector("#cn-submit"),i=t.querySelector("#cn-result"),c=t.querySelector("[data-notes]"),u=(E,l=!0)=>{o.style.display="block",o.textContent=E,o.classList.toggle("is-error",l),o.classList.toggle("is-ok",!l)},f=()=>{o.style.display="none",o.textContent=""};let A=[],h=null;const y=()=>{s.disabled=!(h&&a.value)};e.addEventListener("change",()=>{f(),i.style.display="none";const E=e.value;if(h=A.find(m=>(m._id||m.id)===E)||null,!h){n.style.display="none",y();return}const l=typeof h.customer=="object"&&h.customer?h.customer:null;n.style.display="block",n.innerHTML=`
      <p><strong>Número:</strong> ${v(h.numbering||h.referenceCode||"No disponible")}</p>
      <p><strong>Cliente:</strong> ${v((l==null?void 0:l.names)||(l==null?void 0:l.name)||"No disponible")}${l!=null&&l.identificationNumber?` · ${v(l.identificationNumber)}`:""}</p>
      <p><strong>Fecha:</strong> ${h.createdAt?z(h.createdAt):"No disponible"}</p>
      <p><strong>Total:</strong> ${N(h.grandTotal||0)} (Impuestos ${N(h.taxTotal||0)})</p>
      <p><strong>Estado:</strong> ${v(h.status||"")}</p>`,y()}),a.addEventListener("change",()=>{f(),y()}),s.addEventListener("click",async()=>{if(!h)return;const E=h._id||h.id;f(),s.disabled=!0,s.textContent="Emitiendo en Factus…";try{const l=await Ce({invoiceId:E,correctionConceptCode:a.value,observation:r.value.trim()||void 0}),m=(l==null?void 0:l.data)||l,p=await Lt(m.qrCodeUrl),g=tt(m);i.style.display="block",i.className="result-box",i.innerHTML=`
        <h3>Nota crédito emitida</h3>
        <p><strong>Número:</strong> ${v(m.numbering||"No disponible")}</p>
        <p><strong>Factura referenciada:</strong> ${v(m.billNumber||"No disponible")}</p>
        <p><strong>Concepto de corrección:</strong> ${v(m.correctionConceptCode||"")}</p>
        <p><strong>Total:</strong> ${N(m.total||0)}</p>
        <p><strong>CUDE:</strong> <span class="mono">${v(m.cude||"No disponible")}</span></p>
        <div style="margin: 10px 0;">
          ${p?`<img src="${p}" alt="Código QR de la nota crédito" width="160" height="160" />`:'<p class="muted">QR: No disponible</p>'}
        </div>
        ${g?`<a class="btn btn-primary" href="${v(g)}" target="_blank" rel="noopener noreferrer">Ver documento público (Factus)</a>`:'<p class="muted">Documento público: No disponible</p>'}`,r.value="",u("Nota crédito creada y validada por Factus.",!1),await b()}catch(l){const m=l!=null&&l.details&&typeof l.details=="object"?` ${String(JSON.stringify(l.details.message||l.details)).slice(0,300)}`:"";u(`Error al emitir la nota crédito: ${(l==null?void 0:l.message)||"error desconocido"}${m}`)}finally{s.textContent="Emitir nota crédito",y()}});async function b(){var E;try{const l=await ve();if(!c.isConnected)return;if(!l.length){c.innerHTML=at({title:"Aún no hay notas crédito",text:"Las notas crédito que emitas sobre facturas aparecerán aquí."});return}const m=l.map(p=>{const g=tt(p);return`
          <tr>
            <td>${v(p.numbering||p.referenceCode||"No disponible")}</td>
            <td>${v(p.billNumber||"No disponible")}</td>
            <td>${v(p.customerNames||"No disponible")}</td>
            <td>${p.createdAt?z(p.createdAt):"—"}</td>
            <td class="num">${N(p.total||0)}</td>
            <td>${K(p.status==="ISSUED"?"ISSUED":"ERROR")}</td>
            <td>${g?`<a class="btn btn-secondary btn-small" href="${v(g)}" target="_blank" rel="noopener noreferrer">Documento</a>`:'<span class="muted">No disponible</span>'}</td>
          </tr>`}).join("");c.innerHTML=`
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Número</th><th>Factura</th><th>Cliente</th><th>Fecha</th>
                <th class="num">Total</th><th>Estado</th><th>Documento</th>
              </tr>
            </thead>
            <tbody>${m}</tbody>
          </table>
        </div>`}catch(l){if(!c.isConnected)return;c.innerHTML=Y({title:"No pudimos cargar las notas crédito",text:(l==null?void 0:l.message)||"Intenta nuevamente.",actionLabel:"Intentar de nuevo"}),(E=c.querySelector("[data-retry]"))==null||E.addEventListener("click",b)}}async function d(){var g,S;const[E,l]=await Promise.allSettled([ot(),we()]);A=(E.status==="fulfilled"?E.value:[]).filter(w=>w.status==="ISSUED").sort((w,C)=>new Date(C.createdAt||0)-new Date(w.createdAt||0)),e.innerHTML='<option value="">Seleccione una factura emitida…</option>',E.status==="rejected"?(e.innerHTML+='<option value="" disabled>No se pudieron cargar las facturas</option>',u(`No se pudieron cargar las facturas: ${((g=E.reason)==null?void 0:g.message)||"error"}`)):A.length?A.forEach(w=>{const C=v(w._id||w.id),T=typeof w.customer=="object"&&w.customer?w.customer:null,M=`${w.numbering||w.referenceCode||C} · ${(T==null?void 0:T.names)||(T==null?void 0:T.name)||"Cliente"} · ${N(w.grandTotal||0)}`;e.insertAdjacentHTML("beforeend",`<option value="${C}">${v(M)}</option>`)}):e.innerHTML+='<option value="" disabled>No hay facturas emitidas (ISSUED)</option>',e.disabled=!1;const p=l.status==="fulfilled"?l.value:[];a.innerHTML='<option value="">Seleccione un concepto…</option>',p.length?p.forEach(w=>{a.insertAdjacentHTML("beforeend",`<option value="${v(w.code)}">${v(w.code)} · ${v(w.name)}</option>`)}):(a.innerHTML+='<option value="" disabled>No hay conceptos disponibles</option>',l.status==="rejected"&&u(`No se pudieron cargar los conceptos: ${((S=l.reason)==null?void 0:S.message)||"error"}`)),a.disabled=!1,y(),await b()}d()}async function Bn(t){t.innerHTML=`
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Gestión de Clientes</h2>
      <button id="btn-toggle-customer-form" class="btn btn-primary">+ Nuevo Cliente</button>
    </div>

    <!-- CONTENEDOR DE ALERTAS -->
    <div id="customer-alert" style="display: none; margin-bottom: 15px;" class="alert-box"></div>

    <!-- FORMULARIO OCULTO PARA CREAR / EDITAR -->
    <div id="customer-form-container" class="card-section" style="display: none; margin-bottom: 20px;">
      <h3 id="form-customer-title">Crear Nuevo Cliente</h3>
      <form id="form-customer">
        <input type="hidden" id="customer-id" />
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Nombres / Razón Social:</label>
          <input type="text" id="cust-names" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Identificación / NIT:</label>
          <input type="text" id="cust-identification" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Correo Electrónico:</label>
          <input type="email" id="cust-email" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
          <label>Teléfono:</label>
          <input type="text" id="cust-phone" class="form-control" style="width: 100%; padding: 8px;" />
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn btn-success" id="btn-save-customer">Guardar Cliente</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-customer">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- LISTADO DE CLIENTES -->
    <section class="card-section">
      <div id="customers-loading">Cargando clientes...</div>
      <table id="table-customers" class="data-table" style="display: none; width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc; text-align: left;">
            <th style="padding: 8px;">Nombre / Razón Social</th>
            <th style="padding: 8px;">Identificación</th>
            <th style="padding: 8px;">Correo</th>
            <th style="padding: 8px;">Teléfono</th>
            <th style="padding: 8px;">Acciones</th>
          </tr>
        </thead>
        <tbody id="customers-rows"></tbody>
      </table>
    </section>
  `,await qn(t)}async function qn(t){const e=t.querySelector("#customers-loading"),a=t.querySelector("#table-customers"),r=t.querySelector("#customers-rows"),n=t.querySelector("#customer-form-container"),o=t.querySelector("#btn-toggle-customer-form"),s=t.querySelector("#btn-cancel-customer"),i=t.querySelector("#form-customer"),c=t.querySelector("#customer-alert"),u=t.querySelector("#form-customer-title"),f=t.querySelector("#customer-id");function A(b,d=!0){c.style.display="block",c.style.padding="10px",c.style.backgroundColor=d?"#f8d7da":"#d4edda",c.style.color=d?"#721c24":"#155724",c.textContent=b}function h(){c.style.display="none"}o.addEventListener("click",()=>{i.reset(),f.value="",u.textContent="Crear Nuevo Cliente",n.style.display=n.style.display==="none"?"block":"none",h()}),s.addEventListener("click",()=>{n.style.display="none"});async function y(){var b;e.style.display="block",a.style.display="none";try{const d=await qt(),E=Array.isArray(d)?d:d!=null&&d.data&&Array.isArray(d.data)?d.data:((b=d==null?void 0:d.data)==null?void 0:b.data)||[];if(r.innerHTML="",!E||E.length===0){e.textContent="No hay clientes registrados.";return}E.forEach(l=>{const m=v(l._id||l.id),p=v(l.names||l.name||l.legal_name||"Sin nombre"),g=v(l.identificationNumber||l.identification||"N/A"),S=v(l.email||"N/A"),w=v(l.phone||"N/A"),C=document.createElement("tr");C.style.borderBottom="1px solid #eee",C.innerHTML=`
          <td style="padding: 8px;">${p}</td>
          <td style="padding: 8px;">${g}</td>
          <td style="padding: 8px;">${S}</td>
          <td style="padding: 8px;">${w}</td>
          <td style="padding: 8px;">
            <button class="btn btn-small btn-secondary btn-edit" style="padding: 4px 8px; margin-right: 5px;">Editar</button>
            <button class="btn btn-small btn-danger btn-delete" style="padding: 4px 8px;">Eliminar</button>
          </td>
        `,C.querySelector(".btn-edit").addEventListener("click",()=>{f.value=m,t.querySelector("#cust-names").value=l.names||l.name||l.legal_name||"",t.querySelector("#cust-identification").value=l.identificationNumber||l.identification||"",t.querySelector("#cust-email").value=l.email||"",t.querySelector("#cust-phone").value=l.phone||"",u.textContent="Editar Cliente",n.style.display="block",n.scrollIntoView({behavior:"smooth"})}),C.querySelector(".btn-delete").addEventListener("click",async()=>{if(confirm("¿Estás seguro de eliminar este cliente?"))try{await Ee(m),y()}catch(T){A("Error al eliminar: "+T.message)}}),r.appendChild(C)}),e.style.display="none",a.style.display="table"}catch(d){e.textContent="Error cargando clientes: "+d.message}}i.addEventListener("submit",async b=>{b.preventDefault(),h();const d=f.value,E={names:t.querySelector("#cust-names").value,identificationNumber:t.querySelector("#cust-identification").value,email:t.querySelector("#cust-email").value,phone:t.querySelector("#cust-phone").value};try{d?await pe(d,E):await fe(E),n.style.display="none",y()}catch(l){A("Error al guardar cliente: "+l.message)}}),await y()}async function Dn(t){t.innerHTML=`
    <div class="header-actions" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>Gestión de Productos</h2>
      <button id="btn-toggle-product-form" class="btn btn-primary">+ Nuevo Producto</button>
    </div>

    <!-- CONTENEDOR DE ALERTAS -->
    <div id="product-alert" style="display: none; margin-bottom: 15px;" class="alert-box"></div>

    <!-- FORMULARIO OCULTO PARA CREAR / EDITAR -->
    <div id="product-form-container" class="card-section" style="display: none; margin-bottom: 20px;">
      <h3 id="form-product-title">Crear Nuevo Producto</h3>
      <form id="form-product">
        <input type="hidden" id="product-id" />
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Nombre del Producto:</label>
          <input type="text" id="prod-name" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Código / SKU:</label>
          <input type="text" id="prod-code" class="form-control" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 10px;">
          <label>Precio Unitario ($):</label>
          <input type="number" id="prod-price" class="form-control" min="0" step="any" required style="width: 100%; padding: 8px;" />
        </div>
        <div class="form-group" style="margin-bottom: 15px;">
          <label>Tasa de Impuesto (%):</label>
          <input type="number" id="prod-tax" class="form-control" min="0" value="19" required style="width: 100%; padding: 8px;" />
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="submit" class="btn btn-success" id="btn-save-product">Guardar Producto</button>
          <button type="button" class="btn btn-secondary" id="btn-cancel-product">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- LISTADO DE PRODUCTOS -->
    <section class="card-section">
      <div id="products-loading">Cargando productos...</div>
      <table id="table-products" class="data-table" style="display: none; width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc; text-align: left;">
            <th style="padding: 8px;">Código</th>
            <th style="padding: 8px;">Nombre</th>
            <th style="padding: 8px;">Precio Unitario</th>
            <th style="padding: 8px;">Impuesto (%)</th>
            <th style="padding: 8px;">Acciones</th>
          </tr>
        </thead>
        <tbody id="products-rows"></tbody>
      </table>
    </section>
  `,await kn(t)}async function kn(t){const e=t.querySelector("#products-loading"),a=t.querySelector("#table-products"),r=t.querySelector("#products-rows"),n=t.querySelector("#product-form-container"),o=t.querySelector("#btn-toggle-product-form"),s=t.querySelector("#btn-cancel-product"),i=t.querySelector("#form-product"),c=t.querySelector("#product-alert"),u=t.querySelector("#form-product-title"),f=t.querySelector("#product-id");function A(b,d=!0){c.style.display="block",c.style.padding="10px",c.style.backgroundColor=d?"#f8d7da":"#d4edda",c.style.color=d?"#721c24":"#155724",c.textContent=b}function h(){c.style.display="none"}o.addEventListener("click",()=>{i.reset(),f.value="",u.textContent="Crear Nuevo Producto",n.style.display=n.style.display==="none"?"block":"none",h()}),s.addEventListener("click",()=>{n.style.display="none"});async function y(){var b;e.style.display="block",a.style.display="none";try{const d=await Dt(),E=Array.isArray(d)?d:d!=null&&d.data&&Array.isArray(d.data)?d.data:((b=d==null?void 0:d.data)==null?void 0:b.data)||[];if(r.innerHTML="",!E||E.length===0){e.textContent="No hay productos registrados.";return}E.forEach(l=>{const m=v(l._id||l.id),p=v(l.name||l.title||"Sin nombre"),g=v(l.code||"S/C"),S=N(l.price||0),w=l.taxRate??l.tax??19,C=document.createElement("tr");C.style.borderBottom="1px solid #eee",C.innerHTML=`
          <td style="padding: 8px;">${g}</td>
          <td style="padding: 8px;">${p}</td>
          <td style="padding: 8px;">${S}</td>
          <td style="padding: 8px;">${w}%</td>
          <td style="padding: 8px;">
            <button class="btn btn-small btn-secondary btn-edit" style="padding: 4px 8px; margin-right: 5px;">Editar</button>
            <button class="btn btn-small btn-danger btn-delete" style="padding: 4px 8px;">Eliminar</button>
          </td>
        `,C.querySelector(".btn-edit").addEventListener("click",()=>{f.value=m,t.querySelector("#prod-name").value=l.name||l.title||"",t.querySelector("#prod-code").value=l.code||"",t.querySelector("#prod-price").value=l.price||0,t.querySelector("#prod-tax").value=w,u.textContent="Editar Producto",n.style.display="block",n.scrollIntoView({behavior:"smooth"})}),C.querySelector(".btn-delete").addEventListener("click",async()=>{if(confirm("¿Estás seguro de eliminar este producto?"))try{await Se(m),y()}catch(T){A("Error al eliminar: "+T.message)}}),r.appendChild(C)}),e.style.display="none",a.style.display="table"}catch(d){e.textContent="Error cargando productos: "+d.message}}i.addEventListener("submit",async b=>{b.preventDefault(),h();const d=f.value,E={name:t.querySelector("#prod-name").value,code:t.querySelector("#prod-code").value,price:parseFloat(t.querySelector("#prod-price").value),taxRate:parseFloat(t.querySelector("#prod-tax").value)};try{d?await ge(d,E):await me(E),n.style.display="none",y()}catch(l){A("Error al guardar producto: "+l.message)}}),await y()}function Fn(t){async function e(){t.innerHTML="";const a=window.location.hash.slice(1)||"/";le(a);try{switch(a){case"/":Be(t);break;case"/clientes":await Bn(t);break;case"/productos":await Dn(t);break;case"/facturas":await Ln(t);break;case"/facturas/nueva":await Tn(t);break;case"/dashboard":Rn(t);break;case"/notas-credito":await Pn(t);break;default:{const r=a.match(/^\/facturas\/([^/]+)$/);r&&r[1]!=="nueva"?await ne(t,decodeURIComponent(r[1])):t.innerHTML=`
              <div class="panel"><div class="state">
                <h3>404 - Página no encontrada</h3>
                <p>La ruta solicitada no existe.</p>
                <a class="btn btn-primary" href="#/">Volver al inicio</a>
              </div></div>`}}}catch(r){console.error("[Router] Error al renderizar la ruta:",a,r),t.innerHTML=`
        <div class="panel"><div class="state state-error" role="alert">
          <h3>Ocurrió un error al cargar la sección</h3>
          <p>${String((r==null?void 0:r.message)||"Error desconocido.")}</p>
          <a class="btn btn-primary" href="#/">Volver al inicio</a>
        </div></div>`}}window.addEventListener("hashchange",e),window.addEventListener("load",e)}const _n=ce(document.querySelector("#app"));Fn(_n);function re(){return ue().then(()=>Mt(!0)).catch(()=>Mt(!1))}re();setInterval(re,15e3);
