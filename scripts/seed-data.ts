import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Wiping all existing data...")

  // Delete in dependency order (children first)
  await prisma.teamTaskAssignment.deleteMany({})
  await prisma.teamTask.deleteMany({})
  await prisma.teamDirector.deleteMany({})
  await prisma.teamMember.deleteMany({})
  await prisma.eventFeedback.deleteMany({})
  await prisma.eventQRCode.deleteMany({})
  await prisma.eventAttendance.deleteMany({})
  await prisma.eventApprovalRequest.deleteMany({})
  await prisma.eventRegistration.deleteMany({})
  await prisma.eventDirector.deleteMany({})
  await prisma.projectDirector.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.resource.deleteMany({})
  await prisma.proposalComment.deleteMany({})
  await prisma.proposal.deleteMany({})
  await prisma.commentReply.deleteMany({})
  await prisma.postComment.deleteMany({})
  await prisma.postLike.deleteMany({})
  await prisma.postView.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.organizationPost.deleteMany({})
  await prisma.memberCredit.deleteMany({})
  await prisma.userEventStats.deleteMany({})
  await prisma.featureAccess.deleteMany({})
  await prisma.contact.deleteMany({})
  await prisma.collaborationRequest.deleteMany({})
  await prisma.organizationCollaborationCode.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.team.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.organizationProfile.deleteMany({})
  await prisma.userSkill.deleteMany({})
  await prisma.skill.deleteMany({})
  await prisma.certificate.deleteMany({})
  await prisma.profile.deleteMany({})
  await prisma.insight.deleteMany({})
  await prisma.answer.deleteMany({})
  await prisma.result.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.organization.deleteMany({})

  console.log("✅ All data wiped.\n")

  // ─── Passwords ──────────────────────────────────────────────
  const memberPw = await hash("password123", 12)
  const adminPw = await hash("admin123", 12)
  const now = new Date()

  // ═══════════════════════════════════════════════════════════
  // 1. ORGANIZATION / ORGANIZATION
  // ═══════════════════════════════════════════════════════════
  const organizationId = "innovalab-club"
  await prisma.organization.create({
    data: {
      id: organizationId,
      name: "Innova'Lab",
      updatedAt: now,
      createdById: "system-seed",
    },
  })

  await prisma.organizationProfile.create({
    data: {
      organizationId,
      bio: "Innova'Lab est un club universitaire basé en Tunisie, dédié à l'innovation technologique, l'entrepreneuriat étudiant et le développement des soft skills. Fondé en 2023 à l'Institut Supérieur d'Informatique (ISI), le club organise des hackathons, des workshops et des conférences pour préparer les étudiants au monde professionnel.",
      contactEmail: "innovalab.club@gmail.com",
      contactPhone: "+216 55 123 456",
      location: "Tunis, Tunisie",
      website: "https://innovalab.tn",
      isPublic: true,
      updatedAt: now,
    },
  })

  await prisma.organizationCollaborationCode.create({
    data: { organizationId, code: "INNOVA-2024TN" },
  })
  console.log("✅ Club Innova'Lab created")

  // ═══════════════════════════════════════════════════════════
  // 2. USERS (1 HR + 8 members)
  // ═══════════════════════════════════════════════════════════
  const hrId = "hr-amine"
  await prisma.user.create({
    data: {
      id: hrId,
      email: "anasanas@InnovaLab.com",
      name: "Amine Ben Salem",
      password: adminPw,
      role: "HR",
      avatarId: 3,
      organizationId,
      updatedAt: now,
    },
  })
  await prisma.profile.create({
    data: {
      userId: hrId,
      headline: "Président & Fondateur — Innova'Lab",
      bio: "Étudiant en 3ème année Génie Logiciel à ISI. Passionné par l'IA et l'entrepreneuriat.",
      location: "Tunis, Ariana",
      roleTitle: "Président du club",
    },
  })

  const members = [
    { id: "mem-sarra",   email: "sarra.hamdi@innovalab.tn",    name: "Sarra Hamdi",       avatar: 5,  headline: "Vice-Présidente — Innova'Lab",             bio: "Étudiante en Data Science à ENIT. Coordinatrice générale du club.", role: "Responsable Communication" },
    { id: "mem-youssef", email: "youssef.trabelsi@innovalab.tn", name: "Youssef Trabelsi", avatar: 2,  headline: "Directeur Technique — Innova'Lab",           bio: "Développeur Full-Stack, passionné par le cloud et DevOps.",          role: "Directeur Technique" },
    { id: "mem-amira",   email: "amira.bouaziz@innovalab.tn",  name: "Amira Bouaziz",     avatar: 7,  headline: "Responsable Design — Innova'Lab",            bio: "Designer UI/UX, étudiante en multimédia à ISAMM.",                 role: "Responsable Design" },
    { id: "mem-mehdi",   email: "mehdi.gharbi@innovalab.tn",    name: "Mehdi Gharbi",      avatar: 1,  headline: "Responsable Événements — Innova'Lab",        bio: "Organisateur d'événements et passionné de marketing digital.",      role: "Responsable Événements" },
    { id: "mem-ines",    email: "ines.bouzid@innovalab.tn",     name: "Inès Bouzid",       avatar: 8,  headline: "Secrétaire Générale — Innova'Lab",           bio: "Étudiante en Informatique à FST. Gestion administrative du club.", role: "Secrétaire Générale" },
    { id: "mem-omar",    email: "omar.mejri@innovalab.tn",      name: "Omar Mejri",        avatar: 4,  headline: "Membre Actif — Département Tech",            bio: "Développeur mobile Flutter, 2ème année à Tek-Up.",                 role: "Développeur Mobile" },
    { id: "mem-rania",   email: "rania.saidi@innovalab.tn",     name: "Rania Saidi",       avatar: 6,  headline: "Membre Actif — Département Communication",   bio: "Community manager et étudiante en journalisme à IPSI.",            role: "Community Manager" },
    { id: "mem-adam",    email: "adam.khelifi@innovalab.tn",     name: "Adam Khelifi",      avatar: 9,  headline: "Membre Actif — Département Tech",            bio: "Passionné de cybersécurité, étudiant à INSAT.",                    role: "Spécialiste Cybersécurité" },
  ]

  for (const m of members) {
    await prisma.user.create({
      data: {
        id: m.id,
        email: m.email,
        name: m.name,
        password: memberPw,
        role: "MEMBER",
        avatarId: m.avatar,
        organizationId,
        updatedAt: now,
      },
    })
    await prisma.profile.create({
      data: {
        userId: m.id,
        headline: m.headline,
        bio: m.bio,
        location: "Tunis, Tunisie",
        roleTitle: m.role,
      },
    })
  }
  console.log("✅ 9 users created (1 HR + 8 members)")

  // ═══════════════════════════════════════════════════════════
  // 3. PROJECTS
  // ═══════════════════════════════════════════════════════════
  const proj1 = await prisma.project.create({
    data: {
      id: "proj-app-mobile",
      organizationId,
      title: "Application Mobile InnovaConnect",
      description: "Développement d'une appli mobile pour centraliser les activités du club : événements, tâches, communication entre membres et système de points de participation.",
      type: "internal",
      status: "in-progress",
      timelineStart: new Date("2026-02-01"),
      timelineEnd: new Date("2026-06-30"),
      createdById: hrId,
      updatedAt: now,
    },
  })

  const proj2 = await prisma.project.create({
    data: {
      id: "proj-hackathon-org",
      organizationId,
      title: "Organisation Hackathon Innova'Hack 2026",
      description: "Planification et exécution du hackathon annuel d'Innova'Lab — 48h de développement intensif avec des défis en IA, IoT et FinTech. Objectif : 150 participants.",
      type: "internal",
      status: "idea",
      timelineStart: new Date("2026-05-01"),
      timelineEnd: new Date("2026-05-20"),
      createdById: hrId,
      updatedAt: now,
    },
  })
  console.log("✅ 2 projects created")

  // ═══════════════════════════════════════════════════════════
  // 4. TEAMS
  // ═══════════════════════════════════════════════════════════
  const teamDev = await prisma.team.create({
    data: {
      id: "team-dev",
      organizationId,
      name: "Département Tech",
      purpose: "Développement des projets techniques du club, site web, applications et outils internes.",
      description: "L'équipe technique d'Innova'Lab gère tous les projets de développement logiciel.",
      status: "active",
      createdById: hrId,
      projectId: proj1.id,
      updatedAt: now,
    },
  })

  const teamComm = await prisma.team.create({
    data: {
      id: "team-comm",
      organizationId,
      name: "Département Communication",
      purpose: "Gestion de la présence en ligne, réseaux sociaux, branding et relations publiques.",
      description: "L'équipe communication assure la visibilité du club et coordonne les campagnes.",
      status: "active",
      createdById: hrId,
      updatedAt: now,
    },
  })

  const teamEvent = await prisma.team.create({
    data: {
      id: "team-events",
      organizationId,
      name: "Département Événementiel",
      purpose: "Planification, logistique et exécution de tous les événements du club.",
      description: "Cette équipe pilote les workshops, hackathons et conférences d'Innova'Lab.",
      status: "active",
      createdById: hrId,
      updatedAt: now,
    },
  })
  console.log("✅ 3 teams created")

  // Team members
  await prisma.teamMember.createMany({
    data: [
      { teamId: teamDev.id,   userId: "mem-youssef", roleInTeam: "Lead Dev" },
      { teamId: teamDev.id,   userId: "mem-omar",    roleInTeam: "Développeur Mobile" },
      { teamId: teamDev.id,   userId: "mem-adam",    roleInTeam: "Cybersécurité & Backend" },
      { teamId: teamComm.id,  userId: "mem-sarra",   roleInTeam: "Coordinatrice" },
      { teamId: teamComm.id,  userId: "mem-amira",   roleInTeam: "Designer UI/UX" },
      { teamId: teamComm.id,  userId: "mem-rania",   roleInTeam: "Community Manager" },
      { teamId: teamEvent.id, userId: "mem-mehdi",   roleInTeam: "Chef Événements" },
      { teamId: teamEvent.id, userId: "mem-ines",    roleInTeam: "Logistique & Admin" },
    ],
  })

  // Team directors
  await prisma.teamDirector.createMany({
    data: [
      { teamId: teamDev.id,   userId: "mem-youssef" },
      { teamId: teamComm.id,  userId: "mem-sarra" },
      { teamId: teamEvent.id, userId: "mem-mehdi" },
    ],
  })
  console.log("✅ Team members & directors assigned")

  // ═══════════════════════════════════════════════════════════
  // 5. TASKS
  // ═══════════════════════════════════════════════════════════
  await prisma.task.createMany({
    data: [
      { projectId: proj1.id, title: "Maquettes UI/UX de l'application",        status: "completed",   priority: "high",   assigneeId: "mem-amira",   createdById: hrId, updatedAt: now },
      { projectId: proj1.id, title: "API Backend — Authentification JWT",       status: "completed",   priority: "high",   assigneeId: "mem-youssef", createdById: hrId, updatedAt: now },
      { projectId: proj1.id, title: "Module Événements — Frontend Flutter",     status: "in-progress", priority: "high",   assigneeId: "mem-omar",    createdById: hrId, updatedAt: now },
      { projectId: proj1.id, title: "Tests de sécurité & audit",               status: "todo",        priority: "medium", assigneeId: "mem-adam",    createdById: hrId, updatedAt: now },
      { projectId: proj1.id, title: "Intégration notifications push",           status: "todo",        priority: "medium", assigneeId: "mem-youssef", createdById: hrId, updatedAt: now },
      { projectId: proj2.id, title: "Rédaction cahier des charges Hackathon",   status: "in-progress", priority: "high",   assigneeId: "mem-mehdi",   createdById: hrId, updatedAt: now },
      { projectId: proj2.id, title: "Recherche sponsors & partenaires",         status: "in-progress", priority: "urgent", assigneeId: "mem-sarra",   createdById: hrId, updatedAt: now },
      { projectId: proj2.id, title: "Conception identité visuelle Innova'Hack", status: "todo",        priority: "medium", assigneeId: "mem-amira",   createdById: hrId, updatedAt: now },
    ],
  })
  console.log("✅ 8 tasks created")

  // ═══════════════════════════════════════════════════════════
  // 6. EVENTS
  // ═══════════════════════════════════════════════════════════
  const ev1 = await prisma.event.create({
    data: {
      id: "ev-workshop-flutter",
      organizationId,
      title: "Workshop Flutter — Build Your First App",
      description: "Atelier pratique de 3 heures pour apprendre les bases de Flutter et créer une première application mobile fonctionnelle. Ouvert à tous les niveaux.",
      type: "WORKSHOP",
      format: "IN_PERSON",
      visibility: "PUBLIC",
      startAt: new Date("2026-04-25T14:00:00"),
      endAt:   new Date("2026-04-25T17:00:00"),
      location: "ISI — Salle A12, Ariana",
      venue: "Institut Supérieur d'Informatique",
      maxParticipants: 40,
      tags: JSON.stringify(["Flutter", "Mobile", "Workshop", "Débutant"]),
      category: "Tech",
      createdById: hrId,
      updatedAt: now,
    },
  })

  const ev2 = await prisma.event.create({
    data: {
      id: "ev-conf-ia",
      organizationId,
      title: "Conférence — L'IA au Service de l'Éducation en Tunisie",
      description: "Une conférence avec des intervenants de Google Developer Group Tunis et Microsoft Innovation Center. Discussion sur les applications de l'intelligence artificielle dans le système éducatif tunisien.",
      type: "CONFERENCE",
      format: "HYBRID",
      visibility: "PUBLIC",
      startAt: new Date("2026-05-03T09:00:00"),
      endAt:   new Date("2026-05-03T12:30:00"),
      location: "ENIT — Amphithéâtre Principal, Tunis",
      venue: "École Nationale d'Ingénieurs de Tunis",
      maxParticipants: 200,
      tags: JSON.stringify(["IA", "Éducation", "Conférence", "GDG"]),
      category: "Tech",
      createdById: hrId,
      updatedAt: now,
    },
  })

  const ev3 = await prisma.event.create({
    data: {
      id: "ev-hackathon",
      organizationId,
      title: "Innova'Hack 2026 — 48h Hackathon",
      description: "Le hackathon annuel d'Innova'Lab ! 48 heures de développement intensif avec des défis en IA, IoT et FinTech. Prix pour les 3 meilleures équipes. Sponsors : Vermeg, Sofrecom, Talan Tunisia.",
      type: "COMPETITION",
      format: "IN_PERSON",
      visibility: "PUBLIC",
      startAt: new Date("2026-05-16T18:00:00"),
      endAt:   new Date("2026-05-18T18:00:00"),
      location: "Technopôle El Ghazala, Ariana",
      venue: "Centre d'Innovation El Ghazala",
      maxParticipants: 150,
      isApprovalRequired: true,
      tags: JSON.stringify(["Hackathon", "IA", "IoT", "FinTech", "Compétition"]),
      category: "Competition",
      createdById: hrId,
      updatedAt: now,
    },
  })

  const ev4 = await prisma.event.create({
    data: {
      id: "ev-soft-skills",
      organizationId,
      title: "Formation Soft Skills — Prise de Parole en Public",
      description: "Session de formation animée par un coach certifié sur la communication, la prise de parole et la gestion du stress devant un public. Idéal pour les futurs entrepreneurs.",
      type: "TRAINING",
      format: "IN_PERSON",
      visibility: "ORG_ONLY",
      startAt: new Date("2026-04-28T10:00:00"),
      endAt:   new Date("2026-04-28T13:00:00"),
      location: "ISI — Salle B06, Ariana",
      venue: "Institut Supérieur d'Informatique",
      maxParticipants: 30,
      tags: JSON.stringify(["Soft Skills", "Communication", "Formation"]),
      category: "Development",
      createdById: hrId,
      updatedAt: now,
    },
  })

  const ev5 = await prisma.event.create({
    data: {
      id: "ev-networking",
      organizationId,
      title: "Soirée Networking — Rencontre avec les Alumni",
      description: "Un événement convivial pour connecter les membres actuels avec les alumni du club qui travaillent maintenant dans des entreprises comme Vermeg, Sofrecom et Talan. Échanges informels autour d'un coffee break.",
      type: "SOCIAL",
      format: "IN_PERSON",
      visibility: "ORG_ONLY",
      startAt: new Date("2026-05-10T18:30:00"),
      endAt:   new Date("2026-05-10T21:00:00"),
      location: "Café Coworking LaFabrique, Lac 2",
      venue: "LaFabrique Coworking",
      tags: JSON.stringify(["Networking", "Alumni", "Social"]),
      category: "Social",
      createdById: hrId,
      updatedAt: now,
    },
  })
  console.log("✅ 5 events created")

  // Event directors
  await prisma.eventDirector.createMany({
    data: [
      { eventId: ev1.id, userId: "mem-youssef" },
      { eventId: ev2.id, userId: "mem-sarra" },
      { eventId: ev2.id, userId: hrId },
      { eventId: ev3.id, userId: "mem-mehdi" },
      { eventId: ev3.id, userId: "mem-youssef" },
      { eventId: ev4.id, userId: "mem-sarra" },
      { eventId: ev5.id, userId: "mem-mehdi" },
    ],
  })
  console.log("✅ Event directors assigned")

  // ═══════════════════════════════════════════════════════════
  // 7. EVENT REGISTRATIONS
  // ═══════════════════════════════════════════════════════════
  await prisma.eventRegistration.createMany({
    data: [
      // Workshop Flutter — some registered, some approved
      { eventId: ev1.id, userId: "mem-omar",    status: "APPROVED" },
      { eventId: ev1.id, userId: "mem-adam",    status: "APPROVED" },
      { eventId: ev1.id, userId: "mem-amira",   status: "APPROVED" },
      { eventId: ev1.id, userId: "mem-ines",    status: "REGISTERED" },
      { eventId: ev1.id, userId: "mem-rania",   status: "REGISTERED" },

      // Conférence IA
      { eventId: ev2.id, userId: "mem-sarra",   status: "APPROVED" },
      { eventId: ev2.id, userId: "mem-youssef", status: "APPROVED" },
      { eventId: ev2.id, userId: "mem-adam",    status: "APPROVED" },
      { eventId: ev2.id, userId: "mem-mehdi",   status: "APPROVED" },
      { eventId: ev2.id, userId: "mem-amira",   status: "REGISTERED" },

      // Hackathon (approval required)
      { eventId: ev3.id, userId: "mem-youssef", status: "APPROVED" },
      { eventId: ev3.id, userId: "mem-omar",    status: "REGISTERED" },
      { eventId: ev3.id, userId: "mem-adam",    status: "REGISTERED" },
      { eventId: ev3.id, userId: "mem-rania",   status: "REGISTERED" },

      // Soft Skills
      { eventId: ev4.id, userId: "mem-sarra",   status: "APPROVED" },
      { eventId: ev4.id, userId: "mem-ines",    status: "APPROVED" },
      { eventId: ev4.id, userId: "mem-rania",   status: "APPROVED" },
      { eventId: ev4.id, userId: "mem-mehdi",   status: "REGISTERED" },

      // Networking
      { eventId: ev5.id, userId: "mem-youssef", status: "APPROVED" },
      { eventId: ev5.id, userId: "mem-sarra",   status: "APPROVED" },
      { eventId: ev5.id, userId: "mem-amira",   status: "APPROVED" },
      { eventId: ev5.id, userId: "mem-adam",    status: "APPROVED" },
      { eventId: ev5.id, userId: "mem-mehdi",   status: "APPROVED" },
    ],
  })
  console.log("✅ 23 event registrations created")

  // ═══════════════════════════════════════════════════════════
  // 8. TEAM TASKS
  // ═══════════════════════════════════════════════════════════
  const tt1 = await prisma.teamTask.create({
    data: {
      teamId: teamDev.id,
      title: "Développer la page d'accueil de l'app InnovaConnect",
      description: "Créer le dashboard principal avec les prochains événements, les notifications et le profil utilisateur.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      createdById: hrId,
      dueDate: new Date("2026-05-01"),
      updatedAt: now,
    },
  })

  const tt2 = await prisma.teamTask.create({
    data: {
      teamId: teamComm.id,
      title: "Préparer les visuels pour Innova'Hack 2026",
      description: "Créer les affiches, stories Instagram, bannières Facebook et posts LinkedIn pour la campagne de communication du hackathon.",
      status: "TODO",
      priority: "URGENT",
      createdById: hrId,
      dueDate: new Date("2026-04-30"),
      updatedAt: now,
    },
  })

  const tt3 = await prisma.teamTask.create({
    data: {
      teamId: teamEvent.id,
      title: "Réserver la salle et le matériel pour le Workshop Flutter",
      description: "Contacter l'administration de l'ISI pour réserver la salle A12, vérifier le vidéoprojecteur et préparer les prises électriques pour les laptops.",
      status: "COMPLETED",
      priority: "HIGH",
      createdById: hrId,
      dueDate: new Date("2026-04-23"),
      updatedAt: now,
    },
  })

  // Task assignments
  await prisma.teamTaskAssignment.createMany({
    data: [
      { taskId: tt1.id, teamMemberId: "mem-youssef", userId: "mem-youssef", status: "IN_PROGRESS", approvalStatus: "PENDING", acceptanceStatus: "ACCEPTED", updatedAt: now },
      { taskId: tt1.id, teamMemberId: "mem-omar",    userId: "mem-omar",    status: "ASSIGNED",    approvalStatus: "PENDING", acceptanceStatus: "ACCEPTED", updatedAt: now },
      { taskId: tt2.id, teamMemberId: "mem-amira",   userId: "mem-amira",   status: "ASSIGNED",    approvalStatus: "PENDING", acceptanceStatus: "ACCEPTED", updatedAt: now },
      { taskId: tt2.id, teamMemberId: "mem-rania",   userId: "mem-rania",   status: "ASSIGNED",    approvalStatus: "PENDING", acceptanceStatus: "PENDING",  updatedAt: now },
      { taskId: tt3.id, teamMemberId: "mem-mehdi",   userId: "mem-mehdi",   status: "SUBMITTED",   approvalStatus: "APPROVED", acceptanceStatus: "ACCEPTED", approvedBy: hrId, approvedAt: now, creditsAwarded: 10, updatedAt: now },
    ],
  })
  console.log("✅ Team tasks & assignments created")

  // ═══════════════════════════════════════════════════════════
  // 9. MEMBER CREDITS
  // ═══════════════════════════════════════════════════════════
  await prisma.memberCredit.createMany({
    data: [
      { userId: "mem-youssef", organizationId, totalCredits: 85, tasksCompleted: 12, tasksApproved: 11, tasksRejected: 1, approvalRate: 91.7, updatedAt: now },
      { userId: "mem-sarra",   organizationId, totalCredits: 72, tasksCompleted: 9,  tasksApproved: 9,  tasksRejected: 0, approvalRate: 100,  updatedAt: now },
      { userId: "mem-amira",   organizationId, totalCredits: 65, tasksCompleted: 8,  tasksApproved: 7,  tasksRejected: 1, approvalRate: 87.5, updatedAt: now },
      { userId: "mem-mehdi",   organizationId, totalCredits: 60, tasksCompleted: 7,  tasksApproved: 7,  tasksRejected: 0, approvalRate: 100,  updatedAt: now },
      { userId: "mem-omar",    organizationId, totalCredits: 45, tasksCompleted: 5,  tasksApproved: 5,  tasksRejected: 0, approvalRate: 100,  updatedAt: now },
      { userId: "mem-ines",    organizationId, totalCredits: 40, tasksCompleted: 5,  tasksApproved: 4,  tasksRejected: 1, approvalRate: 80,   updatedAt: now },
      { userId: "mem-rania",   organizationId, totalCredits: 35, tasksCompleted: 4,  tasksApproved: 4,  tasksRejected: 0, approvalRate: 100,  updatedAt: now },
      { userId: "mem-adam",    organizationId, totalCredits: 30, tasksCompleted: 4,  tasksApproved: 3,  tasksRejected: 1, approvalRate: 75,   updatedAt: now },
    ],
  })
  console.log("✅ Member credits created")

  // ═══════════════════════════════════════════════════════════
  // 10. CONTACTS
  // ═══════════════════════════════════════════════════════════
  await prisma.contact.createMany({
    data: [
      { organizationId, name: "Ahmed Mansouri",  email: "ahmed.mansouri@vermeg.com",    organization: "Vermeg",           role: "HR Manager",          howMet: "Conférence ENIT 2025",        addedById: hrId, updatedAt: now },
      { organizationId, name: "Leila Khemiri",   email: "leila.khemiri@sofrecom.com",   organization: "Sofrecom Tunisia", role: "Campus Relations",    howMet: "Forum de recrutement INSAT",  addedById: hrId, updatedAt: now },
      { organizationId, name: "Karim Ben Ammar", email: "karim.benammar@talan.com",     organization: "Talan Tunisia",    role: "Innovation Lead",     howMet: "Hackathon JCI 2025",          addedById: hrId, updatedAt: now },
      { organizationId, name: "Nadia Ferchichi", email: "nadia@gdgtunis.dev",           organization: "GDG Tunis",        role: "Community Organizer", howMet: "DevFest Tunis 2025",          addedById: hrId, updatedAt: now },
    ],
  })
  console.log("✅ 4 contacts created")

  // ═══════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(50))
  console.log("✨ Seeding complete!")
  console.log("═".repeat(50))
  console.log("\n📋 Login credentials:")
  console.log("   HR:       anasanas@InnovaLab.com / admin123")
  console.log("   Members:  sarra.hamdi@innovalab.tn    / password123")
  console.log("             youssef.trabelsi@innovalab.tn / password123")
  console.log("             (all members use password123)")
  console.log("")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
