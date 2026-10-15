# Personal Routine Companion: Standalone Product Brief

**Prepared:** 14 October 2026  
**Current application name:** Vritta (formerly Regimen)  
**Document purpose:** This is the complete, standalone product brief for redesigning and improving the personal routine web app. It contains the product intent, routine content, seed-data requirements, UX expectations, safety constraints, and acceptance criteria. All product requirements needed for implementation are included below; the existing repository is the authority for technical architecture.

## 1. Mission and outcomes

Turn the application (branded Vritta, formerly Regimen) into a polished, mobile-first personal routine companion for Manish. The app should make a small set of meaningful daily activities easier to follow, track, and improve over time. The goal is not to make every minute of the day rigid. Completion, consistency, flexibility, and clarity matter more than exact-minute scheduling.

The work includes understanding the existing codebase, revising the information architecture and scheduling model, seeding the correct routine data, improving Today, routine management, and Insights, replacing the visible product identity and logo, and adding reliable tests. Improve the existing app rather than rewriting it without cause.

Success means:

- The app feels like one cohesive, finished product on mobile, tablet, and desktop.
- It clearly distinguishes a preferred time from a deadline.
- A routine can be a single action, a multi-step checklist, a session count, a duration target, or a structured exercise session where the existing architecture can support it reliably.
- Weekly patterns, planned rest, partial completion, and long-running plans are represented accurately.
- Seed setup is repeatable and safe. Rerunning it creates no duplicates and does not destroy real user data.
- The new display name, logo, icons, color tokens, and metadata are consistent and easy to change in one place.
- Today, Habits/Routine, and Insights offer useful, accessible experiences instead of simply displaying data.
- The implementation is validated honestly. The final report distinguishes checks actually run from checks that could not be run.

## 2. Product and current-app context

The web app is branded **Vritta** (migrated from legacy Regimen) and has three main areas: **Today**, **Habits**, and **Analytics**. It is primarily used on a phone. The Today experience displays the date and activity cards with category labels, completion controls, and expandable instructions. The Habits area supports creating and editing activities. The existing habit editor includes a title, time, category, instructions, active weekdays, optional checklist items, and display order.

The current design is overly centered on exact clock times and uses scheduling concepts as categories. Redesign the concepts as well as the visuals:

- A **category** explains the life area or purpose of an activity.
- **Timing** tells the user when it is preferred, if a preference is useful.
- **Recurrence** defines which dates or weekdays an activity belongs to.
- A **completion method** defines how progress is recorded.
- **Instructions and steps** explain how to do the activity.
- **Progress** shows today's completion and, where appropriate, longer-term progress.

Existing examples such as morning hygiene, sunlight exposure, a high-calorie shake, or voice/posture exercises are not part of the confirmed routine below. Treat them as legacy/demo content unless repository data proves that a record belongs to a real user. Never delete ambiguous existing data blindly.

## 3. Scheduling philosophy

### 3.1 Completion comes first

A preferred time must not become a hard deadline. If a user planned to exercise in the afternoon but completes the workout later, it still counts as completed for the local calendar day. Do not automatically mark a routine missed just because a suggested time has passed. When useful, record both the date and actual completion timestamp, but do not penalize late completion.

Use these timing types where the current architecture can support them cleanly:

- **Anytime:** The activity can be completed at any point during the day.
- **Preferred period:** Morning, afternoon, or evening. This is a soft target, not a deadline.
- **Relative timing:** For example, “before bed.” It should not require an exact clock time.
- **Exact Time or reminder:** Available only when useful and supported by the existing application. It is not mandatory for every routine.
- **Repeated interval:** For example, a desk movement break every 30 minutes, if recurring reminders are supported.

The default plan should not invent exact times for activities. Exercise should have a consistent preferred period of **afternoon**, because that preference is part of the plan. Keep the repeatable period visible, but allow completion at another time. Reading should be **before bed**. The other daily activities should remain flexible unless Manish later chooses a preference.

### 3.2 Recurrence and completion are separate

Recurrence decides whether an activity is planned today. Completion records what happened. A day that is not scheduled is not a failure. A planned rest day is not a missed workout. Never include an unscheduled activity or planned rest day in the denominator of completion-rate analytics.

### 3.3 Keep the plan flexible and humane

Show partial progress, avoid shame-based copy and aggressive red overdue states, and do not make streak preservation more important than sustainable behavior. If a task has several parts, show what remains. Give the user a simple way to complete, undo, or correct an accidental tap.

## 4. Canonical six-routine plan

Seed these six personal routines with stable keys. These are the approved top-level daily activities. Do not add unconfirmed mandatory routines, durations, deadlines, or historical completions.

### 4.1 Practice English Workbook

**Title:** Practice English Workbook  
**Category:** English Learning  
**Book context:** *Word Power Made Easy* by Norman Lewis, a vocabulary-building workbook intended to strengthen English vocabulary and support confident speaking, writing, and reading. Do not assume a specific chapter, daily page range, or session duration.

**Daily requirement:** Complete two sessions every day.

**Required behavior:**

1. Before beginning new work, review and revise the previous day's work when previous work exists. On the first day, show that there is no previous work to review rather than treating it as an omission.
2. Complete Session 1.
3. Complete Session 2.
4. Record whether at least one session was completed without taking a break.

Use a purpose-built progress display such as **0/2 sessions**, **1/2 sessions**, and **2/2 sessions**. Record the previous-work review and uninterrupted-session condition separately from the session count. The user should be able to see partial progress; do not reduce this activity to a single opaque checkbox. If the session target is complete but another required condition is not, communicate exactly what remains.

**Timing:** Anytime by default. Do not assign an exact time without user input.  
**Duration:** Not specified. Do not invent one.  
**Completion method:** Two-session counter plus review and uninterrupted-session indicators.

### 4.2 Exercise

**Title:** Exercise / Movement Plan  
**Category:** Movement & Strength  
**Purpose:** Improve posture, mobility, basic functional strength, and general well-being at home with no equipment.

This is a 12-week progressive plan. Its daily presentation changes by weekday:

| Day | Plan | Target |
|---|---|---|
| Monday | Strength and posture workout | About 30 minutes |
| Tuesday | Easy walk and three stretches | Walk 10–20 minutes, then stretches |
| Wednesday | Strength and posture workout | About 30 minutes |
| Thursday | Easy walk and three stretches | Walk 10–20 minutes, then stretches |
| Friday | Strength and posture workout | About 30 minutes |
| Saturday | Easy walk and three stretches | Walk 10–20 minutes, then stretches |
| Sunday | Planned rest | No workout required |

**Preferred time:** Afternoon for workout days. This is a consistent target period, not a strict deadline.

#### Workout-day structure: Monday, Wednesday, Friday

**Warm-up, about 5 minutes**

1. **March in Place:** 1 minute. Stand tall with feet about hip-width apart, march on the spot, and swing the arms gently. Keep the effort easy enough to speak. An easier option is to march slowly with one hand supported on a wall.
2. **Cat–Cow:** 8 slow repetitions. Start on hands and knees, optionally with a towel under the knees. Breathe in while lifting the chest and allowing the belly to lower; breathe out while gently rounding the back. Use a seated version with hands on knees if kneeling is uncomfortable.
3. **Chin Tuck:** 5 repetitions, holding each for 5 seconds. Sit or stand tall, look straight ahead, and slide the head directly backward without looking down. An easier option is to do it lying on the back with the head supported.

**Main exercises, about 20 minutes**

4. **Sit-to-Stand:** 2 sets × 8–12 repetitions; rest 1 minute between sets. Sit on the front of a sturdy chair placed against a wall, feet flat and arms crossed. Lean forward slightly, stand through the feet, then sit down slowly over about three seconds. Keep knees aligned with toes. Easier: push lightly on the thighs or use a higher seat. Harder: use a lower seat or a chair-free squat when appropriate.
5. **Incline Push-Up:** 2 sets × 6–10 repetitions; rest 1 minute. Place hands slightly wider than the shoulders on a sturdy table edge, walk the feet back, keep the body aligned, lower the chest toward the surface, and push back up. Do not let the hips sag. Easier: push up against a wall. Harder: use a progressively lower stable surface.
6. **Glute Bridge:** 2 sets × 10–12 repetitions; rest 1 minute. Lie on the back with knees bent and feet flat. Push through the heels to lift the hips, form a comfortable straight line, squeeze the glutes for one second, and lower slowly without arching the lower back. Easier: lift the hips less high. Harder: consider alternating a lifted foot only when ready.
7. **Prone Y–T Raise:** 2 sets × 8 repetitions; rest 1 minute. Lie face down with the forehead supported on a folded towel. Lift the arms a small amount in a Y position with thumbs up, gently drawing the shoulder blades together; then use a T position with the arms out to the sides, alternating between Y and T. Hold each lift for about two seconds and keep the neck long. Easier: lift only 1–2 cm. Harder: hold each lift for up to five seconds if comfortable.
8. **Dead Bug:** 2 sets × 6 repetitions per side; rest 1 minute. Lie on the back with arms up and knees bent over the hips. Slowly lower the right arm and left leg toward the floor, return, and switch sides. Keep the lower back supported against the floor. Easier: move only the legs. Harder: straighten the moving leg farther only if control is maintained.

**Cool-down, about 5 minutes**

9. **Doorway Chest Stretch:** 2 holds × 20 seconds per side. Place the forearm on a doorway frame with the elbow around shoulder height, step forward gently until a mild stretch is felt across the chest, hold, and switch sides. No pain; step forward less for an easier version.
10. **Hip Flexor Stretch:** 2 holds × 20 seconds per side. Kneel on one knee on a folded towel, put the other foot forward, gently squeeze the glute on the kneeling side, and move the hips forward until the front of the hip stretches. Keep the torso tall and do not arch the back. Easier: stand with one foot back while holding a chair.
11. **Child's Pose:** 30–45 seconds. Start on hands and knees, move the hips back toward the heels, reach the arms forward, and rest the forehead if comfortable. Breathe slowly. Easier: place a pillow between the hips and heels.

Begin at the lower end of any repetition range. Each set should finish with about 2–3 good repetitions still possible. Use an easier variation whenever needed. Instructions must be accessible from the expanded workout view and not hidden behind truncated text.

#### Walk-day structure: Tuesday, Thursday, Saturday

- **Easy walk:** 10–20 minutes at a comfortable pace.
- **Doorway Chest Stretch:** 2 × 20 seconds per side.
- **Hip Flexor Stretch:** 2 × 20 seconds per side.
- **Child's Pose:** 30–45 seconds.

#### Rest day: Sunday

Sunday is intentionally scheduled for rest. Show it as **Rest day** or **Recovery**, not as an unchecked exercise task. Exclude it from exercise completion-rate denominators.

#### Progression across 12 weeks

- **Weeks 1–4:** Do two sets per exercise and start with the lower repetition count while learning form.
- **Weeks 5–8:** Add one repetition per workout until reaching the upper target, then consider adding a third set only if readiness criteria are met and medical guidance permits.
- **Weeks 9–12:** Try a harder variation only when the current one feels easy and readiness criteria are satisfied.

Progress only when all three conditions are true: every set felt easy for two workouts in a row; there was no pain; and the next day did not bring unusual tiredness or soreness. If the person is ill, very tired, sleeping poorly, or losing weight, reduce the workload and consider an extra rest day. If this continues for more than two weeks, contact a doctor.

#### Health and safety guardrails

The plan was prepared for a person with low body weight and explicitly recommends a medical check-up within the first four weeks, ideally before Week 5, and staying at two sets until that check-up. Preserve this caution in the app and do not automatically progress the exercise load. Do not diagnose or offer individualized medical advice.

Display these stop signals clearly in the exercise details: chest pain/pressure, faintness or severe dizziness, difficulty breathing, racing or uneven heartbeat, or sharp joint/muscle pain. Stop exercising and seek appropriate help if these occur; chest pain or fainting warrants emergency assistance. The plan also advises regular meals with protein, water throughout the day, and at least seven hours of sleep. Present these as general plan notes, not medical treatment.

The plan includes a supporting desk habit: after every 30 minutes at a desk, stand up and move for 1–2 minutes. If the current app has a reliable interval/reminder feature, make this an optional recurring reminder. Do not represent it as a single once-daily checkbox. If interval reminders are unsupported, include the note as an optional tip and document the limitation.

**Data requirements:** Store exercises as structured items with stable IDs, phase (warm-up/main/cool-down/walk-day stretch), reps/duration, sets, rest, instructions, easier/harder variation, safety note, and weekday applicability. Store 12-week progression guidance separately from individual daily completion. Keep plan template data separate from a user's activation date and progress. Do not fabricate past workouts. The user should explicitly start/activate the 12-week plan or choose its start date; until then, the app must not claim that a particular week has elapsed.

### 4.3 Listen to Osho

**Title:** Listen to Osho  
**Category:** Listening & Awareness  
**Daily requirement:** Listen every day.  
**Timing:** Anytime by default; no target duration was specified.  
**Completion method:** A daily listening-session completion state, separate from long-term discourse-series progress.

The listening library contains 30 entries arranged in six groups. It is a flexible learning path, not a mandatory fixed syllabus. A user may follow the recommended order or select any item according to interest. Hindi series appear first and English items later. The item list, categories, brief descriptions, notes, and URLs below are all the library content required for initial seeding.

**Tracking rules:**

- Daily listening completed does not mean an entire series is complete.
- Store the chosen series and talk/part progress separately from the daily habit record.
- Only populate a talk count where the note below gives one, and preserve differences between editions/archives. Use a nullable count plus an explanatory note when uncertain or inconsistent.
- Do not infer one recording equals one complete series.
- The final item is described as an edited compilation from talks, not a standalone discourse series.
- The URLs are informational listing pages, not guarantees of a direct audio file. For the last item, the provided URL is a YouTube search link, not a verified recording. Never invent a direct audio/player URL.

#### Group 1: Overcoming Fear and Anxiety

1. **Main Mrityu Sikhata Hun** | Hindi | Theme: death, awareness, meditation, attachment, fear of loss and change. Note: 15 talks; the first ten archive recordings are roughly 57–110 minutes, but the complete series duration is not tabulated; exact period not verified. URL: https://oshoworld.com/main-mrityu-sikhata-hun-by-osho-01-15
2. **Kathopanishad** | Hindi | Theme: death, self-knowledge, desire, awareness, the senses, and existential inquiry. Note: the official edition lists 17 talks while the archive indexes 19; Oct 1973, Mount Abu; recordings are generally around 1–2 hours. URL: https://oshoworld.com/kathopanishad-by-osho-01-19
3. **Maro He Jogi Maro** | Hindi | Theme: Gorakh, inner transformation, ego, doubt, meditation, awareness, and inner freedom. Note: 20 talks in the recognized series; “Jeevan Sangeet” is treated as part of this broader series rather than a separate entry; dates not verified. URL: https://oshoworld.com/mare-he-jogi-maro-by-osho-01-20
4. **Jin Sutra** | Hindi | Theme: Mahavira, meditation, responsibility, austerity, non-attachment, death, karma, and liberation. Note: 62 talks; May–August 1976, Pune; archive recordings are commonly around 1–1.5 hours. URL: https://oshoworld.com/jin-sutra-by-osho-01-62

#### Group 2: Building Extraordinary Confidence

5. **Krishna Smriti** | Hindi | Theme: life-affirmation, living moment to moment, one's nature, celebration, and action without attachment to results. Note: 22 archive entries, including 21 talks on Krishna and one special discourse on neo-sannyas; listed durations total about 32 hours 50 minutes; dates include 20 July 1970 and 26 September–5 October 1970. URL: https://oshoworld.com/krishna-smriti-by-osho-01-22
6. **Geeta Darshan, Chapters 1–2** | Hindi | Theme: action, duty, conflict, consciousness, detachment, responsibility, and inner freedom. Note: 18 talks in the first-volume archive; recordings are generally around 1¼–1½ hours; dates for these selected chapters were not independently verified. URL: https://oshoworld.com/geeta-darshan-vol-1-2-by-osho-1-18
7. **Main Kaun Hun** | Hindi | Theme: self-inquiry, identity, ego, social labels, memory, and direct self-understanding. Note: 11 talks; listed recordings are approximately 49–72 minutes; series metadata spans March 1967–April 1970. URL: https://oshoworld.com/main-kaun-hun-by-osho-01-11
8. **Suno Bhai Sadho / Kabir** | Hindi | Theme: Kabir, direct experience, love, awareness, hypocrisy, and lived truth rather than borrowed belief. Note: 20 archive talks, commonly around 1¼–2 hours; exact dates not verified. URL: https://oshoworld.com/suno-bhai-sadho-by-osho-01-20
9. **Kranti Sutra** | Hindi | Theme: inner revolution, freedom from conditioning, and changing unconscious patterns. Note: the official publication describes a four-talk work; the archive listing and available audio grouping may differ, so do not invent a definitive count or total duration. URL: https://oshoworld.com/jeevan-kranti-ke-sutra-by-osho-01-10

#### Group 3: Gaining Essential Knowledge and Understanding of the World

10. **Dhyan-Sutra** | Hindi | Theme: preparation for meditation, body/thought/emotional awareness, meditation experiments, emptiness, and samadhi. Note: 9 talks from February 1965; archive durations are around 45–74 minutes. URL: https://oshoworld.com/dhyan-sutra-by-osho-1-9
11. **Jin Khoja Tin Paiyan** | Hindi | Theme: self-discovery, meditation, and Osho's esoteric model of inner transformation. Note: 19 archive talks, roughly 1–1¾ hours each; exact dates not verified. URL: https://oshoworld.com/jin-khoja-tin-paiyan-by-osho-01-19
12. **Es Dhammo Sanantano** | Hindi | Theme: the Dhammapada, mind, craving, anger, awareness, meditation, suffering, compassion, ethics, and freedom. Note: 122 talks; November 1975–December 1977, Pune; exact total listening time is not tabulated. URL: https://oshoworld.com/es-dhammo-sanantano-by-osho-1-122
13. **Tao Upanishad** | Hindi | Theme: Tao, naturalness, non-forcing, emptiness, spontaneity, ego, surrender, and action without unnecessary conflict. Note: 127 talks across six volumes; exact complete period not verified; recordings commonly run around 1–2 hours. URL: https://oshoworld.com/tao-upanishad-by-osho-01-127
14. **Ashtavakra Mahageeta** | Hindi | Theme: witness-consciousness, non-identification, non-doership, detachment, and non-duality. Note: 91 talks; 11 September 1976–10 February 1977; archive recordings commonly run about 1½ hours. URL: https://oshoworld.com/maha-geeta-by-osho-01-91
15. **Sadhana-Sutra** | Hindi | Theme: discipline, aspiration, desire, witnessing, right effort, and spiritual practice. Note: official audiobook has 17 talks while the archive indexes 20; April 1973, Mount Abu; durations generally around 1–1¾ hours. URL: https://oshoworld.com/sadhana-sutra-by-osho-01-20
16. **Ami Jharat Bigsat Kanwal** | Hindi | Theme: devotion, direct inner experience, awareness, and mystical poetry. Note: 14-discourse series; exact dates and total duration not verified. URL: https://oshoworld.com/ami-jharat-bigsat-kanwal-by-osho-1-14
17. **Mahaveer Vani** | Hindi | Theme: Mahavira, awareness, non-attachment, responsibility, anger, pride, greed, the senses, and liberation. Note: 54 archive talks; exact period not verified; a 1972 publication is documented. URL: https://oshoworld.com/mahaveer-vani-by-osho-01-54

#### Group 4: The Most Controversial Disclosures and Talks

18. **Sambhog Se Samadhi Ki Or** | Hindi | Theme: sexuality, desire, repression, relationships, pleasure, and Osho's proposed transformation of sexual energy into meditation and awareness. Note: official publication describes seven talks while the archive indexes 16 audio entries; edition and archive group them differently. URL: https://oshoworld.com/sambhog-se-samadhi-ki-oar-by-osho-01-16
19. **Kya Ishwar Mar Gaya Hai** | Hindi | Theme: God, belief, inherited religious concepts, doubt, and the difference between genuine inquiry and borrowed faith. Note: 8 archive talks, roughly 61–72 minutes each; exact period not verified. URL: https://oshoworld.com/kya-ishwar-mar-gaya-hai-by-osho-01-08

#### Group 5: Additional Hindi Disclosures

20. **Athato Bhakti Jigyasa** | Hindi | Theme: devotion, love, surrender, trust, relationship with the divine, and bhakti alongside meditation and self-inquiry. Note: 40 talks; officially published as two volumes of 20 talks; exact series dates not verified. URL: https://oshoworld.com/athato-bhakti-jigyasa-by-osho-1-40
21. **Koplen Phir Phoot Aayeen** | Hindi | Theme: awareness, witnessing, meditation, love, ambition, society, and renewal. Note: 12 archive talks, roughly 1¼–2¼ hours each; identified in official material as Osho's final Hindi discourse series. URL: https://oshoworld.com/koplen-phir-phoot-aayeen-by-osho-01-12
22. **Prem Darshan** | Hindi | Theme: love, relationships, emotional attachment, and inner transformation. Note: 4 talks, approximately 56–66 minutes each; exact period not verified. URL: https://oshoworld.com/prem-darshan-by-osho-01-04
23. **Amrit Varsha** | Hindi | Theme: truth, emptiness, awakening, and inner transformation. Note: the archive lists five audio entries, while the official publication has a different chapter organization; do not conflate the counts. URL: https://oshoworld.com/013-amrit-varsha-1-5

#### Group 6: English Disclosures

24. **Satyam Shivam Sundaram** | English | Theme: truth, awareness, meditation, love, fear, creativity, relationships, aging, politics, and war. Note: 30 talks; November 1987; displayed talks are approximately 1¼–2¼ hours. URL: https://oshoworld.com/satyam-shivam-sundaram-series
25. **The Book of Secrets / Vigyan Bhairav Tantra** | English | Theme: 112 meditation techniques involving breath, sensations, attention, moods, sound, space, and ordinary experience. Note: 80 talks across the original series; Volume 1 contains 40 talks; 1 October 1972–8 November 1973; recordings commonly run about 1–1½ hours. URL: https://oshoworld.com/the-book-of-secrets
26. **The Heart Sutra** | English | Theme: Buddhist emptiness, ego, awareness, surrender, and direct seeing. Note: 10 talks, 11–20 October 1977; recordings are roughly 1¼–1¾ hours. URL: https://oshoworld.com/the-heart-sutra-by-osho-01-10
27. **The Buddha: The Emptiness of the Heart** | English | Theme: Zen/Buddhist emptiness, awareness, releasing conceptual knowledge, and direct experience. Note: 8 talks, 8–15 September 1988; individual talks are generally about 1½ hours. URL: https://oshoworld.com/the-buddha-the-emptiness-of-the-heart
28. **The Zen Manifesto: Freedom From Oneself** | English | Theme: freedom from the constructed self, awareness, meditation, meaning, and no-self. Note: 11 talks, 20 February–10 April 1989; talk lengths vary roughly from 1½–3½ hours. URL: https://oshoworld.com/the-zen-manifesto-freedom-from-oneself-01
29. **The Mustard Seed** | English | Theme: Osho's commentary on the Gospel of Thomas, Jesus, mysticism, love, paradox, and inner transformation. Note: 21 talks, 21 August–10 September 1974; talks are mostly around 1–1½ hours. URL: https://oshoworld.com/the-mustard-seed-my-most-loved-gospel-on-jesus
30. **Priests and Politicians: The Mafia of the Soul** | English | Theme: priests, politicians, institutional power, conditioning, authority, conformity, religion, and individual freedom. Note: an edited compilation with seven book chapters, not a single original discourse series; there is no single original-talk count or duration. URL: https://www.youtube.com/results?search_query=OSHO+Priests+and+Politicians+The+Mafia+of+the+Soul. This is a discovery/search page, not a verified direct recording.

### 4.4 Read Books

**Title:** Read Books  
**Category:** Reading  
**Daily requirement:** Read a book for **30 minutes before going to sleep**.  
**Timing:** Relative timing, **Before bed**. Do not force a universal clock time such as 10:00 PM.  
**Completion method:** Mark complete; a timer or elapsed-duration tracker is optional if it is easy to implement without disrupting the existing architecture. The duration is the target, but the user must still be able to mark completion without a mandatory timer if the timer is unavailable or inconvenient.

### 4.5 Practice English Speaking

**Title:** Practice English Speaking  
**Category:** Communication  
**Daily requirement:** Practise speaking English with ChatGPT.  
**Timing:** Flexible/anytime by default.  
**Duration:** Not specified; do not invent a required minimum.  
**Completion method:** A clear manual completion action, with optional private notes if appropriate. Do not claim that the app itself can detect a ChatGPT conversation unless such integration genuinely exists.

### 4.6 Maintain a Diary

**Title:** Maintain a Diary  
**Category:** Reflection  
**Daily requirement:** Write about what was learned and personal thoughts in a diary.  
**Timing:** Flexible/anytime by default.  
**Duration:** Not specified.  
**Completion method:** A manual completion action. If the app includes a journal editor, allow a quick entry and optional reflection prompts. A short note is acceptable; do not require a long essay.

The desired diary style is personal, plainspoken, and reflective. A useful optional structure is: **What happened or what thought came to mind? What did I feel? What assumption might I be making? What did I learn? Is there a small next step?** Do not force every question or section on every entry.

Themes in the user's examples include anxiety and fear of judgment, perfectionism, distinguishing assumptions from actual problems, self-understanding and self-acceptance, attachment to familiar places, fear of change, memory and loss, letting go of control, and the idea that a person's response to difficulties can matter more than the difficulty itself. Use these only as optional inspiration, not as a diagnosis, permanent profile, or prewritten entry.

Diary content is private user data. Never seed historical diary entries, never create entries without user action, do not expose entries across accounts, and do not send diary text to external services unless the user explicitly initiates and authorizes that feature.

## 5. Information architecture and visual direction

### 5.1 Main navigation

Keep a simple main navigation consistent with the current app's natural user paths:

- **Today:** today's planned activities and completion progress.
- **Habits** or **Routine:** edit recurring routines, timings, weekdays, instructions, and completion structure.
- **Insights:** useful patterns and progress. The existing Analytics label may be retained if it fits the design, but the experience should feel supportive rather than performance-obsessed.

Do not add more top-level navigation than the product needs. Use detail screens, modals, or expandable sections for exercise and listening-library depth.

### 5.2 Today view

- Show the local date and a friendly overall progress summary without clutter.
- Group or order activities by meaningful time context: preferred period when relevant, Anytime, and Before bed. Never invent precise times for flexible activities.
- The exercise card should adapt to the weekday: workout, walk plus stretches, or rest day.
- Use distinct progress UI for the two workbook sessions, the structured exercise/walk checklist, and simple one-step activities.
- Expandable details should expose all essential instructions, sets/reps, recovery notes, and safety guidance without truncating important content.
- Make touch targets generously sized and keep primary actions accessible on a phone.
- Offer clear completed, in-progress, and not-started states. Provide a non-punitive empty state when the planned work is complete.
- Avoid automatic overdue behavior caused only by a preferred period passing.

### 5.3 Routine manager and editor

Redesign the habit editor around meaning and behavior rather than an exact clock time. Depending on the selected completion method, fields may include:

- Title and short description/purpose.
- Life-area category.
- Completion method: simple completion, checklist, session/count target, duration target, or structured exercise routine, limited to types the existing architecture can support reliably.
- Timing: Anytime, Morning, Afternoon, Evening, Before bed, or Exact Time/window.
- Recurrence: selected weekdays or a custom repeat pattern supported by the app.
- Required and optional steps/checklist items.
- Estimated duration only when known.
- Instructions, notes, and optional reminder controls.
- Ordering only if users need manual ordering; default ordering should be intuitive.

Use progressive disclosure: show essential fields first and reveal advanced controls when needed. Explain that a preferred period is not a deadline. The app should allow users to edit, archive, restore, or delete routines safely; confirm deletion and explain what happens to history.

### 5.4 Insights

Show useful trends such as planned activities completed, partial workbook progress, number of workout and walk days completed, weekly consistency, and Osho listening progress. Calculate each metric only from dates on which its activity was actually scheduled. Do not count Sundays as missed exercise, do not penalize unscheduled days, and keep long-term Osho series progress separate from daily listening-session completion. Avoid streak mechanics that punish an occasional missed day or use guilt-inducing language.

### 5.5 Brand and logo

The display identity has been established as **Vritta** (replacing the legacy Regimen identity), a coherent, short, memorable name suited to a calm, practical personal-growth companion. In Sanskrit, Vritta signifies conduct, regular cadence, rhythmic observance, and the cyclical pattern of daily life.

Create a crisp, custom SVG or other scalable vector logo that works in the header, favicon, and app icon. Do not use a generic emoji as the main logo. Centralize brand name, logo, colors, icons, and design tokens. Update all in-app references and safe app metadata consistently. Do **not** rename the repository, change a production domain, alter a deployment project, or change any other irreversible external identifier without explicit authorization.

Visual direction: calm and modern, warm rather than clinical, readable typography, consistent spacing, strong information hierarchy, purposeful color, subtle surfaces, and accessible contrast. Avoid needless decoration. Use color with text/icon labels so meaning is never conveyed by color alone. Prefer the existing styling stack unless an important capability is missing.

## 6. Data model and seeding requirements

“Seed the data properly” means putting the routine and reference information in the application's actual persistence layer, not hardcoding cards in a UI component.

The exact schema must follow the real repository and persistence architecture. Conceptually, the data needs to distinguish:

1. **Life-area categories** such as English Learning, Movement & Strength, Listening & Awareness, Reading, Communication, and Reflection.
2. **Routine templates** with stable IDs/keys, title, description, category, recurrence, timing preference, completion method, instructions, required steps, optional steps, active/archive state, and display order if needed.
3. **Scheduled daily instances or completion records** with the user's local date, status, completed-at timestamp when available, and child-step/session progress.
4. **Structured exercise-plan data** for exercise definitions, weekdays, workout/walk/rest patterns, exercise steps, progression, safety notes, and a user-selected activation date.
5. **Osho library reference records** for all 30 entries, language, group, summary, uncertainty notes, optional reported talk-count data, and the URL given for each entry.
6. **Osho progress records** linked to a user and a series/talk/part, separate from daily listening completion.
7. **Diary entries**, if journal text is implemented, always owned by the correct user and kept private.

Implementation rules:

- Make seeding **idempotent**. Running it more than once must not create duplicate categories, routines, exercise definitions, or Osho entries.
- Use stable keys and upsert/update only the seed-owned fields, while preserving user progress, completion history, personal edits where reasonable, and real user-created records.
- Do not wipe a database to reseed. Do not destroy ambiguous records. Identify legacy/demo data using reliable markers or IDs before changing it; otherwise archive or leave it and explain the limitation.
- Keep shared reference data distinct from per-user state. Scope personal routines and diary content to the intended account if authentication or multi-user behavior exists.
- Do not seed fabricated past completions, Osho progress, diary entries, or an assumed exercise-plan start date.
- Add a safe migration only when the real schema requires it. Follow existing patterns, preserve existing records, and document rollback/recovery implications.
- Store seed definitions in dedicated fixtures/modules suitable for testing, not giant arrays inside rendering components.
- Keep data model and UI copy in agreement. “Schedule” is not a life-area category; time, category, recurrence, and completion are separate concepts.
- If the app is single-user/local-first, keep that architecture unless there is a concrete reason to change it. Document any ownership assumptions.

## 7. Engineering workflow

### Phase 1: Explore and baseline

1. Read this entire brief before editing.
2. Inspect the repository structure, stack, dependency conventions, build scripts, routes, main components, styling system, current screens, data flow, persistence, authentication, migrations, deployment configuration, and current product behavior.
3. Identify which existing features work and what must be preserved.
4. Run the project's actual lint, formatting, typecheck, test, and build commands where available. Record existing failures before making changes.
5. Write a concise implementation plan in a project-local engineering note such as `docs/rebuild-plan.md`, including discovered architecture, baseline results, risks, and phases. This note is an implementation artifact, not a source of product requirements.

### Phase 2: Design the data and flows

1. Map the existing schema to the requirements in this brief.
2. Decide how daily plans resolve in the user's local timezone.
3. Design the completion methods for the workbook, exercise plan, Osho listening, reading, speaking, and diary.
4. Establish seed ownership and migration safety before changing real stored data.
5. Centralize brand configuration and define a small reusable design system.

### Phase 3: Implement

1. Implement safe seed data and schema changes using established project conventions.
2. Redesign Today, the routine manager/editor, and Insights.
3. Replace the visible brand name and create a reusable vector logo.
4. Implement weekday-specific exercise cards, structured movement instructions, the 12-week progression, and accessible safety notes.
5. Implement the 30-entry Osho library with per-series progress separate from daily listening completion.
6. Implement the workbook's session counter and required review/uninterrupted-session indicators.
7. Add or refine completion controls, partial progress, validation, loading/empty/error states, mobile accessibility, and safe edit/archive/delete flows.
8. Preserve existing working functionality and genuine user data.

### Phase 4: Verify and report

1. Add or update tests for idempotent seeds, preserved data, recurrence, local-date boundaries, preferred-time flexibility, rest-day handling, workbook partial progress, exercise progression guards, and Osho daily/long-term progress separation.
2. Run the actual project scripts for formatting, lint, typecheck, tests, and production build. Do not claim a check passed unless it was executed.
3. Use available project testing tools to verify mobile layout and the main user flows.
4. Fix regressions introduced by the work where possible.
5. Summarize architecture discovered, files/components changed, schema/seeding behavior, branding choice, tests actually run and results, and any remaining limitations or decisions requiring approval.

## 8. Acceptance criteria

The implementation is complete only when all applicable criteria below are satisfied or a limitation is explicitly documented:

- The agent has inspected the actual codebase and based implementation choices on the existing architecture.
- The six canonical routines are represented by real persisted data and useful, activity-specific completion controls.
- Workbook progress supports 0/2, 1/2, and 2/2 sessions and separately records prior-work review and whether at least one session was uninterrupted.
- Exercise resolves correctly by weekday: workout Monday/Wednesday/Friday; walk plus three stretches Tuesday/Thursday/Saturday; rest Sunday.
- Sunday rest and unscheduled days do not count as misses or lower completion-rate denominators.
- Exercise instructions, sets/reps/rest, easier variations, progression guidance, medical-check-up caution, and stop signals remain accessible in the UI.
- The 12-week exercise plan does not pretend to have started before the user activates it and selects/accepts a start date.
- Osho library contains all 30 titles in the stated order and six groups, with accurate language, descriptions, links, and count uncertainty notes.
- Daily Osho listening completion is separate from long-term series/talk progress. No unverified direct audio links are invented.
- Reading is “30 minutes before bed”; speaking and diary habits have no invented duration or exact time; exercise uses afternoon as a soft preferred period.
- Completion outside the preferred window still counts for that local day.
- Diary entries, personal completion history, and progress are not shared across users.
- Seed reruns do not duplicate data, overwrite meaningful user progress, or delete genuine user records.
- The in-app name, logo, and design tokens are consistently updated without unauthorized changes to external identifiers.
- Today, routine management, and Insights are responsive, accessible, and materially improved.
- Relevant tests/checks either pass or have clearly documented failures/limitations.

## 9. Guardrails

- Do not rewrite the application from scratch unless the repository makes that necessary and the reasoning is documented.
- Do not introduce new infrastructure or a new major library without a clear need.
- Do not invent routine durations, exact clock times, past completions, diary entries, exercise-plan activation dates, or Osho talk counts where uncertainty is stated.
- Do not convert preferred timing into deadlines or treat planned rest as failure.
- Do not progress exercise loads automatically in a way that ignores the stated check-up caution.
- Do not delete or overwrite user data to make the new seed look clean.
- Do not expose private routines, notes, or diary text to another user or an external service without explicit authorization.
- Do not make irreversible external changes such as deployment, domain, repository, or account renaming without approval.
- Make safe, reversible decisions autonomously. Ask for clarification only if a genuinely blocking decision or potential data-loss/security/external side effect requires it.
