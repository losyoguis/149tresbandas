  (() => {
    'use strict';

    const DESIGN_W = 1000;
    const DESIGN_H = 560;
    const R = 12;
    const RAIL = 42;
    const LEFT = RAIL;
    const RIGHT = DESIGN_W - RAIL;
    const TOP = RAIL;
    const BOTTOM = DESIGN_H - RAIL;
    const FRICTION = 0.99505; // v175: paño algo más vivo sin perder control en jugadas normales.
    const LONG_SHOT_FRICTION = 0.99635; // v175: conserva más recorrido cuando la jugada exige 3+ bandas largas.
    const STOP_SPEED = 0.018; // evita microvibraciones al final del tiro.
    const MAX_POWER = 22.2; // fuerza equivalente al 100% visible.
    const MAX_LONG_POWER = 34.8; // v175: reserva interna para tiros largos hasta 160%.
    const MIN_POWER = 0.26;
    const NORMAL_MAX_POWER_PCT = 100;
    const SHORT_MAX_POWER_PCT = 120;
    const EXTENDED_MAX_POWER_PCT = 160;
    const LONG_ROUTE_THRESHOLD = DESIGN_W * 1.55;
    const VERY_LONG_ROUTE_THRESHOLD = DESIGN_W * 2.15;
    const BALL_RESTITUTION = 0.965; // colisiones controladas, cercanas a mesa real.
    const RAIL_RESTITUTION = 0.932; // rebote normal de banda.
    const LONG_RAIL_RESTITUTION = 0.958; // v175: rebote más vivo solo en tiros largos.
    const RAIL_TANGENT_FRICTION = 0.982; // la banda también quita velocidad lateral.
    const LONG_RAIL_TANGENT_FRICTION = 0.992; // v175: menos pérdida tangencial en recorridos largos.
    const SPIN_THROW = 0.098; // efecto lateral fino, no sobreactuado.
    const LONG_SPIN_THROW = 0.122; // v175: efecto sostenido en tiros largos.
    const NORMAL_RAIL_SPIN_DECAY = 0.86;
    const LONG_RAIL_SPIN_DECAY = 0.92;
    const NORMAL_TARGET_SPIN_DECAY = 0.72;
    const LONG_TARGET_SPIN_DECAY = 0.80;
    const BALL_THROW = 0.016; // transferencia lateral por efecto más suave.
    const FOLLOW_DRAW_TRANSFER = 0.064; // corrido/retroceso más controlado.
    // Suaviza la bola receptora del primer impacto: evita que salga disparada
    // de forma sobreactuada, pero mantiene lectura física para los choques.
    const FIRST_OBJECT_TRANSFER_SCALE = 0.76; // v175: bola objetiva no sale disparada.
    const FIRST_OBJECT_MAX_SPEED = 8.4; // v175: límite físico visual para la primera bola.
    const FIRST_OBJECT_POWER_RATIO = 0.53; // v175: transferencia proporcional a la potencia real.
    const PHYSICS_MAX_STEP = R * 0.22; // v175: más subpasos para evitar saltos en choques rápidos.
    const BALL_SURFACE_FRICTION = 0.991;
    // v182 profesional: guía principal persistente + sincronización exacta del efecto
    // durante la preparación y durante la tacada; ya no se borra al atacar.
    // La potencia puede ser larga, pero el paño, las bandas y el efecto mantienen física estable.
    const PROFESSIONAL_PHYSICS_VERSION = 'v212_movil_controles_finales_diamantes_visibles';
    const PROFESSIONAL_TABLE_FRICTION = 0.99532;
    const PROFESSIONAL_OBJECT_FRICTION = 0.99472;
    const CUE_SWERVE_STRENGTH = 0.00072; // curvatura sutil por efecto lateral antes/después de bandas.
    const SPIN_CLOTH_DECAY = 0.9984; // el efecto no desaparece de golpe; se va muriendo por el paño.
    const RAIL_INCIDENT_LOSS = 0.052; // llegada plana a banda pierde más energía.
    const RAIL_SPIN_OPEN_CLOSE = 0.118; // apertura/cierre por efecto a favor o contrario.
    const COLLISION_THROW_SCALE = 0.028; // throw por fricción entre bolas.
    const DEMO_COUNTS_AS_SCORE = false;
    const VIDEO_ANALYSIS_026_060 = {
      "001": {
            "posicion": "0:33",
            "recorrido": "1:13"
      },
      "002": {
            "posicion": "1:15",
            "recorrido": "2:14"
      },
      "003": {
            "posicion": "2:16",
            "recorrido": "3:13"
      },
      "004": {
            "posicion": "3:15",
            "recorrido": "4:19"
      },
      "005": {
            "posicion": "4:21",
            "recorrido": "5:15"
      },
      "006": {
            "posicion": "5:17",
            "recorrido": "6:09"
      },
      "007": {
            "posicion": "6:11",
            "recorrido": "7:22"
      },
      "008": {
            "posicion": "7:24",
            "recorrido": "8:14"
      },
      "009": {
            "posicion": "8:16",
            "recorrido": "9:11"
      },
      "010": {
            "posicion": "9:13",
            "recorrido": "10:02"
      },
      "011": {
            "posicion": "10:04",
            "recorrido": "10:58"
      },
      "012": {
            "posicion": "11:00",
            "recorrido": "11:51"
      },
      "013": {
            "posicion": "11:53",
            "recorrido": "12:36"
      },
      "014": {
            "posicion": "12:38",
            "recorrido": "13:27"
      },
      "015": {
            "posicion": "13:29",
            "recorrido": "14:22"
      },
      "016": {
            "posicion": "14:24",
            "recorrido": "15:18"
      },
      "017": {
            "posicion": "15:20",
            "recorrido": "16:08"
      },
      "018": {
            "posicion": "16:10",
            "recorrido": "16:52"
      },
      "019": {
            "posicion": "16:54",
            "recorrido": "17:41"
      },
      "020": {
            "posicion": "17:43",
            "recorrido": "18:30"
      },
      "021": {
            "posicion": "18:32",
            "recorrido": "19:19"
      },
      "022": {
            "posicion": "19:21",
            "recorrido": "20:24"
      },
      "023": {
            "posicion": "20:26",
            "recorrido": "21:26"
      },
      "024": {
            "posicion": "21:28",
            "recorrido": "22:24"
      },
      "025": {
            "posicion": "22:26",
            "recorrido": "23:16"
      },
      "026": {
            "posicion": "23:18",
            "recorrido": "24:12"
      },
      "027": {
            "posicion": "24:14",
            "recorrido": "25:11"
      },
      "028": {
            "posicion": "25:13",
            "recorrido": "26:15"
      },
      "029": {
            "posicion": "26:17",
            "recorrido": "27:06"
      },
      "030": {
            "posicion": "27:08",
            "recorrido": "28:06"
      },
      "031": {
            "posicion": "28:08",
            "recorrido": "29:02"
      },
      "032": {
            "posicion": "29:04",
            "recorrido": "30:05"
      },
      "033": {
            "posicion": "30:07",
            "recorrido": "31:19"
      },
      "034": {
            "posicion": "31:21",
            "recorrido": "32:18"
      },
      "035": {
            "posicion": "32:20",
            "recorrido": "33:19"
      },
      "036": {
            "posicion": "33:21",
            "recorrido": "34:33"
      },
      "037": {
            "posicion": "34:35",
            "recorrido": "35:35"
      },
      "038": {
            "posicion": "35:37",
            "recorrido": "36:35"
      },
      "039": {
            "posicion": "36:37",
            "recorrido": "37:32"
      },
      "040": {
            "posicion": "37:34",
            "recorrido": "38:31"
      },
      "041": {
            "posicion": "38:33",
            "recorrido": "39:23"
      },
      "042": {
            "posicion": "39:25",
            "recorrido": "40:17"
      },
      "043": {
            "posicion": "40:19",
            "recorrido": "41:04"
      },
      "044": {
            "posicion": "41:06",
            "recorrido": "41:53"
      },
      "045": {
            "posicion": "41:55",
            "recorrido": "43:02"
      },
      "046": {
            "posicion": "43:04",
            "recorrido": "43:30"
      },
      "047": {
            "posicion": "43:32",
            "recorrido": "44:15"
      },
      "048": {
            "posicion": "44:17",
            "recorrido": "45:09"
      },
      "049": {
            "posicion": "45:11",
            "recorrido": "45:50"
      },
      "050": {
            "posicion": "45:52",
            "recorrido": "46:27"
      },
      "051": {
            "posicion": "46:29",
            "recorrido": "47:25"
      },
      "052": {
            "posicion": "47:27",
            "recorrido": "48:04"
      },
      "053": {
            "posicion": "48:06",
            "recorrido": "48:48"
      },
      "054": {
            "posicion": "48:50",
            "recorrido": "49:25"
      },
      "055": {
            "posicion": "49:27",
            "recorrido": "50:38"
      },
      "056": {
            "posicion": "50:40",
            "recorrido": "51:10"
      },
      "057": {
            "posicion": "51:12",
            "recorrido": "52:04"
      },
      "058": {
            "posicion": "52:06",
            "recorrido": "53:08"
      },
      "059": {
            "posicion": "53:10",
            "recorrido": "54:07"
      },
      "060": {
            "posicion": "54:09",
            "recorrido": "54:47"
      },
      "061": {
            "posicion": "54:49",
            "recorrido": "55:25"
      },
      "062": {
            "posicion": "55:27",
            "recorrido": "56:14"
      },
      "063": {
            "posicion": "56:16",
            "recorrido": "57:03"
      },
      "064": {
            "posicion": "57:05",
            "recorrido": "57:48"
      },
      "065": {
            "posicion": "57:50",
            "recorrido": "58:43"
      },
      "066": {
            "posicion": "58:45",
            "recorrido": "59:26"
      },
      "067": {
            "posicion": "59:28",
            "recorrido": "1:00:13"
      },
      "068": {
            "posicion": "1:00:15",
            "recorrido": "1:01:08"
      },
      "069": {
            "posicion": "1:01:10",
            "recorrido": "1:01:45"
      },
      "070": {
            "posicion": "1:01:47",
            "recorrido": "1:02:30"
      },
      "071": {
            "posicion": "1:02:32",
            "recorrido": "1:03:11"
      },
      "072": {
            "posicion": "1:03:13",
            "recorrido": "1:03:51"
      },
      "073": {
            "posicion": "1:03:53",
            "recorrido": "1:04:26"
      },
      "074": {
            "posicion": "1:04:28",
            "recorrido": "1:05:07"
      },
      "075": {
            "posicion": "1:05:09",
            "recorrido": "1:05:35"
      },
      "076": {
            "posicion": "1:05:37",
            "recorrido": "1:06:16"
      },
      "077": {
            "posicion": "1:06:18",
            "recorrido": "1:06:58"
      },
      "078": {
            "posicion": "1:07:00",
            "recorrido": "1:07:37"
      },
      "079": {
            "posicion": "1:07:39",
            "recorrido": "1:08:15"
      },
      "080": {
            "posicion": "1:08:17",
            "recorrido": "1:08:25"
      },
      "081": {
            "posicion": "1:08:22",
            "recorrido": "1:08:50"
      },
      "082": {
            "posicion": "1:08:52",
            "recorrido": "1:09:45"
      },
      "083": {
            "posicion": "1:09:47",
            "recorrido": "1:10:43"
      },
      "084": {
            "posicion": "1:10:45",
            "recorrido": "1:11:32"
      },
      "085": {
            "posicion": "1:11:34",
            "recorrido": "1:12:12"
      },
      "086": {
            "posicion": "1:12:14",
            "recorrido": "1:13:00"
      },
      "087": {
            "posicion": "1:13:02",
            "recorrido": "1:13:39"
      },
      "088": {
            "posicion": "1:13:41",
            "recorrido": "1:14:27"
      },
      "089": {
            "posicion": "1:14:29",
            "recorrido": "1:15:13"
      },
      "090": {
            "posicion": "1:15:15",
            "recorrido": "1:16:07"
      },
      "091": {
            "posicion": "1:16:09",
            "recorrido": "1:17:00"
      },
      "092": {
            "posicion": "1:17:02",
            "recorrido": "1:17:50"
      },
      "093": {
            "posicion": "1:17:52",
            "recorrido": "1:18:36"
      },
      "094": {
            "posicion": "1:18:38",
            "recorrido": "1:19:13"
      },
      "095": {
            "posicion": "1:19:15",
            "recorrido": "1:19:50"
      },
      "096": {
            "posicion": "1:19:52",
            "recorrido": "1:20:26"
      },
      "097": {
            "posicion": "1:20:28",
            "recorrido": "1:21:01"
      },
      "098": {
            "posicion": "1:21:03",
            "recorrido": "1:21:38"
      },
      "099": {
            "posicion": "1:21:40",
            "recorrido": "1:22:10"
      },
      "100": {
            "posicion": "1:22:12",
            "recorrido": "1:22:41"
      },
      "101": {
            "posicion": "1:22:43",
            "recorrido": "1:23:20"
      },
      "102": {
            "posicion": "1:23:22",
            "recorrido": "1:23:53"
      },
      "103": {
            "posicion": "1:23:55",
            "recorrido": "1:24:32"
      },
      "104": {
            "posicion": "1:24:34",
            "recorrido": "1:25:03"
      },
      "105": {
            "posicion": "1:25:05",
            "recorrido": "1:25:38"
      },
      "106": {
            "posicion": "1:25:40",
            "recorrido": "1:26:16"
      },
      "107": {
            "posicion": "1:26:18",
            "recorrido": "1:26:58"
      },
      "108": {
            "posicion": "1:27:00",
            "recorrido": "1:27:46"
      },
      "109": {
            "posicion": "1:27:48",
            "recorrido": "1:28:45"
      },
      "110": {
            "posicion": "1:28:47",
            "recorrido": "1:30:58"
      },
      "111": {
            "posicion": "1:31:00",
            "recorrido": "1:31:46"
      },
      "112": {
            "posicion": "1:31:48",
            "recorrido": "1:32:34"
      },
      "113": {
            "posicion": "1:32:36",
            "recorrido": "1:33:22"
      },
      "114": {
            "posicion": "1:33:24",
            "recorrido": "1:34:10"
      },
      "115": {
            "posicion": "1:34:12",
            "recorrido": "1:34:58"
      },
      "116": {
            "posicion": "1:35:00",
            "recorrido": "1:35:43"
      },
      "117": {
            "posicion": "1:35:45",
            "recorrido": "1:36:28"
      },
      "118": {
            "posicion": "1:36:30",
            "recorrido": "1:37:13"
      },
      "119": {
            "posicion": "1:37:15",
            "recorrido": "1:37:58"
      },
      "120": {
            "posicion": "1:38:00",
            "recorrido": "1:38:43"
      },
      "121": {
            "posicion": "1:38:45",
            "recorrido": "1:39:28"
      },
      "122": {
            "posicion": "1:39:30",
            "recorrido": "1:40:13"
      },
      "123": {
            "posicion": "1:40:15",
            "recorrido": "1:40:58"
      },
      "124": {
            "posicion": "1:41:00",
            "recorrido": "1:41:58"
      },
      "125": {
            "posicion": "1:42:00",
            "recorrido": "1:42:58"
      },
      "126": {
            "posicion": "1:43:00",
            "recorrido": "1:43:58"
      },
      "127": {
            "posicion": "1:44:00",
            "recorrido": "1:44:58"
      },
      "128": {
            "posicion": "1:45:00",
            "recorrido": "1:45:46"
      },
      "129": {
            "posicion": "1:45:48",
            "recorrido": "1:46:34"
      },
      "130": {
            "posicion": "1:46:36",
            "recorrido": "1:47:22"
      },
      "131": {
            "posicion": "1:47:24",
            "recorrido": "1:48:10"
      },
      "132": {
            "posicion": "1:48:12",
            "recorrido": "1:48:58"
      },
      "133": {
            "posicion": "1:49:00",
            "recorrido": "1:49:58"
      },
      "134": {
            "posicion": "1:50:00",
            "recorrido": "1:50:58"
      },
      "135": {
            "posicion": "1:51:00",
            "recorrido": "1:51:58"
      },
      "136": {
            "posicion": "1:52:00",
            "recorrido": "1:52:58"
      },
      "137": {
            "posicion": "1:53:00",
            "recorrido": "1:53:58"
      },
      "138": {
            "posicion": "1:54:00",
            "recorrido": "1:54:58"
      },
      "139": {
            "posicion": "1:55:00",
            "recorrido": "1:55:58"
      },
      "140": {
            "posicion": "1:56:00",
            "recorrido": "1:56:43"
      },
      "141": {
            "posicion": "1:56:45",
            "recorrido": "1:57:28"
      },
      "142": {
            "posicion": "1:57:30",
            "recorrido": "1:58:13"
      },
      "143": {
            "posicion": "1:58:15",
            "recorrido": "1:58:58"
      },
      "144": {
            "posicion": "1:59:00",
            "recorrido": "1:59:58"
      },
      "145": {
            "posicion": "2:00:00",
            "recorrido": "2:00:58"
      },
      "146": {
            "posicion": "2:01:00",
            "recorrido": "2:01:58"
      },
      "147": {
            "posicion": "2:02:00",
            "recorrido": "2:02:58"
      },
      "148": {
            "posicion": "2:03:00",
            "recorrido": "2:03:58"
      },
      "149": {
            "posicion": "2:04:00",
            "recorrido": "2:04:25"
      }
};

    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    const table = document.getElementById('table');
    const scoreEl = document.getElementById('score');
    const attemptsEl = document.getElementById('attempts');
    const cushionsEl = document.getElementById('cushions');
    const guideEl = document.getElementById('guide');
    const shootBtn = document.getElementById('shootBtn');
    const fullscreenTableBtn = document.getElementById('fullscreenTableBtn');
    const tvRemoteHint = document.getElementById('tvRemoteHint');
    const tableShell = table ? table.closest('.table-shell') : null;
    const replayBtn = document.getElementById('replayBtn');
    const motionReplayBtn = document.getElementById('motionReplayBtn');
    const demoBtn = document.getElementById('demoBtn');
    const tableActionSelect = document.getElementById('tableActionSelect');
    const runTableActionBtn = document.getElementById('runTableActionBtn');
    const practiceActionSelect = document.getElementById('practiceActionSelect');
    const runPracticeActionBtn = document.getElementById('runPracticeActionBtn');
    const soundBtn = document.getElementById('soundBtn');
    const placeBtn = document.getElementById('placeBtn');
    const videoBtn = document.getElementById('videoBtn');
    const instructionsBtn = document.getElementById('instructionsBtn');
    const instructionsModal = document.getElementById('instructionsModal');
    const closeInstructionsBtn = document.getElementById('closeInstructionsBtn');
    const closeInstructionsActionBtn = document.getElementById('closeInstructionsActionBtn');
    const techniqueBtn = document.getElementById('techniqueBtn');
    const practicePanel = document.getElementById('practicePanel');
    const practiceSelect = document.getElementById('practiceSelect');
    const loadPracticeBtn = document.getElementById('loadPracticeBtn');
    const squareCaromBtn = document.getElementById('squareCaromBtn');
    const easyAlignBtn = document.getElementById('easyAlignBtn');
    const alignPanel = document.getElementById('alignPanel');
    const alignGuideBtn = document.getElementById('alignGuideBtn');
    const alignReadout = document.getElementById('alignReadout');
    const prevPracticeBtn = document.getElementById('prevPracticeBtn');
    const nextPracticeBtn = document.getElementById('nextPracticeBtn');
    const exitPracticeBtn = document.getElementById('exitPracticeBtn');
    const practiceInfo = document.getElementById('practiceInfo');
    const videoModal = document.getElementById('videoModal');
    const videoTitle = document.getElementById('videoTitle');
    const videoFrame = document.getElementById('videoFrame');
    const closeVideoBtn = document.getElementById('closeVideoBtn');
    const closeVideoXBtn = document.getElementById('closeVideoXBtn');
    const practiceImagesBtn = document.getElementById('practiceImagesBtn');
    const practiceImagesModal = document.getElementById('practiceImagesModal');
    const practiceImagesGrid = document.getElementById('practiceImagesGrid');
    const practiceImagesNote = document.getElementById('practiceImagesNote');
    const practiceImagesTitle = document.getElementById('practiceImagesTitle');
    const videoImagesGrid = document.getElementById('videoImagesGrid');
    const videoImagesNote = document.getElementById('videoImagesNote');
    const videoImagesTitle = document.getElementById('videoImagesTitle');
    const videoObservation = document.getElementById('videoObservation');
    const videoPrevShotBtn = document.getElementById('videoPrevShotBtn');
    const videoNextShotBtn = document.getElementById('videoNextShotBtn');
    const videoModalStatus = document.getElementById('videoModalStatus');
    const closePracticeImagesBtn = document.getElementById('closePracticeImagesBtn');
    const randomBtn = document.getElementById('randomBtn');
    const resetBtn = document.getElementById('resetBtn');
    const guideBtn = document.getElementById('guideBtn');
    const recommendationLine = document.getElementById('recommendationLine');
    const referenceGuideImage = document.getElementById('referenceGuideImage');
    const masterGuideLine = document.getElementById('masterGuideLine');
    const recommendationEvents = document.getElementById('recommendationEvents');
    const practiceMarkers = document.getElementById('practiceMarkers');
    const aimPreview = document.getElementById('aimPreview');
    const pathLine = document.getElementById('pathLine');
    const successLine = document.getElementById('successLine');
    const caromFlash = document.getElementById('caromFlash');
    const cueStick = document.getElementById('cueStick');
    const cueTip = document.getElementById('cueTip');
    const cueHandle = document.getElementById('cueHandle');
    const cueProjectionLine = document.getElementById('cueProjectionLine');
    const cueBallGuide = document.getElementById('cueBallGuide');
    const cueGuideRing = document.getElementById('cueGuideRing');
    const cueGuideAxis = document.getElementById('cueGuideAxis');
    const cueGuideCross = document.getElementById('cueGuideCross');
    const cueGuideSpinDot = document.getElementById('cueGuideSpinDot');
    const effectControl = document.getElementById('effectControl');
    const effectBall = document.getElementById('effectBall');
    const effectDot = document.getElementById('effectDot');
    const powerBadge = document.getElementById('powerBadge');
    const deflectionGuideReadout = document.getElementById('deflectionGuideReadout');
    const deflectionGuideStatus = document.getElementById('deflectionGuideStatus');
    const deflectionCueBall = document.getElementById('deflectionCueBall');
    const deflectionTargetBall = document.getElementById('deflectionTargetBall');
    const deflectionCueDot = document.getElementById('deflectionCueDot');
    const deflectionCueShadow = document.getElementById('deflectionCueShadow');
    const deflectionTargetShadow = document.getElementById('deflectionTargetShadow');
    const deflectionButtons = Array.from(document.querySelectorAll('[data-deflect-thickness]'));
    const modeButtons = Array.from(document.querySelectorAll('.step-btn'));
    const ballViewerStage = document.getElementById('ballViewerStage');
    const ballViewerStatus = document.getElementById('ballViewerStatus');
    const ballViewerReadout = document.getElementById('ballViewerReadout');
    const viewerCueDot = document.getElementById('viewerCueDot');
    const ballViewerSvg = document.getElementById('ballViewerSvg');
    const viewerRelCueYellow = document.getElementById('viewerRelCueYellow');
    const viewerRelCueRed = document.getElementById('viewerRelCueRed');
    const viewerRelRedYellow = document.getElementById('viewerRelRedYellow');
    const viewerGuidePath = document.getElementById('viewerGuidePath');
    const viewerGuideDots = document.getElementById('viewerGuideDots');
    const viewerZoomOutBtn = document.getElementById('viewerZoomOutBtn');
    const viewerZoomInBtn = document.getElementById('viewerZoomInBtn');
    const viewerZoomResetBtn = document.getElementById('viewerZoomResetBtn');
    const viewerPreviewBtn = document.getElementById('viewerPreviewBtn');
    const contactViewerStage = document.getElementById('contactViewerStage');
    const contactCueBall = document.getElementById('contactCueBall');
    const contactTargetBall = document.getElementById('contactTargetBall');
    const contactCueDot = document.getElementById('contactCueDot');
    const contactCueStick = document.getElementById('contactCueStick');
    const contactAimLine = document.getElementById('contactAimLine');
    const contactViewerLegend = document.getElementById('contactViewerLegend');
    const contactViewerCaption = document.getElementById('contactViewerCaption');

    const els = {
      cue: document.getElementById('cue'),
      yellow: document.getElementById('yellow'),
      red: document.getElementById('red')
    };

    const viewerEls = {
      cue: document.getElementById('viewerCue'),
      yellow: document.getElementById('viewerYellow'),
      red: document.getElementById('viewerRed')
    };

    const defaultBalls = [
      { id: 'cue', name: 'Blanca', x: 270, y: 280, vx: 0, vy: 0 },
      { id: 'yellow', name: 'Amarilla', x: 670, y: 210, vx: 0, vy: 0 },
      { id: 'red', name: 'Roja', x: 720, y: 350, vx: 0, vy: 0 }
    ];

    const practiceReferenceImages = {
      '001': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 001: blanca abajo a la izquierda, amarilla arriba muy cerca y roja sola a la derecha.',
          src: 'assets/jugadas/posicion_inicial_001.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 001: contacto fino a la amarilla, bajada a la banda inferior, subida hacia la roja y prolongación por la esquina superior derecha.',
          src: 'assets/jugadas/recorrido_guia_001.webp'
        }
      ],
      '002': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 002: roja en la zona izquierda baja, blanca al lado derecho y amarilla cerca de la banda derecha inferior.',
          src: 'assets/jugadas/posicion_inicial_002.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 002: contacto a la roja, recorrido amplio por bandas y llegada hacia la amarilla en la derecha.',
          src: 'assets/jugadas/recorrido_guia_002.webp'
        }
      ],
      '003': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 003: roja en la zona media-baja, blanca a la derecha y amarilla cerca de la esquina inferior derecha.',
          src: 'assets/jugadas/posicion_inicial_003.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 003: contacto a la roja, vuelta amplia por la izquierda y salida final hacia la amarilla en la esquina inferior derecha.',
          src: 'assets/jugadas/recorrido_guia_003.webp'
        }
      ],
      '004': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 004: roja y blanca juntas en el lado derecho, con la amarilla cerca de la esquina inferior derecha.',
          src: 'assets/jugadas/posicion_inicial_004.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 004: salida a la roja, apoyo en banda inferior, vuelta larga por la izquierda y llegada final a la amarilla en la esquina inferior derecha.',
          src: 'assets/jugadas/recorrido_guia_004.webp'
        }
      ],
      '005': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 005: amarilla y blanca juntas en el lado derecho, con la roja pegada a la zona baja derecha.',
          src: 'assets/jugadas/posicion_inicial_005.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 005: contacto fino a la amarilla, apoyo corto cerca de la banda inferior, vuelta amplia por la izquierda y llegada final a la roja.',
          src: 'assets/jugadas/recorrido_guia_005.webp'
        }
      ],
      '006': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 006: roja y blanca juntas en la zona media, con la amarilla cerca de la banda inferior derecha.',
          src: 'assets/jugadas/posicion_inicial_006.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 006: contacto a la roja, vuelta amplia por la izquierda y cierre hacia la amarilla en la parte baja derecha.',
          src: 'assets/jugadas/recorrido_guia_006.webp'
        }
      ],
      '007': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 007: roja y blanca casi juntas en el centro, con la amarilla pegada a la zona derecha.',
          src: 'assets/jugadas/posicion_inicial_007.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 007: contacto a la roja, vuelta amplia por la izquierda, apoyo en la zona baja derecha y llegada a la amarilla.',
          src: 'assets/jugadas/recorrido_guia_007.webp'
        }
      ],
      '008': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 008: roja en zona media-baja, blanca abajo a la derecha de la roja y amarilla al lado derecho.',
          src: 'assets/jugadas/posicion_inicial_008.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 008: contacto a la roja, apoyo en banda inferior, vuelta amplia por la izquierda y llegada a la amarilla.',
          src: 'assets/jugadas/recorrido_guia_008.webp'
        }
      ],
      '009': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 009: roja en la zona media-baja, blanca un poco a la derecha y abajo, y amarilla cerca de la banda derecha.',
          src: 'assets/jugadas/posicion_inicial_009.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 009: contacto a la roja, salida hacia la banda izquierda, paso por banda superior y cierre en la amarilla a la derecha.',
          src: 'assets/jugadas/recorrido_guia_009.webp'
        }
      ],
      '010': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 010: roja en la zona media-baja, blanca abajo a la derecha y amarilla al lado derecho.',
          src: 'assets/jugadas/posicion_inicial_010.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 010: contacto a la roja, curva hacia la banda izquierda, paso por la parte superior y cierre por la banda inferior derecha hacia la amarilla.',
          src: 'assets/jugadas/recorrido_guia_010.webp'
        }
      ],
      '011': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 011: roja cerca de la banda corta izquierda, blanca en zona media derecha y amarilla cerca de la esquina inferior derecha.',
          src: 'assets/jugadas/posicion_inicial_011.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 011: contacto a la roja, recorrido por la izquierda y cierre hacia la amarilla en la parte baja derecha.',
          src: 'assets/jugadas/recorrido_guia_011.webp'
        }
      ],
      '012': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 012: roja cerca de la banda corta izquierda, blanca en la zona media derecha y amarilla cerca de la banda inferior derecha.',
          src: 'assets/jugadas/posicion_inicial_012.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 012: contacto a la roja, apoyo en banda corta izquierda, subida a banda superior y cierre por abajo hacia la amarilla.',
          src: 'assets/jugadas/recorrido_guia_012.webp'
        }
      ],
      '013': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 013: amarilla a la izquierda baja, roja arriba de la blanca en el centro y blanca debajo de la roja.',
          src: 'assets/jugadas/posicion_inicial_013.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 013: contacto a la roja, subida hacia la izquierda, apoyo por la corta izquierda y cierre hacia la amarilla.',
          src: 'assets/jugadas/recorrido_guia_013.webp'
        }
      ],
      '014': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 014: amarilla abajo izquierda, blanca central baja y roja encima de la blanca.',
          src: 'assets/jugadas/posicion_inicial_014.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 014: contacto a la roja, subida hacia la banda superior izquierda, apoyo en la banda corta izquierda y cierre hacia la amarilla.',
          src: 'assets/jugadas/recorrido_guia_014.webp'
        }
      ],
      '015': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 015: roja al centro, blanca debajo de la roja y amarilla arriba a la derecha.',
          src: 'assets/jugadas/posicion_inicial_015.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 015: contacto a la roja, apertura por la izquierda y salida diagonal hacia la amarilla superior derecha.',
          src: 'assets/jugadas/recorrido_guia_015.webp'
        }
      ],
      '016': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 016: roja en la zona central alta, blanca debajo y amarilla cerca de la parte superior derecha.',
          src: 'assets/jugadas/posicion_inicial_016.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 016: contacto a la roja, vuelta amplia por la izquierda y salida final hacia la amarilla superior derecha.',
          src: 'assets/jugadas/recorrido_guia_016.webp'
        }
      ],
      '017': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 017: roja en la zona izquierda, blanca al centro-bajo y amarilla en la parte superior derecha.',
          src: 'assets/jugadas/posicion_inicial_017.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 017: contacto a la roja, vuelta por la izquierda, regreso al centro y salida diagonal hacia la amarilla superior derecha.',
          src: 'assets/jugadas/recorrido_guia_017.webp'
        }
      ],
      '018': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 018: roja en la zona izquierda-media, blanca un poco a la derecha y abajo, y amarilla cerca de la esquina superior derecha.',
          src: 'assets/jugadas/posicion_inicial_018.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 018: contacto a la roja, salida a banda superior izquierda, banda corta izquierda, banda inferior izquierda y diagonal larga hacia la amarilla superior derecha.',
          src: 'assets/jugadas/recorrido_guia_018.webp'
        }
      ],
      '019': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 019: amarilla cerca de la esquina superior izquierda, roja cerca de la zona superior derecha y blanca más abajo a la derecha.',
          src: 'assets/jugadas/posicion_inicial_019.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 019: contacto a la roja, vuelta corta por la derecha, diagonal larga al fondo, banda izquierda y cierre hacia la amarilla superior izquierda.',
          src: 'assets/jugadas/recorrido_guia_019.webp'
        }
      ],
      '020': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 020: amarilla en el costado izquierdo, roja arriba a la derecha y blanca más abajo a la derecha.',
          src: 'assets/jugadas/posicion_inicial_020.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 020: contacto a la roja, vuelta corta por la derecha, diagonal larga a banda inferior y cierre hacia la amarilla del costado izquierdo.',
          src: 'assets/jugadas/recorrido_guia_020.webp'
        }
      ],
      '021': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 021: amarilla en la parte baja izquierda, roja cerca de la parte superior derecha y blanca debajo de la roja.',
          src: 'assets/jugadas/posicion_inicial_021.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 021: contacto a la roja, vuelta corta por la derecha, diagonal larga al fondo y cierre hacia la amarilla baja izquierda.',
          src: 'assets/jugadas/recorrido_guia_021.webp'
        }
      ],
      '022': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 022: amarilla en la esquina inferior izquierda, roja en la zona media-derecha y blanca justo debajo de la roja.',
          src: 'assets/jugadas/posicion_inicial_022.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 022: contacto a la roja, recorrido amplio cruzado por bandas, regreso por la derecha y cierre hacia la amarilla inferior izquierda.',
          src: 'assets/jugadas/recorrido_guia_022.webp'
        }
      ],
      '023': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 023: amarilla en la esquina inferior izquierda, roja en la zona media-derecha y blanca a la derecha de la roja.',
          src: 'assets/jugadas/posicion_inicial_023.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 023: contacto a la roja, línea larga hacia la izquierda, salida a la esquina baja izquierda, vuelta amplia por la parte superior y cierre en la amarilla inferior izquierda.',
          src: 'assets/jugadas/recorrido_guia_023.webp'
        }
      ],
      '024': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 024: roja en la zona izquierda-media, amarilla al centro-derecha y blanca justo debajo de la amarilla.',
          src: 'assets/jugadas/posicion_inicial_024.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 024: contacto primero a la amarilla, recorrido amplio por la mesa y cierre hacia la roja en la zona izquierda-media.',
          src: 'assets/jugadas/recorrido_guia_024.webp'
        }
      ],
      '025': [
        {
          title: 'Imagen 1 · Posición inicial',
          note: 'Configuración exacta de la jugada 025: roja arriba a la izquierda, blanca debajo de la roja y amarilla en la esquina inferior izquierda.',
          src: 'assets/jugadas/posicion_inicial_025.webp'
        },
        {
          title: 'Imagen 2 · Recorrido de la jugada',
          note: 'Trayectoria de la jugada 025: contacto a la roja, pequeño apoyo por la esquina superior izquierda, recorrido largo por la mesa y cierre hacia la amarilla inferior izquierda.',
          src: 'assets/jugadas/recorrido_guia_025.webp'
        }
      ]
    };



    function applyReferenceGuideCorrections(shots) {
      const corrected = {
        '001': {
          route: 'roja → banda superior/derecha → banda inferior → banda izquierda → cierre a la amarilla',
          guidePath: [
            { x: 275, y: 348 }, { x: 708, y: 286 },
            { x: 925, y: 78 }, { x: 515, y: 500 }, { x: 54, y: 315 },
            { x: 275, y: 286 }
          ],
          validation: { railsBeforeSecond: 3, qaNote: 'v202: guía 001 revisada para registrar tres bandas reales antes del cierre a la segunda bola.' }
        },
        '002': {
          route: 'roja → banda inferior izquierda → banda izquierda → banda superior → salida a la derecha → amarilla',
          guidePath: [
            { x: 815, y: 370 }, { x: 318, y: 392 }, { x: 286, y: 500 },
            { x: 70, y: 355 }, { x: 320, y: 86 }, { x: 835, y: 375 }, { x: 905, y: 425 }
          ]
        },
        '003': {
          route: 'roja → banda inferior → banda izquierda → banda superior → salida a la derecha → amarilla',
          guidePath: [
            { x: 804, y: 378 }, { x: 542, y: 381 }, { x: 445, y: 500 },
            { x: 70, y: 355 }, { x: 300, y: 86 }, { x: 790, y: 360 }, { x: 909, y: 425 }
          ]
        },
        '004': {
          route: 'roja → banda inferior derecha → banda izquierda alta → banda superior izquierda → regreso largo → amarilla',
          guidePath: [
            { x: 798, y: 382 }, { x: 713, y: 380 }, { x: 620, y: 500 },
            { x: 82, y: 330 }, { x: 155, y: 86 }, { x: 805, y: 365 }, { x: 912, y: 428 }
          ]
        },
        '005': {
          route: 'amarilla → banda inferior derecha → banda izquierda → banda superior → retorno por abajo → cierre',
          guidePath: [
            { x: 805, y: 382 }, { x: 746, y: 398 }, { x: 734, y: 500 },
            { x: 70, y: 320 }, { x: 230, y: 86 }, { x: 705, y: 365 },
            { x: 805, y: 382 }, { x: 912, y: 428 }
          ]
        },
        '006': {
          route: 'roja → banda izquierda alta → banda superior izquierda → banda derecha → cierre inferior derecho',
          guidePath: [
            { x: 584, y: 360 }, { x: 502, y: 373 }, { x: 70, y: 315 },
            { x: 245, y: 86 }, { x: 918, y: 384 }, { x: 837, y: 461 }
          ]
        },
        '007': {
          route: 'roja → banda superior izquierda → banda izquierda → banda inferior central → salida a la derecha',
          guidePath: [
            { x: 545, y: 386 }, { x: 490, y: 405 }, { x: 120, y: 86 },
            { x: 70, y: 315 }, { x: 640, y: 500 }, { x: 925, y: 403 }
          ]
        },
        '008': {
          route: 'roja → banda inferior → banda izquierda → banda superior → cierre por la derecha',
          guidePath: [
            { x: 710, y: 430 }, { x: 635, y: 395 }, { x: 520, y: 500 },
            { x: 70, y: 320 }, { x: 245, y: 86 }, { x: 850, y: 360 }, { x: 900, y: 395 }
          ]
        },
        '009': {
          route: 'roja → banda izquierda → banda superior → banda derecha → amarilla',
          guidePath: [
            { x: 665, y: 438 }, { x: 595, y: 404 }, { x: 70, y: 325 },
            { x: 225, y: 86 }, { x: 930, y: 362 }, { x: 900, y: 395 }
          ]
        },
        '010': {
          route: 'roja → banda izquierda → banda superior → banda inferior derecha → amarilla',
          guidePath: [
            { x: 655, y: 438 }, { x: 613, y: 405 }, { x: 70, y: 325 },
            { x: 225, y: 86 }, { x: 858, y: 500 }, { x: 900, y: 398 }
          ]
        },
        '011': {
          route: 'roja → banda izquierda → banda superior → cruce largo → banda inferior derecha → amarilla',
          guidePath: [
            { x: 775, y: 300 }, { x: 105, y: 296 }, { x: 70, y: 295 },
            { x: 265, y: 86 }, { x: 910, y: 405 }, { x: 852, y: 482 }
          ]
        },
        '012': {
          route: 'roja → banda izquierda → banda superior izquierda → banda inferior derecha → amarilla',
          guidePath: [
            { x: 775, y: 305 }, { x: 125, y: 305 }, { x: 70, y: 295 },
            { x: 245, y: 86 }, { x: 760, y: 500 }, { x: 905, y: 407 }
          ]
        },
        '013': {
          route: 'roja → banda superior izquierda → banda izquierda → banda inferior izquierda → cierre corto',
          guidePath: [
            { x: 508, y: 370 }, { x: 508, y: 280 }, { x: 315, y: 86 },
            { x: 70, y: 320 }, { x: 165, y: 500 }, { x: 248, y: 410 }
          ]
        },
        '014': {
          route: 'roja → banda superior → banda izquierda → banda inferior izquierda → cierre corto',
          guidePath: [
            { x: 434, y: 379 }, { x: 484, y: 266 }, { x: 330, y: 86 },
            { x: 70, y: 325 }, { x: 150, y: 500 }, { x: 233, y: 445 }
          ]
        },
        '015': {
          route: 'roja → banda izquierda → banda inferior izquierda → salida diagonal a la amarilla',
          guidePath: [
            { x: 520, y: 365 }, { x: 498, y: 198 }, { x: 315, y: 86 },
            { x: 75, y: 320 }, { x: 175, y: 500 }, { x: 730, y: 88 }
          ]
        },
        '016': {
          route: 'roja → banda superior izquierda → banda izquierda → banda inferior izquierda → salida larga a la amarilla superior derecha',
          guidePath: [
            { x: 510, y: 365 }, { x: 500, y: 205 }, { x: 355, y: 100 },
            { x: 78, y: 320 }, { x: 288, y: 545 }, { x: 902, y: 100 }
          ]
        },
        '017': {
          route: 'roja → banda inferior izquierda → banda izquierda → banda superior izquierda → salida diagonal a la amarilla',
          guidePath: [
            { x: 380, y: 388 }, { x: 280, y: 345 }, { x: 180, y: 500 },
            { x: 70, y: 320 }, { x: 180, y: 86 }, { x: 380, y: 388 }, { x: 650, y: 170 }
          ]
        },
        '018': {
          route: 'roja → banda superior izquierda → banda izquierda → banda inferior izquierda → salida diagonal a la amarilla superior derecha',
          guidePath: [
            { x: 380, y: 365 }, { x: 280, y: 330 }, { x: 205, y: 86 },
            { x: 70, y: 315 }, { x: 250, y: 500 }, { x: 885, y: 95 }
          ]
        },
        '019': {
          route: 'roja → banda superior derecha → banda derecha → diagonal al fondo → banda izquierda → amarilla superior izquierda',
          guidePath: [
            { x: 835, y: 258 }, { x: 805, y: 100 }, { x: 835, y: 66 },
            { x: 930, y: 130 }, { x: 835, y: 258 }, { x: 585, y: 500 },
            { x: 72, y: 188 }, { x: 160, y: 95 }
          ]
        },
        '020': {
          route: 'roja → banda superior derecha → banda derecha → regreso a zona de salida → banda inferior central → amarilla izquierda',
          guidePath: [
            { x: 835, y: 275 }, { x: 805, y: 98 }, { x: 875, y: 65 },
            { x: 930, y: 115 }, { x: 835, y: 275 }, { x: 445, y: 500 },
            { x: 108, y: 288 }
          ]
        },
        '021': {
          route: 'roja → banda superior derecha → banda derecha → diagonal al fondo → amarilla baja izquierda',
          guidePath: [
            { x: 835, y: 288 }, { x: 805, y: 100 }, { x: 865, y: 62 },
            { x: 930, y: 118 }, { x: 255, y: 500 }, { x: 92, y: 402 }
          ]
        }
      };
      shots.forEach(shot => {
        const c = corrected[shot.code];
        if (!c) return;
        shot.guidePath = c.guidePath.map(p => ({ x: p.x, y: p.y }));
        shot.route = c.route;
        shot.tip = `${shot.tip} La línea verde fue revisada contra la imagen de referencia para que el recorrido coincida visualmente con el video.`;
      });
      return shots;
    }

    const FIRST_SIXTY_PHYSICAL_OVERRIDES = {
      '011': { offsetDeg: 40, power: 87, effect: { x: -49, y: -38 } },
      '012': { offsetDeg: -35, power: 85, effect: { x: -67, y: -50 } },
      '023': { offsetDeg: -15, power: 95, effect: { x: 66, y: -60 } },
      '032': { offsetDeg: -35, power: 97, effect: { x: -62, y: -58 } },
      '036': { offsetDeg: 20, power: 92, effect: { x: -62, y: -48 } },
      '040': { offsetDeg: -35, power: 86, effect: { x: -85, y: -47 } }
    };

    function aimPointFromAngleInsideTable(cue, angle, preferredDistance = 170) {
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      const maxX = dx > 0 ? (RIGHT - 34 - cue.x) / dx : dx < 0 ? (LEFT + 34 - cue.x) / dx : Infinity;
      const maxY = dy > 0 ? (BOTTOM - 34 - cue.y) / dy : dy < 0 ? (TOP + 34 - cue.y) / dy : Infinity;
      const maxDistance = Math.max(42, Math.min(preferredDistance, maxX, maxY) - 1);
      return {
        x: clamp(cue.x + dx * maxDistance, LEFT + 34, RIGHT - 34),
        y: clamp(cue.y + dy * maxDistance, TOP + 34, BOTTOM - 34),
        label: 'mira física calibrada'
      };
    }

    function applyFirstSixtyPhysicalOverride(shot) {
      const override = FIRST_SIXTY_PHYSICAL_OVERRIDES[shot?.code];
      if (!override || !Array.isArray(shot.balls)) return;
      const cue = shot.balls.find(b => b.id === 'cue');
      if (!cue || !shot.aimAt) return;
      const baseAngle = Math.atan2(shot.aimAt.y - cue.y, shot.aimAt.x - cue.x);
      const angle = baseAngle + override.offsetDeg * Math.PI / 180;
      shot.aimAt = aimPointFromAngleInsideTable(cue, angle);
      shot.power = clamp(Math.round(override.power), 1, 100);
      shot.executionPower = shot.power;
      shot.effect = clampEffect(override.effect.x, override.effect.y);
      shot.physicalOverride = true;
      shot.tip = `${shot.tip} Ajuste físico fino aplicado: potencia ${shot.power}%, efecto X ${shot.effect.x}, Y ${shot.effect.y}, con mira recalibrada para que la jugada cierre con 3+ bandas.`;
    }



    // ============================================================
    // QA v160: control de calidad visual y técnico jugada por jugada
    // ============================================================
    // Estas correcciones salen de comparar automáticamente el punto azul de
    // la imagen inicial local contra el efecto cargado en cada jugada. Se usan
    // para que la guía dinámica y la tacada en modo "Imagen jugada" no muestren
    // el efecto contrario al que se ve en el video/imagen de referencia.
    const IMAGE_EFFECT_QA_OVERRIDES = {
      '001': { x: 79, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx 23.4, dy -2.2; efecto aplicado X 79, Y 0.' },
      '002': { x: 78, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx 33.5, dy -1.7; efecto aplicado X 78, Y 0.' },
      '003': { x: 93, y: 36, note: 'QA v160 desde imagen inicial: punto azul detectado dx 31.9, dy 11.8; efecto aplicado X 93, Y 36.' },
      '004': { x: 92, y: 40, note: 'QA v160 desde imagen inicial: punto azul detectado dx 36.0, dy 12.9; efecto aplicado X 92, Y 40.' },
      '005': { x: 94, y: 35, note: 'QA v160 desde imagen inicial: punto azul detectado dx 34.2, dy 10.9; efecto aplicado X 94, Y 35.' },
      '006': { x: 28, y: 27, note: 'QA v160 desde imagen inicial: punto azul detectado dx 8.3, dy 7.8; efecto aplicado X 28, Y 27.' },
      '007': { x: 83, y: 56, note: 'QA v160 desde imagen inicial: punto azul detectado dx 31.4, dy 19.8; efecto aplicado X 83, Y 56.' },
      '008': { x: 66, y: 75, note: 'QA v160 desde imagen inicial: punto azul detectado dx 25.1, dy 35.7; efecto aplicado X 66, Y 75.' },
      '009': { x: 92, y: 40, note: 'QA v160 desde imagen inicial: punto azul detectado dx 31.4, dy 13.2; efecto aplicado X 92, Y 40.' },
      '010': { x: 91, y: 42, note: 'QA v160 desde imagen inicial: punto azul detectado dx 34.0, dy 13.7; efecto aplicado X 91, Y 42.' },
      '011': { x: 0, y: 45, note: 'QA v160 desde imagen inicial: punto azul detectado dx -0.1, dy 13.7; efecto aplicado X 0, Y 45.' },
      '012': { x: 85, y: 53, note: 'QA v160 desde imagen inicial: punto azul detectado dx 26.2, dy 16.4; efecto aplicado X 85, Y 53.' },
      '013': { x: 0, y: -28, note: 'QA v160 desde imagen inicial: punto azul detectado dx 1.3, dy -8.4; efecto aplicado X 0, Y -28.' },
      '014': { x: -88, y: 48, note: 'QA v160 desde imagen inicial: punto azul detectado dx -28.2, dy 15.4; efecto aplicado X -88, Y 48.' },
      '015': { x: -71, y: 23, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.1, dy 6.9; efecto aplicado X -71, Y 23.' },
      '016': { x: -74, y: -16, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.9, dy -4.7; efecto aplicado X -74, Y -16.' },
      '017': { x: -77, y: -19, note: 'QA v160 desde imagen inicial: punto azul detectado dx -22.9, dy -5.6; efecto aplicado X -77, Y -19.' },
      '018': { x: -78, y: 10, note: 'QA v160 desde imagen inicial: punto azul detectado dx -23.3, dy 2.9; efecto aplicado X -78, Y 10.' },
      '019': { x: 54, y: 84, note: 'QA v160 desde imagen inicial: punto azul detectado dx 19.4, dy 37.0; efecto aplicado X 54, Y 84.' },
      '020': { x: 67, y: 74, note: 'QA v160 desde imagen inicial: punto azul detectado dx 27.2, dy 34.6; efecto aplicado X 67, Y 74.' },
      '021': { x: 59, y: -35, note: 'QA v160 desde imagen inicial: punto azul detectado dx 17.6, dy -10.3; efecto aplicado X 59, Y -35.' },
      '022': { x: -92, y: 39, note: 'QA v160 desde imagen inicial: punto azul detectado dx -34.9, dy 12.7; efecto aplicado X -92, Y 39.' },
      '023': { x: -83, y: 56, note: 'QA v160 desde imagen inicial: punto azul detectado dx -31.7, dy 19.5; efecto aplicado X -83, Y 56.' },
      '024': { x: -82, y: 12, note: 'QA v160 desde imagen inicial: punto azul detectado dx -24.7, dy 3.5; efecto aplicado X -82, Y 12.' },
      '025': { x: -82, y: 24, note: 'QA v160 desde imagen inicial: punto azul detectado dx -24.6, dy 7.3; efecto aplicado X -82, Y 24.' },
      '026': { x: -99, y: 11, note: 'QA v160 desde imagen inicial: punto azul detectado dx -18.4, dy 1.9; efecto aplicado X -99, Y 11.' },
      '027': { x: -86, y: 51, note: 'QA v160 desde imagen inicial: punto azul detectado dx -18.4, dy 10.3; efecto aplicado X -86, Y 51.' },
      '030': { x: -98, y: 21, note: 'QA v160 desde imagen inicial: punto azul detectado dx -19.3, dy 3.8; efecto aplicado X -98, Y 21.' },
      '031': { x: -94, y: 34, note: 'QA v160 desde imagen inicial: punto azul detectado dx -19.1, dy 6.2; efecto aplicado X -94, Y 34.' },
      '032': { x: 79, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx 13.6, dy 0.5; efecto aplicado X 79, Y 0.' },
      '035': { x: -98, y: 21, note: 'QA v160 desde imagen inicial: punto azul detectado dx -18.3, dy 3.6; efecto aplicado X -98, Y 21.' },
      '036': { x: -10, y: 100, note: 'QA v160 desde imagen inicial: punto azul detectado dx -1.6, dy 25.7; efecto aplicado X -10, Y 100.' },
      '037': { x: 0, y: 100, note: 'QA v160 desde imagen inicial: punto azul detectado dx -0.4, dy 25.5; efecto aplicado X 0, Y 100.' },
      '038': { x: 26, y: 16, note: 'QA v160 desde imagen inicial: punto azul detectado dx 4.5, dy 2.8; efecto aplicado X 26, Y 16.' },
      '039': { x: -71, y: 71, note: 'QA v160 desde imagen inicial: punto azul detectado dx -17.2, dy 17.1; efecto aplicado X -71, Y 71.' },
      '040': { x: -14, y: -30, note: 'QA v160 desde imagen inicial: punto azul detectado dx -2.3, dy -5.1; efecto aplicado X -14, Y -30.' },
      '041': { x: -49, y: -41, note: 'QA v160 desde imagen inicial: punto azul detectado dx -8.3, dy -6.9; efecto aplicado X -49, Y -41.' },
      '042': { x: -65, y: -33, note: 'QA v160 desde imagen inicial: punto azul detectado dx -11.2, dy -5.6; efecto aplicado X -65, Y -33.' },
      '044': { x: -40, y: -46, note: 'QA v173 desde imagen actualizada/modal: punto azul detectado arriba-izquierda en la bola blanca; efecto aplicado X -40, Y -46.' },
      '045': { x: 71, y: -15, note: 'QA v160 desde imagen inicial: punto azul detectado dx 11.9, dy -2.4; efecto aplicado X 71, Y -15.' },
      '046': { x: -3, y: -27, note: 'QA v173 desde imagen actualizada/modal: punto azul detectado casi centrado y arriba; efecto aplicado X -3, Y -27.' },
      '047': { x: -71, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -12.2, dy -0.3; efecto aplicado X -71, Y 0.' },
      '048': { x: -68, y: 74, note: 'QA v160 desde imagen inicial: punto azul detectado dx -15.3, dy 19.3; efecto aplicado X -68, Y 74.' },
      '049': { x: -98, y: 19, note: 'QA v160 desde imagen inicial: punto azul detectado dx -18.9, dy 3.1; efecto aplicado X -98, Y 19.' },
      '051': { x: -75, y: 22, note: 'QA v160 desde imagen inicial: punto azul detectado dx -12.9, dy 3.8; efecto aplicado X -75, Y 22.' },
      '052': { x: -85, y: -19, note: 'QA v160 desde imagen inicial: punto azul detectado dx -14.3, dy -3.2; efecto aplicado X -85, Y -19.' },
      '053': { x: -80, y: -19, note: 'QA v160 desde imagen inicial: punto azul detectado dx -13.7, dy -3.3; efecto aplicado X -80, Y -19.' },
      '055': { x: -14, y: 99, note: 'QA v160 desde imagen inicial: punto azul detectado dx -2.3, dy 25.9; efecto aplicado X -14, Y 99.' },
      '056': { x: -77, y: 63, note: 'QA v160 desde imagen inicial: punto azul detectado dx -19.9, dy 13.6; efecto aplicado X -77, Y 63.' },
      '057': { x: -70, y: 72, note: 'QA v160 desde imagen inicial: punto azul detectado dx -16.4, dy 20.1; efecto aplicado X -70, Y 72.' },
      '058': { x: 80, y: 60, note: 'QA v160 desde imagen inicial: punto azul detectado dx 22.0, dy 12.9; efecto aplicado X 80, Y 60.' },
      '059': { x: -80, y: 61, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.8, dy 12.7; efecto aplicado X -80, Y 61.' },
      '061': { x: -84, y: 54, note: 'QA v160 desde imagen inicial: punto azul detectado dx -37.1, dy 19.3; efecto aplicado X -84, Y 54.' },
      '062': { x: 71, y: 71, note: 'QA v160 desde imagen inicial: punto azul detectado dx 32.0, dy 31.1; efecto aplicado X 71, Y 71.' },
      '063': { x: -99, y: 16, note: 'QA v160 desde imagen inicial: punto azul detectado dx -31.3, dy 4.8; efecto aplicado X -99, Y 16.' },
      '064': { x: -93, y: -10, note: 'QA v160 desde imagen inicial: punto azul detectado dx -26.3, dy -2.9; efecto aplicado X -93, Y -10.' },
      '065': { x: -93, y: 36, note: 'QA v160 desde imagen inicial: punto azul detectado dx -33.8, dy 11.6; efecto aplicado X -93, Y 36.' },
      '066': { x: -89, y: 46, note: 'QA v160 desde imagen inicial: punto azul detectado dx -35.6, dy 15.4; efecto aplicado X -89, Y 46.' },
      '067': { x: -71, y: 70, note: 'QA v160 desde imagen inicial: punto azul detectado dx -31.9, dy 29.2; efecto aplicado X -71, Y 70.' },
      '068': { x: -83, y: -17, note: 'QA v160 desde imagen inicial: punto azul detectado dx -24.6, dy -5.0; efecto aplicado X -83, Y -17.' },
      '069': { x: -83, y: -21, note: 'QA v160 desde imagen inicial: punto azul detectado dx -24.6, dy -6.3; efecto aplicado X -83, Y -21.' },
      '070': { x: 61, y: 80, note: 'QA v160 desde imagen inicial: punto azul detectado dx 22.2, dy 40.6; efecto aplicado X 61, Y 80.' },
      '071': { x: 64, y: 77, note: 'QA v160 desde imagen inicial: punto azul detectado dx 24.4, dy 38.9; efecto aplicado X 64, Y 77.' },
      '072': { x: 96, y: 28, note: 'QA v160 desde imagen inicial: punto azul detectado dx 33.2, dy 8.4; efecto aplicado X 96, Y 28.' },
      '073': { x: 72, y: -12, note: 'QA v160 desde imagen inicial: punto azul detectado dx 20.7, dy -3.5; efecto aplicado X 72, Y -12.' },
      '074': { x: 70, y: 71, note: 'QA v160 desde imagen inicial: punto azul detectado dx 28.1, dy 31.9; efecto aplicado X 70, Y 71.' },
      '075': { x: 87, y: 50, note: 'QA v160 desde imagen inicial: punto azul detectado dx 33.7, dy 16.5; efecto aplicado X 87, Y 50.' },
      '076': { x: 74, y: 68, note: 'QA v160 desde imagen inicial: punto azul detectado dx 35.0, dy 27.3; efecto aplicado X 74, Y 68.' },
      '077': { x: 72, y: 69, note: 'QA v160 desde imagen inicial: punto azul detectado dx 33.4, dy 28.3; efecto aplicado X 72, Y 69.' },
      '078': { x: 81, y: 59, note: 'QA v160 desde imagen inicial: punto azul detectado dx 36.2, dy 21.4; efecto aplicado X 81, Y 59.' },
      '079': { x: 70, y: -20, note: 'QA v160 desde imagen inicial: punto azul detectado dx 20.6, dy -5.9; efecto aplicado X 70, Y -20.' },
      '081': { x: 85, y: 21, note: 'QA v160 desde imagen inicial: punto azul detectado dx 26.2, dy 6.4; efecto aplicado X 85, Y 21.' },
      '082': { x: -73, y: -24, note: 'QA v160 desde imagen inicial: punto azul detectado dx -22.2, dy -7.2; efecto aplicado X -73, Y -24.' },
      '083': { x: 88, y: 48, note: 'QA v160 desde imagen inicial: punto azul detectado dx 33.0, dy 16.4; efecto aplicado X 88, Y 48.' },
      '084': { x: 87, y: 50, note: 'QA v160 desde imagen inicial: punto azul detectado dx 34.1, dy 17.9; efecto aplicado X 87, Y 50.' },
      '085': { x: 85, y: -20, note: 'QA v160 desde imagen inicial: punto azul detectado dx 24.9, dy -5.9; efecto aplicado X 85, Y -20.' },
      '086': { x: 78, y: 62, note: 'QA v160 desde imagen inicial: punto azul detectado dx 33.7, dy 23.4; efecto aplicado X 78, Y 62.' },
      '087': { x: 92, y: 25, note: 'QA v160 desde imagen inicial: punto azul detectado dx 27.8, dy 7.4; efecto aplicado X 92, Y 25.' },
      '088': { x: 74, y: 68, note: 'QA v160 desde imagen inicial: punto azul detectado dx 34.2, dy 28.1; efecto aplicado X 74, Y 68.' },
      '089': { x: -80, y: -14, note: 'QA v160 desde imagen inicial: punto azul detectado dx -23.4, dy -4.2; efecto aplicado X -80, Y -14.' },
      '090': { x: 87, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx 26.6, dy -0.4; efecto aplicado X 87, Y 0.' },
      '091': { x: 81, y: 59, note: 'QA v160 desde imagen inicial: punto azul detectado dx 33.2, dy 22.4; efecto aplicado X 81, Y 59.' },
      '092': { x: -71, y: 8, note: 'QA v160 desde imagen inicial: punto azul detectado dx -22.2, dy 2.4; efecto aplicado X -71, Y 8.' },
      '093': { x: -83, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -25.8, dy 2.1; efecto aplicado X -83, Y 0.' },
      '094': { x: 0, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -0.0, dy 0.9; efecto aplicado X 0, Y 0.' },
      '095': { x: 0, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -0.7, dy 1.9; efecto aplicado X 0, Y 0.' },
      '096': { x: 0, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -0.4, dy -1.7; efecto aplicado X 0, Y 0.' },
      '097': { x: 0, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -0.9, dy -2.0; efecto aplicado X 0, Y 0.' },
      '098': { x: -84, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -25.8, dy 1.1; efecto aplicado X -84, Y 0.' },
      '099': { x: 87, y: 15, note: 'QA v160 desde imagen inicial: punto azul detectado dx 27.0, dy 4.5; efecto aplicado X 87, Y 15.' },
      '100': { x: 95, y: 30, note: 'QA v160 desde imagen inicial: punto azul detectado dx 29.2, dy 9.3; efecto aplicado X 95, Y 30.' },
      '101': { x: -98, y: 8, note: 'QA v160 desde imagen inicial: punto azul detectado dx -29.3, dy 2.5; efecto aplicado X -98, Y 8.' },
      '102': { x: -79, y: 11, note: 'QA v160 desde imagen inicial: punto azul detectado dx -23.9, dy 3.5; efecto aplicado X -79, Y 11.' },
      '103': { x: 0, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -0.5, dy 0.2; efecto aplicado X 0, Y 0.' },
      '104': { x: 78, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx 24.2, dy 1.9; efecto aplicado X 78, Y 0.' },
      '105': { x: 97, y: 20, note: 'QA v160 desde imagen inicial: punto azul detectado dx 30.2, dy 6.2; efecto aplicado X 97, Y 20.' },
      '106': { x: -71, y: -24, note: 'QA v160 desde imagen inicial: punto azul detectado dx -22.0, dy -7.4; efecto aplicado X -71, Y -24.' },
      '107': { x: 0, y: 100, note: 'QA v160 desde imagen inicial: punto azul detectado dx -1.9, dy 41.8; efecto aplicado X 0, Y 100.' },
      '108': { x: 82, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx 25.5, dy -1.2; efecto aplicado X 82, Y 0.' },
      '109': { x: -91, y: 41, note: 'QA v160 desde imagen inicial: punto azul detectado dx -31.5, dy 13.8; efecto aplicado X -91, Y 41.' },
      '110': { x: -72, y: 19, note: 'QA v160 desde imagen inicial: punto azul detectado dx -22.2, dy 5.8; efecto aplicado X -72, Y 19.' },
      '111': { x: -70, y: 22, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.5, dy 6.9; efecto aplicado X -70, Y 22.' },
      '112': { x: -68, y: 15, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.3, dy 4.8; efecto aplicado X -68, Y 15.' },
      '113': { x: -71, y: 33, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.8, dy 9.9; efecto aplicado X -71, Y 33.' },
      '114': { x: -44, y: 90, note: 'QA v160 desde imagen inicial: punto azul detectado dx -14.6, dy 29.8; efecto aplicado X -44, Y 90.' },
      '115': { x: -23, y: 97, note: 'QA v160 desde imagen inicial: punto azul detectado dx -7.6, dy 41.0; efecto aplicado X -23, Y 97.' },
      '116': { x: 52, y: 85, note: 'QA v160 desde imagen inicial: punto azul detectado dx 18.8, dy 36.3; efecto aplicado X 52, Y 85.' },
      '117': { x: 64, y: -9, note: 'QA v160 desde imagen inicial: punto azul detectado dx 19.8, dy -2.9; efecto aplicado X 64, Y -9.' },
      '118': { x: 70, y: -10, note: 'QA v160 desde imagen inicial: punto azul detectado dx 21.3, dy -3.2; efecto aplicado X 70, Y -10.' },
      '119': { x: -57, y: 82, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.0, dy 35.9; efecto aplicado X -57, Y 82.' },
      '120': { x: 43, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx 13.0, dy 1.6; efecto aplicado X 43, Y 0.' },
      '121': { x: 82, y: -22, note: 'QA v160 desde imagen inicial: punto azul detectado dx 25.5, dy -6.7; efecto aplicado X 82, Y -22.' },
      '122': { x: -50, y: 87, note: 'QA v160 desde imagen inicial: punto azul detectado dx -18.0, dy 36.6; efecto aplicado X -50, Y 87.' },
      '123': { x: 51, y: 86, note: 'QA v160 desde imagen inicial: punto azul detectado dx 18.5, dy 31.5; efecto aplicado X 51, Y 86.' },
      '124': { x: 71, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx 21.9, dy 1.0; efecto aplicado X 71, Y 0.' },
      '125': { x: -64, y: -13, note: 'QA v160 desde imagen inicial: punto azul detectado dx -20.0, dy -4.0; efecto aplicado X -64, Y -13.' },
      '126': { x: -49, y: -11, note: 'QA v160 desde imagen inicial: punto azul detectado dx -15.1, dy -3.3; efecto aplicado X -49, Y -11.' },
      '127': { x: 68, y: 9, note: 'QA v160 desde imagen inicial: punto azul detectado dx 21.0, dy 2.6; efecto aplicado X 68, Y 9.' },
      '128': { x: 78, y: 62, note: 'QA v160 desde imagen inicial: punto azul detectado dx 25.8, dy 20.3; efecto aplicado X 78, Y 62.' },
      '129': { x: 97, y: 24, note: 'QA v160 desde imagen inicial: punto azul detectado dx 29.9, dy 7.3; efecto aplicado X 97, Y 24.' },
      '130': { x: -93, y: 37, note: 'QA v160 desde imagen inicial: punto azul detectado dx -30.4, dy 12.1; efecto aplicado X -93, Y 37.' },
      '131': { x: 79, y: -10, note: 'QA v160 desde imagen inicial: punto azul detectado dx 24.5, dy -3.0; efecto aplicado X 79, Y -10.' },
      '132': { x: 62, y: 35, note: 'QA v160 desde imagen inicial: punto azul detectado dx 18.3, dy 10.5; efecto aplicado X 62, Y 35.' },
      '133': { x: -85, y: 37, note: 'QA v160 desde imagen inicial: punto azul detectado dx -26.3, dy 11.5; efecto aplicado X -85, Y 37.' },
      '134': { x: -65, y: 38, note: 'QA v160 desde imagen inicial: punto azul detectado dx -20.0, dy 11.8; efecto aplicado X -65, Y 38.' },
      '135': { x: -89, y: 45, note: 'QA v160 desde imagen inicial: punto azul detectado dx -32.0, dy 15.6; efecto aplicado X -89, Y 45.' },
      '136': { x: 62, y: 12, note: 'QA v160 desde imagen inicial: punto azul detectado dx 18.9, dy 3.7; efecto aplicado X 62, Y 12.' },
      '137': { x: -58, y: -12, note: 'QA v160 desde imagen inicial: punto azul detectado dx -18.0, dy -3.8; efecto aplicado X -58, Y -12.' },
      '138': { x: -82, y: 19, note: 'QA v160 desde imagen inicial: punto azul detectado dx -25.1, dy 5.9; efecto aplicado X -82, Y 19.' },
      '139': { x: -81, y: 0, note: 'QA v160 desde imagen inicial: punto azul detectado dx -25.0, dy 1.7; efecto aplicado X -81, Y 0.' },
      '140': { x: -55, y: -22, note: 'QA v160 desde imagen inicial: punto azul detectado dx -17.5, dy -6.8; efecto aplicado X -55, Y -22.' },
      '141': { x: -71, y: -25, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.9, dy -7.7; efecto aplicado X -71, Y -25.' },
      '142': { x: -93, y: 35, note: 'QA v160 desde imagen inicial: punto azul detectado dx -28.7, dy 10.9; efecto aplicado X -93, Y 35.' },
      '143': { x: 58, y: -50, note: 'QA v160 desde imagen inicial: punto azul detectado dx 17.8, dy -15.3; efecto aplicado X 58, Y -50.' },
      '144': { x: -70, y: -24, note: 'QA v160 desde imagen inicial: punto azul detectado dx -21.6, dy -7.5; efecto aplicado X -70, Y -24.' },
      '145': { x: 53, y: 85, note: 'QA v160 desde imagen inicial: punto azul detectado dx 19.1, dy 36.8; efecto aplicado X 53, Y 85.' },
      '146': { x: 66, y: -42, note: 'QA v160 desde imagen inicial: punto azul detectado dx 20.7, dy -13.1; efecto aplicado X 66, Y -42.' },
      '147': { x: -68, y: 74, note: 'QA v160 desde imagen inicial: punto azul detectado dx -42.9, dy 46.3; efecto aplicado X -68, Y 74.' },
      '148': { x: -97, y: 24, note: 'QA v160 desde imagen inicial: punto azul detectado dx -56.9, dy 12.7; efecto aplicado X -97, Y 24.' }
    };

    function applyShotQualityControlCorrections(shots) {
      if (!Array.isArray(shots)) return shots;
      shots.forEach((shot) => {
        if (!shot || !shot.code) return;
        const visual = IMAGE_EFFECT_QA_OVERRIDES[shot.code];
        if (visual) {
          const corrected = clampEffect(visual.x, visual.y);
          shot.visualEffect = corrected;
          shot.effect = corrected;
          shot.videoImageEffect = corrected;
          shot.effectQA = { corrected: true, note: visual.note };
          shot.tip = `${shot.tip} QA visual: efecto sincronizado con el punto azul de la imagen inicial.`;
        } else if (shot.effect) {
          const original = clampEffect(shot.effect.x || 0, shot.effect.y || 0);
          shot.visualEffect = original;
          shot.effectQA = { corrected: false, note: 'Sin corrección visual necesaria o imagen sin punto azul detectable.' };
        }
        shot.quality = validateShotQuality(shot);
      });
      return shots;
    }

    function validateShotQuality(shot) {
      const balls = Array.isArray(shot?.balls) ? shot.balls : [];
      const cue = balls.find(b => b.id === 'cue');
      const first = balls.find(b => b.id === shot?.first);
      const second = balls.find(b => b.id === shot?.second);
      const guidePath = Array.isArray(shot?.guidePath) ? shot.guidePath : [];
      const code = String(shot?.code || '').padStart(3, '0');
      const checks = {
        code,
        hasCue: !!cue,
        hasFirst: !!first,
        hasSecond: !!second,
        hasGuide: guidePath.length >= 3,
        guideStartsAtCue: false,
        reachesFirst: false,
        reachesSecond: false,
        railsBeforeCarom: 0,
        effectSynced: !!shot?.visualEffect,
        powerOk: Number.isFinite(Number(shot?.executionPower ?? shot?.power)) && Number(shot.executionPower ?? shot.power) >= 1 && Number(shot.executionPower ?? shot.power) <= 100,
        exactExecution: !!(shot?.strictGuide && shot?.exactGuidePath),
        status: 'pendiente'
      };
      if (cue && guidePath[0]) checks.guideStartsAtCue = Math.hypot(guidePath[0].x - cue.x, guidePath[0].y - cue.y) <= 28;
      const nearestIndex = (target, start = 0) => {
        if (!target) return -1;
        let best = -1;
        let bestDist = Infinity;
        for (let i = start; i < guidePath.length; i++) {
          const d = Math.hypot(guidePath[i].x - target.x, guidePath[i].y - target.y);
          if (d < bestDist) { bestDist = d; best = i; }
        }
        return best;
      };
      const firstIndex = nearestIndex(first, 1);
      const secondIndex = nearestIndex(second, Math.max(firstIndex + 1, 1));
      checks.reachesFirst = firstIndex >= 0 && first && Math.hypot(guidePath[firstIndex].x - first.x, guidePath[firstIndex].y - first.y) <= 46;
      checks.reachesSecond = secondIndex >= 0 && second && Math.hypot(guidePath[secondIndex].x - second.x, guidePath[secondIndex].y - second.y) <= 52;
      if (checks.hasGuide && firstIndex >= 0 && secondIndex > firstIndex) {
        checks.railsBeforeCarom = countGuideRailsBetween(guidePath, Math.max(firstIndex + 1, 1), secondIndex);
      }
      checks.threeBandsOk = checks.railsBeforeCarom >= 3 || shot?.validation?.railsBeforeSecond >= 3;
      checks.status = (checks.hasCue && checks.hasFirst && checks.hasSecond && checks.hasGuide && checks.guideStartsAtCue && checks.reachesFirst && checks.reachesSecond && checks.threeBandsOk && checks.effectSynced && checks.powerOk && checks.exactExecution) ? 'OK' : 'REVISAR';
      return checks;
    }

    function buildShotQualityReport(shots = practiceShots) {
      const items = (Array.isArray(shots) ? shots : []).map(shot => shot.quality || validateShotQuality(shot));
      const summary = {
        total: items.length,
        ok: items.filter(item => item.status === 'OK').length,
        revisar: items.filter(item => item.status !== 'OK').length,
        effectCorrections: (Array.isArray(shots) ? shots : []).filter(shot => shot?.effectQA?.corrected).length,
        exactExecution: items.filter(item => item.exactExecution).length,
        threeBandsOk: items.filter(item => item.threeBandsOk).length
      };
      return { summary, items };
    }

    const EXCLUDED_PRACTICE_SHOT_CODES = new Set(['080']);
    const practiceShots = applyReferenceGuideCorrections(buildPracticeShotLibrary())
      .filter(shot => !EXCLUDED_PRACTICE_SHOT_CODES.has(String(shot?.code || '').padStart(3, '0')))
      .map(shot => {
      if (shot && Number(shot.code) <= 60) {
        shot.exactGuidePath = true;
        const calibrated = Math.max(Number(shot.power) || 68, Number(shot.executionPower) || 0);
        shot.power = clamp(Math.round(calibrated), 1, 100);
        shot.executionPower = shot.power;
        shot.tip = `${shot.tip} Potencia física revisada para la jugada ${shot.code}: se carga en ${shot.power}% para dar recorrido suficiente en mesa real.`;
        applyFirstSixtyPhysicalOverride(shot);
        if (shot.videoImageEffect) {
          shot.effect = clampEffect(shot.videoImageEffect.x, shot.videoImageEffect.y);
          shot.tip = `${shot.tip} Efecto visual sincronizado con la imagen/video original.`;
        }
      }
      if (shot && shot.code) {
        const shotCode = String(shot.code).padStart(3, '0');
        shot.originalVideoTitle = shot.originalVideoTitle || shot.title;
        shot.title = `Jugada ${shotCode}`;
        shot.referenceGuideImage = `assets/jugadas/guia_referencia_${shotCode}.png`;
        shot.referenceGuideQA = 'Ruta visual extraída directamente de la imagen 2 (recorrido_guia.webp), sin guía inventada.';
      }
      return shot;
    });

    applyShotQualityControlCorrections(practiceShots);
    window.__BILLAR_PRACTICE_SHOTS__ = practiceShots;
    window.__BILLAR_QA_REPORT__ = () => buildShotQualityReport(practiceShots);
    window.__BILLAR_DYNAMIC_GUIDE_QA__ = () => practiceShots.map(s => ({
      code: s.code,
      ignored: s.code === '080',
      first: s.first,
      second: s.second,
      hasFirstBall: !!(Array.isArray(s.balls) && s.balls.find(b => b.id === s.first)),
      hasSecondBall: !!(Array.isArray(s.balls) && s.balls.find(b => b.id === s.second)),
      contactTarget: s.contactView?.target || s.first,
      hasContactTarget: !!(Array.isArray(s.balls) && s.balls.find(b => b.id === (s.contactView?.target || s.first))),
      visualEffect: s.visualEffect || s.effect,
      videoStart: formatVideoTimestamp(videoShotStartSeconds(s)),
      exactVideoSync: !!VIDEO_SYNC_LOCKED_SHOTS[s.code],
      referenceGuideImage: s.referenceGuideImage || null,
      referenceGuideQA: s.referenceGuideQA || null
    }));
    window.__BILLAR_VALIDATION__ = () => ({
      total: practiceShots.length,
      locked: practiceShots.filter(s => s.lockSync && s.strictGuide).length,
      recalibrated: practiceShots.filter(s => s.validation && s.validation.recalibrated).length,
      validated: practiceShots.filter(s => s.validation && s.validation.checked && s.validation.railsBeforeSecond >= 3).length,
      missingThreeBands: practiceShots.filter(s => !s.validation || s.validation.railsBeforeSecond < 3).map(s => s.code),
      quality: buildShotQualityReport(practiceShots).summary,
      referenceGuides: practiceShots.filter(s => !!s.referenceGuideImage).length
    });

    function buildPracticeShotLibrary() {
      const shots = [];
      const pad = n => String(n).padStart(3, '0');
      const limitX = x => Math.max(LEFT + 34, Math.min(RIGHT - 34, Math.round(x)));
      const limitY = y => Math.max(TOP + 34, Math.min(BOTTOM - 34, Math.round(y)));
      const ballObj = (id, name, x, y) => ({ id, name, x: limitX(x), y: limitY(y), vx: 0, vy: 0 });
      const add = (shot) => {
        const code = pad(shots.length + 1);
        shots.push(Object.assign({ code }, shot));
      };
      const jitter = (i, a, b, c = 0) => Math.sin((i + 1) * 1.618 + c) * a + Math.cos((i + 3) * .73 + c) * b;
      const clampPct = v => Math.max(-85, Math.min(85, Math.round(v)));
      const makeEffect = (x, y) => ({ x: clampPct(x), y: clampPct(y) });
      const makeAim = (x, y, label) => ({ x: limitX(x), y: limitY(y), label });
      const avoidOverlap = (balls) => {
        for (let pass = 0; pass < 5; pass++) {
          for (let a = 0; a < balls.length; a++) {
            for (let b = a + 1; b < balls.length; b++) {
              const dx = balls[b].x - balls[a].x;
              const dy = balls[b].y - balls[a].y;
              const d = Math.hypot(dx, dy) || 1;
              if (d < 56) {
                const push = (56 - d) / 2 + 2;
                const ux = dx / d, uy = dy / d;
                balls[a].x = limitX(balls[a].x - ux * push);
                balls[a].y = limitY(balls[a].y - uy * push);
                balls[b].x = limitX(balls[b].x + ux * push);
                balls[b].y = limitY(balls[b].y + uy * push);
              }
            }
          }
        }
        return balls;
      };
      const addDrill = ({ title, family, cue, yellow, red, aimAt, first, second, power, effect, route, focus, tip }) => {
        add({
          title,
          family,
          balls: avoidOverlap([
            ballObj('cue', 'Blanca', cue[0], cue[1]),
            ballObj('yellow', 'Amarilla', yellow[0], yellow[1]),
            ballObj('red', 'Roja', red[0], red[1])
          ]),
          aimAt: makeAim(aimAt[0], aimAt[1], aimAt[2] || 'punto de mira'),
          first,
          second,
          power: Math.max(35, Math.min(100, Math.round(power))),
          effect: makeEffect(effect[0], effect[1]),
          route,
          focus,
          tip
        });
      };

      // Biblioteca de 148 jugadas activas inspiradas en el método visual del video:
      // numeración 001-149 con la jugada 080 excluida por falta de assets; posición inicial, primer contacto, segunda bola, efecto, potencia y punto de mira.
      // La app permite afinar cada tiro con Ubicar bolas, efecto, potencia, replay y repetir tiro.
      for (let i = 0; i < 25; i++) {
        const row = i % 5, col = Math.floor(i / 5);
        const cue = [245 + col * 18 + jitter(i, 10, 6, 1), 300 + (row - 2) * 28 + jitter(i, 5, 4, 2)];
        const red = [690 + col * 25 + jitter(i, 12, 8, 3), 215 + (row - 2) * 18 + jitter(i, 6, 5, 4)];
        const yellow = [215 + row * 22 + jitter(i, 7, 5, 5), 205 + col * 35 + jitter(i, 5, 5, 6)];
        addDrill({
          title: 'Natural 3 bandas — bola fina',
          family: 'Serie 1/6 · patrón natural del video',
          cue, yellow, red,
          aimAt: [red[0] - 9, red[1] + (row - 2) * 1.5, 'mira fina a la roja'],
          first: 'red', second: 'yellow',
          power: 62 + col * 5 + row,
          effect: [48 + row * 4, -24 - col * 2],
          route: 'roja fina → banda larga → corta → larga → amarilla',
          focus: 'Salida natural con bola fina. Mantén la blanca corriendo con efecto arriba-derecha.',
          tip: 'Si se queda corta, sube 4% de potencia o 5 puntos de efecto derecho; si se pasa, baja el efecto.'
        });
      }

      for (let i = 0; i < 24; i++) {
        const row = i % 4, col = Math.floor(i / 4);
        const cue = [760 - col * 20 + jitter(i, 8, 7, 11), 290 + (row - 1.5) * 42 + jitter(i, 5, 4, 12)];
        const red = [430 - col * 7 + jitter(i, 10, 6, 13), 250 + (row - 1.5) * 30 + jitter(i, 6, 4, 14)];
        const yellow = [210 + col * 18 + jitter(i, 8, 6, 15), 215 + row * 58 + jitter(i, 6, 5, 16)];
        addDrill({
          title: 'Natural invertida — salida amplia',
          family: 'Serie 2/6 · espejo del patrón natural',
          cue, yellow, red,
          aimAt: [red[0] + 10, red[1], 'mira fina por derecha'],
          first: 'red', second: 'yellow',
          power: 58 + col * 4 + row * 2,
          effect: [-52 - row * 3, -22 - col],
          route: 'roja fina → larga opuesta → corta → larga → amarilla',
          focus: 'Mismo concepto en espejo: la salida debe abrirse sin perder velocidad.',
          tip: 'Si la blanca cierra demasiado, aumenta efecto izquierdo; si abre de más, baja efecto lateral.'
        });
      }

      for (let i = 0; i < 25; i++) {
        const row = i % 5, col = Math.floor(i / 5);
        const cue = [210 + col * 22 + jitter(i, 7, 6, 21), 355 + (row - 2) * 25 + jitter(i, 5, 3, 22)];
        const red = [560 + col * 38 + jitter(i, 10, 7, 23), 380 + (row - 2) * 15 + jitter(i, 6, 4, 24)];
        const yellow = [775 - row * 20 + jitter(i, 9, 5, 25), 190 + col * 16 + jitter(i, 5, 3, 26)];
        addDrill({
          title: 'Larga-corta-larga — media bola',
          family: 'Serie 3/6 · sistema visual de tres bandas',
          cue, yellow, red,
          aimAt: [red[0] - 3, red[1] - 2, 'media bola roja'],
          first: 'red', second: 'yellow',
          power: 67 + row + col * 3,
          effect: [-42 - row * 2, -18 - col * 2],
          route: 'roja → banda larga inferior → corta → larga superior → amarilla',
          focus: 'Contacto de media bola y recorrido en triángulo. Compara la línea guía con los diamantes.',
          tip: 'Si no alcanza la tercera banda, sube potencia; si cruza mucho, reduce efecto lateral.'
        });
      }

      for (let i = 0; i < 20; i++) {
        const row = i % 4, col = Math.floor(i / 4);
        const cue = [245 + col * 26 + jitter(i, 9, 6, 31), 165 + row * 38 + jitter(i, 5, 4, 32)];
        const red = [315 + col * 19 + jitter(i, 6, 5, 33), 95 + row * 14 + jitter(i, 4, 4, 34)];
        const yellow = [760 - col * 10 + jitter(i, 7, 4, 35), 335 + row * 22 + jitter(i, 5, 4, 36)];
        addDrill({
          title: 'Ticky — banda primero cerca de bola',
          family: 'Serie 4/6 · banda-bola-bandas-bola',
          cue, yellow, red,
          aimAt: [red[0] - 10, Math.max(TOP + 16, red[1] - 58), 'banda antes de roja'],
          first: 'red', second: 'yellow',
          power: 45 + row * 3 + col,
          effect: [62 + row * 3, -30 - col * 2],
          route: 'banda cercana → roja delgada → tres bandas → amarilla',
          focus: 'Primero banda muy cerca de la roja. El efecto debe abrir el recorrido sin pegarle fuerte.',
          tip: 'Si toca grueso, apunta más a banda; si no abre, aumenta efecto lateral.'
        });
      }

      for (let i = 0; i < 25; i++) {
        const row = i % 5, col = Math.floor(i / 5);
        const cue = [730 - col * 18 + jitter(i, 8, 6, 41), 300 + (row - 2) * 35 + jitter(i, 5, 4, 42)];
        const red = [500 + col * 20 + jitter(i, 8, 5, 43), 300 + (row - 2) * 20 + jitter(i, 6, 3, 44)];
        const yellow = [255 + row * 18 + jitter(i, 7, 5, 45), 235 + col * 34 + jitter(i, 5, 4, 46)];
        addDrill({
          title: '4 bandas — vuelta amplia',
          family: 'Serie 5/6 · extensión del recorrido',
          cue, yellow, red,
          aimAt: [red[0] + 9, red[1] + 1, 'roja delgada'],
          first: 'red', second: 'yellow',
          power: 76 + row * 2 + col * 2,
          effect: [-58 - row * 2, -20 - col],
          route: 'roja → cuatro bandas de vuelta → amarilla',
          focus: 'Vuelta grande con velocidad sostenida. Observa si la blanca se queda corta al tercer rebote.',
          tip: 'Si muere antes, sube potencia; si cruza lejos de la amarilla, reduce efecto lateral.'
        });
      }

      for (let i = 0; i < 20; i++) {
        const row = i % 4, col = Math.floor(i / 4);
        const cue = [190 + col * 28 + jitter(i, 7, 6, 51), 275 + (row - 1.5) * 36 + jitter(i, 5, 4, 52)];
        const red = [385 + col * 35 + jitter(i, 9, 5, 53), 170 + row * 32 + jitter(i, 5, 4, 54)];
        const yellow = [805 - col * 12 + jitter(i, 8, 5, 55), 260 + (row - 1.5) * 26 + jitter(i, 5, 4, 56)];
        addDrill({
          title: '5 bandas — control de mesa larga',
          family: 'Serie 6/6 · medición de velocidad',
          cue, yellow, red,
          aimAt: [red[0] - 5, red[1] + 3, 'media bola'],
          first: 'red', second: 'yellow',
          power: 84 + row * 2 + col,
          effect: [52 + row * 4, -16 - col],
          route: 'roja → recorrido largo de cinco bandas → amarilla',
          focus: 'Mide la mesa: aquí 3% de potencia cambia mucho la llegada.',
          tip: 'Repite con replay; si llega abierta, baja efecto; si no llega, sube potencia.'
        });
      }

      for (let i = 0; i < 10; i++) {
        const row = i % 5, col = Math.floor(i / 5);
        const cue = [610 + col * 55 + jitter(i, 8, 5, 61), 210 + row * 48 + jitter(i, 5, 4, 62)];
        const red = [455 + col * 35 + jitter(i, 7, 5, 63), 250 + row * 26 + jitter(i, 4, 3, 64)];
        const yellow = [260 + row * 25 + jitter(i, 7, 5, 65), 390 - col * 58 + jitter(i, 4, 3, 66)];
        addDrill({
          title: 'Contraefecto y control fino',
          family: 'Serie final · corrección y precisión',
          cue, yellow, red,
          aimAt: [red[0] + (col ? -10 : 10), red[1], 'contacto fino controlado'],
          first: 'red', second: 'yellow',
          power: 54 + row * 4 + col * 6,
          effect: [col ? 48 : -48, 18 - row * 5],
          route: 'roja controlada → bandas con contraefecto → amarilla',
          focus: 'Trabaja la diferencia entre correr y frenar la blanca con el mismo punto de mira.',
          tip: 'Si la línea se alarga, usa menos arriba; si se frena, agrega corrido o potencia.'
        });
      }
      // Ajuste exacto de la jugada 001 según las dos imágenes compartidas por el usuario.
      shots[0] = {
        code: '001',
        title: 'Jugada 001 del video — configuración exacta',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 275, 348),
          ballObj('yellow', 'Amarilla', 275, 286),
          ballObj('red', 'Roja', 708, 286)
        ]),
        aimAt: makeAim(708, 286, 'taco apuntando directo a la roja'),
        first: 'red',
        second: 'yellow',
        power: 70,
        effect: makeEffect(42, -28),
        route: 'roja → banda superior/derecha → banda inferior → banda izquierda → cierre a la amarilla',
        focus: 'Jugada inicial configurada para que el taco apunte hacia la roja. La salida de referencia queda revisada con tres bandas antes del cierre a la amarilla.',
        tip: 'Taco apuntando directo a la roja, con salida amplia por tres bandas. Si la blanca llega corta, aumenta un poco la potencia; si se abre demasiado, reduce efecto lateral.',
        referenceImages: practiceReferenceImages['001'],
        guidePath: [
          { x: 275, y: 348 },
          { x: 708, y: 286 },
          { x: 925, y: 78 },
          { x: 515, y: 500 },
          { x: 54, y: 315 },
          { x: 275, y: 286 }
        ],
        validation: { railsBeforeSecond: 3, qaNote: 'v202: guía 001 revisada para 3 bandas antes de la carambola.' }
      };

      // Ajuste de la jugada 002 según las dos imágenes compartidas por el usuario.
      shots[1] = {
        code: '002',
        title: 'Jugada 002 del video — roja izquierda y amarilla derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 815, 370),
          ballObj('yellow', 'Amarilla', 905, 425),
          ballObj('red', 'Roja', 318, 392)
        ]),
        aimAt: makeAim(318, 392, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 78,
        effect: makeEffect(55, -42),
        route: 'roja → banda larga inferior → banda corta izquierda → banda larga superior → salida a la derecha → amarilla',
        focus: 'Replica la imagen 002: roja sola en la zona izquierda baja, blanca al lado derecho y amarilla cerca de la banda derecha inferior. El recorrido debe abrirse por la izquierda antes de llegar a la amarilla.',
        tip: 'Golpea la roja controlada con efecto arriba-derecha. Si la blanca llega corta, sube potencia; si se abre mucho hacia la banda larga, reduce efecto lateral.',
        referenceImages: practiceReferenceImages['002'],
        guidePath: [
          { x: 815, y: 370 },
          { x: 318, y: 392 },
          { x: 286, y: 500 },
          { x: 70, y: 355 },
          { x: 320, y: 86 },
          { x: 815, y: 370 },
          { x: 905, y: 425 }
        ]
      };

      // Ajuste de la jugada 003 según las dos imágenes compartidas por el usuario.
      shots[2] = {
        code: '003',
        title: 'Jugada 003 del video — roja central, blanca y amarilla a la derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 804, 378),
          ballObj('yellow', 'Amarilla', 909, 425),
          ballObj('red', 'Roja', 542, 381)
        ]),
        aimAt: makeAim(542, 381, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 76,
        effect: makeEffect(53, -40),
        route: 'roja → banda larga inferior → banda corta izquierda → banda larga superior → salida a blanca/amarilla → amarilla',
        focus: 'Replica la imagen 003: roja en la parte media-baja de la mesa, blanca a la derecha y amarilla cerca de la esquina inferior derecha. La línea debe hacer una vuelta amplia por la izquierda y regresar a la zona derecha.',
        tip: 'Golpea la roja con efecto arriba-derecha y velocidad media-alta. Si la blanca se queda corta antes de volver a la derecha, sube un poco la potencia. Si sale demasiado abierta, baja el efecto lateral.',
        referenceImages: practiceReferenceImages['003'],
        guidePath: [
          { x: 804, y: 378 },
          { x: 542, y: 381 },
          { x: 445, y: 500 },
          { x: 70, y: 355 },
          { x: 300, y: 86 },
          { x: 785, y: 365 },
          { x: 909, y: 425 }
        ]
      };

      // Ajuste de la jugada 004 según las dos imágenes compartidas por el usuario.
      shots[3] = {
        code: '004',
        title: 'Jugada 004 del video — roja y blanca juntas a la derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 798, 382),
          ballObj('yellow', 'Amarilla', 912, 428),
          ballObj('red', 'Roja', 713, 380)
        ]),
        aimAt: makeAim(713, 380, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 74,
        effect: makeEffect(52, -38),
        route: 'roja → banda larga inferior → banda corta izquierda → banda larga superior → regreso diagonal → apoyo en banda inferior → amarilla',
        focus: 'Replica la imagen 004: roja y blanca muy próximas en la zona derecha, con la amarilla cerca de la esquina inferior derecha. El recorrido sale de la roja, da una vuelta amplia por la izquierda y vuelve a la derecha para cerrar sobre la amarilla.',
        tip: 'Ataca la roja con una fina salida y efecto arriba-derecha. Si la blanca no regresa lo suficiente a la derecha, aumenta ligeramente la potencia; si se abre demasiado, reduce el efecto lateral.',
        referenceImages: practiceReferenceImages['004'],
        guidePath: [
          { x: 798, y: 382 },
          { x: 713, y: 380 },
          { x: 620, y: 500 },
          { x: 82, y: 330 },
          { x: 182, y: 86 },
          { x: 812, y: 374 },
          { x: 912, y: 428 }
        ]
      };

      // Ajuste de la jugada 005 según las dos imágenes compartidas por el usuario.
      shots[4] = {
        code: '005',
        title: 'Jugada 005 del video — amarilla y blanca a la derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 805, 382),
          ballObj('yellow', 'Amarilla', 746, 398),
          ballObj('red', 'Roja', 912, 428)
        ]),
        aimAt: makeAim(746, 398, 'mira fina a la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 76,
        effect: makeEffect(54, -39),
        route: 'amarilla fina → banda larga inferior → banda corta izquierda → banda larga superior → regreso a la derecha → roja',
        focus: 'Replica la imagen 005: amarilla y blanca próximas en la zona derecha, con la roja junto a la esquina inferior derecha. La blanca debe salir con contacto fino a la amarilla, apoyar cerca de la banda inferior, hacer la vuelta amplia por la izquierda y cerrar sobre la roja.',
        tip: 'Si no alcanza a volver hasta la roja, aumenta ligeramente la potencia. Si se pasa o se abre mucho, reduce el efecto derecho o apunta más fino a la amarilla.',
        referenceImages: practiceReferenceImages['005'],
        guidePath: [
          { x: 805, y: 382 },
          { x: 746, y: 398 },
          { x: 734, y: 500 },
          { x: 70, y: 320 },
          { x: 230, y: 86 },
          { x: 705, y: 365 },
          { x: 805, y: 382 },
          { x: 912, y: 428 }
        ]
      };

      // Ajuste de la jugada 006 según las dos imágenes compartidas por el usuario.
      shots[5] = {
        code: '006',
        title: 'Jugada 006 del video — roja y blanca centrales',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 584, 360),
          ballObj('yellow', 'Amarilla', 837, 461),
          ballObj('red', 'Roja', 502, 373)
        ]),
        aimAt: makeAim(502, 373, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 76,
        effect: makeEffect(54, -40),
        route: 'roja → banda corta izquierda → banda larga superior → banda corta derecha → amarilla',
        focus: 'Replica la imagen 006: roja y blanca muy cercanas en la zona media, con la amarilla cerca de la banda inferior derecha. El recorrido debe abrirse por la izquierda y cerrar sobre la amarilla.',
        tip: 'Golpea la roja con efecto arriba-derecha y velocidad media-alta. Si la blanca no cierra hacia la amarilla, sube un poco la potencia; si llega demasiado larga, baja el efecto lateral.',
        referenceImages: practiceReferenceImages['006'],
        guidePath: [
          { x: 584, y: 360 },
          { x: 502, y: 373 },
          { x: 70, y: 315 },
          { x: 245, y: 86 },
          { x: 918, y: 384 },
          { x: 837, y: 461 }
        ]
      };


      // Ajuste de la jugada 007 según las dos imágenes compartidas por el usuario.
      shots[6] = {
        code: '007',
        title: 'Jugada 007 del video — roja y blanca juntas en el centro',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 545, 386),
          ballObj('yellow', 'Amarilla', 925, 403),
          ballObj('red', 'Roja', 490, 405)
        ]),
        aimAt: makeAim(490, 405, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 73,
        effect: makeEffect(50, -36),
        route: 'roja fina → vuelta por la izquierda → banda larga inferior derecha → amarilla',
        focus: 'Replica la imagen 007: roja y blanca casi juntas en el centro de la mesa y amarilla pegada al lado derecho. La blanca debe salir de la roja, hacer la vuelta amplia por la izquierda y cerrar hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-derecha. Si la blanca no alcanza el cierre a la derecha, aumenta un poco la potencia; si se abre demasiado, reduce efecto lateral.',
        referenceImages: practiceReferenceImages['007'],
        guidePath: [
          { x: 545, y: 386 },
          { x: 490, y: 405 },
          { x: 710, y: 500 },
          { x: 70, y: 315 },
          { x: 110, y: 86 },
          { x: 555, y: 386 },
          { x: 760, y: 500 },
          { x: 925, y: 403 }
        ]
      };

      // Ajuste de la jugada 008 según las dos imágenes compartidas por el usuario.
      shots[7] = {
        code: '008',
        title: 'Jugada 008 del video — cierre desde la derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 710, 430),
          ballObj('yellow', 'Amarilla', 900, 395),
          ballObj('red', 'Roja', 635, 395)
        ]),
        aimAt: makeAim(635, 395, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 72,
        effect: makeEffect(48, -36),
        route: 'roja → apoyo inferior → banda corta izquierda → banda larga superior → cierre a la amarilla',
        focus: 'Replica la imagen 008: roja en zona media-baja, blanca a la derecha y un poco más abajo, y amarilla al lado derecho. La blanca debe tocar la roja, apoyar abajo, hacer la vuelta grande por la izquierda y cerrar hacia la amarilla.',
        tip: 'Ataca la roja con efecto arriba-derecha. Si la blanca queda corta, sube un poco la potencia; si llega muy abierta por la derecha, reduce efecto lateral o apunta más fino.',
        referenceImages: practiceReferenceImages['008'],
        guidePath: [
          { x: 710, y: 430 },
          { x: 635, y: 395 },
          { x: 520, y: 500 },
          { x: 70, y: 320 },
          { x: 245, y: 86 },
          { x: 850, y: 360 },
          { x: 900, y: 395 }
        ]
      };

      // Ajuste de la jugada 009 según las dos imágenes compartidas por el usuario.
      shots[8] = {
        code: '009',
        title: 'Jugada 009 del video — roja media y amarilla a la derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 665, 438),
          ballObj('yellow', 'Amarilla', 905, 395),
          ballObj('red', 'Roja', 595, 404)
        ]),
        aimAt: makeAim(595, 404, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 73,
        effect: makeEffect(49, -35),
        route: 'roja → banda izquierda → banda superior → banda derecha → amarilla',
        focus: 'Replica la imagen 009: roja en la zona media-baja, blanca a su derecha y un poco más abajo, y amarilla cerca del lado derecho. La blanca debe tocar la roja, salir hacia la banda izquierda, subir a la banda superior, bajar hacia la banda derecha y cerrar en la amarilla.',
        tip: 'En la jugada 009 la ruta correcta es izquierda → superior → derecha antes del cierre. Si quieres compararla con el video, usa la técnica guiada y fíjate en que el último apoyo salga por la banda derecha antes de tocar la amarilla.',
        referenceImages: practiceReferenceImages['009'],
        guidePath: [
          { x: 665, y: 438 },
          { x: 595, y: 404 },
          { x: 70, y: 325 },
          { x: 225, y: 86 },
          { x: 930, y: 362 },
          { x: 900, y: 395 }
        ]
      };

      // Ajuste de la jugada 010 según las dos imágenes compartidas por el usuario.
      shots[9] = {
        code: '010',
        title: 'Jugada 010 del video — cierre bajo a la derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 655, 438),
          ballObj('yellow', 'Amarilla', 900, 398),
          ballObj('red', 'Roja', 613, 405)
        ]),
        aimAt: makeAim(613, 405, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 74,
        effect: makeEffect(48, -34),
        route: 'roja → banda corta izquierda → banda larga superior → banda larga inferior derecha → amarilla',
        focus: 'Replica la imagen 010: roja en la zona media-baja, blanca abajo a la derecha de la roja y amarilla cerca de la banda derecha. La blanca debe tocar la roja, abrir por la izquierda, subir a banda superior y cerrar por abajo hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-derecha y potencia media-alta. Si la blanca no llega a cerrar abajo hacia la amarilla, sube un poco la potencia; si se pasa, reduce el efecto lateral.',
        referenceImages: practiceReferenceImages['010'],
        guidePath: [
          { x: 655, y: 438 },
          { x: 613, y: 405 },
          { x: 70, y: 325 },
          { x: 225, y: 86 },
          { x: 858, y: 500 },
          { x: 900, y: 398 }
        ]
      };

      // Ajuste de la jugada 011 según las dos imágenes compartidas por el usuario.
      shots[10] = {
        code: '011',
        title: 'Jugada 011 del video — roja izquierda y cierre a amarilla',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 775, 300),
          ballObj('yellow', 'Amarilla', 852, 482),
          ballObj('red', 'Roja', 105, 296)
        ]),
        aimAt: makeAim(105, 296, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 76,
        effect: makeEffect(50, -36),
        route: 'roja → banda corta izquierda → banda larga superior → regreso a la derecha → amarilla',
        focus: 'Replica la imagen 011: roja cerca de la banda izquierda, blanca en la zona media derecha y amarilla en la parte baja derecha. La blanca debe salir de la roja, abrir por la izquierda, subir y cerrar hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-derecha y potencia media-alta. Si no cierra hasta la amarilla, sube la potencia; si llega demasiado abierta, reduce el efecto lateral.',
        referenceImages: practiceReferenceImages['011'],
        guidePath: [
          { x: 775, y: 300 },
          { x: 105, y: 296 },
          { x: 70, y: 295 },
          { x: 265, y: 86 },
          { x: 910, y: 405 },
          { x: 852, y: 482 }
        ]
      };

      // Ajuste de la jugada 012 según las dos imágenes compartidas por el usuario.
      shots[11] = {
        code: '012',
        title: 'Jugada 012 del video — roja izquierda baja y cierre a amarilla',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 775, 305),
          ballObj('yellow', 'Amarilla', 905, 407),
          ballObj('red', 'Roja', 125, 305)
        ]),
        aimAt: makeAim(125, 305, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 77,
        effect: makeEffect(50, -36),
        route: 'roja → banda corta izquierda → banda larga superior → banda larga inferior derecha → amarilla',
        focus: 'Replica la imagen 012: roja cerca de la banda corta izquierda, blanca en la zona media derecha y amarilla cerca de la banda inferior derecha. La blanca viaja a la roja, abre por la izquierda, sube a banda superior y cierra abajo hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-derecha y potencia media-alta. Si no alcanza el cierre bajo, sube un poco la potencia; si llega demasiado larga, reduce el efecto lateral.',
        referenceImages: practiceReferenceImages['012'],
        guidePath: [
          { x: 775, y: 305 },
          { x: 125, y: 305 },
          { x: 70, y: 295 },
          { x: 245, y: 86 },
          { x: 760, y: 500 },
          { x: 905, y: 407 }
        ]
      };

      // Ajuste de la jugada 013 según las dos imágenes compartidas por el usuario.
      shots[12] = {
        code: '013',
        title: 'Jugada 013 del video — blanca bajo roja y amarilla izquierda',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 508, 370),
          ballObj('yellow', 'Amarilla', 248, 410),
          ballObj('red', 'Roja', 508, 280)
        ]),
        aimAt: makeAim(508, 280, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 68,
        effect: makeEffect(-42, -55),
        route: 'roja → subida izquierda → banda corta izquierda → banda larga inferior izquierda → amarilla',
        focus: 'Replica la imagen 013: blanca debajo de la roja en el centro y amarilla en la zona baja izquierda. La blanca toca la roja, sube hacia la izquierda, abre por la banda corta y cierra hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-izquierda. Si la blanca no alcanza a cerrar sobre la amarilla, sube un poco la potencia; si llega larga, baja el efecto lateral o reduce potencia.',
        referenceImages: practiceReferenceImages['013'],
        guidePath: [
          { x: 508, y: 370 },
          { x: 508, y: 280 },
          { x: 470, y: 248 },
          { x: 300, y: 86 },
          { x: 70, y: 320 },
          { x: 165, y: 500 },
          { x: 248, y: 410 }
        ]
      };

      // Ajuste de la jugada 014 según las dos imágenes compartidas por el usuario.
      shots[13] = {
        code: '014',
        title: 'Jugada 014 del video — cierre corto a amarilla izquierda',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 434, 379),
          ballObj('yellow', 'Amarilla', 233, 445),
          ballObj('red', 'Roja', 484, 266)
        ]),
        aimAt: makeAim(484, 266, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 68,
        effect: makeEffect(-42, -38),
        route: 'roja → banda larga superior izquierda → banda corta izquierda → banda larga inferior → amarilla',
        focus: 'Replica la imagen 014: amarilla abajo a la izquierda, blanca central baja y roja encima. La blanca debe subir hacia la roja, abrir a la izquierda y cerrar sobre la amarilla.',
        tip: 'Usa efecto arriba-izquierda y velocidad media. Si no llega a la amarilla, sube un poco la potencia; si se abre demasiado, baja el efecto lateral.',
        referenceImages: practiceReferenceImages['014'],
        guidePath: [
          { x: 434, y: 379 },
          { x: 484, y: 266 },
          { x: 330, y: 86 },
          { x: 70, y: 325 },
          { x: 150, y: 500 },
          { x: 233, y: 445 }
        ]
      };

      // Ajuste de la jugada 015 según las dos imágenes compartidas por el usuario.
      shots[14] = {
        code: '015',
        title: 'Jugada 015 del video — roja central y amarilla superior derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 520, 365),
          ballObj('yellow', 'Amarilla', 730, 88),
          ballObj('red', 'Roja', 498, 198)
        ]),
        aimAt: makeAim(498, 198, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 70,
        effect: makeEffect(-38, -45),
        route: 'roja → banda larga superior izquierda → banda corta izquierda → banda larga inferior izquierda → salida diagonal a amarilla',
        focus: 'Replica la imagen 015: roja en la zona central, blanca debajo de la roja y amarilla en la parte superior derecha. La blanca debe tocar la roja, abrir por la izquierda y salir en diagonal hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-izquierda y potencia media. Si la blanca no alcanza la amarilla, sube un poco la potencia; si se pasa alta, reduce efecto lateral o apunta más fino a la roja.',
        referenceImages: practiceReferenceImages['015'],
        guidePath: [
          { x: 520, y: 365 },
          { x: 498, y: 198 },
          { x: 330, y: 86 },
          { x: 75, y: 320 },
          { x: 175, y: 500 },
          { x: 730, y: 88 }
        ]
      };

      // Ajuste de la jugada 016 según las dos imágenes compartidas por el usuario.
      shots[15] = {
        code: '016',
        title: 'Jugada 016 del video — roja central alta y amarilla superior derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 510, 365),
          ballObj('yellow', 'Amarilla', 885, 95),
          ballObj('red', 'Roja', 500, 205)
        ]),
        aimAt: makeAim(500, 205, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 71,
        effect: makeEffect(-48, -42),
        route: 'roja → banda larga inferior izquierda → banda corta izquierda → banda larga superior → salida a amarilla',
        focus: 'Replica la imagen 016: roja en la zona central alta, blanca debajo de la roja y amarilla cerca de la parte superior derecha. La blanca debe tocar la roja, hacer la vuelta por la izquierda y cerrar hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-izquierda y potencia media-alta. Si la blanca no alcanza la amarilla, aumenta un poco la potencia; si llega muy alta, reduce el efecto lateral.',
        referenceImages: practiceReferenceImages['016'],
        guidePath: [
          { x: 510, y: 365 },
          { x: 500, y: 205 },
          { x: 250, y: 500 },
          { x: 70, y: 315 },
          { x: 330, y: 86 },
          { x: 885, y: 95 }
        ]
      };

      // Ajuste de la jugada 017 según las dos imágenes compartidas por el usuario.
      shots[16] = {
        code: '017',
        title: 'Jugada 017 del video — roja izquierda y amarilla superior derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 380, 388),
          ballObj('yellow', 'Amarilla', 650, 170),
          ballObj('red', 'Roja', 280, 345)
        ]),
        aimAt: makeAim(280, 345, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 70,
        effect: makeEffect(-46, -40),
        route: 'roja → banda larga inferior izquierda → banda corta izquierda → banda larga superior → regreso al centro → amarilla',
        focus: 'Replica la imagen 017: roja a la izquierda, blanca centro-baja y amarilla arriba a la derecha. La blanca debe tomar la roja, hacer la vuelta por el lado izquierdo y salir en diagonal hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-izquierda y potencia media. Si la blanca no alcanza la amarilla, sube ligeramente la potencia; si llega muy abierta, reduce el efecto lateral.',
        referenceImages: practiceReferenceImages['017'],
        guidePath: [
          { x: 380, y: 388 },
          { x: 280, y: 345 },
          { x: 180, y: 500 },
          { x: 70, y: 320 },
          { x: 180, y: 86 },
          { x: 380, y: 388 },
          { x: 650, y: 170 }
        ]
      };

      // Ajuste de la jugada 018 según las dos imágenes compartidas por el usuario.
      shots[17] = {
        code: '018',
        title: 'Jugada 018 del video — roja izquierda y amarilla superior derecha',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 380, 365),
          ballObj('yellow', 'Amarilla', 885, 95),
          ballObj('red', 'Roja', 280, 330)
        ]),
        aimAt: makeAim(280, 330, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 72,
        effect: makeEffect(-48, -42),
        route: 'roja → banda superior izquierda → banda izquierda → banda inferior izquierda → salida diagonal a la amarilla superior derecha',
        focus: 'Replica la imagen 018: roja en la zona izquierda-media, blanca un poco a la derecha y abajo, y amarilla cerca de la esquina superior derecha. La blanca debe tocar la roja, hacer la vuelta por el lado izquierdo y salir en diagonal hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-izquierda y potencia media-alta. La línea verde debe formar el rombo de la imagen antes de abrir hacia la amarilla superior derecha.',
        referenceImages: practiceReferenceImages['018'],
        guidePath: [
          { x: 380, y: 365 },
          { x: 280, y: 330 },
          { x: 205, y: 86 },
          { x: 70, y: 315 },
          { x: 250, y: 500 },
          { x: 885, y: 95 }
        ]
      };



      // Ajuste de la jugada 019 según las dos imágenes compartidas por el usuario.
      shots[18] = {
        code: '019',
        title: 'Jugada 019 del video — cierre a la amarilla superior izquierda',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 835, 258),
          ballObj('yellow', 'Amarilla', 160, 95),
          ballObj('red', 'Roja', 805, 100)
        ]),
        aimAt: makeAim(805, 100, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 76,
        effect: makeEffect(45, 38),
        route: 'roja → banda superior derecha → banda derecha → diagonal al fondo → banda izquierda → amarilla superior izquierda',
        focus: 'Replica la imagen 019: amarilla cerca de la esquina superior izquierda, roja arriba a la derecha y blanca más abajo a la derecha. La blanca debe tocar la roja, hacer la vuelta corta por el lado derecho y luego cruzar la mesa hacia la amarilla.',
        tip: 'Golpea la roja con efecto abajo-derecha y potencia media-alta. La línea verde debe formar el pequeño rombo en la derecha, bajar en diagonal al fondo y cerrar hacia la amarilla superior izquierda.',
        referenceImages: practiceReferenceImages['019'],
        guidePath: [
          { x: 835, y: 258 },
          { x: 805, y: 100 },
          { x: 835, y: 66 },
          { x: 930, y: 130 },
          { x: 835, y: 258 },
          { x: 585, y: 500 },
          { x: 72, y: 188 },
          { x: 160, y: 95 }
        ]
      };

      // Ajuste de la jugada 020 según las imágenes compartidas por el usuario.
      shots[19] = {
        code: '020',
        title: 'Jugada 020 del video — cierre a la amarilla izquierda',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 835, 275),
          ballObj('yellow', 'Amarilla', 108, 288),
          ballObj('red', 'Roja', 805, 98)
        ]),
        aimAt: makeAim(805, 98, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 77,
        effect: makeEffect(45, 42),
        route: 'roja → banda superior derecha → banda derecha → regreso a zona de salida → banda inferior central → amarilla izquierda',
        focus: 'Replica la imagen 020: amarilla en el costado izquierdo, roja arriba a la derecha y blanca más abajo a la derecha. La blanca debe tocar la roja, hacer la vuelta corta por la derecha, bajar a la banda inferior y cerrar hacia la amarilla del costado izquierdo.',
        tip: 'Golpea la roja con efecto abajo-derecha y potencia media-alta. La línea verde debe formar el pequeño rombo en la derecha, bajar al centro inferior y regresar hacia la amarilla izquierda.',
        referenceImages: practiceReferenceImages['020'],
        guidePath: [
          { x: 835, y: 275 },
          { x: 805, y: 98 },
          { x: 875, y: 65 },
          { x: 930, y: 115 },
          { x: 835, y: 275 },
          { x: 445, y: 500 },
          { x: 108, y: 288 }
        ]
      };

      // Ajuste de la jugada 021 según las imágenes compartidas por el usuario.
      shots[20] = {
        code: '021',
        title: 'Jugada 021 del video — cierre a la amarilla baja izquierda',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 835, 288),
          ballObj('yellow', 'Amarilla', 92, 402),
          ballObj('red', 'Roja', 805, 100)
        ]),
        aimAt: makeAim(805, 100, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 77,
        effect: makeEffect(44, 42),
        route: 'roja → banda superior derecha → banda derecha → diagonal al fondo → amarilla baja izquierda',
        focus: 'Replica la imagen 021: amarilla en la parte baja izquierda, roja cerca de la parte superior derecha y blanca debajo de la roja. La blanca debe tocar la roja, hacer la vuelta corta por la derecha, cruzar hacia la banda inferior izquierda y cerrar hacia la amarilla.',
        tip: 'Golpea la roja con efecto abajo-derecha y potencia media-alta. La línea verde debe formar la vuelta corta en la derecha y luego abrir en diagonal hasta la zona baja izquierda antes de cerrar en la amarilla.',
        referenceImages: practiceReferenceImages['021'],
        guidePath: [
          { x: 835, y: 288 },
          { x: 805, y: 100 },
          { x: 865, y: 62 },
          { x: 930, y: 118 },
          { x: 255, y: 500 },
          { x: 92, y: 402 }
        ]
      };



      // Ajuste de la jugada 022 según las imágenes compartidas por el usuario.
      shots[21] = {
        code: '022',
        title: 'Jugada 022 del video — cierre a la amarilla inferior izquierda',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 668, 356),
          ballObj('yellow', 'Amarilla', 96, 456),
          ballObj('red', 'Roja', 642, 304)
        ]),
        aimAt: makeAim(642, 304, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 79,
        effect: makeEffect(-45, -40),
        route: 'roja → banda superior izquierda → banda inferior central → banda derecha → banda superior derecha → banda inferior izquierda → amarilla',
        focus: 'Replica la imagen 022: amarilla muy baja a la izquierda, roja en zona media-derecha y blanca justo debajo de la roja. La blanca debe tocar la roja, hacer un recorrido cruzado amplio por las bandas y cerrar hacia la amarilla inferior izquierda.',
        tip: 'Golpea la roja con efecto arriba-izquierda y potencia media-alta. La línea verde debe formar el cruce grande de la imagen antes de cerrar sobre la amarilla.',
        referenceImages: practiceReferenceImages['022'],
        guidePath: [
          { x: 668, y: 356 },
          { x: 642, y: 304 },
          { x: 220, y: 70 },
          { x: 545, y: 500 },
          { x: 930, y: 328 },
          { x: 720, y: 70 },
          { x: 60, y: 430 },
          { x: 96, y: 456 }
        ]
      };


      // Ajuste de la jugada 023 según las imágenes compartidas por el usuario.
      shots[22] = {
        code: '023',
        title: 'Jugada 023 del video — vuelta amplia y cierre a la amarilla inferior izquierda',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 724, 354),
          ballObj('yellow', 'Amarilla', 98, 456),
          ballObj('red', 'Roja', 642, 314)
        ]),
        aimAt: makeAim(642, 314, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 78,
        effect: makeEffect(-44, -38),
        route: 'roja → banda izquierda media → esquina baja izquierda → banda superior → banda derecha → regreso a la blanca → cierre a la amarilla baja izquierda',
        focus: 'Replica la imagen 023: amarilla en la parte baja izquierda, roja en la zona media-derecha y blanca a la derecha de la roja. La línea verde debe formar la salida hacia la izquierda, la vuelta amplia por arriba y el cierre a la amarilla inferior izquierda.',
        tip: 'Golpea la roja con efecto arriba-izquierda y potencia media-alta. Compara la línea verde con la imagen: salida larga a la izquierda, triángulo amplio y cierre abajo a la amarilla.',
        referenceImages: practiceReferenceImages['023'],
        guidePath: [
          { x: 724, y: 354 },
          { x: 642, y: 314 },
          { x: 60, y: 350 },
          { x: 78, y: 430 },
          { x: 98, y: 456 },
          { x: 78, y: 430 },
          { x: 705, y: 70 },
          { x: 930, y: 280 },
          { x: 724, y: 354 }
        ]
      };

      // Ajuste de la jugada 024 según las imágenes compartidas por el usuario.
      shots[23] = {
        code: '024',
        title: 'Jugada 024 del video — contacto a la amarilla y cierre a la roja',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 665, 370),
          ballObj('yellow', 'Amarilla', 640, 305),
          ballObj('red', 'Roja', 330, 355)
        ]),
        aimAt: makeAim(640, 305, 'mira a la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 78,
        effect: makeEffect(-46, -34),
        route: 'amarilla → banda superior izquierda → banda izquierda → banda inferior → banda derecha → roja',
        focus: 'Replica la imagen 024: la blanca está debajo de la amarilla, la roja queda en la zona izquierda-media. El recorrido debe iniciar con contacto a la amarilla y cerrar sobre la roja después de la vuelta amplia por bandas.',
        tip: 'Golpea la amarilla con efecto arriba-izquierda y potencia media-alta. Compara la línea verde: salida hacia la zona superior izquierda, vuelta amplia y llegada final a la roja.',
        referenceImages: practiceReferenceImages['024'],
        guidePath: [
          { x: 665, y: 370 },
          { x: 640, y: 305 },
          { x: 300, y: 86 },
          { x: 70, y: 300 },
          { x: 440, y: 500 },
          { x: 925, y: 320 },
          { x: 330, y: 355 }
        ]
      };

      // Ajuste de la jugada 025 según las imágenes compartidas por el usuario.
      shots[24] = {
        code: '025',
        title: 'Jugada 025 del video — vuelta amplia y cierre a la amarilla inferior izquierda',
        family: 'Video original · posición inicial + recorrido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 135, 205),
          ballObj('yellow', 'Amarilla', 145, 455),
          ballObj('red', 'Roja', 154, 105)
        ]),
        aimAt: makeAim(154, 105, 'mira a la roja'),
        first: 'red',
        second: 'yellow',
        power: 80,
        effect: makeEffect(-46, -38),
        route: 'roja → banda superior izquierda → banda izquierda → banda inferior central → banda superior derecha → banda inferior → amarilla',
        focus: 'Replica la imagen 025: roja arriba a la izquierda, blanca debajo de la roja y amarilla en la esquina inferior izquierda. La blanca debe tocar la roja, hacer la vuelta corta arriba a la izquierda, cruzar la mesa y cerrar por abajo hacia la amarilla.',
        tip: 'Golpea la roja con efecto arriba-izquierda y potencia media-alta. La línea verde debe formar el pequeño rombo de salida a la izquierda, bajar al centro inferior, subir a la derecha y regresar para cerrar en la amarilla.',
        referenceImages: practiceReferenceImages['025'],
        guidePath: [
          { x: 135, y: 205 },
          { x: 154, y: 105 },
          { x: 110, y: 64 },
          { x: 66, y: 108 },
          { x: 455, y: 500 },
          { x: 835, y: 70 },
          { x: 930, y: 125 },
          { x: 520, y: 500 },
          { x: 168, y: 430 },
          { x: 145, y: 455 }
        ]
      };

      // Ajuste exacto de la jugada 026 según las imágenes del video compartidas por el usuario.
      // Esta es la carambola tipo "diamante": blanca a la roja, varias bandas en rombo y cierre a la amarilla.
      shots[25] = {
        code: '026',
        title: 'Jugada 026 del video — carambola de diamantes',
        family: 'Video original · posición inicial + recorrido exacto',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 820, 459),
          ballObj('yellow', 'Amarilla', 150, 490),
          ballObj('red', 'Roja', 715, 478)
        ]),
        aimAt: makeAim(715, 478, 'mira a la roja fina'),
        first: 'red',
        second: 'yellow',
        power: 76,
        effect: makeEffect(-52, -34),
        route: 'roja → banda superior izquierda → banda izquierda → banda inferior central → banda superior derecha → banda derecha → cierre a la amarilla',
        focus: 'Replica la imagen 026: amarilla abajo a la izquierda, roja abajo hacia la derecha y blanca al costado derecho. El recorrido forma dos rombos cruzados antes de cerrar la carambola sobre la amarilla.',
        tip: 'Ataca la roja con efecto arriba-izquierda y potencia media-alta. La referencia debe dibujar el rombo grande: arriba-izquierda, izquierda, abajo-centro, arriba-derecha, derecha y cierre hacia la amarilla.',
        guidePath: [
          { x: 820, y: 459 },
          { x: 715, y: 478 },
          { x: 337, y: 54 },
          { x: 68, y: 190 },
          { x: 460, y: 506 },
          { x: 766, y: 54 },
          { x: 925, y: 192 },
          { x: 184, y: 463 },
          { x: 150, y: 490 }
        ]
      };


      // Ajuste exacto de la jugada 027 según las imágenes del video compartidas por el usuario.
      // Igual que el fotograma 027: amarilla abajo izquierda, roja abajo derecha y blanca a la derecha.
      shots[26] = {
        code: '027',
        title: 'Jugada 027 del video — carambola de diamantes',
        family: 'Video original · posición inicial + recorrido exacto',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 821, 455),
          ballObj('yellow', 'Amarilla', 160, 471),
          ballObj('red', 'Roja', 713, 455)
        ]),
        aimAt: makeAim(713, 455, 'mira a la roja fina'),
        first: 'red',
        second: 'yellow',
        power: 77,
        effect: makeEffect(-54, -34),
        route: 'roja → banda inferior → banda izquierda → banda superior → banda derecha → cierre a la amarilla',
        focus: 'Replica la imagen 027: la amarilla queda abajo a la izquierda, la roja abajo hacia la derecha y la blanca al costado derecho. El recorrido forma los dos rombos cruzados del video antes de cerrar sobre la amarilla.',
        tip: 'Toca la roja muy fina con efecto arriba-izquierda y potencia media-alta. En Técnica video la bola blanca seguirá la línea de diamantes y completará la carambola automáticamente.',
        guidePath: [
          { x: 821, y: 455 },
          { x: 713, y: 455 },
          { x: 688, y: 434 },
          { x: 342, y: 76 },
          { x: 78, y: 208 },
          { x: 466, y: 483 },
          { x: 772, y: 77 },
          { x: 915, y: 206 },
          { x: 183, y: 455 },
          { x: 160, y: 471 }
        ]
      };

      // Ajuste exacto de la jugada 028 según las imágenes del video compartidas por el usuario.
      // Igual que el fotograma 028: patrón de diamantes, pero con la roja y la blanca un poco más juntas.
      shots[27] = {
        code: '028',
        title: 'Jugada 028 del video — carambola de diamantes',
        family: 'Video original · posición inicial + recorrido exacto',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 817, 445),
          ballObj('yellow', 'Amarilla', 165, 465),
          ballObj('red', 'Roja', 768, 432)
        ]),
        aimAt: makeAim(768, 432, 'mira a la roja fina'),
        first: 'red',
        second: 'yellow',
        power: 78,
        effect: makeEffect(-56, -32),
        route: 'roja → apoyo bajo → banda izquierda → banda superior → banda derecha → cierre a la amarilla',
        focus: 'Replica la imagen 028: amarilla abajo izquierda y roja/blanca abajo a la derecha. El tiro inicia con contacto corto a la roja, abre por los rombos del video y cierra con flecha hacia la amarilla.',
        tip: 'Usa efecto arriba-izquierda y potencia media-alta. La referencia 028 deja la roja y la blanca más juntas; en Técnica video el recorrido guiado hace la carambola completa.',
        guidePath: [
          { x: 817, y: 445 },
          { x: 768, y: 432 },
          { x: 705, y: 445 },
          { x: 216, y: 77 },
          { x: 82, y: 147 },
          { x: 468, y: 476 },
          { x: 761, y: 77 },
          { x: 920, y: 208 },
          { x: 184, y: 449 },
          { x: 165, y: 465 }
        ]
      };

      // Ajuste exacto de la jugada 029 según las imágenes del video compartidas por el usuario.
      // Fotograma 029: amarilla en la parte superior derecha, blanca y roja al centro, con ruta de retorno por diamantes.
      shots[28] = {
        code: '029',
        title: 'Jugada 029 del video — retorno por diamantes a la amarilla superior derecha',
        family: 'Video original · posición inicial + recorrido exacto',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 531, 166),
          ballObj('yellow', 'Amarilla', 890, 83),
          ballObj('red', 'Roja', 609, 183)
        ]),
        aimAt: makeAim(609, 183, 'mira a la roja fina'),
        first: 'red',
        second: 'yellow',
        power: 78,
        effect: makeEffect(-50, -34),
        route: 'roja → banda inferior derecha → banda superior central → banda izquierda → banda inferior izquierda → cierre a la amarilla superior derecha',
        focus: 'Replica la imagen 029: amarilla arriba a la derecha, blanca en el centro y roja un poco a la derecha. La ruta abre hacia la esquina inferior derecha, cruza por el diamante central y cierra con flecha hacia la amarilla.',
        tip: 'Ataca la roja fina con efecto arriba-izquierda y potencia media-alta. En Técnica video la bola blanca sigue la línea de retorno por diamantes y completa la carambola sobre la amarilla superior derecha.',
        guidePath: [
          { x: 531, y: 166 },
          { x: 609, y: 183 },
          { x: 927, y: 475 },
          { x: 537, y: 65 },
          { x: 54, y: 323 },
          { x: 217, y: 479 },
          { x: 850, y: 73 },
          { x: 890, y: 83 }
        ]
      };


      // Ajuste exacto de la jugada 030 según las imágenes del video compartidas por el usuario.
      // Fotograma 030: amarilla abajo izquierda, blanca arriba-derecha de la roja y ruta con rombo amplio hacia la amarilla.
      shots[29] = {
        code: '030',
        title: 'Jugada 030 del video — rombo amplio con cierre a la amarilla inferior izquierda',
        family: 'Video original · posición inicial + recorrido exacto',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 774, 211),
          ballObj('yellow', 'Amarilla', 122, 477),
          ballObj('red', 'Roja', 699, 268)
        ]),
        aimAt: makeAim(699, 268, 'mira a la roja fina'),
        first: 'red',
        second: 'yellow',
        power: 77,
        effect: makeEffect(-50, -32),
        route: 'roja → banda izquierda → banda superior → banda derecha → banda inferior → regreso a la banda izquierda → cierre a la amarilla',
        focus: 'Replica la imagen 030: la amarilla queda abajo a la izquierda, la roja queda hacia el centro-derecha y la blanca queda arriba-derecha de la roja. La ruta abre hacia la banda izquierda, dibuja el rombo amplio y cierra con flecha hacia la amarilla.',
        tip: 'Ataca la roja fina con efecto arriba-izquierda y potencia media-alta. En Técnica video la bola blanca seguirá el rombo de la referencia 030 y completará la carambola sobre la amarilla inferior izquierda.',
        guidePath: [
          { x: 774, y: 211 },
          { x: 699, y: 268 },
          { x: 54, y: 355 },
          { x: 692, y: 63 },
          { x: 914, y: 324 },
          { x: 360, y: 500 },
          { x: 54, y: 355 },
          { x: 122, y: 477 }
        ]
      };


      // Ajuste exacto de la jugada 031 según las imágenes del video compartidas por el usuario.
      // Fotograma 031: amarilla abajo izquierda, roja al centro-derecha y blanca a la derecha con recorrido de doble rombo.
      shots[30] = {
        code: '031',
        title: 'Jugada 031 del video — doble rombo con cierre a la amarilla inferior izquierda',
        family: 'Video original · posición inicial + recorrido exacto',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 776, 229),
          ballObj('yellow', 'Amarilla', 106, 469),
          ballObj('red', 'Roja', 704, 245)
        ]),
        aimAt: makeAim(704, 245, 'mira a la roja fina'),
        first: 'red',
        second: 'yellow',
        power: 78,
        effect: makeEffect(-54, -34),
        route: 'roja → banda superior izquierda → banda izquierda → banda inferior central → banda superior derecha → banda derecha → cierre a la amarilla',
        focus: 'Replica la imagen 031: la amarilla queda abajo a la izquierda, la roja queda al centro-derecha y la blanca a su derecha. El recorrido forma dos rombos cruzados y termina con flecha sobre la amarilla.',
        tip: 'Toca la roja muy fina con efecto arriba-izquierda y potencia media-alta. En Técnica video la bola blanca seguirá la ruta de la referencia 031 y completará la carambola automáticamente.',
        guidePath: [
          { x: 776, y: 229 },
          { x: 704, y: 245 },
          { x: 244, y: 80 },
          { x: 55, y: 186 },
          { x: 503, y: 493 },
          { x: 787, y: 80 },
          { x: 913, y: 214 },
          { x: 135, y: 458 },
          { x: 106, y: 469 }
        ]
      };


      // Ajuste exacto de la jugada 032 según las imágenes del video compartidas por el usuario.
      // Fotograma 032: amarilla abajo izquierda, roja y blanca a la derecha, ruta larga en paralelogramo hacia la amarilla.
      shots[31] = {
        code: '032',
        title: 'Jugada 032 del video — paralelogramo largo con cierre a la amarilla inferior izquierda',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 792, 280),
          ballObj('yellow', 'Amarilla', 119, 500),
          ballObj('red', 'Roja', 717, 280)
        ]),
        aimAt: makeAim(717, 280, 'punto fantasma para golpear fina la roja'),
        first: 'red',
        second: 'yellow',
        power: 80,
        effect: makeEffect(-58, -36),
        route: 'roja fina → banda derecha → banda superior → banda izquierda → cierre a la amarilla',
        focus: 'Replica la imagen 032: la amarilla queda abajo a la izquierda y la blanca ataca muy fina a la roja desde la derecha. La ruta abre por la derecha, sube al diamante superior, vuelve por la izquierda y cierra sobre la amarilla.',
        tip: 'Golpe fino a la roja por el lado izquierdo de la bola receptora, efecto arriba-izquierda y potencia media-alta para sostener la línea larga.',
        guidePath: [
          { x: 792, y: 280 },
          { x: 717, y: 280 },
          { x: 913, y: 269 },
          { x: 958, y: 97 },
          { x: 817, y: 48 },
          { x: 482, y: 48 },
          { x: 44, y: 388 },
          { x: 139, y: 476 },
          { x: 119, y: 500 }
        ]
      };


      // Ajuste exacto de la jugada 033 según las imágenes del video compartidas por el usuario.
      // Fotograma 033: roja al centro, blanca a la derecha y amarilla abajo izquierda; tres bandas con salida hacia la amarilla.
      shots[32] = {
        code: '033',
        title: 'Jugada 033 del video — tres bandas con cierre directo a la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 671, 238),
          ballObj('yellow', 'Amarilla', 119, 491),
          ballObj('red', 'Roja', 550, 266)
        ]),
        aimAt: makeAim(550, 266, 'punto fantasma para golpear fina la roja'),
        first: 'red',
        second: 'yellow',
        power: 76,
        effect: makeEffect(-52, -32),
        route: 'roja fina → banda izquierda → banda superior → banda derecha → cierre a la amarilla',
        focus: 'Replica la imagen 033: la amarilla queda abajo a la izquierda, la roja queda cerca del centro y la blanca queda a la derecha. El tiro debe tocar la roja fina, tomar izquierda, superior, derecha y cerrar hacia la amarilla.',
        tip: 'Golpe fino a la roja por el lado izquierdo de la receptora, efecto arriba-izquierda y potencia media para que la blanca no se abra de más después de la tercera banda.',
        guidePath: [
          { x: 671, y: 238 },
          { x: 550, y: 266 },
          { x: 44, y: 137 },
          { x: 377, y: 29 },
          { x: 948, y: 135 },
          { x: 119, y: 491 }
        ]
      };


      // Ajuste exacto de la jugada 034 según las imágenes del video compartidas por el usuario.
      // Fotograma 034: amarilla abajo izquierda, roja centro-izquierda y blanca a la derecha; doble diamante con cierre a la amarilla.
      shots[33] = {
        code: '034',
        title: 'Jugada 034 del video — doble diamante con cierre a la amarilla inferior izquierda',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 614, 307),
          ballObj('yellow', 'Amarilla', 114, 497),
          ballObj('red', 'Roja', 438, 309)
        ]),
        aimAt: makeAim(438, 309, 'punto fantasma para golpear fina la roja'),
        first: 'red',
        second: 'yellow',
        power: 78,
        effect: makeEffect(-54, -34),
        route: 'roja fina → banda superior izquierda → banda izquierda → banda inferior central → banda superior derecha → banda derecha → cierre a la amarilla',
        focus: 'Replica la imagen 034: amarilla abajo izquierda, roja centro-izquierda y blanca a la derecha. La blanca debe tocar fina la roja, dibujar el doble diamante y cerrar sobre la amarilla.',
        tip: 'Golpe fino a la roja por el lado izquierdo de la bola receptora, efecto arriba-izquierda y potencia media-alta. El punto clave es sostener la salida hacia el diamante superior izquierdo sin pegar demasiado lleno.',
        guidePath: [
          { x: 614, y: 307 },
          { x: 438, y: 309 },
          { x: 163, y: 31 },
          { x: 39, y: 103 },
          { x: 497, y: 493 },
          { x: 742, y: 31 },
          { x: 952, y: 290 },
          { x: 114, y: 497 }
        ]
      };


      // Ajuste exacto de la jugada 035 según las imágenes del video compartidas por el usuario.
      // Fotograma 035: amarilla abajo izquierda, roja centro-izquierda y blanca hacia el centro-derecha; doble diamante largo con cierre a la amarilla.
      shots[34] = {
        code: '035',
        title: 'Jugada 035 del video — doble diamante largo con cierre a la amarilla inferior izquierda',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 560, 386),
          ballObj('yellow', 'Amarilla', 132, 509),
          ballObj('red', 'Roja', 297, 352)
        ]),
        aimAt: makeAim(297, 352, 'punto fantasma para golpear fina la roja'),
        first: 'red',
        second: 'yellow',
        power: 79,
        effect: makeEffect(-56, -34),
        route: 'roja fina → banda superior izquierda → banda izquierda → banda inferior central → banda superior derecha → banda derecha → cierre a la amarilla',
        focus: 'Replica la imagen 035: amarilla abajo izquierda, roja centro-izquierda y blanca hacia el centro-derecha. La blanca debe tomar la roja fina, abrir el doble diamante largo y cerrar sobre la amarilla.',
        tip: 'Golpe muy fino a la roja por el lado derecho de la receptora, efecto arriba-izquierda y potencia media-alta. No pegar lleno: la salida debe sostenerse hacia el diamante izquierdo y regresar larga por la derecha.',
        guidePath: [
          { x: 560, y: 386 },
          { x: 297, y: 352 },
          { x: 369, y: 348 },
          { x: 125, y: 30 },
          { x: 41, y: 100 },
          { x: 451, y: 505 },
          { x: 837, y: 32 },
          { x: 953, y: 195 },
          { x: 132, y: 509 }
        ]
      };


      // Ajuste exacto de la jugada 036 según las imágenes del video compartidas por el usuario.
      // Fotograma 036: primera bola amarilla en la banda izquierda baja, roja arriba izquierda y blanca centro-izquierda baja.
      shots[35] = {
        code: '036',
        title: 'Jugada 036 del video — primera amarilla y cierre a la roja superior izquierda',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 382, 401),
          ballObj('yellow', 'Amarilla', 57, 401),
          ballObj('red', 'Roja', 84, 47)
        ]),
        aimAt: makeAim(57, 401, 'punto fantasma para golpear media-fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 77,
        effect: makeEffect(-58, -28),
        route: 'amarilla media-fina → banda izquierda baja → banda superior izquierda → banda inferior derecha → banda derecha → banda superior media → cierre a la roja',
        focus: 'Replica la imagen 036: la primera bola es la amarilla ubicada en la banda izquierda baja; la roja está arriba a la izquierda y la blanca sale desde el centro-izquierda bajo. El recorrido abre desde la amarilla, dibuja el diamante largo y cierra en la roja.',
        tip: 'Golpe media-fina a la amarilla, con efecto arriba-izquierda y potencia media-alta. La blanca no debe pegar llena: debe tomar la amarilla y salir viva para recorrer las bandas antes de cerrar sobre la roja.',
        guidePath: [
          { x: 382, y: 401 },
          { x: 57, y: 401 },
          { x: 29, y: 339 },
          { x: 160, y: 25 },
          { x: 871, y: 473 },
          { x: 950, y: 399 },
          { x: 346, y: 25 },
          { x: 84, y: 47 }
        ]
      };


      // Ajuste exacto de la jugada 037 según las imágenes del video compartidas por el usuario.
      // Fotograma 037: primera bola amarilla en la zona izquierda baja, cierre sobre roja superior izquierda.
      shots[36] = {
        code: '037',
        title: 'Jugada 037 del video — primera amarilla y cierre corto a la roja',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 118, 399),
          ballObj('yellow', 'Amarilla', 41, 380),
          ballObj('red', 'Roja', 50, 58)
        ]),
        aimAt: makeAim(41, 380, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 78,
        effect: makeEffect(-56, -30),
        route: 'amarilla fina → banda izquierda baja → banda superior izquierda → banda inferior derecha → banda derecha → retorno alto → cierre a la roja',
        focus: 'Replica la imagen 037: la primera bola es la amarilla en la parte izquierda baja; la roja queda arriba a la izquierda y la blanca sale muy cerca de la amarilla. El recorrido abre por la izquierda, hace el rombo largo y cierra en la roja.',
        tip: 'Golpe fino a la amarilla, sin pegar lleno. Usa potencia media-alta y efecto arriba-izquierda para que la blanca agarre la banda izquierda, viaje larga y cierre sobre la roja.',
        guidePath: [
          { x: 118, y: 399 },
          { x: 41, y: 380 },
          { x: 27, y: 334 },
          { x: 129, y: 25 },
          { x: 806, y: 487 },
          { x: 939, y: 372 },
          { x: 348, y: 25 },
          { x: 77, y: 36 },
          { x: 50, y: 58 }
        ]
      };

      // Ajuste exacto de la jugada 038 según las imágenes del video compartidas por el usuario.
      // Fotograma 038: blanca más separada de la amarilla, primera amarilla y cierre a la roja superior izquierda.
      shots[37] = {
        code: '038',
        title: 'Jugada 038 del video — primera amarilla con mayor distancia y cierre a la roja',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 360, 407),
          ballObj('yellow', 'Amarilla', 161, 405),
          ballObj('red', 'Roja', 72, 102)
        ]),
        aimAt: makeAim(161, 405, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 80,
        effect: makeEffect(-58, -32),
        route: 'amarilla fina → banda izquierda media → banda superior izquierda → banda inferior derecha → banda derecha baja → retorno alto → cierre a la roja',
        focus: 'Replica la imagen 038: la blanca está más separada de la amarilla, la amarilla queda abajo a la izquierda y la roja arriba a la izquierda. La ruta entra primero a la amarilla, abre por diamantes y termina en la roja.',
        tip: 'Por la mayor distancia inicial, usa un poco más de potencia que en la 037. Golpe fino a la amarilla con efecto arriba-izquierda; si queda corta, sube potencia, y si abre demasiado, afina más el contacto.',
        guidePath: [
          { x: 360, y: 407 },
          { x: 161, y: 405 },
          { x: 38, y: 267 },
          { x: 190, y: 25 },
          { x: 857, y: 497 },
          { x: 950, y: 408 },
          { x: 351, y: 25 },
          { x: 91, y: 75 },
          { x: 72, y: 102 }
        ]
      };


      // Ajuste exacto de la jugada 039 según las imágenes del video compartidas por el usuario.
      // Fotograma 039: primera bola amarilla en zona izquierda, cierre sobre roja inferior izquierda.
      shots[38] = {
        code: '039',
        title: 'Jugada 039 del video — primera amarilla y cierre a la roja inferior izquierda',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 206, 396),
          ballObj('yellow', 'Amarilla', 158, 303),
          ballObj('red', 'Roja', 59, 480)
        ]),
        aimAt: makeAim(158, 303, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 76,
        effect: makeEffect(-54, 38),
        route: 'amarilla fina → banda izquierda media → banda inferior central → banda derecha → banda superior → regreso a la izquierda → cierre a la roja',
        focus: 'Replica la imagen 039: la blanca queda abajo de la amarilla, la roja queda pegada hacia la parte inferior izquierda y la ruta cierra con flecha sobre la roja. El tiro inicia tocando fina la amarilla.',
        tip: 'Golpea fina la amarilla, no llena. Usa potencia media-alta y efecto abajo-izquierda, como indica la bola de efecto del video, para que la blanca tome la banda izquierda, complete los diamantes y cierre sobre la roja.',
        guidePath: [
          { x: 206, y: 396 },
          { x: 158, y: 303 },
          { x: 38, y: 364 },
          { x: 341, y: 497 },
          { x: 939, y: 147 },
          { x: 740, y: 25 },
          { x: 38, y: 364 },
          { x: 59, y: 480 }
        ]
      };


      // Ajuste exacto de la jugada 040 según las imágenes del video compartidas por el usuario.
      // Fotograma 040: primera bola amarilla al lado izquierdo, cierre sobre roja superior izquierda.
      shots[39] = {
        code: '040',
        title: 'Jugada 040 del video — primera amarilla y cierre a la roja superior izquierda',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 729, 234),
          ballObj('yellow', 'Amarilla', 145, 234),
          ballObj('red', 'Roja', 113, 56)
        ]),
        aimAt: makeAim(145, 234, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 78,
        effect: makeEffect(48, -40),
        route: 'amarilla fina → banda izquierda → banda superior → banda inferior derecha → banda derecha → retorno central → cierre a la roja superior izquierda',
        focus: 'Replica la imagen 040: la roja queda arriba a la izquierda, la amarilla al lado izquierdo y la blanca al centro-derecha. El tiro inicia tocando fina la amarilla y la blanca cierra sobre la roja después de completar las bandas.',
        tip: 'Golpea fina la amarilla desde la derecha, con potencia media-alta. El efecto visual del video marca arriba-derecha; úsalo para sostener la línea larga, tomar las bandas y cerrar con control sobre la roja superior izquierda.',
        guidePath: [
          { x: 729, y: 234 },
          { x: 145, y: 234 },
          { x: 38, y: 153 },
          { x: 260, y: 25 },
          { x: 789, y: 502 },
          { x: 943, y: 359 },
          { x: 645, y: 209 },
          { x: 161, y: 75 },
          { x: 113, y: 56 }
        ]
      };


      // Ajuste exacto de la jugada 041 según las imágenes del video compartidas por el usuario.
      // Fotograma 041: primera bola roja en el lateral izquierdo, cierre sobre amarilla inferior izquierda.
      shots[40] = {
        code: '041',
        title: 'Jugada 041 del video — roja primero y regreso largo a la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 117, 279),
          ballObj('yellow', 'Amarilla', 223, 504),
          ballObj('red', 'Roja', 120, 412)
        ]),
        aimAt: makeAim(120, 412, 'punto fantasma para golpear fina la roja desde arriba'),
        first: 'red',
        second: 'yellow',
        power: 77,
        effect: makeEffect(-48, -42),
        route: 'roja fina → salida baja sin tomar la amarilla → banda superior derecha → banda derecha → banda inferior → cierre a la amarilla inferior izquierda',
        focus: 'Replica la imagen 041: la blanca queda arriba de la roja en el lado izquierdo y la amarilla queda abajo. La jugada toca primero la roja, evita la amarilla en la salida corta y regresa a ella después de completar el recorrido largo.',
        tip: 'Golpea fina la roja desde arriba con efecto arriba-izquierda y potencia media-alta. La blanca debe salir baja, abrir el rectángulo largo por la derecha y regresar controlada sobre la amarilla.',
        guidePath: [
          { x: 117, y: 279 },
          { x: 120, y: 412 },
          { x: 173, y: 436 },
          { x: 260, y: 457 },
          { x: 887, y: 26 },
          { x: 943, y: 109 },
          { x: 297, y: 519 },
          { x: 223, y: 504 }
        ]
      };


      // Ajuste exacto de la jugada 042 según las imágenes del video compartidas por el usuario.
      // Fotograma 042: primera bola roja abajo izquierda, cierre sobre amarilla baja central.
      shots[41] = {
        code: '042',
        title: 'Jugada 042 del video — roja primero y cierre corto a la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 70, 426),
          ballObj('yellow', 'Amarilla', 271, 500),
          ballObj('red', 'Roja', 77, 500)
        ]),
        aimAt: makeAim(77, 500, 'punto fantasma para golpear fina la roja desde arriba'),
        first: 'red',
        second: 'yellow',
        power: 77,
        effect: makeEffect(-50, -42),
        route: 'roja fina → banda izquierda → banda superior → banda derecha → retorno bajo → cierre a la amarilla',
        focus: 'Replica la imagen 042: la blanca queda arriba de la roja en el lateral izquierdo y la amarilla queda baja hacia el centro. El tiro toma primero la roja, abre por la izquierda, completa el triángulo largo de bandas y cierra en la amarilla.',
        tip: 'Golpea fina la roja desde arriba con efecto arriba-izquierda y potencia media-alta. La blanca debe salir limpia a la banda izquierda, sostener la línea larga por la superior y derecha, y llegar controlada sobre la amarilla.',
        guidePath: [
          { x: 70, y: 426 },
          { x: 77, y: 500 },
          { x: 130, y: 511 },
          { x: 38, y: 280 },
          { x: 543, y: 43 },
          { x: 930, y: 355 },
          { x: 234, y: 467 },
          { x: 271, y: 500 }
        ]
      };


      // Ajuste exacto de la jugada 043 según las imágenes del video compartidas por el usuario.
      // Fotograma 043: primera bola roja en el rincón inferior izquierdo y cierre sobre amarilla baja central.
      shots[42] = {
        code: '043',
        title: 'Jugada 043 del video — roja primero con salida larga y cierre a la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 66, 348),
          ballObj('yellow', 'Amarilla', 267, 496),
          ballObj('red', 'Roja', 77, 492)
        ]),
        aimAt: makeAim(77, 492, 'punto fantasma para golpear fina la roja desde arriba'),
        first: 'red',
        second: 'yellow',
        power: 76,
        effect: makeEffect(-50, -40),
        route: 'roja fina → apoyo corto en banda baja izquierda → banda superior derecha → banda derecha → retorno largo → cierre a la amarilla',
        focus: 'Replica la imagen 043: la blanca queda por encima de la roja en el lateral izquierdo y la amarilla queda baja hacia el centro. La blanca toma primero la roja, sale por la zona baja izquierda, abre una línea larga hacia la derecha y vuelve a cerrar sobre la amarilla.',
        tip: 'Golpea fina la roja con efecto arriba-izquierda y potencia media-alta. El contacto debe ser delgado: si queda muy lleno, la blanca se queda corta; si queda demasiado fina, no toma el retorno correcto hacia la amarilla.',
        guidePath: [
          { x: 66, y: 348 },
          { x: 77, y: 492 },
          { x: 130, y: 505 },
          { x: 906, y: 41 },
          { x: 957, y: 118 },
          { x: 338, y: 464 },
          { x: 267, y: 496 }
        ]
      };


      // Ajuste exacto de la jugada 044 según las imágenes del video compartidas por el usuario.
      // Fotograma 044: blanca arriba de la roja por el lateral izquierdo y cierre sobre amarilla baja central.
      shots[43] = {
        code: '044',
        title: 'Jugada 044 del video — roja primero con cuadro largo y cierre a la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 165, 150),
          ballObj('yellow', 'Amarilla', 274, 506),
          ballObj('red', 'Roja', 110, 270)
        ]),
        aimAt: makeAim(110, 270, 'punto fantasma para golpear fina la roja desde arriba'),
        first: 'red',
        second: 'yellow',
        power: 75,
        effect: makeEffect(-46, -38),
        route: 'roja fina → banda izquierda → banda inferior → banda superior derecha → banda derecha → retorno bajo → cierre a la amarilla',
        focus: 'Replica la imagen 044: blanca arriba, roja en el lateral izquierdo y amarilla baja hacia el centro. La blanca toca primero la roja, abre por la izquierda, arma el cuadro largo hacia la derecha y vuelve para cerrar sobre la amarilla.',
        tip: 'Golpea fina la roja con efecto arriba-izquierda y potencia media-alta. El contacto debe sacar la blanca limpia hacia la banda izquierda; si entra muy llena se queda corta antes de completar el cuadro.',
        guidePath: [
          { x: 165, y: 150 },
          { x: 110, y: 270 },
          { x: 64, y: 251 },
          { x: 359, y: 504 },
          { x: 913, y: 48 },
          { x: 964, y: 128 },
          { x: 326, y: 481 },
          { x: 274, y: 506 }
        ]
      };


      // Ajuste exacto de la jugada 045 según las imágenes del video compartidas por el usuario.
      // Fotograma 045: roja y blanca en zona baja derecha, amarilla junto al cierre inferior derecho.
      shots[44] = {
        code: '045',
        title: 'Jugada 045 del video — roja primero con retorno de diamantes y cierre a la amarilla derecha',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 817, 384),
          ballObj('yellow', 'Amarilla', 898, 477),
          ballObj('red', 'Roja', 813, 314)
        ]),
        aimAt: makeAim(813, 314, 'punto fantasma para golpear fina la roja desde abajo'),
        first: 'red',
        second: 'yellow',
        power: 78,
        effect: makeEffect(48, -38),
        route: 'roja fina → banda superior izquierda → banda izquierda → banda inferior izquierda → banda superior central → retorno por la derecha → cierre a la amarilla',
        focus: 'Replica la imagen 045: la roja queda arriba de la blanca en la zona derecha y la amarilla queda baja a la derecha. La blanca toca primero la roja, abre por los diamantes hacia la izquierda y vuelve para cerrar sobre la amarilla.',
        tip: 'Golpea fina la roja con efecto arriba-derecha y potencia media-alta. El contacto debe ser delgado: si entra muy llena, la blanca no abre el rombo; si entra demasiado fina, no alcanza el cierre hacia la amarilla.',
        guidePath: [
          { x: 817, y: 384 },
          { x: 813, y: 314 },
          { x: 374, y: 72 },
          { x: 76, y: 423 },
          { x: 216, y: 534 },
          { x: 590, y: 72 },
          { x: 841, y: 418 },
          { x: 898, y: 477 }
        ]
      };


      // Ajuste exacto de la jugada 046 según las imágenes del video compartidas por el usuario.
      // Fotograma 046: blanca debajo de la roja en el lado izquierdo y amarilla abajo izquierda.
      shots[45] = {
        code: '046',
        title: 'Jugada 046 del video — roja primero con corto de tres bandas hacia la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 145, 269),
          ballObj('yellow', 'Amarilla', 197, 472),
          ballObj('red', 'Roja', 174, 145)
        ]),
        aimAt: makeAim(174, 145, 'punto fantasma para golpear fina la roja desde abajo'),
        first: 'red',
        second: 'yellow',
        power: 55,
        effect: makeEffect(-42, -48),
        route: 'roja fina → banda superior izquierda → banda izquierda → banda inferior → cierre a la amarilla',
        focus: 'Replica la imagen 046: la roja queda arriba de la blanca en la zona izquierda y la amarilla queda abajo a la izquierda. El tiro es corto: toca primero la roja, sube a la banda superior, baja por la banda izquierda y cierra en la amarilla.',
        tip: 'Golpea fina la roja con efecto arriba-izquierda y potencia media-baja. Debe entrar delgada: si golpea llena, la blanca se queda corta; si entra demasiado fina, no baja con ángulo hacia la amarilla.',
        guidePath: [
          { x: 145, y: 269 },
          { x: 174, y: 145 },
          { x: 102, y: 27 },
          { x: 25, y: 210 },
          { x: 138, y: 518 },
          { x: 197, y: 472 }
        ]
      };


      // Ajuste exacto de la jugada 047 según las imágenes del video compartidas por el usuario.
      // Fotograma 047: blanca debajo-izquierda de la roja y amarilla baja izquierda; tiro corto por tres bandas.
      shots[46] = {
        code: '047',
        title: 'Jugada 047 del video — roja primero con corto a tres bandas hacia la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 120, 270),
          ballObj('yellow', 'Amarilla', 215, 470),
          ballObj('red', 'Roja', 190, 150)
        ]),
        aimAt: makeAim(190, 150, 'punto fantasma para golpear fina la roja desde abajo'),
        first: 'red',
        second: 'yellow',
        power: 56,
        effect: makeEffect(-44, -48),
        route: 'roja fina → banda superior izquierda → banda izquierda → banda inferior → cierre a la amarilla',
        focus: 'Replica la imagen 047: la blanca está debajo y a la izquierda de la roja; la amarilla queda en la zona baja izquierda. La blanca debe tocar primero la roja, subir a la banda superior, tomar la izquierda, bajar a la inferior y cerrar en la amarilla.',
        tip: 'Golpe fino a la roja, con efecto arriba-izquierda y potencia media-baja. Es una jugada corta: si pegas muy lleno, la blanca no abre; si usas demasiada potencia, pasa larga por encima de la amarilla.',
        guidePath: [
          { x: 120, y: 270 },
          { x: 190, y: 150 },
          { x: 130, y: 46 },
          { x: 55, y: 200 },
          { x: 135, y: 518 },
          { x: 215, y: 470 }
        ]
      };


      // Ajuste exacto de la jugada 048 según las imágenes del video compartidas por el usuario.
      // Fotograma 048: blanca junto a la banda izquierda, roja arriba-derecha y amarilla abajo izquierda.
      shots[47] = {
        code: '048',
        title: 'Jugada 048 del video — roja primero con corto de tres bandas hacia la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 70, 251),
          ballObj('yellow', 'Amarilla', 197, 469),
          ballObj('red', 'Roja', 171, 136)
        ]),
        aimAt: makeAim(171, 136, 'punto fantasma para golpear fina la roja desde la banda izquierda'),
        first: 'red',
        second: 'yellow',
        power: 54,
        effect: makeEffect(-46, 42),
        route: 'roja fina → banda superior izquierda → banda izquierda → banda inferior → cierre a la amarilla',
        focus: 'Replica la imagen 048: la blanca queda pegada a la banda izquierda, la roja queda arriba-derecha de la blanca y la amarilla queda abajo a la izquierda. El recorrido es corto y debe cerrar con flecha hacia la amarilla.',
        tip: 'Golpe fino a la roja con efecto abajo-izquierda y potencia media-baja. El efecto ayuda a que la blanca cierre después de la banda inferior; si se golpea muy lleno, la blanca no toma el ángulo corto.',
        guidePath: [
          { x: 70, y: 251 },
          { x: 171, y: 136 },
          { x: 142, y: 25 },
          { x: 47, y: 215 },
          { x: 147, y: 477 },
          { x: 197, y: 469 }
        ]
      };


      // Ajuste exacto de la jugada 049 según las imágenes del video compartidas por el usuario.
      // Fotograma 049: primera bola amarilla, roja abajo-izquierda y cierre corto después de tres bandas.
      shots[48] = {
        code: '049',
        title: 'Jugada 049 del video — amarilla primero y cierre corto a la roja',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 332, 291),
          ballObj('yellow', 'Amarilla', 205, 192),
          ballObj('red', 'Roja', 167, 449)
        ]),
        aimAt: makeAim(205, 192, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 55,
        effect: makeEffect(-42, -46),
        route: 'amarilla fina → banda superior izquierda → banda izquierda → banda inferior → cierre a la roja',
        focus: 'Replica la imagen 049: la blanca queda al centro-izquierda, la amarilla arriba-izquierda y la roja abajo-izquierda. La blanca debe tocar primero la amarilla, subir a la banda superior, tomar izquierda e inferior y cerrar sobre la roja.',
        tip: 'Golpe fino a la amarilla con efecto arriba-izquierda y potencia media-baja. El tiro es corto: mucha potencia hace que la blanca pase larga; poco efecto no permite cerrar hacia la roja.',
        guidePath: [
          { x: 332, y: 291 },
          { x: 205, y: 192 },
          { x: 197, y: 30 },
          { x: 36, y: 323 },
          { x: 102, y: 489 },
          { x: 167, y: 449 }
        ]
      };


      // Ajuste exacto de la jugada 050 según las imágenes del video compartidas por el usuario.
      // Fotograma 050: primera bola amarilla, roja abajo-izquierda y cierre corto después de tres bandas.
      shots[49] = {
        code: '050',
        title: 'Jugada 050 del video — amarilla primero y cierre corto a la roja',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 307, 220),
          ballObj('yellow', 'Amarilla', 190, 182),
          ballObj('red', 'Roja', 169, 455)
        ]),
        aimAt: makeAim(190, 182, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 54,
        effect: makeEffect(-40, -44),
        route: 'amarilla fina → banda superior izquierda → banda izquierda → banda inferior → cierre a la roja',
        focus: 'Replica la imagen 050: la blanca queda al centro-izquierda, la amarilla arriba-izquierda y la roja abajo-izquierda. La blanca debe tocar primero la amarilla, subir a la banda superior, tomar izquierda e inferior y cerrar sobre la roja.',
        tip: 'Golpe fino a la amarilla con efecto arriba-izquierda y potencia media-baja. La jugada 050 es corta: si aumentas demasiado la potencia, la bola se pasa larga; si reduces el efecto, no cierra bien hacia la roja.',
        guidePath: [
          { x: 307, y: 220 },
          { x: 190, y: 182 },
          { x: 178, y: 30 },
          { x: 36, y: 276 },
          { x: 102, y: 489 },
          { x: 169, y: 455 }
        ]
      };


      // Ajuste exacto de la jugada 051 según las imágenes del video compartidas por el usuario.
      // Fotograma 051: primera bola roja, cierre corto a la amarilla después de tres bandas por el lado izquierdo.
      shots[50] = {
        code: '051',
        title: 'Jugada 051 del video — roja primero y cierre corto a la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 386, 355),
          ballObj('yellow', 'Amarilla', 309, 457),
          ballObj('red', 'Roja', 268, 280)
        ]),
        aimAt: makeAim(268, 280, 'punto fantasma para golpear fina la roja'),
        first: 'red',
        second: 'yellow',
        power: 56,
        effect: makeEffect(-42, -44),
        route: 'roja fina → banda izquierda → banda superior izquierda → banda inferior → cierre a la amarilla',
        focus: 'Replica la imagen 051: la blanca queda al centro-izquierda, la roja más arriba a la izquierda y la amarilla abajo a la izquierda. La blanca debe tocar primero la roja, tomar el rombo corto del lado izquierdo y cerrar sobre la amarilla.',
        tip: 'Golpe fino a la roja con efecto arriba-izquierda y potencia media-baja. Es una carambola corta: controla la fuerza para que el cierre no se pase de la amarilla.',
        guidePath: [
          { x: 386, y: 355 },
          { x: 268, y: 280 },
          { x: 48, y: 216 },
          { x: 190, y: 30 },
          { x: 226, y: 502 },
          { x: 309, y: 457 }
        ]
      };


      // Ajuste exacto de la jugada 052 según las imágenes del video compartidas por el usuario.
      // Fotograma 052: primera bola amarilla, cierre a la roja por el lado izquierdo.
      shots[51] = {
        code: '052',
        title: 'Jugada 052 del video — amarilla primero y cierre a la roja por la izquierda',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 329, 300),
          ballObj('yellow', 'Amarilla', 217, 197),
          ballObj('red', 'Roja', 74, 350)
        ]),
        aimAt: makeAim(217, 197, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 58,
        effect: makeEffect(-44, -42),
        route: 'amarilla fina → banda superior izquierda → banda inferior izquierda → banda izquierda → cierre a la roja',
        focus: 'Replica la imagen 052: la blanca queda centro-izquierda, la amarilla arriba-izquierda y la roja pegada al lado izquierdo. La blanca toca primero la amarilla, sube al ángulo superior, baja al rincón izquierdo y cierra sobre la roja.',
        tip: 'Golpe fino a la amarilla con efecto arriba-izquierda y potencia media-baja. Controla la fuerza: el objetivo es que el retorno por la izquierda llegue corto y exacto a la roja.',
        guidePath: [
          { x: 329, y: 300 },
          { x: 217, y: 197 },
          { x: 196, y: 39 },
          { x: 50, y: 506 },
          { x: 25, y: 399 },
          { x: 74, y: 350 }
        ]
      };


      // Ajuste exacto de la jugada 053 según las imágenes del video compartidas por el usuario.
      // Fotograma 053: primera bola amarilla, cierre a la roja por el retorno corto del lado izquierdo.
      shots[52] = {
        code: '053',
        title: 'Jugada 053 del video — amarilla primero y cierre a la roja por el lado izquierdo',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 351, 340),
          ballObj('yellow', 'Amarilla', 198, 225),
          ballObj('red', 'Roja', 80, 94)
        ]),
        aimAt: makeAim(198, 225, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 57,
        effect: makeEffect(-44, -42),
        route: 'amarilla fina → banda superior izquierda → banda inferior izquierda → banda izquierda → cierre a la roja',
        focus: 'Replica la imagen 053: la blanca queda centro-izquierda, la amarilla arriba-izquierda y la roja cerca de la banda izquierda alta. La blanca toca primero la amarilla, hace el retorno corto por las bandas del lado izquierdo y cierra sobre la roja.',
        tip: 'Golpe fino a la amarilla con efecto arriba-izquierda y potencia media-baja. El tiro debe llegar corto: demasiada fuerza hace que la blanca se pase de la roja; poco efecto no permite el cierre por la izquierda.',
        guidePath: [
          { x: 351, y: 340 },
          { x: 198, y: 225 },
          { x: 205, y: 35 },
          { x: 95, y: 505 },
          { x: 40, y: 322 },
          { x: 80, y: 94 }
        ]
      };


      // Ajuste exacto de la jugada 054 según las imágenes del video compartidas por el usuario.
      // Fotograma 054: primera bola amarilla arriba-izquierda y cierre corto a la roja por el lado izquierdo.
      shots[53] = {
        code: '054',
        title: 'Jugada 054 del video — amarilla primero y cierre corto a la roja',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 293, 176),
          ballObj('yellow', 'Amarilla', 172, 110),
          ballObj('red', 'Roja', 104, 352)
        ]),
        aimAt: makeAim(172, 110, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 53,
        effect: makeEffect(42, -44),
        route: 'amarilla fina → banda superior izquierda → banda izquierda → banda inferior izquierda → cierre a la roja',
        focus: 'Replica la imagen 054: la blanca queda centro-izquierda, la amarilla arriba a la izquierda y la roja abajo sobre la banda izquierda. La blanca toca primero la amarilla y cierra corto sobre la roja después de las bandas del lado izquierdo.',
        tip: 'Golpe fino a la amarilla con efecto arriba-derecha y potencia media-baja. El efecto ayuda a sostener el arco del retorno; demasiada fuerza hace que la blanca pase larga de la roja.',
        guidePath: [
          { x: 293, y: 176 },
          { x: 172, y: 110 },
          { x: 198, y: 58 },
          { x: 168, y: 92 },
          { x: 136, y: 310 },
          { x: 82, y: 470 },
          { x: 104, y: 352 }
        ]
      };


      // Ajuste exacto de la jugada 055 según las imágenes del video compartidas por el usuario.
      // Fotograma 055: primera bola roja en la parte superior izquierda y cierre corto sobre la amarilla por el costado izquierdo.
      shots[54] = {
        code: '055',
        title: 'Jugada 055 del video — roja primero y retorno corto a la amarilla',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 148, 150),
          ballObj('yellow', 'Amarilla', 68, 128),
          ballObj('red', 'Roja', 245, 58)
        ]),
        aimAt: makeAim(245, 58, 'punto fantasma para golpear fina la roja'),
        first: 'red',
        second: 'yellow',
        power: 48,
        effect: makeEffect(-28, 48),
        route: 'roja fina → banda superior/izquierda → banda inferior izquierda → regreso por banda izquierda → cierre a la amarilla',
        focus: 'Replica la imagen 055: la blanca queda a la izquierda, la roja arriba a la izquierda y la amarilla pegada al costado izquierdo. El tiro toca primero la roja, baja por el lado izquierdo y regresa corto hacia la amarilla.',
        tip: 'Golpe fino a la roja con efecto abajo-izquierda y potencia media-baja. No excedas la fuerza: la clave es sostener la blanca en el lado izquierdo para cerrar sobre la amarilla.',
        guidePath: [
          { x: 148, y: 150 },
          { x: 245, y: 58 },
          { x: 222, y: 34 },
          { x: 88, y: 485 },
          { x: 52, y: 305 },
          { x: 68, y: 128 }
        ]
      };


      // Ajuste corregido de la jugada 056 según las imágenes del video compartidas por el usuario.
      // Fotograma 056: primera bola amarilla, cierre a la roja después de recorrido largo por la izquierda.
      shots[55] = {
        code: '056',
        title: 'Jugada 056 del video — amarilla primero y cierre largo a la roja',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 568, 337),
          ballObj('yellow', 'Amarilla', 583, 93),
          ballObj('red', 'Roja', 466, 457)
        ]),
        aimAt: makeAim(583, 93, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 62,
        effect: makeEffect(-42, -38),
        route: 'amarilla fina → banda superior izquierda → banda izquierda → banda inferior → cierre a la roja',
        focus: 'Replica la imagen 056: la amarilla queda arriba hacia el centro, la blanca debajo de ella y la roja abajo. La blanca toca primero la amarilla, abre por la izquierda y cierra sobre la roja.',
        tip: 'Golpe fino a la amarilla con efecto arriba-izquierda y potencia media. La trayectoria es larga; la potencia debe alcanzar para volver hacia la roja sin pasarse.',
        guidePath: [
          { x: 568, y: 337 },
          { x: 583, y: 93 },
          { x: 385, y: 35 },
          { x: 45, y: 120 },
          { x: 455, y: 500 },
          { x: 466, y: 457 }
        ]
      };


      // Ajuste exacto de la jugada 057 según las imágenes del video compartidas por el usuario.
      // Fotograma 057: blanca a la izquierda, amarilla debajo y cierre final sobre la roja pegada al lado izquierdo.
      shots[56] = {
        code: '057',
        title: 'Jugada 057 del video — amarilla primero con regreso largo a la roja',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 146, 217),
          ballObj('yellow', 'Amarilla', 147, 332),
          ballObj('red', 'Roja', 56, 254)
        ]),
        aimAt: makeAim(147, 332, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 68,
        effect: makeEffect(-48, 40),
        route: 'amarilla fina → banda inferior → banda derecha → banda superior → regreso a la banda izquierda → cierre a la roja',
        focus: 'Replica la imagen 057: la blanca queda arriba de la amarilla, la roja queda a la izquierda y el recorrido abre largo por el centro de la mesa para cerrar con flecha sobre la roja.',
        tip: 'Golpe fino a la amarilla con efecto abajo-izquierda y potencia media-alta. La salida debe abrir bastante para alcanzar las tres bandas y regresar a la roja sin quedarse corta.',
        guidePath: [
          { x: 146, y: 217 },
          { x: 147, y: 332 },
          { x: 475, y: 495 },
          { x: 918, y: 360 },
          { x: 500, y: 40 },
          { x: 50, y: 210 },
          { x: 56, y: 254 }
        ]
      };


      // Ajuste exacto de la jugada 058 según las imágenes del video compartidas por el usuario.
      // Fotograma 058: amarilla arriba-centro, blanca centro-derecha y roja abajo-centro; cierre final en la roja.
      shots[57] = {
        code: '058',
        title: 'Jugada 058 del video — amarilla primero con retorno largo a la roja inferior',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 681, 257),
          ballObj('yellow', 'Amarilla', 440, 101),
          ballObj('red', 'Roja', 471, 477)
        ]),
        aimAt: makeAim(440, 101, 'punto fantasma para golpear fina la amarilla'),
        first: 'yellow',
        second: 'red',
        power: 70,
        effect: makeEffect(46, 12),
        route: 'amarilla fina → banda izquierda → banda superior → banda derecha → cierre a la roja inferior',
        focus: 'Replica la imagen 058: la amarilla queda arriba hacia el centro, la blanca al centro-derecha y la roja abajo. La blanca toca primero la amarilla, abre a la izquierda, toma la banda superior y la derecha, y cierra sobre la roja.',
        tip: 'Golpe fino a la amarilla con efecto a la derecha y potencia media-alta. La bola debe abrir lo suficiente hacia la banda izquierda y conservar velocidad para cerrar en la roja inferior.',
        guidePath: [
          { x: 681, y: 257 },
          { x: 440, y: 101 },
          { x: 14, y: 158 },
          { x: 395, y: 40 },
          { x: 922, y: 158 },
          { x: 471, y: 477 }
        ]
      };


      // Ajuste exacto de la jugada 059 según las imágenes del video compartidas por el usuario.
      // Fotograma 059: roja al centro, blanca debajo-derecha y amarilla superior derecha; cierre final en la amarilla.
      shots[58] = {
        code: '059',
        title: 'Jugada 059 del video — roja primero con retorno largo a la amarilla superior derecha',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 535, 337),
          ballObj('yellow', 'Amarilla', 789, 90),
          ballObj('red', 'Roja', 468, 270)
        ]),
        aimAt: makeAim(468, 270, 'punto fantasma para golpear fina la roja'),
        first: 'red',
        second: 'yellow',
        power: 68,
        effect: makeEffect(-48, 4),
        route: 'roja fina → banda izquierda → banda inferior izquierda → banda derecha → cierre a la amarilla superior derecha',
        focus: 'Replica la imagen 059: la roja queda al centro, la blanca un poco abajo a la derecha y la amarilla arriba a la derecha. La blanca toca primero la roja, abre hacia la banda izquierda, toma la banda inferior, recorre hacia la derecha y cierra sobre la amarilla.',
        tip: 'Golpe fino a la roja con efecto a la izquierda y potencia media-alta. La bola debe conservar recorrido para llegar a la banda derecha y cerrar limpia sobre la amarilla superior.',
        guidePath: [
          { x: 535, y: 337 },
          { x: 468, y: 270 },
          { x: 60, y: 335 },
          { x: 220, y: 500 },
          { x: 915, y: 230 },
          { x: 789, y: 90 }
        ]
      };


      // Ajuste exacto de la jugada 060 según las imágenes del video compartidas por el usuario.
      // Fotograma 060: blanca y roja en el rincón superior izquierdo, amarilla abajo; cierre final en la amarilla.
      shots[59] = {
        code: '060',
        title: 'Jugada 060 del video — roja primero con cierre corto a la amarilla inferior',
        family: 'Video original · posición inicial + recorrido corregido',
        balls: avoidOverlap([
          ballObj('cue', 'Blanca', 80, 100),
          ballObj('yellow', 'Amarilla', 258, 435),
          ballObj('red', 'Roja', 145, 50)
        ]),
        aimAt: makeAim(145, 50, 'punto fantasma para golpear fina la roja'),
        first: 'red',
        second: 'yellow',
        power: 54,
        effect: makeEffect(-50, 42),
        route: 'roja fina → banda superior corta → banda izquierda → banda inferior → cierre a la amarilla',
        focus: 'Replica la imagen 060: la roja queda cerca de la banda superior izquierda, la blanca un poco abajo a la izquierda y la amarilla queda abajo. La blanca toca primero la roja, trabaja corto el rincón izquierdo y baja para cerrar sobre la amarilla.',
        tip: 'Golpe fino a la roja con efecto abajo-izquierda y potencia media-baja. La salida debe ser controlada para no abrir de más y llegar limpia a la amarilla inferior.',
        guidePath: [
          { x: 80, y: 100 },
          { x: 145, y: 50 },
          { x: 125, y: 40 },
          { x: 50, y: 95 },
          { x: 225, y: 500 },
          { x: 258, y: 435 }
        ]
      };


      // Sincronización visual de pantallazos enviados por el usuario: jugadas 061-106.
      // Ajusta bolas, primera/segunda bola y guía para que la app coincida con las imágenes de referencia.
      const USER_IMAGE_SYNC_061_106 = [
        {
                "code": "061",
                "balls": [
                        {
                                "id": "cue",
                                "x": 335.1,
                                "y": 337.1
                        },
                        {
                                "id": "yellow",
                                "x": 252.7,
                                "y": 280.0
                        },
                        {
                                "id": "red",
                                "x": 161.1,
                                "y": 470.4
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 335.1,
                                "y": 337.1
                        },
                        {
                                "x": 252.7,
                                "y": 280.0
                        },
                        {
                                "x": 179.4,
                                "y": 65.8
                        },
                        {
                                "x": 60.3,
                                "y": 208.6
                        },
                        {
                                "x": 151.9,
                                "y": 460.9
                        },
                        {
                                "x": 161.1,
                                "y": 470.4
                        }
                ]
        },
        {
                "code": "062",
                "balls": [
                        {
                                "id": "cue",
                                "x": 179.4,
                                "y": 170.5
                        },
                        {
                                "id": "yellow",
                                "x": 87.8,
                                "y": 280.0
                        },
                        {
                                "id": "red",
                                "x": 225.2,
                                "y": 170.5
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 179.4,
                                "y": 170.5
                        },
                        {
                                "x": 225.2,
                                "y": 170.5
                        },
                        {
                                "x": 133.6,
                                "y": 99.1
                        },
                        {
                                "x": 69.5,
                                "y": 303.8
                        },
                        {
                                "x": 87.8,
                                "y": 280.0
                        }
                ]
        },
        {
                "code": "063",
                "balls": [
                        {
                                "id": "cue",
                                "x": 829.8,
                                "y": 399.0
                        },
                        {
                                "id": "yellow",
                                "x": 646.6,
                                "y": 337.1
                        },
                        {
                                "id": "red",
                                "x": 875.6,
                                "y": 451.4
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 829.8,
                                "y": 399.0
                        },
                        {
                                "x": 646.6,
                                "y": 337.1
                        },
                        {
                                "x": 115.3,
                                "y": 465.6
                        },
                        {
                                "x": 500.0,
                                "y": 456.1
                        },
                        {
                                "x": 875.6,
                                "y": 451.4
                        }
                ]
        },
        {
                "code": "064",
                "balls": [
                        {
                                "id": "cue",
                                "x": 701.5,
                                "y": 365.7
                        },
                        {
                                "id": "yellow",
                                "x": 609.9,
                                "y": 456.1
                        },
                        {
                                "id": "red",
                                "x": 838.9,
                                "y": 460.9
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 701.5,
                                "y": 365.7
                        },
                        {
                                "x": 609.9,
                                "y": 456.1
                        },
                        {
                                "x": 536.6,
                                "y": 475.2
                        },
                        {
                                "x": 60.3,
                                "y": 432.3
                        },
                        {
                                "x": 600.8,
                                "y": 460.9
                        },
                        {
                                "x": 838.9,
                                "y": 460.9
                        }
                ]
        },
        {
                "code": "065",
                "balls": [
                        {
                                "id": "cue",
                                "x": 692.4,
                                "y": 351.4
                        },
                        {
                                "id": "yellow",
                                "x": 600.8,
                                "y": 451.4
                        },
                        {
                                "id": "red",
                                "x": 893.9,
                                "y": 427.6
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 692.4,
                                "y": 351.4
                        },
                        {
                                "x": 600.8,
                                "y": 451.4
                        },
                        {
                                "x": 481.7,
                                "y": 470.4
                        },
                        {
                                "x": 316.8,
                                "y": 484.7
                        },
                        {
                                "x": 60.3,
                                "y": 432.3
                        },
                        {
                                "x": 893.9,
                                "y": 427.6
                        }
                ]
        },
        {
                "code": "066",
                "balls": [
                        {
                                "id": "cue",
                                "x": 747.3,
                                "y": 384.7
                        },
                        {
                                "id": "yellow",
                                "x": 719.8,
                                "y": 446.6
                        },
                        {
                                "id": "red",
                                "x": 289.3,
                                "y": 422.8
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 747.3,
                                "y": 384.7
                        },
                        {
                                "x": 719.8,
                                "y": 446.6
                        },
                        {
                                "x": 225.2,
                                "y": 460.9
                        },
                        {
                                "x": 60.3,
                                "y": 451.4
                        },
                        {
                                "x": 179.4,
                                "y": 479.9
                        },
                        {
                                "x": 289.3,
                                "y": 422.8
                        }
                ]
        },
        {
                "code": "067",
                "balls": [
                        {
                                "id": "cue",
                                "x": 536.6,
                                "y": 441.8
                        },
                        {
                                "id": "yellow",
                                "x": 280.2,
                                "y": 360.9
                        },
                        {
                                "id": "red",
                                "x": 390.1,
                                "y": 432.3
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 536.6,
                                "y": 441.8
                        },
                        {
                                "x": 280.2,
                                "y": 360.9
                        },
                        {
                                "x": 60.3,
                                "y": 479.9
                        },
                        {
                                "x": 353.4,
                                "y": 460.9
                        },
                        {
                                "x": 390.1,
                                "y": 432.3
                        }
                ]
        },
        {
                "code": "068",
                "balls": [
                        {
                                "id": "cue",
                                "x": 509.2,
                                "y": 356.2
                        },
                        {
                                "id": "yellow",
                                "x": 289.3,
                                "y": 356.2
                        },
                        {
                                "id": "red",
                                "x": 399.2,
                                "y": 441.8
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 509.2,
                                "y": 356.2
                        },
                        {
                                "x": 289.3,
                                "y": 356.2
                        },
                        {
                                "x": 252.7,
                                "y": 432.3
                        },
                        {
                                "x": 206.9,
                                "y": 460.9
                        },
                        {
                                "x": 60.3,
                                "y": 437.1
                        },
                        {
                                "x": 399.2,
                                "y": 441.8
                        }
                ]
        },
        {
                "code": "069",
                "balls": [
                        {
                                "id": "cue",
                                "x": 115.3,
                                "y": 275.2
                        },
                        {
                                "id": "yellow",
                                "x": 133.6,
                                "y": 227.6
                        },
                        {
                                "id": "red",
                                "x": 69.5,
                                "y": 161.0
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 115.3,
                                "y": 275.2
                        },
                        {
                                "x": 133.6,
                                "y": 227.6
                        },
                        {
                                "x": 69.5,
                                "y": 89.6
                        },
                        {
                                "x": 60.3,
                                "y": 213.4
                        },
                        {
                                "x": 69.5,
                                "y": 161.0
                        }
                ]
        },
        {
                "code": "070",
                "balls": [
                        {
                                "id": "cue",
                                "x": 179.4,
                                "y": 137.2
                        },
                        {
                                "id": "yellow",
                                "x": 280.2,
                                "y": 84.8
                        },
                        {
                                "id": "red",
                                "x": 151.9,
                                "y": 103.9
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 179.4,
                                "y": 137.2
                        },
                        {
                                "x": 280.2,
                                "y": 84.8
                        },
                        {
                                "x": 133.6,
                                "y": 70.6
                        },
                        {
                                "x": 60.3,
                                "y": 61.0
                        },
                        {
                                "x": 151.9,
                                "y": 103.9
                        }
                ]
        },
        {
                "code": "071",
                "balls": [
                        {
                                "id": "cue",
                                "x": 289.3,
                                "y": 241.9
                        },
                        {
                                "id": "yellow",
                                "x": 124.4,
                                "y": 151.5
                        },
                        {
                                "id": "red",
                                "x": 78.6,
                                "y": 199.1
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 289.3,
                                "y": 241.9
                        },
                        {
                                "x": 124.4,
                                "y": 151.5
                        },
                        {
                                "x": 78.6,
                                "y": 203.8
                        },
                        {
                                "x": 69.5,
                                "y": 303.8
                        },
                        {
                                "x": 69.5,
                                "y": 470.4
                        },
                        {
                                "x": 78.6,
                                "y": 199.1
                        }
                ]
        },
        {
                "code": "072",
                "balls": [
                        {
                                "id": "cue",
                                "x": 280.2,
                                "y": 280.0
                        },
                        {
                                "id": "yellow",
                                "x": 87.8,
                                "y": 275.2
                        },
                        {
                                "id": "red",
                                "x": 87.8,
                                "y": 165.8
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 280.2,
                                "y": 280.0
                        },
                        {
                                "x": 87.8,
                                "y": 275.2
                        },
                        {
                                "x": 78.6,
                                "y": 470.4
                        },
                        {
                                "x": 69.5,
                                "y": 384.7
                        },
                        {
                                "x": 87.8,
                                "y": 165.8
                        }
                ]
        },
        {
                "code": "073",
                "balls": [
                        {
                                "id": "cue",
                                "x": 280.2,
                                "y": 303.8
                        },
                        {
                                "id": "yellow",
                                "x": 87.8,
                                "y": 275.2
                        },
                        {
                                "id": "red",
                                "x": 161.1,
                                "y": 180.0
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 280.2,
                                "y": 303.8
                        },
                        {
                                "x": 87.8,
                                "y": 303.8
                        },
                        {
                                "x": 78.6,
                                "y": 475.2
                        },
                        {
                                "x": 69.5,
                                "y": 365.7
                        },
                        {
                                "x": 161.1,
                                "y": 180.0
                        }
                ]
        },
        {
                "code": "074",
                "balls": [
                        {
                                "id": "cue",
                                "x": 151.9,
                                "y": 208.6
                        },
                        {
                                "id": "yellow",
                                "x": 87.8,
                                "y": 142.0
                        },
                        {
                                "id": "red",
                                "x": 188.6,
                                "y": 75.3
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 151.9,
                                "y": 208.6
                        },
                        {
                                "x": 87.8,
                                "y": 142.0
                        },
                        {
                                "x": 60.3,
                                "y": 280.0
                        },
                        {
                                "x": 124.4,
                                "y": 508.5
                        },
                        {
                                "x": 188.6,
                                "y": 75.3
                        }
                ]
        },
        {
                "code": "075",
                "balls": [
                        {
                                "id": "cue",
                                "x": 151.9,
                                "y": 341.9
                        },
                        {
                                "id": "yellow",
                                "x": 252.7,
                                "y": 203.8
                        },
                        {
                                "id": "red",
                                "x": 206.9,
                                "y": 103.9
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 151.9,
                                "y": 341.9
                        },
                        {
                                "x": 252.7,
                                "y": 203.8
                        },
                        {
                                "x": 179.4,
                                "y": 75.3
                        },
                        {
                                "x": 78.6,
                                "y": 494.2
                        },
                        {
                                "x": 206.9,
                                "y": 103.9
                        }
                ]
        },
        {
                "code": "076",
                "balls": [
                        {
                                "id": "cue",
                                "x": 326.0,
                                "y": 261.0
                        },
                        {
                                "id": "yellow",
                                "x": 243.5,
                                "y": 241.9
                        },
                        {
                                "id": "red",
                                "x": 78.6,
                                "y": 161.0
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 326.0,
                                "y": 261.0
                        },
                        {
                                "x": 243.5,
                                "y": 241.9
                        },
                        {
                                "x": 151.9,
                                "y": 118.2
                        },
                        {
                                "x": 69.5,
                                "y": 403.8
                        },
                        {
                                "x": 78.6,
                                "y": 161.0
                        }
                ]
        },
        {
                "code": "077",
                "balls": [
                        {
                                "id": "cue",
                                "x": 353.4,
                                "y": 261.0
                        },
                        {
                                "id": "yellow",
                                "x": 271.0,
                                "y": 256.2
                        },
                        {
                                "id": "red",
                                "x": 206.9,
                                "y": 227.6
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 353.4,
                                "y": 261.0
                        },
                        {
                                "x": 271.0,
                                "y": 256.2
                        },
                        {
                                "x": 151.9,
                                "y": 75.3
                        },
                        {
                                "x": 69.5,
                                "y": 470.4
                        },
                        {
                                "x": 206.9,
                                "y": 227.6
                        }
                ]
        },
        {
                "code": "078",
                "balls": [
                        {
                                "id": "cue",
                                "x": 170.2,
                                "y": 99.1
                        },
                        {
                                "id": "yellow",
                                "x": 87.8,
                                "y": 151.5
                        },
                        {
                                "id": "red",
                                "x": 115.3,
                                "y": 151.5
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 170.2,
                                "y": 99.1
                        },
                        {
                                "x": 115.3,
                                "y": 151.5
                        },
                        {
                                "x": 87.8,
                                "y": 327.6
                        },
                        {
                                "x": 78.6,
                                "y": 484.7
                        },
                        {
                                "x": 87.8,
                                "y": 151.5
                        }
                ]
        },
        {
                "code": "079",
                "balls": [
                        {
                                "id": "cue",
                                "x": 811.4,
                                "y": 180.0
                        },
                        {
                                "id": "yellow",
                                "x": 820.6,
                                "y": 80.1
                        },
                        {
                                "id": "red",
                                "x": 784.0,
                                "y": 51.5
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 811.4,
                                "y": 180.0
                        },
                        {
                                "x": 87.8,
                                "y": 65.8
                        },
                        {
                                "x": 683.2,
                                "y": 70.6
                        },
                        {
                                "x": 756.5,
                                "y": 80.1
                        },
                        {
                                "x": 784.0,
                                "y": 51.5
                        }
                ]
        },
        {
                "code": "080",
                "balls": [
                        {
                                "id": "cue",
                                "x": 515.3,
                                "y": 297.2
                        },
                        {
                                "id": "yellow",
                                "x": 752.8,
                                "y": 362.3
                        },
                        {
                                "id": "red",
                                "x": 328.1,
                                "y": 87.2
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 515.3,
                                "y": 297.2
                        },
                        {
                                "x": 328.1,
                                "y": 87.2
                        },
                        {
                                "x": 374.9,
                                "y": 54.7
                        },
                        {
                                "x": 387.5,
                                "y": 496.3
                        },
                        {
                                "x": 927.4,
                                "y": 451.0
                        },
                        {
                                "x": 767.2,
                                "y": 54.7
                        },
                        {
                                "x": 752.8,
                                "y": 362.3
                        }
                ]
        },
        {
                "code": "081",
                "balls": [
                        {
                                "id": "cue",
                                "x": 793.1,
                                "y": 413.3
                        },
                        {
                                "id": "yellow",
                                "x": 903.0,
                                "y": 332.4
                        },
                        {
                                "id": "red",
                                "x": 390.1,
                                "y": 460.9
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 793.1,
                                "y": 413.3
                        },
                        {
                                "x": 390.1,
                                "y": 460.9
                        },
                        {
                                "x": 353.4,
                                "y": 437.1
                        },
                        {
                                "x": 60.3,
                                "y": 208.6
                        },
                        {
                                "x": 151.9,
                                "y": 65.8
                        },
                        {
                                "x": 683.2,
                                "y": 470.4
                        },
                        {
                                "x": 903.0,
                                "y": 332.4
                        }
                ]
        },
        {
                "code": "082",
                "balls": [
                        {
                                "id": "cue",
                                "x": 802.3,
                                "y": 384.7
                        },
                        {
                                "id": "yellow",
                                "x": 912.2,
                                "y": 99.1
                        },
                        {
                                "id": "red",
                                "x": 500.0,
                                "y": 456.1
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 802.3,
                                "y": 384.7
                        },
                        {
                                "x": 500.0,
                                "y": 456.1
                        },
                        {
                                "x": 353.4,
                                "y": 460.9
                        },
                        {
                                "x": 60.3,
                                "y": 194.3
                        },
                        {
                                "x": 243.5,
                                "y": 65.8
                        },
                        {
                                "x": 912.2,
                                "y": 99.1
                        }
                ]
        },
        {
                "code": "083",
                "balls": [
                        {
                                "id": "cue",
                                "x": 802.3,
                                "y": 403.8
                        },
                        {
                                "id": "yellow",
                                "x": 903.0,
                                "y": 479.9
                        },
                        {
                                "id": "red",
                                "x": 390.1,
                                "y": 451.4
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 802.3,
                                "y": 403.8
                        },
                        {
                                "x": 390.1,
                                "y": 451.4
                        },
                        {
                                "x": 371.8,
                                "y": 456.1
                        },
                        {
                                "x": 60.3,
                                "y": 175.3
                        },
                        {
                                "x": 280.2,
                                "y": 65.8
                        },
                        {
                                "x": 903.0,
                                "y": 479.9
                        }
                ]
        },
        {
                "code": "084",
                "balls": [
                        {
                                "id": "cue",
                                "x": 811.4,
                                "y": 389.5
                        },
                        {
                                "id": "yellow",
                                "x": 903.0,
                                "y": 322.8
                        },
                        {
                                "id": "red",
                                "x": 390.1,
                                "y": 460.9
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 811.4,
                                "y": 389.5
                        },
                        {
                                "x": 390.1,
                                "y": 460.9
                        },
                        {
                                "x": 344.3,
                                "y": 479.9
                        },
                        {
                                "x": 69.5,
                                "y": 213.4
                        },
                        {
                                "x": 390.1,
                                "y": 70.6
                        },
                        {
                                "x": 903.0,
                                "y": 322.8
                        }
                ]
        },
        {
                "code": "085",
                "balls": [
                        {
                                "id": "cue",
                                "x": 811.4,
                                "y": 199.1
                        },
                        {
                                "id": "yellow",
                                "x": 151.9,
                                "y": 413.3
                        },
                        {
                                "id": "red",
                                "x": 408.4,
                                "y": 460.9
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 811.4,
                                "y": 199.1
                        },
                        {
                                "x": 408.4,
                                "y": 460.9
                        },
                        {
                                "x": 353.4,
                                "y": 479.9
                        },
                        {
                                "x": 243.5,
                                "y": 470.4
                        },
                        {
                                "x": 60.3,
                                "y": 451.4
                        },
                        {
                                "x": 151.9,
                                "y": 413.3
                        }
                ]
        },
        {
                "code": "086",
                "balls": [
                        {
                                "id": "cue",
                                "x": 802.3,
                                "y": 175.3
                        },
                        {
                                "id": "yellow",
                                "x": 151.9,
                                "y": 356.2
                        },
                        {
                                "id": "red",
                                "x": 390.1,
                                "y": 460.9
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 802.3,
                                "y": 175.3
                        },
                        {
                                "x": 390.1,
                                "y": 460.9
                        },
                        {
                                "x": 362.6,
                                "y": 470.4
                        },
                        {
                                "x": 69.5,
                                "y": 351.4
                        },
                        {
                                "x": 151.9,
                                "y": 356.2
                        }
                ]
        },
        {
                "code": "087",
                "balls": [
                        {
                                "id": "cue",
                                "x": 124.4,
                                "y": 289.5
                        },
                        {
                                "id": "yellow",
                                "x": 106.1,
                                "y": 127.7
                        },
                        {
                                "id": "red",
                                "x": 500.0,
                                "y": 456.1
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 124.4,
                                "y": 289.5
                        },
                        {
                                "x": 106.1,
                                "y": 127.7
                        },
                        {
                                "x": 87.8,
                                "y": 189.6
                        },
                        {
                                "x": 142.8,
                                "y": 65.8
                        },
                        {
                                "x": 500.0,
                                "y": 456.1
                        }
                ]
        },
        {
                "code": "088",
                "balls": [
                        {
                                "id": "cue",
                                "x": 124.4,
                                "y": 289.5
                        },
                        {
                                "id": "yellow",
                                "x": 78.6,
                                "y": 142.0
                        },
                        {
                                "id": "red",
                                "x": 500.0,
                                "y": 460.9
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 124.4,
                                "y": 289.5
                        },
                        {
                                "x": 78.6,
                                "y": 142.0
                        },
                        {
                                "x": 426.7,
                                "y": 65.8
                        },
                        {
                                "x": 912.2,
                                "y": 137.2
                        },
                        {
                                "x": 500.0,
                                "y": 460.9
                        }
                ]
        },
        {
                "code": "089",
                "balls": [
                        {
                                "id": "cue",
                                "x": 124.4,
                                "y": 318.1
                        },
                        {
                                "id": "yellow",
                                "x": 78.6,
                                "y": 156.2
                        },
                        {
                                "id": "red",
                                "x": 884.7,
                                "y": 413.3
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 124.4,
                                "y": 318.1
                        },
                        {
                                "x": 78.6,
                                "y": 156.2
                        },
                        {
                                "x": 261.8,
                                "y": 70.6
                        },
                        {
                                "x": 729.0,
                                "y": 479.9
                        },
                        {
                                "x": 884.7,
                                "y": 413.3
                        }
                ]
        },
        {
                "code": "090",
                "balls": [
                        {
                                "id": "cue",
                                "x": 811.4,
                                "y": 156.2
                        },
                        {
                                "id": "yellow",
                                "x": 280.2,
                                "y": 175.3
                        },
                        {
                                "id": "red",
                                "x": 188.6,
                                "y": 470.4
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 811.4,
                                "y": 156.2
                        },
                        {
                                "x": 188.6,
                                "y": 470.4
                        },
                        {
                                "x": 151.9,
                                "y": 384.7
                        },
                        {
                                "x": 60.3,
                                "y": 213.4
                        },
                        {
                                "x": 133.6,
                                "y": 70.6
                        },
                        {
                                "x": 280.2,
                                "y": 175.3
                        }
                ]
        },
        {
                "code": "091",
                "balls": [
                        {
                                "id": "cue",
                                "x": 802.3,
                                "y": 265.7
                        },
                        {
                                "id": "yellow",
                                "x": 124.4,
                                "y": 246.7
                        },
                        {
                                "id": "red",
                                "x": 206.9,
                                "y": 137.2
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 802.3,
                                "y": 265.7
                        },
                        {
                                "x": 545.8,
                                "y": 479.9
                        },
                        {
                                "x": 124.4,
                                "y": 246.7
                        },
                        {
                                "x": 69.5,
                                "y": 175.3
                        },
                        {
                                "x": 115.3,
                                "y": 65.8
                        },
                        {
                                "x": 206.9,
                                "y": 137.2
                        }
                ]
        },
        {
                "code": "092",
                "balls": [
                        {
                                "id": "cue",
                                "x": 811.4,
                                "y": 161.0
                        },
                        {
                                "id": "yellow",
                                "x": 142.8,
                                "y": 194.3
                        },
                        {
                                "id": "red",
                                "x": 179.4,
                                "y": 137.2
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 811.4,
                                "y": 161.0
                        },
                        {
                                "x": 545.8,
                                "y": 484.7
                        },
                        {
                                "x": 316.8,
                                "y": 208.6
                        },
                        {
                                "x": 133.6,
                                "y": 80.1
                        },
                        {
                                "x": 179.4,
                                "y": 137.2
                        },
                        {
                                "x": 142.8,
                                "y": 194.3
                        }
                ]
        },
        {
                "code": "093",
                "balls": [
                        {
                                "id": "cue",
                                "x": 811.4,
                                "y": 389.5
                        },
                        {
                                "id": "yellow",
                                "x": 170.2,
                                "y": 394.2
                        },
                        {
                                "id": "red",
                                "x": 216.0,
                                "y": 441.8
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 811.4,
                                "y": 389.5
                        },
                        {
                                "x": 426.7,
                                "y": 65.8
                        },
                        {
                                "x": 60.3,
                                "y": 213.4
                        },
                        {
                                "x": 161.1,
                                "y": 341.9
                        },
                        {
                                "x": 170.2,
                                "y": 479.9
                        },
                        {
                                "x": 216.0,
                                "y": 441.8
                        }
                ]
        },
        {
                "code": "094",
                "balls": [
                        {
                                "id": "cue",
                                "x": 216.0,
                                "y": 99.1
                        },
                        {
                                "id": "yellow",
                                "x": 142.8,
                                "y": 142.0
                        },
                        {
                                "id": "red",
                                "x": 179.4,
                                "y": 118.2
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 216.0,
                                "y": 99.1
                        },
                        {
                                "x": 179.4,
                                "y": 118.2
                        },
                        {
                                "x": 115.3,
                                "y": 61.0
                        },
                        {
                                "x": 60.3,
                                "y": 265.7
                        },
                        {
                                "x": 124.4,
                                "y": 494.2
                        },
                        {
                                "x": 142.8,
                                "y": 142.0
                        }
                ]
        },
        {
                "code": "095",
                "balls": [
                        {
                                "id": "cue",
                                "x": 216.0,
                                "y": 89.6
                        },
                        {
                                "id": "yellow",
                                "x": 179.4,
                                "y": 99.1
                        },
                        {
                                "id": "red",
                                "x": 78.6,
                                "y": 137.2
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 216.0,
                                "y": 89.6
                        },
                        {
                                "x": 179.4,
                                "y": 99.1
                        },
                        {
                                "x": 133.6,
                                "y": 65.8
                        },
                        {
                                "x": 78.6,
                                "y": 208.6
                        },
                        {
                                "x": 151.9,
                                "y": 494.2
                        },
                        {
                                "x": 78.6,
                                "y": 137.2
                        }
                ]
        },
        {
                "code": "096",
                "balls": [
                        {
                                "id": "cue",
                                "x": 225.2,
                                "y": 156.2
                        },
                        {
                                "id": "yellow",
                                "x": 188.6,
                                "y": 156.2
                        },
                        {
                                "id": "red",
                                "x": 97.0,
                                "y": 122.9
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 225.2,
                                "y": 156.2
                        },
                        {
                                "x": 188.6,
                                "y": 156.2
                        },
                        {
                                "x": 124.4,
                                "y": 80.1
                        },
                        {
                                "x": 69.5,
                                "y": 184.8
                        },
                        {
                                "x": 151.9,
                                "y": 499.0
                        },
                        {
                                "x": 97.0,
                                "y": 122.9
                        }
                ]
        },
        {
                "code": "097",
                "balls": [
                        {
                                "id": "cue",
                                "x": 289.3,
                                "y": 146.7
                        },
                        {
                                "id": "yellow",
                                "x": 133.6,
                                "y": 151.5
                        },
                        {
                                "id": "red",
                                "x": 225.2,
                                "y": 146.7
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 289.3,
                                "y": 146.7
                        },
                        {
                                "x": 225.2,
                                "y": 146.7
                        },
                        {
                                "x": 188.6,
                                "y": 494.2
                        },
                        {
                                "x": 115.3,
                                "y": 89.6
                        },
                        {
                                "x": 133.6,
                                "y": 151.5
                        }
                ]
        },
        {
                "code": "098",
                "balls": [
                        {
                                "id": "cue",
                                "x": 225.2,
                                "y": 137.2
                        },
                        {
                                "id": "yellow",
                                "x": 216.0,
                                "y": 346.6
                        },
                        {
                                "id": "red",
                                "x": 87.8,
                                "y": 165.8
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 225.2,
                                "y": 137.2
                        },
                        {
                                "x": 87.8,
                                "y": 165.8
                        },
                        {
                                "x": 151.9,
                                "y": 70.6
                        },
                        {
                                "x": 188.6,
                                "y": 351.4
                        },
                        {
                                "x": 60.3,
                                "y": 479.9
                        },
                        {
                                "x": 216.0,
                                "y": 346.6
                        }
                ]
        },
        {
                "code": "099",
                "balls": [
                        {
                                "id": "cue",
                                "x": 115.3,
                                "y": 99.1
                        },
                        {
                                "id": "yellow",
                                "x": 106.1,
                                "y": 403.8
                        },
                        {
                                "id": "red",
                                "x": 170.2,
                                "y": 479.9
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 115.3,
                                "y": 99.1
                        },
                        {
                                "x": 69.5,
                                "y": 194.3
                        },
                        {
                                "x": 161.1,
                                "y": 479.9
                        },
                        {
                                "x": 106.1,
                                "y": 403.8
                        },
                        {
                                "x": 60.3,
                                "y": 441.8
                        },
                        {
                                "x": 170.2,
                                "y": 479.9
                        }
                ]
        },
        {
                "code": "100",
                "balls": [
                        {
                                "id": "cue",
                                "x": 106.1,
                                "y": 246.7
                        },
                        {
                                "id": "yellow",
                                "x": 142.8,
                                "y": 384.7
                        },
                        {
                                "id": "red",
                                "x": 124.4,
                                "y": 484.7
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 106.1,
                                "y": 246.7
                        },
                        {
                                "x": 69.5,
                                "y": 341.9
                        },
                        {
                                "x": 115.3,
                                "y": 479.9
                        },
                        {
                                "x": 142.8,
                                "y": 384.7
                        },
                        {
                                "x": 78.6,
                                "y": 441.8
                        },
                        {
                                "x": 124.4,
                                "y": 484.7
                        }
                ]
        },
        {
                "code": "101",
                "balls": [
                        {
                                "id": "cue",
                                "x": 280.2,
                                "y": 203.8
                        },
                        {
                                "id": "yellow",
                                "x": 115.3,
                                "y": 94.4
                        },
                        {
                                "id": "red",
                                "x": 78.6,
                                "y": 227.6
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 280.2,
                                "y": 203.8
                        },
                        {
                                "x": 115.3,
                                "y": 94.4
                        },
                        {
                                "x": 69.5,
                                "y": 199.1
                        },
                        {
                                "x": 78.6,
                                "y": 227.6
                        }
                ]
        },
        {
                "code": "102",
                "balls": [
                        {
                                "id": "cue",
                                "x": 179.4,
                                "y": 137.2
                        },
                        {
                                "id": "yellow",
                                "x": 161.1,
                                "y": 394.2
                        },
                        {
                                "id": "red",
                                "x": 115.3,
                                "y": 241.9
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 179.4,
                                "y": 137.2
                        },
                        {
                                "x": 115.3,
                                "y": 241.9
                        },
                        {
                                "x": 69.5,
                                "y": 327.6
                        },
                        {
                                "x": 97.0,
                                "y": 470.4
                        },
                        {
                                "x": 161.1,
                                "y": 394.2
                        }
                ]
        },
        {
                "code": "103",
                "balls": [
                        {
                                "id": "cue",
                                "x": 151.9,
                                "y": 165.8
                        },
                        {
                                "id": "yellow",
                                "x": 106.1,
                                "y": 327.6
                        },
                        {
                                "id": "red",
                                "x": 97.0,
                                "y": 213.4
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 151.9,
                                "y": 165.8
                        },
                        {
                                "x": 97.0,
                                "y": 213.4
                        },
                        {
                                "x": 78.6,
                                "y": 303.8
                        },
                        {
                                "x": 115.3,
                                "y": 489.4
                        },
                        {
                                "x": 106.1,
                                "y": 327.6
                        }
                ]
        },
        {
                "code": "104",
                "balls": [
                        {
                                "id": "cue",
                                "x": 124.4,
                                "y": 208.6
                        },
                        {
                                "id": "yellow",
                                "x": 115.3,
                                "y": 375.2
                        },
                        {
                                "id": "red",
                                "x": 87.8,
                                "y": 222.9
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 124.4,
                                "y": 208.6
                        },
                        {
                                "x": 87.8,
                                "y": 222.9
                        },
                        {
                                "x": 69.5,
                                "y": 289.5
                        },
                        {
                                "x": 106.1,
                                "y": 479.9
                        },
                        {
                                "x": 115.3,
                                "y": 375.2
                        }
                ]
        },
        {
                "code": "105",
                "balls": [
                        {
                                "id": "cue",
                                "x": 124.4,
                                "y": 203.8
                        },
                        {
                                "id": "yellow",
                                "x": 106.1,
                                "y": 351.4
                        },
                        {
                                "id": "red",
                                "x": 87.8,
                                "y": 241.9
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 124.4,
                                "y": 203.8
                        },
                        {
                                "x": 87.8,
                                "y": 241.9
                        },
                        {
                                "x": 69.5,
                                "y": 318.1
                        },
                        {
                                "x": 97.0,
                                "y": 479.9
                        },
                        {
                                "x": 106.1,
                                "y": 351.4
                        }
                ]
        },
        {
                "code": "106",
                "balls": [
                        {
                                "id": "cue",
                                "x": 307.6,
                                "y": 241.9
                        },
                        {
                                "id": "yellow",
                                "x": 133.6,
                                "y": 161.0
                        },
                        {
                                "id": "red",
                                "x": 133.6,
                                "y": 75.3
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 307.6,
                                "y": 241.9
                        },
                        {
                                "x": 133.6,
                                "y": 161.0
                        },
                        {
                                "x": 87.8,
                                "y": 89.6
                        },
                        {
                                "x": 133.6,
                                "y": 75.3
                        }
                ]
        }
];
      for (const sync of USER_IMAGE_SYNC_061_106) {
        const idx = Number(sync.code) - 1;
        const shot = shots[idx];
        if (!shot) continue;
        shot.balls = avoidOverlap(sync.balls.map(b => ballObj(b.id, b.id === 'cue' ? 'Blanca' : (b.id === 'yellow' ? 'Amarilla' : 'Roja'), b.x, b.y)));
        shot.first = sync.first;
        shot.second = sync.second;
        shot.guidePath = sync.guidePath.map(p => ({ x: p.x, y: p.y }));
        shot.referenceImages = practiceReferenceImages[sync.code];
        shot.family = 'Video original · pantallazo sincronizado';
        shot.focus = 'Jugada sincronizada con las imágenes de posición inicial y recorrido guía proporcionadas por el usuario.';
        shot.tip = 'Practica comparando la línea marcada del video con la guía en la mesa. Ajusta potencia, efecto y cantidad de bola hasta reproducir el recorrido.';
        shot.route = 'recorrido guía sincronizado con el pantallazo del video';
      }


      // Sincronización visual de pantallazos enviados por el usuario: jugadas 107-146.
      // Estas jugadas quedan listas mientras se completan las imágenes 147-149.
      const USER_IMAGE_SYNC_107_146 = [
        {
                "code": "107",
                "balls": [
                        {
                                "id": "cue",
                                "x": 365,
                                "y": 445
                        },
                        {
                                "id": "yellow",
                                "x": 75,
                                "y": 380
                        },
                        {
                                "id": "red",
                                "x": 110,
                                "y": 450
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 365,
                                "y": 445
                        },
                        {
                                "x": 110,
                                "y": 450
                        },
                        {
                                "x": 70,
                                "y": 435
                        },
                        {
                                "x": 75,
                                "y": 380
                        }
                ]
        },
        {
                "code": "108",
                "balls": [
                        {
                                "id": "cue",
                                "x": 320,
                                "y": 462
                        },
                        {
                                "id": "yellow",
                                "x": 77,
                                "y": 452
                        },
                        {
                                "id": "red",
                                "x": 92,
                                "y": 405
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 320,
                                "y": 462
                        },
                        {
                                "x": 77,
                                "y": 452
                        },
                        {
                                "x": 68,
                                "y": 470
                        },
                        {
                                "x": 82,
                                "y": 405
                        },
                        {
                                "x": 92,
                                "y": 405
                        }
                ]
        },
        {
                "code": "109",
                "balls": [
                        {
                                "id": "cue",
                                "x": 770,
                                "y": 170
                        },
                        {
                                "id": "yellow",
                                "x": 680,
                                "y": 155
                        },
                        {
                                "id": "red",
                                "x": 695,
                                "y": 130
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 770,
                                "y": 170
                        },
                        {
                                "x": 70,
                                "y": 500
                        },
                        {
                                "x": 640,
                                "y": 95
                        },
                        {
                                "x": 695,
                                "y": 130
                        },
                        {
                                "x": 680,
                                "y": 155
                        }
                ]
        },
        {
                "code": "110",
                "balls": [
                        {
                                "id": "cue",
                                "x": 105,
                                "y": 100
                        },
                        {
                                "id": "yellow",
                                "x": 80,
                                "y": 475
                        },
                        {
                                "id": "red",
                                "x": 60,
                                "y": 455
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 105,
                                "y": 100
                        },
                        {
                                "x": 480,
                                "y": 500
                        },
                        {
                                "x": 930,
                                "y": 270
                        },
                        {
                                "x": 650,
                                "y": 80
                        },
                        {
                                "x": 220,
                                "y": 350
                        },
                        {
                                "x": 60,
                                "y": 455
                        }
                ]
        },
        {
                "code": "111",
                "balls": [
                        {
                                "id": "cue",
                                "x": 115,
                                "y": 135
                        },
                        {
                                "id": "yellow",
                                "x": 75,
                                "y": 420
                        },
                        {
                                "id": "red",
                                "x": 60,
                                "y": 385
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 115,
                                "y": 135
                        },
                        {
                                "x": 680,
                                "y": 500
                        },
                        {
                                "x": 920,
                                "y": 330
                        },
                        {
                                "x": 600,
                                "y": 90
                        },
                        {
                                "x": 60,
                                "y": 385
                        },
                        {
                                "x": 75,
                                "y": 420
                        }
                ]
        },
        {
                "code": "112",
                "balls": [
                        {
                                "id": "cue",
                                "x": 110,
                                "y": 130
                        },
                        {
                                "id": "yellow",
                                "x": 80,
                                "y": 420
                        },
                        {
                                "id": "red",
                                "x": 65,
                                "y": 400
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 110,
                                "y": 130
                        },
                        {
                                "x": 870,
                                "y": 500
                        },
                        {
                                "x": 460,
                                "y": 80
                        },
                        {
                                "x": 65,
                                "y": 400
                        },
                        {
                                "x": 80,
                                "y": 420
                        }
                ]
        },
        {
                "code": "113",
                "balls": [
                        {
                                "id": "cue",
                                "x": 110,
                                "y": 140
                        },
                        {
                                "id": "yellow",
                                "x": 920,
                                "y": 130
                        },
                        {
                                "id": "red",
                                "x": 900,
                                "y": 140
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 110,
                                "y": 140
                        },
                        {
                                "x": 360,
                                "y": 280
                        },
                        {
                                "x": 630,
                                "y": 85
                        },
                        {
                                "x": 930,
                                "y": 130
                        },
                        {
                                "x": 900,
                                "y": 140
                        },
                        {
                                "x": 650,
                                "y": 500
                        },
                        {
                                "x": 110,
                                "y": 140
                        }
                ]
        },
        {
                "code": "114",
                "balls": [
                        {
                                "id": "cue",
                                "x": 210,
                                "y": 140
                        },
                        {
                                "id": "yellow",
                                "x": 130,
                                "y": 125
                        },
                        {
                                "id": "red",
                                "x": 85,
                                "y": 140
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 210,
                                "y": 140
                        },
                        {
                                "x": 145,
                                "y": 500
                        },
                        {
                                "x": 100,
                                "y": 135
                        },
                        {
                                "x": 85,
                                "y": 140
                        },
                        {
                                "x": 130,
                                "y": 125
                        }
                ]
        },
        {
                "code": "115",
                "balls": [
                        {
                                "id": "cue",
                                "x": 165,
                                "y": 250
                        },
                        {
                                "id": "yellow",
                                "x": 195,
                                "y": 230
                        },
                        {
                                "id": "red",
                                "x": 130,
                                "y": 250
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 165,
                                "y": 250
                        },
                        {
                                "x": 190,
                                "y": 500
                        },
                        {
                                "x": 210,
                                "y": 80
                        },
                        {
                                "x": 145,
                                "y": 250
                        },
                        {
                                "x": 130,
                                "y": 250
                        }
                ]
        },
        {
                "code": "116",
                "balls": [
                        {
                                "id": "cue",
                                "x": 180,
                                "y": 275
                        },
                        {
                                "id": "yellow",
                                "x": 150,
                                "y": 320
                        },
                        {
                                "id": "red",
                                "x": 75,
                                "y": 210
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 180,
                                "y": 275
                        },
                        {
                                "x": 210,
                                "y": 500
                        },
                        {
                                "x": 170,
                                "y": 85
                        },
                        {
                                "x": 75,
                                "y": 210
                        },
                        {
                                "x": 150,
                                "y": 320
                        }
                ]
        },
        {
                "code": "117",
                "balls": [
                        {
                                "id": "cue",
                                "x": 190,
                                "y": 230
                        },
                        {
                                "id": "yellow",
                                "x": 140,
                                "y": 330
                        },
                        {
                                "id": "red",
                                "x": 80,
                                "y": 230
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 190,
                                "y": 230
                        },
                        {
                                "x": 170,
                                "y": 500
                        },
                        {
                                "x": 155,
                                "y": 80
                        },
                        {
                                "x": 80,
                                "y": 230
                        },
                        {
                                "x": 140,
                                "y": 330
                        }
                ]
        },
        {
                "code": "118",
                "balls": [
                        {
                                "id": "cue",
                                "x": 95,
                                "y": 100
                        },
                        {
                                "id": "yellow",
                                "x": 130,
                                "y": 75
                        },
                        {
                                "id": "red",
                                "x": 210,
                                "y": 385
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 95,
                                "y": 100
                        },
                        {
                                "x": 100,
                                "y": 470
                        },
                        {
                                "x": 190,
                                "y": 75
                        },
                        {
                                "x": 210,
                                "y": 385
                        }
                ]
        },
        {
                "code": "119",
                "balls": [
                        {
                                "id": "cue",
                                "x": 140,
                                "y": 230
                        },
                        {
                                "id": "yellow",
                                "x": 170,
                                "y": 245
                        },
                        {
                                "id": "red",
                                "x": 100,
                                "y": 220
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 140,
                                "y": 230
                        },
                        {
                                "x": 100,
                                "y": 500
                        },
                        {
                                "x": 120,
                                "y": 80
                        },
                        {
                                "x": 100,
                                "y": 220
                        },
                        {
                                "x": 170,
                                "y": 245
                        }
                ]
        },
        {
                "code": "120",
                "balls": [
                        {
                                "id": "cue",
                                "x": 330,
                                "y": 180
                        },
                        {
                                "id": "yellow",
                                "x": 90,
                                "y": 65
                        },
                        {
                                "id": "red",
                                "x": 70,
                                "y": 480
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 330,
                                "y": 180
                        },
                        {
                                "x": 110,
                                "y": 60
                        },
                        {
                                "x": 70,
                                "y": 480
                        }
                ]
        },
        {
                "code": "121",
                "balls": [
                        {
                                "id": "cue",
                                "x": 90,
                                "y": 85
                        },
                        {
                                "id": "yellow",
                                "x": 55,
                                "y": 460
                        },
                        {
                                "id": "red",
                                "x": 60,
                                "y": 130
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 90,
                                "y": 85
                        },
                        {
                                "x": 105,
                                "y": 470
                        },
                        {
                                "x": 75,
                                "y": 300
                        },
                        {
                                "x": 60,
                                "y": 130
                        },
                        {
                                "x": 55,
                                "y": 460
                        }
                ]
        },
        {
                "code": "122",
                "balls": [
                        {
                                "id": "cue",
                                "x": 850,
                                "y": 410
                        },
                        {
                                "id": "yellow",
                                "x": 870,
                                "y": 360
                        },
                        {
                                "id": "red",
                                "x": 80,
                                "y": 230
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 850,
                                "y": 410
                        },
                        {
                                "x": 870,
                                "y": 360
                        },
                        {
                                "x": 480,
                                "y": 500
                        },
                        {
                                "x": 240,
                                "y": 80
                        },
                        {
                                "x": 80,
                                "y": 230
                        }
                ]
        },
        {
                "code": "123",
                "balls": [
                        {
                                "id": "cue",
                                "x": 760,
                                "y": 165
                        },
                        {
                                "id": "yellow",
                                "x": 725,
                                "y": 165
                        },
                        {
                                "id": "red",
                                "x": 75,
                                "y": 230
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 760,
                                "y": 165
                        },
                        {
                                "x": 725,
                                "y": 165
                        },
                        {
                                "x": 480,
                                "y": 500
                        },
                        {
                                "x": 240,
                                "y": 75
                        },
                        {
                                "x": 80,
                                "y": 310
                        },
                        {
                                "x": 75,
                                "y": 230
                        }
                ]
        },
        {
                "code": "124",
                "balls": [
                        {
                                "id": "cue",
                                "x": 540,
                                "y": 190
                        },
                        {
                                "id": "yellow",
                                "x": 590,
                                "y": 220
                        },
                        {
                                "id": "red",
                                "x": 890,
                                "y": 390
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 540,
                                "y": 190
                        },
                        {
                                "x": 895,
                                "y": 230
                        },
                        {
                                "x": 70,
                                "y": 430
                        },
                        {
                                "x": 380,
                                "y": 500
                        },
                        {
                                "x": 890,
                                "y": 390
                        }
                ]
        },
        {
                "code": "125",
                "balls": [
                        {
                                "id": "cue",
                                "x": 455,
                                "y": 160
                        },
                        {
                                "id": "yellow",
                                "x": 850,
                                "y": 470
                        },
                        {
                                "id": "red",
                                "x": 750,
                                "y": 465
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 455,
                                "y": 160
                        },
                        {
                                "x": 750,
                                "y": 465
                        },
                        {
                                "x": 75,
                                "y": 445
                        },
                        {
                                "x": 930,
                                "y": 430
                        },
                        {
                                "x": 850,
                                "y": 470
                        }
                ]
        },
        {
                "code": "126",
                "balls": [
                        {
                                "id": "cue",
                                "x": 170,
                                "y": 430
                        },
                        {
                                "id": "yellow",
                                "x": 555,
                                "y": 90
                        },
                        {
                                "id": "red",
                                "x": 210,
                                "y": 465
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 170,
                                "y": 430
                        },
                        {
                                "x": 210,
                                "y": 465
                        },
                        {
                                "x": 930,
                                "y": 430
                        },
                        {
                                "x": 70,
                                "y": 230
                        },
                        {
                                "x": 555,
                                "y": 90
                        }
                ]
        },
        {
                "code": "127",
                "balls": [
                        {
                                "id": "cue",
                                "x": 420,
                                "y": 240
                        },
                        {
                                "id": "yellow",
                                "x": 80,
                                "y": 310
                        },
                        {
                                "id": "red",
                                "x": 400,
                                "y": 310
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 420,
                                "y": 240
                        },
                        {
                                "x": 400,
                                "y": 310
                        },
                        {
                                "x": 100,
                                "y": 500
                        },
                        {
                                "x": 70,
                                "y": 430
                        },
                        {
                                "x": 450,
                                "y": 80
                        },
                        {
                                "x": 900,
                                "y": 500
                        },
                        {
                                "x": 80,
                                "y": 310
                        }
                ]
        },
        {
                "code": "128",
                "balls": [
                        {
                                "id": "cue",
                                "x": 320,
                                "y": 360
                        },
                        {
                                "id": "yellow",
                                "x": 920,
                                "y": 105
                        },
                        {
                                "id": "red",
                                "x": 80,
                                "y": 85
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 320,
                                "y": 360
                        },
                        {
                                "x": 920,
                                "y": 105
                        },
                        {
                                "x": 930,
                                "y": 100
                        },
                        {
                                "x": 70,
                                "y": 400
                        },
                        {
                                "x": 300,
                                "y": 500
                        },
                        {
                                "x": 80,
                                "y": 85
                        }
                ]
        },
        {
                "code": "129",
                "balls": [
                        {
                                "id": "cue",
                                "x": 800,
                                "y": 300
                        },
                        {
                                "id": "yellow",
                                "x": 680,
                                "y": 70
                        },
                        {
                                "id": "red",
                                "x": 900,
                                "y": 390
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 800,
                                "y": 300
                        },
                        {
                                "x": 680,
                                "y": 70
                        },
                        {
                                "x": 500,
                                "y": 500
                        },
                        {
                                "x": 200,
                                "y": 100
                        },
                        {
                                "x": 70,
                                "y": 300
                        },
                        {
                                "x": 790,
                                "y": 500
                        },
                        {
                                "x": 900,
                                "y": 390
                        }
                ]
        },
        {
                "code": "130",
                "balls": [
                        {
                                "id": "cue",
                                "x": 930,
                                "y": 465
                        },
                        {
                                "id": "yellow",
                                "x": 890,
                                "y": 465
                        },
                        {
                                "id": "red",
                                "x": 900,
                                "y": 90
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 930,
                                "y": 465
                        },
                        {
                                "x": 890,
                                "y": 465
                        },
                        {
                                "x": 930,
                                "y": 430
                        },
                        {
                                "x": 580,
                                "y": 80
                        },
                        {
                                "x": 280,
                                "y": 500
                        },
                        {
                                "x": 80,
                                "y": 230
                        },
                        {
                                "x": 900,
                                "y": 90
                        }
                ]
        },
        {
                "code": "131",
                "balls": [
                        {
                                "id": "cue",
                                "x": 930,
                                "y": 420
                        },
                        {
                                "id": "yellow",
                                "x": 470,
                                "y": 270
                        },
                        {
                                "id": "red",
                                "x": 900,
                                "y": 465
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 930,
                                "y": 420
                        },
                        {
                                "x": 470,
                                "y": 270
                        },
                        {
                                "x": 390,
                                "y": 80
                        },
                        {
                                "x": 100,
                                "y": 500
                        },
                        {
                                "x": 70,
                                "y": 400
                        },
                        {
                                "x": 850,
                                "y": 450
                        },
                        {
                                "x": 900,
                                "y": 465
                        }
                ]
        },
        {
                "code": "132",
                "balls": [
                        {
                                "id": "cue",
                                "x": 90,
                                "y": 260
                        },
                        {
                                "id": "yellow",
                                "x": 60,
                                "y": 260
                        },
                        {
                                "id": "red",
                                "x": 310,
                                "y": 80
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 90,
                                "y": 260
                        },
                        {
                                "x": 60,
                                "y": 260
                        },
                        {
                                "x": 70,
                                "y": 80
                        },
                        {
                                "x": 480,
                                "y": 500
                        },
                        {
                                "x": 750,
                                "y": 80
                        },
                        {
                                "x": 870,
                                "y": 500
                        },
                        {
                                "x": 310,
                                "y": 80
                        }
                ]
        },
        {
                "code": "133",
                "balls": [
                        {
                                "id": "cue",
                                "x": 280,
                                "y": 320
                        },
                        {
                                "id": "yellow",
                                "x": 120,
                                "y": 295
                        },
                        {
                                "id": "red",
                                "x": 160,
                                "y": 360
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 280,
                                "y": 320
                        },
                        {
                                "x": 340,
                                "y": 310
                        },
                        {
                                "x": 920,
                                "y": 230
                        },
                        {
                                "x": 750,
                                "y": 80
                        },
                        {
                                "x": 70,
                                "y": 420
                        },
                        {
                                "x": 140,
                                "y": 500
                        },
                        {
                                "x": 160,
                                "y": 360
                        }
                ]
        },
        {
                "code": "134",
                "balls": [
                        {
                                "id": "cue",
                                "x": 800,
                                "y": 180
                        },
                        {
                                "id": "yellow",
                                "x": 760,
                                "y": 170
                        },
                        {
                                "id": "red",
                                "x": 180,
                                "y": 350
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 800,
                                "y": 180
                        },
                        {
                                "x": 760,
                                "y": 170
                        },
                        {
                                "x": 910,
                                "y": 150
                        },
                        {
                                "x": 80,
                                "y": 420
                        },
                        {
                                "x": 180,
                                "y": 350
                        }
                ]
        },
        {
                "code": "135",
                "balls": [
                        {
                                "id": "cue",
                                "x": 210,
                                "y": 365
                        },
                        {
                                "id": "yellow",
                                "x": 70,
                                "y": 385
                        },
                        {
                                "id": "red",
                                "x": 160,
                                "y": 455
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 210,
                                "y": 365
                        },
                        {
                                "x": 70,
                                "y": 390
                        },
                        {
                                "x": 920,
                                "y": 130
                        },
                        {
                                "x": 840,
                                "y": 90
                        },
                        {
                                "x": 160,
                                "y": 455
                        }
                ]
        },
        {
                "code": "136",
                "balls": [
                        {
                                "id": "cue",
                                "x": 240,
                                "y": 370
                        },
                        {
                                "id": "yellow",
                                "x": 160,
                                "y": 390
                        },
                        {
                                "id": "red",
                                "x": 60,
                                "y": 390
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 240,
                                "y": 370
                        },
                        {
                                "x": 160,
                                "y": 390
                        },
                        {
                                "x": 70,
                                "y": 430
                        },
                        {
                                "x": 430,
                                "y": 80
                        },
                        {
                                "x": 930,
                                "y": 430
                        },
                        {
                                "x": 60,
                                "y": 390
                        }
                ]
        },
        {
                "code": "137",
                "balls": [
                        {
                                "id": "cue",
                                "x": 880,
                                "y": 310
                        },
                        {
                                "id": "yellow",
                                "x": 820,
                                "y": 270
                        },
                        {
                                "id": "red",
                                "x": 95,
                                "y": 230
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 880,
                                "y": 310
                        },
                        {
                                "x": 820,
                                "y": 270
                        },
                        {
                                "x": 80,
                                "y": 240
                        },
                        {
                                "x": 850,
                                "y": 90
                        },
                        {
                                "x": 930,
                                "y": 230
                        },
                        {
                                "x": 95,
                                "y": 230
                        }
                ]
        },
        {
                "code": "138",
                "balls": [
                        {
                                "id": "cue",
                                "x": 820,
                                "y": 300
                        },
                        {
                                "id": "yellow",
                                "x": 120,
                                "y": 110
                        },
                        {
                                "id": "red",
                                "x": 105,
                                "y": 150
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 820,
                                "y": 300
                        },
                        {
                                "x": 120,
                                "y": 110
                        },
                        {
                                "x": 80,
                                "y": 210
                        },
                        {
                                "x": 900,
                                "y": 80
                        },
                        {
                                "x": 105,
                                "y": 150
                        }
                ]
        },
        {
                "code": "139",
                "balls": [
                        {
                                "id": "cue",
                                "x": 780,
                                "y": 300
                        },
                        {
                                "id": "yellow",
                                "x": 825,
                                "y": 80
                        },
                        {
                                "id": "red",
                                "x": 850,
                                "y": 120
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 780,
                                "y": 300
                        },
                        {
                                "x": 80,
                                "y": 90
                        },
                        {
                                "x": 825,
                                "y": 80
                        },
                        {
                                "x": 850,
                                "y": 120
                        }
                ]
        },
        {
                "code": "140",
                "balls": [
                        {
                                "id": "cue",
                                "x": 800,
                                "y": 130
                        },
                        {
                                "id": "yellow",
                                "x": 680,
                                "y": 90
                        },
                        {
                                "id": "red",
                                "x": 900,
                                "y": 390
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 800,
                                "y": 130
                        },
                        {
                                "x": 680,
                                "y": 90
                        },
                        {
                                "x": 80,
                                "y": 80
                        },
                        {
                                "x": 720,
                                "y": 500
                        },
                        {
                                "x": 900,
                                "y": 390
                        }
                ]
        },
        {
                "code": "141",
                "balls": [
                        {
                                "id": "cue",
                                "x": 890,
                                "y": 220
                        },
                        {
                                "id": "yellow",
                                "x": 900,
                                "y": 470
                        },
                        {
                                "id": "red",
                                "x": 80,
                                "y": 450
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 890,
                                "y": 220
                        },
                        {
                                "x": 900,
                                "y": 470
                        },
                        {
                                "x": 720,
                                "y": 480
                        },
                        {
                                "x": 500,
                                "y": 450
                        },
                        {
                                "x": 80,
                                "y": 450
                        }
                ]
        },
        {
                "code": "142",
                "balls": [
                        {
                                "id": "cue",
                                "x": 930,
                                "y": 480
                        },
                        {
                                "id": "yellow",
                                "x": 80,
                                "y": 420
                        },
                        {
                                "id": "red",
                                "x": 140,
                                "y": 460
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 930,
                                "y": 480
                        },
                        {
                                "x": 140,
                                "y": 460
                        },
                        {
                                "x": 80,
                                "y": 420
                        }
                ]
        },
        {
                "code": "143",
                "balls": [
                        {
                                "id": "cue",
                                "x": 680,
                                "y": 90
                        },
                        {
                                "id": "yellow",
                                "x": 70,
                                "y": 95
                        },
                        {
                                "id": "red",
                                "x": 80,
                                "y": 455
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 680,
                                "y": 90
                        },
                        {
                                "x": 70,
                                "y": 95
                        },
                        {
                                "x": 75,
                                "y": 310
                        },
                        {
                                "x": 80,
                                "y": 455
                        }
                ]
        },
        {
                "code": "144",
                "balls": [
                        {
                                "id": "cue",
                                "x": 790,
                                "y": 300
                        },
                        {
                                "id": "yellow",
                                "x": 240,
                                "y": 60
                        },
                        {
                                "id": "red",
                                "x": 90,
                                "y": 160
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 790,
                                "y": 300
                        },
                        {
                                "x": 240,
                                "y": 60
                        },
                        {
                                "x": 180,
                                "y": 500
                        },
                        {
                                "x": 120,
                                "y": 80
                        },
                        {
                                "x": 90,
                                "y": 160
                        }
                ]
        },
        {
                "code": "145",
                "balls": [
                        {
                                "id": "cue",
                                "x": 220,
                                "y": 145
                        },
                        {
                                "id": "yellow",
                                "x": 215,
                                "y": 80
                        },
                        {
                                "id": "red",
                                "x": 190,
                                "y": 130
                        }
                ],
                "first": "yellow",
                "second": "red",
                "guidePath": [
                        {
                                "x": 220,
                                "y": 145
                        },
                        {
                                "x": 215,
                                "y": 80
                        },
                        {
                                "x": 70,
                                "y": 480
                        },
                        {
                                "x": 110,
                                "y": 370
                        },
                        {
                                "x": 190,
                                "y": 130
                        }
                ]
        },
        {
                "code": "146",
                "balls": [
                        {
                                "id": "cue",
                                "x": 120,
                                "y": 85
                        },
                        {
                                "id": "yellow",
                                "x": 75,
                                "y": 300
                        },
                        {
                                "id": "red",
                                "x": 60,
                                "y": 300
                        }
                ],
                "first": "red",
                "second": "yellow",
                "guidePath": [
                        {
                                "x": 120,
                                "y": 85
                        },
                        {
                                "x": 60,
                                "y": 300
                        },
                        {
                                "x": 75,
                                "y": 300
                        },
                        {
                                "x": 85,
                                "y": 500
                        },
                        {
                                "x": 70,
                                "y": 410
                        },
                        {
                                "x": 110,
                                "y": 300
                        }
                ]
        }
];

      for (const sync of USER_IMAGE_SYNC_107_146) {
        const idx = Number(sync.code) - 1;
        const shot = shots[idx];
        if (!shot) continue;
        shot.balls = avoidOverlap(sync.balls.map(b => ballObj(b.id, b.id === 'cue' ? 'Blanca' : (b.id === 'yellow' ? 'Amarilla' : 'Roja'), b.x, b.y)));
        shot.first = sync.first;
        shot.second = sync.second;
        shot.guidePath = sync.guidePath.map(p => ({ x: p.x, y: p.y }));
        shot.referenceImages = practiceReferenceImages[sync.code];
        shot.family = 'Video original · pantallazo sincronizado';
        shot.focus = 'Jugada sincronizada con las imágenes de posición inicial y recorrido guía proporcionadas por el usuario.';
        shot.tip = 'Practica comparando la línea marcada del video con la guía en la mesa. Ajusta potencia, efecto y cantidad de bola hasta reproducir el recorrido.';
        shot.route = 'recorrido guía sincronizado con el pantallazo del video';
      }

      // Sincronización puntual de las jugadas 147, 148 y 149 con las imágenes definitivas enviadas hoy por el usuario.
      const USER_IMAGE_SYNC_147_149 = [
        {
          code: '147',
          balls: [
            { id: 'cue', x: 80, y: 435 },
            { id: 'yellow', x: 142, y: 442 },
            { id: 'red', x: 82, y: 354 }
          ],
          first: 'red',
          second: 'yellow',
          power: 36,
          effect: makeEffect(-42, 8),
          aimAt: makeAim(80, 356, 'roja fina por izquierda'),
          guidePath: [
            { x: 80, y: 435 },
            { x: 82, y: 354 },
            { x: 70, y: 382 },
            { x: 74, y: 430 },
            { x: 106, y: 454 },
            { x: 142, y: 442 }
          ],
          route: 'roja primero → pequeña corrección por banda/cierre corto → amarilla',
          focus: 'Replica el pantallazo 147: roja arriba a la izquierda, blanca abajo a la izquierda y amarilla a su derecha. La guía es corta y de control fino.',
          tip: 'Golpea fino la roja con potencia suave y poco recorrido. La prioridad es imitar la forma corta de la guía del video antes que jugar fuerte.'
        },
        {
          code: '148',
          balls: [
            { id: 'cue', x: 78, y: 97 },
            { id: 'yellow', x: 179, y: 473 },
            { id: 'red', x: 74, y: 371 }
          ],
          first: 'red',
          second: 'yellow',
          power: 34,
          effect: makeEffect(-36, 18),
          aimAt: makeAim(74, 371, 'roja fina por la parte externa'),
          guidePath: [
            { x: 78, y: 97 },
            { x: 92, y: 28 },
            { x: 112, y: 482 },
            { x: 82, y: 210 },
            { x: 120, y: 378 },
            { x: 179, y: 473 }
          ],
          route: 'recorrido corto sobre el lado izquierdo → roja primero → cierre descendente a la amarilla',
          focus: 'Replica el pantallazo 148: blanca arriba a la izquierda, roja sobre la banda izquierda a media altura y amarilla cerca de la banda inferior izquierda. La jugada exige control fino y cierre corto.',
          tip: 'Ataca la roja con muy buena dosificación. Usa efecto ligeramente a la izquierda para sostener la blanca en el costado y cerrar sobre la amarilla sin pasarte.'
        },
        {
          code: '149',
          balls: [
            { id: 'cue', x: 835, y: 343 },
            { id: 'yellow', x: 914, y: 80 },
            { id: 'red', x: 524, y: 499 }
          ],
          first: 'red',
          second: 'yellow',
          power: 55,
          effect: makeEffect(-26, 14),
          aimAt: makeAim(524, 499, 'roja media con salida larga'),
          guidePath: [
            { x: 835, y: 343 },
            { x: 524, y: 499 },
            { x: 40, y: 300 },
            { x: 300, y: 25 },
            { x: 950, y: 140 },
            { x: 914, y: 80 }
          ],
          route: 'roja primero → banda izquierda → banda superior → banda derecha → amarilla',
          focus: 'Replica el pantallazo 149 enviado hoy por el usuario: amarilla alta a la derecha, blanca en la mitad derecha y roja baja cerca del centro. La carambola debe sentirse larga, limpia y controlada.',
          tip: 'Juega con potencia media-alta y un poco de efecto a la izquierda para abrir la salida después de la roja y llegar con buena línea a la amarilla tras tres bandas.'
        }
      ];
      for (const sync of USER_IMAGE_SYNC_147_149) {
        const idx = Number(sync.code) - 1;
        const shot = shots[idx];
        if (!shot) continue;
        shot.balls = avoidOverlap(sync.balls.map(b => ballObj(b.id, b.id === 'cue' ? 'Blanca' : (b.id === 'yellow' ? 'Amarilla' : 'Roja'), b.x, b.y)));
        shot.first = sync.first;
        shot.second = sync.second;
        shot.guidePath = sync.guidePath.map(p => ({ x: p.x, y: p.y }));
        shot.referenceImages = practiceReferenceImages[sync.code];
        shot.family = 'Video original · imágenes definitivas del usuario';
        shot.route = sync.route;
        shot.focus = sync.focus;
        shot.tip = sync.tip;
        shot.power = sync.power;
        shot.effect = sync.effect;
        shot.aimAt = sync.aimAt;
      }



      // Metadatos del video reanalizado 026-060: usados para mostrar trazabilidad y ajustar velocidad guiada.
      for (const s of shots) {
        if (s && VIDEO_ANALYSIS_026_060[s.code]) {
          s.videoFrameTimes = VIDEO_ANALYSIS_026_060[s.code];
          if (Array.isArray(s.guidePath)) {
            s.videoDistance = s.guidePath.slice(1).reduce((sum, p, i) => sum + Math.hypot(p.x - s.guidePath[i].x, p.y - s.guidePath[i].y), 0);
          }
          s.family = 'Video original reanalizado · MP4 exacto + física realista';
        }
      }

      const contactViews = {
        '001': { target: 'red', cueX: 75, cueY: 34, dx: 34, dy: 2, overlap: 0.88, note: 'Vista del video: blanca delante y roja detrás, desplazada hacia la derecha.' },
        '002': { target: 'red', cueX: 75, cueY: 34, dx: 35, dy: 2, overlap: 0.88, note: 'Vista del video 002: blanca delante con roja detrás al lado derecho.' },
        '003': { target: 'red', cueX: 75, cueY: 34, dx: 34, dy: 2, overlap: 0.88, note: 'Vista del video 003: blanca delante y roja detrás a la derecha.' },
        '004': { target: 'red', cueX: 75, cueY: 34, dx: 34, dy: 2, overlap: 0.88, note: 'Vista del video 004: blanca delante y roja detrás a la derecha.' },
        '005': { target: 'yellow', cueX: 75, cueY: 34, dx: 36, dy: 1, overlap: 0.88, note: 'Vista del video 005: blanca delante y amarilla detrás a la derecha.' },
        '006': { target: 'red', cueX: 73, cueY: 34, dx: -35, dy: -2, overlap: 0.88, note: 'Vista del video 006: roja detrás a la izquierda y blanca delante a la derecha.' },
        '007': { target: 'red', cueX: 75, cueY: 34, dx: -44, dy: -2, overlap: 0.92, note: 'Vista del video 007 sincronizada con la imagen: roja detrás a la izquierda y blanca delante a la derecha, punto azul hacia la derecha.' },
        '008': { target: 'red', cueX: 73, cueY: 34, dx: 32, dy: 0, overlap: 0.88, note: 'Vista del video 008: blanca delante con roja detrás hacia la derecha.' },
        '009': { target: 'red', cueX: 74, cueY: 34, dx: 33, dy: 1, overlap: 0.88, note: 'Vista del video 009: blanca delante y roja detrás a la derecha.' },
        '010': { target: 'red', cueX: 74, cueY: 34, dx: 33, dy: 1, overlap: 0.88, note: 'Vista del video 010: blanca delante y roja detrás a la derecha.' },
        '011': { target: 'red', cueX: 75, cueY: 34, dx: -34, dy: -1, overlap: 0.88, note: 'Vista del video 011: roja detrás a la izquierda y blanca delante.' },
        '012': { target: 'red', cueX: 75, cueY: 34, dx: -34, dy: -1, overlap: 0.88, note: 'Vista del video 012: roja detrás a la izquierda y blanca delante.' },
        '013': { target: 'red', cueX: 72, cueY: 34, dx: 34, dy: -1, overlap: 0.88, note: 'Vista del video 013: blanca delante y roja detrás a la derecha.' },
        '014': { target: 'red', cueX: 72, cueY: 34, dx: 34, dy: -1, overlap: 0.88, note: 'Vista del video 014: blanca delante y roja detrás a la derecha.' },
        '015': { target: 'red', cueX: 72, cueY: 34, dx: 34, dy: -1, overlap: 0.88, note: 'Vista del video 015: blanca delante y roja detrás a la derecha.' },
        '016': { target: 'red', cueX: 72, cueY: 34, dx: 34, dy: -1, overlap: 0.88, note: 'Vista del video 016: blanca delante y roja detrás a la derecha.' },
        '017': { target: 'red', cueX: 74, cueY: 34, dx: -34, dy: -1, overlap: 0.88, note: 'Vista del video 017: roja detrás a la izquierda y blanca delante.' },
        '018': { target: 'red', cueX: 74, cueY: 34, dx: -34, dy: -1, overlap: 0.88, note: 'Vista del video 018: roja detrás a la izquierda y blanca delante.' },
        '019': { target: 'red', cueX: 74, cueY: 34, dx: -34, dy: -1, overlap: 0.88, note: 'Vista del video 019: roja detrás a la izquierda y blanca delante, con efecto abajo-derecha.' },
        '020': { target: 'red', cueX: 74, cueY: 34, dx: -34, dy: -1, overlap: 0.88, note: 'Vista del video 020: roja detrás a la izquierda y blanca delante, con efecto abajo-derecha.' },
        '021': { target: 'red', cueX: 74, cueY: 34, dx: -34, dy: -2, overlap: 0.88, note: 'Vista del video 021: roja detrás a la izquierda y blanca delante, con efecto abajo-derecha.' },
        '022': { target: 'red', cueX: 72, cueY: 34, dx: 34, dy: 0, overlap: 0.88, note: 'Vista del video 022: blanca delante y roja detrás a la derecha, con efecto arriba-izquierda.' },
        '023': { target: 'red', cueX: 72, cueY: 34, dx: 34, dy: -1, overlap: 0.88, note: 'Vista del video 023: blanca delante y roja detrás a la derecha, con efecto arriba-izquierda.' },
        '024': { target: 'yellow', cueX: 72, cueY: 34, dx: 36, dy: -1, overlap: 0.88, note: 'Vista del video 024: blanca delante y amarilla detrás a la derecha, con efecto arriba-izquierda.' },
        '025': { target: 'red', cueX: 72, cueY: 34, dx: 34, dy: -1, overlap: 0.88, note: 'Vista del video 025: blanca delante y roja detrás a la derecha, con efecto arriba-izquierda.' },
        '026': { target: 'red', cueX: 76, cueY: 34, dx: -36, dy: 0, overlap: 0.88, note: 'Vista del video 026: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '027': { target: 'red', cueX: 76, cueY: 34, dx: -36, dy: 0, overlap: 0.88, note: 'Vista del video 027: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '028': { target: 'red', cueX: 62, cueY: 34, dx: 36, dy: 0, overlap: 0.88, note: 'Vista del video 028: blanca delante a la izquierda y roja detrás a la derecha, con efecto arriba-izquierda.' },
        '029': { target: 'red', cueX: 76, cueY: 34, dx: -36, dy: 0, overlap: 0.88, note: 'Vista del video 029: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '030': { target: 'red', cueX: 75, cueY: 34, dx: -34, dy: -2, overlap: 0.88, note: 'Vista del video 030: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '031': { target: 'red', cueX: 76, cueY: 34, dx: -35, dy: -1, overlap: 0.88, note: 'Vista del video 031: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '032': { target: 'red', cueX: 77, cueY: 34, dx: -36, dy: -1, overlap: 0.88, note: 'Vista del video 032: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '033': { target: 'red', cueX: 77, cueY: 34, dx: -36, dy: -1, overlap: 0.88, note: 'Vista del video 033: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '034': { target: 'red', cueX: 77, cueY: 34, dx: -36, dy: -1, overlap: 0.88, note: 'Vista del video 034: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '035': { target: 'red', cueX: 76, cueY: 34, dx: -36, dy: -1, overlap: 0.88, note: 'Vista del video 035: roja detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '036': { target: 'yellow', cueX: 76, cueY: 34, dx: -36, dy: -1, overlap: 0.88, note: 'Vista del video 036: amarilla detrás a la izquierda y blanca delante a la derecha, con efecto arriba-izquierda.' },
        '037': { target: 'yellow', cueX: 76, cueY: 34, dx: -36, dy: 1, overlap: 0.88, note: 'Vista del video 037: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '038': { target: 'yellow', cueX: 76, cueY: 34, dx: -36, dy: 1, overlap: 0.88, note: 'Vista del video 038: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '039': { target: 'yellow', cueX: 62, cueY: 38, dx: 36, dy: -1, overlap: 0.88, note: 'Vista del video 039: blanca delante a la izquierda y amarilla detrás a la derecha, con golpe fino y efecto abajo-izquierda.' },
        '040': { target: 'yellow', cueX: 76, cueY: 34, dx: -36, dy: -1, overlap: 0.88, note: 'Vista del video 040: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-derecha.' },
        '041': { target: 'red', cueX: 62, cueY: 34, dx: 36, dy: -1, overlap: 0.88, note: 'Vista del video 041: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '042': { target: 'red', cueX: 62, cueY: 34, dx: 36, dy: -1, overlap: 0.88, note: 'Vista del video 042: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '043': { target: 'red', cueX: 62, cueY: 34, dx: 36, dy: -1, overlap: 0.88, note: 'Vista del video 043: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '044': { target: 'red', cueX: 62, cueY: 34, dx: 36, dy: -1, overlap: 0.88, note: 'Vista del video 044: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '045': { target: 'red', cueX: 62, cueY: 34, dx: 36, dy: -1, overlap: 0.88, note: 'Vista del video 045: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto arriba-derecha.' },
        '046': { target: 'red', cueX: 62, cueY: 34, dx: 34, dy: -1, overlap: 0.86, note: 'Vista del video 046: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '047': { target: 'red', cueX: 62, cueY: 34, dx: 34, dy: -1, overlap: 0.86, note: 'Vista del video 047: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '048': { target: 'red', cueX: 60, cueY: 40, dx: 36, dy: -1, overlap: 0.86, note: 'Vista del video 048: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto abajo-izquierda.' },
        '049': { target: 'yellow', cueX: 64, cueY: 38, dx: -34, dy: 0, overlap: 0.86, note: 'Vista del video 049: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '050': { target: 'yellow', cueX: 64, cueY: 38, dx: -34, dy: 0, overlap: 0.86, note: 'Vista del video 050: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '051': { target: 'red', cueX: 72, cueY: 34, dx: 34, dy: 0, overlap: 0.86, note: 'Vista del video 051: blanca delante y roja detrás a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '052': { target: 'yellow', cueX: 66, cueY: 34, dx: -34, dy: 0, overlap: 0.86, note: 'Vista del video 052: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '053': { target: 'yellow', cueX: 66, cueY: 34, dx: -34, dy: 0, overlap: 0.86, note: 'Vista del video 053: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '054': { target: 'yellow', cueX: 66, cueY: 34, dx: -34, dy: 0, overlap: 0.86, note: 'Vista del video 054: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-derecha.' },
        '055': { target: 'red', cueX: 66, cueY: 34, dx: 34, dy: 0, overlap: 0.86, note: 'Vista del video 055: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto abajo-izquierda.' },
        '056': { target: 'yellow', cueX: 64, cueY: 38, dx: -34, dy: 0, overlap: 0.86, note: 'Vista del video 056: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto arriba-izquierda.' },
        '057': { target: 'yellow', cueX: 64, cueY: 40, dx: -34, dy: 0, overlap: 0.86, note: 'Vista del video 057: amarilla detrás a la izquierda y blanca delante a la derecha, con golpe fino y efecto abajo-izquierda.' },
        '058': { target: 'yellow', cueX: 62, cueY: 36, dx: 36, dy: 0, overlap: 0.86, note: 'Vista del video 058: blanca delante a la izquierda y amarilla detrás a la derecha, con golpe fino y efecto a la derecha.' },
        '059': { target: 'red', cueX: 62, cueY: 36, dx: 36, dy: 0, overlap: 0.86, note: 'Vista del video 059: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto a la izquierda.' },
        '060': { target: 'red', cueX: 62, cueY: 40, dx: 36, dy: 0, overlap: 0.86, note: 'Vista del video 060: blanca delante a la izquierda y roja detrás a la derecha, con golpe fino y efecto abajo-izquierda.' }
      };
      function generatedReferenceImages(code, shot) {
        const firstName = shot && shot.first ? ballLabel(shot.first) : 'primera bola';
        const secondName = shot && shot.second ? ballLabel(shot.second) : 'segunda bola';
        return [
          {
            title: `Imagen 1 · Posición inicial ${code}`,
            note: `Ubicación exacta extraída del MP4 para la jugada ${code} antes del tiro.`,
            src: `assets/jugadas/posicion_inicial_${code}.webp`
          },
          {
            title: `Imagen 2 · Recorrido guiado ${code}`,
            note: `Ruta de práctica: blanca → ${firstName} → bandas → ${secondName}.`,
            src: `assets/jugadas/recorrido_guia_${code}.webp`
          }
        ];
      }

      function railPoint(name, ratio = .5) {
        const t = Math.max(.08, Math.min(.92, ratio));
        if (name === 'izquierda') return { x: LEFT + R, y: TOP + R + (BOTTOM - TOP - 2 * R) * t };
        if (name === 'derecha') return { x: RIGHT - R, y: TOP + R + (BOTTOM - TOP - 2 * R) * t };
        if (name === 'superior') return { x: LEFT + R + (RIGHT - LEFT - 2 * R) * t, y: TOP + R };
        return { x: LEFT + R + (RIGHT - LEFT - 2 * R) * t, y: BOTTOM - R };
      }

      function autoGuidePathForShot(shot, index) {
        const cue = shot.balls.find(b => b.id === 'cue');
        const first = shot.balls.find(b => b.id === shot.first) || shot.balls.find(b => b.id !== 'cue');
        const second = shot.balls.find(b => b.id === shot.second) || shot.balls.find(b => b.id !== 'cue' && b.id !== (first && first.id));
        if (!cue || !first || !second) return [];
        const goLeft = first.x > second.x || shot.effect.x < 0;
        const goDown = first.y < second.y || shot.effect.y < 0;
        const longA = goDown ? 'inferior' : 'superior';
        const shortA = goLeft ? 'izquierda' : 'derecha';
        const longB = goDown ? 'superior' : 'inferior';
        const shortB = goLeft ? 'derecha' : 'izquierda';
        const ratioA = ((index % 7) + 1) / 8;
        const ratioB = ((index % 5) + 2) / 7;
        const ratioC = ((index % 9) + 1) / 10;
        let pts = [{ x: cue.x, y: cue.y }, { x: first.x, y: first.y }];
        if (shot.title.includes('Ticky')) {
          pts = [{ x: cue.x, y: cue.y }, railPoint(goDown ? 'superior' : 'inferior', ratioA), { x: first.x, y: first.y }];
        }
        pts.push(railPoint(longA, ratioA));
        pts.push(railPoint(shortA, ratioB));
        pts.push(railPoint(longB, ratioC));
        if (shot.title.includes('4 bandas') || shot.title.includes('5 bandas')) pts.push(railPoint(shortB, 1 - ratioB * .72));
        if (shot.title.includes('5 bandas')) pts.push(railPoint(longA, 1 - ratioA * .55));
        pts.push({ x: second.x, y: second.y });
        return pts.map(p => ({ x: limitX(p.x), y: limitY(p.y) }));
      }


      function routeDistance(points, start = 0, end = points.length - 1) {
        let total = 0;
        for (let i = Math.max(0, start); i < Math.min(points.length - 1, end); i++) {
          total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
        }
        return total;
      }

      function routeRailInfo(points, start = 1, end = points.length - 1) {
        const visualRailTolerance = 76;
        const rails = [];
        for (let i = Math.max(1, start); i < Math.min(points.length - 1, end); i++) {
          const p = points[i];
          const distances = [
            ['izquierda', Math.abs(p.x - (LEFT + R))],
            ['derecha', Math.abs(p.x - (RIGHT - R))],
            ['superior', Math.abs(p.y - (TOP + R))],
            ['inferior', Math.abs(p.y - (BOTTOM - R))]
          ].sort((a, b) => a[1] - b[1]);
          const [name, dist] = distances[0];
          if (dist <= visualRailTolerance) rails.push({ index: i, name, x: p.x, y: p.y });
        }
        return rails;
      }

      function closestIndex(points, target, start = 0) {
        if (!target) return -1;
        let best = -1;
        let bestDist = Infinity;
        for (let i = Math.max(0, start); i < points.length; i++) {
          const d = Math.hypot(points[i].x - target.x, points[i].y - target.y);
          if (d < bestDist) { best = i; bestDist = d; }
        }
        return best;
      }

      function normalizePracticeRoute(shot) {
        const cue = shot.balls.find(b => b.id === 'cue');
        const first = shot.balls.find(b => b.id === shot.first);
        const second = shot.balls.find(b => b.id === shot.second);
        let points = Array.isArray(shot.guidePath) && shot.guidePath.length > 2
          ? shot.guidePath.map(p => ({ x: limitX(p.x), y: limitY(p.y) }))
          : autoGuidePathForShot(shot, Number(shot.code) - 1);
        if (!cue || !first || !second || !points.length) return points;
        points[0] = { x: cue.x, y: cue.y };

        let firstIndex = closestIndex(points, first, 1);
        if (firstIndex < 0 || Math.hypot(points[firstIndex].x - first.x, points[firstIndex].y - first.y) > 54) {
          points.splice(1, 0, { x: first.x, y: first.y });
          firstIndex = 1;
        } else {
          points[firstIndex] = { x: first.x, y: first.y };
        }

        let secondIndex = closestIndex(points, second, firstIndex + 1);
        if (secondIndex < 0 || Math.hypot(points[secondIndex].x - second.x, points[secondIndex].y - second.y) > 54) {
          points.push({ x: second.x, y: second.y });
        } else if (secondIndex !== points.length - 1) {
          // Para técnica de carambola, la segunda bola debe cerrar la ruta, no aparecer a mitad del recorrido.
          points.splice(secondIndex, 1);
          points.push({ x: second.x, y: second.y });
        } else {
          points[secondIndex] = { x: second.x, y: second.y };
        }

        const clean = [];
        for (const p of points) {
          const q = { x: limitX(p.x), y: limitY(p.y) };
          if (!clean.length || Math.hypot(clean[clean.length - 1].x - q.x, clean[clean.length - 1].y - q.y) > 5) clean.push(q);
        }
        return clean;
      }

      function routeShotAnalysis(shot) {
        const cue = shot.balls.find(b => b.id === 'cue');
        const first = shot.balls.find(b => b.id === shot.first);
        const second = shot.balls.find(b => b.id === shot.second);
        const points = normalizePracticeRoute(shot);
        if (!cue || !first || !second || points.length < 3) return null;
        const firstIndex = Math.max(1, closestIndex(points, first, 1));
        const next = points[Math.min(points.length - 1, firstIndex + 1)] || second;
        const incoming = { x: first.x - cue.x, y: first.y - cue.y };
        const outgoing = { x: next.x - first.x, y: next.y - first.y };
        const inLen = Math.hypot(incoming.x, incoming.y) || 1;
        const outLen = Math.hypot(outgoing.x, outgoing.y) || 1;
        const inUnit = { x: incoming.x / inLen, y: incoming.y / inLen };
        const outUnit = { x: outgoing.x / outLen, y: outgoing.y / outLen };
        const candidates = [
          { x: -outUnit.y, y: outUnit.x },
          { x: outUnit.y, y: -outUnit.x }
        ].map(n => ({ n, ghost: { x: first.x - n.x * R * 2.05, y: first.y - n.y * R * 2.05 } }));
        let best = candidates[0];
        let bestScore = Infinity;
        for (const c of candidates) {
          const gx = c.ghost.x - cue.x;
          const gy = c.ghost.y - cue.y;
          const gl = Math.hypot(gx, gy) || 1;
          const dot = Math.max(-1, Math.min(1, (gx / gl) * inUnit.x + (gy / gl) * inUnit.y));
          const score = Math.acos(dot);
          if (score < bestScore) { bestScore = score; best = c; }
        }
        const aimAt = { x: limitX(best.ghost.x), y: limitY(best.ghost.y), label: 'punto fantasma para golpear la receptora' };
        const aimVec = { x: aimAt.x - cue.x, y: aimAt.y - cue.y };
        const aimLen = Math.hypot(aimVec.x, aimVec.y) || 1;
        const aimUnit = { x: aimVec.x / aimLen, y: aimVec.y / aimLen };
        const dotAO = Math.max(-1, Math.min(1, aimUnit.x * outUnit.x + aimUnit.y * outUnit.y));
        const cutAngle = Math.acos(dotAO) * 180 / Math.PI;
        const turn = aimUnit.x * outUnit.y - aimUnit.y * outUnit.x;
        const absCut = Math.abs(cutAngle);
        let thickness = 'llena';
        if (absCut >= 78) thickness = 'muy fina';
        else if (absCut >= 58) thickness = 'fina';
        else if (absCut >= 38) thickness = 'media bola';
        else if (absCut >= 22) thickness = 'tres cuartos';
        const rails = routeRailInfo(points, firstIndex + 1, points.length - 1);
        const distance = routeDistance(points, firstIndex, points.length - 1);
        const railCount = Math.max(3, rails.length || 0);
        const power = Math.round(Math.max(46, Math.min(92, 42 + distance / 115 + railCount * 3 + Math.min(absCut, 85) * 0.06)));
        const sideSign = turn >= 0 ? -1 : 1;
        const sideMagnitude = Math.round(Math.max(24, Math.min(62, 28 + absCut * 0.38 + railCount * 2)));
        const verticalMagnitude = Math.round(Math.max(18, Math.min(44, 20 + distance / 180 + railCount * 2)));
        const effect = makeEffect(sideSign * sideMagnitude, -verticalMagnitude);
        return {
          points,
          aimAt,
          power,
          effect,
          hitProfile: {
            thickness,
            cutAngle: Math.round(absCut),
            side: sideSign < 0 ? 'izquierda' : 'derecha',
            railCount,
            firstRail: rails[0]?.name || 'sin banda detectada',
            routeDistance: Math.round(distance)
          }
        };
      }

      function applyShotLogicFromRoute(shot) {
        const a = routeShotAnalysis(shot);
        if (!a) return;
        shot.guidePath = a.points;
        shot.aimAt = a.aimAt;
        shot.power = a.power;
        shot.effect = a.effect;
        shot.hitProfile = a.hitProfile;
        const desc = `Golpe a la receptora: ${a.hitProfile.thickness} por la ${a.hitProfile.side}; primera banda: ${a.hitProfile.firstRail}; potencia corregida: ${a.power}%; ${spinText(a.effect.x, a.effect.y)}.`;
        shot.tip = shot.tip ? `${desc} ${shot.tip}` : desc;
      }

      function derivedContactViewFromRoute(shot) {
        if (!shot || !shot.first || shot.first === 'cue') return null;
        const profile = shot.hitProfile || {};
        const sideText = String(profile.side || '').toLowerCase();
        const sideSign = sideText.includes('izq') ? -1 : 1;
        const cut = Number(profile.cutAngle || 45);
        const gap = clamp(28 + cut * .18, 28, 54);
        const vertical = clamp((Number(shot.effect?.y || 0) / 100) * 18, -14, 14);
        return {
          target: shot.first,
          cueX: 75,
          cueY: 34,
          dx: sideSign * gap,
          dy: vertical,
          overlap: .88,
          note: `Vista derivada de la ruta sincronizada del video ${shot.code}: primera bola ${ballLabel(shot.first)} con golpe ${profile.thickness || 'según guía'} por la ${profile.side || 'línea indicada'}.`
        };
      }

      function deriveExactExecutionPower(shot) {
        const pts = Array.isArray(shot?.guidePath) ? shot.guidePath : [];
        if (pts.length < 2) return Math.max(shot?.power || 68, 68);
        let distance = 0;
        let rails = 0;
        for (let i = 1; i < pts.length; i++) {
          distance += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
          if (i > 0 && i < pts.length - 1 && isPracticeRailPoint(pts[i])) rails++;
        }
        const base = Number(shot?.power) || 68;
        // Calibración física: potencia suficiente para que la blanca complete
        // recorridos largos de 3+ bandas sin convertir todos los tiros en 100%.
        const estimated = 56 + distance / 105 + rails * 3.8;
        const extra = rails >= 5 ? 3 : rails >= 4 ? 1 : 0;
        return Math.max(base, Math.min(100, Math.round(estimated + extra)));
      }

      function recalibrateThreeCushionGuidePath(shot, index) {
        // Validación y recalibración jugada por jugada:
        // cada ruta debe iniciar en la blanca, tocar la primera bola, recorrer mínimo
        // 3 puntos de banda y cerrar en la segunda bola. Si la imagen/guía original
        // tiene menos de 3 bandas detectables, se reconstruye el tramo posterior al
        // primer contacto con una ruta consistente de tres bandas.
        const cue = shot?.balls?.find(b => b.id === 'cue');
        const first = shot?.balls?.find(b => b.id === shot.first);
        const second = shot?.balls?.find(b => b.id === shot.second);
        if (!cue || !first || !second) return;
        let points = normalizePracticeRoute(shot);
        if (!Array.isArray(points) || points.length < 3) points = autoGuidePathForShot(shot, index);
        const firstIndex = Math.max(1, closestIndex(points, first, 1));
        const secondIndex = Math.max(firstIndex + 1, closestIndex(points, second, firstIndex + 1));
        const rails = routeRailInfo(points, firstIndex + 1, secondIndex >= 0 ? secondIndex : points.length - 1);
        if (rails.length >= 3) {
          shot.guidePath = points;
          shot.validation = {
            checked: true,
            recalibrated: false,
            railsBeforeSecond: rails.length,
            message: 'Ruta validada con mínimo 3 bandas antes de la segunda bola.'
          };
          return;
        }

        const goLeft = first.x > second.x || (Number(shot.effect?.x) || 0) < 0;
        const goDown = first.y < second.y || (Number(shot.effect?.y) || 0) < 0;
        const longA = goDown ? 'inferior' : 'superior';
        const shortA = goLeft ? 'izquierda' : 'derecha';
        const longB = goDown ? 'superior' : 'inferior';
        const shortB = goLeft ? 'derecha' : 'izquierda';
        const n = Number(shot.code) || index + 1;
        const ratioA = ((n % 7) + 1) / 8;
        const ratioB = ((n % 5) + 2) / 7;
        const ratioC = ((n % 9) + 1) / 10;
        const ratioD = ((n % 6) + 1) / 7;
        const railCandidates = [
          railPoint(longA, ratioA),
          railPoint(shortA, ratioB),
          railPoint(longB, ratioC),
          railPoint(shortB, 1 - ratioD * .52)
        ];
        const uniqueRails = [];
        const used = new Set();
        for (const rp of railCandidates) {
          const name = routeRailInfo([{ x: cue.x, y: cue.y }, rp, { x: second.x, y: second.y }], 1, 1)[0]?.name || 'banda';
          const key = `${name}:${Math.round(rp.x / 8)}:${Math.round(rp.y / 8)}`;
          if (!used.has(key)) {
            used.add(key);
            uniqueRails.push(rp);
          }
          if (uniqueRails.length >= 3) break;
        }
        while (uniqueRails.length < 3) {
          const fallbackRails = ['inferior', 'izquierda', 'superior', 'derecha'];
          uniqueRails.push(railPoint(fallbackRails[(uniqueRails.length + n) % fallbackRails.length], .25 + uniqueRails.length * .22));
        }

        // Conserva cualquier tramo inicial útil antes de la primera bola; luego fuerza
        // 3 bandas claras y cierre en la segunda bola.
        const prefix = points.slice(0, Math.max(2, firstIndex + 1));
        prefix[0] = { x: cue.x, y: cue.y };
        prefix[prefix.length - 1] = { x: first.x, y: first.y };
        const rebuilt = [...prefix, ...uniqueRails.slice(0, 3), { x: second.x, y: second.y }]
          .map(p => ({ x: limitX(p.x), y: limitY(p.y) }));
        const cleaned = [];
        for (const pt of rebuilt) {
          if (!cleaned.length || Math.hypot(cleaned[cleaned.length - 1].x - pt.x, cleaned[cleaned.length - 1].y - pt.y) > 5) cleaned.push(pt);
        }
        let firstCleanIndex = Math.max(1, closestIndex(cleaned, first, 1));
        let cleanedRailCount = routeRailInfo(cleaned, firstCleanIndex + 1, cleaned.length - 1).length;
        let safety = 0;
        while (cleanedRailCount < 3 && safety < 6) {
          const fallbackRails = ['inferior', 'izquierda', 'superior', 'derecha'];
          const railName = fallbackRails[(safety + n + cleanedRailCount) % fallbackRails.length];
          const ratio = clamp(.18 + ((safety + cleanedRailCount) % 4) * .21, .12, .88);
          cleaned.splice(Math.max(firstCleanIndex + 1, cleaned.length - 1), 0, railPoint(railName, ratio));
          safety++;
          firstCleanIndex = Math.max(1, closestIndex(cleaned, first, 1));
          cleanedRailCount = routeRailInfo(cleaned, firstCleanIndex + 1, cleaned.length - 1).length;
        }
        shot.guidePath = cleaned;
        shot.validation = {
          checked: true,
          recalibrated: true,
          railsBeforeSecond: cleanedRailCount,
          message: 'Ruta recalibrada automáticamente para garantizar carambola de 3 bandas.'
        };
        shot.route = `${shot.route || 'ruta'} · recalibrada a 3 bandas verificadas`;
      }

      shots.forEach((shot, index) => {
        const videoImageEffect = shot && shot.effect ? { x: Number(shot.effect.x) || 0, y: Number(shot.effect.y) || 0 } : null;
        if (videoImageEffect) shot.videoImageEffect = videoImageEffect;
        if (!shot.guidePath || shot.guidePath.length < 2) shot.guidePath = autoGuidePathForShot(shot, index);
        recalibrateThreeCushionGuidePath(shot, index);
        applyShotLogicFromRoute(shot);
        recalibrateThreeCushionGuidePath(shot, index);
        const finalLogic = routeShotAnalysis(shot);
        if (finalLogic) {
          shot.aimAt = finalLogic.aimAt;
          shot.power = finalLogic.power;
          shot.effect = finalLogic.effect;
          shot.hitProfile = finalLogic.hitProfile;
        }
        const numericCode = Number(shot.code) || 0;
        if (numericCode >= 1 && numericCode <= 149) {
          shot.exactGuidePath = true;
          shot.strictGuide = true;
          shot.executionPower = deriveExactExecutionPower(shot);
          shot.lockSync = true;
          shot.imageGuideCalibrated = true;
          shot.physicsMode = 'guiada-calibrada';
          shot.tip = `${shot.tip} Validada y recalibrada: la guía maestra y Tirar reproducen la misma ruta cuando Imagen jugada está armada; al modificar el taco se activa física libre con reserva de potencia.`;
        }
        if (shot.videoImageEffect) {
          // La guía dinámica y la tacada real deben usar el efecto de la imagen/video original,
          // no el efecto derivado automáticamente por la ruta. Esto corrige el efecto invertido
          // que podía aparecer en algunas jugadas al recalcular la física.
          shot.effect = clampEffect(shot.videoImageEffect.x, shot.videoImageEffect.y);
        }
        if (!shot.referenceImages || !shot.referenceImages.length) shot.referenceImages = generatedReferenceImages(shot.code, shot);
        const cv = contactViews[shot.code];
        shot.contactView = cv || derivedContactViewFromRoute(shot);
      });

      return shots.slice(0, 149);
    }


    let balls = cloneBalls(defaultBalls);
    let score = 0;
    let attempts = 0;
    let guide = true;
    let currentMode = 'libre';
    let tableFullscreenMode = false;
    let tvRemoteMode = false;
    let aimLocked = false;
    let effectLocked = false;
    let powerLocked = false;
    let aimAngle = 0;
    let powerPct = 5;
    let effectX = 0;
    let effectY = 0;
    let deflectionGuideMode = null;
    let lastImageShotSetup = null;
    let selectionGuideNeedsPlayerAim = false;
    let lastGuideIlluminationKey = '';
    let caromIlluminationActive = false;
    let deflectionGuideAnimHandle = 0;
    let draggingCue = false;
    let draggingEffect = false;
    let placingMode = false;
    let practiceMode = false;
    let fineAlignMode = false;
    let practiceIndex = 0;
    const practiceSetupCache = new Map();
    let lazySetupTimer = 0;
    let lastPracticeFeedback = '';
    let lastShotSnapshot = null;
    let replayShotReady = false;
    let currentShotFrames = [];
    let lastShotFrames = [];
    let replayingMotion = false;
    let replayAnimationId = 0;
    let draggingPlaceBall = null;
    let viewerFocusBall = 'cue';
    let draggingViewerBall = null;
    let viewerZoom = 1;
    let viewerPreviewOn = true;
    let cuePointerStart = null;
    let cuePointerMaxMove = 0;
    let lastShootTap = 0;
    let lastShootTapPoint = null;
    let shotActive = false;
    let shotResolved = false;
    let path = [];
    let rafGuide = 0;
    let practiceVideoMotion = null;

    const shot = {
      cushions: 0,
      scoringCushions: null,
      caromLocked: false,
      hitTargets: new Set(),
      activeRails: new Set(),
      activePairs: new Set(),
      firstTarget: null,
      result: null,
      spin: { x: 0, y: 0 },
      demoMode: false,
      powerPct: 5,
      routeLength: 0,
      professionalPhysics: PROFESSIONAL_PHYSICS_VERSION,
      shotSource: 'libre',
      illuminated: false
    };

    let soundEnabled = true;
    let audioCtx = null;
    let soundUnlocked = false;
    let lastRailSound = 0;
    let lastBallSound = 0;

    function getAudioCtx() {
      if (!soundEnabled) return null;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      soundUnlocked = true;
      return audioCtx;
    }

    function playTone(freq = 440, duration = 0.08, gain = 0.08, type = 'sine', whenOffset = 0) {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const now = ctx.currentTime + whenOffset;
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), now + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    function playNoise(duration = 0.06, gain = 0.05, filterFreq = 1800) {
      const ctx = getAudioCtx();
      if (!ctx) return;
      const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const amp = ctx.createGain();
      filter.type = 'bandpass';
      filter.frequency.value = filterFreq;
      filter.Q.value = 4;
      amp.gain.value = gain;
      src.buffer = buffer;
      src.connect(filter);
      filter.connect(amp);
      amp.connect(ctx.destination);
      src.start();
    }

    function playSound(kind, intensity = 1) {
      if (!soundEnabled) return;
      const level = Math.max(0.15, Math.min(1, intensity));
      if (kind === 'shot') {
        playNoise(0.045, 0.035 + level * 0.055, 1100);
        playTone(95, 0.08, 0.035 + level * 0.035, 'triangle');
      } else if (kind === 'ball') {
        playTone(720 + level * 120, 0.045, 0.045 + level * 0.035, 'square');
        playTone(1120, 0.035, 0.018 + level * 0.02, 'sine', 0.012);
      } else if (kind === 'rail') {
        playNoise(0.055, 0.025 + level * 0.035, 650);
        playTone(210, 0.055, 0.025 + level * 0.025, 'triangle');
      } else if (kind === 'point') {
        playTone(523, 0.09, 0.055, 'sine');
        playTone(659, 0.09, 0.052, 'sine', 0.08);
        playTone(784, 0.14, 0.05, 'sine', 0.16);
      } else if (kind === 'fail') {
        playTone(220, 0.13, 0.045, 'sawtooth');
        playTone(165, 0.18, 0.038, 'sawtooth', 0.1);
      } else if (kind === 'ui') {
        playTone(420, 0.045, 0.035, 'sine');
      }
    }

    function unlockAudio() {
      if (!soundUnlocked) getAudioCtx();
    }

    function cloneBalls(data) { return data.map(b => ({ ...b })); }
    function ball(id) { return balls.find(b => b.id === id); }
    function allStopped() { return balls.every(b => Math.hypot(b.vx, b.vy) < STOP_SPEED * 2); }
    function toCssX(x) { return (x / DESIGN_W * 100) + '%'; }
    function toCssY(y) { return (y / DESIGN_H * 100) + '%'; }
    function powerValueForPct(pct = powerPct) {
      const p = clamp(Number(pct) || 1, 1, EXTENDED_MAX_POWER_PCT);
      const normalized = clamp(p / 100, 0.01, 1);
      const normalForce = MIN_POWER + (MAX_POWER - MIN_POWER) * Math.pow(normalized, 1.18);
      if (p <= NORMAL_MAX_POWER_PCT) return normalForce;
      const extra = Math.pow((p - NORMAL_MAX_POWER_PCT) / (EXTENDED_MAX_POWER_PCT - NORMAL_MAX_POWER_PCT), 0.82);
      return MAX_POWER + (MAX_LONG_POWER - MAX_POWER) * extra;
    }
    function powerValue() { return powerValueForPct(powerPct); }

    // Velocidad visual de la bola blanca en Técnica video.
    // Potencia = ritmo de ejecución, NO corte de recorrido.
    // Se baja la velocidad para que el movimiento sea entendible y estable.
    function practiceTravelSpeedForPower(power = powerPct) {
      const p = Math.max(1, Math.min(100, Number(power) || 1));
      const normalized = p / 100;
      // Recalibrada para que las jugadas guiadas no se frenen antes de cerrar:
      // movimiento natural, visible y con tiempo de ejecución razonable en móvil.
      return 1.95 + Math.pow(normalized, 0.82) * 5.35;
    }
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
    function stopAllBalls() { for (const b of balls) { b.vx = 0; b.vy = 0; } }
    function angleTo(from, to) { return Math.atan2(to.y - from.y, to.x - from.x); }
    function currentPracticeShot() { return practiceShots[practiceIndex] || practiceShots[0]; }
    function ballLabel(id) { return id === 'cue' ? 'blanca' : id === 'red' ? 'roja' : 'amarilla'; }

    function routePathLength(shotDef) {
      const pts = Array.isArray(shotDef?.guidePath) ? shotDef.guidePath : [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const d = Math.hypot((b?.x || 0) - (a?.x || 0), (b?.y || 0) - (a?.y || 0));
        if (Number.isFinite(d)) total += d;
      }
      return total;
    }

    function shotLengthProfile(shotDef = practiceMode ? currentPracticeShot() : null) {
      const length = routePathLength(shotDef);
      const text = `${shotDef?.route || ''} ${shotDef?.note || ''} ${shotDef?.tip || ''} ${shotDef?.focus || ''}`.toLowerCase();
      const textualLong = /recorrido largo|ruta larga|larga distancia|amplia|amplio|diagonal|cruce|vuelta|cinco|fuerza|despegada/.test(text);
      const isVeryLong = length >= VERY_LONG_ROUTE_THRESHOLD || /cinco|muy larga|recorrido amplio/.test(text);
      const isLong = isVeryLong || length >= LONG_ROUTE_THRESHOLD || textualLong;
      const suggested = isVeryLong
        ? 132 + Math.min(28, Math.max(0, (length - VERY_LONG_ROUTE_THRESHOLD) / 34))
        : isLong
          ? 108 + Math.min(32, Math.max(0, (length - LONG_ROUTE_THRESHOLD) / 42))
          : 0;
      return {
        length,
        isLong,
        isVeryLong,
        suggestedPower: isLong ? clamp(Math.round(suggested || 112), 105, EXTENDED_MAX_POWER_PCT) : 0,
        maxPower: isVeryLong ? EXTENDED_MAX_POWER_PCT : (isLong ? 145 : SHORT_MAX_POWER_PCT)
      };
    }

    function maxPowerPctForShot(shotDef = practiceMode ? currentPracticeShot() : null) {
      if (!practiceMode || !shotDef) return EXTENDED_MAX_POWER_PCT;
      return shotLengthProfile(shotDef).maxPower;
    }

    function adjustedLongShotPower(basePower, shotDef = practiceMode ? currentPracticeShot() : null) {
      const profile = shotLengthProfile(shotDef);
      const p = Math.round(Number(basePower) || powerPct || 55);
      if (!profile.isLong) return clamp(p, 1, maxPowerPctForShot(shotDef));
      return clamp(Math.max(p, profile.suggestedPower), 1, profile.maxPower);
    }

    function powerDisplayLabel(pct = powerPct) {
      const p = Math.round(Number(pct) || 0);
      return p > NORMAL_MAX_POWER_PCT ? `Tiro largo ${p}%` : `Potencia ${p}%`;
    }

    function longShotHint(shotDef = practiceMode ? currentPracticeShot() : null) {
      const profile = shotLengthProfile(shotDef);
      if (!profile.isLong) return '';
      const recorrido = Math.round(profile.length);
      if (powerPct < profile.suggestedPower) {
        return `<br><span class="route">Tiro largo:</span> esta jugada tiene recorrido aproximado <strong>${recorrido}</strong> y pide alrededor de <strong>${profile.suggestedPower}%</strong>. Hala más el taco para activar la reserva de potencia.`;
      }
      return `<br><span class="route">Tiro largo activo:</span> potencia extendida habilitada; la mesa conserva la misma física profesional de paño y banda.`;
    }

    function powerPctFromPullDistance(dist) {
      const minPull = isCoarse ? 42 : 36;
      const normalPull = isCoarse ? 250 : 220;
      const extendedPull = isCoarse ? 405 : 360;
      const maxPct = maxPowerPctForShot();
      if (dist <= minPull) return 5;
      if (dist <= normalPull || maxPct <= NORMAL_MAX_POWER_PCT) {
        return Math.round(clamp((dist - minPull) / (normalPull - minPull) * NORMAL_MAX_POWER_PCT, 5, Math.min(maxPct, NORMAL_MAX_POWER_PCT)));
      }
      const extra = clamp((dist - normalPull) / (extendedPull - normalPull), 0, 1);
      return Math.round(clamp(NORMAL_MAX_POWER_PCT + extra * (maxPct - NORMAL_MAX_POWER_PCT), 5, maxPct));
    }

    function railRestitutionForCurrentShot() { return RAIL_RESTITUTION; }
    function railTangentFrictionForCurrentShot() { return RAIL_TANGENT_FRICTION; }
    function spinThrowForCurrentShot() { return SPIN_THROW; }
    function frictionForCurrentShot() { return PROFESSIONAL_TABLE_FRICTION; }

    function longShotModeForCurrentSetup(vx = 0, vy = 0, shotDef = null) {
      const speedBasedLong = Math.hypot(vx || 0, vy || 0) > MAX_POWER * 1.02;
      const practiceLong = !!(practiceMode && (shotDef || currentPracticeShot()) && shotLengthProfile(shotDef || currentPracticeShot()).isLong);
      return powerPct > NORMAL_MAX_POWER_PCT || speedBasedLong || practiceLong;
    }

    function dynamicClothFrictionForBall(b, spin = null, base = PROFESSIONAL_TABLE_FRICTION) {
      const speed = Math.hypot(b?.vx || 0, b?.vy || 0);
      if (speed <= 0) return base;
      const slidingLoss = clamp(speed / 30, 0, 1) * 0.00062;
      const objectLoss = b?.id === 'cue' ? 0 : 0.00034;
      const spinHelp = b?.id === 'cue' ? clamp(spinMagnitude(spin) * 0.00018, 0, 0.00022) : 0;
      return clamp(base - slidingLoss - objectLoss + spinHelp, 0.9928, 0.99605);
    }

    function applyCueSwerveBySpin(b, spin, strength = CUE_SWERVE_STRENGTH) {
      if (!b || b.id !== 'cue' || !spin) return;
      const speed = Math.hypot(b.vx || 0, b.vy || 0);
      if (speed < 0.16) return;
      const side = clamp(spin.side ?? spin.rawX ?? spin.x ?? 0, -1, 1);
      const follow = clamp(spin.follow ?? 0, -1, 1);
      if (Math.abs(side) < 0.015) return;
      // Curva muy leve: suficiente para que el efecto sea visible, sin convertirlo en masse exagerado.
      const curve = side * strength * clamp(speed, 0, 24) * (0.62 + Math.abs(follow) * 0.16);
      const cos = Math.cos(curve);
      const sin = Math.sin(curve);
      const vx = b.vx;
      const vy = b.vy;
      b.vx = vx * cos - vy * sin;
      b.vy = vx * sin + vy * cos;
    }


    function makeShotSnapshot() {
      return {
        balls: cloneBalls(balls).map(b => ({ ...b, vx: 0, vy: 0 })),
        aimAngle,
        powerPct,
        effectX,
        effectY,
        practiceMode,
        practiceIndex
      };
    }

    function makeShotFrame() {
      return balls.map(b => ({ id: b.id, x: b.x, y: b.y }));
    }

    function captureShotFrame(force = false) {
      if (!shotActive && !force) return;
      if (!currentShotFrames) currentShotFrames = [];
      const frame = makeShotFrame();
      const last = currentShotFrames[currentShotFrames.length - 1];
      const moved = !last || frame.some(f => {
        const prev = last.find(p => p.id === f.id);
        return !prev || Math.hypot(f.x - prev.x, f.y - prev.y) > 2;
      });
      if (force || moved) currentShotFrames.push(frame);
      if (currentShotFrames.length > 900) currentShotFrames.shift();
    }

    function applyShotFrame(frame) {
      for (const f of frame) {
        const b = ball(f.id);
        if (!b) continue;
        b.x = f.x;
        b.y = f.y;
        b.vx = 0;
        b.vy = 0;
      }
      renderBalls();
    }

    function syncMotionReplayUI() {
      if (!motionReplayBtn) return;
      motionReplayBtn.disabled = shotActive || placingMode || replayingMotion || !allStopped() || !lastShotFrames.length;
      motionReplayBtn.textContent = replayingMotion ? 'Replay...' : 'Ver replay';
      syncTableActionUI();
      syncPracticeActionUI();
    }

    function clearMotionReplay() {
      currentShotFrames = [];
      lastShotFrames = [];
      if (replayAnimationId) cancelAnimationFrame(replayAnimationId);
      replayAnimationId = 0;
      replayingMotion = false;
      syncMotionReplayUI();
    }

    function playLastMotionReplay() {
      if (!lastShotFrames.length || shotActive || placingMode || replayingMotion || !allStopped()) return;
      const restoreSnapshot = makeShotSnapshot();
      const frames = lastShotFrames.map(frame => frame.map(f => ({ ...f })));
      let index = 0;
      let lastTime = 0;
      replayingMotion = true;
      draggingCue = false;
      draggingEffect = false;
      draggingPlaceBall = null;
      stopAllBalls();
      pathLine.setAttribute('points', '');
      aimPreview.setAttribute('points', '');
      aimPreview.setAttribute('opacity', '0');
      hideCueProjectionGuide();
      recommendationLine.setAttribute('points', '');
      recommendationLine.setAttribute('opacity', '0');
      recommendationEvents.innerHTML = '';
      clearPracticeMarkers();
      syncReplayUI();
      syncMotionReplayUI();
      setGuideText('<strong>Replay:</strong> observa nuevamente el recorrido del tiro anterior sin perder tu posición actual.');

      function endReplay() {
        if (replayAnimationId) cancelAnimationFrame(replayAnimationId);
        replayAnimationId = 0;
        balls = cloneBalls(restoreSnapshot.balls);
        aimAngle = restoreSnapshot.aimAngle;
        powerPct = restoreSnapshot.powerPct;
        effectX = restoreSnapshot.effectX;
        effectY = restoreSnapshot.effectY;
        practiceMode = restoreSnapshot.practiceMode;
        practiceIndex = restoreSnapshot.practiceIndex;
        replayingMotion = false;
        syncPracticeUI();
        resetShotState();
        renderPracticeMarkers();
        renderBalls();
        updateHUD();
        updateFloatingControls();
        syncReplayUI();
        syncMotionReplayUI();
        updateGuidesSoon();
        setGuideText('<strong>Replay terminado:</strong> puedes repetir el tiro, corregirlo o lanzar uno nuevo.');
      }

      function stepReplay(time) {
        if (!replayingMotion) return;
        if (!lastTime || time - lastTime >= 16) {
          applyShotFrame(frames[index]);
          index++;
          lastTime = time;
        }
        if (index < frames.length) {
          replayAnimationId = requestAnimationFrame(stepReplay);
        } else {
          endReplay();
        }
      }

      playSound('ui', .45);
      replayAnimationId = requestAnimationFrame(stepReplay);
    }

    function syncReplayUI() {
      if (!replayBtn) return;
      replayBtn.disabled = shotActive || placingMode || replayingMotion || !allStopped() || !replayShotReady || !lastShotSnapshot;
      replayBtn.textContent = replayShotReady ? 'Repetir tiro' : 'Repetir tiro';
      syncMotionReplayUI();
      syncTableActionUI();
    }

    function setReplayReady(ready) {
      replayShotReady = !!ready && !!lastShotSnapshot;
      syncReplayUI();
    }

    function clearReplayShot() {
      lastShotSnapshot = null;
      replayShotReady = false;
      clearMotionReplay();
      syncReplayUI();
    }

    function restoreLastShot() {
      if (!lastShotSnapshot || shotActive || placingMode || !allStopped()) return;
      const snap = lastShotSnapshot;
      balls = cloneBalls(snap.balls);
      aimAngle = snap.aimAngle;
      powerPct = snap.powerPct;
      effectX = snap.effectX;
      effectY = snap.effectY;
      practiceMode = snap.practiceMode;
      practiceIndex = snap.practiceIndex;
      lastPracticeFeedback = '';
      syncPracticeUI();
      setReplayReady(false);
      resetShotState();
      renderPracticeMarkers();
      updateFloatingControls();
      setGuideText('<strong>Repetir tiro:</strong> las bolas volvieron exactamente al punto anterior. Ajusta taco, efecto o potencia y vuelve a tirar.');
      playSound('ui', .5);
    }

    function currentPracticeReferenceImages() {
      const s = currentPracticeShot();
      const refs = (s && s.referenceImages) ? s.referenceImages : [];
      return refs
        .filter(ref => ref && !String(ref.src || '').toLowerCase().includes('overlay'))
        .slice(0, 2);
    }

    function renderPracticeReferenceImages() {
      if (!practiceImagesGrid) return;
      const refs = currentPracticeReferenceImages();
      const s = currentPracticeShot();
      const meta = practiceVideoMeta(s);
      const timestamp = meta && (meta.posicion || meta.recorrido);
      practiceImagesGrid.innerHTML = '';
      if (practiceImagesTitle) practiceImagesTitle.textContent = s ? `Imágenes de referencia · Jugada ${s.code}` : 'Imágenes de referencia de la jugada';
      if (!refs.length) {
        practiceImagesGrid.innerHTML = '<div class="image-item"><h3>Sin imágenes de referencia</h3></div>';
        if (practiceImagesNote) practiceImagesNote.textContent = '';
        return;
      }
      refs.forEach((ref, index) => {
        const card = document.createElement('div');
        card.className = 'image-item';
        card.innerHTML = `<h3>${ref.title || ('Imagen ' + (index + 1))}</h3><img src="${ref.src}" alt="${ref.title || 'Imagen de referencia de la jugada'}" loading="lazy" decoding="async">`;
        practiceImagesGrid.appendChild(card);
      });
      if (practiceImagesNote) practiceImagesNote.textContent = '';
    }
    const VIDEO_TECHNICAL_OBSERVATIONS = [
      {
            "module": 1,
            "moduleTitle": "Fundamentos de Salida y Control de \"Tas-Tas\"",
            "range": [
                  1,
                  4
            ],
            "time": "00:00:33 – 00:01:39",
            "title": "Carambola de Salida Estándar (Reacomodo)",
            "text": "Configuración del tiro inicial de un encuentro de 3 bandas. Explicación paso a paso de cómo impactar a 3/4 de bola con un efecto sólido cerca del centro de la bola atacadora, logrando que la bola recibidora viaje a la parte alta de la mesa y quede en una posición óptima de juego."
      },
      {
            "module": 1,
            "moduleTitle": "Fundamentos de Salida y Control de \"Tas-Tas\"",
            "range": [
                  5,
                  8
            ],
            "time": "00:01:40 – 00:02:37",
            "title": "Soporte a Tres Bandas (Riesgo de Choque)",
            "text": "El jugador utiliza la bola recibidora como soporte geométrico buscando una trayectoria de tres bandas. Se ilustra con diagramas el \"tas-tas\" (choque) y cómo la velocidad influye en el cruce de trayectorias."
      },
      {
            "module": 1,
            "moduleTitle": "Fundamentos de Salida y Control de \"Tas-Tas\"",
            "range": [
                  9,
                  12
            ],
            "time": "00:02:38 – 00:03:37",
            "title": "Reposicionamiento Fino",
            "text": "La bola roja se encuentra en la parte inferior. La solución técnica es pegarle sumamente fino a la recibidora, proyectándola a la banda larga opuesta para abrir el ángulo a 2 o 3 bandas."
      },
      {
            "module": 1,
            "moduleTitle": "Fundamentos de Salida y Control de \"Tas-Tas\"",
            "range": [
                  13,
                  16
            ],
            "time": "00:03:38 – 00:04:41",
            "title": "Trayectoria Cruzada de Precisión",
            "text": "La bola atacadora y la recibidora están casi juntas. Se requiere un golpe milimétrico ya que la blanca cruzará dos veces la línea de la recibidora, aumentando exponencialmente el riesgo de choque."
      },
      {
            "module": 2,
            "moduleTitle": "Efectos de Recorte y Reflexión Natural",
            "range": [
                  17,
                  20
            ],
            "time": "00:04:42 – 00:05:36",
            "title": "Efecto de Recorte",
            "text": "Con un eje desfavorable entre blanca y roja, el jugador realiza una tacada con efecto de recorte sobre la banda larga, permitiendo ajustar la trayectoria justo cuando la bola toca y sale de la banda corta."
      },
      {
            "module": 2,
            "moduleTitle": "Efectos de Recorte y Reflexión Natural",
            "range": [
                  21,
                  24
            ],
            "time": "00:05:37 – 00:06:36",
            "title": "Ángulo Clásico Abierto",
            "text": "Desplazamiento orientado hacia la banda larga con un ángulo muy cómodo. Se golpea al lado derecho, arriba del centro y con poco efecto para controlar la fuerza exacta del reacomodo."
      },
      {
            "module": 2,
            "moduleTitle": "Efectos de Recorte y Reflexión Natural",
            "range": [
                  25,
                  28
            ],
            "time": "00:06:37 – 00:07:42",
            "title": "Ángulo Modificado en Esquina",
            "text": "Como la tercera bola está pegada a la banda corta, la última banda debe jugarse hacia la banda larga. Se taca por el centro con el máximo de efecto natural."
      },
      {
            "module": 2,
            "moduleTitle": "Efectos de Recorte y Reflexión Natural",
            "range": [
                  29,
                  32
            ],
            "time": "00:07:43 – 00:08:40",
            "title": "Trayectoria Cerrada con Efecto Bajo",
            "text": "El desplazamiento crea un ángulo extremadamente cerrado. El jugador compensa aplicando mucho efecto bajo con un golpe rápido y seco."
      },
      {
            "module": 3,
            "moduleTitle": "El Sistema de Cinco Bandas y Soporte",
            "range": [
                  33,
                  36
            ],
            "time": "00:08:41 – 00:09:36",
            "title": "Impacto Directo a Banda Corta",
            "text": "Variación donde la blanca viaja directo a la banda corta después del contacto, usando un cuarto o medio cuarto de bola con el máximo efecto central."
      },
      {
            "module": 3,
            "moduleTitle": "El Sistema de Cinco Bandas y Soporte",
            "range": [
                  37,
                  40
            ],
            "time": "00:09:37 – 00:10:57",
            "title": "Soporte en Eje Perpendicular",
            "text": "La bola atacadora está casi perpendicular a la banda larga. Se toma media bola proyectándola hacia la esquina para ganar una zona de contacto ideal al llegar a la amarilla."
      },
      {
            "module": 3,
            "moduleTitle": "El Sistema de Cinco Bandas y Soporte",
            "range": [
                  41,
                  44
            ],
            "time": "00:10:58 – 00:12:10",
            "title": "Llegada de Zona Amplia",
            "text": "Demostración táctica de por qué no es necesario golpear fuerte. El efecto natural dirige la blanca hacia la banda larga maximizando la probabilidad de carambola."
      },
      {
            "module": 3,
            "moduleTitle": "El Sistema de Cinco Bandas y Soporte",
            "range": [
                  45,
                  48
            ],
            "time": "00:12:11 – 00:12:56",
            "title": "Reflexión Natural Alta",
            "text": "Golpe alto para mantener la inercia natural. El objetivo es reposicionar la bola en la esquina opuesta cuidando de no quedar demasiado cerca de la tercera bola."
      },
      {
            "module": 3,
            "moduleTitle": "El Sistema de Cinco Bandas y Soporte",
            "range": [
                  49,
                  52
            ],
            "time": "00:12:57 – 00:13:49",
            "title": "Compensación con Efecto Inferior Lateral",
            "text": "Al no ser un eje perpendicular, la física natural no aplica. Se compensa tacando abajo y añadiendo efecto lateral a favor de la rotación."
      },
      {
            "module": 4,
            "moduleTitle": "El Efecto Penetrado y Efecto Sostenido",
            "range": [
                  53,
                  56
            ],
            "time": "00:13:50 – 00:14:46",
            "title": "Fuerza Moderada de Reacomodo",
            "text": "Trayectoria perfecta donde se ataca alto y sin tomar la bola de forma fina, logrando que la recibidora descanse en la zona favorable de la mesa."
      },
      {
            "module": 4,
            "moduleTitle": "El Efecto Penetrado y Efecto Sostenido",
            "range": [
                  57,
                  60
            ],
            "time": "00:14:47 – 00:15:36",
            "title": "Variación de Dos Diamantes",
            "text": "El efecto lateral izquierdo modifica la llegada exactamente en una distancia equivalente a dos diamantes en la banda corta."
      },
      {
            "module": 4,
            "moduleTitle": "El Efecto Penetrado y Efecto Sostenido",
            "range": [
                  61,
                  64
            ],
            "time": "00:15:37 – 00:16:24",
            "title": "Posición Esquinera Opuesta",
            "text": "Golpeando menos de media bola con fuerza medida para preparar la siguiente carambola agrupando las bolas en el rincón."
      },
      {
            "module": 4,
            "moduleTitle": "El Efecto Penetrado y Efecto Sostenido",
            "range": [
                  65,
                  68
            ],
            "time": "00:16:25 – 00:17:13",
            "title": "Tiro de Fuerza Despegada",
            "text": "Aplicación de fuerza alta para evitar que la bola blanca quede \"congelada\" o pegada a la amarilla al hacer el contacto final."
      },
      {
            "module": 4,
            "moduleTitle": "El Efecto Penetrado y Efecto Sostenido",
            "range": [
                  69,
                  72
            ],
            "time": "00:17:14 – 00:18:01",
            "title": "Control Bajo con Bola Pegada a Banda",
            "text": "La recibidora está empotrada contra la banda larga. Se taca abajo para alargar la trayectoria hasta la banda corta antes de cerrar el punto."
      },
      {
            "module": 4,
            "moduleTitle": "El Efecto Penetrado y Efecto Sostenido",
            "range": [
                  73,
                  76
            ],
            "time": "00:18:02 – 00:18:50",
            "title": "Llegada Central con Máximo Efecto Rápido",
            "text": "El objetivo de llegada está en el centro de la banda corta; requiere un golpe bajo el centro con un movimiento veloz del brazo."
      },
      {
            "module": 5,
            "moduleTitle": "Variaciones Avanzadas a Cinco Bandas y Curvas",
            "range": [
                  77,
                  80
            ],
            "time": "00:18:51 – 00:19:46",
            "title": "Curva con Tacado Alto",
            "text": "Cuando la posición no permite tacar abajo, se golpea arriba del centro con alta velocidad para obligar a la bola blanca a curvarse tras rebotar en la primera banda."
      },
      {
            "module": 5,
            "moduleTitle": "Variaciones Avanzadas a Cinco Bandas y Curvas",
            "range": [
                  81,
                  84
            ],
            "time": "00:19:47 – 00:20:52",
            "title": "Recorrido Sencillo a Cinco Bandas",
            "text": "Golpeando a 3/4 de bola arriba del centro, la blanca recorre la mesa con facilidad tocando 5 bandas hasta llegar a la esquina."
      },
      {
            "module": 5,
            "moduleTitle": "Variaciones Avanzadas a Cinco Bandas y Curvas",
            "range": [
                  85,
                  88
            ],
            "time": "00:20:53 – 00:21:50",
            "title": "Ataque al Centro a Banda Corta",
            "text": "Variación donde el ángulo no permite jugar por la banda larga; se redirige el tiro al centro de la bola atacando la banda corta directamente."
      },
      {
            "module": 5,
            "moduleTitle": "Variaciones Avanzadas a Cinco Bandas y Curvas",
            "range": [
                  89,
                  92
            ],
            "time": "00:21:51 – 00:22:45",
            "title": "Soporte a Cinco Bandas Extendido",
            "text": "En lugar de arriesgar un tiro fino a tres bandas, se usa la amarilla como soporte completo para dar cinco bandas con fuerza controlada."
      },
      {
            "module": 5,
            "moduleTitle": "Variaciones Avanzadas a Cinco Bandas y Curvas",
            "range": [
                  93,
                  96
            ],
            "time": "00:22:46 – 00:23:41",
            "title": "Trayectoria Larga Fácil",
            "text": "Demostración de que la línea corta no siempre es la mejor opción. Tomando media bola con el máximo efecto, las cinco bandas se vuelven más nobles."
      },
      {
            "module": 5,
            "moduleTitle": "Variaciones Avanzadas a Cinco Bandas y Curvas",
            "range": [
                  97,
                  100
            ],
            "time": "00:23:42 – 00:24:35",
            "title": "Tiro Grueso Natural",
            "text": "Se muestra cómo impactar la bola de forma gruesa (en vez de fina) genera la trayectoria a cinco bandas de manera orgánica y abre la posición."
      },
      {
            "module": 5,
            "moduleTitle": "Variaciones Avanzadas a Cinco Bandas y Curvas",
            "range": [
                  101,
                  104
            ],
            "time": "00:24:36 – 00:25:35",
            "title": "Tiro de Transformación",
            "text": "Con alto riesgo de choque, se taca grueso por arriba manteniendo la culata del taco levantada para crear una pequeña parábola de incidencia positiva."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  105,
                  108
            ],
            "time": "00:25:36 – 00:26:37",
            "title": "Efecto Invertido en Banda Larga",
            "text": "Al no haber tiros directos, se ataca la banda larga con efecto contrario, lo que genera un efecto natural automático al golpear la banda opuesta."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  109,
                  112
            ],
            "time": "00:26:38 – 00:27:30",
            "title": "Tiro Fino Antichoque",
            "text": "Evita el choque inicial entre roja y amarilla, pero el video ilustra el peligro de un choque final al terminar el recorrido de las cinco bandas."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  113,
                  116
            ],
            "time": "00:27:31 – 00:28:30",
            "title": "Reacomodo Prolongado",
            "text": "Movimiento rápido y relajado para aplicar el giro correcto a la bola buscando acomodar la roja a dos bandas."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  117,
                  120
            ],
            "time": "00:28:31 – 00:29:26",
            "title": "Riesgo de Arrastre o Tacado Grueso",
            "text": "Ejercicios que muestran visualmente el error de tomar la bola demasiado gruesa y cómo esto provoca un choque inevitable."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  121,
                  124
            ],
            "time": "00:29:27 – 00:30:25",
            "title": "Ajuste Posterior a Banda Corta",
            "text": "Aplicación de un poco de efecto contrario para corregir el ángulo de la blanca tras salir despedida de la banda corta."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  125,
                  128
            ],
            "time": "00:30:26 – 00:31:43",
            "title": "Dilema Tres vs. Cinco Bandas",
            "text": "Análisis técnico comparativo. El video demuestra que forzar las cinco bandas suele acabar en choque, haciendo de las tres bandas la opción matemáticamente correcta."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  129,
                  132
            ],
            "time": "00:31:44 – 00:32:44",
            "title": "Eficiencia del Tiro Fino",
            "text": "Ejecución pulida donde rozar la bola fina evita que la blanca choque con la amarilla en el sector inferior."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  133,
                  136
            ],
            "time": "00:32:45 – 00:33:43",
            "title": "Soporte Grueso Antichoque",
            "text": "Enfoque opuesto al anterior; se toma una porción gruesa de la bola para desplazar el obstáculo antes de que la blanca regrese por esa zona."
      },
      {
            "module": 6,
            "moduleTitle": "Tiros Invertidos, Ramers y Sistema de Diamantes",
            "range": [
                  137,
                  140
            ],
            "time": "00:33:44 – 00:34:59",
            "title": "El Tiro Penetrado en Acción",
            "text": "Muestra los fallos con taco alto y cómo el efecto penetrado corrige la trayectoria haciéndola predecible a cuatro bandas."
      },
      {
            "module": 7,
            "moduleTitle": "El Sistema Teórico y Cierre Artístico",
            "range": [
                  141,
                  144
            ],
            "time": "01:28:43 – 01:33:11",
            "title": "El Sistema Matemático de Diamantes (Banda Previa)",
            "text": "Explicación gráfica de la fórmula en la pizarra y en la mesa: Ataque = Salida - Llegada. Se ejecutan consecutivamente los diagramas matemáticos variando las llegadas en los diamantes 20, 30 y 50 partiendo desde la base fija de 50."
      },
      {
            "module": 7,
            "moduleTitle": "El Sistema Teórico y Cierre Artístico",
            "range": [
                  145,
                  147
            ],
            "time": "01:33:12 – 02:02:26",
            "title": "Tiros de Pasón y Acordeón",
            "text": "Demostraciones de alta velocidad donde la blanca viaja entre bandas largas consecutivas (Pasón) o realiza el recorrido perimetral completo cerrando los ángulos por la fricción y la fuerza (Acordeón)."
      },
      {
            "module": 7,
            "moduleTitle": "El Sistema Teórico y Cierre Artístico",
            "range": [
                  148,
                  149
            ],
            "time": "02:02:27 – 02:03:20",
            "title": "El Tiro Coleman",
            "text": "Cierre del bloque original. Una jugada clásica de exhibición o billar artístico donde el jugador calcula una banda previa compleja esquivando la bola roja con precisión quirúrgica."
      }
];


    function technicalObservationForShot(shot) {
      const n = parseInt(String(shot?.code || ''), 10);
      if (!Number.isFinite(n)) return null;
      return VIDEO_TECHNICAL_OBSERVATIONS.find(item => n >= item.range[0] && n <= item.range[1]) || null;
    }

    function technicalPracticeTitle(shot) {
      const code = String(shot?.code || '').padStart(3, '0');
      const obs = technicalObservationForShot(shot);
      return obs ? `Jugada ${code}: ${obs.title}` : `Jugada ${code}: ${shot?.title || 'Carambola de práctica'}`;
    }

    function applyTechnicalTitlesToPracticeShots() {
      if (!Array.isArray(practiceShots)) return;
      practiceShots.forEach((shot) => {
        const obs = technicalObservationForShot(shot);
        if (!obs) return;
        if (!shot.originalVideoTitle) shot.originalVideoTitle = shot.title;
        shot.title = technicalPracticeTitle(shot);
        shot.family = `Módulo ${obs.module}: ${obs.moduleTitle}`;
        shot.technicalModule = obs.module;
        shot.technicalModuleTitle = obs.moduleTitle;
        shot.technicalCaromName = obs.title;
        shot.technicalDescription = obs.text;
        shot.technicalVideoTime = obs.time;
      });
    }

    // Nombres originales restaurados: se conserva la información técnica solo dentro del modal de video.
    // applyTechnicalTitlesToPracticeShots();

    function renderVideoObservation(shot) {
      if (!videoObservation) return;
      const s = shot || videoSeekShot();
      const obs = technicalObservationForShot(s);
      if (!s || !obs) {
        videoObservation.innerHTML = '';
        videoObservation.hidden = true;
        return;
      }
      videoObservation.hidden = false;
      const shotCode = String(s.code || '').padStart(3, '0');
      const moduleTitle = `MÓDULO ${obs.module}: ${obs.moduleTitle}`;
      const shotTitle = `Jugada ${shotCode}: ${obs.title}`;
      videoObservation.innerHTML = `
        <h3>${moduleTitle}</h3>
        <h4>${shotTitle}</h4>
        <p class="shot-description"><strong>Descripción:</strong> ${obs.text}</p>`;
    }

    function renderVideoModalImages(force = false) {
      if (!videoImagesGrid) return;
      const refs = currentPracticeReferenceImages();
      const s = videoSeekShot();
      const code = s ? String(s.code || '').padStart(3, '0') : '';
      const renderKey = `${code}:${refs.map(r => r.src).join('|')}`;
      if (!force && videoImagesGrid.dataset.renderKey === renderKey) {
        renderVideoObservation(s);
        if (videoImagesTitle) videoImagesTitle.textContent = s ? `Imágenes guía · Jugada ${code}` : 'Imágenes guía';
        return;
      }
      videoImagesGrid.dataset.renderKey = renderKey;
      videoImagesGrid.innerHTML = '';
      if (videoImagesTitle) videoImagesTitle.textContent = s ? `Imágenes guía · Jugada ${code}` : 'Imágenes guía';
      renderVideoObservation(s);
      if (!refs.length) {
        videoImagesGrid.innerHTML = '<div class="video-image-item"><h4>Sin imágenes</h4></div>';
        if (videoImagesNote) videoImagesNote.textContent = '';
        return;
      }
      const fragment = document.createDocumentFragment();
      refs.forEach((ref, index) => {
        const card = document.createElement('div');
        card.className = 'video-image-item';
        const title = document.createElement('h4');
        title.textContent = ref.title || `Imagen ${index + 1}`;
        const img = document.createElement('img');
        img.src = ref.src;
        img.alt = ref.title || 'Imagen de referencia de la jugada';
        img.loading = 'eager';
        img.decoding = 'async';
        img.fetchPriority = 'high';
        card.appendChild(title);
        card.appendChild(img);
        fragment.appendChild(card);
      });
      videoImagesGrid.appendChild(fragment);
      if (videoImagesNote) videoImagesNote.textContent = '';
    }

    function openPracticeImagesModal() {
      const s = ensureSelectedPracticeShotForVideo();
      const refs = currentPracticeReferenceImages();
      if (!refs.length) return;
      openVideoModal();
    }

    function closePracticeImagesModal() {
      practiceImagesModal.classList.remove('open');
      practiceImagesModal.setAttribute('aria-hidden', 'true');
    }

    function syncPracticeImagesUI() {
      if (!practiceImagesBtn) return;
      practiceImagesBtn.disabled = !currentPracticeReferenceImages().length;
    }


    function preloadPracticeImagesAround(index = practiceIndex) {
      if (typeof Image === 'undefined') return;
      const preload = () => {
        [-1, 0, 1].forEach(delta => {
          const shot = practiceShots[(index + delta + practiceShots.length) % practiceShots.length];
          const refs = shot?.referenceImages || [];
          refs.forEach(ref => {
            if (!ref?.src) return;
            const img = new Image();
            img.decoding = 'async';
            img.src = ref.src;
          });
        });
      };
      if (typeof requestIdleCallback === 'function') requestIdleCallback(preload, { timeout: 700 });
      else setTimeout(preload, 80);
    }

    function normalizedAngleDeg(rad = aimAngle) {
      let deg = rad * 180 / Math.PI;
      while (deg < 0) deg += 360;
      while (deg >= 360) deg -= 360;
      return deg;
    }

    function updateAlignReadout() {
      if (!alignReadout) return;
      if (!practiceMode) {
        alignReadout.innerHTML = 'Selecciona una jugada y usa <span class="gold">Efecto</span> o ajusta taco/potencia hasta que la guía predictiva ilumine la ruta.';
        return;
      }
      const s = currentPracticeShot();
      const cue = ball('cue');
      const target = s && s.aimAt ? s.aimAt : null;
      const aimDist = cue && target ? Math.hypot(target.x - cue.x, target.y - cue.y).toFixed(0) : '—';
      alignReadout.innerHTML = `<span class="gold">Jugada ${s.code}</span> · ángulo ${normalizedAngleDeg().toFixed(1)}° · distancia a mira ${aimDist} · fuerza ${powerDisplayLabel(powerPct)} · efecto X ${Math.round(effectX)}, Y ${Math.round(effectY)}.`;
    }

    function syncEasyAlignUI() {
      if (easyAlignBtn) {
        easyAlignBtn.disabled = shotActive || replayingMotion || placingMode || !allStopped();
        easyAlignBtn.textContent = fineAlignMode ? 'Asistencia ON' : 'Asistencia OFF';
        easyAlignBtn.classList.toggle('practice-on', fineAlignMode);
      }
      if (alignPanel) alignPanel.classList.remove('open');
      updateAlignReadout();
    }

    function pointToGuideDistance(point, guide) {
      if (!point || !Array.isArray(guide) || guide.length < 2) return 999;
      let best = Infinity;
      for (let i = 1; i < guide.length; i++) {
        const a = guide[i - 1];
        const b = guide[i];
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const len2 = abx * abx + aby * aby || 1;
        const t = clamp(((point.x - a.x) * abx + (point.y - a.y) * aby) / len2, 0, 1);
        const px = a.x + abx * t;
        const py = a.y + aby * t;
        best = Math.min(best, Math.hypot(point.x - px, point.y - py));
      }
      return best;
    }

    function guideSimilarityScore(sim, s) {
      const guidePath = Array.isArray(s?.guidePath) ? s.guidePath : [];
      const simPoints = Array.isArray(sim?.points) ? sim.points : [];
      if (guidePath.length < 3 || simPoints.length < 4) return 0;
      const step = Math.max(1, Math.floor(simPoints.length / 28));
      let penalty = 0;
      let samples = 0;
      for (let i = 0; i < simPoints.length; i += step) {
        penalty += Math.min(170, pointToGuideDistance(simPoints[i], guidePath));
        samples++;
      }
      const avg = samples ? penalty / samples : 170;
      const endTarget = guidePath[guidePath.length - 1];
      const finalPoint = simPoints[simPoints.length - 1];
      const endDistance = finalPoint ? Math.min(220, Math.hypot(finalPoint.x - endTarget.x, finalPoint.y - endTarget.y)) : 220;
      return Math.max(0, 1850 - avg * 12 - endDistance * 2.5);
    }

    function scorePracticeSetup(sim, s) {
      const targetEvents = sim.events.filter(ev => ev.type === 'target');
      const first = targetEvents[0];
      const second = targetEvents[1];
      let score = 0;
      if (first && first.id === s.first) score += 700;
      else if (first) score -= 350;
      if (second && second.id === s.second) score += 1100;
      else if (second) score -= 450;
      if (second && second.cushions >= 3) score += 6000 + Math.min(second.cushions, 6) * 70;
      else if (second) score -= (3 - second.cushions) * 450;
      score += Math.min(sim.cushions, 6) * 60;
      if (sim.firstTarget && !sim.secondTarget) score += Math.min(sim.cushions, 4) * 90;
      // La guía dinámica ahora también se compara contra la ruta marcada en las imágenes.
      // Esto ayuda a que el taco, potencia y efecto iniciales se parezcan más al video,
      // no solo a que haya carambola por cualquier camino.
      score += guideSimilarityScore(sim, s);
      return score;
    }

    function findPracticePhysicsSetup(s) {
      const cue = ball('cue');
      if (!s || !cue || !s.aimAt) return null;
      const cacheKey = `${s.code}:${Math.round(cue.x)},${Math.round(cue.y)}:${Math.round(s.aimAt.x)},${Math.round(s.aimAt.y)}`;
      if (practiceSetupCache.has(cacheKey)) {
        const cached = practiceSetupCache.get(cacheKey);
        return {
          score: cached.score,
          angle: cached.angle,
          power: cached.power,
          effect: { ...cached.effect },
          sim: cached.sim || null,
          cached: true
        };
      }

      const baseAngle = angleTo(cue, s.aimAt);
      const baseX = s.effect?.x ?? effectX;
      const baseY = s.effect?.y ?? effectY;
      const maxPracticePower = maxPowerPctForShot(s);
      const referencePower = clamp(Math.round(s.executionPower ?? s.power ?? powerPct), 24, maxPracticePower);

      // Búsqueda optimizada: antes se probaban demasiadas combinaciones en cada selección,
      // haciendo lento el cambio de jugadas y la apertura del modal. Ahora se usa una malla
      // corta y se cachea el resultado por jugada para mantener la respuesta inmediata.
      const rawEffects = [
        [baseX, baseY],
        [baseX + 10, baseY], [baseX - 10, baseY],
        [baseX, baseY - 10], [baseX, baseY + 10],
        [baseX + 14, baseY - 10], [baseX - 14, baseY - 10],
        [baseX + 14, baseY + 10], [baseX - 14, baseY + 10]
      ];
      const effectSeen = new Set();
      const effectOptions = [];
      for (const [x, y] of rawEffects) {
        const eff = clampEffect(x, y);
        const key = `${eff.x},${eff.y}`;
        if (effectSeen.has(key)) continue;
        effectSeen.add(key);
        effectOptions.push(eff);
      }

      const profileForPowerSearch = shotLengthProfile(s);
      const powerOptions = Array.from(new Set([
        referencePower - 10,
        referencePower - 5,
        referencePower,
        referencePower + 8,
        referencePower + 16,
        profileForPowerSearch.isLong ? profileForPowerSearch.suggestedPower : referencePower + 12,
        profileForPowerSearch.isVeryLong ? maxPracticePower : profileForPowerSearch.suggestedPower
      ].map(p => clamp(Math.round(p), 24, maxPracticePower)))).sort((a, b) => a - b);

      let best = null;
      const tryCandidate = (angle, power, eff) => {
        const speed = powerValueForPct(power);
        const sim = simulateShot(Math.cos(angle) * speed, Math.sin(angle) * speed, { x: eff.x / 100, y: eff.y / 100 }, 560);
        const score = scorePracticeSetup(sim, s);
        if (!best || score > best.score) best = { score, angle, power, effect: eff, sim };
      };

      for (let offset = -22; offset <= 22; offset += 5.5) {
        const angle = baseAngle + offset * Math.PI / 180;
        for (const power of powerOptions) {
          for (const eff of effectOptions) tryCandidate(angle, power, eff);
        }
      }

      if (best) {
        practiceSetupCache.set(cacheKey, {
          score: best.score,
          angle: best.angle,
          power: best.power,
          effect: { ...best.effect }
        });
        if (practiceSetupCache.size > 180) {
          const firstKey = practiceSetupCache.keys().next().value;
          practiceSetupCache.delete(firstKey);
        }
      }
      return best;
    }

    function scheduleLazyPracticeOptimization(s) {
      if (!s || typeof window === 'undefined') return;
      if (lazySetupTimer) {
        if (typeof cancelIdleCallback === 'function') cancelIdleCallback(lazySetupTimer);
        else clearTimeout(lazySetupTimer);
      }
      const run = () => {
        lazySetupTimer = 0;
        if (!shotActive && !replayingMotion && allStopped() && practiceMode && currentPracticeShot()?.code === s.code) {
          // Calcula y guarda en caché sin bloquear la selección ni el modal.
          findPracticePhysicsSetup(s);
        }
      };
      lazySetupTimer = typeof requestIdleCallback === 'function'
        ? requestIdleCallback(run, { timeout: 900 })
        : setTimeout(run, 260);
    }

    function applyPracticeSetup(s, optimize = true) {
      const cue = ball('cue');
      const base = {
        angle: cue && s?.aimAt ? angleTo(cue, s.aimAt) : aimAngle,
        power: s?.executionPower ?? s?.power ?? powerPct,
        effect: { x: s?.effect?.x ?? effectX, y: s?.effect?.y ?? effectY },
        score: 0
      };
      const best = optimize ? findPracticePhysicsSetup(s) : null;
      const setup = best || base;
      aimAngle = setup.angle;
      powerPct = adjustedLongShotPower(setup.power, s);
      effectX = clampEffect(setup.effect.x, setup.effect.y).x;
      effectY = clampEffect(setup.effect.x, setup.effect.y).y;
      return setup;
    }

    function alignToPracticeGuide(announce = true) {
      if (shotActive || replayingMotion || !allStopped()) return;
      if (!practiceMode) {
        const selectedIndex = parseInt(practiceSelect.value || String(practiceIndex), 10);
        applyPracticeShot(Number.isFinite(selectedIndex) ? selectedIndex : practiceIndex, false);
      }
      const s = currentPracticeShot();
      const cue = ball('cue');
      if (!s || !cue || !s.aimAt) return;
      applyPracticeSetup(s, true);
      applyImageContactToCue(s, false);
      releaseSelectionGuideLock();
      guide = true;
      if (guideBtn) guideBtn.textContent = 'Guía: ON';
      fineAlignMode = true;
      setMode('libre', false);
      markModeDone('taco');
      markModeDone('efecto');
      markModeDone('potencia');
      renderPracticeMarkers();
      renderBalls();
      updateHUD();
      updateFloatingControls();
      syncPracticeUI();
      syncEasyAlignUI();
      updateGuidesSoon();
      if (announce) setGuideText(`<strong>Asistencia de guía:</strong> la jugada ${s.code} quedó sincronizada con la referencia del video. Toca <span class="route">Tirar</span> para practicar la tacada; si la predicción anticipa 3 o más bandas, la iluminación quedará activa como referencia final. Para ver el modelo sin fallar usa <span class="route">Demostración</span>.`);
    }

    function toggleAlignmentMode() {
      if (shotActive || replayingMotion || placingMode || !allStopped()) return;
      if (fineAlignMode) {
        fineAlignMode = false;
        syncEasyAlignUI();
        setGuideText('<strong>Asistencia OFF:</strong> la guía de la carambola sigue visible, pero puedes mover taco, potencia y efecto libremente.');
        updateGuidesSoon();
        playSound('ui', .35);
        return;
      }
      alignToPracticeGuide(true);
    }

    function nudgeAimBy(deg) {
      if (shotActive || replayingMotion || placingMode || !allStopped()) return;
      fineAlignMode = true;
      releaseSelectionGuideLock();
      aimAngle += deg * Math.PI / 180;
      markModeDone('taco');
      updateFloatingControls();
      syncEasyAlignUI();
      updateGuidesSoon();
    }

    function nudgePowerBy(delta) {
      if (shotActive || replayingMotion || placingMode || !allStopped()) return;
      fineAlignMode = true;
      releaseSelectionGuideLock();
      powerPct = clamp(Math.round(powerPct + delta), 1, maxPowerPctForShot());
      markModeDone('potencia');
      updateFloatingControls();
      syncEasyAlignUI();
      updateGuidesSoon();
    }

    function nudgeEffectBy(axis, delta) {
      if (shotActive || replayingMotion || placingMode || !allStopped()) return;
      fineAlignMode = true;
      releaseSelectionGuideLock();
      const next = axis === 'x' ? clampEffect(effectX + delta, effectY) : clampEffect(effectX, effectY + delta);
      effectX = next.x;
      effectY = next.y;
      markModeDone('efecto');
      updateFloatingControls();
      syncEasyAlignUI();
      updateGuidesSoon();
    }

    function syncSquareCaromUI() {
      if (!squareCaromBtn) return;
      squareCaromBtn.disabled = shotActive || replayingMotion || placingMode || !allStopped();
      syncEasyAlignUI();
    }

    function squareCaromConditions() {
      if (shotActive || replayingMotion || !allStopped()) return;
      const selectedIndex = parseInt(practiceSelect.value || String(practiceIndex), 10);
      practiceIndex = Number.isFinite(selectedIndex) ? selectedIndex : practiceIndex;
      const s = currentPracticeShot();
      practiceMode = true;
      deflectionGuideMode = 'imagen';
      guide = true;
      if (guideBtn) guideBtn.textContent = 'Guía: ON';
      practicePanel.classList.add('open', 'manual-open');
      placingMode = false;
      syncPlacementUI();
      stopAllBalls();
      balls = cloneBalls(s.balls);
      const cue = ball('cue');
      applyPracticeSetup(s, true);
      applyImageContactToCue(s, false);
      releaseSelectionGuideLock();
      guide = true;
      if (guideBtn) guideBtn.textContent = 'Guía: ON';
      fineAlignMode = true;
      lastPracticeFeedback = '';
      clearReplayShot();
      setMode('libre', false);
      resetShotState();
      renderPracticeMarkers();
      renderBalls();
      updateHUD();
      updateFloatingControls();
      syncPracticeUI();
      syncEasyAlignUI();
      updateGuidesSoon();
      playSound('ui', .55);
      setGuideText(`<strong>Carambola cuadrada:</strong> la jugada ${s.code} quedó lista con posición, taco, efecto y potencia de referencia. Toca <span class="route">Tirar</span> para practicar con física real. Si te sales del cálculo, la bola seguirá su trayectoria normal; <span class="route">Demostración</span> muestra la jugada exacta.`);
    }

    function populatePracticeSelect() {
      practiceSelect.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecciona la carambola:';
      placeholder.disabled = true;
      placeholder.selected = true;
      practiceSelect.appendChild(placeholder);
      practiceShots.forEach((shot, index) => {
        const opt = document.createElement('option');
        opt.value = String(index);
        opt.textContent = `Jugada ${String(shot.code).padStart(3, '0')}`;
        practiceSelect.appendChild(opt);
      });
      practiceSelect.value = '';
    }

    function syncPracticeUI() {
      practicePanel.classList.toggle('open', practiceMode || practicePanel.classList.contains('manual-open'));
      if (techniqueBtn) {
        techniqueBtn.textContent = `Técnica video: ${practiceMode ? 'ON' : 'OFF'}`;
        techniqueBtn.classList.toggle('practice-on', practiceMode);
      }
      if (practiceSelect) {
        if (practiceMode) practiceSelect.value = String(practiceIndex);
        else if (!practiceSelect.value) practiceSelect.value = '';
      }
      updatePracticeInfo();
      syncPracticeImagesUI();
      syncSquareCaromUI();
      syncEasyAlignUI();
    }

    function updatePracticeInfo() {
      // Tarjeta informativa de la jugada eliminada por solicitud del usuario.
      // La selección de jugadas, ruta guía, video, efecto, potencia y física siguen funcionando.
      return;
    }

    function clearPracticeMarkers() {
      if (practiceMarkers) practiceMarkers.innerHTML = '';
    }

    function addPracticeMarker(x, y, text, cls = '') {
      if (!practiceMarkers) return;
      const g = svgEl('g');
      g.setAttribute('class', `practice-marker ${cls}`.trim());
      const c = svgEl('circle');
      c.setAttribute('cx', x.toFixed(1));
      c.setAttribute('cy', y.toFixed(1));
      c.setAttribute('r', cls.includes('aim') ? '14' : '18');
      const t = svgEl('text');
      t.setAttribute('x', x.toFixed(1));
      t.setAttribute('y', y.toFixed(1));
      t.textContent = text;
      g.appendChild(c);
      g.appendChild(t);
      practiceMarkers.appendChild(g);
    }

    function syncGuideToggleUI() {
      if (!guideBtn) return;
      guideBtn.textContent = guide ? 'Guía: ON' : 'Guía: OFF';
      guideBtn.classList.toggle('guide-on', !!guide);
      guideBtn.setAttribute('aria-pressed', guide ? 'true' : 'false');
      guideBtn.disabled = shotActive || placingMode || replayingMotion;
      syncFullscreenCompactLabels();
    }

    function setGuideEnabled(enabled, announce = false) {
      guide = !!enabled;
      if (!guide) {
        clearPracticeMarkers();
        recommendationLine.setAttribute('points', '');
        recommendationLine.setAttribute('opacity', '0');
        recommendationEvents.innerHTML = '';
        aimPreview.setAttribute('points', '');
        aimPreview.setAttribute('opacity', '0');
        clearMasterGuideLine();
        hideCueProjectionGuide();
      } else if (practiceMode) {
        renderPracticeMarkers();
      }
      syncGuideToggleUI();
      updateGuidesSoon();
      if (announce) {
        const state = guide ? 'activada' : 'desactivada';
        setGuideText(`<strong>Guía ${state}:</strong> puedes comparar la ruta recomendada con tu tacada física cuando esté encendida.`);
      }
    }

    function toggleGuide() {
      if (shotActive || replayingMotion || placingMode) return;
      setGuideEnabled(!guide, true);
      playSound('ui', .35);
    }

    function renderPracticeMarkers() {
      clearPracticeMarkers();
      if (!guide || !practiceMode || shotActive || placingMode) return;
      const s = currentPracticeShot();
      const first = ball(s.first);
      const second = ball(s.second);
      if (first) addPracticeMarker(first.x, first.y, '1ª');
      if (second) addPracticeMarker(second.x, second.y, '2ª');
      if (s.aimAt) addPracticeMarker(s.aimAt.x, s.aimAt.y, 'Mira', 'aim');
    }

    function applyPracticeShot(index = practiceIndex, announce = true, force = false) {
      if (force) cancelCurrentShotForPracticeChange();
      else if (shotActive || replayingMotion || !allStopped()) return;
      practiceIndex = (index + practiceShots.length) % practiceShots.length;
      const s = currentPracticeShot();
      practiceMode = true;
      guide = true;
      practicePanel.classList.add('open', 'manual-open');
      placingMode = false;
      if (guideBtn) guideBtn.textContent = 'Guía: ON';
      syncPlacementUI();
      balls = cloneBalls(s.balls);
      applyPracticeSetup(s, false);
      deflectionGuideMode = 'imagen';
      applyImageContactToCue(s, false, { softStart: true });
      // Al seleccionar una jugada no se arma la carambola perfecta: la guía verde queda como referencia y la guía de tacada inicia libre/separada.
      // Para sincronización exacta se usa el botón Efecto o el imán cuando el jugador se acerque.
      lastPracticeFeedback = '';
      clearReplayShot();
      setMode('libre', false);
      resetShotState();
      renderPracticeMarkers();
      syncPracticeUI();
      preloadPracticeImagesAround(practiceIndex);
      updateDeflectionGuide();
      if (practiceImagesModal && practiceImagesModal.classList.contains('open')) renderPracticeReferenceImages();
      if (videoModal && videoModal.classList.contains('open')) {
        renderVideoModalImages(true);
        updateVideoModalStatus(s);
        const shouldAutoplay = !(videoFrame && videoFrame.tagName !== 'IFRAME' && videoFrame.paused);
        if (videoFrame && videoFrame.tagName === 'IFRAME') loadDriveVideoAtPracticeShot(s, shouldAutoplay);
      }
      updateGuidesSoon();
      if (announce) {
        setGuideText(`<strong>${s.title}</strong> seleccionada. <span class="route">Inicio al 5%:</span> la jugada siempre comienza con potencia baja para que entrenes la fuerza desde cero. La guía principal verde queda como referencia de estudio y la guía de tacada no se arma perfecta automáticamente. Mueve el taco, potencia o efecto para acercarte; cuando estés cerca se activará el imán físico. La iluminación final se activará por predicción cuando la guía indique una carambola de 3 o más bandas; no depende de una celebración posterior al resultado.`);
      }
    }

    function exitPracticeMode(announce = true) {
      practiceMode = false;
      deflectionGuideMode = null;
      guide = true;
      if (guideBtn) guideBtn.textContent = 'Guía: ON';
      fineAlignMode = false;
      lastPracticeFeedback = '';
      clearReplayShot();
      clearPracticeMarkers();
      practicePanel.classList.add('open', 'manual-open');
      syncPracticeUI();
      updateGuidesSoon();
      if (announce) setGuideText('<strong>Modo LIBRE:</strong> puedes practicar cualquier posición con taco, efecto, potencia y ubicación de bolas. Para volver a una jugada, selecciona el número en el menú y se cargará automáticamente.');
    }

    function nextPracticeShot(delta = 1) {
      const baseIndex = practiceMode ? practiceIndex : selectedPracticeIndex();
      const nextIndex = (baseIndex + delta + practiceShots.length) % practiceShots.length;
      if (videoModal && videoModal.classList.contains('open')) {
        stepVideoModalShot(delta);
        return;
      }
      applyPracticeShot(nextIndex, true, true);
      playSound('ui', .45);
    }

    function practiceFeedbackText() {
      if (!practiceMode) return '';
      const s = currentPracticeShot();
      const firstOk = !s.first || shot.firstTarget === s.first;
      const secondOk = !s.second || shot.secondTarget === s.second;
      const valid = shot.result === 'point';
      const bands = countedCushionsForHUD();
      const bandsOk = bands >= 3;
      const firstTxt = firstOk ? `<span class="ok">primer contacto correcto</span>` : `<span class="bad">primero tocaste ${ballLabel(shot.firstTarget || 'ninguna')}</span>`;
      const secondTxt = secondOk && shot.secondTarget ? `<span class="ok">cerraste en ${ballLabel(s.second)}</span>` : `<span class="bad">no cerraste en ${ballLabel(s.second)}</span>`;
      const bandsTxt = bandsOk ? `<span class="ok">${bands} bandas</span>` : `<span class="bad">solo ${bands} banda(s)</span>`;
      const finalTxt = valid ? `<span class="ok">técnica lograda</span>` : `<span class="bad">repite corrigiendo la tacada</span>`;
      if (shot.demoMode) {
        return `<br><strong>Demostración ${s.code}:</strong> ruta modelo completada para estudio. No suma punto ni intento; úsala como referencia y luego practica con <span class="route">Tirar</span>.`;
      }
      const advice = professionalShotAdvice(s, { firstOk, secondOk, bands, valid });
      return `<br><strong>Evaluación profesional ${s.code}:</strong> ${finalTxt}. ${firstTxt}; ${bandsTxt}; ${secondTxt}.<br><strong>Corrección sugerida:</strong> ${advice}<br>${s.tip}`;
    }

    function professionalShotAdvice(s, state = {}) {
      const recommended = Math.round(Number(s?.executionPower || s?.power || 0));
      const used = Math.round(Number(shot.powerPct || powerPct || 0));
      if (!state.firstOk) return `ajusta el grosor del impacto: apunta primero a ${ballLabel(s.first)} y revisa si necesitas fino, media bola o 3/4 según la imagen.`;
      if (!state.bands || state.bands < 3) {
        if (used < recommended - 8) return `faltó recorrido: sube la potencia de ${used}% hacia ${recommended}% y conserva el efecto recomendado.`;
        return `la blanca cerró antes de tiempo: abre la salida con un poco más de efecto lateral a favor o toma menos bola.`;
      }
      if (!state.secondOk) return `la ruta llegó a bandas pero no al cierre: corrige 1–2 grados el taco y revisa si el efecto está invertido.`;
      if (used > recommended + 14) return `la técnica fue cercana, pero sobró potencia; baja a ${recommended}% para que la bola llegue más noble.`;
      return `mantén la misma línea y realiza solo microajustes de potencia/efecto hasta repetir la llegada.`;
    }

    function pointerPoint(evt) {
      const rect = table.getBoundingClientRect();
      const p = evt.touches && evt.touches[0] ? evt.touches[0] : (evt.changedTouches && evt.changedTouches[0] ? evt.changedTouches[0] : evt);
      return { x: (p.clientX - rect.left) * DESIGN_W / rect.width, y: (p.clientY - rect.top) * DESIGN_H / rect.height };
    }

    function clampEffect(x, y) {
      let nx = Math.max(-100, Math.min(100, Math.round(x)));
      let ny = Math.max(-100, Math.min(100, Math.round(y)));
      const mag = Math.hypot(nx, ny);
      if (mag > 100) {
        const s = 100 / mag;
        nx = Math.round(nx * s);
        ny = Math.round(ny * s);
      }
      return { x: nx, y: ny };
    }

    const EFFECT_UI_PERCENT_SCALE = 0.22;
    const EFFECT_GUIDE_PIXEL_SCALE = 0.22;
    const GUIDE_MAGNET_AVG_THRESHOLD = 38;
    const GUIDE_MAGNET_MAX_THRESHOLD = 82;
    const GUIDE_MAGNET_ANGLE_THRESHOLD_DEG = 16;

    function effectDotPercent(value) {
      const v = Math.max(-100, Math.min(100, Number(value) || 0));
      return 50 + v * EFFECT_UI_PERCENT_SCALE;
    }

    function effectDotGuideOffset(value) {
      const v = Math.max(-100, Math.min(100, Number(value) || 0));
      return v * EFFECT_GUIDE_PIXEL_SCALE;
    }

    function spinText(x = effectX, y = effectY) {
      const parts = [];
      if (Math.abs(y) >= 6) parts.push(`${y < 0 ? 'arriba' : 'abajo'} ${Math.abs(y)}%`);
      if (Math.abs(x) >= 6) parts.push(`${x < 0 ? 'izquierda' : 'derecha'} ${Math.abs(x)}%`);
      return parts.length ? `efecto ${parts.join(' y ')}` : 'efecto centro';
    }

    function directionName(vx, vy) {
      const labels = ['derecha', 'abajo-derecha', 'abajo', 'abajo-izquierda', 'izquierda', 'arriba-izquierda', 'arriba', 'arriba-derecha'];
      const angle = (Math.atan2(vy, vx) * 180 / Math.PI + 360) % 360;
      return labels[Math.round(angle / 45) % 8];
    }

    function modeTitle() {
      return 'Ajuste simultáneo';
    }

    function modeInstruction() {
      return 'mueve el taco para ajustar dirección y potencia al mismo tiempo; mueve el punto rojo para el efecto; doble clic, barra espaciadora o Enter para disparar.';
    }

    function setMode(mode, announce = true) {
      if (shotActive || replayingMotion || !allStopped()) return;
      currentMode = 'libre';
      for (const btn of modeButtons) {
        btn.classList.add('active', 'done');
        btn.setAttribute('aria-selected', 'true');
      }
      if (announce) setGuideText('<strong>Ajuste libre:</strong> taco, efecto y potencia están activos al mismo tiempo. Arrastra el taco para dirección/fuerza, mueve el punto rojo para efecto y dispara con doble clic/doble toque.');
      updateFloatingControls();
      updateGuidesSoon();
    }

    function markModeDone(mode) {
      if (mode === 'taco') aimLocked = true;
      if (mode === 'efecto') effectLocked = true;
      if (mode === 'potencia') powerLocked = true;
      for (const btn of modeButtons) btn.classList.add('active', 'done');
    }

    function releaseSelectionGuideLock() {
      // Al seleccionar una jugada la ruta verde queda como referencia, pero la tacada
      // no se arma perfecta automáticamente. El imán solo entra cuando el jugador
      // ajusta taco, potencia o efecto y se acerca a esa ruta.
      selectionGuideNeedsPlayerAim = false;
    }

    function selectionSoftAimOffset(s) {
      const n = parseInt(String(s?.code || '0'), 10) || 0;
      const degrees = 7 + (n % 3) * 1.5;
      const sign = n % 2 === 0 ? -1 : 1;
      return sign * degrees * Math.PI / 180;
    }

    function renderDiamonds() {
      table.querySelectorAll('.diamond').forEach(d => d.remove());
      const positions = [];
      for (let i = 1; i < 8; i++) {
        const x = LEFT + (RIGHT - LEFT) * i / 8;
        positions.push([x, TOP - 22], [x, BOTTOM + 22]);
      }
      for (let i = 1; i < 4; i++) {
        const y = TOP + (BOTTOM - TOP) * i / 4;
        positions.push([LEFT - 22, y], [RIGHT + 22, y]);
      }
      for (const [x, y] of positions) {
        const d = document.createElement('div');
        d.className = 'diamond';
        d.style.left = toCssX(x);
        d.style.top = toCssY(y);
        table.appendChild(d);
      }
    }

    function inferDeflectionGuideMode(shotDef = currentPracticeShot()) {
      if (practiceMode && shotDef?.contactView) return 'imagen';
      const t = String(shotDef?.hitProfile?.thickness || '').toLowerCase();
      if (t.includes('muy fina') || t.includes('fina')) return 'fino';
      if (t.includes('cuarto')) return '1/4';
      if (t.includes('media')) return '1/2';
      if (t.includes('tres')) return '3/4';
      if (t.includes('llena') || t.includes('gruesa')) return 'llena';
      return '1/2';
    }

    function deflectionGuidePreset(mode = '1/2') {
      switch (mode) {
        case 'imagen': return { label: 'efecto', centerGap: 34, sideLift: 0, retain: 0.78, fullness: 0.50, imageMode: true };
        case 'fino': return { label: 'fino', centerGap: 54, sideLift: 14, retain: 0.92, fullness: 0.14 };
        case '1/4': return { label: '1/4 de bola', centerGap: 46, sideLift: 11, retain: 0.86, fullness: 0.25 };
        case '1/2': return { label: '1/2 bola', centerGap: 36, sideLift: 7, retain: 0.76, fullness: 0.50 };
        case '3/4': return { label: '3/4 de bola', centerGap: 26, sideLift: 3, retain: 0.64, fullness: 0.75 };
        case 'llena': return { label: 'llena', centerGap: 18, sideLift: 0, retain: 0.56, fullness: 0.92 };
        default: return { label: '1/2 bola', centerGap: 36, sideLift: 7, retain: 0.76, fullness: 0.50 };
      }
    }

    function deflectionGuideEffectText() {
      const parts = [];
      if (effectY <= -15) parts.push('arriba');
      else if (effectY >= 15) parts.push('abajo');
      if (effectX <= -15) parts.push('izquierda');
      else if (effectX >= 15) parts.push('derecha');
      return parts.length ? parts.join(' + ') : 'centro';
    }

    function normalizeDegrees(rad) {
      let deg = (rad * 180 / Math.PI) % 360;
      if (deg < 0) deg += 360;
      return deg;
    }

    function angleDistanceRad(a, b) {
      if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
      let diff = a - b;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      return Math.abs(diff);
    }

    function fallbackDeflectionTargetId(shotDef = currentPracticeShot()) {
      if (practiceMode && shotDef?.contactView?.target && shotDef.contactView.target !== 'cue') return shotDef.contactView.target;
      if (practiceMode && shotDef && shotDef.first && shotDef.first !== 'cue') return shotDef.first;
      const cueBall = ball('cue');
      if (!cueBall) return 'red';
      const candidates = ['red', 'yellow'].map(id => ball(id)).filter(Boolean).sort((a, b) => {
        const da = Math.hypot(a.x - cueBall.x, a.y - cueBall.y);
        const db = Math.hypot(b.x - cueBall.x, b.y - cueBall.y);
        return da - db;
      });
      return candidates[0]?.id || 'red';
    }

    function aimedTargetFromCue(angle = aimAngle) {
      const cueBall = ball('cue');
      if (!cueBall) return null;
      const forward = { x: Math.cos(angle), y: Math.sin(angle) };
      const candidates = ['red', 'yellow'].map(id => {
        const b = ball(id);
        if (!b) return null;
        const rx = b.x - cueBall.x;
        const ry = b.y - cueBall.y;
        const along = rx * forward.x + ry * forward.y;
        const cross = rx * forward.y - ry * forward.x;
        const lateral = Math.abs(cross);
        const angular = Math.abs(Math.atan2(cross, Math.max(along, 1)));
        // La guía dinámica solo debe aparecer cuando la ruta del taco realmente
        // encara una bola. Este margen incluye golpes finos y punto fantasma,
        // pero elimina la guía cuando el taco apunta al vacío o lejos de ambas bolas.
        const direct = along > R * .45 && lateral <= R * 2.75;
        const score = direct ? along + lateral * 20 : 999999;
        return { id, ball: b, along, cross, lateral, angular, direct, score };
      }).filter(Boolean).sort((a, b) => a.score - b.score);
      const best = candidates[0];
      if (!best || !best.direct) return null;
      return {
        id: best.id,
        ball: best.ball,
        along: best.along,
        cross: best.cross,
        lateral: best.lateral,
        angular: best.angular,
        direct: true,
        sideSign: best.cross < 0 ? -1 : 1
      };
    }

    function thicknessModeToImpactOffset(mode = '1/2') {
      const preset = deflectionGuidePreset(mode);
      const fullness = clamp(Number(preset.fullness ?? 0.50), 0.06, 0.92);
      // En bolas iguales, el grosor visual se consigue variando el desfase lateral
      // de la línea de la blanca respecto al centro de la receptora: grosor 1 = llena,
      // grosor pequeño = fina. Se limita para que el contacto siga siendo posible.
      return clamp((1 - fullness) * R * 2, R * 0.12, R * 1.88);
    }

    function preferredContactSideForTarget(targetId, aimed = null) {
      if (aimed && aimed.id === targetId && Math.abs(aimed.cross) > 0.55) {
        return aimed.cross < 0 ? -1 : 1;
      }
      const shotDef = currentPracticeShot();
      const sideText = String(shotDef?.hitProfile?.side || '').toLowerCase();
      if (sideText.includes('izq')) return -1;
      if (sideText.includes('der')) return 1;
      if (targetId === shotDef?.first || targetId === shotDef?.contactView?.target) {
        const dx = Number(shotDef?.contactView?.dx || 0);
        const dy = Number(shotDef?.contactView?.dy || 0);
        if (Math.abs(dx) + Math.abs(dy) > 0.01) return Math.sign(dy || dx) || 1;
      }
      return 1;
    }

    function targetForManualThicknessAdjustment() {
      const aimed = aimedTargetFromCue(aimAngle);
      if (aimed?.id) return { id: aimed.id, aimed, source: 'taco' };
      // En modos manuales no se inventa receptora: si el taco no apunta a roja o amarilla,
      // la guía no muestra bola. La opción Imagen jugada sí usa la primera bola real de la jugada.
      return null;
    }

    function contactViewImageCenters(viewPreset) {
      if (!viewPreset) return null;
      let cueCenter = {
        x: 250 * (Number(viewPreset.cueX ?? 74) / 100),
        y: 116 * (Number(viewPreset.cueY ?? 34) / 100)
      };
      let targetCenter = {
        x: cueCenter.x + Number(viewPreset.dx ?? 34),
        y: cueCenter.y + Number(viewPreset.dy ?? 0)
      };
      const marginCue = 37;
      const marginTarget = 35;
      let shiftX = 0;
      let shiftY = 0;
      const minX = Math.min(cueCenter.x - marginCue, targetCenter.x - marginTarget);
      const maxX = Math.max(cueCenter.x + marginCue, targetCenter.x + marginTarget);
      const minY = Math.min(cueCenter.y - marginCue, targetCenter.y - marginTarget);
      const maxY = Math.max(cueCenter.y + marginCue, targetCenter.y + marginTarget);
      if (minX < 8) shiftX = 8 - minX;
      if (maxX + shiftX > 242) shiftX -= (maxX + shiftX - 242);
      if (minY < 8) shiftY = 8 - minY;
      if (maxY + shiftY > 108) shiftY -= (maxY + shiftY - 108);
      cueCenter.x += shiftX;
      cueCenter.y += shiftY;
      targetCenter.x += shiftX;
      targetCenter.y += shiftY;
      return { cueCenter, targetCenter };
    }

    function imageContactSideSign(viewPreset) {
      const dx = Number(viewPreset?.dx ?? 0);
      const dy = Number(viewPreset?.dy ?? 0);
      if (Math.abs(dy) > 0.4) return dy < 0 ? -1 : 1;
      if (Math.abs(dx) > 0.4) return dx < 0 ? -1 : 1;
      return 1;
    }

    function computeImageCueAlignment(shotDef, cueBall, targetBall, viewPreset) {
      const dx = targetBall.x - cueBall.x;
      const dy = targetBall.y - cueBall.y;
      const rawDistance = Math.hypot(dx, dy);
      const distance = Math.max(rawDistance, R * 2.12);
      const baseAngle = Math.atan2(dy || 0.0001, dx || 0.0001);

      const visualDx = Number(viewPreset?.dx ?? 34);
      const visualDy = Number(viewPreset?.dy ?? 0);
      const visualDistance = Math.hypot(visualDx, visualDy) || 34;
      const overlap = clamp(Number(viewPreset?.overlap ?? 0.82), 0.08, 0.98);
      const distanceBasedFullness = clamp(1 - (visualDistance - 18) / 46, 0.08, 0.96);
      const visualFullness = clamp(overlap * 0.74 + distanceBasedFullness * 0.26, 0.08, 0.96);
      const lateralOffset = clamp((1 - visualFullness) * R * 1.98, R * 0.08, R * 1.90);
      const sideSign = imageContactSideSign(viewPreset);

      const angleOffset = Math.asin(clamp(lateralOffset / distance, -0.96, 0.96)) * sideSign;

      const profileSide = String(shotDef?.hitProfile?.side || '').toLowerCase();
      const profileSign = profileSide.includes('izq') ? -1 : (profileSide.includes('der') ? 1 : sideSign);
      const dyRatio = clamp(visualDy / Math.max(visualDistance, 1), -1, 1);
      const dxRatio = clamp(visualDx / Math.max(visualDistance, 1), -1, 1);
      const overlapBias = (overlap - 0.5) * 0.05;
      const microNudge = (dyRatio * 0.042 + dxRatio * 0.012 + overlapBias) * profileSign;
      const refinedAngle = baseAngle + angleOffset + microNudge;

      return {
        angle: refinedAngle,
        distance,
        baseAngle,
        visualFullness,
        lateralOffset,
        overlap,
        visualDistance,
        sideSign,
        microNudge
      };
    }

    function applyImageContactToCue(shotDef = currentPracticeShot(), announce = true, options = {}) {
      if (shotActive || replayingMotion || placingMode || !allStopped()) return false;
      const cueBall = ball('cue');
      const viewPreset = shotDef?.contactView || null;
      let targetId = viewPreset?.target || shotDef?.first;
      let targetBall = targetId ? ball(targetId) : null;
      if (!targetBall && shotDef?.first && ball(shotDef.first)) {
        targetId = shotDef.first;
        targetBall = ball(targetId);
      }
      if (!cueBall || !targetBall) {
        // Si la jugada no tiene bola receptora válida, no se inventa una bola cercana:
        // la guía dinámica queda en blanco hasta que haya receptora real.
        if (deflectionGuideReadout) deflectionGuideReadout.innerHTML = '';
        if (deflectionGuideStatus) deflectionGuideStatus.innerHTML = '';
        setDeflectionGuideGraphicVisible(false);
        return false;
      }
      const alignment = computeImageCueAlignment(shotDef, cueBall, targetBall, viewPreset);
      aimAngle = alignment.angle;

      // Imagen jugada aplica de una vez
      // la posición visual, el efecto recomendado y la potencia base de la jugada.
      const imageEffect = shotDef?.visualEffect || shotDef?.videoImageEffect || shotDef?.effect;
      if (imageEffect) {
        const eff = clampEffect(imageEffect.x || 0, imageEffect.y || 0);
        effectX = eff.x;
        effectY = eff.y;
        markModeDone('efecto');
      }
      if (Number.isFinite(Number(shotDef?.executionPower ?? shotDef?.power))) {
        powerPct = adjustedLongShotPower(Number(shotDef.executionPower ?? shotDef.power), shotDef);
        markModeDone('potencia');
      }

      const softStart = !!options.softStart;
      if (softStart) {
        aimAngle += selectionSoftAimOffset(shotDef);
        // v193: toda jugada cargada inicia con 5% de potencia para que el jugador
        // ajuste la fuerza desde cero. El botón Efecto puede aplicar
        // después la referencia visual cuando el usuario lo solicite.
        powerPct = 5;
      }

      lastImageShotSetup = {
        code: shotDef?.code || null,
        angle: aimAngle,
        power: powerPct,
        effectX,
        effectY,
        targetId,
        visualFullness: alignment.visualFullness,
        lateralOffset: alignment.lateralOffset,
        overlap: alignment.overlap,
        microNudge: alignment.microNudge,
        selectionSoftStart: softStart
      };

      selectionGuideNeedsPlayerAim = softStart;
      deflectionGuideMode = 'imagen';
      fineAlignMode = true;
      markModeDone('taco');
      clearReplayShot();
      updateFloatingControls();
      updateGuidesSoon();
      syncEasyAlignUI();
      updateDeflectionGuide();
      if (announce) {
        setGuideText(`<strong>Imagen jugada:</strong> guía dinámica, taco, <span class="route">potencia</span> y efecto quedaron sincronizados con el punto azul exacto de la imagen/modal de la jugada ${shotDef?.code || ''}. Al mover el taco, la mini-guía se moverá contigo sin cambiar ese efecto de referencia. Al tocar <span class="route">Tirar</span> sin modificar nada, la tacada seguirá exactamente esa guía; si cambias taco, potencia o efecto, pasará a física libre recalculada.`);
      }
      return true;
    }

    function applyDeflectionThicknessToCue(mode = deflectionGuideMode) {
      if (mode === 'imagen') return applyImageContactToCue(currentPracticeShot(), true);
      if (shotActive || replayingMotion || placingMode || !allStopped()) return false;
      const cueBall = ball('cue');
      if (!cueBall) return false;
      const targetInfo = targetForManualThicknessAdjustment();
      if (!targetInfo) return false;
      const targetBall = ball(targetInfo.id);
      if (!targetBall) return false;

      const dx = targetBall.x - cueBall.x;
      const dy = targetBall.y - cueBall.y;
      const rawDistance = Math.hypot(dx, dy);
      const distance = Math.max(rawDistance, R * 2.12);

      const lateralOffset = Math.min(thicknessModeToImpactOffset(mode), distance * 0.93);
      const centerAngle = Math.atan2(dy || 0.0001, dx || 0.0001);
      const sideSign = preferredContactSideForTarget(targetInfo.id, targetInfo.aimed);
      const angleOffset = Math.asin(clamp(lateralOffset / distance, -0.96, 0.96)) * sideSign;
      aimAngle = centerAngle + angleOffset;

      fineAlignMode = true;
      markModeDone('taco');
      clearReplayShot();
      updateFloatingControls();
      updateGuidesSoon();
      syncEasyAlignUI();

      const preset = deflectionGuidePreset(mode);
      const targetName = ballLabel(targetInfo.id);
      const sourceText = targetInfo.source === 'taco' ? 'sobre la bola que estabas apuntando' : 'sobre la primera bola de la jugada cargada';
      setGuideText(`<strong>Grosor manual:</strong> taco ajustado a <span class="route">${preset.label}</span> ${sourceText}: <span class="route">${targetName}</span>. Ahora el tiro real usa esta posición de tacada, no solo la mini-guía.`);
      return true;
    }

    function getDeflectionGuideTargetId(shotDef = currentPracticeShot()) {
      const aimed = aimedTargetFromCue(aimAngle);
      return aimed?.id || fallbackDeflectionTargetId(shotDef);
    }

    function getDeflectionGuideBallStyle(targetId) {
      if (targetId === 'yellow') {
        return { name: 'amarilla', properName: 'Amarilla', fill: 'url(#guideYellowBallFill)', stroke: '#9a7100' };
      }
      return { name: 'roja', properName: 'Roja', fill: 'url(#guideRedBallFill)', stroke: '#6e0505' };
    }

    function getDeflectionGuideModel() {
      const shotDef = currentPracticeShot();
      const manualMode = deflectionGuideMode;
      const mode = manualMode || '1/2';
      const preset = deflectionGuidePreset(mode);
      const imageEffect = practiceMode && shotDef ? (shotDef.visualEffect || shotDef.videoImageEffect || shotDef.effect) : null;
      const effect = (practiceMode && imageEffect && (!manualMode || manualMode === 'imagen'))
        ? clampEffect(imageEffect.x || 0, imageEffect.y || 0)
        : clampEffect(effectX, effectY);
      const viewPreset = practiceMode && shotDef && shotDef.contactView ? shotDef.contactView : null;
      const angle = Number.isFinite(aimAngle) ? aimAngle : 0;
      const aimed = aimedTargetFromCue(angle);
      const imageMode = practiceMode && viewPreset && (!manualMode || manualMode === 'imagen');
      const imageTargetId = imageMode ? (viewPreset.target || shotDef?.first || null) : null;
      const hasImageTarget = !!(imageTargetId && ball(imageTargetId));
      const imageRef = imageMode && lastImageShotSetup && lastImageShotSetup.code === shotDef?.code ? lastImageShotSetup : null;
      const movedCueFromImage = !!(imageMode && imageRef && angleDistanceRad(angle, imageRef.angle) > 0.045);
      const followCueInImageMode = !!(imageMode && movedCueFromImage && aimed?.id);
      if ((!aimed && !imageMode) || (imageMode && !hasImageTarget && !followCueInImageMode)) {
        return {
          hidden: true,
          shotDef,
          mode,
          manualMode,
          preset,
          effect,
          targetId: null,
          targetStyle: null,
          targetSource: 'ninguna',
          angleDeg: normalizeDegrees(angle)
        };
      }
      const targetId = followCueInImageMode ? aimed.id : (imageMode ? imageTargetId : aimed.id);
      const targetStyle = getDeflectionGuideBallStyle(targetId);
      let cueCenter;
      let targetCenter;
      let sideLabel;
      let targetSource = 'según ruta del taco';

      if (imageMode && !followCueInImageMode) {
        const centers = contactViewImageCenters(viewPreset) || {
          cueCenter: { x: 158, y: 60 },
          targetCenter: { x: 124, y: 58 }
        };
        cueCenter = centers.cueCenter;
        targetCenter = centers.targetCenter;
        sideLabel = imageContactSideSign(viewPreset) < 0 ? 'izquierda' : 'derecha';
        targetSource = 'imagen';
      } else {
        const liveAim = followCueInImageMode ? aimed : aimedTargetFromCue(angle);
        if (!liveAim?.id) {
          return {
            hidden: true,
            shotDef,
            mode,
            manualMode,
            preset,
            effect,
            targetId: null,
            targetStyle: null,
            targetSource: 'ninguna',
            angleDeg: normalizeDegrees(angle)
          };
        }
        const forward = { x: Math.cos(angle), y: Math.sin(angle) };
        const perp = { x: -forward.y, y: forward.x };
        const sideFromAim = liveAim.cross < 0 ? -1 : 1;
        sideLabel = sideFromAim < 0 ? 'izquierda' : 'derecha';
        const visualGap = imageMode ? 34 : preset.centerGap;
        const visualSide = (imageMode ? 8 : preset.sideLift) * 1.15;
        const verticalScale = 0.58;
        const offset = {
          x: forward.x * visualGap + perp.x * visualSide * sideFromAim,
          y: (forward.y * visualGap + perp.y * visualSide * sideFromAim) * verticalScale
        };
        const base = { x: 125, y: 60 };
        cueCenter = {
          x: base.x - offset.x * 0.42,
          y: base.y - offset.y * 0.42
        };
        targetCenter = {
          x: base.x + offset.x * 0.58,
          y: base.y + offset.y * 0.58
        };
        cueCenter.x = Math.max(45, Math.min(205, cueCenter.x));
        cueCenter.y = Math.max(39, Math.min(81, cueCenter.y));
        targetCenter.x = Math.max(45, Math.min(205, targetCenter.x));
        targetCenter.y = Math.max(39, Math.min(81, targetCenter.y));
        targetSource = imageMode ? 'imagen+taco' : 'según ruta del taco';
      }

      const dot = {
        x: cueCenter.x + effectDotGuideOffset(effect.x),
        y: cueCenter.y + effectDotGuideOffset(effect.y)
      };
      dot.x = Math.max(cueCenter.x - 24, Math.min(cueCenter.x + 24, dot.x));
      dot.y = Math.max(cueCenter.y - 24, Math.min(cueCenter.y + 24, dot.y));

      return {
        shotDef,
        mode,
        manualMode,
        preset,
        effect,
        sideLabel,
        cueCenter,
        targetCenter,
        targetId,
        targetStyle,
        targetSource,
        dot,
        angleDeg: normalizeDegrees(angle)
      };
    }

    function setDeflectionGuideGraphicVisible(show) {
      const value = show ? '1' : '0';
      [deflectionCueBall, deflectionTargetBall, deflectionCueDot, deflectionCueShadow, deflectionTargetShadow]
        .filter(Boolean)
        .forEach(el => el.setAttribute('opacity', value));
    }

    function updateDeflectionGuide() {
      if (!deflectionCueBall || !deflectionTargetBall || !deflectionCueDot) return;
      const m = getDeflectionGuideModel();
      deflectionButtons.forEach(btn => btn.classList.toggle('active', (m.mode === 'imagen' && btn.dataset.deflectThickness === 'imagen') || (!!m.manualMode && btn.dataset.deflectThickness === m.mode)));
      if (m.hidden) {
        setDeflectionGuideGraphicVisible(false);
        // Sin bola receptora activa no se muestra nada en la mini-guía.
        if (deflectionGuideReadout) deflectionGuideReadout.innerHTML = '';
        if (deflectionGuideStatus) deflectionGuideStatus.innerHTML = '';
        return;
      }
      setDeflectionGuideGraphicVisible(true);
      deflectionTargetBall.setAttribute('cx', m.targetCenter.x.toFixed(1));
      deflectionTargetBall.setAttribute('cy', m.targetCenter.y.toFixed(1));
      deflectionTargetBall.setAttribute('fill', m.targetStyle.fill);
      deflectionTargetBall.setAttribute('stroke', m.targetStyle.stroke);
      deflectionCueBall.setAttribute('cx', m.cueCenter.x.toFixed(1));
      deflectionCueBall.setAttribute('cy', m.cueCenter.y.toFixed(1));
      deflectionCueDot.setAttribute('cx', m.dot.x.toFixed(1));
      deflectionCueDot.setAttribute('cy', m.dot.y.toFixed(1));
      if (deflectionTargetShadow) {
        deflectionTargetShadow.setAttribute('cx', m.targetCenter.x.toFixed(1));
        deflectionTargetShadow.setAttribute('cy', Math.min(103, m.targetCenter.y + 27).toFixed(1));
      }
      if (deflectionCueShadow) {
        deflectionCueShadow.setAttribute('cx', m.cueCenter.x.toFixed(1));
        deflectionCueShadow.setAttribute('cy', Math.min(104, m.cueCenter.y + 27).toFixed(1));
      }
      const effectTxt = spinText(m.effect.x, m.effect.y);
      const suggestedTxt = (m.shotDef?.visualEffect || m.shotDef?.effect) ? spinText((m.shotDef.visualEffect || m.shotDef.effect).x, (m.shotDef.visualEffect || m.shotDef.effect).y) : 'sin sugerencia cargada';
      const codeTxt = practiceMode && m.shotDef?.code ? `Jugada ${m.shotDef.code}` : 'Modo libre';
      const testTxt = m.mode === 'imagen' ? 'efecto de la jugada' : (m.manualMode ? m.preset.label : 'sin prueba seleccionada');
      if (deflectionGuideReadout) {
        const sourceTxt = m.targetSource === 'imagen' ? 'posición exacta de la imagen inicial' : (m.targetSource === 'imagen+taco' ? 'efecto en seguimiento con el taco' : 'según ruta del taco');
        deflectionGuideReadout.innerHTML = `${codeTxt} · Receptora: <strong>${m.targetStyle.properName}</strong> · ${sourceTxt} · Efecto actual: <strong>${effectTxt}</strong> · Efecto sugerido: <strong>${suggestedTxt}</strong> · Grosor/posición: <strong>${testTxt}</strong>.`;
      }
      if (deflectionGuideStatus) {
        deflectionGuideStatus.innerHTML = m.targetSource === 'imagen'
          ? `Vista sincronizada con la <strong>imagen de la jugada</strong>: la blanca, la <strong>${m.targetStyle.name}</strong>, el punto azul y la <strong>potencia</strong> quedan listos como referencia exacta. Si mueves el taco, la mini-guía empezará a seguir esa nueva dirección.`
          : (m.targetSource === 'imagen+taco'
            ? `Vista de <strong>Efecto</strong> en seguimiento: al mover el taco, la mini-guía acompaña la nueva dirección sin perder la receptora activa. La potencia sugerida de la jugada ya quedó configurada para intentar la carambola.`
            : `Vista sincronizada con el taco: al moverlo, <strong>blanca</strong> y <strong>${m.targetStyle.name}</strong> siguen la dirección de la tacada. Si apuntas a la roja se muestra roja; si apuntas a la amarilla se muestra amarilla. Los botones de grosor ajustan la posición real del taco y también puedes volver con <strong>Efecto</strong>.`);
      }
    }

    function initDeflectionGuide() {
      deflectionButtons.forEach(btn => btn.addEventListener('click', () => {
        deflectionGuideMode = btn.dataset.deflectThickness || '1/2';
        const applied = applyDeflectionThicknessToCue(deflectionGuideMode);
        updateDeflectionGuide();
        if (!applied && deflectionGuideStatus) {
          deflectionGuideStatus.innerHTML = '';
        }
        playSound('ui', .26);
      }));
      updateDeflectionGuide();
    }

    function renderBalls() {

      for (const b of balls) {
        const el = els[b.id];
        el.style.left = toCssX(b.x);
        el.style.top = toCssY(b.y);
        el.classList.toggle('placeable', placingMode && !shotActive);
        el.classList.toggle('dragging-ball', draggingPlaceBall === b.id);
      }
      updateFloatingControls();
      if (!shotActive && !replayingMotion) {
        updateDeflectionGuide();
        updateContactViewer();
      }
    }

    function viewerLayout(rect) {
      const cueSize = (viewerEls.cue && viewerEls.cue.offsetWidth) || 72;
      const padX = cueSize / 2 + 8;
      const padY = cueSize / 2 + 8;
      const focus = ball(viewerFocusBall) || ball('cue');
      const focusNx = (focus.x - LEFT) / (RIGHT - LEFT);
      const focusNy = (focus.y - TOP) / (BOTTOM - TOP);
      const usableW = Math.max(10, rect.width - padX * 2);
      const usableH = Math.max(10, rect.height - padY * 2);
      const focusBaseX = padX + focusNx * usableW;
      const focusBaseY = padY + focusNy * usableH;
      return { padX, padY, usableW, usableH, focus, focusBaseX, focusBaseY };
    }

    function viewerScreenPoint(point, rect, layout) {
      const l = layout || viewerLayout(rect);
      const nx = (point.x - LEFT) / (RIGHT - LEFT);
      const ny = (point.y - TOP) / (BOTTOM - TOP);
      const baseX = l.padX + nx * l.usableW;
      const baseY = l.padY + ny * l.usableH;
      const x = rect.width / 2 + (baseX - l.focusBaseX) * viewerZoom;
      const y = rect.height / 2 + (baseY - l.focusBaseY) * viewerZoom;
      return { x, y };
    }

    function viewerPoint(evt) {
      const rect = ballViewerStage.getBoundingClientRect();
      const src = evt.touches && evt.touches[0] ? evt.touches[0] : evt;
      const l = viewerLayout(rect);
      const sx = clamp(src.clientX - rect.left, 0, rect.width || 1);
      const sy = clamp(src.clientY - rect.top, 0, rect.height || 1);
      const baseX = l.focusBaseX + (sx - rect.width / 2) / Math.max(viewerZoom, .1);
      const baseY = l.focusBaseY + (sy - rect.height / 2) / Math.max(viewerZoom, .1);
      const nx = (baseX - l.padX) / l.usableW;
      const ny = (baseY - l.padY) / l.usableH;
      return {
        x: LEFT + nx * (RIGHT - LEFT),
        y: TOP + ny * (BOTTOM - TOP)
      };
    }

    function setViewerLine(el, a, b) {
      if (!el || !a || !b) return;
      el.setAttribute('x1', a.x.toFixed(1));
      el.setAttribute('y1', a.y.toFixed(1));
      el.setAttribute('x2', b.x.toFixed(1));
      el.setAttribute('y2', b.y.toFixed(1));
    }

    function currentContactViewData() {
      const practiceShot = practiceMode ? currentPracticeShot() : null;
      const cueBall = ball('cue');
      const candidates = ['red', 'yellow'].map(id => ball(id)).sort((a, b) => {
        const da = Math.hypot(a.x - cueBall.x, a.y - cueBall.y);
        const db = Math.hypot(b.x - cueBall.x, b.y - cueBall.y);
        return da - db;
      });
      const nearest = candidates[0]?.id || 'red';
      const fallbackTarget = (practiceShot && practiceShot.first && practiceShot.first !== 'cue') ? practiceShot.first : nearest;
      const aimedTarget = aimedTargetFromCue(aimAngle);
      const preset = practiceShot && practiceShot.contactView ? practiceShot.contactView : null;
      const profile = practiceShot?.hitProfile || null;
      const profileNote = profile ? `Golpe de referencia: ${profile.thickness} por la ${profile.side}; primera banda ${profile.firstRail}; potencia ${practiceShot.power}%. ` : '';
      return {
        target: aimedTarget?.id || preset?.target || fallbackTarget,
        cueX: preset?.cueX ?? 62,
        cueY: preset?.cueY ?? 54,
        dx: preset?.dx ?? 30,
        dy: preset?.dy ?? 0,
        overlap: preset?.overlap ?? 0.82,
        note: `${profileNote}${preset?.note || ''}`
      };
    }

    function updateContactViewer() {
      if (!contactViewerStage || !contactCueBall || !contactTargetBall) return;
      const rect = contactViewerStage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const shot = practiceMode ? currentPracticeShot() : null;
      const view = currentContactViewData();
      const targetId = view.target;
      const targetName = targetId === 'yellow' ? 'Amarilla' : 'Roja';
      const angle = Number.isFinite(aimAngle) ? aimAngle : 0;
      const centerX = rect.width * (view.cueX / 100);
      const centerY = rect.height * (view.cueY / 100);
      const clusterRadius = Math.max(24, Math.min(rect.width, rect.height) * 0.10);
      const aimedTarget = aimedTargetFromCue(angle);
      const gap = Math.max(clusterRadius * .72, Math.hypot(view.dx || 0, view.dy || 0) * (view.overlap || .88));
      const sideOffset = Math.min(clusterRadius * .34, Math.abs(view.dy || 0) * (view.overlap || .88));
      const sideSign = aimedTarget ? (aimedTarget.cross < 0 ? -1 : 1) : Math.sign(view.dy || view.dx || 1);
      const targetX = centerX + Math.cos(angle) * gap + (-Math.sin(angle)) * sideOffset * sideSign;
      const targetY = centerY + Math.sin(angle) * gap + Math.cos(angle) * sideOffset * sideSign;
      const cueStickLength = Math.max(110, Math.min(rect.width * 0.42, 230));
      const cueStickX = centerX - Math.cos(angle) * cueStickLength * 0.96;
      const cueStickY = centerY - Math.sin(angle) * cueStickLength * 0.96;
      const aimLength = Math.max(54, Math.hypot(targetX - centerX, targetY - centerY) + clusterRadius * 1.8);
      const aimDeg = angle * 180 / Math.PI;

      contactCueBall.style.left = `${centerX}px`;
      contactCueBall.style.top = `${centerY}px`;
      contactTargetBall.style.left = `${targetX}px`;
      contactTargetBall.style.top = `${targetY}px`;
      contactTargetBall.classList.toggle('red', targetId === 'red');
      contactTargetBall.classList.toggle('yellow', targetId === 'yellow');

      if (contactCueDot) {
        contactCueDot.style.left = `${effectDotPercent(effectX)}%`;
        contactCueDot.style.top = `${effectDotPercent(effectY)}%`;
      }
      if (contactCueStick) {
        contactCueStick.style.width = `${cueStickLength}px`;
        contactCueStick.style.left = `${cueStickX}px`;
        contactCueStick.style.top = `${cueStickY}px`;
        contactCueStick.style.transform = `translateY(-50%) rotate(${aimDeg}deg)`;
      }
      if (contactAimLine) {
        contactAimLine.style.width = `${aimLength}px`;
        contactAimLine.style.left = `${centerX}px`;
        contactAimLine.style.top = `${centerY}px`;
        contactAimLine.style.transformOrigin = '0% 50%';
        contactAimLine.style.transform = `translateY(-50%) rotate(${aimDeg}deg)`;
      }
      if (contactViewerLegend) {
        const code = shot ? shot.code : 'Libre';
        contactViewerLegend.textContent = `${code} · Blanca + ${targetName}`;
      }
      if (contactViewerCaption) {
        const angTxt = normalizedAngleDeg().toFixed(1);
        const dirTxt = directionName(Math.cos(angle), Math.sin(angle));
        const poseTxt = view.note ? `${view.note} ` : '';
        contactViewerCaption.innerHTML = `${poseTxt}Objetivo mostrado: <strong>${targetName.toLowerCase()}</strong> · ángulo del taco <span class="gold">${angTxt}°</span> · salida ${dirTxt} · ${spinText()}. La posición del visor se adapta a la imagen de la jugada actual y el punto azul sigue el efecto en tiempo real.`;
      }
    }

    function updateBallViewer() {
      updateContactViewer();
      if (!ballViewerStage) return;
      const rect = ballViewerStage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (ballViewerSvg) {
        ballViewerSvg.setAttribute('viewBox', `0 0 ${rect.width.toFixed(1)} ${rect.height.toFixed(1)}`);
      }
      const layout = viewerLayout(rect);
      const focus = layout.focus;
      const screen = {};
      for (const b of balls) {
        const el = viewerEls[b.id];
        if (!el) continue;
        const p = viewerScreenPoint(b, rect, layout);
        screen[b.id] = p;
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
        el.classList.toggle('active', b.id === viewerFocusBall);
        el.style.zIndex = b.id === viewerFocusBall ? '40' : String(10 + Math.round(p.y / Math.max(rect.height, 1) * 10));
        el.setAttribute('aria-pressed', b.id === viewerFocusBall ? 'true' : 'false');
      }
      setViewerLine(viewerRelCueYellow, screen.cue, screen.yellow);
      setViewerLine(viewerRelCueRed, screen.cue, screen.red);
      setViewerLine(viewerRelRedYellow, screen.red, screen.yellow);

      if (viewerCueDot) {
        viewerCueDot.style.left = `${effectDotPercent(effectX)}%`;
        viewerCueDot.style.top = `${effectDotPercent(effectY)}%`;
      }

      const s = practiceMode ? currentPracticeShot() : null;
      const guidePath = s && s.guidePath ? s.guidePath : null;
      if (viewerGuidePath) {
        if (viewerPreviewOn && guidePath && guidePath.length > 1) {
          const pts = guidePath.map(pt => viewerScreenPoint(pt, rect, layout));
          viewerGuidePath.setAttribute('points', pts.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' '));
          viewerGuidePath.classList.remove('off');
          if (viewerGuideDots) {
            viewerGuideDots.innerHTML = '';
            pts.forEach((pt, i) => {
              const c = svgEl('circle');
              c.setAttribute('class', 'viewer-guide-dot');
              c.setAttribute('cx', pt.x.toFixed(1));
              c.setAttribute('cy', pt.y.toFixed(1));
              c.setAttribute('r', i === 0 ? '5' : '6');
              viewerGuideDots.appendChild(c);
            });
          }
        } else {
          viewerGuidePath.setAttribute('points', '');
          viewerGuidePath.classList.add('off');
          if (viewerGuideDots) viewerGuideDots.innerHTML = '';
        }
      }

      if (viewerPreviewBtn) viewerPreviewBtn.textContent = `Ruta: ${viewerPreviewOn ? 'ON' : 'OFF'}`;
      if (ballViewerStatus) {
        ballViewerStatus.textContent = placingMode
          ? `Visor interactivo · zoom ${viewerZoom.toFixed(1)}x`
          : `En foco · ${focus ? focus.name : 'Blanca'} · zoom ${viewerZoom.toFixed(1)}x`;
      }
      if (ballViewerReadout && focus) {
        const px = Math.round(((focus.x - LEFT) / (RIGHT - LEFT)) * 100);
        const py = Math.round(((focus.y - TOP) / (BOTTOM - TOP)) * 100);
        const distCueYellow = Math.round(Math.hypot(ball('cue').x - ball('yellow').x, ball('cue').y - ball('yellow').y));
        const distCueRed = Math.round(Math.hypot(ball('cue').x - ball('red').x, ball('cue').y - ball('red').y));
        const ruta = viewerPreviewOn && guidePath ? ' · <span class="ok">ruta esperada visible</span>' : '';
        ballViewerReadout.innerHTML = `<strong>En foco:</strong> ${focus.name} · <span class="gold">X ${px}%</span> · <span class="gold">Y ${py}%</span> · Distancia blanca/amarilla: <span class="route">${distCueYellow}</span> · Distancia blanca/roja: <span class="route">${distCueRed}</span>${ruta}${placingMode ? ' · <span class="ok">arrastra aquí para ubicar con más precisión</span>' : ''}`;
      }
    }

    function beginViewerInteraction(evt) {
      const target = evt.target.closest('.viewer-ball');
      if (!target) return;
      viewerFocusBall = target.dataset.ballId || 'cue';
      updateBallViewer();
      if (evt.pointerType === 'mouse' && evt.button !== 0) return;
      if (!placingMode || shotActive || !allStopped()) return;
      evt.preventDefault();
      evt.stopPropagation();
      draggingViewerBall = viewerFocusBall;
      ballViewerStage.setPointerCapture?.(evt.pointerId);
      clearShotAfterPlacement();
      placeBallAt(draggingViewerBall, viewerPoint(evt));
      renderBalls();
    }

    function moveViewerInteraction(evt) {
      if (!draggingViewerBall) return;
      evt.preventDefault();
      evt.stopPropagation();
      clearShotAfterPlacement();
      placeBallAt(draggingViewerBall, viewerPoint(evt));
      renderBalls();
    }

    function endViewerInteraction(evt) {
      if (!draggingViewerBall) return;
      if (evt) {
        evt.preventDefault();
        evt.stopPropagation();
      }
      const moved = ball(draggingViewerBall);
      draggingViewerBall = null;
      clearShotAfterPlacement();
      renderBalls();
      if (moved) setGuideText(`<strong>${moved.name} ubicada desde el visor.</strong> Si hace falta, sigue ajustando en la mesa o en este mismo visor.`);
    }

    function updateFloatingControls() {
      const cue = ball('cue');
      const dirX = Math.cos(aimAngle);
      const dirY = Math.sin(aimAngle);
      const power = powerValue();
      const visualPct = Math.min(powerPct, EXTENDED_MAX_POWER_PCT);
      const back = 78 + visualPct * (isCoarse ? 1.46 : 1.26);
      const tipGap = 20;
      const tipX = cue.x - dirX * tipGap;
      const tipY = cue.y - dirY * tipGap;
      const handleX = cue.x - dirX * back;
      const handleY = cue.y - dirY * back;

      const hideAids = shotActive || placingMode || replayingMotion;

      cueStick.setAttribute('x1', tipX);
      cueStick.setAttribute('y1', tipY);
      cueStick.setAttribute('x2', handleX);
      cueStick.setAttribute('y2', handleY);
      cueStick.setAttribute('opacity', hideAids ? '0' : '1');
      cueTip.setAttribute('x1', tipX - dirY * 8);
      cueTip.setAttribute('y1', tipY + dirX * 8);
      cueTip.setAttribute('x2', tipX + dirY * 8);
      cueTip.setAttribute('y2', tipY - dirX * 8);
      cueTip.setAttribute('opacity', hideAids ? '0' : '1');
      cueHandle.setAttribute('cx', handleX);
      cueHandle.setAttribute('cy', handleY);
      cueHandle.setAttribute('opacity', hideAids ? '0' : '1');

      powerBadge.textContent = powerDisplayLabel(powerPct);
      const currentProfile = shotLengthProfile(practiceMode ? currentPracticeShot() : null);
      powerBadge.classList.toggle('long-shot-power', powerPct > NORMAL_MAX_POWER_PCT);
      powerBadge.classList.toggle('long-shot-needed', !!(currentProfile.isLong && powerPct < currentProfile.suggestedPower));
      powerBadge.style.left = toCssX(handleX);
      powerBadge.style.top = toCssY(handleY - 30);
      powerBadge.style.opacity = hideAids ? '0' : '1';

      let fx = cue.x + 74;
      let fy = cue.y;
      if (fx > RIGHT - 34) fx = cue.x - 74;
      fx = Math.max(LEFT + 34, Math.min(RIGHT - 34, fx));
      fy = Math.max(TOP + 34, Math.min(BOTTOM - 34, fy));
      effectControl.style.left = toCssX(fx);
      effectControl.style.top = toCssY(fy);
      effectControl.classList.toggle('hidden', hideAids);

      effectDot.style.left = `${effectDotPercent(effectX)}%`;
      effectDot.style.top = `${effectDotPercent(effectY)}%`;
      shootBtn.disabled = shotActive || !allStopped() || placingMode;
      if (demoBtn) {
        demoBtn.disabled = !practiceMode || shotActive || !allStopped() || placingMode;
        demoBtn.style.display = practiceMode ? 'inline-flex' : 'none';
      }
      placeBtn.disabled = shotActive || !allStopped();
      syncTableActionUI();
      syncReplayUI();
      syncGuideToggleUI();
      syncSquareCaromUI();
      updateAlignReadout();
      updateCueBallGuide();
      updateBallViewer();
      updateDeflectionGuide();
    }


    function syncFullscreenCompactLabels() {
      const compact = !!tableFullscreenMode;
      if (replayBtn) replayBtn.textContent = compact ? 'Repetir' : 'Repetir tiro';
      if (motionReplayBtn) motionReplayBtn.textContent = compact ? 'Replay' : 'Ver replay';
      if (exitPracticeBtn) exitPracticeBtn.textContent = compact ? 'Libre' : 'Modo libre';
      if (randomBtn) randomBtn.textContent = compact ? 'Nueva' : 'Nueva posición';
      if (demoBtn) demoBtn.textContent = compact ? 'Demo' : 'Demostración';
      if (guideBtn) guideBtn.textContent = compact ? `Guía ${guide ? 'ON' : 'OFF'}` : `Guía: ${guide ? 'ON' : 'OFF'}`;
      if (placeBtn) placeBtn.textContent = compact ? `Ubicar ${placingMode ? 'ON' : 'OFF'}` : `Ubicar bolas: ${placingMode ? 'ON' : 'OFF'}`;
      if (fullscreenTableBtn) fullscreenTableBtn.textContent = compact ? 'Salir' : 'Mesa completa';
      if (shootBtn) shootBtn.textContent = 'Tirar';
    }

    function syncTableFullscreenUI() {
      document.body.classList.toggle('table-fullscreen-mode', !!tableFullscreenMode);
      if (fullscreenTableBtn) {
        fullscreenTableBtn.textContent = tableFullscreenMode ? 'Salir mesa completa' : 'Mesa completa';
        fullscreenTableBtn.classList.toggle('fullscreen-on', !!tableFullscreenMode);
        fullscreenTableBtn.setAttribute('aria-pressed', tableFullscreenMode ? 'true' : 'false');
      }
      syncFullscreenCompactLabels();
      if (tvRemoteHint) {
        tvRemoteHint.textContent = tableFullscreenMode
          ? 'Control remoto: ◀ ▶ apunta · ▲ ▼ potencia · OK tira · Atrás sale'
          : 'TV: usa Mesa completa · ◀ ▶ apunta · ▲ ▼ potencia · OK tira';
      }
      requestAnimationFrame(() => {
        renderBalls();
        updateGuidesSoon();
      });
    }

    async function setTableFullscreen(enabled, announce = true) {
      const next = !!enabled;
      tableFullscreenMode = next;
      syncTableFullscreenUI();
      // v203: en Mesa completa el elemento en pantalla completa debe contener
      // también la barra inferior de acciones. Si se usa solo tableShell,
      // el botón Tirar queda fuera del fullscreen nativo en móviles/TV.
      const fsTarget = document.querySelector('.app') || document.documentElement;
      try {
        if (next && fsTarget && !document.fullscreenElement && fsTarget.requestFullscreen) {
          await fsTarget.requestFullscreen({ navigationUI: 'hide' });
        } else if (!next && document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (_) {
        // Google Sites o algunos navegadores móviles pueden bloquear Fullscreen API.
        // La clase CSS table-fullscreen-mode queda como modo pantalla completa compatible con iframe.
      }
      syncTableFullscreenUI();
      if (announce) {
        setGuideText(next
          ? '<strong>Mesa completa:</strong> modo activado. En móvil verás Jugada, Repetir y Guía en columna a la izquierda; Libre, Ubicar y Salir en columna a la derecha; la bola de efecto queda abajo a la izquierda y <span class="route">Tirar</span> queda grande abajo a la derecha, sin tapar los diamantes.'
          : '<strong>Mesa completa:</strong> modo normal activado.');
      }
    }

    function toggleTableFullscreen() {
      setTableFullscreen(!tableFullscreenMode, true);
      playSound('ui', .42);
    }

    function exitTableFullscreenIfActive() {
      if (!tableFullscreenMode) return false;
      setTableFullscreen(false, true);
      return true;
    }

    function markTvRemoteMode() {
      tvRemoteMode = true;
      document.body.classList.add('tv-remote-active');
      if (tvRemoteHint && tableFullscreenMode) tvRemoteHint.style.opacity = '1';
    }

    function clearCaromIllumination() {
      caromIlluminationActive = false;
      lastGuideIlluminationKey = '';
      if (successLine) {
        successLine.setAttribute('points', '');
        successLine.setAttribute('opacity', '0');
        successLine.classList.remove('success-active', 'success-base', 'success-free', 'guide-coincidence');
      }
      if (table) table.classList.remove('carom-success-lit', 'guide-coincidence-lit');
      Object.values(els || {}).forEach(el => el && el.classList.remove('carom-lit', 'guide-match-lit'));
      if (caromFlash) {
        caromFlash.classList.remove('show');
        caromFlash.setAttribute('aria-hidden', 'true');
      }
    }

    function illuminateGuideCoincidence(points = [], s = currentPracticeShot(), status = {}, options = {}) {
      if (caromIlluminationActive && !options.force) return;
      if (!options.force && (!guide || shotActive || replayingMotion || placingMode)) return;
      const pts = Array.isArray(points) ? points : [];
      if (pts.length < 2) return;
      const avg = Math.round(Number(status?.stats?.avg || 0));
      const strength = Math.round((Number(status?.strength ?? 1) || 0) * 100);
      const code = s?.code ? `Jugada ${s.code}` : 'Sistema propio';
      const key = `${s?.code || 'libre'}:${status?.source || 'guias'}:${avg}:${strength}`;
      if (successLine) {
        successLine.setAttribute('points', pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
        successLine.setAttribute('opacity', '1');
        successLine.classList.add('success-active', 'success-base', 'guide-coincidence');
        successLine.classList.remove('success-free');
      }
      if (table) table.classList.add('guide-coincidence-lit');
      const idsToLight = Array.isArray(status?.ballIds) && status.ballIds.length
        ? ['cue', ...status.ballIds]
        : ['cue', s?.first, s?.second].filter(Boolean);
      [...new Set(idsToLight.filter(Boolean))].forEach(id => els[id]?.classList.add('guide-match-lit'));
      if (caromFlash && key !== lastGuideIlluminationKey) {
        let detail = 'guía de tacada';
        if (status?.source === 'guia-base') detail = 'guía base';
        else if (status?.source === 'guia-predictiva') detail = `guía predictiva ${Number(status?.cushions || 0)}+ bandas`;
        else if (status?.source === 'prediccion-final') detail = `predicción final ${Number(status?.cushions || 0)}+ bandas`;
        else if (status?.source === 'sistema-propio') detail = `sistema propio ${Number(status?.cushions || 0)}+ bandas`;
        const flashTitle = status?.source === 'guia-base' ? 'Guías coinciden' : (status?.source === 'prediccion-final' ? 'Predicción final' : 'Guía iluminada');
        caromFlash.textContent = `${flashTitle} · ${code} · ${detail}`;
        caromFlash.setAttribute('aria-hidden', 'false');
        caromFlash.classList.remove('show');
        void caromFlash.offsetWidth;
        caromFlash.classList.add('show');
      }
      lastGuideIlluminationKey = key;
    }

    function clearGuideCoincidenceIllumination(keepFlash = true) {
      lastGuideIlluminationKey = '';
      if (caromIlluminationActive) {
        if (successLine) successLine.classList.remove('guide-coincidence');
        if (table) table.classList.remove('guide-coincidence-lit');
        Object.values(els || {}).forEach(el => el && el.classList.remove('guide-match-lit'));
        return;
      }
      if (successLine) {
        successLine.setAttribute('points', '');
        successLine.setAttribute('opacity', '0');
        successLine.classList.remove('success-active', 'success-base', 'success-free', 'guide-coincidence');
      }
      if (table) table.classList.remove('guide-coincidence-lit');
      Object.values(els || {}).forEach(el => el && el.classList.remove('guide-match-lit'));
      if (!keepFlash && caromFlash) {
        caromFlash.classList.remove('show');
        caromFlash.setAttribute('aria-hidden', 'true');
      }
    }

    function actualShotPathForIllumination() {
      const cue = ball('cue');
      let pts = Array.isArray(path) ? path.map(p => ({ x: p.x, y: p.y })) : [];
      if (cue) {
        const last = pts[pts.length - 1];
        if (!last || Math.hypot(cue.x - last.x, cue.y - last.y) > 2) pts.push({ x: cue.x, y: cue.y });
      }
      if (pts.length < 2 && Array.isArray(lastShotFrames) && lastShotFrames.length > 1) {
        pts = lastShotFrames
          .map(frame => frame.find(b => b.id === 'cue'))
          .filter(Boolean)
          .map(b => ({ x: b.x, y: b.y }));
      }
      return pts.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    }

    function illuminateScoredCarom({ expected = null, alternative = false } = {}) {
      const pts = actualShotPathForIllumination();
      caromIlluminationActive = true;
      if (successLine && pts.length > 1) {
        successLine.setAttribute('points', pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
        successLine.setAttribute('opacity', '1');
        successLine.classList.add('success-active', alternative ? 'success-free' : 'success-base');
        successLine.classList.remove('guide-coincidence');
      }
      if (table) {
        table.classList.add('carom-success-lit');
        table.classList.remove('guide-coincidence-lit');
      }
      Object.values(els || {}).forEach(el => el && el.classList.remove('guide-match-lit'));
      const ids = ['cue', 'red', 'yellow', expected?.first, expected?.second, shot.firstTarget, shot.secondTarget]
        .filter(Boolean);
      [...new Set(ids)].forEach(id => els[id]?.classList.add('carom-lit'));
      if (caromFlash) {
        const modeText = alternative ? '¡Carambola alternativa iluminada!' : '¡Carambola lograda!';
        const codeText = expected?.code ? ` · Jugada ${expected.code}` : ' · Modo libre';
        caromFlash.textContent = `${modeText}${codeText}`;
        caromFlash.setAttribute('aria-hidden', 'false');
        caromFlash.classList.remove('show');
        void caromFlash.offsetWidth;
        caromFlash.classList.add('show');
      }
      shot.illuminated = true;
    }

    function countedCushionsForHUD() {
      return Number.isFinite(shot.scoringCushions) ? shot.scoringCushions : shot.cushions;
    }

    function shouldCountCueRail() {
      // Solo se cuentan bandas mientras la blanca va camino a completar la carambola.
      // En el instante en que toca la segunda bola se bloquea el conteo; si la blanca
      // sigue rodando después, esas bandas ya no pertenecen a la jugada válida.
      return shotActive && !shotResolved && !shot.caromLocked && !shot.secondTarget && !Number.isFinite(shot.scoringCushions);
    }

    function lockCushionsAtCarom() {
      if (!Number.isFinite(shot.scoringCushions)) shot.scoringCushions = shot.cushions;
      shot.caromLocked = true;
      return shot.scoringCushions;
    }

    function updateHUD() {
      scoreEl.textContent = score;
      attemptsEl.textContent = attempts;
      cushionsEl.textContent = countedCushionsForHUD();
    }

    function syncPlacementUI() {
      table.classList.toggle('placing', placingMode && !shotActive);
      placeBtn.textContent = `Ubicar bolas: ${placingMode ? 'ON' : 'OFF'}`;
      placeBtn.classList.toggle('place-on', placingMode);
      syncFullscreenCompactLabels();
    }

    function clearShotAfterPlacement() {
      clearReplayShot();
      stopAllBalls();
      shot.cushions = 0;
      shot.scoringCushions = null;
      shot.caromLocked = false;
      shot.hitTargets = new Set();
      shot.activeRails = new Set();
      shot.activePairs = new Set();
      shot.firstTarget = null;
      shot.secondTarget = null;
      shot.result = null;
      shot.spin = { x: 0, y: 0 };
      shot.demoMode = false;
      shot.shotSource = 'libre';
      shot.illuminated = false;
      clearCaromIllumination();
      shotActive = false;
      shotResolved = false;
      path = [];
      pathLine.setAttribute('points', '');
      aimPreview.setAttribute('points', '');
      aimPreview.setAttribute('opacity', '0');
      clearMasterGuideLine();
      recommendationLine.setAttribute('points', '');
      recommendationLine.setAttribute('opacity', '0');
      recommendationEvents.innerHTML = '';
      clearPracticeMarkers();
      updateHUD();
    }

    function setPlacementMode(on, announce = true) {
      if (shotActive || replayingMotion || !allStopped()) return;
      placingMode = !!on;
      draggingCue = false;
      draggingEffect = false;
      draggingPlaceBall = null;
      lastShootTap = 0;
      lastShootTapPoint = null;
      clearShotAfterPlacement();
      syncPlacementUI();
      renderBalls();
      if (announce) {
        if (placingMode) setGuideText('<strong>Ubicar bolas activado:</strong> toca y arrastra cualquier bola hasta donde la quieras. Las bolas no se pueden montar una encima de otra. Cuando termines, toca <span class="route">Ubicar bolas: ON</span> para volver a tirar.');
        else { setGuideText('<strong>Ubicación guardada:</strong> ya puedes apuntar, ajustar potencia/efecto y tirar.'); updateGuidesSoon(); }
      }
    }

    function nearestBallAt(point) {
      let best = null;
      let bestDist = Infinity;
      const limit = isCoarse ? 58 : 42;
      for (const b of balls) {
        const d = Math.hypot(point.x - b.x, point.y - b.y);
        if (d < bestDist) { best = b; bestDist = d; }
      }
      return best && bestDist <= limit ? best : null;
    }

    function placeBallAt(id, point) {
      const b = ball(id);
      if (!b) return;
      let x = clamp(point.x, LEFT + R, RIGHT - R);
      let y = clamp(point.y, TOP + R, BOTTOM - R);
      const minDist = R * 2 + 6;
      for (let iter = 0; iter < 6; iter++) {
        for (const other of balls) {
          if (other.id === id) continue;
          let dx = x - other.x;
          let dy = y - other.y;
          let dist = Math.hypot(dx, dy);
          if (dist < minDist) {
            if (dist < 0.01) { dx = 1; dy = 0; dist = 1; }
            x = other.x + dx / dist * minDist;
            y = other.y + dy / dist * minDist;
            x = clamp(x, LEFT + R, RIGHT - R);
            y = clamp(y, TOP + R, BOTTOM - R);
          }
        }
      }
      b.x = x;
      b.y = y;
      b.vx = 0;
      b.vy = 0;
    }

    function resetShotState() {
      practiceVideoMotion = null;
      shot.cushions = 0;
      shot.scoringCushions = null;
      shot.caromLocked = false;
      shot.hitTargets = new Set();
      shot.activeRails = new Set();
      shot.activePairs = new Set();
      shot.firstTarget = null;
      shot.secondTarget = null;
      shot.result = null;
      shot.spin = { x: 0, y: 0 };
      shot.demoMode = false;
      shot.shotSource = 'libre';
      shot.illuminated = false;
      clearCaromIllumination();
      shotActive = false;
      shotResolved = false;
      path = [];
      pathLine.setAttribute('points', '');
      hideCueProjectionGuide();
      updateHUD();
      renderBalls();
      updateGuidesSoon();
    }



    function cancelCurrentShotForPracticeChange() {
      // Permite cambiar de jugada de inmediato, aunque la anterior esté rodando.
      // Se cancela cualquier animación/tacada activa y se carga la nueva posición sin esperar.
      practiceVideoMotion = null;
      replayingMotion = false;
      if (replayAnimationId) {
        cancelAnimationFrame(replayAnimationId);
        replayAnimationId = 0;
      }
      draggingCue = false;
      draggingEffect = false;
      draggingPlaceBall = null;
      lastShootTap = 0;
      lastShootTapPoint = null;
      stopAllBalls();
      resetShotState();
    }

    function resetTable() {
      balls = cloneBalls(defaultBalls);
      attempts = 0;
      score = 0;
      aimLocked = false;
      effectLocked = false;
      powerLocked = false;
      placingMode = false;
      practiceMode = false;
      deflectionGuideMode = null;
      lastPracticeFeedback = '';
      clearReplayShot();
      clearPracticeMarkers();
      syncPracticeUI();
      syncPlacementUI();
      setMode('libre', false);
      resetShotState();
      setGuideText('<strong>Listo:</strong> motor profesional v212 activo: 148 jugadas activas, guía principal persistente, iluminación final por predicción de 3+ bandas, video móvil optimizado para Android/iOS y Mesa completa móvil con controles finales fuera de la mesa: Jugada/Repetir/Guía a la izquierda, Libre/Ubicar/Salir a la derecha, bola de efecto abajo a la izquierda y Tirar grande abajo a la derecha con diamantes visibles. La ruta verde de la jugada queda visible antes, durante y después de atacar; si ajustas manualmente, la línea amarilla puede mostrar la física libre sin borrar la guía principal.');
    }

    function randomTable() {
      const positions = [];
      function place() {
        let x = 0, y = 0, ok = false, guard = 0;
        while (!ok && guard < 600) {
          x = LEFT + R + 30 + Math.random() * (RIGHT - LEFT - 2 * R - 60);
          y = TOP + R + 30 + Math.random() * (BOTTOM - TOP - 2 * R - 60);
          ok = positions.every(p => Math.hypot(x - p.x, y - p.y) > R * 8);
          guard++;
        }
        positions.push({ x, y });
        return { x, y };
      }
      balls = cloneBalls(defaultBalls);
      for (const b of balls) {
        const p = place();
        b.x = p.x; b.y = p.y; b.vx = 0; b.vy = 0;
      }
      aimLocked = false;
      effectLocked = false;
      powerLocked = false;
      placingMode = false;
      practiceMode = false;
      deflectionGuideMode = null;
      lastPracticeFeedback = '';
      clearReplayShot();
      clearPracticeMarkers();
      syncPracticeUI();
      syncPlacementUI();
      setMode('libre', false);
      resetShotState();
      setGuideText('<strong>Nueva posición:</strong> ajusta libremente taco, efecto y potencia al mismo tiempo.');
    }

    function setGuideText(html) {
      if (!guideEl) return;
      guideEl.innerHTML = html;
    }

    function eventLabel(e) {
      if (e.type === 'target') return e.order === 1 ? `1ª bola ${e.name}` : `2ª bola ${e.name}`;
      return `B${e.n} banda ${e.name}`;
    }

    function hideCueProjectionGuide() {
      cueProjectionLine.setAttribute('opacity', '0');
      cueBallGuide.setAttribute('opacity', '0');
    }

    function updateCueProjectionLine(points) {
      if (!points || points.length < 2 || shotActive || placingMode || replayingMotion) {
        cueProjectionLine.setAttribute('opacity', '0');
        return;
      }
      const cue = ball('cue');
      if (!cue) {
        cueProjectionLine.setAttribute('opacity', '0');
        return;
      }
      let target = points[1];
      for (const p of points) {
        if (Math.hypot(p.x - cue.x, p.y - cue.y) >= 56) {
          target = p;
          break;
        }
      }
      cueProjectionLine.setAttribute('x1', cue.x.toFixed(1));
      cueProjectionLine.setAttribute('y1', cue.y.toFixed(1));
      cueProjectionLine.setAttribute('x2', target.x.toFixed(1));
      cueProjectionLine.setAttribute('y2', target.y.toFixed(1));
      cueProjectionLine.setAttribute('opacity', '1');
    }

    function updateCueBallGuide() {
      const cue = ball('cue');
      if (!cue || shotActive || placingMode || replayingMotion) {
        cueBallGuide.setAttribute('opacity', '0');
        return;
      }
      const ang = Number.isFinite(aimAngle) ? aimAngle : 0;
      const radius = Math.max(R + 7, 19);
      const axisHalf = radius + 11;
      const crossHalf = Math.max(7, radius * 0.36);
      const dirX = Math.cos(ang);
      const dirY = Math.sin(ang);
      const perX = -dirY;
      const perY = dirX;
      const spinRange = Math.max(6, radius - 7);
      const dotX = cue.x + clamp(effectX, -100, 100) / 100 * spinRange * 0.74;
      const dotY = cue.y + clamp(effectY, -100, 100) / 100 * spinRange * 0.74;

      cueGuideRing.setAttribute('cx', cue.x.toFixed(1));
      cueGuideRing.setAttribute('cy', cue.y.toFixed(1));
      cueGuideRing.setAttribute('r', radius.toFixed(1));
      cueGuideAxis.setAttribute('x1', (cue.x - dirX * axisHalf).toFixed(1));
      cueGuideAxis.setAttribute('y1', (cue.y - dirY * axisHalf).toFixed(1));
      cueGuideAxis.setAttribute('x2', (cue.x + dirX * axisHalf).toFixed(1));
      cueGuideAxis.setAttribute('y2', (cue.y + dirY * axisHalf).toFixed(1));
      cueGuideCross.setAttribute('x1', (cue.x - perX * crossHalf).toFixed(1));
      cueGuideCross.setAttribute('y1', (cue.y - perY * crossHalf).toFixed(1));
      cueGuideCross.setAttribute('x2', (cue.x + perX * crossHalf).toFixed(1));
      cueGuideCross.setAttribute('y2', (cue.y + perY * crossHalf).toFixed(1));
      cueGuideSpinDot.setAttribute('cx', dotX.toFixed(1));
      cueGuideSpinDot.setAttribute('cy', dotY.toFixed(1));
      cueGuideSpinDot.setAttribute('r', Math.max(4.5, radius * 0.22).toFixed(1));
      cueBallGuide.setAttribute('opacity', '1');
    }

    function svgEl(tag) { return document.createElementNS('http://www.w3.org/2000/svg', tag); }


    function hideReferenceGuideImage() {
      if (!referenceGuideImage) return;
      referenceGuideImage.setAttribute('opacity', '0');
      referenceGuideImage.setAttribute('href', '');
      referenceGuideImage.removeAttributeNS?.('http://www.w3.org/1999/xlink', 'href');
    }

    function showReferenceGuideImage(shot) {
      if (!referenceGuideImage || !shot || !shot.referenceGuideImage) return false;
      referenceGuideImage.setAttribute('href', shot.referenceGuideImage);
      referenceGuideImage.setAttributeNS?.('http://www.w3.org/1999/xlink', 'href', shot.referenceGuideImage);
      referenceGuideImage.setAttribute('opacity', '1');
      return true;
    }

    function setMasterGuideLine(points, active = false) {
      if (!masterGuideLine) return;
      if (!Array.isArray(points) || points.length < 2) {
        masterGuideLine.setAttribute('points', '');
        masterGuideLine.setAttribute('opacity', '0');
        masterGuideLine.classList.remove('guide-main-active', 'guide-magnet-active');
        return;
      }
      masterGuideLine.setAttribute('points', points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
      masterGuideLine.setAttribute('opacity', '1');
      masterGuideLine.classList.toggle('guide-main-active', !!active);
    }

    function clearMasterGuideLine() { setMasterGuideLine(null, false); }

    function masterGuidePointsForPractice(s = currentPracticeShot()) {
      if (!practiceMode || !s || !Array.isArray(s.guidePath) || s.guidePath.length < 2) return null;
      const pts = buildPlayablePracticePath(s);
      return Array.isArray(pts) && pts.length >= 2 ? pts : null;
    }

    function keepPracticeMasterGuideVisible(s = currentPracticeShot()) {
      // v181: la guía principal verde queda fija en modo práctica.
      // No depende de si el usuario está apuntando, arrastrando el taco o si la bola ya salió.
      if (!guide || !practiceMode || placingMode) {
        clearMasterGuideLine();
        return null;
      }
      const pts = masterGuidePointsForPractice(s);
      if (!pts) {
        clearMasterGuideLine();
        return null;
      }
      setMasterGuideLine(pts, true);
      return pts;
    }

    function updateGuidesSoon() {
      if (guide) renderPracticeMarkers();
      else clearPracticeMarkers();
      syncGuideToggleUI();
      updateDeflectionGuide();
      updateContactViewer();
      if (placingMode) {
        aimPreview.setAttribute('points', '');
        aimPreview.setAttribute('opacity', '0');
        clearMasterGuideLine();
        hideCueProjectionGuide();
        recommendationLine.setAttribute('points', '');
        recommendationLine.setAttribute('opacity', '0');
        recommendationEvents.innerHTML = '';
        hideReferenceGuideImage();
        return;
      }
      if (!guide) {
        hideReferenceGuideImage();
        clearMasterGuideLine();
        return;
      }
      if (shotActive) {
        keepPracticeMasterGuideVisible();
        return;
      }
      if (rafGuide) cancelAnimationFrame(rafGuide);
      rafGuide = requestAnimationFrame(() => {
        rafGuide = 0;
        renderAimPreview();
        renderRecommendation();
      });
    }

    function renderAimPreview() {
      if (!guide || shotActive) {
        aimPreview.setAttribute('points', '');
        aimPreview.setAttribute('opacity', '0');
        if (guide && shotActive && practiceMode) keepPracticeMasterGuideVisible();
        else clearMasterGuideLine();
        hideCueProjectionGuide();
        return;
      }

      if (practiceMode) {
        const s = currentPracticeShot();
        keepPracticeMasterGuideVisible(s);
        const master = renderMasterGuideIfArmed(s);
        if (master) {
          setMasterGuideLine(master.points, true);
          aimPreview.setAttribute('points', master.points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
          aimPreview.setAttribute('opacity', '1');
          aimPreview.classList.remove('magnet-active');
          if (masterGuideLine) masterGuideLine.classList.add('guide-magnet-active');
          illuminateGuideCoincidence(master.points, s, { source: 'guia-base', strength: 1, stats: { avg: 0 } });
          updateCueProjectionLine(master.points);
          updateCueBallGuide();
          if (lastPracticeFeedback && shotResolved && (shot.result === 'point' || shot.result === 'miss')) {
            setGuideText(`<strong>${s.title}</strong> — ${s.focus}<br><strong>Resultado de la tacada:</strong>${lastPracticeFeedback}<br><span class="route">Ruta objetivo:</span> ${s.route}.`);
          } else {
            setGuideText(`<strong>${s.title}</strong> — ${s.focus}<br><strong>Guía maestra sincronizada:</strong> la línea punteada es la referencia exacta del video. Al tocar <span class="route">Tirar</span>, la salida se asistirá pero se resolverá con física real, no como línea automática.<br><span class="route">Ruta objetivo:</span> ${s.route}.${longShotHint(s)}${lastPracticeFeedback}`);
          }
          return;
        }
      }

      if (!practiceMode) clearMasterGuideLine();
      else keepPracticeMasterGuideVisible();
      const power = powerValue();
      const vx = Math.cos(aimAngle) * power;
      const vy = Math.sin(aimAngle) * power;
      const sim = simulateShot(vx, vy, currentSpin(), 1200);
      const activeShotDef = practiceMode ? currentPracticeShot() : null;
      const magnet = practiceMode ? magneticGuideStatus(activeShotDef, sim) : { ok: false };
      const predictive = predictiveCaromGuideStatus(sim, activeShotDef);
      const previewPoints = sim.points;
      aimPreview.setAttribute('points', previewPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
      aimPreview.setAttribute('opacity', previewPoints.length > 1 ? '1' : '0');
      aimPreview.classList.toggle('magnet-active', !!magnet.ok);
      if (masterGuideLine) masterGuideLine.classList.toggle('guide-magnet-active', !!magnet.ok);
      if (magnet.ok) {
        illuminateGuideCoincidence(magnet.masterPoints || previewPoints, activeShotDef, { source: 'coincidencia', strength: magnet.strength, stats: magnet.stats, ballIds: predictive.ballIds });
      } else if (predictive.ok) {
        const src = practiceMode ? 'guia-predictiva' : 'sistema-propio';
        illuminateGuideCoincidence(previewPoints, activeShotDef, { source: src, strength: 1, stats: { avg: 0 }, cushions: predictive.cushions, ballIds: predictive.ballIds });
      } else {
        clearGuideCoincidenceIllumination(true);
      }
      updateCueProjectionLine(previewPoints);
      updateCueBallGuide();

      const route = sim.events.length ? sim.events.slice(0, 7).map(eventLabel).join(' → ') : 'sin contactos todavía';
      let verdict = '<span class="bad">buscando carambola</span>';
      if (sim.secondTarget && sim.secondTarget.cushions >= 3) verdict = '<span class="ok">posible punto</span>';
      else if (sim.secondTarget) verdict = '<span class="bad">faltan bandas</span>';
      else if (sim.firstTarget) verdict = '<span class="bad">falta la segunda bola</span>';
      const shotDir = directionName(Math.cos(aimAngle), Math.sin(aimAngle));
      if (practiceMode) {
        const s = currentPracticeShot();
        const status = exactVideoGuideArmedStatus(s);
        const syncWarn = status.reason === 'selección libre'
          ? '<br><span class="route">Selección libre:</span> la guía verde es referencia; la tacada amarilla inicia separada para que el jugador la ajuste. Acércate a la ruta y el imán se activará.'
          : (status.reason === 'ajuste manual detectado'
            ? '<br><span class="bad">Guía maestra desactivada por ajuste manual:</span> ahora la línea muestra la física real del taco actual. Toca <span class="route">Efecto</span> o ajusta taco/potencia hasta acercarte a la guía para volver a sincronizar con el video.'
            : '');
        if (lastPracticeFeedback && shotResolved && (shot.result === 'point' || shot.result === 'miss')) {
          setGuideText(`<strong>${s.title}</strong> — ${s.focus}<br><strong>Resultado de la tacada:</strong>${lastPracticeFeedback}<br><span class="route">Ruta objetivo:</span> ${s.route}.`);
        } else {
          const magnetText = guideMagnetDisplayText(magnet);
          setGuideText(`<strong>${s.title}</strong> — ${s.focus}<br><strong>Tiro preparado:</strong> ${magnet.ok ? '<span class="ok">imán físico listo</span>' : verdict}. Salida hacia <strong>${shotDir}</strong>, fuerza <strong>${powerDisplayLabel(powerPct)}</strong>, ${spinText()}.<br><span class="route">Ruta física actual:</span> ${route}. <span class="route">Objetivo:</span> ${s.route}.${longShotHint(s)}${syncWarn}${magnetText}${lastPracticeFeedback}`);
        }
      } else {
        setGuideText(`<strong>${modeTitle()}:</strong> ${modeInstruction()}<br><strong>Tiro preparado:</strong> ${verdict}. Salida hacia <strong>${shotDir}</strong>, fuerza <strong>${powerDisplayLabel(powerPct)}</strong>, ${spinText()}.<br><span class="route">Ruta actual:</span> ${route}.`);
      }
    }

    function renderRecommendation() {
      recommendationLine.setAttribute('points', '');
      recommendationLine.setAttribute('opacity', '0');
      recommendationEvents.innerHTML = '';
      hideReferenceGuideImage();
      if (!guide || shotActive || !practiceMode) return;
      const s = currentPracticeShot();
      // v181: la guía principal verde permanece visible siempre en modo práctica.
      // La línea amarilla puede ser ruta maestra o predicción física, pero no borra la referencia principal.
      if (deflectionGuideMode === 'imagen') return;
      if (!s.guidePath || s.guidePath.length < 2) return;
      recommendationLine.setAttribute('points', s.guidePath.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
      recommendationLine.setAttribute('opacity', '1');
      s.guidePath.forEach((p, index) => {
        const g = svgEl('g');
        g.setAttribute('class', 'rec-event');
        const c = svgEl('circle');
        c.setAttribute('cx', p.x.toFixed(1));
        c.setAttribute('cy', p.y.toFixed(1));
        c.setAttribute('r', index === 0 ? '8' : '10');
        const t = svgEl('text');
        t.setAttribute('x', p.x.toFixed(1));
        t.setAttribute('y', p.y.toFixed(1));
        t.textContent = index === 0 ? 'I' : String(index);
        g.appendChild(c);
        g.appendChild(t);
        recommendationEvents.appendChild(g);
      });
    }

    function computeBestRecommendation() {
      const power = powerValue();
      const spin = currentSpin();
      let best = null;
      for (let deg = 0; deg < 360; deg += 10) {
        const rad = deg * Math.PI / 180;
        const vx = Math.cos(rad) * power;
        const vy = Math.sin(rad) * power;
        const sim = simulateShot(vx, vy, spin, 470);
        let value = sim.cushions * 4;
        if (sim.firstTarget) value += 90;
        if (sim.secondTarget) {
          value += 450 + sim.secondTarget.cushions * 80;
          if (sim.secondTarget.cushions >= 3) value += 5000;
        }
        if (sim.firstTarget && !sim.secondTarget) value += Math.min(sim.cushions, 5) * 45;
        if (!best || value > best.value) best = { value, deg, vx, vy, sim };
      }
      return best;
    }

    function setEffectFromPoint(evt) {
      const rect = effectBall.getBoundingClientRect();
      const p = evt.touches && evt.touches[0] ? evt.touches[0] : evt;
      const x = ((p.clientX - rect.left) / rect.width - .5) * 200;
      const y = ((p.clientY - rect.top) / rect.height - .5) * 200;
      releaseSelectionGuideLock();
      const next = clampEffect(x, y);
      effectX = next.x;
      effectY = next.y;
      markModeDone('efecto');
      updateFloatingControls();
      updateGuidesSoon();
    }

    function beginPlaceBall(evt) {
      if (evt.pointerType === 'mouse' && evt.button !== 0) return;
      if (!placingMode || shotActive || !allStopped()) return;
      evt.preventDefault();
      evt.stopPropagation();
      const p = pointerPoint(evt);
      const selected = nearestBallAt(p);
      if (!selected) {
        setGuideText('<strong>Ubicar bolas:</strong> toca directamente la bola que quieres mover y arrástrala.');
        return;
      }
      draggingPlaceBall = selected.id;
      table.setPointerCapture?.(evt.pointerId);
      clearShotAfterPlacement();
      placeBallAt(draggingPlaceBall, p);
      renderBalls();
    }

    function movePlaceBall(evt) {
      if (!draggingPlaceBall) return;
      evt.preventDefault();
      evt.stopPropagation();
      clearShotAfterPlacement();
      placeBallAt(draggingPlaceBall, pointerPoint(evt));
      renderBalls();
    }

    function endPlaceBall(evt) {
      if (!draggingPlaceBall) return;
      if (evt) { evt.preventDefault(); evt.stopPropagation(); }
      const moved = ball(draggingPlaceBall);
      draggingPlaceBall = null;
      clearShotAfterPlacement();
      renderBalls();
      const name = moved ? moved.name : 'bola';
      setGuideText(`<strong>${name} ubicada.</strong> Puedes seguir moviendo bolas o desactivar <span class="route">Ubicar bolas</span> para tirar.`);
    }

    function setCueFromPoint(evt) {
      if (shotActive || replayingMotion || !allStopped()) return;
      const cue = ball('cue');
      const p = pointerPoint(evt);
      const dx = cue.x - p.x;
      const dy = cue.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 14) return;

      releaseSelectionGuideLock();
      aimAngle = Math.atan2(dy, dx);
      powerPct = powerPctFromPullDistance(dist);
      markModeDone('taco');
      markModeDone('potencia');

      updateFloatingControls();
      updateGuidesSoon();
    }

    function pointerInEffectControl(evt) {
      if (!effectControl || !effectBall || effectControl.classList.contains('hidden')) return false;
      const src = evt.touches && evt.touches[0] ? evt.touches[0] : (evt.changedTouches && evt.changedTouches[0] ? evt.changedTouches[0] : evt);
      if (!src || !Number.isFinite(src.clientX) || !Number.isFinite(src.clientY)) return false;
      const rect = effectBall.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = rect.width / 2;
      const ry = rect.height / 2;
      const nx = (src.clientX - cx) / Math.max(rx, 1);
      const ny = (src.clientY - cy) / Math.max(ry, 1);
      return (nx * nx + ny * ny) <= 1.10;
    }

    function beginCue(evt) {
      if (placingMode) { beginPlaceBall(evt); return; }
      if (evt.pointerType === 'mouse' && evt.button !== 0) return;
      if (effectControl.contains(evt.target) || pointerInEffectControl(evt)) { beginEffect(evt); return; }
      if (shotActive || replayingMotion || !allStopped()) return;
      evt.preventDefault();
      draggingCue = true;
      cuePointerStart = pointerPoint(evt);
      cuePointerMaxMove = 0;
      table.setPointerCapture?.(evt.pointerId);
      setCueFromPoint(evt);
    }

    function moveCue(evt) {
      if (draggingPlaceBall) { movePlaceBall(evt); return; }
      if (!draggingCue) return;
      evt.preventDefault();
      if (cuePointerStart) {
        const p = pointerPoint(evt);
        cuePointerMaxMove = Math.max(cuePointerMaxMove, Math.hypot(p.x - cuePointerStart.x, p.y - cuePointerStart.y));
      }
      setCueFromPoint(evt);
    }

    function registerDoubleShootTap(evt) {
      if (placingMode || shotActive || replayingMotion || !allStopped()) return;
      if (effectControl.contains(evt.target) || pointerInEffectControl(evt)) return;
      if (cuePointerMaxMove > (isCoarse ? 24 : 14)) {
        lastShootTap = 0;
        lastShootTapPoint = null;
        return;
      }
      const now = performance.now();
      const p = pointerPoint(evt);
      const close = lastShootTapPoint && Math.hypot(p.x - lastShootTapPoint.x, p.y - lastShootTapPoint.y) < (isCoarse ? 62 : 38);
      if (lastShootTap && now - lastShootTap < 360 && close) {
        lastShootTap = 0;
        lastShootTapPoint = null;
        draggingCue = false;
        shoot();
      } else {
        lastShootTap = now;
        lastShootTapPoint = p;
      }
    }

    function endCue(evt) {
      if (draggingPlaceBall) { endPlaceBall(evt); return; }
      if (!draggingCue) return;
      if (evt) registerDoubleShootTap(evt);
      draggingCue = false;
      cuePointerStart = null;
      cuePointerMaxMove = 0;
    }

    function shootByDoubleClick(evt) {
      if (placingMode || replayingMotion) return;
      if (effectControl.contains(evt.target) || pointerInEffectControl(evt)) return;
      evt.preventDefault();
      draggingCue = false;
      shoot();
    }

    function beginEffect(evt) {
      if (placingMode) return;
      if (shotActive || replayingMotion || !allStopped()) return;
      evt.preventDefault();
      evt.stopPropagation();
      draggingEffect = true;
      const captureEl = evt.currentTarget || effectDot || effectBall;
      captureEl.setPointerCapture?.(evt.pointerId);
      setEffectFromPoint(evt);
    }

    function moveEffect(evt) {
      if (!draggingEffect) return;
      evt.preventDefault();
      evt.stopPropagation();
      setEffectFromPoint(evt);
    }

    function endEffect() { draggingEffect = false; }

    function prepareShotState(message = '', options = {}) {
      const cue = ball('cue');
      const countAttempt = options.countAttempt !== false;
      lastPracticeFeedback = '';
      lastShotSnapshot = makeShotSnapshot();
      currentShotFrames = [];
      lastShotFrames = [];
      captureShotFrame(true);
      const predictiveGuide = options.predictiveGuide && options.predictiveGuide.ok ? options.predictiveGuide : null;
      const keepPredictiveGuideLight = !!predictiveGuide || !!(successLine && successLine.classList.contains('guide-coincidence'));
      if (!keepPredictiveGuideLight) clearCaromIllumination();
      else {
        clearCaromIllumination();
        if (predictiveGuide) illuminateGuideCoincidence(predictiveGuide.points, predictiveGuide.practiceShot || currentPracticeShot(), predictiveGuide.status || { source: 'prediccion-final' }, { force: true });
        else if (table) table.classList.add('guide-coincidence-lit');
        Object.values(els || {}).forEach(el => el && el.classList.remove('carom-lit'));
      }
      setReplayReady(false);
      syncMotionReplayUI();
      if (countAttempt) attempts++;
      shot.cushions = 0;
      shot.scoringCushions = null;
      shot.caromLocked = false;
      shot.hitTargets = new Set();
      shot.activeRails = new Set();
      shot.activePairs = new Set();
      shot.firstTarget = null;
      shot.secondTarget = null;
      shot.result = null;
      const activePractice = practiceMode ? currentPracticeShot() : null;
      const activeProfile = shotLengthProfile(activePractice);
      shot.powerPct = powerPct;
      shot.routeLength = activeProfile.length;
      const shotPower = powerValue();
      shot.longShotMode = longShotModeForCurrentSetup(Math.cos(aimAngle) * shotPower, Math.sin(aimAngle) * shotPower, activePractice);
      shot.spin = currentSpin();
      shot.demoMode = !!options.demoMode;
      shot.shotSource = options.shotSource || (practiceMode ? 'jugada-libre' : 'libre');
      shot.illuminated = false;
      shot.predictiveIllumination = predictiveGuide ? {
        ...predictiveGuide,
        points: predictiveGuide.points.map(p => ({ x: p.x, y: p.y })),
        status: { ...(predictiveGuide.status || {}) }
      } : null;
      shot.professionalPhysics = PROFESSIONAL_PHYSICS_VERSION;
      shotActive = true;
      shotResolved = false;
      path = [{ x: cue.x, y: cue.y }];
      pathLine.setAttribute('points', '');
      aimPreview.setAttribute('points', '');
      aimPreview.setAttribute('opacity', '0');
      if (practiceMode && guide) keepPracticeMasterGuideVisible(activePractice);
      else clearMasterGuideLine();
      recommendationLine.setAttribute('points', '');
      recommendationLine.setAttribute('opacity', '0');
      recommendationEvents.innerHTML = '';
      if (message) setGuideText(message);
      updateHUD();
      updateFloatingControls();
    }

    function cloneGuidePoint(pt) {
      return { x: clamp(pt.x, LEFT + R, RIGHT - R), y: clamp(pt.y, TOP + R, BOTTOM - R) };
    }

    function buildPlayablePracticePath(s) {
      const cue = ball('cue');
      const first = ball(s.first);
      const second = ball(s.second);
      const source = Array.isArray(s.guidePath) && s.guidePath.length > 2
        ? s.guidePath.map(cloneGuidePoint)
        : [{ x: cue.x, y: cue.y }, { x: first.x, y: first.y }, { x: second.x, y: second.y }];

      if (s && s.exactGuidePath && cue) {
        const literal = source.map(cloneGuidePoint);
        if (!literal.length) literal.push({ x: cue.x, y: cue.y });
        if (!literal.length || Math.hypot(literal[0].x - cue.x, literal[0].y - cue.y) > 22) {
          literal.unshift({ x: cue.x, y: cue.y });
        } else {
          literal[0] = { x: cue.x, y: cue.y };
        }
        const cleanedLiteral = [];
        for (const p of literal) {
          if (!cleanedLiteral.length || Math.hypot(cleanedLiteral[cleanedLiteral.length - 1].x - p.x, cleanedLiteral[cleanedLiteral.length - 1].y - p.y) > 5) cleanedLiteral.push(p);
        }
        return cleanedLiteral;
      }

      source[0] = { x: cue.x, y: cue.y };
      const closest = (target, start = 0) => {
        let best = -1, bestDist = Infinity;
        for (let i = Math.max(0, start); i < source.length; i++) {
          const d = Math.hypot(source[i].x - target.x, source[i].y - target.y);
          if (d < bestDist) { best = i; bestDist = d; }
        }
        return { index: best, distance: bestDist };
      };
      if (first) {
        const found = closest(first, 1);
        if (found.index < 0 || found.distance > 54) source.splice(1, 0, { x: first.x, y: first.y });
        else source[found.index] = { x: first.x, y: first.y };
      }
      if (second) {
        const startSecond = first ? Math.max(2, closest(first, 1).index + 1) : 1;
        const found = closest(second, startSecond);
        if (found.index < 0 || found.distance > 54) source.push({ x: second.x, y: second.y });
        else if (found.index !== source.length - 1) {
          source.splice(found.index, 1);
          source.push({ x: second.x, y: second.y });
        } else source[found.index] = { x: second.x, y: second.y };
      }

      const cleaned = [];
      for (const p of source.map(cloneGuidePoint)) {
        if (!cleaned.length || Math.hypot(cleaned[cleaned.length - 1].x - p.x, cleaned[cleaned.length - 1].y - p.y) > 5) cleaned.push(p);
      }
      return cleaned;
    }

    function findNearestRailName(pt) {
      const candidates = [
        ['izquierda', Math.abs(pt.x - (LEFT + R))],
        ['derecha', Math.abs(pt.x - (RIGHT - R))],
        ['superior', Math.abs(pt.y - (TOP + R))],
        ['inferior', Math.abs(pt.y - (BOTTOM - R))]
      ].sort((a, b) => a[1] - b[1]);
      return candidates[0][0];
    }

    function isPracticeRailPoint(pt) {
      if (!pt) return false;
      const visualRailTolerance = 76;
      const d = Math.min(
        Math.abs(pt.x - (LEFT + R)),
        Math.abs(pt.x - (RIGHT - R)),
        Math.abs(pt.y - (TOP + R)),
        Math.abs(pt.y - (BOTTOM - R))
      );
      return d <= visualRailTolerance;
    }

    function nearestPointIndex(points, target, start = 0) {
      if (!points || !target) return -1;
      let best = -1;
      let bestDist = Infinity;
      for (let i = Math.max(0, start); i < points.length; i++) {
        const d = Math.hypot(points[i].x - target.x, points[i].y - target.y);
        if (d < bestDist) { best = i; bestDist = d; }
      }
      return best;
    }

    function registerPracticeVideoTarget(id) {
      const target = ball(id);
      if (!target || shot.hitTargets.has(id)) return;
      shot.hitTargets.add(id);
      if (!shot.firstTarget) shot.firstTarget = id;
      else if (!shot.secondTarget) shot.secondTarget = id;
      shot.spin = scaleSpin(shot.spin, shot.longShotMode ? LONG_TARGET_SPIN_DECAY : NORMAL_TARGET_SPIN_DECAY);
      playSound('ball', .65);
      if (shot.hitTargets.size === 1) {
        setGuideText(`<strong>Primer objetivo del video:</strong> ${target.name}. Ahora la blanca debe completar mínimo <span class="route">3 bandas reales</span> antes de la segunda bola.`);
      } else {
        const finalCushions = lockCushionsAtCarom();
        setGuideText(`<strong>Segunda bola del video:</strong> ${target.name}. Contacto final registrado después de ${finalCushions} banda(s).`);
      }
      updateHUD();
    }

    function registerPracticeVideoRail(pt) {
      if (!isPracticeRailPoint(pt) || !shouldCountCueRail()) return false;
      const rail = findNearestRailName(pt);
      shot.spin = scaleSpin(shot.spin, shot.longShotMode ? LONG_RAIL_SPIN_DECAY : NORMAL_RAIL_SPIN_DECAY);
      playSound('rail', .45);
      shot.cushions++;
      addRailMark(pt.x, pt.y);
      updateHUD();
      setGuideText(`<strong>Banda ${shot.cushions} del video:</strong> ${rail}. La bola blanca conserva ${Math.round(spinMagnitude(shot.spin) * 100)}% de efecto.`);
      return true;
    }


    // Movimiento visual realista para las bolas objetivo en el modo Técnica video.
    // Antes la blanca seguía la línea del video, pero la bola receptora y la bola de cierre quedaban congeladas.
    // Esta capa anima esas bolas después del impacto, sin dañar la ruta exacta de entrenamiento.
    function visualHitStrengthForShot(s, kind = 'first') {
      const profile = s && s.hitProfile ? s.hitProfile : {};
      const t = (profile.thickness || '').toLowerCase();
      let cutFactor = .58;
      if (t.includes('muy fina')) cutFactor = .34;
      else if (t.includes('fina')) cutFactor = .48;
      else if (t.includes('media')) cutFactor = .68;
      else if (t.includes('tres')) cutFactor = .82;
      else if (t.includes('llena') || t.includes('gruesa')) cutFactor = .92;
      // La segunda bola debe reaccionar visualmente al cierre de la carambola, sin salir disparada.
      return kind === 'second' ? Math.max(.26, cutFactor * .45) : cutFactor;
    }

    function practiceObjectSpeedForHit(motion, kind, strength) {
      const powerFactor = clamp((Number(motion.actualPower || powerPct) || 60) / 100, .22, 1);
      const guideSpeed = clamp(Number(motion.speed) || 1.8, .55, 2.7);
      // Movimiento visual moderado: la primera bola golpeada no debe salir
      // más rápido que la lectura normal de una tacada de tres bandas.
      const raw = guideSpeed * strength * (.24 + powerFactor * .25);
      if (kind === 'second') return clamp(raw * .48, .14, .86);
      return clamp(raw, .18, 1.34);
    }

    function startPracticeObjectBallMotion(motion, id, kind, previousCuePoint, currentCuePoint) {
      const target = ball(id);
      if (!motion || !target) return;
      const prev = previousCuePoint || currentCuePoint || { x: target.x - Math.cos(aimAngle) * 18, y: target.y - Math.sin(aimAngle) * 18 };
      let dx = target.x - prev.x;
      let dy = target.y - prev.y;
      let dist = Math.hypot(dx, dy);
      if (dist < 0.1 && currentCuePoint) {
        dx = target.x - currentCuePoint.x;
        dy = target.y - currentCuePoint.y;
        dist = Math.hypot(dx, dy);
      }
      if (dist < 0.1) {
        dx = Math.cos(aimAngle);
        dy = Math.sin(aimAngle);
        dist = 1;
      }
      const nx = dx / dist;
      const ny = dy / dist;
      const spinSide = (shot.spin?.x || 0) * (kind === 'second' ? .16 : .28);
      const tx = -ny;
      const ty = nx;
      const strength = visualHitStrengthForShot(motion.shot, kind);
      const baseSpeed = practiceObjectSpeedForHit(motion, kind, strength);
      const followDraw = -(shot.spin?.y || 0) * (kind === 'second' ? .018 : .035);
      const vx = nx * baseSpeed + tx * spinSide * .22 + nx * followDraw;
      const vy = ny * baseSpeed + ty * spinSide * .22 + ny * followDraw;
      motion.objectMotions[id] = {
        id,
        active: true,
        vx,
        vy,
        frames: 0,
        maxFrames: kind === 'second' ? 115 : 155,
        friction: kind === 'second' ? .982 : .985,
        railRestitution: .66,
        kind
      };
      target.vx = vx;
      target.vy = vy;
    }

    function stepPracticeObjectBallMotions(motion) {
      if (!motion || !motion.objectMotions) return;
      for (const key of Object.keys(motion.objectMotions)) {
        const m = motion.objectMotions[key];
        if (!m || !m.active) continue;
        const b = ball(m.id);
        if (!b) { m.active = false; continue; }
        b.x += m.vx;
        b.y += m.vy;
        // Rebotes visuales en las bandas para que la bola golpeada no se salga de la mesa.
        if (b.x - R < LEFT) { b.x = LEFT + R; m.vx = Math.abs(m.vx) * m.railRestitution; }
        else if (b.x + R > RIGHT) { b.x = RIGHT - R; m.vx = -Math.abs(m.vx) * m.railRestitution; }
        if (b.y - R < TOP) { b.y = TOP + R; m.vy = Math.abs(m.vy) * m.railRestitution; }
        else if (b.y + R > BOTTOM) { b.y = BOTTOM - R; m.vy = -Math.abs(m.vy) * m.railRestitution; }
        m.vx *= m.friction;
        m.vy *= m.friction;
        b.vx = m.vx;
        b.vy = m.vy;
        m.frames++;
        if (Math.hypot(m.vx, m.vy) < .045 || m.frames > m.maxFrames) {
          m.vx = 0;
          m.vy = 0;
          b.vx = 0;
          b.vy = 0;
          m.active = false;
        }
      }
      // Transferencia simple y estable si una bola animada toca otra bola.
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j];
          if (a.id === 'cue' || b.id === 'cue') continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const min = R * 2;
          if (d >= min || d <= 0) continue;
          const ma = motion.objectMotions[a.id];
          const mb = motion.objectMotions[b.id];
          if (!ma && !mb) continue;
          const nx = dx / d, ny = dy / d;
          const overlap = min - d + .4;
          a.x = clamp(a.x - nx * overlap * .5, LEFT + R, RIGHT - R);
          a.y = clamp(a.y - ny * overlap * .5, TOP + R, BOTTOM - R);
          b.x = clamp(b.x + nx * overlap * .5, LEFT + R, RIGHT - R);
          b.y = clamp(b.y + ny * overlap * .5, TOP + R, BOTTOM - R);
          const avn = (ma ? ma.vx : a.vx) * nx + (ma ? ma.vy : a.vy) * ny;
          const bvn = (mb ? mb.vx : b.vx) * nx + (mb ? mb.vy : b.vy) * ny;
          const exchange = (avn - bvn) * .58;
          if (ma) { ma.vx -= exchange * nx; ma.vy -= exchange * ny; a.vx = ma.vx; a.vy = ma.vy; }
          else if (Math.abs(exchange) > .08) { motion.objectMotions[a.id] = { id: a.id, active: true, vx: -exchange * nx * .46, vy: -exchange * ny * .46, frames: 0, maxFrames: 80, friction: .980, railRestitution: .64, kind: 'transfer' }; }
          if (mb) { mb.vx += exchange * nx; mb.vy += exchange * ny; b.vx = mb.vx; b.vy = mb.vy; }
          else if (Math.abs(exchange) > .08) { motion.objectMotions[b.id] = { id: b.id, active: true, vx: exchange * nx * .46, vy: exchange * ny * .46, frames: 0, maxFrames: 80, friction: .980, railRestitution: .64, kind: 'transfer' }; }
        }
      }

      // Evita que las bolas animadas queden montadas al detenerse.
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i], b = balls[j];
          if (a.id === 'cue' || b.id === 'cue') continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          const min = R * 2 + 1;
          if (d < min) {
            const push = (min - d) / 2;
            const nx = dx / d, ny = dy / d;
            a.x = clamp(a.x - nx * push, LEFT + R, RIGHT - R);
            a.y = clamp(a.y - ny * push, TOP + R, BOTTOM - R);
            b.x = clamp(b.x + nx * push, LEFT + R, RIGHT - R);
            b.y = clamp(b.y + ny * push, TOP + R, BOTTOM - R);
          }
        }
      }
    }

    function practiceObjectMotionsActive(motion) {
      if (!motion || !motion.objectMotions) return false;
      return Object.values(motion.objectMotions).some(m => m && m.active);
    }

    function countGuideRailsBetween(points, startIndex, endIndex) {
      if (!Array.isArray(points) || points.length < 3) return 0;
      let count = 0;
      const seen = new Set();
      const from = Math.max(1, Number(startIndex) || 1);
      const to = Math.min(points.length - 2, Number(endIndex) || points.length - 2);
      for (let i = from; i <= to; i++) {
        const p = points[i];
        if (!p || !isPracticeRailPoint(p)) continue;
        const rail = findNearestRailName(p);
        const key = `${rail}:${Math.round(p.x)}:${Math.round(p.y)}`;
        if (!seen.has(key)) {
          seen.add(key);
          count++;
        }
      }
      return count;
    }

    function practiceRouteCompletionForPower(s, actualPower) {
      if (!s?.strictGuide) return 1;
      const required = clamp(Number(s.executionPower || s.power || 72), 35, 100);
      const actual = clamp(Number(actualPower || powerPct), 1, 100);
      if (actual >= required) return 1;
      const minimumUseful = Math.max(18, required * 0.28);
      const ratio = (actual - minimumUseful) / Math.max(1, required - minimumUseful);
      return clamp(ratio, 0.18, 0.995);
    }

    function truncatePracticePathByCompletion(points, completion) {
      const pts = Array.isArray(points) ? points : [];
      if (completion >= .999 || pts.length < 2) return pts;
      const total = pts.reduce((acc, p, i) => i ? acc + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0, 0);
      const target = total * clamp(completion, 0, 1);
      const partial = [pts[0]];
      let covered = 0;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const seg = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        if (covered + seg <= target) {
          partial.push(b);
          covered += seg;
          continue;
        }
        const t = clamp((target - covered) / seg, 0, 1);
        partial.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        break;
      }
      return partial.length > 1 ? partial : pts.slice(0, 2);
    }

    function applyStrictPracticeSetup(s, options = {}) {
      const cue = ball('cue');
      if (cue && s?.aimAt) aimAngle = angleTo(cue, s.aimAt);
      if (!options.keepPower) {
        const chosenPower = s?.executionPower ?? s?.power ?? powerPct;
        powerPct = adjustedLongShotPower(chosenPower, s);
      }
      const eff = clampEffect(s?.effect?.x ?? effectX, s?.effect?.y ?? effectY);
      effectX = eff.x;
      effectY = eff.y;
      return { angle: aimAngle, power: powerPct, effect: { x: effectX, y: effectY } };
    }

    function startPracticeVideoShot(options = {}) {
      const s = currentPracticeShot();
      if (!s || !s.guidePath || !s.guidePath.length) return false;
      const demoMode = options.demoMode !== false;
      const countAttempt = options.countAttempt !== undefined ? !!options.countAttempt : !demoMode;
      const strictGuide = !!s.strictGuide;
      const recommendedPower = strictGuide ? adjustedLongShotPower(Number(s.executionPower || s.power || 72), s) : powerPct;
      const setup = strictGuide ? applyStrictPracticeSetup(s, { keepPower: false }) : applyPracticeSetup(s, false);
      const shotPower = strictGuide ? recommendedPower : powerPct;
      if (strictGuide) powerPct = shotPower;
      const requiredPower = shotPower;
      const routeCompletion = 1;
      const title = demoMode ? 'Demostración profesional' : 'Tiro sincronizado con guía maestra';
      const scoringText = demoMode ? 'no suma puntos ni intentos' : 'sí suma intento y punto si completa la carambola';
      prepareShotState(`<strong>${title}:</strong> jugada ${s.code}. Potencia de referencia <span class="route">${shotPower}%</span>, velocidad <span class="route">${practiceTravelSpeedForPower(shotPower).toFixed(1)}</span>, ${spinText()}; golpe a la receptora: <span class="route">${s.hitProfile?.thickness || 'según guía'}</span>. La bola blanca seguirá exactamente la guía visible; <span class="route">${scoringText}</span>.`, { demoMode, countAttempt });
      const fullGuidePoints = buildPlayablePracticePath(s);
      const guidePoints = fullGuidePoints;
      const first = ball(s.first);
      const second = ball(s.second);
      const firstIndex = nearestPointIndex(guidePoints, first, 1);
      const secondIndex = nearestPointIndex(guidePoints, second, Math.max(firstIndex + 1, 2));
      practiceVideoMotion = {
        shot: s,
        points: guidePoints,
        segment: 0,
        distanceInSegment: 0,
        speed: practiceTravelSpeedForPower(shotPower),
        firstId: s.first,
        secondId: s.second,
        firstIndex,
        secondIndex,
        expectedCushions: Math.max(3, countGuideRailsBetween(guidePoints, Math.max(firstIndex + 1, 1), Math.max(secondIndex - 1, firstIndex + 1))),
        routeCompletion,
        completedFullPath: routeCompletion >= .999,
        requiredPower,
        actualPower: shotPower,
        firstRegistered: false,
        secondRegistered: false,
        railKeysVisited: new Set(),
        objectMotions: {},
        done: false,
        setup
      };
      const cue = ball('cue');
      cue.vx = 0; cue.vy = 0;
      path = [{ x: cue.x, y: cue.y }];
      if (guidePoints[0]) { cue.x = guidePoints[0].x; cue.y = guidePoints[0].y; path = [{ x: cue.x, y: cue.y }]; }
      const firstTemplate = Array.isArray(s.balls) ? s.balls.find(b => b.id === s.first) : null;
      const secondTemplate = Array.isArray(s.balls) ? s.balls.find(b => b.id === s.second) : null;
      if (first) { if (firstTemplate) { first.x = firstTemplate.x; first.y = firstTemplate.y; } first.vx = 0; first.vy = 0; }
      if (second) { if (secondTemplate) { second.x = secondTemplate.x; second.y = secondTemplate.y; } second.vx = 0; second.vy = 0; }
      renderBalls();
      if (guide) setMasterGuideLine(guidePoints, true);
      return true;
    }

    function finishPracticeVideoShot() {
      const motion = practiceVideoMotion;
      if (!motion) return;
      practiceVideoMotion = null;
      const s = motion.shot;
      const cue = ball('cue');
      const second = ball(s.second);
      if (motion.shot?.strictGuide && motion.completedFullPath && motion.expectedCushions && !shot.caromLocked) {
        shot.cushions = Math.max(shot.cushions, motion.expectedCushions);
      }
      if (motion.shot?.strictGuide && motion.completedFullPath && !motion.firstRegistered) {
        motion.firstRegistered = true;
        registerPracticeVideoTarget(s.first);
      }
      if (!motion.secondRegistered && motion.firstRegistered && second && Math.hypot(ball('cue').x - second.x, ball('cue').y - second.y) < 44 && shot.cushions >= 3) {
        motion.secondRegistered = true;
        registerPracticeVideoTarget(s.second);
      }
      if (motion.shot?.strictGuide && motion.completedFullPath && !motion.secondRegistered && shot.cushions >= 3) {
        motion.secondRegistered = true;
        registerPracticeVideoTarget(s.second);
      }
      let finalCushions = shot.secondTarget ? lockCushionsAtCarom() : shot.cushions;
      if (motion.shot?.strictGuide && motion.completedFullPath) {
        finalCushions = Math.max(3, finalCushions, motion.expectedCushions || 3);
        shot.scoringCushions = finalCushions;
        shot.caromLocked = true;
        shot.firstTarget = s.first;
        shot.secondTarget = s.second;
        shot.hitTargets = new Set([s.first, s.second]);
      }
      const ok = motion.shot?.strictGuide && motion.completedFullPath
        ? true
        : (shot.firstTarget === s.first && shot.secondTarget === s.second && finalCushions >= 3);
      shot.result = ok ? 'point' : 'miss';
      shotResolved = true;
      if (ok) {
        const isDemo = !!shot.demoMode;
        if (!isDemo || DEMO_COUNTS_AS_SCORE) score++;
        playSound('point', 1);
        const scoreText = isDemo && !DEMO_COUNTS_AS_SCORE ? 'Demostración completada: no suma punto ni intento.' : '+1 punto.';
        const title = isDemo ? '¡Ruta modelo completada!' : '¡Tiro sincronizado completado!';
        setGuideText(`<span class="ok">${title}</span> Jugada ${s.code}: primer contacto correcto, ${finalCushions} bandas y cierre sobre ${ballLabel(s.second)}. ${scoreText}`);
      } else {
        playSound('fail', 1);
        const firstTxt = shot.firstTarget === s.first ? 'primer contacto correcto' : `primer contacto incorrecto (${ballLabel(shot.firstTarget || 'ninguna')})`;
        const secondTxt = shot.secondTarget === s.second ? 'segunda bola correcta' : 'no cerró en la segunda bola';
        const powerTxt = motion.shot?.strictGuide && !motion.completedFullPath ? ` Potencia usada: ${motion.actualPower}%; de referencia: ${motion.requiredPower}%. La bola quedó corta por fuerza insuficiente.` : '';
        setGuideText(`<span class="bad">Revisa la jugada ${s.code}.</span> ${firstTxt}; ${secondTxt}; bandas registradas: ${finalCushions}/3.${powerTxt} Ajusta golpe, efecto o potencia.`);
      }
      updateHUD();
      finishShot();
    }

    function stepPracticeVideoMotion() {
      const motion = practiceVideoMotion;
      if (!motion || !shotActive) return;
      const cue = ball('cue');
      const pts = motion.points;
      if (!pts || pts.length < 2) {
        finishPracticeVideoShot();
        return;
      }
      if (motion.segment >= pts.length - 1) {
        // La carambola se valida al cerrar la ruta; las bolas objetivo pueden seguir
        // rodando por el motor normal, pero el punto ya queda registrado sin demoras.
        finishPracticeVideoShot();
        return;
      }
      let remaining = motion.speed;
      while (remaining > 0 && motion.segment < pts.length - 1) {
        const a = pts[motion.segment];
        const b = pts[motion.segment + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const left = len - motion.distanceInSegment;
        const maxSubstep = motion.shot?.strictGuide ? 1.75 : remaining;
        const step = Math.min(remaining, left, maxSubstep);
        motion.distanceInSegment += step;
        remaining -= step;
        const t = motion.distanceInSegment / len;
        cue.vx = dx / len * motion.speed;
        cue.vy = dy / len * motion.speed;
        cue.x = a.x + dx * t;
        cue.y = a.y + dy * t;

        const first = ball(motion.firstId);
        const second = ball(motion.secondId);
        const previousCuePoint = motion.previousCuePoint || a;
        const firstContactPoint = pts[motion.firstIndex] || first;
        const secondContactPoint = pts[motion.secondIndex] || second;
        const cueNearFirst = first && Math.hypot(cue.x - first.x, cue.y - first.y) < (motion.shot?.exactGuidePath ? 46 : 34);
        const guideNearFirst = firstContactPoint && Math.hypot(cue.x - firstContactPoint.x, cue.y - firstContactPoint.y) < (motion.shot?.exactGuidePath ? 44 : 24);
        const passedFirstIndex = motion.segment >= Math.max(0, motion.firstIndex - 1) && motion.distanceInSegment > len * .55;
        if (!motion.firstRegistered && first && (cueNearFirst || guideNearFirst || passedFirstIndex)) {
          motion.firstRegistered = true;
          registerPracticeVideoTarget(motion.firstId);
          startPracticeObjectBallMotion(motion, motion.firstId, 'first', previousCuePoint, { x: cue.x, y: cue.y });
        }
        const cueNearSecond = second && Math.hypot(cue.x - second.x, cue.y - second.y) < (motion.shot?.exactGuidePath ? 48 : 34);
        const guideNearSecond = secondContactPoint && Math.hypot(cue.x - secondContactPoint.x, cue.y - secondContactPoint.y) < (motion.shot?.exactGuidePath ? 46 : 26);
        const passedSecondIndex = motion.segment >= Math.max(0, motion.secondIndex - 1) && motion.distanceInSegment > len * .55;
        if (motion.firstRegistered && !motion.secondRegistered && second && (cueNearSecond || guideNearSecond || passedSecondIndex) && shot.cushions >= 3) {
          motion.secondRegistered = true;
          registerPracticeVideoTarget(motion.secondId);
          startPracticeObjectBallMotion(motion, motion.secondId, 'second', previousCuePoint, { x: cue.x, y: cue.y });
        }
        motion.previousCuePoint = { x: cue.x, y: cue.y };

        if (motion.distanceInSegment >= len - 0.001) {
          const vertexIndex = motion.segment + 1;
          const firstPoint = first && Math.hypot(b.x - first.x, b.y - first.y) < 42;
          const secondPoint = second && Math.hypot(b.x - second.x, b.y - second.y) < 42;
          if (motion.firstRegistered && !secondPoint && !firstPoint && isPracticeRailPoint(b)) {
            const rail = findNearestRailName(b);
            const key = `${vertexIndex}:${rail}:${Math.round(b.x)}:${Math.round(b.y)}`;
            if (!motion.railKeysVisited.has(key)) {
              motion.railKeysVisited.add(key);
              registerPracticeVideoRail(b);
            }
          }
          motion.segment++;
          motion.distanceInSegment = 0;
        }
      }

      stepPracticeObjectBallMotions(motion);
      renderBalls();
      const last = path[path.length - 1];
      if (!last || Math.hypot(cue.x - last.x, cue.y - last.y) > 5) {
        path.push({ x: cue.x, y: cue.y });
        if (path.length > 260) path.shift();
        renderPath();
      }
      captureShotFrame();
      if (motion.segment >= pts.length - 1) {
        cue.vx = 0; cue.vy = 0;
        finishPracticeVideoShot();
      }
    }

    function angleDeltaRad(a, b) {
      let d = ((a - b + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (d < -Math.PI) d += Math.PI * 2;
      return d;
    }

    function practiceBallsAtReferenceStart(s, tolerance = 11) {
      if (!s || !Array.isArray(s.balls)) return false;
      for (const refBall of s.balls) {
        const live = ball(refBall.id);
        if (!live) return false;
        if (Math.hypot(live.x - refBall.x, live.y - refBall.y) > tolerance) return false;
      }
      return true;
    }

    function currentPracticeCalculationStatus(s = currentPracticeShot()) {
      const ref = lastImageShotSetup;
      if (!practiceMode || !s || deflectionGuideMode !== 'imagen' || !ref || ref.code !== s.code) {
        return { ok: false, reason: 'sin referencia de Efecto' };
      }
      const angleDeg = Math.abs(angleDeltaRad(aimAngle, ref.angle)) * 180 / Math.PI;
      const powerDiff = Math.abs((Number(powerPct) || 0) - (Number(ref.power) || 0));
      const effectDiff = Math.hypot((Number(effectX) || 0) - (Number(ref.effectX) || 0), (Number(effectY) || 0) - (Number(ref.effectY) || 0));
      const aimed = aimedTargetFromCue(aimAngle);
      const firstOk = !aimed?.id || !s.first || aimed.id === s.first;
      const atReferenceStart = practiceBallsAtReferenceStart(s);
      const ok = angleDeg <= 2.6 && powerDiff <= 6 && effectDiff <= 12 && firstOk && atReferenceStart;
      return { ok, angleDeg, powerDiff, effectDiff, firstOk, atReferenceStart, aimedId: aimed?.id || null };
    }



    function pointToSegmentDistance(pt, a, b) {
      if (!pt || !a || !b) return Infinity;
      const vx = b.x - a.x;
      const vy = b.y - a.y;
      const wx = pt.x - a.x;
      const wy = pt.y - a.y;
      const len2 = vx * vx + vy * vy;
      if (len2 <= 0.0001) return Math.hypot(pt.x - a.x, pt.y - a.y);
      const t = clamp((wx * vx + wy * vy) / len2, 0, 1);
      const px = a.x + vx * t;
      const py = a.y + vy * t;
      return Math.hypot(pt.x - px, pt.y - py);
    }

    function distanceToPolyline(pt, points) {
      if (!Array.isArray(points) || points.length < 2) return Infinity;
      let best = Infinity;
      for (let i = 1; i < points.length; i++) {
        const d = pointToSegmentDistance(pt, points[i - 1], points[i]);
        if (d < best) best = d;
      }
      return best;
    }

    function samplePolyline(points, maxSamples = 34) {
      const pts = Array.isArray(points) ? points.filter(Boolean) : [];
      if (pts.length <= maxSamples) return pts;
      const out = [];
      for (let i = 0; i < maxSamples; i++) {
        const idx = Math.round(i * (pts.length - 1) / Math.max(1, maxSamples - 1));
        out.push(pts[idx]);
      }
      return out;
    }

    function polylineDirection(points) {
      const pts = Array.isArray(points) ? points : [];
      if (pts.length < 2) return null;
      const start = pts[0];
      let end = pts[1];
      for (let i = 1; i < pts.length; i++) {
        if (Math.hypot(pts[i].x - start.x, pts[i].y - start.y) > 26) { end = pts[i]; break; }
      }
      return Math.atan2(end.y - start.y, end.x - start.x);
    }

    function guidePathSimilarity(simPoints, masterPoints) {
      const sim = samplePolyline(simPoints, 38);
      const master = samplePolyline(masterPoints, 38);
      if (sim.length < 3 || master.length < 3) return { avg: Infinity, max: Infinity, angleDeg: Infinity };
      const simDistances = sim.map(p => distanceToPolyline(p, master));
      const masterDistances = master.map(p => distanceToPolyline(p, sim));
      const all = simDistances.concat(masterDistances).filter(Number.isFinite);
      const avg = all.reduce((a, b) => a + b, 0) / Math.max(1, all.length);
      const max = all.reduce((a, b) => Math.max(a, b), 0);
      const a1 = polylineDirection(sim);
      const a2 = polylineDirection(master);
      const angleDeg = (a1 == null || a2 == null) ? Infinity : Math.abs(angleDeltaRad(a1, a2)) * 180 / Math.PI;
      return { avg, max, angleDeg };
    }

    function magneticGuideStatus(s = currentPracticeShot(), sim = null) {
      if (!practiceMode || !guide || !s || shotActive || placingMode) return { ok: false, reason: 'sin práctica activa' };
      if (selectionGuideNeedsPlayerAim) return { ok: false, reason: 'esperando ajuste del jugador' };
      if (!practiceBallsAtReferenceStart(s, 18)) return { ok: false, reason: 'bolas fuera de la posición base' };
      const masterPoints = masterGuidePointsForPractice(s);
      if (!Array.isArray(masterPoints) || masterPoints.length < 3) return { ok: false, reason: 'sin guía principal' };
      let currentSim = sim;
      if (!currentSim || !Array.isArray(currentSim.points)) {
        const p = powerValue();
        currentSim = simulateShot(Math.cos(aimAngle) * p, Math.sin(aimAngle) * p, currentSpin(), 1200);
      }
      if (!Array.isArray(currentSim.points) || currentSim.points.length < 3) return { ok: false, reason: 'sin guía de tacada' };
      if (currentSim.firstTarget && s.first && currentSim.firstTarget.id && currentSim.firstTarget.id !== s.first) {
        return { ok: false, reason: 'primera bola diferente' };
      }
      const stats = guidePathSimilarity(currentSim.points, masterPoints);
      const nearEnough = stats.avg <= GUIDE_MAGNET_AVG_THRESHOLD && stats.max <= GUIDE_MAGNET_MAX_THRESHOLD && stats.angleDeg <= GUIDE_MAGNET_ANGLE_THRESHOLD_DEG;
      const strength = clamp(1 - (stats.avg / GUIDE_MAGNET_AVG_THRESHOLD), 0, 1);
      return {
        ok: nearEnough,
        reason: nearEnough ? 'imán activado' : 'imán fuera de rango',
        strength,
        stats,
        masterPoints,
        sim: currentSim
      };
    }

    function guideMagnetDisplayText(status) {
      if (!status || !status.ok) return '';
      const pct = Math.round((status.strength || 0) * 100);
      const avg = Math.round(status.stats?.avg || 0);
      return `<br><span class="ok">Imán físico de carambola activo:</span> la guía de tacada está cerca de la guía principal (${pct}% de asistencia, desfase aprox. ${avg}px). Si tiras ahora, el imán solo ajusta la salida; la tacada se ejecuta con física real, bandas, efecto y movimiento de las tres bolas.`;
    }



    function blendAngles(a, b, t) {
      const d = angleDeltaRad(b, a);
      return a + d * clamp(t, 0, 1);
    }

    function referenceEffectForShot(s) {
      const ref = s?.visualEffect || s?.videoImageEffect || s?.effect || null;
      if (!ref) return clampEffect(effectX, effectY);
      return clampEffect(ref.x || 0, ref.y || 0);
    }

    function blendEffect(a, b, t) {
      return clampEffect(
        (Number(a?.x) || 0) + ((Number(b?.x) || 0) - (Number(a?.x) || 0)) * clamp(t, 0, 1),
        (Number(a?.y) || 0) + ((Number(b?.y) || 0) - (Number(a?.y) || 0)) * clamp(t, 0, 1)
      );
    }

    function scorePhysicalMagnetCandidate(s, candidate, masterPoints, base = {}) {
      const sim = candidate?.sim;
      if (!sim || !Array.isArray(sim.points) || sim.points.length < 2) return Infinity;
      const stats = guidePathSimilarity(sim.points, masterPoints || []);
      const firstOk = !s?.first || (sim.firstTarget && sim.firstTarget.id === s.first);
      const secondOk = !s?.second || (sim.secondTarget && sim.secondTarget.id === s.second && sim.secondTarget.cushions >= 3);
      const wrongFirst = sim.firstTarget && s?.first && sim.firstTarget.id !== s.first;
      let score = 0;
      score += Number.isFinite(stats.avg) ? stats.avg * 1.45 : 5000;
      score += Number.isFinite(stats.max) ? stats.max * 0.38 : 3500;
      score += Number.isFinite(stats.angleDeg) ? stats.angleDeg * 2.2 : 300;
      if (secondOk) score -= 3600;
      else if (sim.secondTarget) score += 900;
      else score += 2300;
      if (!firstOk) score += 1700;
      if (wrongFirst) score += 4200;
      score += Math.abs((candidate.powerPct || 0) - (base.powerPct || powerPct)) * 1.65;
      score += Math.abs(angleDeltaRad(candidate.angle || 0, base.angle || aimAngle)) * 180 / Math.PI * 2.4;
      return score;
    }

    function findPhysicalMagnetShot(s = currentPracticeShot(), magnetStatus = null, options = {}) {
      if (!practiceMode || !s) return null;
      const masterPoints = (magnetStatus && magnetStatus.masterPoints) || masterGuidePointsForPractice(s);
      if (!Array.isArray(masterPoints) || masterPoints.length < 3) return null;
      const baseAngle = Number.isFinite(aimAngle) ? aimAngle : 0;
      const masterAngle = polylineDirection(masterPoints);
      const strength = clamp(Number(magnetStatus?.strength ?? (options.armed ? .76 : .42)) || 0, 0, 1);
      const guidedAngle = Number.isFinite(masterAngle) ? blendAngles(baseAngle, masterAngle, 0.30 + strength * 0.22) : baseAngle;
      const basePower = clamp(Math.round(powerPct), 1, maxPowerPctForShot());
      const referencePower = clamp(Math.round(Number(s.executionPower ?? s.power ?? basePower)), 1, maxPowerPctForShot());
      const guidedPower = Math.round(basePower + (referencePower - basePower) * (0.22 + strength * 0.30));
      const currentEff = clampEffect(effectX, effectY);
      const refEff = referenceEffectForShot(s);
      const guidedEff = blendEffect(currentEff, refEff, 0.25 + strength * 0.28);

      const angleOffsets = [0, -0.018, 0.018, -0.038, 0.038, -0.064, 0.064];
      const powerOffsets = [0, -6, 6, -12, 12, 18];
      const effects = [currentEff, guidedEff, blendEffect(currentEff, refEff, .72)];
      const base = { angle: baseAngle, powerPct: basePower };
      let best = null;
      const tried = new Set();
      for (const centerAngle of [baseAngle, guidedAngle]) {
        for (const da of angleOffsets) {
          const a = centerAngle + da;
          for (const dp of powerOffsets) {
            const pct = clamp(Math.round(guidedPower + dp), 1, maxPowerPctForShot());
            for (const eff of effects) {
              const key = `${Math.round(a * 10000)}:${pct}:${eff.x}:${eff.y}`;
              if (tried.has(key)) continue;
              tried.add(key);
              const p = powerValueForPct(pct);
              const sim = simulateShot(Math.cos(a) * p, Math.sin(a) * p, spinFromEffect(eff.x, eff.y, a), 1500);
              const candidate = { angle: a, powerPct: pct, effect: eff, sim };
              const score = scorePhysicalMagnetCandidate(s, candidate, masterPoints, base);
              if (!best || score < best.score) best = { ...candidate, score, stats: guidePathSimilarity(sim.points, masterPoints) };
            }
          }
        }
      }
      return best;
    }

    function startPhysicalGuideAssistShot(s = currentPracticeShot(), magnetStatus = null, options = {}) {
      const cue = ball('cue');
      if (!cue || !s) return false;
      const candidate = findPhysicalMagnetShot(s, magnetStatus, options) || null;
      const chosen = candidate || {
        angle: aimAngle,
        powerPct: powerPct,
        effect: clampEffect(effectX, effectY),
        sim: null,
        score: Infinity,
        stats: magnetStatus?.stats || null
      };
      aimAngle = chosen.angle;
      powerPct = clamp(Math.round(chosen.powerPct), 1, maxPowerPctForShot());
      const eff = clampEffect(chosen.effect?.x ?? effectX, chosen.effect?.y ?? effectY);
      effectX = eff.x;
      effectY = eff.y;
      practiceVideoMotion = null;
      fineAlignMode = true;
      markModeDone('taco');
      markModeDone('potencia');
      markModeDone('efecto');
      updateFloatingControls();
      const p = powerValueForPct(powerPct);
      const simOk = chosen.sim?.secondTarget && (!s.second || chosen.sim.secondTarget.id === s.second) && chosen.sim.secondTarget.cushions >= 3;
      const assistName = options.armed ? 'Guía sincronizada con física real' : 'Imán físico de carambola';
      const resultHint = simOk ? '<span class="ok">la simulación física previa encontró cierre de carambola</span>' : '<span class="route">asistencia aplicada sin forzar ruta lineal</span>';
      const avgTxt = Number.isFinite(chosen.stats?.avg) ? ` Desfase físico aprox. ${Math.round(chosen.stats.avg)} px.` : '';
      const longHint = longShotHint(s);
      const predictiveGuide = createPredictiveGuideSnapshot(s, chosen.sim || null);
      prepareShotState(`<strong>${assistName}:</strong> fuerza <span class="route">${powerDisplayLabel(powerPct)}</span>, ${spinText()}. El imán corrigió suavemente dirección/potencia/efecto, pero la bola sale con <span class="route">motor físico real</span>: choques, bandas, fricción, efecto y movimiento de todas las bolas.${avgTxt}<br>${resultHint}. La iluminación final queda guardada únicamente si la predicción previa anticipa 3 o más bandas.${longHint}`, { demoMode: false, countAttempt: true, shotSource: options.armed ? 'guia-base-fisica' : 'iman-fisico', predictiveGuide });
      cue.vx = Math.cos(aimAngle) * p;
      cue.vy = Math.sin(aimAngle) * p;
      shot.spin = spinFromEffect(effectX, effectY, aimAngle);
      shot.longShotMode = longShotModeForCurrentSetup(cue.vx, cue.vy, s);
      shot.powerPct = powerPct;
      return true;
    }




    function exactVideoGuideArmedStatus(s = currentPracticeShot()) {
      const ref = lastImageShotSetup;
      if (!practiceMode || !s || !Array.isArray(s.guidePath) || s.guidePath.length < 2) {
        return { ok: false, reason: 'sin ruta de video' };
      }
      if (deflectionGuideMode !== 'imagen') return { ok: false, reason: 'modo libre' };
      if (!ref || ref.code !== s.code) return { ok: false, reason: 'imagen no aplicada' };
      if (selectionGuideNeedsPlayerAim || ref.selectionSoftStart) return { ok: false, reason: 'selección libre' };
      const angleDeg = Math.abs(angleDeltaRad(aimAngle, ref.angle)) * 180 / Math.PI;
      const powerDiff = Math.abs((Number(powerPct) || 0) - (Number(ref.power) || 0));
      const effectDiff = Math.hypot((Number(effectX) || 0) - (Number(ref.effectX) || 0), (Number(effectY) || 0) - (Number(ref.effectY) || 0));
      const atReferenceStart = practiceBallsAtReferenceStart(s, 14);
      const ok = angleDeg <= 4.2 && powerDiff <= 8 && effectDiff <= 16 && atReferenceStart;
      return { ok, reason: ok ? 'guía maestra armada' : 'ajuste manual detectado', angleDeg, powerDiff, effectDiff, atReferenceStart };
    }

    function renderMasterGuideIfArmed(s = currentPracticeShot()) {
      const status = exactVideoGuideArmedStatus(s);
      if (!status.ok) return null;
      const pts = buildPlayablePracticePath(s);
      if (!Array.isArray(pts) || pts.length < 2) return null;
      return { status, points: pts };
    }


    function predictiveCaromGuideStatus(sim, s = practiceMode ? currentPracticeShot() : null) {
      if (!sim || !sim.secondTarget) return { ok: false, reason: 'sin cierre' };
      const cushions = Number(sim.secondTarget.cushions || 0);
      if (cushions < 3) return { ok: false, reason: 'faltan bandas', cushions };
      const firstId = sim.firstTarget?.id || null;
      const secondId = sim.secondTarget?.id || null;
      const expectedBase = !!(practiceMode && s && s.first && s.second && firstId === s.first && secondId === s.second);
      return {
        ok: true,
        cushions,
        firstId,
        secondId,
        expectedBase,
        source: practiceMode ? 'guia-predictiva' : 'sistema-propio',
        ballIds: ['cue', firstId, secondId].filter(Boolean)
      };
    }

    function createPredictiveGuideSnapshot(s = practiceMode ? currentPracticeShot() : null, simOverride = null) {
      const power = powerValue();
      const vx = Math.cos(aimAngle) * power;
      const vy = Math.sin(aimAngle) * power;
      const sim = simOverride || simulateShot(vx, vy, currentSpin(), 1500);
      const status = predictiveCaromGuideStatus(sim, s);
      if (!status.ok) return { ok: false, reason: status.reason || 'sin predicción de carambola' };
      const pts = Array.isArray(sim.points) ? sim.points.map(p => ({ x: p.x, y: p.y })) : [];
      if (pts.length < 2) return { ok: false, reason: 'sin puntos predictivos' };
      return {
        ok: true,
        points: pts,
        shotCode: s?.code || null,
        practiceShot: s || null,
        status: {
          ...status,
          source: 'prediccion-final',
          strength: 1,
          stats: { avg: 0 },
          ballIds: status.ballIds || ['cue', s?.first, s?.second].filter(Boolean)
        }
      };
    }

    function restorePredictiveFinalIllumination() {
      const saved = shot?.predictiveIllumination;
      if (!saved?.ok || !Array.isArray(saved.points) || saved.points.length < 2) return false;
      caromIlluminationActive = false;
      illuminateGuideCoincidence(saved.points, saved.practiceShot || (practiceMode ? currentPracticeShot() : null), saved.status || { source: 'prediccion-final' }, { force: true });
      return true;
    }

    function shoot() {
      if (placingMode) { setGuideText('<strong>Ubicar bolas está activo:</strong> desactívalo para poder tirar.'); return; }
      if (replayingMotion) return;
      if (shotActive || replayingMotion || !allStopped()) return;

      // v190: Tirar ya no ejecuta una ruta lineal cuando las guías coinciden.
      // El imán solo corrige suavemente dirección/potencia/efecto; el disparo se resuelve con el motor físico real.
      // La demostración conserva la ruta maestra exacta, pero el tiro del jugador mueve todas las bolas con física.

      const cue = ball('cue');
      const activePractice = practiceMode ? currentPracticeShot() : null;
      const predictiveGuide = createPredictiveGuideSnapshot(activePractice);
      const armed = activePractice ? exactVideoGuideArmedStatus(activePractice) : { ok: false };
      const magnet = activePractice ? magneticGuideStatus(activePractice) : { ok: false };
      if ((armed.ok || magnet.ok) && startPhysicalGuideAssistShot(activePractice, magnet.ok ? magnet : null, { armed: armed.ok })) {
        playSound('shot', Math.min(1, powerValue() / MAX_POWER));
        return;
      }
      const p = powerValue();
      practiceVideoMotion = null;
      const longHint = practiceMode ? longShotHint(activePractice) : (powerPct > NORMAL_MAX_POWER_PCT ? '<br><span class="route">Tiro largo activo:</span> reserva de potencia aplicada al tiro físico.' : '');
      const realShotMsg = practiceMode
        ? `<strong>Tiro físico libre:</strong> fuerza <span class="route">${powerDisplayLabel(powerPct)}</span>, ${spinText()}. Detecté ajuste manual: la bola sale por donde apuntaste y la línea amarilla predice esa física. Para sincronizarla de nuevo con la guía del video usa <span class="route">Efecto</span> o ajusta taco/potencia hasta acercarte a la ruta base.${longHint}`
        : `<strong>Tiro real libre:</strong> fuerza <span class="route">${powerDisplayLabel(powerPct)}</span>, ${spinText()}. La bola sale hacia donde apunta el taco.${longHint}`;
      prepareShotState(realShotMsg, { shotSource: practiceMode ? 'jugada-propia' : 'modo-libre', predictiveGuide });
      cue.vx = Math.cos(aimAngle) * p;
      cue.vy = Math.sin(aimAngle) * p;
      playSound('shot', Math.min(1, p / MAX_POWER));
    }

    function addRailMark(x, y) {
      const m = document.createElement('div');
      m.className = 'rail-mark';
      m.style.left = toCssX(x);
      m.style.top = toCssY(y);
      table.appendChild(m);
      setTimeout(() => m.remove(), 1300);
    }

    function spinFromEffect(x = effectX, y = effectY, angle = aimAngle) {
      const rawX = clamp(Number(x) || 0, -100, 100) / 100;
      const rawY = clamp(Number(y) || 0, -100, 100) / 100;
      const side = rawX;
      const follow = -rawY; // arriba = corrido; abajo = retroceso.
      const rightX = Math.sin(angle);
      const rightY = -Math.cos(angle);
      return {
        x: rightX * side,
        y: rightY * side,
        side,
        follow,
        rawX,
        rawY
      };
    }
    function currentSpin() { return spinFromEffect(effectX, effectY, aimAngle); }
    function cloneSpin(spin) {
      return {
        x: spin?.x || 0,
        y: spin?.y || 0,
        side: spin?.side || 0,
        follow: spin?.follow || 0,
        rawX: spin?.rawX ?? spin?.side ?? spin?.x ?? 0,
        rawY: spin?.rawY ?? (-(spin?.follow || 0))
      };
    }
    function scaleSpin(spin, factor) {
      return {
        x: (spin?.x || 0) * factor,
        y: (spin?.y || 0) * factor,
        side: (spin?.side || 0) * factor,
        follow: (spin?.follow || 0) * factor,
        rawX: (spin?.rawX ?? spin?.side ?? spin?.x ?? 0) * factor,
        rawY: (spin?.rawY ?? (-(spin?.follow || 0))) * factor
      };
    }

    function moderateFirstObjectBallSpeed(target, cueSpeed = 0) {
      if (!target) return;
      const speed = Math.hypot(target.vx || 0, target.vy || 0);
      if (speed < 0.01) return;
      const cueBasedCap = Math.max(1.15, Math.abs(cueSpeed) * FIRST_OBJECT_POWER_RATIO);
      const cappedSpeed = Math.min(speed * FIRST_OBJECT_TRANSFER_SCALE, cueBasedCap, FIRST_OBJECT_MAX_SPEED);
      if (cappedSpeed >= speed) return;
      const k = cappedSpeed / speed;
      target.vx *= k;
      target.vy *= k;
    }
    function spinMagnitude(spin) { return Math.hypot(spin?.side ?? spin?.x ?? 0, spin?.follow ?? -(spin?.y || 0)); }

    function applyRailSpin(b, spin, rail, physics = null) {
      const speed = Math.hypot(b.vx, b.vy);
      if (speed < .08) return;

      const railRestitution = physics?.railRestitution ?? railRestitutionForCurrentShot();
      const railTangentFriction = physics?.railTangentFriction ?? railTangentFrictionForCurrentShot();
      const spinThrow = physics?.spinThrow ?? spinThrowForCurrentShot();
      const railIsVertical = rail === 'izquierda' || rail === 'derecha';
      const normalSign = rail === 'izquierda' || rail === 'superior' ? 1 : -1;
      const tangentX = railIsVertical ? 0 : 1;
      const tangentY = railIsVertical ? 1 : 0;
      const normalX = railIsVertical ? normalSign : 0;
      const normalY = railIsVertical ? 0 : normalSign;

      const normalSpeed = b.vx * normalX + b.vy * normalY;
      const tangentSpeed = b.vx * tangentX + b.vy * tangentY;
      const incidence = clamp(Math.abs(normalSpeed) / Math.max(speed, 0.001), 0, 1);
      const shallow = 1 - incidence;
      const sideSpin = railIsVertical ? (spin?.y || 0) : (spin?.x || 0);
      const runningSpin = sideSpin * Math.sign(tangentSpeed || 1);
      const followDraw = clamp(spin?.follow || 0, -1, 1);
      const speedPressure = clamp(speed / MAX_LONG_POWER, 0, 1);

      // Banda profesional: una llegada muy plana no se comporta igual que una llegada frontal.
      // La normal pierde energía por compresión del caucho; la tangente se abre/cierra por efecto.
      const normalEnergy = clamp(railRestitution * (1 - shallow * RAIL_INCIDENT_LOSS + followDraw * 0.018), 0.76, 0.975);
      const tangentEnergy = clamp(railTangentFriction - incidence * 0.018 - speedPressure * 0.012, 0.918, 0.993);
      let newNormal = Math.abs(normalSpeed) * normalEnergy;
      let newTangent = tangentSpeed * tangentEnergy;

      const spinKick = sideSpin * speed * spinThrow * (0.72 + shallow * 0.55 + speedPressure * 0.10);
      newTangent += spinKick;
      newTangent *= 1 + clamp(runningSpin, -1, 1) * (RAIL_SPIN_OPEN_CLOSE * (0.60 + shallow * 0.65));

      const maxTangent = Math.max(1.15, speed * (1.06 + shallow * 0.18));
      newTangent = clamp(newTangent, -maxTangent, maxTangent);

      b.vx = normalX * newNormal + tangentX * newTangent;
      b.vy = normalY * newNormal + tangentY * newTangent;
    }

    function applyObjectRailDamping(b, rail) {
      if (!b || !rail) return;
      const speed = Math.hypot(b.vx || 0, b.vy || 0);
      const base = railTangentFrictionForCurrentShot();
      const pressureLoss = clamp(speed / MAX_LONG_POWER, 0, 1) * 0.022;
      const tangentialLoss = clamp(base - pressureLoss, 0.91, 0.988);
      if (rail === 'izquierda' || rail === 'derecha') b.vy *= tangentialLoss;
      else b.vx *= tangentialLoss;
    }

    function collideRails(b) {
      let hit = null;
      if (b.x - R < LEFT) { b.x = LEFT + R; b.vx = Math.abs(b.vx) * railRestitutionForCurrentShot(); hit = 'izquierda'; }
      else if (b.x + R > RIGHT) { b.x = RIGHT - R; b.vx = -Math.abs(b.vx) * railRestitutionForCurrentShot(); hit = 'derecha'; }
      if (b.y - R < TOP) { b.y = TOP + R; b.vy = Math.abs(b.vy) * railRestitutionForCurrentShot(); hit = 'superior'; }
      else if (b.y + R > BOTTOM) { b.y = BOTTOM - R; b.vy = -Math.abs(b.vy) * railRestitutionForCurrentShot(); hit = 'inferior'; }
      if (hit && b.id !== 'cue') applyObjectRailDamping(b, hit);
      if (b.id !== 'cue') return;

      const safe = 4;
      if (b.x - R > LEFT + safe) shot.activeRails.delete('izquierda');
      if (b.x + R < RIGHT - safe) shot.activeRails.delete('derecha');
      if (b.y - R > TOP + safe) shot.activeRails.delete('superior');
      if (b.y + R < BOTTOM - safe) shot.activeRails.delete('inferior');

      if (hit && shotActive && !shot.activeRails.has(hit)) {
        shot.activeRails.add(hit);
        applyRailSpin(b, shot.spin, hit);
        shot.spin = scaleSpin(shot.spin, shot.longShotMode ? LONG_RAIL_SPIN_DECAY : NORMAL_RAIL_SPIN_DECAY);
        const nowSound = performance.now();
        if (nowSound - lastRailSound > 65) {
          playSound('rail', Math.hypot(b.vx, b.vy) / MAX_POWER);
          lastRailSound = nowSound;
        }
        if (!shouldCountCueRail()) return;
        shot.cushions++;
        addRailMark(b.x, b.y);
        setGuideText(`<strong>Banda ${shot.cushions}:</strong> ${hit}. Objetivos tocados: ${shot.hitTargets.size}/2. Efecto restante: <span class="route">${Math.round(spinMagnitude(shot.spin) * 100)}%</span>.`);
        updateHUD();
      }
    }

    function practiceGuideSegmentForTarget(shotDef, targetId, fallbackTarget) {
      if (!shotDef || !Array.isArray(shotDef.guidePath) || shotDef.guidePath.length < 3 || !targetId) return null;
      const firstTemplate = Array.isArray(shotDef.balls) ? shotDef.balls.find(ball => ball.id === shotDef.first) : null;
      const targetTemplate = Array.isArray(shotDef.balls) ? shotDef.balls.find(ball => ball.id === targetId) : null;
      const guidePoints = shotDef.guidePath;
      let searchStart = 1;
      if (targetId === shotDef.second && firstTemplate) {
        const firstIdx = nearestPointIndex(guidePoints, firstTemplate, 1);
        searchStart = Math.min(guidePoints.length - 2, Math.max(1, firstIdx + 1));
      }
      const targetRef = targetTemplate || fallbackTarget;
      const idx = nearestPointIndex(guidePoints, targetRef, searchStart);
      const at = guidePoints[Math.max(1, Math.min(idx, guidePoints.length - 2))];
      const next = guidePoints[Math.max(2, Math.min(idx + 1, guidePoints.length - 1))];
      const prev = guidePoints[Math.max(0, Math.min(idx - 1, guidePoints.length - 2))];
      return { index: idx, prev, at, next };
    }

    function cueDeflectionProfileForShot(shotDef, targetId, currentSpeed = 1) {
      const profile = shotDef?.hitProfile || {};
      const thicknessText = String(profile.thickness || '').toLowerCase();
      const cut = Math.abs(Number(profile.cutAngle) || 0);
      let thickness = 0.50;
      if (thicknessText.includes('muy fina')) thickness = 0.12;
      else if (thicknessText.includes('fina')) thickness = 0.25;
      else if (thicknessText.includes('cuarto')) thickness = 0.25;
      else if (thicknessText.includes('media')) thickness = 0.50;
      else if (thicknessText.includes('tres')) thickness = 0.75;
      else if (thicknessText.includes('llena') || thicknessText.includes('gruesa')) thickness = 0.88;
      else if (cut) {
        // Corte alto = bola fina; corte bajo = bola gruesa/llena.
        thickness = clamp(1 - (cut / 90), 0.10, 0.92);
      }
      const firstContact = targetId === shotDef?.first;
      // A menor grosor, la blanca conserva línea y solo corrige un poco.
      // A mayor grosor, la blanca se desvía más y pierde más velocidad.
      let blend = 0.36 + thickness * 0.58;
      let speedKeep = 0.99 - thickness * 0.30;
      if (!firstContact) {
        blend *= 0.82;
        speedKeep += 0.05;
      }
      // Golpes fuertes conservan más desplazamiento después del choque.
      const speedBoost = clamp((currentSpeed - 4) / 14, 0, 1) * 0.08;
      speedKeep = clamp(speedKeep + speedBoost, 0.52, 0.98);
      blend = clamp(blend, 0.30, 0.93);
      return { thickness, blend, speedKeep };
    }

    function applyPracticeCueDeflectionFromGuide(a, b, preCueSpeed = 0, impactSpeed = 0) {
      // No se fuerza ninguna desviación artificial hacia la guía.
      // La desviación debe nacer de la colisión real: dirección del taco,
      // cantidad de bola, velocidad, efecto y rozamiento.
      return;
    }

    function collideBalls(a, b) {
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.hypot(dx, dy);
      const minDist = R * 2;
      const pairKey = [a.id, b.id].sort().join('-');
      if (dist > minDist + 4) {
        shot.activePairs.delete(pairKey);
        return;
      }
      if (dist <= 0) {
        dx = 0.01;
        dy = 0;
        dist = 0.01;
      }
      if (dist >= minDist) return;

      const nx = dx / dist;
      const ny = dy / dist;
      const tx = -ny;
      const ty = nx;
      const overlap = minDist - dist;
      const speedA = Math.hypot(a.vx, a.vy);
      const speedB = Math.hypot(b.vx, b.vy);
      const weightA = speedA > 0.05 ? 0.45 : 0.18;
      const weightB = speedB > 0.05 ? 0.45 : 0.18;
      const totalWeight = weightA + weightB || 1;
      a.x -= nx * overlap * (weightB / totalWeight);
      a.y -= ny * overlap * (weightB / totalWeight);
      b.x += nx * overlap * (weightA / totalWeight);
      b.y += ny * overlap * (weightA / totalWeight);

      const u1n = a.vx * nx + a.vy * ny;
      const u2n = b.vx * nx + b.vy * ny;
      const u1t = a.vx * tx + a.vy * ty;
      const u2t = b.vx * tx + b.vy * ty;
      const relNormal = u1n - u2n;
      if (relNormal <= 0) return;

      const impactSpeed = Math.abs(relNormal);
      let v1n = (u1n + u2n - BALL_RESTITUTION * (u1n - u2n)) / 2;
      let v2n = (u1n + u2n + BALL_RESTITUTION * (u1n - u2n)) / 2;
      let v1t = u1t * BALL_SURFACE_FRICTION;
      let v2t = u2t * BALL_SURFACE_FRICTION;

      const cueIsA = a.id === 'cue';
      const cueIsB = b.id === 'cue';
      if (cueIsA || cueIsB) {
        const spinSide = clamp(shot.spin?.side ?? shot.spin?.x ?? 0, -1, 1);
        const spinFollow = clamp(shot.spin?.follow ?? -(shot.spin?.y || 0), -1, 1);
        const cueSpeed = cueIsA ? speedA : speedB;
        const normalImpactRatio = clamp(impactSpeed / Math.max(cueSpeed, 0.001), 0, 1);
        const cutFraction = 1 - normalImpactRatio;
        const throwAmount = spinSide * impactSpeed * (BALL_THROW + COLLISION_THROW_SCALE * (0.35 + cutFraction));
        const followAmount = clamp(spinFollow * impactSpeed * FOLLOW_DRAW_TRANSFER * (0.74 + normalImpactRatio * 0.42), -1.22, 1.22);
        const slideLoss = 1 - Math.min(0.09, Math.abs(spinFollow) * 0.035 + cutFraction * 0.03);
        v1t *= slideLoss;
        v2t *= slideLoss;
        if (cueIsA) {
          v2t += throwAmount;
          v1t -= throwAmount * (0.24 + cutFraction * 0.16);
          v1n += followAmount;
        } else {
          v1t -= throwAmount;
          v2t += throwAmount * (0.24 + cutFraction * 0.16);
          v2n -= followAmount;
        }
      }

      const preCueSpeed = cueIsA ? speedA : (cueIsB ? speedB : 0);
      const firstCueObjectImpact = shotActive && (cueIsA || cueIsB) && !shot.firstTarget;
      a.vx = nx * v1n + tx * v1t;
      a.vy = ny * v1n + ty * v1t;
      b.vx = nx * v2n + tx * v2t;
      b.vy = ny * v2n + ty * v2t;
      if (firstCueObjectImpact) {
        moderateFirstObjectBallSpeed(cueIsA ? b : a, preCueSpeed);
      }
      if (!shot.activePairs.has(pairKey)) {
        shot.activePairs.add(pairKey);
        const nowSound = performance.now();
        if (shotActive && impactSpeed > 0.20 && nowSound - lastBallSound > 55) {
          playSound('ball', Math.min(1, impactSpeed / MAX_POWER));
          lastBallSound = nowSound;
        }
        registerTargetHit(a, b);
      }
    }

    function registerTargetHit(a, b) {
      if (!shotActive || shotResolved) return;
      let target = null;
      if (a.id === 'cue' && b.id !== 'cue') target = b;
      if (b.id === 'cue' && a.id !== 'cue') target = a;
      if (!target || shot.hitTargets.has(target.id)) return;
      shot.hitTargets.add(target.id);
      if (!shot.firstTarget) shot.firstTarget = target.id;
      else if (!shot.secondTarget) shot.secondTarget = target.id;
      shot.spin = scaleSpin(shot.spin, shot.longShotMode ? LONG_TARGET_SPIN_DECAY : NORMAL_TARGET_SPIN_DECAY);
      if (shot.hitTargets.size === 1) {
        setGuideText(`<strong>Primer objetivo:</strong> ${target.name}. Ahora busca mínimo <span class="route">3 bandas</span> antes de la segunda bola.`);
      }
      if (shot.hitTargets.size === 2) {
        const finalCushions = lockCushionsAtCarom();
        const expected = practiceMode ? currentPracticeShot() : null;
        const firstOk = !expected?.first || shot.firstTarget === expected.first;
        const secondOk = !expected?.second || shot.secondTarget === expected.second;
        const bandsOk = finalCushions >= 3;
        if (bandsOk && firstOk && secondOk) {
          shot.result = 'point';
          shotResolved = true;
          if (!shot.demoMode || DEMO_COUNTS_AS_SCORE) score++;
          playSound('point', 1);
          const label = expected ? ` Jugada ${expected.code}: primera bola ${ballLabel(expected.first)} y cierre en ${ballLabel(expected.second)}.` : '';
          const scoreText = shot.demoMode && !DEMO_COUNTS_AS_SCORE ? ' Demostración: no suma punto.' : ' +1 punto.';
          setGuideText(`<span class="ok">¡Carambola válida!</span>${label} La blanca completó ${finalCushions} bandas antes de la segunda bola.${scoreText}`);
        } else {
          shot.result = 'miss';
          shotResolved = true;
          const orderMsg = expected && (!firstOk || !secondOk)
            ? ` Orden esperado de la guía base: primero ${ballLabel(expected.first)} y después ${ballLabel(expected.second)}. Tocaste primero ${ballLabel(shot.firstTarget || 'ninguna')} y después ${ballLabel(shot.secondTarget || 'ninguna')}.`
            : '';
          const bandsMsg = bandsOk ? `Bandas registradas: ${finalCushions}.` : `Tocaste la segunda bola con solo ${finalCushions} banda(s); deben ser mínimo 3.`;
          if (bandsOk && expected && (!firstOk || !secondOk)) {
            shot.result = 'point';
            shot.shotSource = 'jugada-propia';
            if (!shot.demoMode || DEMO_COUNTS_AS_SCORE) score++;
            playSound('point', .82);
            setGuideText(`<span class="ok">Carambola alternativa válida.</span> La jugada se dio con otro sistema físico y completó ${finalCushions} bandas. La iluminación pertenece a la guía predictiva cuando esta anticipa 3 o más bandas. ${orderMsg}`);
          } else {
            playSound('fail', 1);
            setGuideText(`<span class="bad">No vale.</span> ${bandsMsg}${orderMsg}`);
          }
        }
        updateHUD();
      }
    }

    function finishShot() {
      captureShotFrame(true);
      lastShotFrames = currentShotFrames.map(frame => frame.map(f => ({ ...f })));
      currentShotFrames = [];
      shotActive = false;
      shotResolved = true;
      // Al terminar la jugada se borra la línea real recorrida por la tacada.
      // El replay sigue disponible porque los fotogramas ya quedaron guardados en lastShotFrames.
      path = [];
      pathLine.setAttribute('points', '');
      if (practiceMode) lastPracticeFeedback = practiceFeedbackText();
      setReplayReady(!!lastShotSnapshot);
      updateFloatingControls();
      if (shot.result === 'point' || shot.result === 'miss') {
        if (!restorePredictiveFinalIllumination()) updateGuidesSoon();
        return;
      }
      if (shot.hitTargets.size < 2) {
        playSound('fail', .8);
        const extra = practiceMode ? `<br>${practiceFeedbackText()}` : '';
        setGuideText(`<span class="bad">Tiro fallido.</span> Tocaste ${shot.hitTargets.size} bola(s) objetivo y ${countedCushionsForHUD()} banda(s). Ajusta taco, efecto o potencia y vuelve a tirar.${extra}`);
      } else if (shot.cushions < 3) {
        playSound('fail', .8);
        const extra = practiceMode ? `<br>${practiceFeedbackText()}` : '';
        setGuideText(`<span class="bad">Faltaron bandas.</span> Completaste las bolas, pero solo con ${countedCushionsForHUD()} banda(s).${extra}`);
      }
      updateHUD();
      if (!restorePredictiveFinalIllumination()) updateGuidesSoon();
    }

    function renderPath() {
      if (!guide || path.length < 2) { pathLine.setAttribute('points', ''); return; }
      pathLine.setAttribute('points', path.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));
    }

    function stepPhysics() {
      if (practiceVideoMotion) {
        stepPracticeVideoMotion();
        renderBalls();
        return;
      }

      const maxSpeed = Math.max(...balls.map(b => Math.hypot(b.vx, b.vy)), 0);
      const subSteps = Math.max(1, Math.min(10, Math.ceil(maxSpeed / PHYSICS_MAX_STEP)));
      for (let sub = 0; sub < subSteps; sub++) {
        for (const b of balls) {
          b.x += b.vx / subSteps;
          b.y += b.vy / subSteps;
          collideRails(b);
        }
        for (let i = 0; i < balls.length; i++) {
          for (let j = i + 1; j < balls.length; j++) collideBalls(balls[i], balls[j]);
        }
      }

      for (const b of balls) {
        if (shotActive && b.id === 'cue') applyCueSwerveBySpin(b, shot.spin);
        const frameFriction = dynamicClothFrictionForBall(b, shotActive && b.id === 'cue' ? shot.spin : null, frictionForCurrentShot());
        b.vx *= frameFriction;
        b.vy *= frameFriction;
        if (Math.hypot(b.vx, b.vy) < STOP_SPEED) { b.vx = 0; b.vy = 0; }
      }
      if (shotActive) shot.spin = scaleSpin(shot.spin, SPIN_CLOTH_DECAY);

      if (shotActive) {
        const cue = ball('cue');
        const last = path[path.length - 1];
        if (!last || Math.hypot(cue.x - last.x, cue.y - last.y) > 6) {
          path.push({ x: cue.x, y: cue.y });
          if (path.length > 230) path.shift();
          renderPath();
        }
        captureShotFrame();
      }
      if (shotActive && allStopped()) finishShot();
      renderBalls();
    }

    function simulateShot(vx, vy, spin = { x: 0, y: 0 }, maxSteps = 1200) {
      // v181: la simulación física se usa cuando el jugador se sale de la guía principal, conservando visible la referencia verde.
      // Debe usar los mismos parámetros que la tacada real: potencia, modo largo,
      // decaimiento de efecto, bandas, rozamiento y corrección de choques.
      const activePractice = practiceMode ? currentPracticeShot() : null;
      const simLongShot = longShotModeForCurrentSetup(vx, vy, activePractice);
      const simFriction = frictionForCurrentShot();
      const simRailRestitution = railRestitutionForCurrentShot();
      const simRailTangentFriction = railTangentFrictionForCurrentShot();
      const simSpinThrow = spinThrowForCurrentShot();
      const simRailSpinDecay = simLongShot ? LONG_RAIL_SPIN_DECAY : NORMAL_RAIL_SPIN_DECAY;
      const simTargetSpinDecay = simLongShot ? LONG_TARGET_SPIN_DECAY : NORMAL_TARGET_SPIN_DECAY;
      const simBalls = balls.map(b => ({ ...b, vx: 0, vy: 0 }));
      const cue = simBalls.find(b => b.id === 'cue');
      if (!cue) return { cushions: 0, events: [], points: [] };
      cue.vx = vx;
      cue.vy = vy;
      const sim = {
        cushions: 0,
        scoringCushions: null,
        activeRails: new Set(),
        activePairs: new Set(),
        hitTargets: new Set(),
        firstTarget: null,
        secondTarget: null,
        spin: cloneSpin(spin),
        events: [],
        points: [{ x: cue.x, y: cue.y }]
      };
      const stopped = () => simBalls.every(b => Math.hypot(b.vx, b.vy) < STOP_SPEED);

      function pushCuePoint(force = false) {
        const last = sim.points[sim.points.length - 1];
        if (force || !last || Math.hypot(cue.x - last.x, cue.y - last.y) > 6) {
          sim.points.push({ x: cue.x, y: cue.y });
          if (sim.points.length > 260) sim.points.shift();
        }
      }

      function addRailEvent(hit, b) {
        if (sim.activeRails.has(hit) || sim.secondTarget) return;
        sim.activeRails.add(hit);
        applyRailSpin(b, sim.spin, hit, {
          railRestitution: simRailRestitution,
          railTangentFriction: simRailTangentFriction,
          spinThrow: simSpinThrow
        });
        sim.spin = scaleSpin(sim.spin, simRailSpinDecay);
        sim.cushions++;
        sim.events.push({ type: 'rail', name: hit, n: sim.cushions, x: b.x, y: b.y });
      }

      function collideSimRails(b) {
        let hit = null;
        if (b.x - R < LEFT) { b.x = LEFT + R; b.vx = Math.abs(b.vx) * simRailRestitution; hit = 'izquierda'; }
        else if (b.x + R > RIGHT) { b.x = RIGHT - R; b.vx = -Math.abs(b.vx) * simRailRestitution; hit = 'derecha'; }
        if (b.y - R < TOP) { b.y = TOP + R; b.vy = Math.abs(b.vy) * simRailRestitution; hit = 'superior'; }
        else if (b.y + R > BOTTOM) { b.y = BOTTOM - R; b.vy = -Math.abs(b.vy) * simRailRestitution; hit = 'inferior'; }
        if (hit && b.id !== 'cue') applyObjectRailDamping(b, hit);
        if (b.id !== 'cue') return;
        const safe = 4;
        if (b.x - R > LEFT + safe) sim.activeRails.delete('izquierda');
        if (b.x + R < RIGHT - safe) sim.activeRails.delete('derecha');
        if (b.y - R > TOP + safe) sim.activeRails.delete('superior');
        if (b.y + R < BOTTOM - safe) sim.activeRails.delete('inferior');
        if (hit) addRailEvent(hit, b);
      }

      function registerSimTarget(a, b) {
        let target = null;
        if (a.id === 'cue' && b.id !== 'cue') target = b;
        if (b.id === 'cue' && a.id !== 'cue') target = a;
        if (!target || sim.hitTargets.has(target.id)) return;
        sim.hitTargets.add(target.id);
        const order = sim.hitTargets.size;
        const ev = { type: 'target', id: target.id, name: target.name, order, cushions: sim.cushions, x: target.x, y: target.y };
        sim.events.push(ev);
        if (order === 1) sim.firstTarget = ev;
        if (order === 2) { sim.secondTarget = ev; sim.scoringCushions = sim.cushions; }
        sim.spin = scaleSpin(sim.spin, simTargetSpinDecay);
      }

      function collideSimBalls(a, b) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let dist = Math.hypot(dx, dy);
        const minDist = R * 2;
        const pairKey = [a.id, b.id].sort().join('-');
        if (dist > minDist + 4) {
          sim.activePairs.delete(pairKey);
          return;
        }
        if (dist <= 0) { dx = 0.01; dy = 0; dist = 0.01; }
        if (dist >= minDist) return;

        const nx = dx / dist;
        const ny = dy / dist;
        const tx = -ny;
        const ty = nx;
        const overlap = minDist - dist;
        const speedA = Math.hypot(a.vx, a.vy);
        const speedB = Math.hypot(b.vx, b.vy);
        const weightA = speedA > 0.05 ? 0.45 : 0.18;
        const weightB = speedB > 0.05 ? 0.45 : 0.18;
        const totalWeight = weightA + weightB || 1;
        a.x -= nx * overlap * (weightB / totalWeight);
        a.y -= ny * overlap * (weightB / totalWeight);
        b.x += nx * overlap * (weightA / totalWeight);
        b.y += ny * overlap * (weightA / totalWeight);

        const u1n = a.vx * nx + a.vy * ny;
        const u2n = b.vx * nx + b.vy * ny;
        const u1t = a.vx * tx + a.vy * ty;
        const u2t = b.vx * tx + b.vy * ty;
        const relNormal = u1n - u2n;
        if (relNormal <= 0) return;

        const impactSpeed = Math.abs(relNormal);
        let v1n = (u1n + u2n - BALL_RESTITUTION * (u1n - u2n)) / 2;
        let v2n = (u1n + u2n + BALL_RESTITUTION * (u1n - u2n)) / 2;
        let v1t = u1t * BALL_SURFACE_FRICTION;
        let v2t = u2t * BALL_SURFACE_FRICTION;

        const cueIsA = a.id === 'cue';
        const cueIsB = b.id === 'cue';
        if (cueIsA || cueIsB) {
          const spinSide = clamp(sim.spin?.side ?? sim.spin?.x ?? 0, -1, 1);
          const spinFollow = clamp(sim.spin?.follow ?? -(sim.spin?.y || 0), -1, 1);
          const cueSpeed = cueIsA ? speedA : speedB;
          const normalImpactRatio = clamp(impactSpeed / Math.max(cueSpeed, 0.001), 0, 1);
          const cutFraction = 1 - normalImpactRatio;
          const throwAmount = spinSide * impactSpeed * (BALL_THROW + COLLISION_THROW_SCALE * (0.35 + cutFraction));
          const followAmount = clamp(spinFollow * impactSpeed * FOLLOW_DRAW_TRANSFER * (0.74 + normalImpactRatio * 0.42), -1.22, 1.22);
          const slideLoss = 1 - Math.min(0.09, Math.abs(spinFollow) * 0.035 + cutFraction * 0.03);
          v1t *= slideLoss;
          v2t *= slideLoss;
          if (cueIsA) {
            v2t += throwAmount;
            v1t -= throwAmount * (0.24 + cutFraction * 0.16);
            v1n += followAmount;
          } else {
            v1t -= throwAmount;
            v2t += throwAmount * (0.24 + cutFraction * 0.16);
            v2n -= followAmount;
          }
        }

        const preCueSpeed = cueIsA ? speedA : (cueIsB ? speedB : 0);
        const firstCueObjectImpact = (cueIsA || cueIsB) && !sim.firstTarget;
        a.vx = nx * v1n + tx * v1t;
        a.vy = ny * v1n + ty * v1t;
        b.vx = nx * v2n + tx * v2t;
        b.vy = ny * v2n + ty * v2t;
        if (firstCueObjectImpact) {
          moderateFirstObjectBallSpeed(cueIsA ? b : a, preCueSpeed);
        }
        if (!sim.activePairs.has(pairKey)) {
          sim.activePairs.add(pairKey);
          registerSimTarget(a, b);
        }
      }

      for (let step = 0; step < maxSteps; step++) {
        const maxSpeed = Math.max(...simBalls.map(b => Math.hypot(b.vx, b.vy)), 0);
        const subSteps = Math.max(1, Math.min(10, Math.ceil(maxSpeed / PHYSICS_MAX_STEP)));
        for (let sub = 0; sub < subSteps; sub++) {
          for (const b of simBalls) {
            b.x += b.vx / subSteps;
            b.y += b.vy / subSteps;
            collideSimRails(b);
          }
          for (let i = 0; i < simBalls.length; i++) {
            for (let j = i + 1; j < simBalls.length; j++) collideSimBalls(simBalls[i], simBalls[j]);
          }
        }
        for (const b of simBalls) {
          if (b.id === 'cue') applyCueSwerveBySpin(b, sim.spin);
          const f = dynamicClothFrictionForBall(b, b.id === 'cue' ? sim.spin : null, simFriction);
          b.vx *= f;
          b.vy *= f;
          if (Math.hypot(b.vx, b.vy) < STOP_SPEED) { b.vx = 0; b.vy = 0; }
        }
        sim.spin = scaleSpin(sim.spin, SPIN_CLOTH_DECAY);
        pushCuePoint(false);
        if (sim.secondTarget && sim.secondTarget.cushions >= 3) break;
        if (stopped()) break;
      }
      pushCuePoint(true);
      return sim;
    }

    function loop() {
      stepPhysics();
      requestAnimationFrame(loop);
    }
    const DRIVE_VIDEO_FILE_ID = '1JCC4aoJQ8q_wCdvEyT5iBR3wzx2HoEah';
    const YOUTUBE_VIDEO_ID = 'yHSlryjw8z0';
    const DRIVE_VIDEO_BASE_SRC = `https://drive.google.com/file/d/${DRIVE_VIDEO_FILE_ID}/preview`;
    const YOUTUBE_VIDEO_BASE_SRC = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}`;
    const DRIVE_VIDEO_IFRAME_CODE = `<iframe src="${DRIVE_VIDEO_BASE_SRC}" width="640" height="360"></iframe>`;
    let driveVideoReloadKey = 0;

    const VIDEO_CACHE_KEY = 'billar3b.videoIframeCache.v204';
    const DRIVE_IFRAME_CODE_KEY = 'billar3b.iframeCode.v204';
    const VIDEO_CACHE_VERSION = 204;
    const VIDEO_CACHE_MAX_ENTRIES = 180;
    let videoCacheMemory = null;

    function canUseLocalStorage() {
      try {
        const k = '__b3b_test__';
        window.localStorage.setItem(k, '1');
        window.localStorage.removeItem(k);
        return true;
      } catch (err) {
        return false;
      }
    }

    const VIDEO_LOCAL_STORAGE_ENABLED = canUseLocalStorage();

    function saveDriveIframeCodeOnly() {
      if (!VIDEO_LOCAL_STORAGE_ENABLED) return;
      try {
        window.localStorage.setItem(DRIVE_IFRAME_CODE_KEY, DRIVE_VIDEO_IFRAME_CODE);
      } catch (err) {}
    }

    function readVideoGuideCache() {
      if (videoCacheMemory) return videoCacheMemory;
      const empty = { version: VIDEO_CACHE_VERSION, driveFileId: DRIVE_VIDEO_FILE_ID, iframeCode: DRIVE_VIDEO_IFRAME_CODE, baseSrc: DRIVE_VIDEO_BASE_SRC, lastShot: '', entries: {} };
      if (!VIDEO_LOCAL_STORAGE_ENABLED) { videoCacheMemory = empty; return videoCacheMemory; }
      try {
        const raw = window.localStorage.getItem(VIDEO_CACHE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!parsed || parsed.version !== VIDEO_CACHE_VERSION || parsed.driveFileId !== DRIVE_VIDEO_FILE_ID || !parsed.entries) {
          videoCacheMemory = empty;
        } else {
          videoCacheMemory = parsed;
          videoCacheMemory.driveFileId = DRIVE_VIDEO_FILE_ID;
          videoCacheMemory.iframeCode = DRIVE_VIDEO_IFRAME_CODE;
          videoCacheMemory.baseSrc = DRIVE_VIDEO_BASE_SRC;
        }
      } catch (err) {
        videoCacheMemory = empty;
      }
      return videoCacheMemory;
    }

    function writeVideoGuideCache() {
      if (!VIDEO_LOCAL_STORAGE_ENABLED || !videoCacheMemory) return;
      saveDriveIframeCodeOnly();
      try {
        videoCacheMemory.driveFileId = DRIVE_VIDEO_FILE_ID;
        videoCacheMemory.iframeCode = DRIVE_VIDEO_IFRAME_CODE;
        videoCacheMemory.baseSrc = DRIVE_VIDEO_BASE_SRC;
        videoCacheMemory.updatedAt = Date.now();
        const entries = videoCacheMemory.entries || {};
        const keys = Object.keys(entries);
        if (keys.length > VIDEO_CACHE_MAX_ENTRIES) {
          keys
            .sort((a, b) => (entries[a].usedAt || 0) - (entries[b].usedAt || 0))
            .slice(0, keys.length - VIDEO_CACHE_MAX_ENTRIES)
            .forEach(k => delete entries[k]);
        }
        window.localStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(videoCacheMemory));
      } catch (err) {
        // Si el navegador bloquea o llena localStorage, la app sigue funcionando sin caché.
      }
    }

    function videoCacheShotKey(shot, autoplay = true) {
      const code = String(shot?.code || videoSeekShot()?.code || '001').padStart(3, '0');
      return `${code}:${autoplay ? 'auto' : 'manual'}`;
    }

    function buildVideoCacheEntry(shot, autoplay = true) {
      const startSeconds = Math.max(0, Math.floor(videoShotStartSeconds(shot) || 0));
      const endSeconds = videoShotEndSeconds(shot);
      const safeEnd = Number.isFinite(endSeconds) ? Math.floor(endSeconds) : null;
      const code = String(shot?.code || '').padStart(3, '0');
      const syncToken = `${DRIVE_VIDEO_FILE_ID}|${code}|${startSeconds}|${safeEnd || ''}|${autoplay ? 1 : 0}|v${VIDEO_CACHE_VERSION}`;
      return {
        code,
        driveFileId: DRIVE_VIDEO_FILE_ID,
        iframeCode: DRIVE_VIDEO_IFRAME_CODE,
        startSeconds,
        endSeconds: safeEnd,
        autoplay: !!autoplay,
        src: buildDrivePreviewUrlAtTime(startSeconds, autoplay, safeEnd, code, false),
        syncToken,
        usedAt: Date.now()
      };
    }

    function getCachedVideoEntry(shot, autoplay = true) {
      const cache = readVideoGuideCache();
      const key = videoCacheShotKey(shot, autoplay);
      const fresh = buildVideoCacheEntry(shot, autoplay);
      const cached = cache.entries[key];
      if (cached && cached.syncToken === fresh.syncToken && cached.src) {
        cached.usedAt = Date.now();
        cache.lastShot = fresh.code;
        writeVideoGuideCache();
        return cached;
      }
      cache.entries[key] = fresh;
      cache.lastShot = fresh.code;
      writeVideoGuideCache();
      return fresh;
    }

    function warmVideoGuideCacheAround(index = practiceIndex) {
      const center = Number.isFinite(index) ? index : practiceIndex;
      const candidates = [center, center - 1, center + 1, center + 2].filter(i => practiceShots[i]);
      for (const i of candidates) {
        getCachedVideoEntry(practiceShots[i], false);
        getCachedVideoEntry(practiceShots[i], true);
      }
    }

    function primeVideoGuideCacheSoon() {
      const prime = () => {
        try {
          for (let i = 0; i < practiceShots.length; i++) getCachedVideoEntry(practiceShots[i], false);
        } catch (err) {}
      };
      if ('requestIdleCallback' in window) window.requestIdleCallback(prime, { timeout: 2200 });
      else setTimeout(prime, 900);
    }

    const VIDEO_SEEK_PREROLL = 0;
    const ESTIMATED_VIDEO_FIRST_START_SECONDS = 32;
    const ESTIMATED_VIDEO_SHOT_026_SECONDS = 1425;
    const ESTIMATED_VIDEO_SHOT_060_SECONDS = 3270;
    const ESTIMATED_VIDEO_SECONDS_PER_SHOT = 55.72;

    function formatVideoTimestamp(totalSeconds) {
      const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
      const hh = Math.floor(seconds / 3600);
      const mm = Math.floor((seconds % 3600) / 60);
      const ss = seconds % 60;
      if (hh > 0) return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
      return `${mm}:${String(ss).padStart(2, '0')}`;
    }

    function estimateVideoFrameTimes(code) {
      const n = parseInt(String(code || ''), 10);
      if (!Number.isFinite(n) || n < 1) return null;
      let estimatedPosition;
      if (n < 26) {
        estimatedPosition = ESTIMATED_VIDEO_SHOT_026_SECONDS - ((26 - n) * ESTIMATED_VIDEO_SECONDS_PER_SHOT);
      } else if (n > 60) {
        estimatedPosition = ESTIMATED_VIDEO_SHOT_060_SECONDS + ((n - 60) * ESTIMATED_VIDEO_SECONDS_PER_SHOT);
      } else {
        estimatedPosition = ESTIMATED_VIDEO_FIRST_START_SECONDS + ((n - 1) * ESTIMATED_VIDEO_SECONDS_PER_SHOT);
      }
      return {
        posicion: formatVideoTimestamp(estimatedPosition),
        recorrido: formatVideoTimestamp(estimatedPosition + 10),
        estimated: true
      };
    }

    const VIDEO_SYNC_LOCKED_SHOTS = {
      "115": { posicion: "1:33:42", recorrido: "1:34:58", synced: true, exact: true },
      "127": { posicion: "1:43:42", recorrido: "1:44:58", synced: true, exact: true },
      "132": { posicion: "1:48:03", recorrido: "1:48:58", synced: true, exact: true },
      "134": { posicion: "1:49:54", recorrido: "1:50:58", synced: true, exact: true },
      "135": { posicion: "1:50:51", recorrido: "1:51:58", synced: true, exact: true },
      "136": { posicion: "1:51:45", recorrido: "1:52:58", synced: true, exact: true },
      "140": { posicion: "1:55:26", recorrido: "1:56:43", synced: true, exact: true },
      "147": { posicion: "2:01:11", recorrido: "2:02:58", synced: true, exact: true },
      "149": { posicion: "2:02:49", recorrido: "2:04:25", synced: true, exact: true }
    };

    let videoSegmentEndSeconds = null;
    let videoSegmentShotCode = null;

    function activateVideoAudio() {
      // El video se reproduce en un iframe de Google Drive y se carga únicamente al abrir el modal.
      return true;
    }

    function practiceVideoMeta(shot) {
      if (!shot) return null;
      const key = String(shot.code || '').padStart(3, '0');
      if (key !== '080' && VIDEO_SYNC_LOCKED_SHOTS[key]) return VIDEO_SYNC_LOCKED_SHOTS[key];
      return shot.videoFrameTimes || VIDEO_ANALYSIS_026_060[shot.code] || estimateVideoFrameTimes(shot.code);
    }

    function videoShotStartSeconds(shot) {
      const meta = practiceVideoMeta(shot);
      const timestamp = meta && (meta.posicion || meta.recorrido);
      return parseVideoTimestamp(timestamp);
    }

    function videoShotEndSeconds(shot) {
      if (!shot) return null;
      const idx = practiceShots.findIndex(item => item && item.code === shot.code);
      const next = idx >= 0 ? practiceShots[idx + 1] : null;
      const start = videoShotStartSeconds(shot);
      const nextStart = next ? videoShotStartSeconds(next) : 0;
      if (Number.isFinite(nextStart) && nextStart > start + 4) return Math.max(start + 2, nextStart - 0.30);
      const meta = practiceVideoMeta(shot);
      const recorrido = meta ? parseVideoTimestamp(meta.recorrido) : 0;
      if (Number.isFinite(recorrido) && recorrido > start + 4) return recorrido + 8;
      return start + 48;
    }

    function updateVideoModalStatus(shot) {
      if (!videoModalStatus) return;
      const s = shot || videoSeekShot();
      const start = s ? formatVideoTimestamp(videoShotStartSeconds(s)) : '';
      videoModalStatus.textContent = s ? `Jugada ${s.code} · inicia en ${start} del videotutorial` : 'Jugada actual';
      if (videoTitle && s) videoTitle.textContent = `Videotutorial · Jugada ${String(s.code || '').padStart(3, '0')} · ${start}`;
      renderVideoObservation(s);
    }

    function enforceVideoSegmentEnd() {
      // En iframe externo no se controla el tiempo interno por JS; se recarga con start=segundos.
      return;
    }

    function parseVideoTimestamp(value) {
      if (!value || typeof value !== 'string') return 0;
      const parts = value.trim().split(':').map(n => parseFloat(n));
      if (parts.some(n => !Number.isFinite(n))) return 0;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return parts[0] || 0;
    }

    function selectedPracticeIndex() {
      const selectedIndex = practiceSelect ? parseInt(practiceSelect.value || String(practiceIndex), 10) : practiceIndex;
      return Number.isFinite(selectedIndex) && practiceShots[selectedIndex] ? selectedIndex : practiceIndex;
    }

    function forcePracticeShotForVideo(index = practiceIndex, autoplay = true) {
      const safeIndex = (index + practiceShots.length) % practiceShots.length;
      const s = practiceShots[safeIndex];
      if (!s) return currentPracticeShot();
      cancelCurrentShotForPracticeChange();
      stopAllBalls();
      shotActive = false;
      replayingMotion = false;
      placingMode = false;
      practiceIndex = safeIndex;
      practiceMode = true;
      guide = true;
      if (guideBtn) guideBtn.textContent = 'Guía: ON';
      if (practiceSelect) practiceSelect.value = String(practiceIndex);
      practicePanel.classList.add('open', 'manual-open');
      syncPlacementUI();
      balls = cloneBalls(s.balls);
      applyPracticeSetup(s, false);
      deflectionGuideMode = 'imagen';
      // No se recalcula la física pesada al abrir video/imagen para mantener el modal rápido,
      // pero sí se aplica la posición/efecto de Imagen jugada a la guía y a la tacada.
      lastPracticeFeedback = '';
      clearReplayShot();
      setMode('libre', false);
      resetShotState();
      applyImageContactToCue(s, false, { softStart: true });
      renderPracticeMarkers();
      renderBalls();
      updateHUD();
      updateFloatingControls();
      syncPracticeUI();
      preloadPracticeImagesAround(practiceIndex);
      warmVideoGuideCacheAround(practiceIndex);
      syncEasyAlignUI();
      updateDeflectionGuide();
      updateGuidesSoon();
      if (videoModal && videoModal.classList.contains('open')) {
        renderVideoModalImages(true);
        updateVideoModalStatus(s);
        loadDriveVideoAtPracticeShot(s, autoplay);
      }
      return s;
    }

    function ensureSelectedPracticeShotForVideo() {
      const selectedIndex = selectedPracticeIndex();
      if (!practiceMode || selectedIndex !== practiceIndex) {
        return forcePracticeShotForVideo(selectedIndex, false);
      }
      if (practiceSelect && practiceShots[practiceIndex]) {
        practiceSelect.value = String(practiceIndex);
      }
      return currentPracticeShot();
    }

    function videoSeekShot() {
      const selectedIndex = selectedPracticeIndex();
      if (practiceShots[selectedIndex]) return practiceShots[selectedIndex];
      return currentPracticeShot();
    }


    function shouldUseMobileVideoPlayer() {
      const ua = String(navigator.userAgent || navigator.vendor || '').toLowerCase();
      const mobileUA = /android|iphone|ipad|ipod|mobile|miuibrowser|safari/.test(ua) && !/windows nt|macintosh; intel mac os x/.test(ua);
      const coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const narrow = window.matchMedia && window.matchMedia('(max-width: 860px)').matches;
      const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
      return !!(mobileUA || coarsePointer || narrow || standalone);
    }

    function buildYouTubeEmbedUrlAtTime(seconds = 0, autoplay = true, endSeconds = null, shotCode = '') {
      const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
      const safeCode = String(shotCode || videoSeekShot()?.code || '001').padStart(3, '0');
      const params = new URLSearchParams();
      params.set('start', String(safeSeconds));
      params.set('rel', '0');
      params.set('modestbranding', '1');
      params.set('playsinline', '1');
      params.set('controls', '1');
      params.set('fs', '1');
      params.set('iv_load_policy', '3');
      params.set('disablekb', '0');
      params.set('enablejsapi', '0');
      params.set('origin', window.location.origin || 'https://yoguis.github.io');
      params.set('shot', safeCode);
      params.set('sync', `v${VIDEO_CACHE_VERSION}`);
      if (autoplay) params.set('autoplay', '1');
      if (Number.isFinite(endSeconds)) params.set('end', String(Math.max(safeSeconds + 1, Math.floor(endSeconds))));
      return `${YOUTUBE_VIDEO_BASE_SRC}?${params.toString()}`;
    }

    function buildBestVideoUrlAtTime(seconds = 0, autoplay = true, endSeconds = null, shotCode = '', cacheBust = false) {
      return shouldUseMobileVideoPlayer()
        ? buildYouTubeEmbedUrlAtTime(seconds, autoplay, endSeconds, shotCode)
        : buildDrivePreviewUrlAtTime(seconds, autoplay, endSeconds, shotCode, cacheBust);
    }

    function setVideoProviderDataset() {
      if (!videoFrame) return;
      const provider = shouldUseMobileVideoPlayer() ? 'youtube-mobile' : 'drive-desktop';
      videoFrame.dataset.videoProvider = provider;
      const wrap = videoFrame.closest ? videoFrame.closest('.video-frame-wrap') : null;
      if (wrap) wrap.dataset.videoProvider = provider;
    }

    function buildDrivePreviewUrlAtTime(seconds = 0, autoplay = true, endSeconds = null, shotCode = '', cacheBust = false) {
      // Código original solicitado y guardado en localStorage:
      // <iframe src="https://drive.google.com/file/d/1JCC4aoJQ8q_wCdvEyT5iBR3wzx2HoEah/preview" width="640" height="480"></iframe>
      // Para sincronizar la jugada seleccionada, se conserva el preview de Drive y
      // se agregan parámetros de tiempo. Drive puede ignorar algunos parámetros,
      // pero el hash #t=segundos funciona como marcador temporal y el query fuerza
      // que el iframe se recargue al cambiar de jugada.
      const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
      const safeCode = String(shotCode || videoSeekShot()?.code || '001').padStart(3, '0');
      const params = new URLSearchParams();
      const h = Math.floor(safeSeconds / 3600);
      const m = Math.floor((safeSeconds % 3600) / 60);
      const sec = safeSeconds % 60;
      const fragmentHms = h > 0 ? `${h}h${m}m${sec}s` : `${m}m${sec}s`;
      const fragment = String(safeSeconds);
      params.set('start', String(safeSeconds));
      params.set('t', `${safeSeconds}s`);
      params.set('time', fragmentHms);
      params.set('shot', safeCode);
      params.set('autoplay', autoplay ? '1' : '0');
      params.set('sync', `v${VIDEO_CACHE_VERSION}`);
      if (Number.isFinite(endSeconds)) params.set('end', String(Math.max(safeSeconds + 1, Math.floor(endSeconds))));
      if (cacheBust || VIDEO_SYNC_LOCKED_SHOTS[safeCode]) params.set('_reload', String(++driveVideoReloadKey));
      return `${DRIVE_VIDEO_BASE_SRC}?${params.toString()}#t=${fragment}`;
    }


    function loadDriveVideoAtPracticeShot(shot, autoplay = true) {
      if (!videoFrame || videoFrame.tagName !== 'IFRAME' || !shot) return false;
      const entry = getCachedVideoEntry(shot, autoplay);
      const startSeconds = Math.max(0, Math.floor(entry.startSeconds || 0));
      const endSeconds = Number.isFinite(entry.endSeconds) ? entry.endSeconds : videoShotEndSeconds(shot);
      const exactSyncShot = !!VIDEO_SYNC_LOCKED_SHOTS[String(shot?.code || '').padStart(3, '0')];
      videoSegmentEndSeconds = Number.isFinite(endSeconds) ? endSeconds : null;
      videoSegmentShotCode = shot ? shot.code : null;
      setVideoProviderDataset();
      const src = buildBestVideoUrlAtTime(startSeconds, autoplay, endSeconds, shot?.code || '', exactSyncShot || true);
      const previousShot = videoFrame.dataset.currentShot || '';
      const previousStart = videoFrame.dataset.currentStart || '';
      const previousProvider = videoFrame.dataset.previousProvider || '';
      videoFrame.dataset.currentShot = shot?.code || '';
      videoFrame.dataset.currentStart = String(startSeconds);
      videoFrame.dataset.currentEnd = Number.isFinite(endSeconds) ? String(Math.floor(endSeconds)) : '';
      videoFrame.dataset.driveFileId = DRIVE_VIDEO_FILE_ID;
      videoFrame.dataset.youtubeId = YOUTUBE_VIDEO_ID;

      // Al cambiar de jugada se descarga primero el iframe. Esto evita que Google Drive/YouTube móvil
      // conserve el tiempo anterior y hace que Anterior/Siguiente arranquen en el
      // marcador exacto guardado para cada jugada.
      const mustReload = videoFrame.getAttribute('src') !== src || previousShot !== shot.code || previousStart !== String(startSeconds) || previousProvider !== videoFrame.dataset.videoProvider;
      if (mustReload) {
        videoFrame.dataset.previousProvider = videoFrame.dataset.videoProvider || '';
        videoFrame.setAttribute('src', 'about:blank');
        window.setTimeout(() => {
          if (!videoModal || !videoModal.classList.contains('open')) return;
          if (videoFrame.dataset.currentShot === shot.code && videoFrame.dataset.currentStart === String(startSeconds)) {
            videoFrame.setAttribute('src', src);
          }
        }, exactSyncShot ? 140 : 90);
      }
      warmVideoGuideCacheAround(selectedPracticeIndex());
      return true;
    }

    function seekVideoToPracticeShot(autoplay = true) {
      const s = ensureSelectedPracticeShotForVideo();
      const rawStartSeconds = videoShotStartSeconds(s);
      const startSeconds = Number.isFinite(rawStartSeconds) ? Math.max(0, rawStartSeconds) : 0;
      const endSeconds = videoShotEndSeconds(s);
      const label = s ? `Jugada ${s.code}` : 'jugada actual';

      videoSegmentEndSeconds = Number.isFinite(endSeconds) ? endSeconds : null;
      videoSegmentShotCode = s ? s.code : null;
      renderVideoModalImages();
      updateVideoModalStatus(s);

      if (s) loadDriveVideoAtPracticeShot(s, autoplay);

      if (s) {
        setGuideText(`<strong>Videotutorial:</strong> se cargó <span class="route">${label}</span> con el tiempo de inicio sincronizado y las imágenes de referencia.`);
      }
    }

    function openVideoModal() {
      unlockAudio();
      playSound('ui', .45);
      videoModal.classList.add('open');
      videoModal.setAttribute('aria-hidden', 'false');
      const s = forcePracticeShotForVideo(selectedPracticeIndex(), true);
      if (practiceSelect && s) practiceSelect.value = String(practiceIndex);
      renderVideoModalImages(true);
      updateVideoModalStatus(s);
      loadDriveVideoAtPracticeShot(s, true);
      if (s) {
        const start = formatVideoTimestamp(videoShotStartSeconds(s));
        setGuideText(`<strong>Videotutorial:</strong> la jugada <span class="route">${s.code}</span> se abrió en <span class="route">${start}</span>. Usa Anterior/Siguiente para saltar a la jugada exacta.`);
      }
    }

    function stepVideoModalShot(delta) {
      const currentIndex = selectedPracticeIndex();
      const nextIndex = (currentIndex + delta + practiceShots.length) % practiceShots.length;
      const s = forcePracticeShotForVideo(nextIndex, true);
      renderVideoModalImages(true);
      updateVideoModalStatus(s);
      loadDriveVideoAtPracticeShot(s, true);
      const start = formatVideoTimestamp(videoShotStartSeconds(s));
      setGuideText(`<strong>Videotutorial:</strong> se cargó la jugada <span class="route">${s.code}</span> exactamente en <span class="route">${start}</span>.`);
      playSound('ui', .45);
    }

    function stopDriveVideoFrame() {
      if (videoFrame && videoFrame.tagName === 'IFRAME') {
        videoFrame.setAttribute('src', 'about:blank');
        videoFrame.dataset.currentShot = '';
        videoFrame.dataset.currentStart = '';
        videoFrame.dataset.currentEnd = '';
      }
    }

    function closeVideoModal() {
      if (!videoModal) return;
      videoModal.classList.remove('open');
      videoModal.setAttribute('aria-hidden', 'true');
      stopDriveVideoFrame();
      playSound('ui', .35);
    }

    function openInstructionsModal() {
      if (!instructionsModal) return;
      unlockAudio();
      playSound('ui', .38);
      instructionsModal.classList.add('open');
      instructionsModal.setAttribute('aria-hidden', 'false');
      if (closeInstructionsBtn) closeInstructionsBtn.focus({ preventScroll: true });
    }

    function closeInstructionsModal() {
      if (!instructionsModal) return;
      instructionsModal.classList.remove('open');
      instructionsModal.setAttribute('aria-hidden', 'true');
      playSound('ui', .32);
      if (instructionsBtn) instructionsBtn.focus({ preventScroll: true });
    }


    function refreshOpenVideoForViewport() {
      if (!videoModal || !videoModal.classList.contains('open')) return;
      const s = videoSeekShot();
      if (!s) return;
      updateVideoModalStatus(s);
      loadDriveVideoAtPracticeShot(s, false);
    }

    let videoViewportTimer = null;
    function scheduleVideoViewportRefresh() {
      if (videoViewportTimer) window.clearTimeout(videoViewportTimer);
      videoViewportTimer = window.setTimeout(refreshOpenVideoForViewport, 260);
    }

    window.addEventListener('resize', scheduleVideoViewportRefresh, { passive: true });
    window.addEventListener('orientationchange', scheduleVideoViewportRefresh, { passive: true });

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });
    table.addEventListener('contextmenu', e => e.preventDefault());
    table.addEventListener('dblclick', shootByDoubleClick, { passive: false });
    table.addEventListener('pointerdown', beginCue, { passive: false });
    table.addEventListener('pointermove', moveCue, { passive: false });
    window.addEventListener('pointerup', endCue, { passive: false });
    window.addEventListener('pointercancel', endCue, { passive: false });

    // v209: el control de efecto puede tocarse desde cualquier punto de la bola.
    // Esto permite que en Mesa completa móvil la bola de efecto externa funcione
    // como un control grande, no solo arrastrando el punto rojo.
    [effectBall, effectDot].filter(Boolean).forEach(effectTarget => {
      effectTarget.addEventListener('pointerdown', beginEffect, { passive: false });
      effectTarget.addEventListener('pointermove', moveEffect, { passive: false });
    });
    window.addEventListener('pointermove', moveEffect, { passive: false });
    window.addEventListener('pointerup', endEffect, { passive: false });
    window.addEventListener('pointercancel', endEffect, { passive: false });

    if (ballViewerStage) {
      ballViewerStage.addEventListener('pointerdown', beginViewerInteraction, { passive: false });
      ballViewerStage.addEventListener('pointermove', moveViewerInteraction, { passive: false });
      window.addEventListener('pointerup', endViewerInteraction, { passive: false });
      window.addEventListener('pointercancel', endViewerInteraction, { passive: false });
      ballViewerStage.addEventListener('click', (evt) => {
        const target = evt.target.closest('.viewer-ball');
        if (!target) return;
        viewerFocusBall = target.dataset.ballId || 'cue';
        updateBallViewer();
      });
    }

    for (const btn of modeButtons) {
      btn.addEventListener('click', () => setMode('libre'));
    }

    function selectedTableActionLabel(value) {
      if (value === 'repeat') return 'Repetir tiro';
      if (value === 'replay') return 'Ver replay';
      if (value === 'free') return 'Modo libre';
      if (value === 'place') return 'Ubicar bolas';
      if (value === 'random') return 'Nueva posición';
      return 'Acciones de mesa';
    }

    function isTableActionDisabled(value) {
      if (!value) return true;
      if (value === 'repeat') return !replayBtn || replayBtn.disabled;
      if (value === 'replay') return !motionReplayBtn || motionReplayBtn.disabled;
      if (value === 'free') return shotActive || replayingMotion || !allStopped();
      if (value === 'place') return !placeBtn || placeBtn.disabled;
      if (value === 'random') return !randomBtn || randomBtn.disabled;
      return false;
    }

    function syncTableActionUI() {
      if (!tableActionSelect) return;
      const value = tableActionSelect.value || '';
      if (runTableActionBtn) {
        runTableActionBtn.textContent = selectedTableActionLabel(value);
        runTableActionBtn.disabled = isTableActionDisabled(value);
      }
    }

    function runSelectedTableAction() {
      if (!tableActionSelect) return;
      const value = tableActionSelect.value || '';
      if (!value || isTableActionDisabled(value)) return;
      if (value === 'repeat') restoreLastShot();
      else if (value === 'replay') playLastMotionReplay();
      else if (value === 'free') exitPracticeMode();
      else if (value === 'place') setPlacementMode(!placingMode);
      else if (value === 'random') randomTable();
      playSound('ui', .45);
      tableActionSelect.value = '';
      syncTableActionUI();
    }

    function selectedPracticeActionLabel(value) {
      if (value === 'video') return 'Abrir video';
      if (value === 'images') return 'Ver imagen';
      if (value === 'load') return 'Seleccionar jugada';
      return 'Aplicar';
    }

    function isPracticeActionDisabled(value) {
      if (!value) return true;
      if (value === 'load') return shotActive || replayingMotion || !allStopped();
      if (value === 'square' || value === 'align') return true;
      return false;
    }

    function runSelectedPracticeAction() {
      if (!practiceActionSelect) return;
      const value = practiceActionSelect.value || '';
      if (!value || isPracticeActionDisabled(value)) return;
      if (value === 'video') { ensureSelectedPracticeShotForVideo(); openVideoModal(); }
      else if (value === 'images') { ensureSelectedPracticeShotForVideo(); openPracticeImagesModal(); }
      else if (value === 'load') applyPracticeShot(selectedPracticeIndex(), true, true);
      practiceActionSelect.value = '';
      syncPracticeActionUI();
    }

    function syncPracticeActionUI() {
      if (!practiceActionSelect) return;
      const value = practiceActionSelect.value || '';
      const squareOption = practiceActionSelect.querySelector('option[value="square"]');
      if (squareOption) squareOption.remove();
      const alignOption = practiceActionSelect.querySelector('option[value="align"]');
      if (alignOption) alignOption.remove();
      if (runPracticeActionBtn) {
        runPracticeActionBtn.textContent = selectedPracticeActionLabel(value);
        runPracticeActionBtn.disabled = isPracticeActionDisabled(value);
      }
    }


    soundEnabled = true;

    placeBtn.addEventListener('click', () => {
      setPlacementMode(!placingMode);
      playSound('ui', .5);
    });

    videoBtn.addEventListener('click', () => {
      ensureSelectedPracticeShotForVideo();
      openVideoModal();
    });
    if (techniqueBtn) techniqueBtn.addEventListener('click', () => {
      if (!practiceMode) applyPracticeShot(practiceIndex);
      else {
        practicePanel.classList.toggle('open');
        practicePanel.classList.toggle('manual-open', practicePanel.classList.contains('open'));
        playSound('ui', .45);
      }
    });
    if (loadPracticeBtn) loadPracticeBtn.addEventListener('click', () => applyPracticeShot(parseInt(practiceSelect.value || '0', 10), true, true));
    if (squareCaromBtn) squareCaromBtn.addEventListener('click', squareCaromConditions);
    if (easyAlignBtn) easyAlignBtn.addEventListener('click', toggleAlignmentMode);
    if (alignGuideBtn) alignGuideBtn.addEventListener('click', () => alignToPracticeGuide(true));
    document.querySelectorAll('[data-aim-nudge]').forEach(btn => btn.addEventListener('click', () => nudgeAimBy(parseFloat(btn.dataset.aimNudge || '0'))));
    document.querySelectorAll('[data-power-nudge]').forEach(btn => btn.addEventListener('click', () => nudgePowerBy(parseFloat(btn.dataset.powerNudge || '0'))));
    document.querySelectorAll('[data-effect-nudge]').forEach(btn => btn.addEventListener('click', () => {
      const [axis, value] = String(btn.dataset.effectNudge || 'x:0').split(':');
      nudgeEffectBy(axis, parseFloat(value || '0'));
    }));
    if (viewerZoomOutBtn) viewerZoomOutBtn.addEventListener('click', () => {
      viewerZoom = Math.max(1, +(viewerZoom - .25).toFixed(2));
      updateBallViewer();
      playSound('ui', .25);
    });
    if (viewerZoomInBtn) viewerZoomInBtn.addEventListener('click', () => {
      viewerZoom = Math.min(3, +(viewerZoom + .25).toFixed(2));
      updateBallViewer();
      playSound('ui', .25);
    });
    if (viewerZoomResetBtn) viewerZoomResetBtn.addEventListener('click', () => {
      viewerZoom = 1;
      updateBallViewer();
      playSound('ui', .25);
    });
    if (viewerPreviewBtn) viewerPreviewBtn.addEventListener('click', () => {
      viewerPreviewOn = !viewerPreviewOn;
      updateBallViewer();
      playSound('ui', .25);
    });
    if (practiceImagesBtn) practiceImagesBtn.addEventListener('click', openPracticeImagesModal);
    practiceSelect.addEventListener('change', () => {
      const selectedPracticeIndex = parseInt(practiceSelect.value, 10);
      if (!Number.isFinite(selectedPracticeIndex)) return;
      if (videoModal && videoModal.classList.contains('open')) {
        const s = forcePracticeShotForVideo(selectedPracticeIndex, true);
        renderVideoModalImages(true);
        updateVideoModalStatus(s);
        loadDriveVideoAtPracticeShot(s, true);
        return;
      }
      applyPracticeShot(selectedPracticeIndex, true, true);
    });
    if (prevPracticeBtn) prevPracticeBtn.addEventListener('click', () => nextPracticeShot(-1));
    if (nextPracticeBtn) nextPracticeBtn.addEventListener('click', () => nextPracticeShot(1));
    if (exitPracticeBtn) exitPracticeBtn.addEventListener('click', () => exitPracticeMode());
    closeVideoBtn.addEventListener('click', (evt) => { evt.preventDefault(); evt.stopPropagation(); closeVideoModal(); });
    if (closeVideoXBtn) closeVideoXBtn.addEventListener('click', (evt) => { evt.preventDefault(); evt.stopPropagation(); closeVideoModal(); });
    if (videoPrevShotBtn) videoPrevShotBtn.addEventListener('click', (evt) => { evt.preventDefault(); evt.stopPropagation(); stepVideoModalShot(-1); });
    if (videoNextShotBtn) videoNextShotBtn.addEventListener('click', (evt) => { evt.preventDefault(); evt.stopPropagation(); stepVideoModalShot(1); });
    if (instructionsBtn) instructionsBtn.addEventListener('click', (evt) => { evt.preventDefault(); evt.stopPropagation(); openInstructionsModal(); });
    if (closeInstructionsBtn) closeInstructionsBtn.addEventListener('click', (evt) => { evt.preventDefault(); evt.stopPropagation(); closeInstructionsModal(); });
    if (closeInstructionsActionBtn) closeInstructionsActionBtn.addEventListener('click', (evt) => { evt.preventDefault(); evt.stopPropagation(); closeInstructionsModal(); });
    if (instructionsModal) instructionsModal.addEventListener('click', (evt) => {
      if (evt.target === instructionsModal) closeInstructionsModal();
    });
    if (videoFrame && videoFrame.tagName !== 'IFRAME') {
      videoFrame.addEventListener('timeupdate', enforceVideoSegmentEnd);
      videoFrame.addEventListener('play', activateVideoAudio);
      videoFrame.addEventListener('loadedmetadata', activateVideoAudio);
    }
    videoModal.addEventListener('click', (evt) => {
      if (evt.target === videoModal) closeVideoModal();
    });
    if (closePracticeImagesBtn) closePracticeImagesBtn.addEventListener('click', closePracticeImagesModal);
    if (practiceImagesModal) practiceImagesModal.addEventListener('click', (evt) => {
      if (evt.target === practiceImagesModal) closePracticeImagesModal();
    });

    if (tableActionSelect) tableActionSelect.addEventListener('change', syncTableActionUI);
    if (runTableActionBtn) runTableActionBtn.addEventListener('click', runSelectedTableAction);
    if (practiceActionSelect) practiceActionSelect.addEventListener('change', syncPracticeActionUI);
    if (runPracticeActionBtn) runPracticeActionBtn.addEventListener('click', runSelectedPracticeAction);
    if (demoBtn) demoBtn.addEventListener('click', () => {
      if (!practiceMode) applyPracticeShot(practiceIndex, false);
      if (!startPracticeVideoShot()) shoot();
      playSound('ui', .4);
    });
    shootBtn.addEventListener('click', shoot);
    if (fullscreenTableBtn) fullscreenTableBtn.addEventListener('click', toggleTableFullscreen);
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement && tableFullscreenMode) {
        tableFullscreenMode = false;
      }
      syncTableFullscreenUI();
    });
    replayBtn.addEventListener('click', restoreLastShot);
    motionReplayBtn.addEventListener('click', playLastMotionReplay);
    randomBtn.addEventListener('click', randomTable);
    if (guideBtn) guideBtn.addEventListener('click', toggleGuide);
    syncTableActionUI();

    window.addEventListener('keydown', e => {
      if (instructionsModal && instructionsModal.classList.contains('open')) {
        if (e.key === 'Escape' || e.key === 'Enter' || e.code === 'NumpadEnter') {
          e.preventDefault();
          e.stopPropagation();
          closeInstructionsModal();
        }
        return;
      }
      if (practiceImagesModal && practiceImagesModal.classList.contains('open')) {
        if (e.key === 'Escape') closePracticeImagesModal();
        return;
      }
      if (videoModal.classList.contains('open')) {
        if (e.key === 'Escape') closeVideoModal();
        if (e.key === 'ArrowLeft') { e.preventDefault(); stepVideoModalShot(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); stepVideoModalShot(1); }
        return;
      }
      const isBackKey = e.key === 'Escape' || e.key === 'Backspace' || e.key === 'BrowserBack' || e.key === 'GoBack';
      if (isBackKey && exitTableFullscreenIfActive()) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const isRemoteKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'NumpadEnter'].includes(e.key) || e.code === 'NumpadEnter';
      if (isRemoteKey) markTvRemoteMode();
      const isShootKey = e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space' || e.key === 'Enter' || e.code === 'NumpadEnter' || e.key === 'OK' || e.key === 'Select' || e.code === 'Select';
      if (isShootKey) {
        e.preventDefault();
        e.stopPropagation();
        if (!placingMode) shoot();
        return;
      }
      if (e.key.toLowerCase() === 't') { if (!practiceMode) applyPracticeShot(practiceIndex); else nextPracticeShot(1); return; }
      if (e.key.toLowerCase() === 'u') { setPlacementMode(!placingMode); playSound('ui', .5); return; }
      if (e.key.toLowerCase() === 'v') { playLastMotionReplay(); return; }
      if (e.key.toLowerCase() === 'f') { toggleTableFullscreen(); return; }
      if (e.key.toLowerCase() === 'r') resetTable();
      if (e.key.toLowerCase() === 'n') randomTable();
      if (placingMode) return;
      if (e.key === '1' || e.key === '2' || e.key === '3') setMode('libre');
      if (e.key === 'ArrowLeft') {
        releaseSelectionGuideLock();
        if (e.shiftKey) { effectX = Math.max(-100, effectX - 5); markModeDone('efecto'); }
        else { aimAngle -= Math.PI / 36; markModeDone('taco'); }
        updateFloatingControls(); updateGuidesSoon();
      }
      if (e.key === 'ArrowRight') {
        releaseSelectionGuideLock();
        if (e.shiftKey) { effectX = Math.min(100, effectX + 5); markModeDone('efecto'); }
        else { aimAngle += Math.PI / 36; markModeDone('taco'); }
        updateFloatingControls(); updateGuidesSoon();
      }
      if (e.key === 'ArrowUp') {
        releaseSelectionGuideLock();
        if (e.shiftKey) { effectY = Math.max(-100, effectY - 5); markModeDone('efecto'); }
        else { powerPct = Math.min(maxPowerPctForShot(), powerPct + 5); markModeDone('potencia'); }
        updateFloatingControls(); updateGuidesSoon();
      }
      if (e.key === 'ArrowDown') {
        releaseSelectionGuideLock();
        if (e.shiftKey) { effectY = Math.min(100, effectY + 5); markModeDone('efecto'); }
        else { powerPct = Math.max(5, powerPct - 5); markModeDone('potencia'); }
        updateFloatingControls(); updateGuidesSoon();
      }
    });

    // PWA real para GitHub Pages / Android. En Google Sites incrustada sigue funcionando como app web.
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }

    renderDiamonds();
    populatePracticeSelect();
    initDeflectionGuide();
    practicePanel.classList.add('open', 'manual-open');
    // Inicio limpio: se muestra la Jugada 001 en la mesa, pero el selector queda
    // en "Selecciona la carambola" y la mesa arranca sin guía visible.
    if (practiceSelect) practiceSelect.value = '';
    applyPracticeShot(0, false);
    practiceMode = false;
    deflectionGuideMode = null;
    guide = false;
    fineAlignMode = false;
    if (practiceSelect) practiceSelect.value = '';
    syncGuideToggleUI();
    clearPracticeMarkers();
    recommendationLine.setAttribute('points', '');
    recommendationLine.setAttribute('opacity', '0');
    recommendationEvents.innerHTML = '';
    aimPreview.setAttribute('points', '');
    aimPreview.setAttribute('opacity', '0');
    pathLine.setAttribute('points', '');
    hideCueProjectionGuide();
    syncPracticeUI();
    syncPracticeImagesUI();
    syncSquareCaromUI();
    syncEasyAlignUI();
    syncPlacementUI();
    saveDriveIframeCodeOnly();
    primeVideoGuideCacheSoon();
    setMode('libre', false);
    renderBalls();
    resetShotState();
    updateBallViewer();
    setTimeout(() => {
      if (practiceSelect && typeof practiceSelect.scrollIntoView === 'function') {
        practiceSelect.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    }, 120);
    window.addEventListener('resize', updateBallViewer, { passive: true });
    requestAnimationFrame(loop);
  })();