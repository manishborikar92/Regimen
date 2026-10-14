/**
 * Structured 12-Week Movement and Functional Strength Plan.
 * Adheres strictly to section 4.2 of docs/regimen_project_brief.md.
 * 
 * Rules:
 * - Dynamic resolution by weekday (Workout M/W/F, Walk+Stretches T/Th/Sa, Rest Sun).
 * - Sunday is intentionally scheduled rest, never a missed workout.
 * - Progression guidance is decoupled from daily completion and user activation date.
 * - Health and safety guardrails, stop signals, and medical check-up cautions are visible.
 */

export const MOVEMENT_SCHEDULE = {
  Mon: { type: 'workout', label: 'Strength and Posture Workout', target: 'About 30 minutes' },
  Tue: { type: 'walk', label: 'Easy Walk & Stretches', target: 'Walk 10–20 minutes, then 3 stretches' },
  Wed: { type: 'workout', label: 'Strength and Posture Workout', target: 'About 30 minutes' },
  Thu: { type: 'walk', label: 'Easy Walk & Stretches', target: 'Walk 10–20 minutes, then 3 stretches' },
  Fri: { type: 'workout', label: 'Strength and Posture Workout', target: 'About 30 minutes' },
  Sat: { type: 'walk', label: 'Easy Walk & Stretches', target: 'Walk 10–20 minutes, then 3 stretches' },
  Sun: { type: 'rest', label: 'Planned Rest & Recovery', target: 'No workout required' },
};

export const WORKOUT_EXERCISES = [
  // Warm-up (~5 minutes)
  {
    id: 'wu_01',
    phase: 'warmup',
    phaseName: 'Warm-up (~5 min)',
    order: 1,
    name: 'March in Place',
    target: '1 minute',
    sets: 1,
    reps: '1 min',
    rest: 'None',
    instructions: 'Stand tall with feet about hip-width apart. March on the spot and swing the arms gently. Keep the effort easy enough to speak comfortably.',
    easierVariation: 'March slowly with one hand supported against a wall.',
    harderVariation: 'Lift knees slightly higher while maintaining rhythmic breathing.',
  },
  {
    id: 'wu_02',
    phase: 'warmup',
    phaseName: 'Warm-up (~5 min)',
    order: 2,
    name: 'Cat–Cow',
    target: '8 slow repetitions',
    sets: 1,
    reps: '8 slow reps',
    rest: 'None',
    instructions: 'Start on hands and knees (optionally place a folded towel under the knees). Inhale while lifting the chest and allowing the belly to soften downward; exhale while gently rounding the back toward the ceiling.',
    easierVariation: 'Perform seated in a chair with hands resting on knees.',
    harderVariation: 'Pause 2 seconds at the peak of each gentle spinal wave.',
  },
  {
    id: 'wu_03',
    phase: 'warmup',
    phaseName: 'Warm-up (~5 min)',
    order: 3,
    name: 'Chin Tuck',
    target: '5 repetitions × 5-second hold',
    sets: 1,
    reps: '5 reps (5s hold)',
    rest: 'None',
    instructions: 'Sit or stand tall, looking straight ahead. Slide the head directly backward horizontally (like making a double chin) without tilting your head down.',
    easierVariation: 'Perform lying on the back on a firm bed or mat with the head supported.',
    harderVariation: 'Hold each retraction for 7 seconds with deep diaphragmatic breathing.',
  },

  // Main Exercises (~20 minutes)
  {
    id: 'main_04',
    phase: 'main',
    phaseName: 'Main Exercises (~20 min)',
    order: 4,
    name: 'Sit-to-Stand',
    target: '2 sets × 8–12 reps',
    sets: 2,
    reps: '8–12 reps',
    rest: '1 minute between sets',
    instructions: 'Sit on the front of a sturdy chair placed firmly against a wall. Feet flat on floor, arms crossed across chest. Lean forward slightly from hips, drive through heels to stand upright, then sit down slowly over about 3 seconds. Keep knees tracking over toes.',
    easierVariation: 'Push lightly with hands on thighs, or use a slightly higher seat/cushion.',
    harderVariation: 'Use a lower seat, or perform bodyweight chair-free squats when ready.',
  },
  {
    id: 'main_05',
    phase: 'main',
    phaseName: 'Main Exercises (~20 min)',
    order: 5,
    name: 'Incline Push-Up',
    target: '2 sets × 6–10 reps',
    sets: 2,
    reps: '6–10 reps',
    rest: '1 minute between sets',
    instructions: 'Place hands slightly wider than shoulders on a sturdy table or kitchen counter edge. Walk feet back until body forms a straight line from heels to head. Lower chest toward surface with controlled tempo, then push back up. Do not let hips sag.',
    easierVariation: 'Push up against a sturdy wall.',
    harderVariation: 'Use a progressively lower stable surface (e.g., bench or sturdy chair).',
  },
  {
    id: 'main_06',
    phase: 'main',
    phaseName: 'Main Exercises (~20 min)',
    order: 6,
    name: 'Glute Bridge',
    target: '2 sets × 10–12 reps',
    sets: 2,
    reps: '10–12 reps',
    rest: '1 minute between sets',
    instructions: 'Lie on the back with knees bent and feet flat on the floor. Push through heels to lift hips until forming a comfortable straight line from shoulders to knees. Squeeze glutes for 1 second at top, then lower slowly without arching the lower back.',
    easierVariation: 'Lift hips to a modest height within comfortable range.',
    harderVariation: 'Pause at the top for 3 seconds or alternate a single lifted foot when ready.',
  },
  {
    id: 'main_07',
    phase: 'main',
    phaseName: 'Main Exercises (~20 min)',
    order: 7,
    name: 'Prone Y–T Raise',
    target: '2 sets × 8 reps',
    sets: 2,
    reps: '8 reps',
    rest: '1 minute between sets',
    instructions: 'Lie face down with forehead supported on a folded towel. Lift arms a small amount in a "Y" position with thumbs pointing up, gently drawing shoulder blades down and together. Lower, then lift arms out in a "T" position. Alternate Y and T. Hold each lift ~2 seconds with a long neck.',
    easierVariation: 'Lift only 1–2 cm off the floor.',
    harderVariation: 'Hold each lift at the top for up to 5 seconds if comfortable.',
  },
  {
    id: 'main_08',
    phase: 'main',
    phaseName: 'Main Exercises (~20 min)',
    order: 8,
    name: 'Dead Bug',
    target: '2 sets × 6 reps per side',
    sets: 2,
    reps: '6 reps/side',
    rest: '1 minute between sets',
    instructions: 'Lie on the back with arms pointing straight up and knees bent at 90 degrees over hips. Slowly lower the right arm and left leg toward the floor, return to start, and switch sides. Keep lower back gently pressed against the floor throughout.',
    easierVariation: 'Keep arms still and move only the legs with toes tapping the floor.',
    harderVariation: 'Straighten moving leg further toward the floor with full abdominal control.',
  },

  // Cool-down (~5 minutes)
  {
    id: 'cd_09',
    phase: 'cooldown',
    phaseName: 'Cool-down (~5 min)',
    order: 9,
    name: 'Doorway Chest Stretch',
    target: '2 holds × 20 seconds per side',
    sets: 2,
    reps: '20s/side',
    rest: '15 seconds',
    instructions: 'Place forearm on a doorway frame with elbow around shoulder height. Step forward gently until a mild, comfortable stretch is felt across the chest. Hold without bouncing, then switch sides.',
    easierVariation: 'Step forward less; stretch should feel mild with zero pain.',
    harderVariation: 'Adjust forearm slightly higher or lower to target different chest fibers.',
  },
  {
    id: 'cd_10',
    phase: 'cooldown',
    phaseName: 'Cool-down (~5 min)',
    order: 10,
    name: 'Hip Flexor Stretch',
    target: '2 holds × 20 seconds per side',
    sets: 2,
    reps: '20s/side',
    rest: '15 seconds',
    instructions: 'Kneel on one knee on a folded towel, front foot flat on floor. Gently squeeze the glute on the kneeling side and move hips forward until a gentle stretch is felt in the front of that hip. Keep torso tall without arching the back.',
    easierVariation: 'Stand upright with one foot back, holding onto a sturdy chair for balance.',
    harderVariation: 'Raise the arm on the kneeling side straight up to deepen the stretch.',
  },
  {
    id: 'cd_11',
    phase: 'cooldown',
    phaseName: 'Cool-down (~5 min)',
    order: 11,
    name: "Child's Pose",
    target: '30–45 seconds',
    sets: 1,
    reps: '30–45s hold',
    rest: 'Done',
    instructions: 'Start on hands and knees. Shift hips back toward heels, reach arms forward along the floor, and rest forehead down if comfortable. Breathe deeply and slowly into the back and ribs.',
    easierVariation: 'Place a soft pillow or folded blanket between hips and heels.',
    harderVariation: 'Walk hands gently to the left for 15s, then to the right for 15s.',
  },
];

export const WALK_DAY_ROUTINE = [
  {
    id: 'walk_01',
    order: 1,
    name: 'Easy Walk',
    target: '10–20 minutes',
    instructions: 'Walk outdoors or in a comfortable space at an easy, conversational pace. Relax shoulders and let arms swing naturally.',
  },
  {
    id: 'walk_02',
    order: 2,
    name: 'Doorway Chest Stretch',
    target: '2 holds × 20 seconds per side',
    instructions: 'Place forearm on a doorway frame at shoulder height. Step forward gently until mild chest stretch is felt. Hold 20s each side.',
  },
  {
    id: 'walk_03',
    order: 3,
    name: 'Hip Flexor Stretch',
    target: '2 holds × 20 seconds per side',
    instructions: 'Kneel on folded towel or stand with one foot back. Squeeze glute and shift hips forward gently. Hold 20s each side.',
  },
  {
    id: 'walk_04',
    order: 4,
    name: "Child's Pose",
    target: '30–45 seconds',
    instructions: 'Shift hips back onto heels, reach arms forward, and breathe slowly for 30–45 seconds of calming relaxation.',
  },
];

export const PROGRESSION_PHASES = [
  {
    phase: 'Weeks 1–4: Foundation & Form',
    weeks: '1–4',
    targetSets: '2 sets per exercise',
    guidance: 'Begin at the lower end of the repetition range (e.g. 8 Sit-to-Stands, 6 Push-Ups). Focus purely on smooth form, posture, and controlled tempo. Each set should finish with about 2–3 good repetitions still possible.',
    caution: 'Medical check-up recommended within the first 4 weeks, ideally before Week 5. Stay at 2 sets until that check-up.',
  },
  {
    phase: 'Weeks 5–8: Repetition Progression',
    weeks: '5–8',
    targetSets: '2 sets, building to upper rep target (optional 3rd set)',
    guidance: 'Add 1 repetition per workout until reaching upper repetition targets. Only consider adding a 3rd set if readiness criteria are met and medical guidance permits.',
    caution: 'Do not rush into 3 sets. Ensure adequate nutrition and recovery between sessions.',
  },
  {
    phase: 'Weeks 9–12: Controlled Progression',
    weeks: '9–12',
    targetSets: '2–3 sets with progressive variations',
    guidance: 'Try a harder variation only when the current one feels easy and all readiness criteria are satisfied for 2 consecutive workouts.',
    caution: 'Progress gradually. If tiredness accumulates, take an extra rest day.',
  },
];

export const READINESS_CRITERIA = [
  'Every set felt easy for two workouts in a row.',
  'Zero sharp pain during or after exercise.',
  'The following day did not bring unusual fatigue, joint soreness, or low energy.',
];

export const STOP_SIGNALS = [
  'Chest pain, tightness, or pressure (warrants emergency medical assistance).',
  'Faintness, severe lightheadedness, or sudden dizziness.',
  'Difficulty breathing or sudden shortness of breath.',
  'Racing, fluttering, or uneven heartbeat.',
  'Sharp, localized joint or muscle pain.',
];

export const GENERAL_HEALTH_NOTES = [
  'Fuel consistently: Regular meals with adequate protein support functional tissue repair.',
  'Hydration: Drink water steadily throughout the day.',
  'Sleep: Prioritize at least 7 hours of restful sleep for neuromuscular recovery.',
  'Desk break tip: After every 30 minutes sitting at a desk, stand up and move for 1–2 minutes.',
];
