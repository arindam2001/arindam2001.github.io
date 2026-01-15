/* js/documents.js */
/* =========================
   Documents & PDFs
   Used by ui.js for rendering
   ========================= */

window.DOCUMENTS = {
  /* =========================
     CVs
     ========================= */
  cvs: [
    {
      id: "cv-security",
      title: "Security CV",
      file: "./docs/cv-security.pdf",
      type: "PDF"
    },
    {
      id: "cv-sde",
      title: "SDE CV",
      file: "./docs/cv-sde.pdf",
      type: "PDF"
    },
    {
      id: "cv-systems",
      title: "Systems CV",
      file: "./docs/cv-systems.pdf",
      type: "PDF"
    }
  ],

  /* =========================
     Other Documents
     ========================= */
  others: [
    {
      id: "thesis",
      title: "M.Tech Thesis",
      description: "Secure Boot and Trusted Logging for Automotive ECUs with HSM & TEE",
      file: "./docs/thesis.pdf"
    },
    
      // {
      //   id: "gate-scorecard",
      //   title: "GATE 2024 Scorecard",
      //   description: "Qualified GATE 2024 (CS/IT)",
      //   file: "./docs/dummy.pdf"
      // }
    

    /*
      Add more documents here later, for example:

      {
        id: "gate-scorecard",
        title: "GATE 2024 Scorecard",
        description: "Qualified GATE 2024 (CS/IT)",
        file: "./docs/dummy.pdf"
      }
    */
  ]
};
