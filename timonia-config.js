/* ═══════════════════════════════════════════════════════════════════════════
   TIMONIA — SOURCE UNIQUE DE VÉRITÉ  (référentiel v2.1 exécutable)
   ---------------------------------------------------------------------------
   Ce fichier est la SEULE définition du modèle métier. Les 3 dashboards
   (client, partner mandataire/admin, fiche dossier) le chargent et le lisent —
   ils ne redéfinissent JAMAIS étapes, types, tarifs ni barème en local.
   → C'est la règle §7 du référentiel : « un module de config partagé ».

   Chargement (script classique, compatible file://) :
     <script src="timonia-config.js"></script>
   puis utiliser  window.T  ci-dessous.
═══════════════════════════════════════════════════════════════════════════ */
(function (global) {

  /* ── 1. PIPELINE UNIQUE — 7 ÉTAPES ─────────────────────────────────────
     UNE seule liste d'étapes pour TOUS les types de projet.
     Le type de projet n'est qu'un filtre / tag, jamais un pipeline séparé.
     bloc = quel bloc CLIENT s'active (0 = amont/qualif, hors bloc). */
  var PIPELINE = [
    { n:'01', key:'nouveaux_inscrits', mand:'Nouveaux inscrits',                          client:'Conseil Flash',            bloc:0,
      desc:"Lead entrant — vérifier la recevabilité de la demande et prendre contact sous 24 h." },
    { n:'02', key:'relance_qualif',    mand:'Relance · Appel qualif fixé',                client:'Conseil Flash',            bloc:0,
      desc:"Relance du prospect et prise de RDV pour le Conseil Flash (15 min offert)." },
    { n:'03', key:'qualif_fait',       mand:'Appel qualif fait · Devis audit envoyé',     client:'Conseil Flash',            bloc:0,
      desc:"Conseil Flash réalisé, situation qualifiée, objectifs formalisés. Devis d'audit envoyé." },
    { n:'04', key:'audit_cours',       mand:'Audit en cours',                             client:'Audit stratégique',        bloc:1,
      desc:"Déclenché après paiement du forfait Bloc 1." },
    { n:'05', key:'audit_livre',       mand:'Audit livré & facturé · Devis mise en œuvre envoyé', client:'Audit stratégique', bloc:1,
      desc:"Livrable remis, audit facturé, devis de mise en œuvre envoyé. SAISIE OBLIGATOIRE de la variable du bien avant de passer en mise en œuvre." },
    { n:'06', key:'oeuvre',            mand:'Mise en œuvre opérationnelle',               client:'Mise en œuvre',            bloc:2,
      desc:"Mandat de délégation totale signé. Phase terrain (recherche, coordination des artisans, urbanisme)." },
    { n:'07', key:'facture_inter',     mand:'Facture intermédiaire',                      client:'Mise en œuvre',            bloc:2,
      desc:"Validation de la phase terrain. Émission d'un acompte UNIQUEMENT en Rénovation, et uniquement sur demande explicite du mandataire." },
    { n:'08', key:'finalisation',      mand:'Finalisation & livraison',                   client:'Finalisation & livraison', bloc:3,
      desc:"Signature notaire / réception des travaux par le client / remise des clés. Émission de la facture du solde final." },
    { n:'09', key:'archive',           mand:'Projet finalisé · Devis prochaine étape envoyé', client:'Projet livré',         bloc:3,
      desc:"Clôture (gagné). Devis de la prochaine étape envoyé. Déclenche le CTA client « Prêt pour la prochaine étape avec Timonia ? »." },
  ];

  /* ── 2. LES 3 BLOCS CLIENT ──────────────────────────────────────────────
     Synchro : étape 02-03 → Bloc 1 · 04-05 → Bloc 2 · 06-07 → Bloc 3. */
  var BLOCS = [
    { id:1, title:'Audit Stratégique',        etapes:['04','05'], color:'#378ADD', bg:'#E6F1FB', fg:'#185FA5' },
    { id:2, title:'Mise en Œuvre',            etapes:['06','07'], color:'#E8833A', bg:'#FCEEE1', fg:'#993C1D' },
    { id:3, title:'Finalisation & Livraison', etapes:['08','09'], color:'#5FA694', bg:'#E1F5EE', fg:'#0F6E56' },
  ];

  /* ── 3. LES 5 TYPES DE PROJET ───────────────────────────────────────────
     bloc1            = forfait audit TTC (encaissé au départ)
     variable         = donnée du bien à saisir à l'étape 03 (bloque 03→04 si null-requis)
     acompte_autorise = un acompte Bloc 2 est légalement possible (Rénovation seule)
     solde            = comment se calcule le solde du Bloc 3
       - forfait : montant fixe (honoraires « en sus », audit NON déduit)
       - pct     : base(réel) × taux %  (− acompte déjà versé si acompte_autorise)
     ⚠️ SIMPLIFICATION 2.1 : plus AUCUNE déduction du Bloc 1 pour Mise en
        location / Mise en vente (source d'erreur supprimée). audit_deductible=false partout. */
  var TYPES = {
    'recherche-location': {
      label:'Recherche location', short:'🔑 Recherche loc.', icon:'🔑', color:'#1e63f0',
      livrable:'Votre Feuille de Route Locative',
      bloc1:149, audit_deductible:false, acompte_autorise:false,
      variable:null,
      solde:{ mode:'forfait', montant:2220, label:'Forfait 2 220 € TTC' } },
    'recherche-achat': {
      label:'Recherche achat', short:'🏠 Recherche achat', icon:'🏠', color:'#0ba592',
      livrable:"Votre Rapport d'Expertise Vénale et Foncière",
      bloc1:790, audit_deductible:false, acompte_autorise:false,
      variable:null,
      solde:{ mode:'forfait', montant:9900, label:'Forfait 9 900 € TTC' } },
    'mise-location': {
      label:'Mise en location', short:'📋 Mise en loc.', icon:'📋', color:'#7F77DD',
      livrable:"Votre Rapport d'Ingénierie Locative",
      bloc1:490, audit_deductible:false, acompte_autorise:false,
      variable:{ key:'surface', label:'Surface', unit:'m²', reelLabel:'Surface réelle', bloc3:false },
      solde:{ mode:'pct', taux:13, base:'surface', unitaire:true, label:'Surface m² × 13 €' } },
    'mise-vente': {
      label:'Mise en vente', short:'🏷️ Mise en vente', icon:'🏷️', color:'#EDA100',
      livrable:"Votre Rapport d'Expertise Vénale et Foncière",
      bloc1:790, audit_deductible:false, acompte_autorise:false,
      variable:{ key:'prix', label:'Prix estimé', unit:'€', reelLabel:'Prix réel acté', bloc3:true },
      solde:{ mode:'pct', taux:5, base:'prix', label:'Prix réel acté × 5 %' } },
    'renovation': {
      label:'Rénovation', short:'🔧 Rénovation', icon:'🔧', color:'#E24B4A',
      livrable:'Votre Plan de Vol de Rénovation Énergétique et Technique',
      bloc1:2200, audit_deductible:false, acompte_autorise:true,
      variable:{ key:'travaux', label:'Montant estimé des travaux', unit:'€', reelLabel:'Montant réel final des travaux', bloc3:true },
      solde:{ mode:'pct', taux:10, base:'travaux', label:'Travaux réels × 10 % − acompte versé' } },
  };
  var TYPE_ORDER = ['recherche-location','recherche-achat','mise-location','mise-vente','renovation'];

  /* ── 4. RÔLES & COMMISSION ──────────────────────────────────────────────
     roleCompte  ∈ client · mandataire · manager · admin   (droits)
     specialite  ∈ lead · sale · front · back              (barème commission)
     commission = %rôle × (TTC encaissé ÷ 1,20)  · total mandataires 60 % · siège 40 %. */
  var TVA = 1.20;
  var BAREME = { lead:10, sale:10, front:20, back:20 };   // Σ = 60 %  → siège 40 %
  var PLAFOND_MANDATAIRES = 60;
  var ROLE_LABELS = { lead:'Lead', sale:'Sale', front:'Front', back:'Back' };
  var ROLE_DESC   = { lead:'Commercial B2B', sale:'Commercial B2C', front:'Agent terrain', back:'Agent bureau' };
  var ROLE_COLORS = { lead:'#378ADD', sale:'#5FA694', front:'#FF8352', back:'#7F77DD' };

  /* ── 5. FACTURE — objet indépendant du pipeline ─────────────────────────
     Un dossier a 0 à 3 factures (bloc 1 / bloc 2 acompte / bloc 3 solde).
     Machine à états. Le mandataire peut proposer/corriger un montant ; il part
     alors en « à valider » (manager/admin) avant d'être émis au client. */
  var FACTURE_STATUTS = {
    a_valider:  { label:'À valider (manager)', cls:'by', desc:"Montant proposé/corrigé par le mandataire — attend validation manager/admin." },
    a_emettre:  { label:'À émettre',           cls:'bo', desc:'Validé — prêt à être émis au client.' },
    emise:      { label:'Émise',               cls:'bb', desc:'Envoyée au client. Commission GELÉE (taux + montant figés).' },
    payee:      { label:'Payée',               cls:'bg', desc:'Encaissée (Stripe). Commission exigible → versable au mandataire.' },
  };

  /* ── 6. STATUT DOSSIER (distinct de l'étape) ────────────────────────────── */
  var DOSSIER_STATUTS = {
    en_cours: { label:'En cours',           cls:'bb' },
    cloture:  { label:'Clôturé (gagné)',    cls:'bg' },   // étape 07
    abandonne:{ label:'Abandonné (perdu)',  cls:'br' },
  };

  /* ── HELPERS ─────────────────────────────────────────────────────────── */
  function etape(n){ return PIPELINE.find(function(e){return e.n===n;}); }
  function etapeIndex(n){ return PIPELINE.findIndex(function(e){return e.n===n;}); }
  function blocForEtape(n){ var e=etape(n); if(!e||!e.bloc) return null; return BLOCS.find(function(b){return b.id===e.bloc;}); }
  function type(k){ return TYPES[k]||null; }
  function livrableFor(k){ var t=TYPES[k]; return t?t.livrable:'Votre livrable'; }

  /* commission HT figée pour un rôle sur un montant TTC encaissé */
  function commission(role, montantTTC){
    var pct = BAREME[role]||0;
    return Math.round(pct/100 * ((+montantTTC||0)/TVA));
  }
  function totalPct(pctObj){ return ['lead','sale','front','back'].reduce(function(s,r){return s+(+(pctObj&&pctObj[r])||0);},0); }
  function pctSiege(pctObj){ return 100 - totalPct(pctObj); }

  /* Solde du Bloc 3 selon le type, la valeur réelle saisie et l'acompte versé.
     valeurReelle = m² réels / prix acté / travaux réels ; acompteVerse en € TTC. */
  function soldeBloc3(typeKey, valeurReelle, acompteVerse){
    var t = TYPES[typeKey]; if(!t) return 0;
    var s = t.solde, v = +valeurReelle||0, ac = +acompteVerse||0;
    if(s.mode==='forfait') return s.montant;
    if(s.mode==='pct'){
      var brut = s.unitaire ? v*s.taux : v*(s.taux/100);   // ×13€ (unitaire) vs ×5%/×8%
      return Math.max(0, Math.round(brut - ac));           // garde-fou anti-solde négatif
    }
    return 0;
  }

  /* Champ variable obligatoire à saisir à l'étape 03 (bloque 03→04). null si aucun. */
  function variableEtape03(typeKey){ var t=TYPES[typeKey]; return (t&&t.variable)?t.variable:null; }

  global.T = {
    PIPELINE, BLOCS, TYPES, TYPE_ORDER, TVA, BAREME, PLAFOND_MANDATAIRES,
    ROLE_LABELS, ROLE_DESC, ROLE_COLORS, FACTURE_STATUTS, DOSSIER_STATUTS,
    etape, etapeIndex, blocForEtape, type, livrableFor,
    commission, totalPct, pctSiege, soldeBloc3, variableEtape03,
    VERSION: '2.1',
  };
})(window);
