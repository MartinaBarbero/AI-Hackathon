const { useState, useRef } = React;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SECTOR_NAMES = {1:"Neurovascular & Neurotech",2:"Orthopedics & Musculoskeletal",3:"Cardiovascular & Vascular",4:"Cardiovascular Devices",5:"In-Vitro Diagnostics",6:"Surgical Robotics & Endoscopy",7:"Hospital IT / SaMD",8:"Ophthalmology & Laser",9:"Regenerative Medicine",10:"Monitoring & Implantables"};
const SECTOR_KW = {1:["neuro","brain","neural","seizure","epilep","stroke","cranial"],2:["ortho","bone","spine","musculo","joint","fracture"],3:["cardio","cardiac","heart","wound","vascular","artery"],4:["atrial","perfusion","vein","bypass","angio"],5:["diagnos","ivd","assay","biomarker","reagent","lab "],6:["robot","endoscop","laparoscop","oncol","radiation"],7:["software","samd","digital","imaging","mri","pacs"],8:["ophthalm","eye","retina","ocular","vision","glaucom","laser"],9:["regenerat","tissue","cell ther","biologic","scaffold"],10:["monitor","wearable","sensor","cgm","glucose","implantable","pacemaker"]};
const WACC_P = {"Switzerland":{rf:0.0075,erp:0.0554,tax:0.149,g:0.015},"United States":{rf:0.0425,erp:0.046,tax:0.21,g:0.0225},"Germany":{rf:0.025,erp:0.0554,tax:0.295,g:0.015},"France":{rf:0.03,erp:0.0554,tax:0.25,g:0.015},"Belgium":{rf:0.03,erp:0.0649,tax:0.25,g:0.015},"Sweden":{rf:0.0215,erp:0.0554,tax:0.206,g:0.015},"United Kingdom":{rf:0.04,erp:0.0554,tax:0.25,g:0.02},"Netherlands":{rf:0.028,erp:0.0554,tax:0.258,g:0.015},"Spain":{rf:0.031,erp:0.0649,tax:0.25,g:0.015},"Italy":{rf:0.037,erp:0.0649,tax:0.275,g:0.01},"Denmark":{rf:0.022,erp:0.0554,tax:0.22,g:0.015},"Finland":{rf:0.021,erp:0.0554,tax:0.20,g:0.015},"Norway":{rf:0.032,erp:0.0554,tax:0.22,g:0.015},"Austria":{rf:0.027,erp:0.0554,tax:0.25,g:0.015},"Poland":{rf:0.053,erp:0.0649,tax:0.19,g:0.02},"Israel":{rf:0.04,erp:0.0649,tax:0.23,g:0.02},"Canada":{rf:0.033,erp:0.046,tax:0.265,g:0.02},"Australia":{rf:0.042,erp:0.046,tax:0.30,g:0.025},"Japan":{rf:0.009,erp:0.046,tax:0.3086,g:0.01},"China":{rf:0.023,erp:0.064,tax:0.25,g:0.04},"India":{rf:0.069,erp:0.064,tax:0.30,g:0.05},"Singapore":{rf:0.029,erp:0.046,tax:0.17,g:0.025},"South Korea":{rf:0.031,erp:0.046,tax:0.275,g:0.025},"Brazil":{rf:0.135,erp:0.078,tax:0.34,g:0.04},"Default":{rf:0.025,erp:0.055,tax:0.21,g:0.015}};
const DB = [{"t":"PEN","n":"Penumbra Inc.","s":1,"gm":67.4,"eb":14.7,"b":0.735,"rg":15.6,"c":"USA"},{"t":"NYXH","n":"Nyxoah SA","s":1,"gm":63.1,"eb":0.0,"b":0.876,"rg":34.7,"c":"Belgium"},{"t":"CLPT","n":"ClearPoint Neuro","s":1,"gm":61.4,"eb":-58.1,"b":1.294,"rg":34.0,"c":"USA"},{"t":"NSPR","n":"InspireMD Inc.","s":1,"gm":29.5,"eb":0.0,"b":0.819,"rg":61.6,"c":"USA"},{"t":"BONEX","n":"BONESUPPORT AB","s":2,"gm":92.5,"eb":26.5,"b":0.482,"rg":14.3,"c":"Sweden"},{"t":"SIBN","n":"SI-BONE Inc.","s":2,"gm":79.6,"eb":-8.2,"b":0.671,"rg":15.0,"c":"USA"},{"t":"ATEC","n":"Alphatec Holdings","s":2,"gm":70.2,"eb":3.6,"b":0.966,"rg":13.6,"c":"USA"},{"t":"ATRC","n":"AtriCure Inc.","s":4,"gm":75.6,"eb":3.2,"b":1.281,"rg":14.3,"c":"USA"},{"t":"LMAT","n":"LeMaitre Vascular","s":4,"gm":71.3,"eb":30.7,"b":0.597,"rg":11.2,"c":"USA"},{"t":"VCYT","n":"Veracyte Inc.","s":5,"gm":72.9,"eb":19.2,"b":1.885,"rg":21.5,"c":"USA"},{"t":"EKF","n":"EKF Diagnostics","s":5,"gm":51.4,"eb":19.7,"b":0.526,"rg":5.4,"c":"UK"},{"t":"PRCT","n":"PROCEPT BioRobotics","s":6,"gm":64.0,"eb":-31.8,"b":0.826,"rg":20.2,"c":"USA"},{"t":"SECT","n":"Sectra AB","s":7,"gm":38.9,"eb":20.7,"b":0.85,"rg":5.6,"c":"Sweden"},{"t":"BFLY","n":"Butterfly Network","s":7,"gm":66.1,"eb":-49.0,"b":2.28,"rg":25.0,"c":"USA"},{"t":"STAA","n":"STAAR Surgical","s":8,"gm":76.2,"eb":-15.6,"b":1.202,"rg":18.1,"c":"USA"},{"t":"GKOS","n":"Glaukos Corp.","s":8,"gm":78.1,"eb":-8.0,"b":0.948,"rg":41.2,"c":"USA"},{"t":"VCEL","n":"Vericel Corp.","s":9,"gm":74.8,"eb":9.4,"b":1.1,"rg":30.1,"c":"USA"},{"t":"INSP","n":"Inspire Medical Systems","s":10,"gm":85.8,"eb":7.4,"b":0.831,"rg":1.6,"c":"USA"},{"t":"LIVN","n":"LivaNova PLC","s":10,"gm":67.9,"eb":18.3,"b":0.819,"rg":14.3,"c":"UK"},{"t":"IRTC","n":"iRhythm Technologies","s":10,"gm":71.0,"eb":-1.4,"b":1.333,"rg":25.7,"c":"USA"}];
const REVENUE_MODELS = ["Revenue Blade","Capital Sale","SaaS","Per Test","OEM","Royalty Licensing","Hybrid","Other (explain in description)"];
const STAGES = ["Seed","Series A","Series B","Series C+","Pre-revenue R&D","Commercial","Other (explain in description)"];
const COUNTRIES = ["Switzerland","United States","Germany","France","Belgium","Sweden","United Kingdom","Netherlands","Spain","Italy","Denmark","Finland","Norway","Austria","Poland","Israel","Canada","Australia","Japan","China","India","Singapore","South Korea","Brazil","Default"];
const RATIONALE = {1:"Matched from Neurovascular & Neurotech — same regulatory pathway (FDA PMA/CE MDR Class III), implantable devices, similar gross margin and beta.",2:"Matched from Orthopedics & Musculoskeletal — surgical implants and bone repair, hospital reimbursement dynamics.",3:"Matched from Cardiovascular & Vascular — analogous distribution channels, clinical trial costs, gross margin.",4:"Matched from Cardiovascular Devices — interventional cardiology tools, procedural reimbursement model.",5:"Matched from In-Vitro Diagnostics — asset-light, high-margin consumables; benchmark for royalty/licensing.",6:"Matched from Surgical Robotics & Endoscopy — capital equipment + high-margin disposables.",7:"Matched from Hospital IT / SaMD — high gross margins (70–90%), recurring SaaS revenue, low CapEx.",8:"Matched from Ophthalmology & Laser — strong gross margins, predictable replacement cycles.",9:"Matched from Regenerative Medicine — milestone revenue, high R&D intensity, long timelines.",10:"Matched from Monitoring & Implantables — subscription/consumable revenue, FDA/CE Class II–III."};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const detectSector = (txt, manual) => {
  if(manual) return parseInt(manual);
  const t=txt.toLowerCase(); let best={s:10,sc:0};
  Object.entries(SECTOR_KW).forEach(([s,kws])=>{const sc=kws.filter(k=>t.includes(k)).length;if(sc>best.sc)best={s:parseInt(s),sc};});
  return best.s;
};
const med = arr => { const v=arr.filter(x=>x!=null&&isFinite(x)).sort((a,b)=>a-b); if(!v.length)return null; const m=Math.floor(v.length/2); return v.length%2?v[m]:(v[m-1]+v[m])/2; };
const getComps = s => { let c=DB.filter(x=>x.s===s&&x.gm!=null); if(c.length<3)c=DB.filter(x=>x.gm!=null).slice(0,5); return c.slice(0,5); };

// Stage-based risk premium derived from document data
const inferStagePremium = (ex, stage) => {
  let premium = 0;
  const stagePremiums = {
    "Pre-revenue R&D": 0.075, "Seed": 0.065, "Series A": 0.045,
    "Series B": 0.030, "Series C+": 0.015, "Commercial": 0.010,
    "Other (explain in description)": 0.05
  };
  premium = stagePremiums[stage] ?? 0.05;

  if (ex?.runway_months != null) {
    if (ex.runway_months < 12)  premium += 0.025;
    else if (ex.runway_months < 18) premium += 0.010;
    else if (ex.runway_months > 36) premium -= 0.010;
  }

  if (ex?.gross_margin != null) {
    const gm = ex.gross_margin > 1 ? ex.gross_margin / 100 : ex.gross_margin;
    if (gm > 0.75)      premium -= 0.015;
    else if (gm > 0.50) premium -= 0.005;
    else if (gm < 0.30) premium += 0.015;
  }

  if (ex?.revenue_year1 != null && ex.revenue_year1 > 0) premium -= 0.010;
  if (ex?.deal1_upfront_fee != null) premium -= 0.008;
  if (ex?.funding_raised_total != null && ex.funding_raised_total > 5000000) premium -= 0.005;

  if (ex?.clinical_trial_cost != null && ex.clinical_trial_cost > 1000000) premium += 0.010;
  if (ex?.milestone_fda_year != null) {
    const yearsToFDA = ex.milestone_fda_year - 2025;
    if (yearsToFDA > 5) premium += 0.015;
    else if (yearsToFDA > 3) premium += 0.007;
  }

  return Math.max(0, Math.min(0.12, premium));
};

const inferTerminalGrowth = (ex, base) => {
  if (ex?.terminal_growth != null) return ex.terminal_growth;
  let g = base.g;
  if (ex?.market_growth_rate != null) {
    const mgr = ex.market_growth_rate > 1 ? ex.market_growth_rate / 100 : ex.market_growth_rate;
    g = Math.min(mgr * 0.4, 0.05);
  }
  if (ex?.revenue_growth_rate != null) {
    const rgr = ex.revenue_growth_rate > 1 ? ex.revenue_growth_rate / 100 : ex.revenue_growth_rate;
    g = Math.max(g, Math.min(rgr * 0.15, 0.04));
  }
  return g;
};

const buildWACC = (country, ex, benchB, stage) => {
  const base = WACC_P[country] || WACC_P.Default;
  const rf   = ex?.wacc_rf         ?? base.rf;
  const erp  = ex?.wacc_erp        ?? base.erp;
  const tax  = ex?.tax_rate        ?? base.tax;
  const g    = inferTerminalGrowth(ex, base);
  const kd   = ex?.cost_of_debt    ?? 0.06;
  const de   = ex?.debt_equity_ratio ?? 0.20;
  const betaU= ex?.beta_unlevered  ?? benchB ?? 1.2;
  const betaL= betaU*(1+(1-tax)*de/(1-de));

  const stagePremium = inferStagePremium(ex, stage);
  const ke   = rf + betaL*erp + stagePremium;
  const wacc = (1-de)*ke + de*kd*(1-tax);

  const src  = k => ex?.[k]!=null ? "📄 From document" : "📊 Damodaran / sector";
  const stageSrc = stagePremium !== ({"Pre-revenue R&D":0.075,"Seed":0.065,"Series A":0.045,"Series B":0.030,"Series C+":0.015,"Commercial":0.010}[stage]??0.05)
    ? "📄 Adjusted from document" : "🎯 Stage baseline";

  return {rf, erp, tax, g, kd, de, betaU, betaL, ke, wacc, stagePremium,
    sources:{
      rf:   src("wacc_rf"),
      erp:  src("wacc_erp"),
      tax:  src("tax_rate"),
      g:    ex?.terminal_growth!=null ? "📄 From document" : ex?.market_growth_rate!=null ? "📄 Derived from market growth" : "📊 Country default",
      kd:   src("cost_of_debt"),
      beta: src("beta_unlevered"),
      stage: stageSrc,
    }};
};

// ─── CLAUDE API EXTRACTION ───────────────────────────────────────────────────
const extractWithClaude = async (files, description) => {
  const contentBlocks = [];

  for(const file of files){
    const b64 = await new Promise((res,rej)=>{
      const r=new FileReader();
      r.onload=()=>res(r.result.split(",")[1]);
      r.onerror=rej;
      r.readAsDataURL(file);
    });

    const mime = file.type || "application/octet-stream";

    if(mime==="application/pdf"){
      contentBlocks.push({type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}});
    } else if(mime.startsWith("image/")){
      contentBlocks.push({type:"image",source:{type:"base64",media_type:mime,data:b64}});
    } else {
      const text = await new Promise((res,rej)=>{
        const r2=new FileReader();
        r2.onload=()=>res(r2.result);
        r2.onerror=rej;
        if(file.name.match(/\.xlsx?$/i)){
          const fr=new FileReader();
          fr.onload=e=>{
            try{
              const wb=XLSX.read(e.target.result,{type:"array"});
              let out="";
              wb.SheetNames.forEach(sh=>{
                out+=`\n--- Sheet: ${sh} ---\n`;
                out+=XLSX.utils.sheet_to_csv(wb.Sheets[sh]);
              });
              res(out);
            }catch{res("Could not parse Excel file.");}
          };
          fr.readAsArrayBuffer(file);
        } else {
          r2.readAsText(file);
        }
      });
      contentBlocks.push({type:"text",text:`File: ${file.name}\n${String(text).slice(0,12000)}`});
    }
  }

  contentBlocks.push({type:"text",text:`
You are a senior financial analyst. Extract ALL financial data from the documents above.
Company context: ${description}

Return ONLY valid JSON — no markdown fences, no explanation.
Use null for any value not found. Monetary values as numbers (no currency symbols).
Year arrays = 11 values for 2025–2035.

{
  "currency": "CHF",
  "company_stage": null,
  "revenue_year1": null,
  "revenue_year2": null,
  "revenue_year3": null,
  "revenue_year5": null,
  "gross_margin": null,
  "ebitda_margin": null,
  "burn_rate_monthly": null,
  "runway_months": null,
  "ftes": [null,null,null,null,null,null,null,null,null,null,null],
  "avg_fte_cost": null,
  "capex": [null,null,null,null,null,null,null,null,null,null,null],
  "notes": "List every specific number found and its source section."
}`});

  const resp = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:2000,
      messages:[{role:"user",content:contentBlocks}]
    })
  });
  const data = await resp.json();
  const raw = (data.content?.[0]?.text||"").replace(/```[a-z]*\n?/g,"").replace(/```/g,"").trim();
  try{ return JSON.parse(raw); }catch{ return {}; }
};

// ─── EXCEL BUILDER ──────────────────────────────────────────────────────────
const buildExcel = (form, ex, comps, bench, w, sectorNum) => {
  const bin = atob(TEMPLATE_B64);
  const arr = new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) arr[i]=bin.charCodeAt(i);
  const wb = XLSX.read(arr, {type:"array", cellStyles:true, cellNF:true});
  const today = new Date().toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  const sName = SECTOR_NAMES[sectorNum];

  const inj = (ws, ref, val) => {
    if(!ws[ref]) ws[ref]={t:typeof val==="number"?"n":"s"};
    if(ws[ref].f) return;
    ws[ref].v = val;
    ws[ref].t = typeof val==="number"?"n":"s";
  };

  const injRow = (ws, row, val) => {
    "CDEFGHIJKLM".split("").forEach(c=>{
      const ref=c+row;
      if(!ws[ref]||!ws[ref].f) inj(ws,ref,val);
    });
  };

  const injArr = (ws, row, arr11) => {
    if(!arr11) return;
    "CDEFGHIJKLM".split("").forEach((c,i)=>{
      if(arr11[i]!=null){ const ref=c+row; if(!ws[ref]||!ws[ref].f) inj(ws,ref,arr11[i]); }
    });
  };

  const cvr = wb.Sheets["Cover"];
  inj(cvr,"B1",`${form.company} — INVESTOR DCF MODEL`);
  inj(cvr,"C2",form.company);
  inj(cvr,"C3",form.description.slice(0,150));
  inj(cvr,"C4",form.revenueModel);
  inj(cvr,"C5",`v1.0 — Generated ${today}`);

  const ass = wb.Sheets["Assumptions"];
  injRow(ass, 4,  w.rf);
  injRow(ass, 5,  w.erp);
  injRow(ass, 6,  w.betaU);
  injRow(ass, 49, w.g);

  const safe = form.company.replace(/[^\w]/g,"_");
  XLSX.writeFile(wb,`Valuation_${safe}.xlsx`);
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;background:#f0f2f7;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px}
  .app{width:100%;max-width:840px}
  /* ... resto degli stili ... */
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
function App() {
  const [step,      setStep]      = useState(1);
  const [form,      setForm]      = useState({company:"",description:"",revenueModel:"",stage:"",country:"",sector:""});
  const [files,     setFiles]     = useState([]);
  const [extracting,setExtracting]= useState(false);
  const [extracted, setExtracted] = useState(null);
  const [exNote,    setExNote]    = useState("");
  const [comps,     setComps]     = useState([]);
  const [bench,     setBench]     = useState({});
  const [sector,    setSector]    = useState(1);
  const [wacc,      setWacc]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [dlLoading, setDlLoading] = useState(false);
  const [drag,      setDrag]      = useState(false);
  const fileRef = useRef();

  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const canGo = form.company && form.revenueModel && form.stage && form.country && form.description.length>=10;

  const addFiles = async newF => {
    const arr = Array.from(newF);
    if(!arr.length) return;
    setFiles(p=>[...p,...arr]);
    setExtracting(true);
    const ctx = `Company: ${form.company}. Context: ${form.description}`;
    try {
      const ex = await extractWithClaude(arr, ctx);
      setExtracted(ex);
      setExNote(ex.notes || "Extraction complete.");
    } catch(e) {
      setExNote("Extraction failed.");
    }
    setExtracting(false);
  };

  const removeFile = i => setFiles(p=>p.filter((_,j)=>j!==i));

  const runMatch = () => {
    const s = detectSector(form.description, form.sector);
    setSector(s);
    const matched = getComps(s);
    setComps(matched);
    setBench({
      gm: ex?.gross_margin ?? med(matched.map(c => c.gm)),
      eb: ex?.ebitda_margin ?? med(matched.map(c => c.eb).filter(v => v != null)),
      b:  ex?.beta_unlevered ?? med(matched.map(c => c.b).filter(v => v != null)),
      rg: med(matched.map(c => c.rg).filter(v => v != null)),
    });
    setStep(2);
  };

  const runGenerate = () => {
    setLoading(true);
    setTimeout(()=>{
      setWacc(buildWACC(form.country, extracted, bench.b, form.stage));
      setLoading(false);
      setStep(3);
    },1000);
  };

  const doDownload = () => {
    setDlLoading(true);
    setTimeout(()=>{
      buildExcel({...form, sector}, extracted||{}, comps, bench, wacc, sector);
      setDlLoading(false);
    }, 300);
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    React.createElement(React.Fragment, null,
      React.createElement("style", null, css),
      React.createElement("div", { className: "app" },
        React.createElement("div", { className: "topbar" },
          React.createElement("div", { className: "logo" }, "Financial ", React.createElement("span", null, "Valuation"))
        ),
        React.createElement("div", { className: "card" },
          step === 1 && React.createElement("div", null,
            React.createElement("input", { placeholder: "Company Name", value: form.company, onChange: e => upd("company", e.target.value) }),
            React.createElement("textarea", { placeholder: "Description", value: form.description, onChange: e => upd("description", e.target.value) }),
            React.createElement("button", { onClick: runMatch, disabled: !canGo }, "Find Comparables")
          ),
          step === 2 && React.createElement("div", null,
            React.createElement("h2", null, "Step 2: Comparables"),
            React.createElement("button", { onClick: runGenerate }, "Generate DCF")
          ),
          step === 3 && React.createElement("div", null,
            React.createElement("h2", null, "Step 3: Result"),
            React.createElement("button", { onClick: doDownload }, "Download Excel")
          )
        )
      )
    )
  );
}

// Incolla qui sotto la stringa TEMPLATE_B64 originale del tuo file
const TEMPLATE_B64 = "UEsDBB...";
