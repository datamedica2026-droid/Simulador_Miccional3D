const CMH2O_TO_PA = 98.0665;
const CD_AUTO = 0.183, CD_LAMINAR = 0.166;
function ageCdFactor(age){ return 1 - 0.0025*(age-25); }
const UVA_KEYS=[0,15,30,45,60], UVA_VALS=[90,97,105,115,125];
function uvaForAngle(a){
  if(a<=0) return 90; if(a>=60) return 125;
  for(let i=0;i<4;i++) if(a>=UVA_KEYS[i]&&a<=UVA_KEYS[i+1]){
    const t=(a-UVA_KEYS[i])/(UVA_KEYS[i+1]-UVA_KEYS[i]);
    return UVA_VALS[i]+t*(UVA_VALS[i+1]-UVA_VALS[i]);
  }
}
function bendLossK(a){ const uva=uvaForAngle(a); return 0.05+3.2*((uva-90)/(125-90)); }
function solveFlow(deltaP,D,rho,mu,angleDeg,turbMode,ageFactor){
  const A=Math.PI*D*D/4, K=bendLossK(angleDeg);
  const Cd=(turbMode==='laminar'?CD_LAMINAR:CD_AUTO)*(ageFactor??1);
  const C0=1/(Cd*Cd);
  const Q=A*Math.sqrt((2*deltaP)/(rho*(C0+K)));
  const V=Q/A, Re=rho*V*D/mu;
  return {V, Q_mLs:Q*1e6, Re};
}

// Rango COMPLETO de los sliders del simulador
const pmaxRange = [30, 40, 50, 60, 70];      // cmH2O (rango completo del slider)
const diamRange = [4.0, 6.0, 7.2, 9.0, 10.5]; // mm (rango completo del slider)
const angleRange = [0, 15, 30, 45, 60];
const ageRange = [18, 25, 29, 35, 40];
const rhoRange = [990, 1030, 1060];
const muRange = [0.60, 1.00, 1.60]; // mPa.s

let count=0, flagged=[];
const results=[];
for(const pmax of pmaxRange)
for(const diam of diamRange)
for(const angle of angleRange)
for(const age of ageRange)
for(const rho of rhoRange)
for(const muMPa of muRange){
  count++;
  const mu = muMPa/1000;
  const D = diam/1000;
  const deltaP = pmax*CMH2O_TO_PA;
  const r = solveFlow(deltaP, D, rho, mu, angle, 'auto', ageCdFactor(age));
  results.push(r.Q_mLs);
  // Umbrales de "no absurdo": V razonable para un chorro urinario, Q no negativo/NaN, Re finito
  if(!isFinite(r.Q_mLs) || r.Q_mLs < 0 || r.Q_mLs > 80 || r.V > 3.5 || !isFinite(r.Re)){
    flagged.push({pmax,diam,angle,age,rho,muMPa, Q:r.Q_mLs.toFixed(1), V:r.V.toFixed(2), Re:r.Re.toFixed(0)});
  }
}
console.log('Combinaciones probadas:', count);
console.log('Qmax min/max en todo el grid:', Math.min(...results).toFixed(1), '/', Math.max(...results).toFixed(1), 'mL/s');
console.log('Casos fuera de los umbrales de sanidad (V>3.5m/s, Q>80mL/s, Q<0, no finito):', flagged.length);
if(flagged.length) console.log(flagged.slice(0,10));

// Reporte de los casos extremos (para documentar en Metodología)
let maxQ=-Infinity, minQ=Infinity, maxV=-Infinity, maxRe=-Infinity;
let maxQcase, minQcase, maxVcase;
for(const pmax of pmaxRange)
for(const diam of diamRange)
for(const angle of angleRange)
for(const age of ageRange)
for(const rho of rhoRange)
for(const muMPa of muRange){
  const mu=muMPa/1000, D=diam/1000, deltaP=pmax*CMH2O_TO_PA;
  const r = solveFlow(deltaP, D, rho, mu, angle, 'auto', ageCdFactor(age));
  if(r.Q_mLs>maxQ){ maxQ=r.Q_mLs; maxQcase={pmax,diam,angle,age,rho,muMPa}; }
  if(r.Q_mLs<minQ){ minQ=r.Q_mLs; minQcase={pmax,diam,angle,age,rho,muMPa}; }
  if(r.V>maxV){ maxV=r.V; maxVcase={pmax,diam,angle,age,rho,muMPa}; }
  if(r.Re>maxRe) maxRe=r.Re;
}
console.log('\n--- Casos extremos ---');
console.log('Qmax MAXIMO:', maxQ.toFixed(1), 'mL/s en', maxQcase);
console.log('Qmax MINIMO:', minQ.toFixed(1), 'mL/s en', minQcase);
console.log('V MAXIMA:', maxV.toFixed(2), 'm/s en', maxVcase);
console.log('Re MAXIMO:', maxRe.toFixed(0));
