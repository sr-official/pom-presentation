APPDATA.quality = {
  "gates": [
    {
      "id": "iqc",
      "name": "IQC",
      "full": "Incoming Quality Control",
      "checks": [
        "Material spec",
        "Dimensions",
        "Moisture / surface condition"
      ]
    },
    {
      "id": "ipqc",
      "name": "IPQC",
      "full": "In-Process Quality Control",
      "checks": [
        "Frame alignment",
        "Joint strength",
        "Folding mechanism",
        "Locking mechanism",
        "Connector fit"
      ]
    },
    {
      "id": "fqc",
      "name": "FQC",
      "full": "Final Quality Control",
      "checks": [
        "Stability",
        "Load test",
        "Surface & edge finishing",
        "Packaging integrity"
      ]
    }
  ],
  "scenario": {
    "label": "Illustrative Academic Scenario",
    "inspected": 100,
    "passed": 94,
    "rework": 6,
    "fpy": 94
  },
  "inventory": {
    "stages": [
      "Raw Materials",
      "Work In Process",
      "Finished Goods"
    ],
    "materials": [
      "Boards",
      "Steel",
      "Laminate",
      "Hardware",
      "Edge Banding",
      "Rubber Components"
    ],
    "concepts": [
      {
        "term": "Safety Stock",
        "text": "Buffer quantity held to absorb demand or lead-time variability."
      },
      {
        "term": "Reorder Point",
        "text": "Inventory level that triggers a new purchase order."
      },
      {
        "term": "Lead Time",
        "text": "Time between placing and receiving a supplier order."
      },
      {
        "term": "FIFO",
        "text": "First-in, first-out — oldest material stock is used first."
      },
      {
        "term": "Carrying Cost",
        "text": "Cost of holding inventory: storage, capital, obsolescence risk."
      }
    ]
  },
  "supplyChain": {
    "flow": [
      "Suppliers",
      "Raw Material Receiving",
      "DIPTO Factory",
      "Quality Control",
      "Warehouse",
      "Distribution",
      "Institutions / Dealers / Students"
    ],
    "risks": [
      {
        "risk": "Material price fluctuation",
        "mitigation": "Multiple supplier quotes, periodic cost review"
      },
      {
        "risk": "Supplier delay",
        "mitigation": "Maintain buffer stock, qualify backup suppliers"
      },
      {
        "risk": "Transportation disruption",
        "mitigation": "Regional distribution points, flexible routing"
      },
      {
        "risk": "Hardware shortage",
        "mitigation": "Standardize hardware across product line"
      },
      {
        "risk": "Board availability",
        "mitigation": "Track local board market, forward planning"
      },
      {
        "risk": "Quality variation",
        "mitigation": "IQC screening on every incoming lot"
      }
    ]
  },
  "risks": [
    {
      "risk": "Material price fluctuation",
      "probability": "MEDIUM",
      "impact": "MEDIUM",
      "mitigation": "Lock supplier quotes quarterly, review pricing model"
    },
    {
      "risk": "Supplier delay",
      "probability": "MEDIUM",
      "impact": "MEDIUM",
      "mitigation": "Maintain safety stock, qualify backup suppliers"
    },
    {
      "risk": "Quality defects",
      "probability": "LOW",
      "impact": "HIGH",
      "mitigation": "Three-gate inspection (IQC / IPQC / FQC)"
    },
    {
      "risk": "Machine breakdown",
      "probability": "LOW",
      "impact": "MEDIUM",
      "mitigation": "Preventive maintenance schedule, dedicated technician"
    },
    {
      "risk": "Demand uncertainty",
      "probability": "MEDIUM",
      "impact": "HIGH",
      "mitigation": "Phase capacity ramp-up, start below full 1,000-unit target"
    },
    {
      "risk": "Workforce absenteeism",
      "probability": "MEDIUM",
      "impact": "LOW",
      "mitigation": "Cross-train assembly workers across stations"
    },
    {
      "risk": "Transportation disruption",
      "probability": "LOW",
      "impact": "MEDIUM",
      "mitigation": "Regional distribution, flexible routing"
    },
    {
      "risk": "Working capital pressure",
      "probability": "MEDIUM",
      "impact": "HIGH",
      "mitigation": "Phase fixed-cost commitments to sales ramp-up"
    }
  ],
  "sustainability": {
    "principle": "REPAIR > REPLACE",
    "steps": [
      "Damaged Module",
      "Remove Module",
      "Replace Module",
      "Restore Product"
    ],
    "points": [
      "Modular replacement means one damaged part does not retire the whole desk.",
      "Repairability extends useful product life.",
      "Local assembly keeps repair parts and knowledge close to the customer.",
      "Compact mode reduces the space needed for storage and logistics."
    ]
  }
};
