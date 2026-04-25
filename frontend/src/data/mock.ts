import type { Anuncio, Carrera, Examen, Materia, Nota, Notificacion, Recurso, Tarea, User } from "@/types";

// ====== USUARIOS DE PRUEBA ======
export const usuariosMock: User[] = [
  { id: 1, name: "Pablo Méndez", email: "admin@lumen.edu", role: "admin", active: true },
  { id: 2, name: "Dra. Ruth Salvatierra", email: "ruth.s@lumen.edu", role: "docente", active: true },
  { id: 3, name: "Pr. Daniel Aguirre", email: "daniel.a@lumen.edu", role: "docente", active: true },
  { id: 4, name: "Marcos Beltrán", email: "marcos.b@lumen.edu", role: "estudiante", active: true },
  { id: 5, name: "Lucía Ferrer", email: "lucia.f@lumen.edu", role: "estudiante", active: true },
  { id: 6, name: "Esteban Rivas", email: "esteban.r@lumen.edu", role: "estudiante", active: true },
  { id: 7, name: "Ana Caballero", email: "ana.c@lumen.edu", role: "estudiante", active: true },
];

export const carrerasMock: Carrera[] = [
  { id: 1, name: "Licenciatura en Teología", description: "Formación bíblica integral", active: true, totalMaterias: 32, totalEstudiantes: 84 },
  { id: 2, name: "Tecnicatura en Ministerio Pastoral", description: "Formación práctica para el liderazgo", active: true, totalMaterias: 18, totalEstudiantes: 46 },
  { id: 3, name: "Diplomatura en Estudios Bíblicos", description: "Curso introductorio de un año", active: true, totalMaterias: 8, totalEstudiantes: 27 },
];

const docente1 = usuariosMock[1]; // Ruth
const docente2 = usuariosMock[2]; // Daniel

export const materiasMock: Materia[] = [
  {
    id: 1, name: "Antiguo Testamento I", code: "AT-101", description: "Pentateuco e historia del pueblo de Israel.",
    carrera_id: 1, carrera: "Lic. en Teología", periodo_id: 1, docente_id: 2, docente: docente1, active: true,
    color: "from-emerald-700 to-emerald-900", totalEstudiantes: 24, progreso: 68, proximaEntrega: "2026-04-25",
  },
  {
    id: 2, name: "Hermenéutica Bíblica", code: "HB-201", description: "Principios de interpretación de las Escrituras.",
    carrera_id: 1, carrera: "Lic. en Teología", periodo_id: 1, docente_id: 3, docente: docente2, active: true,
    color: "from-orange-600 to-rose-700", totalEstudiantes: 19, progreso: 42, proximaEntrega: "2026-04-22",
  },
  {
    id: 3, name: "Historia de la Iglesia", code: "HI-110", description: "Desde la era apostólica hasta la Reforma.",
    carrera_id: 1, carrera: "Lic. en Teología", periodo_id: 1, docente_id: 2, docente: docente1, active: true,
    color: "from-blue-700 to-indigo-900", totalEstudiantes: 22, progreso: 80, proximaEntrega: "2026-05-02",
  },
  {
    id: 4, name: "Homilética Práctica", code: "HP-310", description: "Arte de la predicación expositiva.",
    carrera_id: 2, carrera: "Tec. Ministerio Pastoral", periodo_id: 1, docente_id: 3, docente: docente2, active: true,
    color: "from-amber-700 to-orange-900", totalEstudiantes: 16, progreso: 55, proximaEntrega: "2026-04-30",
  },
  {
    id: 5, name: "Griego Bíblico I", code: "GR-150", description: "Introducción al griego del Nuevo Testamento.",
    carrera_id: 1, carrera: "Lic. en Teología", periodo_id: 1, docente_id: 2, docente: docente1, active: true,
    color: "from-teal-700 to-emerald-900", totalEstudiantes: 14, progreso: 35,
  },
  {
    id: 6, name: "Teología Sistemática", code: "TS-220", description: "Estudio ordenado de las doctrinas cristianas.",
    carrera_id: 1, carrera: "Lic. en Teología", periodo_id: 1, docente_id: 3, docente: docente2, active: true,
    color: "from-stone-700 to-stone-900", totalEstudiantes: 21, progreso: 60, proximaEntrega: "2026-05-08",
  },
];

export const anunciosMock: Anuncio[] = [
  { id: 1, materia_id: 1, autor_id: 2, autor: docente1, title: "Bienvenidos al curso", body: "Comenzamos esta semana con el estudio del libro de Génesis. Por favor, lean los primeros 3 capítulos antes del miércoles.", published_at: "2026-04-15T10:00:00Z" },
  { id: 2, materia_id: 1, autor_id: 2, autor: docente1, title: "Cambio de aula — viernes", body: "La clase del viernes se traslada al aula 204 por mantenimiento.", published_at: "2026-04-18T14:30:00Z" },
  { id: 3, materia_id: 1, autor_id: 2, autor: docente1, title: "Material complementario disponible", body: "Subí un PDF con un mapa del Antiguo Cercano Oriente que les va a servir para el contexto.", published_at: "2026-04-19T09:15:00Z" },
];

export const recursosMock: Recurso[] = [
  { id: 1, materia_id: 1, title: "Programa de la materia 2026", description: "Cronograma completo del semestre.", type: "archivo", file_path: "/files/programa.pdf", unidad: "Introducción", orden: 1 },
  { id: 2, materia_id: 1, title: "Mapa del Antiguo Cercano Oriente", type: "archivo", file_path: "/files/mapa.pdf", unidad: "Unidad 1: Génesis", orden: 1 },
  { id: 3, materia_id: 1, title: "Documental: Arqueología Bíblica", type: "video", url: "https://youtube.com/...", unidad: "Unidad 1: Génesis", orden: 2 },
  { id: 4, materia_id: 1, title: "Comentario sobre el Pentateuco", type: "link", url: "https://biblegateway.com/...", unidad: "Unidad 2: Éxodo", orden: 1 },
];

export const tareasMock: Tarea[] = [
  { id: 1, materia_id: 1, title: "Ensayo sobre la Creación", description: "Análisis comparativo de Génesis 1 y 2.", fecha_limite: "2026-04-25T23:59:00Z", puntaje_maximo: 10, permite_entrega_tardia: true, totalEntregas: 18, totalEsperadas: 24, miEntrega: null },
  { id: 2, materia_id: 1, title: "Resumen Capítulos 1-5 Génesis", description: "Síntesis personal.", fecha_limite: "2026-04-18T23:59:00Z", puntaje_maximo: 10, permite_entrega_tardia: false, totalEntregas: 22, totalEsperadas: 24, miEntrega: { id: 1, tarea_id: 2, estudiante_id: 4, nota: 8.5, calificado_at: "2026-04-19T10:00:00Z", entregado_at: "2026-04-17T22:00:00Z" } },
  { id: 3, materia_id: 1, title: "Mapa conceptual Patriarcas", description: "Diagrama de relaciones.", fecha_limite: "2026-05-02T23:59:00Z", puntaje_maximo: 10, permite_entrega_tardia: true, totalEntregas: 0, totalEsperadas: 24, miEntrega: null },
];

export const examenesMock: Examen[] = [
  { id: 1, materia_id: 1, title: "Parcial 1 — Pentateuco", descripcion: "Examen escrito sobre los primeros 5 libros.", tipo: "examen", fecha_apertura: "2026-04-28T08:00:00Z", fecha_cierre: "2026-04-28T20:00:00Z", tiempo_limite_minutos: 90, intentos_permitidos: 1, totalPreguntas: 20, miIntento: null },
  { id: 2, materia_id: 1, title: "Control de lectura — Génesis 1-11", descripcion: "Cuestionario rápido.", tipo: "control_lectura", fecha_apertura: "2026-04-15T00:00:00Z", fecha_cierre: "2026-04-22T23:59:00Z", tiempo_limite_minutos: 30, intentos_permitidos: 2, totalPreguntas: 10, miIntento: { estado: "calificado", nota: 9 } },
];

export const notasMock: Nota[] = [
  { id: 1, materia_id: 1, estudiante_id: 4, estudiante: usuariosMock[3], tipo: "tarea", descripcion: "Resumen Capítulos 1-5 Génesis", nota: 8.5, puntaje_maximo: 10, fecha: "2026-04-19" },
  { id: 2, materia_id: 1, estudiante_id: 4, estudiante: usuariosMock[3], tipo: "control_lectura", descripcion: "Control Génesis 1-11", nota: 9, puntaje_maximo: 10, fecha: "2026-04-20" },
  { id: 3, materia_id: 1, estudiante_id: 5, estudiante: usuariosMock[4], tipo: "tarea", descripcion: "Resumen Capítulos 1-5 Génesis", nota: 7, puntaje_maximo: 10, fecha: "2026-04-19" },
  { id: 4, materia_id: 1, estudiante_id: 5, estudiante: usuariosMock[4], tipo: "control_lectura", descripcion: "Control Génesis 1-11", nota: 8.5, puntaje_maximo: 10, fecha: "2026-04-20" },
  { id: 5, materia_id: 1, estudiante_id: 6, estudiante: usuariosMock[5], tipo: "tarea", descripcion: "Resumen Capítulos 1-5 Génesis", nota: 9, puntaje_maximo: 10, fecha: "2026-04-19" },
  { id: 6, materia_id: 1, estudiante_id: 6, estudiante: usuariosMock[5], tipo: "control_lectura", descripcion: "Control Génesis 1-11", nota: 7.5, puntaje_maximo: 10, fecha: "2026-04-20" },
];

export const notificacionesMock: Notificacion[] = [
  { id: 1, user_id: 4, tipo: "tarea_calificada", titulo: "Tu tarea fue calificada", body: "Resumen Capítulos 1-5 Génesis: 8.5/10", url_destino: "/materias/1/tareas/2", leida_at: null, created_at: "2026-04-19T10:00:00Z" },
  { id: 2, user_id: 4, tipo: "anuncio", titulo: "Nuevo anuncio en Antiguo Testamento I", body: "Material complementario disponible", url_destino: "/materias/1/anuncios", leida_at: null, created_at: "2026-04-19T09:15:00Z" },
  { id: 3, user_id: 4, tipo: "examen", titulo: "Examen disponible pronto", body: "Parcial 1 — Pentateuco abre el 28/04", url_destino: "/materias/1/examenes", leida_at: "2026-04-18T12:00:00Z", created_at: "2026-04-18T08:00:00Z" },
];

export const planCursoMock = {
  id: 1, materia_id: 1,
  content: "Esta materia ofrece una introducción al Antiguo Testamento, con énfasis en el Pentateuco y la historia temprana del pueblo de Israel. Se examinarán los textos en su contexto histórico, literario y teológico.",
  objetivos: "1. Comprender la estructura y propósito del Pentateuco.\n2. Identificar los temas teológicos principales del AT.\n3. Aplicar principios hermenéuticos básicos.\n4. Desarrollar una comprensión integral del relato bíblico.",
  bibliografia: "• La Santa Biblia (RVR 1960 / NVI)\n• Wenham, Gordon J. — Génesis (Word Biblical Commentary)\n• Alexander, T. Desmond — From Paradise to the Promised Land\n• Childs, Brevard — Introduction to the Old Testament as Scripture",
  updated_at: "2026-04-10T15:00:00Z",
};
