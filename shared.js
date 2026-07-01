/* ═══ TIMONIA V2 — Auth & Data partagés ═══ */

/* Comptes démo */
const USERS = [
  { id:'u1', email:'client@demo.fr',     password:'timonia2026', role:'client',     nom:'Bernard Chaumont', initials:'BC', color:'#378ADD' },
  { id:'u2', email:'mandataire@demo.fr', password:'timonia2026', role:'mandataire', nom:'Clara Guérin',     initials:'CG', color:'#FF8352' },
  { id:'u3', email:'admin@demo.fr',      password:'timonia2026', role:'admin',      nom:'Nelly Duong',      initials:'ND', color:'#5FA694' },
];

/* Auth simple localStorage */
function authLogin(email, password) {
  const u = USERS.find(x => x.email === email && x.password === password);
  if (!u) return null;
  localStorage.setItem('tUser', JSON.stringify(u));
  return u;
}
function authLogout() {
  localStorage.removeItem('tUser');
  window.location.href = 'login.html';
}
function authGet() {
  try { return JSON.parse(localStorage.getItem('tUser')); } catch { return null; }
}
function authRedirect() {
  const u = authGet();
  if (!u) { window.location.href = 'login.html'; return null; }
  return u;
}

/* Données partagées */
const EXPERTISES = {
  conseil_flash: {
    id:'conseil_flash', label:'Conseil Flash', icon:'⚡',
    prix:'150 €', duree:'1h',
    desc:'Analyse de votre situation et recommandations immédiates par un expert.',
    color:'#EDA100', colorLight:'#FAEEDA', colorDark:'#854F0B',
    etapes:[
      { id:'prise_charge',  label:'Prise en charge',         role:'mandataire', desc:'Réception et qualification de la demande' },
      { id:'analyse',       label:'Analyse situation',        role:'mandataire', desc:'Étude du dossier et des documents' },
      { id:'restitution',   label:'Restitution & rapport',   role:'mandataire', desc:'Présentation des conclusions et recommandations' },
      { id:'cloture',       label:'Clôture',                 role:'admin',      desc:'Archivage et facturation' },
    ]
  },
  audit: {
    id:'audit', label:'Audit', icon:'🔍',
    prix:'1 800 €', duree:'3 jours',
    desc:'État des lieux complet, diagnostic juridique, technique et financier.',
    color:'#7F77DD', colorLight:'#EEEDFE', colorDark:'#534AB7',
    etapes:[
      { id:'collecte',      label:'Collecte des documents',  role:'client',     desc:'Le client transmet les pièces nécessaires' },
      { id:'analyse',       label:'Analyse du dossier',      role:'mandataire', desc:'Étude complète juridique et technique' },
      { id:'rapport',       label:'Rapport rédigé',          role:'mandataire', desc:'Rédaction du rapport de recommandations' },
      { id:'restitution',   label:'Restitution client',      role:'mandataire', desc:'Présentation du rapport au client' },
      { id:'validation',    label:'Validation client',       role:'client',     desc:'Le client approuve le rapport' },
      { id:'facturation',   label:'Facturation',             role:'admin',      desc:'Émission et paiement de la facture' },
    ]
  },
  mise_en_oeuvre: {
    id:'mise_en_oeuvre', label:'Mise en œuvre', icon:'🔧',
    prix:'8% travaux', duree:'Variable',
    desc:'Pilotage complet de la résolution : procédures, travaux, démarches.',
    color:'#FF8352', colorLight:'#FAECE7', colorDark:'#993C1D',
    etapes:[
      { id:'brief',         label:'Brief & planification',   role:'mandataire', desc:'Réunion de lancement avec l\'équipe' },
      { id:'devis',         label:'Devis prestataires',      role:'client',     desc:'Le client valide les devis travaux' },
      { id:'execution',     label:'Exécution & suivi',       role:'mandataire', desc:'Pilotage du chantier et des démarches' },
      { id:'reception',     label:'Réception chantier',      role:'client',     desc:'Le client valide la fin des travaux' },
      { id:'facturation',   label:'Facturation',             role:'admin',      desc:'Émission et paiement de la facture' },
    ]
  },
  valorisation: {
    id:'valorisation', label:'Valorisation', icon:'📈',
    prix:'5% vente / 8% location', duree:'Variable',
    desc:'Mise en vente ou en location au meilleur prix du marché.',
    color:'#5FA694', colorLight:'#E1F5EE', colorDark:'#0F6E56',
    etapes:[
      { id:'prep_annonce',  label:'Préparation annonce',     role:'mandataire', desc:'Photos, descriptif, prix de mise en marché' },
      { id:'diffusion',     label:'Diffusion annonce',       role:'mandataire', desc:'Publication sur les portails immobiliers' },
      { id:'dossiers',      label:'Dossiers candidats',      role:'mandataire', desc:'Réception et analyse des candidatures' },
      { id:'visites',       label:'Visites',                 role:'mandataire', desc:'Organisation et tenue des visites' },
      { id:'selection',     label:'Dossier accepté',         role:'client',     desc:'Le client valide le candidat retenu' },
      { id:'acte',          label:'Bail / Acte signé',       role:'mandataire', desc:'Finalisation juridique' },
      { id:'facturation',   label:'Facturation',             role:'admin',      desc:'Émission et paiement de la facture' },
    ]
  }
};

/* Données dossiers démo */
const DOSSIERS = [
  {
    id:'D001', ref:'TIM-2024-087',
    client_id:'u1', client_nom:'M. Bernard Chaumont',
    bien:'14 rue Pasteur, Lyon 7e · T3 62m²',
    situation:'Locataire en impayé chronique depuis 14 mois (8 400€ de dette). Bien classé DPE-F bloquant la revalorisation du loyer. Succession en cours avec un frère co-héritaire.',
    expertise_id:'mise_en_oeuvre',
    sous_type: null,
    etape_active:'devis',
    etapes_done:['brief'],
    statut:'actif',
    sla:-8,
    montant:24800,
    mandataire_id:'u2', mandataire_nom:'Clara Guérin', mandataire_pct:40,
    date_creation:'03 jan. 2024',
    tags:['Impayé 14m','DPE-F','SLA -8j'],
    factures:[
      { id:'F-2024-003', etape:'Audit', montant:1800, statut:'payee', date:'15 fév. 2024' },
    ]
  },
  {
    id:'D002', ref:'TIM-2024-095',
    client_id:'u1', client_nom:'Mme Fatou Diallo',
    bien:'Bron · T3 65m²',
    situation:'Passoire thermique DPE-F. Locataire maintenu illégalement post-congé. Procédure juridique en cours.',
    expertise_id:'audit',
    sous_type: null,
    etape_active:'analyse',
    etapes_done:['collecte'],
    statut:'actif',
    sla:5,
    montant:1800,
    mandataire_id:'u2', mandataire_nom:'Clara Guérin', mandataire_pct:40,
    date_creation:'15 jan. 2024',
    tags:['DPE-F','Juridique'],
    factures:[]
  },
  {
    id:'D003', ref:'TIM-2024-101',
    client_id:'u1', client_nom:'Mme Sylvie Morel',
    bien:'Lyon 3e · Studio 28m²',
    situation:'Impayé depuis 2 mois. Première prise de contact.',
    expertise_id:'conseil_flash',
    sous_type: null,
    etape_active:'prise_charge',
    etapes_done:[],
    statut:'actif',
    sla:1,
    montant:150,
    mandataire_id:'u2', mandataire_nom:'Clara Guérin', mandataire_pct:40,
    date_creation:'28 juin 2024',
    tags:['Nouveau'],
    factures:[]
  },
];

/* Helpers */
function getExpertise(id) { return EXPERTISES[id]; }
function getDossier(id) { return DOSSIERS.find(d=>d.id===id); }
function getEtapeIdx(dossier) {
  const exp = getExpertise(dossier.expertise_id);
  if (!exp) return 0;
  return exp.etapes.findIndex(e=>e.id===dossier.etape_active);
}
function calcProgress(dossier) {
  const exp = getExpertise(dossier.expertise_id);
  if (!exp) return 0;
  const total = exp.etapes.length;
  const done = dossier.etapes_done.length;
  return Math.round(done/total*100);
}
function slaClass(sla) {
  if (sla===null) return 'badge-gray';
  if (sla<0) return 'badge-red';
  if (sla<=3) return 'badge-yellow';
  return 'badge-green';
}
function slaLabel(sla) {
  if (sla===null) return 'Récurrent';
  if (sla<0) return `SLA -${Math.abs(sla)}j`;
  if (sla<=3) return `${sla}j restants`;
  return `${sla}j ✓`;
}
