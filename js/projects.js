/* js/projects.js */
/* =========================
   Projects Data
   Used by ui.js to render cards
   ========================= */

window.PROJECTS = [
  /* =========================
     Security & Cryptography
     ========================= */
  {
    id: "cloud-auditing",
    title: "Identity-Based Cloud Integrity Auditing with Data Hiding",
    category: "security",
    context: "IIT Delhi • Prof. Huzur Saran (Mar 2025 – Jun 2025)",
    image: "./assets/images/projects/p1.png",
    summary: [
      "Designed identity-based cloud integrity auditing with sensitive data sanitization.",
      "Implemented parallel verification, tamper-evident logging, and multi-layered blinding.",
      "Achieved O(1) audit scalability with ~58% faster verification."
    ],
    tech: ["Cryptography", "Privacy", "Parallel Verification", "Python"],
    links: {
      github: "https://github.com/arindam2001/Identity-Based-Cloud-Integrity-Auditing-With-Data-Hiding",
      report: "./docs/p1_report.pdf"
    }
  },

  {
    id: "secure-web-testing",
    title: "Secure Communication & Web Application Security Testing",
    category: "security",
    context: "IIT Delhi • Prof. Huzur Saran (Mar 2025 – Apr 2025)",
    image: "./assets/images/projects/p2.png",
    summary: [
      "Built a TLS client in Python implementing handshake, CA and hostname verification.",
      "Performed web vulnerability assessment using Burp Suite and Nmap/NSE.",
      "Identified XSS, TLS misconfigurations, and CVE-mapped services with mitigations."
    ],
    tech: ["TLS", "Python", "Wireshark", "Burp Suite", "Nmap"],
    links: {
      github: "https://github.com/arindam2001/Secure-Communication-Web-Application-Security-Testing",
      report: "./docs/p2_report.pdf"
    }
  },

  {
    id: "android-security",
    title: "Android Application Security Testing",
    category: "security",
    context: "IIT Delhi • Prof. Rajesh Pal (Mar 2025 – May 2025)",
    image: "./assets/images/projects/p3.png",
    summary: [
      "Audited a vulnerable Android banking app and exploited multiple security flaws.",
      "Bypassed root detection and intercepted traffic using Frida, ADB, and Burp Suite.",
      "Proposed mitigations aligned with Android security best practices."
    ],
    tech: ["Android", "Frida", "ADB", "Apktool", "Burp Suite"],
    links: {
      github: "https://github.com/arindam2001/Android-Application-Security-Testing",
      report: "./docs/p3_report.pdf"
    }
  },

  {
    id: "secure-messaging",
    title: "Cryptographic Secure Messaging System using AES",
    category: "security",
    context: "IIT Delhi • Prof. A.K. Bhateja (Jul 2024 – Sep 2024)",
    image: "./assets/images/projects/p4.png",
    summary: [
      "Built an end-to-end encrypted client–server messaging system using AES-CBC.",
      "Ensured confidentiality, integrity, and replay attack prevention using IVs.",
      "Implemented encrypted storage and master-password protected admin controls."
    ],
    tech: ["AES", "PBKDF2", "Python", "SQLite", "Cryptography"],
    links: {
      github: "https://github.com/arindam2001/Cryptographic-Secure-Messaging-System-using-AES",
      report: "./docs/p4_report.pdf"
    }
  },

  /* =========================
     Systems & OS
     ========================= */
  {
    id: "xv6-kernel",
    title: "Kernel Enhancements to xv6 Operating System",
    category: "systems",
    context: "IIT Delhi • Prof. Smruti R. Sarangi (Mar 2025 – Jun 2025)",
    image: "./assets/images/projects/p5.png",
    summary: [
      "Extended xv6 with custom syscalls for auth, signals, and process history.",
      "Implemented priority-based scheduler with profiling and starvation prevention.",
      "Added memory enhancements including page swapping and adaptive replacement."
    ],
    tech: ["C", "xv6", "Operating Systems", "Schedulers", "Memory Management"],
    links: {
      github: "https://github.com/arindam2001/Enhanced_xv6-public-2",
      report: "./docs/p5_report.pdf"
    }
  },

  /* =========================
     Networking & SDN
     ========================= */
  {
    id: "transport-protocol",
    title: "Reliable Transport Protocol with Concurrency & Congestion Control",
    category: "networking",
    context: "IIT Delhi • Prof. Tarun Mangla (Jul 2024 – Sep 2024)",
    image: "./assets/images/projects/p6.png",
    summary: [
      "Implemented TCP-like reliable transport over UDP with sliding window and ACKs.",
      "Evaluated Reno and CUBIC under delay/loss using Mininet.",
      "Developed a multithreaded C++ socket server supporting 32 concurrent clients."
    ],
    tech: ["Python", "C++", "Sockets", "Mininet", "TCP Reno"],
    links: {
      github: "https://github.com/arindam2001/Design-and-Implementation-of-Reliable-Transport-Protocol-with-Concurrency-and-Congestion-Control",
      report: "./docs/p6_report.pdf"
    }
  },

  {
    id: "sdn-controller",
    title: "Traffic-Aware SDN Controller for Performance Optimization",
    category: "networking",
    context: "IIT Delhi • Prof. Tarun Mangla (Jul 2024 – Aug 2024)",
    image: "./assets/images/projects/p7.png",
    summary: [
      "Built SDN apps using Ryu and OpenFlow in Mininet.",
      "Implemented learning switch, STP, and shortest-path routing.",
      "Adaptively updated flow tables using real-time traffic statistics."
    ],
    tech: ["SDN", "Ryu", "OpenFlow", "Mininet", "Dijkstra"],
    links: {
      github: "https://github.com/arindam2001/Traffic-Aware-SDN-Controller-for-Performance-Optimization",
      report: "./docs/p7_report.pdf"
    }
  },

  /* =========================
     Blockchain & Distributed
     ========================= */
  {
    id: "nft-marketplace",
    title: "Decentralized NFT Marketplace (ERC-721)",
    category: "blockchain",
    context: "IIT Delhi • Prof. S.V. Sharma (Aug 2024 – Nov 2024)",
    image: "./assets/images/projects/p8.png",
    summary: [
      "Developed ERC-721 smart contracts for NFT minting and trading.",
      "Integrated MetaMask wallet authentication with a React frontend.",
      "Deployed on Ethereum using Hardhat and Alchemy."
    ],
    tech: ["Solidity", "Ethereum", "Hardhat", "React", "MetaMask"],
    links: {
      github: "https://github.com/arindam2001/Blockchain-Based-Solution-NFT-Market-Place",
      report: "./docs/p8_report.pdf"
    }
  },

  {
    id: "supply-chain",
    title: "Supply Chain Management System using Blockchain",
    category: "blockchain",
    context: "B.Tech Major Project • Prof. Surojit Bhattacharyya (Jul 2023 – Apr 2024)",
    image: "./assets/images/projects/p9.png",
    summary: [
      "Built a blockchain-backed supply chain tracking system.",
      "Enabled transparent product traceability and ownership transfer.",
      "Integrated smart contracts with a web-based frontend."
    ],
    tech: ["Blockchain", "Solidity", "Web3", "Supply Chain"],
    links: {
      github: "https://github.com/arindam2001/mckvie-cse-group3-project",
      report: "./docs/p9_report.pdf"
    }
  },

  /* =========================
     Backend / Web
     ========================= */
  {
    id: "hospital-backend",
    title: "Hospital Management System (Backend)",
    category: "backend",
    context: "Sure Trust Internship (May 2023 – Oct 2023)",
    image: "./assets/images/projects/p10.png",
    summary: [
      "Designed backend modules using Java, JDBC, and Spring Boot.",
      "Built REST APIs and integrated SQL databases.",
      "Focused on scalability, data integrity, and secure connectivity."
    ],
    tech: ["Java", "Spring Boot", "JDBC", "REST", "MySQL"],
    links: {
      github: "https://github.com/arindam2001/SureTrustHMS",
      report: "./docs/p10_report.pdf"
    }
  }
];
