const { v4: uuidv4 } = require('uuid');
const GraphEntity = require('../models/GraphEntity');
const GraphRelation = require('../models/GraphRelation');
const logger = require('../utils/logger');

class KnowledgeGraphService {
  constructor() {
    this._initialized = false;
  }

  /**
   * Seed curated knowledge graph for oncology and clinical immunology if empty
   */
  async ensureSeedData() {
    if (this._initialized) return;
    try {
      const count = await GraphEntity.countDocuments();
      if (count === 0) {
        logger.info('Seeding initial clinical Knowledge Graph entities and relations...');
        await this._seedClinicalGraph();
      }
      this._initialized = true;
    } catch (err) {
      logger.warn({ err: err.message }, 'Knowledge graph seeding check skipped');
    }
  }

  async _seedClinicalGraph() {
    const entities = [
      {
        entityId: 'ent-cond-nsclc',
        label: 'Non-Small Cell Lung Cancer',
        type: 'Condition',
        aliases: ['NSCLC', 'Lung Adenocarcinoma', 'Squamous Cell Lung Carcinoma'],
        description: 'Primary epithelial lung cancer lacking small cell features, frequently expressing PD-L1 or harboring EGFR mutations.'
      },
      {
        entityId: 'ent-med-pembro',
        label: 'Pembrolizumab',
        type: 'Medication',
        aliases: ['Keytruda', 'MK-3475'],
        description: 'Humanized monoclonal antibody targeting the PD-1 receptor to augment anti-tumor immune responses.'
      },
      {
        entityId: 'ent-med-osimertinib',
        label: 'Osimertinib',
        type: 'Medication',
        aliases: ['Tagrisso', 'AZD9291'],
        description: 'Third-generation irreversible EGFR-TKI selective for EGFR-sensitizing and T790M resistance mutations.'
      },
      {
        entityId: 'ent-med-chemo-plat',
        label: 'Platinum-Based Chemotherapy',
        type: 'Intervention',
        aliases: ['Carboplatin-Pemetrexed', 'Cisplatin Doublet'],
        description: 'Standard cytotoxic induction regimen inducing DNA cross-linking.'
      },
      {
        entityId: 'ent-target-pd1',
        label: 'PD-1 / PD-L1 Axis',
        type: 'BiologicalTarget',
        aliases: ['CD279', 'Programmed Cell Death 1'],
        description: 'Immune checkpoint pathway exploited by tumors to suppress effector T-cell cytotoxicity.'
      },
      {
        entityId: 'ent-target-egfr',
        label: 'EGFR Exon 19 Del / L858R',
        type: 'BiologicalTarget',
        aliases: ['Epidermal Growth Factor Receptor', 'HER1'],
        description: 'Receptor tyrosine kinase oncogenic driver mutation conferring sensitivity to targeted TKIs.'
      },
      {
        entityId: 'ent-trial-keynote024',
        label: 'KEYNOTE-024 Phase III Trial',
        type: 'ClinicalTrial',
        aliases: ['NCT02142738'],
        description: 'Phase 3 randomized trial of pembrolizumab vs platinum-based chemotherapy in untreated NSCLC with high PD-L1.'
      },
      {
        entityId: 'ent-trial-flaura',
        label: 'FLAURA Phase III Trial',
        type: 'ClinicalTrial',
        aliases: ['NCT02296125'],
        description: 'Phase 3 study comparing osimertinib to standard EGFR-TKIs in untreated EGFR-mutated advanced NSCLC.'
      },
      {
        entityId: 'ent-outcome-pfs',
        label: 'Progression-Free Survival (PFS)',
        type: 'Outcome',
        aliases: ['PFS', 'Disease-Free Interval'],
        description: 'Length of time during and after treatment that patient lives with the disease without disease progression.'
      },
      {
        entityId: 'ent-outcome-os',
        label: 'Overall Survival (OS)',
        type: 'Outcome',
        aliases: ['OS', 'Cumulative Survival'],
        description: 'Primary survival benchmark measuring time from randomization until death from any cause.'
      },
      {
        entityId: 'ent-study-resistant-subset',
        label: 'EGFR T790M Secondary Resistance Study (2023)',
        type: 'ClinicalStudy',
        aliases: ['PMID:37108921'],
        description: 'Cohort study demonstrating diminished immunotherapy efficacy in EGFR-mutant subsets irrespective of PD-L1 expression.'
      }
    ];

    await GraphEntity.insertMany(entities);

    const relations = [
      {
        relationId: 'rel-1',
        fromEntityId: 'ent-med-pembro',
        toEntityId: 'ent-target-pd1',
        type: 'USES_INTERVENTION',
        strength: 0.99,
        evidenceSnippet: 'Pembrolizumab selectively binds PD-1, blocking PD-L1 and PD-L2 binding.'
      },
      {
        relationId: 'rel-2',
        fromEntityId: 'ent-trial-keynote024',
        toEntityId: 'ent-cond-nsclc',
        type: 'INVESTIGATES',
        strength: 0.95,
        evidenceSnippet: 'KEYNOTE-024 investigated first-line advanced NSCLC patients with TPS >= 50%.'
      },
      {
        relationId: 'rel-3',
        fromEntityId: 'ent-trial-keynote024',
        toEntityId: 'ent-med-pembro',
        type: 'USES_INTERVENTION',
        strength: 0.98,
        evidenceSnippet: 'Pembrolizumab monotherapy demonstrated significant hazard ratio reduction for OS.'
      },
      {
        relationId: 'rel-4',
        fromEntityId: 'ent-trial-keynote024',
        toEntityId: 'ent-outcome-os',
        type: 'MEASURES_OUTCOME',
        strength: 0.96,
        evidenceSnippet: 'Median overall survival was 30.0 months in the pembrolizumab group vs 14.2 months in chemotherapy.'
      },
      {
        relationId: 'rel-5',
        fromEntityId: 'ent-med-osimertinib',
        toEntityId: 'ent-target-egfr',
        type: 'USES_INTERVENTION',
        strength: 0.99,
        evidenceSnippet: 'Osimertinib selectively inhibits EGFR-sensitizing and T790M resistance mutations.'
      },
      {
        relationId: 'rel-6',
        fromEntityId: 'ent-trial-flaura',
        toEntityId: 'ent-outcome-pfs',
        type: 'MEASURES_OUTCOME',
        strength: 0.97,
        evidenceSnippet: 'FLAURA achieved median PFS of 18.9 months vs 10.2 months with first-generation comparator TKIs.'
      },
      {
        relationId: 'rel-7',
        fromEntityId: 'ent-study-resistant-subset',
        toEntityId: 'ent-trial-keynote024',
        type: 'CONTRADICTED_BY',
        strength: 0.85,
        isContradiction: true,
        contradictionNotes: 'Immunotherapy monotherapy shows poor objective response rates in EGFR-mutant oncogene-driven NSCLC despite high PD-L1 IHC expression.'
      }
    ];

    await GraphRelation.insertMany(relations);
    logger.info('Knowledge Graph seeded with 11 entities and 7 relationships.');
  }

  /**
   * Search entities by query terms
   */
  async searchEntities(queryText, limit = 10) {
    await this.ensureSeedData();
    if (!queryText?.trim()) {
      return GraphEntity.find().limit(limit);
    }

    const regex = new RegExp(queryText.trim().split(/\s+/).join('|'), 'i');
    return GraphEntity.find({
      $or: [
        { label: regex },
        { aliases: regex },
        { description: regex },
        { type: regex }
      ]
    }).limit(limit);
  }

  /**
   * Multi-hop graph traversal from seed entity IDs
   */
  async traverseGraph(startEntityIds, maxDepth = 2, limit = 30) {
    await this.ensureSeedData();
    if (!startEntityIds?.length) return { nodes: [], edges: [], contradictions: [] };

    const visitedNodes = new Set(startEntityIds);
    const collectedEdges = [];
    let currentFrontier = [...startEntityIds];

    for (let depth = 0; depth < maxDepth; depth++) {
      if (currentFrontier.length === 0) break;

      const relations = await GraphRelation.find({
        $or: [
          { fromEntityId: { $in: currentFrontier } },
          { toEntityId: { $in: currentFrontier } }
        ]
      }).limit(limit);

      const nextFrontier = [];

      for (const rel of relations) {
        if (!collectedEdges.some(e => e.relationId === rel.relationId)) {
          collectedEdges.push(rel);
        }

        if (!visitedNodes.has(rel.fromEntityId)) {
          visitedNodes.add(rel.fromEntityId);
          nextFrontier.push(rel.fromEntityId);
        }
        if (!visitedNodes.has(rel.toEntityId)) {
          visitedNodes.add(rel.toEntityId);
          nextFrontier.push(rel.toEntityId);
        }
      }

      currentFrontier = nextFrontier;
    }

    const nodes = await GraphEntity.find({
      entityId: { $in: Array.from(visitedNodes) }
    });

    const contradictions = collectedEdges.filter(e => e.isContradiction || e.type === 'CONTRADICTED_BY');

    return {
      nodes,
      edges: collectedEdges,
      contradictions
    };
  }

  /**
   * Hybrid Graph Context Extractor for RAG
   * Finds matching entities in query and returns formatted relationship statements
   */
  async getGraphContextForQuery(queryText) {
    await this.ensureSeedData();
    if (!queryText) return { text: '', entities: [], contradictions: [] };

    const matchingEntities = await this.searchEntities(queryText, 5);
    if (matchingEntities.length === 0) {
      return { text: '', entities: [], contradictions: [] };
    }

    const startIds = matchingEntities.map(e => e.entityId);
    const { nodes, edges, contradictions } = await this.traverseGraph(startIds, 2, 20);

    const nodeMap = new Map(nodes.map(n => [n.entityId, n]));

    const lines = [];
    lines.push('### 🕸️ Biomedical Knowledge Graph Traversal:');
    edges.forEach(edge => {
      const from = nodeMap.get(edge.fromEntityId);
      const to = nodeMap.get(edge.toEntityId);
      if (from && to) {
        const relationStr = edge.isContradiction 
          ? `⚡ [CONTRADICTS / DISCORDANT EVIDENCE]` 
          : `──[${edge.type}]──>`;
        lines.push(`• **${from.label}** (${from.type}) ${relationStr} **${to.label}** (${to.type})`);
        if (edge.evidenceSnippet) {
          lines.push(`  Evidence: "${edge.evidenceSnippet}"`);
        }
      }
    });

    if (contradictions.length > 0) {
      lines.push('\n⚠️ **Clinical Evidence Contradiction Alert:**');
      contradictions.forEach(c => {
        lines.push(`• Discordance noted: ${c.contradictionNotes || 'Opposing findings between studies detected in knowledge graph.'}`);
      });
    }

    return {
      text: lines.join('\n'),
      entities: nodes,
      contradictions
    };
  }
}

module.exports = new KnowledgeGraphService();
