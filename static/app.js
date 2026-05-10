// ─── app.js — DCF Valuation Tool (calls Flask backend) ────────────────────
const { useState, useRef } = React;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SECTOR_NAMES = {1:"Neurovascular & Neurotech",2:"Orthopedics & Musculoskeletal",3:"Cardiovascular & Vascular",4:"Cardiovascular Devices",5:"In-Vitro Diagnostics",6:"Surgical Robotics & Endoscopy",7:"Hospital IT / SaMD",8:"Ophthalmology & Laser",9:"Regenerative Medicine",10:"Monitoring & Implantables"};
const SECTOR_KW = {1:["neuro","brain","neural","seizure","epilep","stroke","cranial"],2:["ortho","bone","spine","musculo","joint","fracture"],3:["cardio","cardiac","heart","wound","vascular","artery"],4:["atrial","perfusion","vein","bypass","angio"],5:["diagnos","ivd","assay","biomarker","reagent","lab "],6:["robot","endoscop","laparoscop","oncol","radiation"],7:["software","samd","digital","imaging","mri","pacs"],8:["ophthalm","eye","retina","ocular","vision","glaucom","laser"],9:["regenerat","tissue","cell ther","biologic","scaffold"],10:["monitor","wearable","sensor","cgm","glucose","implantable","pacemaker"]};
const WACC_P = {"Switzerland":{rf:0.0075,erp:0.0554,tax:0.149,g:0.015},"United States":{rf:0.0425,erp:0.046,tax:0.21,g:0.0225},"Germany":{rf:0.025,erp:0.0554,tax:0.295,g:0.015},"France":{rf:0.03,erp:0.0554,tax:0.25,g:0.015},"Belgium":{rf:0.03,erp:0.0649,tax:0.25,g:0.015},"Sweden":{rf:0.0215,erp:0.0554,tax:0.206,g:0.015},"United Kingdom":{rf:0.04,erp:0.0554,tax:0.25,g:0.02},"Default":{rf:0.025,erp:0.055,tax:0.21,g:0.015}};
const DB = [{t:"PEN",n:"Penumbra Inc.",s:1,gm:67.4,eb:14.7,b:0.735,rg:15.6,c:"USA"},{t:"NYXH",n:"Nyxoah SA",s:1,gm:63.1,eb:0.0,b:0.876,rg:34.7,c:"Belgium"},{t:"CLPT",n:"ClearPoint Neuro",s:1,gm:61.4,eb:-58.1,b:1.294,rg:34.0,c:"USA"},{t:"BONEX",n:"BONESUPPORT AB",s:2,gm:92.5,eb:26.5,b:0.482,rg:14.3,c:"Sweden"},{t:"SIBN",n:"SI-BONE Inc.",s:2,gm:79.6,eb:-8.2,b:0.671,rg:15.0,c:"USA"},{t:"ATEC",n:"Alphatec Holdings",s:2,gm:70.2,eb:3.6,b:0.966,rg:13.6,c:"USA"},{t:"ATRC",n:"AtriCure Inc.",s:4,gm:75.6,eb:3.2,b:1.281,rg:14.3,c:"USA"},{t:"LMAT",n:"LeMaitre Vascular",s:4,gm:71.3,eb:30.7,b:0.597,rg:11.2,c:"USA"},{t:"VCYT",n:"Veracyte Inc.",s:5,gm:72.9,eb:19.2,b:1.885,rg:21.5,c:"USA"},{t:"EKF",n:"EKF Diagnostics",s:5,gm:51.4,eb:19.7,b:0.526,rg:5.4,c:"UK"},{t:"PRCT",n:"PROCEPT BioRobotics",s:6,gm:64.0,eb:-31.8,b:0.826,rg:20.2,c:"USA"},{t:"SECT",n:"Sectra AB",s:7,gm:38.9,eb:20.7,b:0.85,rg:5.6,c:"Sweden"},{t:"BFLY",n:"Butterfly Network",s:7,gm:66.1,eb:-49.0,b:2.28,rg:25.0,c:"USA"},{t:"STAA",n:"STAAR Surgical",s:8,gm:76.2,eb:-15.6,b:1.202,rg:18.1,c:"USA"},{t:"GKOS",n:"Glaukos Corp.",s:8,gm:78.1,eb:-8.0,b:0.948,rg:41.2,c:"USA"},{t:"VCEL",n:"Vericel Corp.",s:9,gm:74.8,eb:9.4,b:1.1,rg:30.1,c:"USA"},{t:"INSP",n:"Inspire Medical Systems",s:10,gm:85.8,eb:7.4,b:0.831,rg:1.6,c:"USA"},{t:"LIVN",n:"LivaNova PLC",s:10,gm:67.9,eb:18.3,b:0.819,rg:14.3,c:"UK"},{t:"IRTC",n:"iRhythm Technologies",s:10,gm:71.0,eb:-1.4,b:1.333,rg:25.7,c:"USA"}];
const REVENUE_MODELS = ["Revenue Blade","Capital Sale","SaaS","Per Test","OEM","Royalty Licensing","Hybrid","Other (explain in description)"];
const STAGES = ["Seed","Series A","Series B","Series C+","Pre-revenue R&D","Commercial","Other (explain in description)"];
const COUNTRIES = ["Switzerland","United States","Germany","France","Belgium","Sweden","United Kingdom","Netherlands","Spain","Italy","Denmark","Finland","Norway","Austria","Poland","Israel","Canada","Australia","Japan","China","India","Singapore","South Korea","Brazil","Default"];
const RATIONALE = {1:"Matched from Neurovascular & Neurotech — same regulatory pathway (FDA PMA/CE MDR Class III), implantable devices, similar gross margin and beta.",2:"Matched from Orthopedics & Musculoskeletal — surgical implants and bone repair, hospital reimbursement dynamics.",3:"Matched from Cardiovascular & Vascular — analogous distribution channels, clinical trial costs, gross margin.",4:"Matched from Cardiovascular Devices — interventional cardiology tools, procedural reimbursement model.",5:"Matched from In-Vitro Diagnostics — asset-light, high-margin consumables; benchmark for royalty/licensing.",6:"Matched from Surgical Robotics & Endoscopy — capital equipment + high-margin disposables.",7:"Matched from Hospital IT / SaMD — high gross margins (70–90%), recurring SaaS revenue, low CapEx.",8:"Matched from Ophthalmology & Laser — strong gross margins, predictable replacement cycles.",9:"Matched from Regenerative Medicine — milestone revenue, high R&D intensity, long timelines.",10:"Matched from Monitoring & Implantables — subscription/consumable revenue, FDA/CE Class II–III."};

const detectSector = (txt, manual) => {
  if(manual) return parseInt(manual);
  const t=txt.toLowerCase(); let best={s:10,sc:0};
  Object.entries(SECTOR_KW).forEach(([s,kws])=>{const sc=kws.filter(k=>t.includes(k)).length;if(sc>best.sc)best={s:parseInt(s),sc};});
  return best.s;
};
const med = arr => { const v=arr.filter(x=>x!=null&&isFinite(x)).sort((a,b)=>a-b); if(!v.length)return null; const m=Math.floor(v.length/2); return v.length%2?v[m]:(v[m-1]+v[m])/2; };
const getComps = s => { let c=DB.filter(x=>x.s===s&&x.gm!=null); if(c.length<3)c=DB.filter(x=>x.gm!=null).slice(0,5); return c.slice(0,5); };

const inferStagePremium = (ex, stage) => {
  const stagePremiums = {"Pre-revenue R&D":0.075,"Seed":0.065,"Series A":0.045,"Series B":0.030,"Series C+":0.015,"Commercial":0.010};
  let premium = stagePremiums[stage] ?? 0.05;
  if(ex?.runway_months != null){ if(ex.runway_months < 12) premium += 0.025; else if(ex.runway_months < 18) premium += 0.010; }
  if(ex?.gross_margin != null){ const gm = ex.gross_margin > 1 ? ex.gross_margin/100 : ex.gross_margin; if(gm > 0.75) premium -= 0.015; else if(gm < 0.30) premium += 0.015; }
  if(ex?.revenue_year1 != null && ex.revenue_year1 > 0) premium -= 0.010;
  return Math.max(0, Math.min(0.12, premium));
};

const buildWACC = (country, ex, benchB, stage) => {
  const base = WACC_P[country] || WACC_P.Default;
  const rf   = ex?.wacc_rf   ?? base.rf;
  const erp  = ex?.wacc_erp  ?? base.erp;
  const tax  = ex?.tax_rate  ?? base.tax;
  const g    = ex?.terminal_growth ?? base.g;
  const kd   = 0.06;
  const de   = 0.20;
  const betaU = ex?.beta_unlevered ?? benchB ?? 1.2;
  const betaL = betaU*(1+(1-tax)*de/(1-de));
  const stagePremium = inferStagePremium(ex, stage);
  const ke   = rf + betaL*erp + stagePremium;
  const wacc = (1-de)*ke + de*kd*(1-tax);
  const src = k => ex?.[k]!=null ? "📄 From document" : "📊 Damodaran / sector";
  return {rf,erp,tax,g,kd,de,betaU,betaL,ke,wacc,stagePremium,
    sources:{rf:src("wacc_rf"),erp:src("wacc_erp"),tax:src("tax_rate"),g:ex?.terminal_growth!=null?"📄 From document":"📊 Country default",kd:"📊 Market default",beta:src("beta_unlevered"),stage:"🎯 Stage baseline"}};
};

// ─── API CALLS TO FLASK BACKEND ──────────────────────────────────────────────
const apiExtract = async (files, description) => {
  const fd = new FormData();
  fd.append("description", description);
  files.forEach(f => fd.append("files", f));
  const resp = await fetch("/api/extract", {method:"POST", body:fd});
  return resp.json();
};

const apiGenerate = async (form, extracted, wacc, comps, bench, sectorName) => {
  const resp = await fetch("/api/generate", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({form, extracted, wacc, comps, bench, sectorName})
  });
  if(!resp.ok) throw new Error(await resp.text());
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Valuation_${form.company.replace(/\s/g,"_")}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#f0f2f7;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px}
  .app{width:100%;max-width:840px}
  .topbar{background:#1a2e4a;padding:18px 28px;display:flex;align-items:center;gap:12px;border-radius:12px 12px 0 0}
  .logo{font-size:15px;font-weight:700;color:#fff}.logo span{color:#7eb8e8;font-weight:400}
  .badge{margin-left:auto;font-size:11px;color:#7eb8e8;background:rgba(126,184,232,0.15);padding:4px 10px;border-radius:20px;border:1px solid rgba(126,184,232,0.3)}
  .steps{display:flex;background:#f0f2f7;border:1px solid #dde2ee;border-top:none}
  .step{flex:1;padding:13px 8px;text-align:center;font-size:11px;color:#aaa;border-right:1px solid #dde2ee;transition:all .2s}
  .step:last-child{border-right:none}
  .step.active{color:#1a2e4a;font-weight:700;background:#fff;border-bottom:2px solid #1a2e4a}
  .step.done{color:#2d7a4f;background:#f0faf4}
  .prog{height:3px;background:#dde2ee}.prog-f{height:100%;background:#1a2e4a;transition:width .4s}
  .card{background:#fff;border:1px solid #dde2ee;border-top:none;border-radius:0 0 12px 12px;padding:28px}
  .sec{display:none}.sec.on{display:block}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .full{grid-column:1/-1}
  label{display:block;font-size:11px;font-weight:600;color:#8892a4;letter-spacing:.05em;margin-bottom:6px;text-transform:uppercase}
  input,select,textarea{width:100%;padding:10px 13px;border:1.5px solid #dde2ee;border-radius:8px;font-size:14px;color:#1a2e4a;background:#fafbfd;outline:none;transition:border-color .15s;font-family:inherit;appearance:none}
  input:focus,select:focus,textarea:focus{border-color:#1a2e4a;background:#fff}
  textarea{height:90px;resize:none;line-height:1.5}
  select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238892a4' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
  .drop{border:2px dashed #c5cde0;border-radius:10px;padding:20px;cursor:pointer;text-align:center;transition:all .2s;background:#fafbfd}
  .drop:hover,.drop.drag{border-color:#1a2e4a;background:#f0f4fa}
  .drop input{display:none}
  .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
  .chip{display:flex;align-items:center;gap:6px;padding:4px 10px;background:#e4edf8;border-radius:20px;font-size:11px;color:#1a2e4a;font-weight:500}
  .chip-x{cursor:pointer;opacity:.6;font-size:14px}.chip-x:hover{opacity:1}
  .exbox{background:#f0faf4;border:1px solid #a8d5be;border-radius:8px;padding:12px 14px;margin-top:10px;font-size:11px;color:#1a4a30;line-height:1.7}
  .exbox b{display:block;margin-bottom:4px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#2d7a4f}
  .spinning{display:flex;align-items:center;gap:8px;font-size:12px;color:#1a2e4a;padding:10px 14px;background:#e4edf8;border-radius:8px;margin-top:10px}
  .row{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:22px}
  .hint{font-size:11px;color:#bbb}
  .btn{padding:10px 22px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;border:none}
  .btn-p{background:#1a2e4a;color:#fff}.btn-p:hover{background:#243d61}.btn-p:disabled{opacity:.4;cursor:not-allowed}
  .btn-s{background:transparent;border:1.5px solid #dde2ee;color:#666;font-weight:500}.btn-s:hover{background:#f5f7fb}
  .rat{background:#f0f4fa;border:1px solid #d0daf0;border-radius:8px;padding:13px 16px;margin-bottom:16px;font-size:12px;color:#3a4a6a;line-height:1.6}
  .rat b{color:#1a2e4a;display:block;margin-bottom:4px;font-size:11px;text-transform:uppercase;letter-spacing:.05em}
  .cc{background:#fafbfd;border:1px solid #e8ecf5;border-radius:10px;padding:13px 16px;display:flex;align-items:center;gap:14px;margin-bottom:8px}
  .tkr{width:44px;height:44px;border-radius:8px;background:#e4edf8;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#1a2e4a;text-align:center;flex-shrink:0}
  .bg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}
  .bc{background:#f5f6fa;border-radius:8px;padding:11px 13px;border:1px solid #e8ecf5}
  .bv{font-size:18px;font-weight:700;color:#1a2e4a}.bl{font-size:10px;color:#999;margin-top:2px}
  .tag{display:inline-block;padding:4px 12px;background:#e4edf8;color:#1a2e4a;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:14px}
  .wbox{background:#1a2e4a;border-radius:12px;padding:20px 24px;margin:14px 0;color:#fff}
  .wval{font-size:38px;font-weight:700;color:#7eb8e8}.wsub{font-size:11px;color:rgba(255,255,255,.5);margin-top:5px}
  .wtbl{width:100%;border-collapse:collapse;font-size:12px;margin:14px 0;border-radius:8px;overflow:hidden;border:1px solid #e8ecf5}
  .wtbl th{padding:8px 12px;text-align:left;background:#f0f2f7;color:#8892a4;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
  .wtbl td{padding:8px 12px;border-bottom:1px solid #f0f2f7;color:#1a2e4a}
  .wtbl tr:last-child td{border-bottom:none}
  .src-doc{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;background:#e8f5ee;color:#1a4a30}
  .src-def{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;background:#e4edf8;color:#1a2e4a}
  .dlbtn{display:flex;align-items:center;gap:12px;padding:16px 20px;background:#e8f5ee;border:1px solid #a8d5be;border-radius:10px;color:#1a4a30;font-size:14px;font-weight:600;cursor:pointer;width:100%;margin-top:14px;text-align:left;transition:background .15s}
  .dlbtn:hover{background:#d4eddf}.dlbtn:disabled{opacity:.5;cursor:not-allowed}
  .infobox{margin-top:10px;padding:10px 14px;background:#f8f9fb;border-radius:8px;font-size:11px;color:#999;border:1px solid #e5e8ee;line-height:1.6}
  .spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite;flex-shrink:0}
  .spin-d{display:inline-block;width:13px;height:13px;border:2px solid rgba(26,46,74,.2);border-top-color:#1a2e4a;border-radius:50%;animation:sp .7s linear infinite;flex-shrink:0}
  @keyframes sp{to{transform:rotate(360deg)}}
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
function App() {
  const [step,       setStep]      = useState(1);
  const [form,       setForm]      = useState({company:"",description:"",revenueModel:"",stage:"",country:"",sector:""});
  const [files,      setFiles]     = useState([]);
  const [extracting, setExtracting]= useState(false);
  const [extracted,  setExtracted] = useState(null);
  const [exNote,     setExNote]    = useState("");
  const [comps,      setComps]     = useState([]);
  const [bench,      setBench]     = useState({});
  const [sector,     setSector]    = useState(1);
  const [wacc,       setWacc]      = useState(null);
  const [loading,    setLoading]   = useState(false);
  const [dlLoading,  setDlLoading] = useState(false);
  const [drag,       setDrag]      = useState(false);
  const fileRef = useRef();

  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const canGo = form.company && form.revenueModel && form.stage && form.country && form.description.length>=10;

  const addFiles = async newF => {
    const arr = Array.from(newF);
    if(!arr.length) return;
    setFiles(p=>[...p,...arr]);
    setExtracting(true); setExNote("");
    const ctx = [
      form.company ? `Company: ${form.company}` : "",
      form.description?.length >= 10 ? `Description: ${form.description}` : "",
      form.stage ? `Stage: ${form.stage}` : "",
      form.country ? `Jurisdiction: ${form.country}` : "",
    ].filter(Boolean).join(". ") || "deep-tech medtech startup";
    try {
      const ex = await apiExtract(arr, ctx);
      setExtracted(prev => {
        const merged = {...(prev||{})};
        Object.entries(ex).forEach(([k,v]) => {
          if(Array.isArray(v)){
            const prevArr = Array.isArray(merged[k]) ? merged[k] : Array(11).fill(null);
            merged[k] = prevArr.map((old,i) => v[i] != null ? v[i] : old);
          } else if(v != null){ merged[k] = v; }
        });
        return merged;
      });
      setExNote(ex.notes || "Extraction complete.");
    } catch(e){ setExNote("Extraction failed: " + e.message); }
    setExtracting(false);
  };

  const removeFile = i => setFiles(p=>p.filter((_,j)=>j!==i));

  const runMatch = () => {
    const s = detectSector(form.description, form.sector);
    setSector(s);
    const matched = getComps(s);
    setComps(matched);
    const ex = extracted || {};
    const normGM = ex.gross_margin != null ? (ex.gross_margin > 1 ? ex.gross_margin : ex.gross_margin*100) : null;
    const normEB = ex.ebitda_margin != null ? (ex.ebitda_margin > 1 ? ex.ebitda_margin : ex.ebitda_margin*100) : null;
    setBench({
      gm: normGM ?? med(matched.map(c=>c.gm)),
      eb: normEB ?? med(matched.map(c=>c.eb).filter(v=>v!=null)),
      b:  ex.beta_unlevered ?? med(matched.map(c=>c.b).filter(v=>v!=null)),
      rg: ex.revenue_growth_rate ?? med(matched.map(c=>c.rg).filter(v=>v!=null)),
    });
    setStep(2);
  };

  const runGenerate = () => {
    setLoading(true);
    setTimeout(()=>{
      setWacc(buildWACC(form.country, extracted, bench.b, form.stage));
      setLoading(false); setStep(3);
    }, 1000);
  };

  const doDownload = async () => {
    setDlLoading(true);
    try {
      await apiGenerate({...form,sector}, extracted||{}, wacc, comps, bench, SECTOR_NAMES[sector]);
    } catch(e){ alert("Download error: " + e.message); }
    setDlLoading(false);
  };

  const pct = step===1?33:step===2?66:100;
  const exFields = extracted ? Object.entries(extracted).filter(([k,v])=>v!=null&&k!=="notes"&&k!=="currency"&&!Array.isArray(v)) : [];
  const exFieldsSorted = [
    ...exFields.filter(([k])=>["revenue_year1","revenue_year3","revenue_year5","gross_margin","ebitda_margin","burn_rate_monthly","runway_months","headcount_current","tam_size","deal1_upfront_fee","deal1_royalty_rate","funding_raised_total"].includes(k)),
    ...exFields.filter(([k])=>!["revenue_year1","revenue_year3","revenue_year5","gross_margin","ebitda_margin","burn_rate_monthly","runway_months","headcount_current","tam_size","deal1_upfront_fee","deal1_royalty_rate","funding_raised_total"].includes(k)),
  ];
  const exArrays = extracted ? Object.entries(extracted).filter(([k,v])=>Array.isArray(v)&&v.some(x=>x!=null)) : [];

  return React.createElement(React.Fragment, null,
    React.createElement("style", null, css),
    React.createElement("div", {className:"app"},
      React.createElement("div", {className:"topbar"},
        React.createElement("div", {className:"logo"}, "Financial ", React.createElement("span", null, "Valuation")),
        React.createElement("div", {className:"badge"}, "Hackathon 2025")
      ),
      React.createElement("div", {className:"steps"},
        ["01 — Startup Profile","02 — Comparables","03 — DCF Output"].map((l,i)=>
          React.createElement("div", {key:i, className:`step${step===i+1?" active":""}${step>i+1?" done":""}`}, l)
        )
      ),
      React.createElement("div", {className:"prog"}, React.createElement("div", {className:"prog-f", style:{width:`${pct}%`}})),
      React.createElement("div", {className:"card"},

        // STEP 1
        React.createElement("div", {className:`sec${step===1?" on":""}`},
          React.createElement("div", {className:"g2"},
            React.createElement("div", null,
              React.createElement("label", null, "Startup Name"),
              React.createElement("input", {placeholder:"e.g. NeuroFlow Medical", value:form.company, onChange:e=>upd("company",e.target.value)})
            ),
            React.createElement("div", null,
              React.createElement("label", null, "Sector"),
              React.createElement("select", {value:form.sector, onChange:e=>upd("sector",e.target.value)},
                React.createElement("option", {value:""}, "Auto-detect from description"),
                ...Object.entries(SECTOR_NAMES).map(([k,v])=>React.createElement("option", {key:k,value:k}, v))
              )
            ),
            React.createElement("div", null,
              React.createElement("label", null, "Revenue Model"),
              React.createElement("select", {value:form.revenueModel, onChange:e=>upd("revenueModel",e.target.value)},
                React.createElement("option", {value:""}, "Select model"),
                ...REVENUE_MODELS.map(v=>React.createElement("option", {key:v,value:v}, v))
              )
            ),
            React.createElement("div", null,
              React.createElement("label", null, "Stage"),
              React.createElement("select", {value:form.stage, onChange:e=>upd("stage",e.target.value)},
                React.createElement("option", {value:""}, "Select stage"),
                ...STAGES.map(v=>React.createElement("option", {key:v,value:v}, v))
              )
            ),
            React.createElement("div", {className:"full"},
              React.createElement("label", null, "Country / Jurisdiction"),
              React.createElement("select", {value:form.country, onChange:e=>upd("country",e.target.value)},
                React.createElement("option", {value:""}, "Select country"),
                ...COUNTRIES.map(c=>React.createElement("option", {key:c,value:c}, c))
              )
            ),
            React.createElement("div", {className:"full"},
              React.createElement("label", null, "Startup Description"),
              React.createElement("textarea", {placeholder:"Paste your executive summary…", value:form.description, onChange:e=>upd("description",e.target.value)})
            ),
            React.createElement("div", {className:"full"},
              React.createElement("label", null, "Financial Documents — PDF, Excel, CSV, images"),
              React.createElement("div", {
                className:`drop${drag?" drag":""}`,
                onClick:()=>fileRef.current.click(),
                onDragOver:e=>{e.preventDefault();setDrag(true)},
                onDragLeave:()=>setDrag(false),
                onDrop:e=>{e.preventDefault();setDrag(false);addFiles(e.dataTransfer.files)}
              },
                React.createElement("input", {ref:fileRef, type:"file", multiple:true, accept:".pdf,.xlsx,.xls,.csv,.docx,.doc,.png,.jpg,.jpeg,.webp", onChange:e=>addFiles(e.target.files)}),
                React.createElement("div", {style:{fontSize:24,marginBottom:6}}, "📎"),
                React.createElement("div", {style:{fontSize:13,fontWeight:600,color:"#1a2e4a"}}, "Drop files here or click to browse"),
                React.createElement("div", {style:{fontSize:11,color:"#aaa",marginTop:4}}, "Claude AI reads your documents and extracts all financial data automatically")
              ),
              files.length>0 && React.createElement("div", {className:"chips"},
                files.map((f,i)=>React.createElement("div", {key:i, className:"chip"},
                  f.name.endsWith(".pdf")?"📄":f.name.match(/\.xlsx?$/i)?"📊":f.name.match(/\.docx?$/i)?"📝":"📁", " ", f.name,
                  React.createElement("span", {className:"chip-x", onClick:()=>removeFile(i)}, "×")
                ))
              ),
              extracting && React.createElement("div", {className:"spinning"}, React.createElement("span", {className:"spin-d"}), " Reading documents with Claude AI…"),
              exNote && !extracting && exFieldsSorted.length>0 && React.createElement("div", {className:"exbox"},
                React.createElement("b", null, "✅ Extracted from your documents"),
                exFieldsSorted.slice(0,12).map(([k,v])=>{
                  const label = k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
                  const display = typeof v==="number"
                    ? (k.includes("margin")||k.includes("rate")||k.includes("growth")) ? `${(v>1?v:v*100).toFixed(1)}%` : v > 1e5 ? `${(v/1e6).toFixed(2)}M` : v > 1e3 ? `${(v/1e3).toFixed(0)}k` : v.toFixed(2)
                    : String(v);
                  return React.createElement("div", {key:k}, React.createElement("strong", null, label+":"), " "+display);
                }),
                exArrays.length>0 && React.createElement("div", {style:{marginTop:4,color:"#2d7a4f"}}, `+ ${exArrays.length} year-by-year arrays (revenue, FTEs, CapEx…)`)
              )
            )
          ),
          React.createElement("div", {className:"row"},
            React.createElement("span", {className:"hint"}, form.description.length+" char"+((!canGo&&" · fill all fields")||"")),
            React.createElement("button", {className:"btn btn-p", onClick:runMatch, disabled:!canGo||extracting},
              extracting ? [React.createElement("span", {key:"s",className:"spin"}), " Reading…"] : "Find Comparables →"
            )
          )
        ),

        // STEP 2
        React.createElement("div", {className:`sec${step===2?" on":""}`},
          React.createElement("div", {className:"tag"}, SECTOR_NAMES[sector]),
          React.createElement("div", {className:"rat"}, React.createElement("b", null, "Why these comparables?"), RATIONALE[sector]),
          comps.map(c=>
            React.createElement("div", {className:"cc", key:c.t},
              React.createElement("div", {className:"tkr"}, c.t.split(".")[0]),
              React.createElement("div", null,
                React.createElement("div", {style:{fontSize:13,fontWeight:600,color:"#1a2e4a"}}, c.n),
                React.createElement("div", {style:{fontSize:11,color:"#aaa",marginTop:2}}, c.c)
              ),
              React.createElement("div", {style:{display:"flex",gap:16,marginLeft:"auto"}},
                React.createElement("div", {style:{textAlign:"right"}},
                  React.createElement("div", {style:{fontSize:14,fontWeight:700,color:"#1a2e4a"}}, c.gm.toFixed(1)+"%"),
                  React.createElement("div", {style:{fontSize:10,color:"#aaa"}}, "Gross Margin")
                ),
                c.b && React.createElement("div", {style:{textAlign:"right"}},
                  React.createElement("div", {style:{fontSize:14,fontWeight:700,color:"#1a2e4a"}}, c.b.toFixed(3)),
                  React.createElement("div", {style:{fontSize:10,color:"#aaa"}}, "Beta")
                )
              )
            )
          ),
          React.createElement("div", {className:"bg"},
            [["Gross Margin",(bench.gm?.toFixed(1)||"—")+"%"],["EBITDA Margin",(bench.eb?.toFixed(1)||"—")+"%"],["Beta (unlev.)",bench.b?.toFixed(3)],["Rev. Growth",(bench.rg?.toFixed(1)||"—")+"%"],["Comparables",comps.length],["Sub-sector",SECTOR_NAMES[sector]?.split(" ")[0]]].map(([l,v],i)=>
              React.createElement("div", {key:i, className:"bc"},
                React.createElement("div", {className:"bv", style:i>=4?{fontSize:13}:{}}, v),
                React.createElement("div", {className:"bl"}, l)
              )
            )
          ),
          React.createElement("div", {className:"row"},
            React.createElement("button", {className:"btn btn-s", onClick:()=>setStep(1)}, "← Back to Profile"),
            React.createElement("button", {className:"btn btn-p", onClick:runGenerate, disabled:loading},
              loading ? React.createElement("span", {className:"spin"}) : "Generate Financial Valuation →"
            )
          )
        ),

        // STEP 3
        React.createElement("div", {className:`sec${step===3?" on":""}`},
          wacc && React.createElement(React.Fragment, null,
            React.createElement("div", {className:"wbox"},
              React.createElement("div", {style:{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:5,letterSpacing:".08em"}}, "COMPUTED WACC"),
              React.createElement("div", {className:"wval"}, `${(wacc.wacc*100).toFixed(2)}%`),
              React.createElement("div", {className:"wsub"}, `Ke=${(wacc.ke*100).toFixed(1)}% × (1−D/V) + Kd=${(wacc.kd*100).toFixed(1)}% × (1−t) × D/V`)
            ),
            React.createElement("table", {className:"wtbl"},
              React.createElement("thead", null,
                React.createElement("tr", null,
                  React.createElement("th", null, "Input"),
                  React.createElement("th", {style:{textAlign:"right"}}, "Value"),
                  React.createElement("th", null, "Source")
                )
              ),
              React.createElement("tbody", null,
                [
                  ["Risk-free rate (Rf)", `${(wacc.rf*100).toFixed(2)}%`, wacc.sources.rf],
                  ["Equity Risk Premium", `${(wacc.erp*100).toFixed(2)}%`, wacc.sources.erp],
                  ["Beta (unlevered)", wacc.betaU?.toFixed(3), wacc.sources.beta],
                  ["Stage Risk Premium", `+${(wacc.stagePremium*100).toFixed(2)}%`, wacc.sources.stage],
                  ["Cost of Equity (Ke)", `${(wacc.ke*100).toFixed(2)}%`, "Computed: Rf + β×ERP + Stage"],
                  ["Cost of Debt (Kd)", `${(wacc.kd*100).toFixed(1)}%`, wacc.sources.kd],
                  ["Tax rate", `${(wacc.tax*100).toFixed(1)}%`, wacc.sources.tax],
                  ["Terminal growth (g)", `${(wacc.g*100).toFixed(1)}%`, wacc.sources.g],
                  ["Gross Margin", `${(bench.gm||0).toFixed(1)}%`, extracted?.gross_margin!=null?"📄 From document":"📊 Sector median"],
                  ["EBITDA Margin", `${(bench.eb||0).toFixed(1)}%`, extracted?.ebitda_margin!=null?"📄 From document":"📊 Sector median"],
                  ...(extracted?.revenue_year1!=null?[["Revenue Year 1",`${(extracted.revenue_year1/1000).toFixed(0)}k ${extracted.currency||""}`.trim(),"📄 From document"]]:[]),
                  ...(extracted?.burn_rate_monthly!=null?[["Monthly Burn",`${(extracted.burn_rate_monthly/1000).toFixed(0)}k ${extracted.currency||""}`.trim(),"📄 From document"]]:[]),
                ].map(([l,v,s],i)=>
                  React.createElement("tr", {key:i, style:{background:i%2===0?"#fff":"#fafbfd"}},
                    React.createElement("td", {style:{fontWeight:500}}, l),
                    React.createElement("td", {style:{textAlign:"right",fontWeight:700,fontVariantNumeric:"tabular-nums"}}, v),
                    React.createElement("td", null, React.createElement("span", {className:s?.includes("document")||s?.includes("Computed")?"src-doc":"src-def"}, s))
                  )
                )
              )
            ),
            React.createElement("button", {className:"dlbtn", onClick:doDownload, disabled:dlLoading},
              React.createElement("span", {style:{fontSize:24,flexShrink:0}}, dlLoading?"⏳":"⬇"),
              React.createElement("span", null,
                React.createElement("div", null, dlLoading?"Generating model…":`Download Valuation_${form.company.replace(/\s/g,"_")}.xlsx`),
                React.createElement("div", {style:{fontSize:11,fontWeight:400,opacity:.65,marginTop:3}}, "Original template preserved · all formulas intact · your data pre-filled · + Comparables sheet")
              )
            ),
            React.createElement("div", {className:"infobox"},
              `Sub-sector: `, React.createElement("strong", null, SECTOR_NAMES[sector]), ` · ${comps.length} comparables (${comps.map(c=>c.t).join(", ")}) · Damodaran Jan 2025 · All Excel formulas preserved`
            )
          ),
          React.createElement("div", {className:"row", style:{marginTop:16}},
            React.createElement("button", {className:"btn btn-s", onClick:()=>setStep(1)}, "← New valuation")
          )
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
