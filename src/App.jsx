import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Award, BarChart3, Bell, CalendarDays, CheckCircle2,
  ChevronRight, CircleHelp, Clock3, Database, Gift, Globe2, House,
  Leaf, LogIn, LogOut, MapPin, Menu, PackageCheck, Recycle, Search,
  ShieldCheck, Smartphone, Truck, User, Users, X, Zap
} from "lucide-react";

const demoUser = {
  name: "Ashutosh Tyagi",
  email: "ashutosh@ecocycle.demo",
  phone: "+91 98765 43210",
  address: "Siddharth Vihar, Ghaziabad, Uttar Pradesh"
};

const defaultRequests = [
  {id:"EC-10025", item:"Old Laptop", category:"Laptop", weight:2.5, date:"30 Sep 2026", time:"10:00 AM - 12:00 PM", recycler:"GreenCycle Recycling", status:"Recycling", points:100},
  {id:"EC-10018", item:"Mobile Phones", category:"Mobile", weight:0.6, date:"22 Sep 2026", time:"02:00 PM - 04:00 PM", recycler:"GreenCycle Recycling", status:"Completed", points:50}
];

const defaultData = {
  user: demoUser,
  points: 250,
  requests: defaultRequests,
  stats: {users:1250, kg:2845, pickups:865, recyclers:18}
};

function loadData(){
  try {
    const saved = localStorage.getItem("ecocycle-demo");
    return saved ? JSON.parse(saved) : defaultData;
  } catch { return defaultData; }
}

function App(){
  const [data,setData] = useState(loadData);
  const [page,setPage] = useState("home");
  const [logged,setLogged] = useState(false);
  const [role,setRole] = useState("user");
  const [mobileOpen,setMobileOpen] = useState(false);
  const [toast,setToast] = useState("");

  useEffect(()=>localStorage.setItem("ecocycle-demo", JSON.stringify(data)),[data]);

  function notify(msg){
    setToast(msg);
    setTimeout(()=>setToast(""),2600);
  }

  function login(selectedRole="user"){
    setRole(selectedRole);
    setLogged(true);
    setPage(selectedRole==="admin" ? "admin" : selectedRole==="recycler" ? "recycler" : "dashboard");
    notify(`Logged in as ${selectedRole}`);
  }

  function logout(){
    setLogged(false); setPage("home"); notify("Logged out");
  }

  function addRequest(form){
    const id = "EC-" + (10000 + Math.floor(Math.random()*89999));
    const req = {...form, id, status:"Request Created", points:pointsFor(form.category, Number(form.weight))};
    setData(d=>({...d, requests:[req,...d.requests]}));
    setPage("tracking");
    notify("Pickup request created successfully");
  }

  function advanceRequest(id){
    const order=["Request Created","Recycler Assigned","Pickup Scheduled","Collected","Recycling","Completed"];
    setData(d=>{
      const requests=d.requests.map(r=>{
        if(r.id!==id) return r;
        const i=order.indexOf(r.status);
        const next=order[Math.min(i+1,order.length-1)];
        return {...r,status:next};
      });
      return {...d,requests};
    });
    notify("Pickup status updated");
  }

  function completeRequest(id){
    setData(d=>{
      let gained=0;
      const requests=d.requests.map(r=>{
        if(r.id===id && r.status!=="Completed"){ gained=r.points; return {...r,status:"Completed"}; }
        return r;
      });
      return {...d,requests,points:d.points+gained};
    });
    notify("Recycling completed and EcoPoints credited");
  }

  return <div className="app">
    <Header logged={logged} page={page} setPage={setPage} role={role} logout={logout}
      mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} login={login}/>
    {page==="home" && <Home onStart={()=>logged?setPage("recycle"):login("user")} onLogin={()=>login("user")}/>}
    {page==="login" && <Login onLogin={login}/>}
    {page==="dashboard" && <Dashboard data={data} setPage={setPage} />}
    {page==="recycle" && <RecycleForm onSubmit={addRequest} onCancel={()=>setPage("dashboard")}/>}
    {page==="tracking" && <Tracking data={data} advanceRequest={advanceRequest} completeRequest={completeRequest} />}
    {page==="rewards" && <Rewards data={data}/>}
    {page==="impact" && <Impact data={data}/>}
    {page==="recycler" && <Recycler data={data} advanceRequest={advanceRequest} completeRequest={completeRequest}/>}
    {page==="admin" && <Admin data={data}/>}
    {page==="about" && <About setPage={setPage}/>}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    <Footer/>
  </div>
}

function Header({logged,page,setPage,role,logout,mobileOpen,setMobileOpen,login}){
  return <header className="header">
    <div className="container nav">
      <button className="brand" onClick={()=>setPage("home")}><span className="brandIcon"><Recycle size={23}/></span><span>Eco<span>Cycle</span></span></button>
      <button className="mobileBtn" onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X/>:<Menu/>}</button>
      <nav className={mobileOpen?"navLinks open":"navLinks"}>
        <button className={page==="home"?"active":""} onClick={()=>{setPage("home");setMobileOpen(false)}}>Home</button>
        {logged && role==="user" && <>
          <button onClick={()=>{setPage("dashboard");setMobileOpen(false)}}>Dashboard</button>
          <button onClick={()=>{setPage("recycle");setMobileOpen(false)}}>Recycle</button>
          <button onClick={()=>{setPage("tracking");setMobileOpen(false)}}>Track Pickup</button>
          <button onClick={()=>{setPage("rewards");setMobileOpen(false)}}>Rewards</button>
        </>}
        {logged && role==="recycler" && <button onClick={()=>setPage("recycler")}>Recycler</button>}
        {logged && role==="admin" && <button onClick={()=>setPage("admin")}>Admin</button>}
        <button onClick={()=>setPage("about")}>How It Works</button>
        {!logged ? <button className="navCta" onClick={()=>login("user")}><LogIn size={16}/> Login</button> :
          <button className="navCta secondary" onClick={logout}><LogOut size={16}/> Logout</button>}
      </nav>
    </div>
  </header>
}

function Home({onStart,onLogin}){
  return <main>
    <section className="hero">
      <div className="container heroGrid">
        <div>
          <div className="pill"><Leaf size={15}/> Responsible recycling made simple</div>
          <h1>Turn your <span>e-waste</span> into a greener future.</h1>
          <p className="heroText">EcoCycle connects citizens with authorized recycling partners for doorstep collection, transparent tracking and meaningful rewards.</p>
          <div className="heroBtns">
            <button className="btn primary" onClick={onStart}>Recycle E-Waste <ArrowRight size={18}/></button>
            <button className="btn ghost" onClick={onLogin}>Explore Dashboard</button>
          </div>
          <div className="miniStats">
            <div><b>2,845+</b><span>kg recycled</span></div>
            <div><b>1,250+</b><span>users</span></div>
            <div><b>18</b><span>partners</span></div>
          </div>
        </div>
        <div className="heroCard">
          <div className="orb"><Recycle size={58}/></div>
          <h3>Recycle smarter</h3>
          <p>Schedule a pickup in less than 2 minutes.</p>
          <div className="heroSteps">
            <Step n="1" text="Submit e-waste"/>
            <Step n="2" text="Recycler assigned"/>
            <Step n="3" text="Pickup & recycle"/>
          </div>
          <div className="impactBadge"><Zap size={17}/><span><b>+250 EcoPoints</b><small>available in demo wallet</small></span></div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <SectionTitle eyebrow="WHY ECOCYCLE" title="Everything you need to recycle responsibly" text="One platform for collection, tracking, rewards and environmental impact."/>
        <div className="featureGrid">
          <Feature icon={<Truck/>} title="Doorstep Pickup" text="Schedule convenient collection from your home, hostel or office."/>
          <Feature icon={<MapPin/>} title="Authorized Partners" text="Connect users with registered recycling partners in the prototype network."/>
          <Feature icon={<Gift/>} title="EcoPoints" text="Reward-based engagement encourages repeated responsible recycling."/>
          <Feature icon={<BarChart3/>} title="Impact Tracking" text="See recycling history and estimated environmental impact."/>
        </div>
      </div>
    </section>

    <section className="section light">
      <div className="container twoCol">
        <div>
          <div className="pill">SDG 12</div>
          <h2>Technology supporting responsible consumption</h2>
          <p>EcoCycle is designed around SDG 12: Responsible Consumption and Production. The platform makes responsible e-waste disposal easier while creating a digital record of collection and recycling.</p>
          <button className="textBtn" onClick={()=>document.getElementById("how")?.scrollIntoView({behavior:"smooth"})}>See the workflow <ChevronRight size={18}/></button>
        </div>
        <div className="sdgCard"><div className="sdgNum">12</div><div><b>Responsible Consumption and Production</b><p>Reduce waste through prevention, reduction, recycling and reuse.</p></div></div>
      </div>
    </section>

    <section className="section" id="how">
      <div className="container">
        <SectionTitle eyebrow="WORKFLOW" title="From old device to responsible recycling" text="A simple six-step journey."/>
        <div className="workflow">
          {["Submit item","Book pickup","Recycler assigned","Doorstep collection","Recycling","EcoPoints"].map((x,i)=><div className="workflowItem" key={x}><span>{i+1}</span><b>{x}</b>{i<5&&<ArrowRight className="wfArrow"/>}</div>)}
        </div>
      </div>
    </section>
  </main>
}

function Step({n,text}){return <div className="step"><span>{n}</span>{text}</div>}
function Feature({icon,title,text}){return <div className="feature card"><div className="featureIcon">{icon}</div><h3>{title}</h3><p>{text}</p></div>}
function SectionTitle({eyebrow,title,text}){return <div className="sectionTitle"><div className="pill">{eyebrow}</div><h2>{title}</h2>{text&&<p>{text}</p>}</div>}

function Login({onLogin}){
  return <main className="authPage"><div className="authCard">
    <div className="brand big"><span className="brandIcon"><Recycle/></span><span>Eco<span>Cycle</span></span></div>
    <h2>Demo Login</h2><p>Choose a role to explore the prototype.</p>
    <button className="btn primary full" onClick={()=>onLogin("user")}><User/> Continue as User</button>
    <button className="btn dark full" onClick={()=>onLogin("recycler")}><Truck/> Continue as Recycler</button>
    <button className="btn ghost full" onClick={()=>onLogin("admin")}><ShieldCheck/> Continue as Admin</button>
    <small>Prototype mode: authentication is simulated locally.</small>
  </div></main>
}

function Dashboard({data,setPage}){
  const completed=data.requests.filter(r=>r.status==="Completed").length;
  return <main className="dashboard">
    <div className="container">
      <div className="pageHead"><div><div className="pill">USER DASHBOARD</div><h1>Welcome back, {data.user.name.split(" ")[0]} 👋</h1><p>Manage your recycling journey from one place.</p></div><button className="btn primary" onClick={()=>setPage("recycle")}><Recycle/> Recycle Now</button></div>
      <div className="statsGrid">
        <Stat icon={<Recycle/>} value={totalWeight(data)} label="E-Waste Recycled" suffix=" kg"/>
        <Stat icon={<Award/>} value={data.points} label="EcoPoints"/>
        <Stat icon={<Leaf/>} value={estimatedCO2(data)} label="Estimated CO₂ Impact" suffix=" kg"/>
        <Stat icon={<PackageCheck/>} value={completed} label="Completed Pickups"/>
      </div>
      <div className="dashboardGrid">
        <div className="card">
          <div className="cardHead"><h3>Recent Pickup Requests</h3><button className="linkBtn" onClick={()=>setPage("tracking")}>View all</button></div>
          <RequestTable requests={data.requests.slice(0,4)}/>
        </div>
        <div className="card quick">
          <h3>Quick Actions</h3>
          <Quick icon={<Recycle/>} title="Recycle E-Waste" text="Create a new pickup request" onClick={()=>setPage("recycle")}/>
          <Quick icon={<Truck/>} title="Track Pickup" text="Check current collection status" onClick={()=>setPage("tracking")}/>
          <Quick icon={<Gift/>} title="My Rewards" text={`${data.points} EcoPoints available`} onClick={()=>setPage("rewards")}/>
          <Quick icon={<Leaf/>} title="My Impact" text="See your environmental contribution" onClick={()=>setPage("impact")}/>
        </div>
      </div>
    </div>
  </main>
}

function Stat({icon,value,label,suffix=""}){return <div className="stat card"><div className="statIcon">{icon}</div><div><b>{value}{suffix}</b><span>{label}</span></div></div>}
function Quick({icon,title,text,onClick}){return <button className="quickItem" onClick={onClick}><span>{icon}</span><span><b>{title}</b><small>{text}</small></span><ChevronRight/></button>}

function RecycleForm({onSubmit,onCancel}){
  const [form,setForm]=useState({item:"",category:"Laptop",weight:"",condition:"Non-working",date:"",time:"10:00 AM - 12:00 PM",address:demoUser.address});
  const [file,setFile]=useState("");
  function submit(e){
    e.preventDefault();
    if(!form.item || !form.weight || !form.date){alert("Please fill Item Name, Weight and Pickup Date.");return}
    onSubmit({...form,weight:Number(form.weight),image:file});
  }
  return <main className="formPage"><div className="container narrow">
    <div className="pageHead"><div><div className="pill">NEW REQUEST</div><h1>Recycle your e-waste</h1><p>Tell us what you want to recycle and where to collect it.</p></div></div>
    <form className="card formCard" onSubmit={submit}>
      <h3>1. E-Waste Details</h3>
      <div className="formGrid">
        <Field label="Item Name" value={form.item} placeholder="e.g. Old Dell Laptop" onChange={v=>setForm({...form,item:v})}/>
        <Select label="Category" value={form.category} options={["Laptop","Mobile","Battery","Charger","Television","Printer","Other"]} onChange={v=>setForm({...form,category:v})}/>
        <Field label="Approx. Weight (kg)" type="number" min="0.1" step="0.1" value={form.weight} placeholder="e.g. 2.5" onChange={v=>setForm({...form,weight:v})}/>
        <Select label="Condition" value={form.condition} options={["Working","Partially Working","Non-working"]} onChange={v=>setForm({...form,condition:v})}/>
      </div>
      <label className="field"><span>Upload Image (optional)</span><input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]?.name||"")}/></label>
      <hr/>
      <h3>2. Pickup Details</h3>
      <label className="field"><span>Pickup Address</span><textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
      <div className="formGrid">
        <Field label="Preferred Date" type="date" value={form.date} onChange={v=>setForm({...form,date:v})}/>
        <Select label="Preferred Time" value={form.time} options={["10:00 AM - 12:00 PM","12:00 PM - 02:00 PM","02:00 PM - 04:00 PM","04:00 PM - 06:00 PM"]} onChange={v=>setForm({...form,time:v})}/>
      </div>
      <div className="infoBox"><ShieldCheck size={19}/><span>Your request will be assigned to a registered recycling partner in the prototype network.</span></div>
      <div className="formActions"><button type="button" className="btn ghost" onClick={onCancel}>Cancel</button><button className="btn primary" type="submit">Schedule Pickup <ArrowRight/></button></div>
    </form>
  </div></main>
}

function Field({label,value,onChange,type="text",placeholder="",min,step}){return <label className="field"><span>{label}</span><input type={type} min={min} step={step} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/></label>}
function Select({label,value,options,onChange}){return <label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o}>{o}</option>)}</select></label>}

function Tracking({data,advanceRequest,completeRequest}){
  return <main className="dashboard"><div className="container">
    <div className="pageHead"><div><div className="pill">PICKUP TRACKING</div><h1>Track your requests</h1><p>Follow every request from submission to recycling.</p></div></div>
    <div className="requestCards">{data.requests.map(r=><TrackingCard key={r.id} r={r} advanceRequest={advanceRequest} completeRequest={completeRequest}/>)}</div>
  </div></main>
}

function TrackingCard({r,advanceRequest,completeRequest}){
  const steps=["Request Created","Recycler Assigned","Pickup Scheduled","Collected","Recycling","Completed"];
  const idx=steps.indexOf(r.status);
  return <div className="card trackingCard">
    <div className="trackTop"><div><span className="requestId">{r.id}</span><h3>{r.item}</h3><p>{r.category} · {r.weight} kg · {r.date} · {r.time}</p></div><Status status={r.status}/></div>
    <div className="timeline">{steps.map((s,i)=><React.Fragment key={s}><div className={"timeStep "+(i<=idx?"done":"")}><div>{i<idx||i===idx?<CheckCircle2 size={18}/>:<span>{i+1}</span>}</div><small>{s}</small></div>{i<steps.length-1&&<div className={"timeLine "+(i<idx?"done":"")}></div>}</React.Fragment>)}</div>
    <div className="trackBottom"><span><MapPin size={16}/>{r.recycler}</span><span><Award size={16}/>{r.points} EcoPoints</span>
      {r.status!=="Completed" && <button className="btn small primary" onClick={()=>advanceRequest(r.id)}>Demo: Next Status <ArrowRight/></button>}
      {r.status==="Completed" && <span className="completed"><CheckCircle2 size={17}/> Recycling Completed</span>}
    </div>
  </div>
}

function Status({status}){return <span className={"status "+status.toLowerCase().replaceAll(" ","-")}>{status}</span>}

function RequestTable({requests}){return <div className="tableWrap"><table><thead><tr><th>Request</th><th>Item</th><th>Date</th><th>Status</th></tr></thead><tbody>{requests.map(r=><tr key={r.id}><td><b>{r.id}</b></td><td>{r.item}</td><td>{r.date}</td><td><Status status={r.status}/></td></tr>)}</tbody></table></div>}

function Rewards({data}){
  return <main className="dashboard"><div className="container">
    <div className="pageHead"><div><div className="pill">REWARDS</div><h1>EcoPoints Wallet</h1><p>Rewards are a prototype engagement feature.</p></div></div>
    <div className="rewardHero card"><div className="rewardCircle"><Award size={40}/></div><div><span>Available EcoPoints</span><b>{data.points}</b><small>Earn more by completing verified recycling requests.</small></div></div>
    <div className="rewardGrid">
      <RewardCard icon="🎟️" title="₹50 Voucher" points="500" locked={data.points<500}/>
      <RewardCard icon="🌳" title="Plant a Tree" points="300" locked={data.points<300}/>
      <RewardCard icon="📜" title="Eco Certificate" points="200" locked={data.points<200}/>
    </div>
  </div></main>
}
function RewardCard({icon,title,points,locked}){return <div className="card rewardCard"><div className="rewardEmoji">{icon}</div><h3>{title}</h3><p>{points} EcoPoints</p><button className={"btn full "+(locked?"disabled":"primary")} disabled={locked}>{locked?"Not enough points":"Redeem"}</button></div>}

function Impact({data}){
  const kg=totalWeight(data), co2=estimatedCO2(data);
  return <main className="dashboard"><div className="container">
    <div className="pageHead"><div><div className="pill">ENVIRONMENTAL IMPACT</div><h1>Your green contribution 🌱</h1><p>Illustrative estimates calculated from prototype data.</p></div></div>
    <div className="impactGrid">
      <ImpactCard icon={<Recycle/>} value={kg+" kg"} title="E-Waste Recycled"/>
      <ImpactCard icon={<Leaf/>} value={co2+" kg"} title="Estimated CO₂ Impact Avoided"/>
      <ImpactCard icon={<Smartphone/>} value={data.requests.length} title="Devices / Requests"/>
      <ImpactCard icon={<Award/>} value={data.points} title="EcoPoints Earned"/>
    </div>
    <div className="card explanation"><h3>How the estimate works</h3><p>The prototype applies a configurable impact factor to the recorded e-waste weight. This is a demonstration metric, not a direct measurement of emissions avoided.</p><div className="formula">Estimated impact = recycled weight × configured impact factor</div></div>
  </div></main>
}
function ImpactCard({icon,value,title}){return <div className="impactCard card"><div className="featureIcon">{icon}</div><b>{value}</b><span>{title}</span></div>}
function totalWeight(data){return data.requests.reduce((s,r)=>s+Number(r.weight||0),0).toFixed(1)}
function estimatedCO2(data){return (Number(totalWeight(data))*0.67).toFixed(1)}

function Recycler({data,advanceRequest,completeRequest}){
  const active=data.requests.filter(r=>r.status!=="Completed");
  return <main className="dashboard"><div className="container">
    <div className="pageHead"><div><div className="pill">RECYCLER PORTAL</div><h1>GreenCycle Recycling</h1><p>Manage incoming collection requests.</p></div><div className="partnerBadge"><ShieldCheck/> Registered Partner</div></div>
    <div className="statsGrid"><Stat icon={<Clock3/>} value={active.length} label="Active Requests"/><Stat icon={<PackageCheck/>} value={data.requests.filter(r=>r.status==="Completed").length} label="Completed"/><Stat icon={<Recycle/>} value={totalWeight(data)} label="Total kg" suffix=" kg"/><Stat icon={<Users/>} value={18} label="Network Partners"/></div>
    <div className="card"><div className="cardHead"><h3>Incoming Requests</h3><span className="muted">Demo controls update the user journey.</span></div>
      {data.requests.map(r=><div className="recyclerRow" key={r.id}><div className="recyclerIcon"><PackageCheck/></div><div className="grow"><b>{r.id} · {r.item}</b><span>{r.category} · {r.weight} kg · {r.date} · {r.time}</span><small>{r.address||demoUser.address}</small></div><Status status={r.status}/><div className="rowActions">{r.status!=="Completed"&&<button className="btn small primary" onClick={()=>advanceRequest(r.id)}>Update</button>}{r.status==="Recycling"&&<button className="btn small dark" onClick={()=>completeRequest(r.id)}>Complete</button>}</div></div>)}
    </div>
  </div></main>
}

function Admin({data}){
  const completed=data.requests.filter(r=>r.status==="Completed").length;
  const recycling=data.requests.filter(r=>r.status==="Recycling").length;
  return <main className="dashboard"><div className="container">
    <div className="pageHead"><div><div className="pill">ADMIN CONSOLE</div><h1>EcoCycle Overview</h1><p>Monitor users, recycling activity and platform performance.</p></div><div className="partnerBadge"><Database/> System Demo</div></div>
    <div className="statsGrid"><Stat icon={<Users/>} value={data.stats.users} label="Registered Users"/><Stat icon={<Recycle/>} value={data.stats.kg} label="E-Waste Collected" suffix=" kg"/><Stat icon={<PackageCheck/>} value={data.stats.pickups} label="Completed Pickups"/><Stat icon={<ShieldCheck/>} value={data.stats.recyclers} label="Recycling Partners"/></div>
    <div className="adminGrid">
      <div className="card"><div className="cardHead"><h3>E-Waste by Category</h3></div><Bar label="Mobile" value={72}/><Bar label="Laptop" value={58}/><Bar label="Battery" value={42}/><Bar label="TV" value={31}/><Bar label="Other" value={24}/></div>
      <div className="card"><div className="cardHead"><h3>Pickup Status</h3></div><Donut completed={completed} recycling={recycling} total={Math.max(data.requests.length,1)}/><div className="legend"><span><i className="dot a"></i>Completed</span><span><i className="dot b"></i>In Progress</span><span><i className="dot c"></i>Pending</span></div></div>
    </div>
    <div className="card"><div className="cardHead"><h3>Latest Requests</h3><span className="muted">{data.requests.length} demo records</span></div><RequestTable requests={data.requests}/></div>
  </div></main>
}
function Bar({label,value}){return <div className="barRow"><span>{label}</span><div><i style={{width:value+"%"}}></i></div><b>{value}%</b></div>}
function Donut({completed,recycling,total}){const c=Math.round(completed/total*100), p=Math.round(recycling/total*100); return <div className="donutWrap"><div className="donut" style={{"--p":c+"%", "--q":(c+p)+"%"}}><span>{c}%</span></div><div className="donutText"><b>Live demo</b><span>Pickup lifecycle</span></div></div>}

function About({setPage}){
  return <main className="section"><div className="container narrow">
    <SectionTitle eyebrow="HOW ECOCYCLE WORKS" title="A complete digital journey for responsible e-waste"/>
    <div className="aboutSteps">{[
      ["01","Submit","Add the electronic item, weight, condition and pickup address."],
      ["02","Schedule","Choose a convenient pickup date and time."],
      ["03","Connect","A registered recycling partner receives the request."],
      ["04","Track","The user sees status updates throughout the collection journey."],
      ["05","Reward","Completed recycling credits EcoPoints in the demo wallet."],
      ["06","Impact","The dashboard records recycling activity and an illustrative environmental metric."]
    ].map(x=><div className="aboutStep card" key={x[0]}><strong>{x[0]}</strong><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}</div>
    <div className="infoBox"><CircleHelp/><span><b>Prototype note:</b> This version uses local browser storage and simulated roles/status updates. Production deployment should connect verified recycler data, secure authentication, a real database, maps, notifications and validated environmental factors.</span></div>
    <button className="btn primary" onClick={()=>setPage("recycle")}>Try the workflow <ArrowRight/></button>
  </div></main>
}

function Footer(){return <footer><div className="container footerGrid"><div><div className="brand"><span className="brandIcon"><Recycle size={19}/></span><span>Eco<span>Cycle</span></span></div><p>Smart e-waste collection & recycling platform.</p></div><div><b>Prototype</b><span>SDG 12 · Responsible Consumption</span></div><div><b>Built for</b><span>B.Tech Mini Project / Hackathon Demo</span></div></div></footer>}

export default App;