export interface PostureCheckpoint {
  part: string;
  cue: string;
  status: "correct" | "warning";
}

export interface DetailedExerciseVideo {
  id: string;
  name: string;
  subtitle: string;
  category: "Mobility & Relief" | "Strength & Posture" | "Core & Alignment" | "Restorative & Decompression";
  phase: "menstrual" | "follicular" | "ovulation" | "luteal" | "all";
  durationSec: number;
  reps?: string;
  equipment: string;
  targetMuscles: string[];
  // High quality embed/video representations
  frontVideoId: string; // YouTube embed ID or video stream
  sideVideoId: string;
  videoPoster: string;
  frontAngleCue: string;
  sideAngleCue: string;
  postureCheckpoints: PostureCheckpoint[];
  correctFormPoints: string[];
  mistakesToAvoid: string[];
  breathingGuide: string;
  hormonalBenefit: string;
}

export const EXERCISE_VIDEO_LIBRARY: Record<string, DetailedExerciseVideo> = {
  childs_pose: {
    id: "childs_pose",
    name: "Child's Pose with Deep Abdominal Breath",
    subtitle: "Balasana — Pelvic Floor & Sacral Decompression",
    category: "Restorative & Decompression",
    phase: "menstrual",
    durationSec: 90,
    reps: "Hold for 8-10 deep breaths",
    equipment: "Yoga Mat or Soft Carpet",
    targetMuscles: ["Lower Back", "Pelvic Floor", "Hip Adductors", "Latissimus Dorsi"],
    frontVideoId: "2MJGg-dUKh0",
    sideVideoId: "eqVMAPM00DM",
    videoPoster: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Open knees mat-width apart, big toes touching together. Allow ribcage to rest between thighs.",
    sideAngleCue: "Sink sit bones back toward heels. Spine stays long with forehead resting softly on mat.",
    postureCheckpoints: [
      { part: "Head & Neck", cue: "Forehead resting on mat; neck completely relaxed with no compression.", status: "correct" },
      { part: "Shoulders & Arms", cue: "Fingertips reaching forward, shoulders relaxed away from ears.", status: "correct" },
      { part: "Spine & Lumbar", cue: "Elongated spine with natural lumbar decompression.", status: "correct" },
      { part: "Pelvis & Hips", cue: "Hips sink toward heels; pelvic floor softens on each exhale.", status: "correct" },
    ],
    correctFormPoints: [
      "Keep knees comfortably wide to create space for full belly expansion.",
      "Send breath into your lower back and kidneys to release uterine cramping.",
      "Press armpits gently downward toward the floor for a mild chest opening.",
    ],
    mistakesToAvoid: [
      "Clamping knees too tightly together, which compresses hips and blocks diaphragmatic breath.",
      "Tensing shoulder blades up near the ears.",
      "Holding breath when feeling pelvic tension.",
    ],
    breathingGuide: "Inhale deeply for 4s down into the pelvic floor; exhale slowly for 6s releasing all lower-back stiffness.",
    hormonalBenefit: "Calms sympathetic 'fight-or-flight' nervous system, reducing prostaglandin-induced cramping during menstrual flow.",
  },

  cat_cow: {
    id: "cat_cow",
    name: "Cat-Cow Dynamic Spine Mobilization",
    subtitle: "Marjaryasana-Bitilasana — Vagus Nerve & Spinal Wave",
    category: "Mobility & Relief",
    phase: "all",
    durationSec: 60,
    reps: "10-12 rhythmic waves",
    equipment: "No Equipment / Mat",
    targetMuscles: ["Thoracic Spine", "Cervical Spine", "Abdominal Wall", "Pelvic Diaphragm"],
    frontVideoId: "kqnua4rHVVA",
    sideVideoId: "yO0w2z6r9_g",
    videoPoster: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Wrists directly stacked under shoulder joints, knees hip-width apart and firmly planted.",
    sideAngleCue: "Inhale arching into Cow (belly drops, chest broadens); exhale rounding into Cat (navel to spine).",
    postureCheckpoints: [
      { part: "Wrists & Hands", cue: "Fingers spread wide like starfish to distribute wrist pressure evenly.", status: "correct" },
      { part: "Cow Phase (Inhale)", cue: "Broaden across collarbones; avoid hyperextending or crunching cervical neck.", status: "correct" },
      { part: "Cat Phase (Exhale)", cue: "Tuck tailbone, draw navel toward spine, push floor away through shoulder blades.", status: "correct" },
      { part: "Hips & Pelvis", cue: "Hips stay stacked directly above knees throughout the motion.", status: "correct" },
    ],
    correctFormPoints: [
      "Initiate the movement from your tailbone and let it ripple up the spine.",
      "Sync each movement smoothly with the beginning and end of your breath.",
      "Keep elbows soft with a micro-bend rather than hyperextending.",
    ],
    mistakesToAvoid: [
      "Jerking head aggressively upward in Cow position.",
      "Shifting weight too far forward past the wrists.",
      "Bending elbows excessively instead of articulating the vertebral column.",
    ],
    breathingGuide: "Inhale fully through your nose as your belly drops (Cow); exhale smoothly out through mouth as you round your back (Cat).",
    hormonalBenefit: "Stimulates cerebrospinal fluid flow and tones the vagus nerve, reducing morning brain fog and hormonal irritability.",
  },

  butterfly: {
    id: "butterfly",
    name: "Reclined Butterfly (Supta Baddha Konasana)",
    subtitle: "Pelvic Floor Relaxation & Ovarian Arterial Flow",
    category: "Restorative & Decompression",
    phase: "menstrual",
    durationSec: 120,
    reps: "2 minutes passive restorative hold",
    equipment: "Mat, optional pillow under knees",
    targetMuscles: ["Pelvic Floor", "Adductor Longus", "Iliopsoas", "Lower Lumbar"],
    frontVideoId: "s39KkH-M1mQ",
    sideVideoId: "8x8_9bJ3a1U",
    videoPoster: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Soles of feet pressed lightly together; knees dropping outward naturally with zero force.",
    sideAngleCue: "Entire spine and back of skull supported comfortably on mat; arms resting open beside hips.",
    postureCheckpoints: [
      { part: "Spine & Lumbar", cue: "Natural gentle curve in lower back, supported without overarching.", status: "correct" },
      { part: "Pelvis", cue: "Zero tension in groin; let gravity naturally drop the knees.", status: "correct" },
      { part: "Neck & Shoulders", cue: "Shoulders rolled open, palms facing upward toward ceiling.", status: "correct" },
    ],
    correctFormPoints: [
      "Place rolled towels or cushions under outer thighs if inner groins feel overstretched.",
      "Breathe 360 degrees into your lower abdomen to gently massage pelvic organs.",
      "Relax your jaw and tongue, as tension in the jaw directly mirrors pelvic floor tension.",
    ],
    mistakesToAvoid: [
      "Forcing knees down with your hands.",
      "Arching lower back off the mat excessively.",
      "Tensing glutes instead of allowing full surrender.",
    ],
    breathingGuide: "Inhale down into the lower pelvis expanding your belly; exhale letting all tightness melt away.",
    hormonalBenefit: "Increases venous and arterial blood flow to the ovaries and uterus, soothing dysmenorrhea and uterine spasms.",
  },

  bridge: {
    id: "bridge",
    name: "Supported Glute Bridge with Pelvic Alignment",
    subtitle: "Setu Bandhasana — Posterior Chain Activation",
    category: "Strength & Posture",
    phase: "all",
    durationSec: 90,
    reps: "10-12 slow controlled reps",
    equipment: "Yoga Mat",
    targetMuscles: ["Gluteus Maximus", "Hamstrings", "Transverse Abdominis", "Pelvic Stabilizers"],
    frontVideoId: "OUgrh8iS_2g",
    sideVideoId: "8bbE64NuDTU",
    videoPoster: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Feet planted hip-width apart and parallel, second toes pointing straight ahead.",
    sideAngleCue: "Drive through heels until a straight diagonal line forms from knees to hips to shoulders.",
    postureCheckpoints: [
      { part: "Feet & Ankles", cue: "Heels under knees; do not allow toes to flare outwards.", status: "correct" },
      { part: "Knees", cue: "Knees stay tracking directly over second toes, neither caving in nor bowing out.", status: "correct" },
      { part: "Lumbar & Pelvis", cue: "Glutes do the lifting, not lower back. No hyperextension at top.", status: "correct" },
      { part: "Neck & Chin", cue: "Chin neutral, eyes looking toward ceiling without compressing throat.", status: "correct" },
    ],
    correctFormPoints: [
      "Squeeze glutes at peak height for 1-2 seconds.",
      "Keep weight concentrated in your heels and mid-foot.",
      "Lower down slowly one vertebra at a time.",
    ],
    mistakesToAvoid: [
      "Pushing with lower back instead of squeezing glutes.",
      "Allowing knees to splay outward or cave inward.",
      "Lifting heels off the ground.",
    ],
    breathingGuide: "Inhale at the bottom; exhale with core brace as you drive hips up; inhale lowering down.",
    hormonalBenefit: "Counteracts anterior pelvic tilt from prolonged sitting, relieving sacral nerve pressure and lumbar fatigue.",
  },

  legs_wall: {
    id: "legs_wall",
    name: "Viparita Karani (Legs-Up-The-Wall Inversion)",
    subtitle: "Deep Restorative Lymphatic & Adrenal Drainage",
    category: "Restorative & Decompression",
    phase: "luteal",
    durationSec: 180,
    reps: "3 minutes static restorative hold",
    equipment: "Wall or Sturdy Headboard",
    targetMuscles: ["Hamstrings", "Lymphatic Network", "Venous Return", "Adrenal Glands"],
    frontVideoId: "0bL39wDjhJ0",
    sideVideoId: "W983G-k9u4s",
    videoPoster: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Legs vertically aligned up the wall, feet relaxed hip-width apart.",
    sideAngleCue: "Sit bones close to baseboard; arms out at 45 degrees with palms facing ceiling.",
    postureCheckpoints: [
      { part: "Pelvis & Lumbar", cue: "Lower back feels completely supported and resting flat.", status: "correct" },
      { part: "Knees", cue: "Micro-bend in knees to prevent hamstring hyperextension.", status: "correct" },
      { part: "Shoulders & Chest", cue: "Collarbones broad, shoulders melting into floor.", status: "correct" },
    ],
    correctFormPoints: [
      "Place a small folded blanket under hips if hamstrings feel tight.",
      "Close your eyes and let gravity assist venous blood flow back toward the heart.",
      "Allow muscles in feet and calves to turn completely floppy.",
    ],
    mistakesToAvoid: [
      "Straining to lock knees completely straight.",
      "Arching lower back off the floor.",
      "Checking your phone — keep eyes closed for true nervous system reset.",
    ],
    breathingGuide: "Inhale for 4 seconds; exhale for 6-8 seconds to engage deep parasympathetic healing.",
    hormonalBenefit: "Relieves fluid retention, luteal phase ankle swelling, and lowers elevated cortisol before bedtime.",
  },

  chin_tuck: {
    id: "chin_tuck",
    name: "Suboccipital Nerve Decompression Chin Tucks",
    subtitle: "Cervical Retraction & Headache Eliminator",
    category: "Mobility & Relief",
    phase: "all",
    durationSec: 60,
    reps: "12-15 controlled retractions",
    equipment: "No Equipment (Chair or Standing)",
    targetMuscles: ["Deep Neck Flexors (Longus Colli)", "Suboccipital Base", "Upper Trapezius"],
    frontVideoId: "wQYL_4gKqAk",
    sideVideoId: "VbE3q-p29m8",
    videoPoster: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Ears level over shoulders, eyes looking straight forward at eye level, jaw unclenched.",
    sideAngleCue: "Glide head straight back as if sliding a drawer in, creating a slight double chin without tilting down.",
    postureCheckpoints: [
      { part: "Gaze & Eyes", cue: "Eyes stay looking straight ahead on the horizon.", status: "correct" },
      { part: "Cervical Spine", cue: "Head glides horizontal backwards, lengthening the back of the skull.", status: "correct" },
      { part: "Shoulders", cue: "Shoulders stay pinned down and back, not shrugging up.", status: "correct" },
    ],
    correctFormPoints: [
      "Feel the gentle stretch right at the base of your skull where headaches originate.",
      "Hold the retracted position for 3 full seconds before gliding back to neutral.",
      "Touch two fingers to your chin as a guide.",
    ],
    mistakesToAvoid: [
      "Tilting chin down onto your chest (this flexes the neck rather than retracting it).",
      "Shrugging shoulders up toward ears.",
      "Holding your breath during the retraction.",
    ],
    breathingGuide: "Inhale at neutral; exhale as you glide head backwards and hold for 3 seconds.",
    hormonalBenefit: "Directly decompresses the greater occipital nerve roots, preventing cervicogenic and hormonal tension headaches.",
  },

  trap_stretch: {
    id: "trap_stretch",
    name: "Upper Trapezius & Levator Scapulae Lateral Stretch",
    subtitle: "Neck Band Decompression & Stress Release",
    category: "Mobility & Relief",
    phase: "all",
    durationSec: 90,
    reps: "45 seconds per side",
    equipment: "No Equipment",
    targetMuscles: ["Upper Trapezius", "Levator Scapulae", "Scalenes", "Sternocleidomastoid"],
    frontVideoId: "g6j9B7P4y6E",
    sideVideoId: "U3sYkE0wP9I",
    videoPoster: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Gently tip right ear toward right shoulder while reaching left fingertips down toward floor.",
    sideAngleCue: "Torso stays strictly vertical without leaning sideways. Opposite shoulder stays dropped down.",
    postureCheckpoints: [
      { part: "Opposite Arm", cue: "Reach left fingertips firmly down to anchor the trapezius muscle.", status: "correct" },
      { part: "Hand Guidance", cue: "Right hand provides only feather-light guidance on top of head, never pulling.", status: "correct" },
      { part: "Torso Alignment", cue: "Spine stays straight; only cervical spine tilts laterally.", status: "correct" },
    ],
    correctFormPoints: [
      "Lower the opposite shoulder down to maximize the lateral neck stretch.",
      "Turn chin down 45 degrees toward collarbone to target the levator scapulae.",
      "Breathe into the tight muscle fibers with slow, melting exhales.",
    ],
    mistakesToAvoid: [
      "Yanking or pulling aggressively on the head.",
      "Leaning your whole torso over to the side.",
      "Holding tension in your jaw or clenching teeth.",
    ],
    breathingGuide: "Exhale deeply into the feeling of tension releasing with each cycle.",
    hormonalBenefit: "Releases trapped somatic stress stored in neck fascia during progesterone shifts, eliminating throbbing temple pain.",
  },

  squat: {
    id: "squat",
    name: "Goblet Squat with Hip Hinge & Deep Knee Tracking",
    subtitle: "Lower Body Strength & Pelvic Base Building",
    category: "Strength & Posture",
    phase: "follicular",
    durationSec: 60,
    reps: "12-15 controlled reps",
    equipment: "Dumbbell or Kettlebell (or Bodyweight)",
    targetMuscles: ["Quadriceps", "Gluteus Maximus", "Adductor Magnus", "Transverse Core"],
    frontVideoId: "MeIiIdhvXT4",
    sideVideoId: "MVMNK0HiTPg",
    videoPoster: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Feet slightly wider than shoulders, toes angled out 15-30 degrees, knees track over toes.",
    sideAngleCue: "Hips travel back and down simultaneously; chest stays proudly upright with neutral spine.",
    postureCheckpoints: [
      { part: "Chest & Torso", cue: "Sternum stays elevated; elbows tucked in under weight.", status: "correct" },
      { part: "Knees & Stance", cue: "Knees push outward in line with second toes, never caving in.", status: "correct" },
      { part: "Spine & Lumbar", cue: "Neutral lumbar spine maintained down to parallel without 'butt wink'.", status: "correct" },
      { part: "Feet & Weight", cue: "Weight balanced over midfoot and heels, all ten toes grounded.", status: "correct" },
    ],
    correctFormPoints: [
      "Descend smoothly under control until hip crease is parallel with tops of knees.",
      "Drive through heels and squeeze glutes forward at top lockout.",
      "Brace your core as if preparing to take a light tap to the stomach.",
    ],
    mistakesToAvoid: [
      "Knees caving inward (knee valgus) on ascent.",
      "Lifting heels off the ground.",
      "Rounding the upper back and collapsing the chest.",
    ],
    breathingGuide: "Inhale and brace core on the descent; exhale with power as you stand back up.",
    hormonalBenefit: "Maximizes peak estrogen muscle protein synthesis during follicular days 6–13, boosting metabolic rate and bone density.",
  },

  rdl: {
    id: "rdl",
    name: "Romanian Deadlift (RDL) with Flat Spine",
    subtitle: "Posterior Chain Hamstring & Glute Hinge",
    category: "Strength & Posture",
    phase: "follicular",
    durationSec: 60,
    reps: "10-12 reps",
    equipment: "Pair of Dumbbells",
    targetMuscles: ["Hamstrings", "Gluteus Maximus", "Erector Spinae", "Latissimus Dorsi"],
    frontVideoId: "JCXUYuzwNrM",
    sideVideoId: "5_vecpWp_kU",
    videoPoster: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Feet hip-width apart and parallel, dumbbells resting lightly against front of thighs.",
    sideAngleCue: "Hips push straight back like closing a car door behind you; spine remains rigid and flat.",
    postureCheckpoints: [
      { part: "Shoulders & Back", cue: "Shoulder blades pulled back and down; lats locked in tight.", status: "correct" },
      { part: "Hip Hinge", cue: "Hips travel horizontally backwards; knees have only a soft 15-20 deg bend.", status: "correct" },
      { part: "Weights Path", cue: "Dumbbells glide closely along shins without drifting away from legs.", status: "correct" },
      { part: "Neck Alignment", cue: "Gaze stays 6 feet in front on floor to preserve neutral cervical spine.", status: "correct" },
    ],
    correctFormPoints: [
      "Stop when your hamstrings reach maximum stretch (usually around mid-shin).",
      "Drive your hips forward through the ground to stand back up.",
      "Keep the core braced and ribs tucked down.",
    ],
    mistakesToAvoid: [
      "Rounding the lower or mid-back at the bottom.",
      "Squatting the weight by bending knees too much.",
      "Letting the dumbbells drift far away from your legs.",
    ],
    breathingGuide: "Inhale and brace core as hips push back; exhale forcefully as you drive hips forward to stand.",
    hormonalBenefit: "Strengthens entire postural posterior chain, reversing the slouch of desk work and sculpting lean muscle.",
  },

  bird_dog: {
    id: "bird_dog",
    name: "Bird-Dog Core & Rotary Stability",
    subtitle: "McGill Big 3 — Spine Stabilization & Glute Medius",
    category: "Core & Alignment",
    phase: "all",
    durationSec: 90,
    reps: "10 alternating reps with 3s hold",
    equipment: "Yoga Mat",
    targetMuscles: ["Erector Spinae", "Gluteus Medius", "Transverse Abdominis", "Multifidus"],
    frontVideoId: "wiFNA3sqjCA",
    sideVideoId: "vbfnNhpkI98",
    videoPoster: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Wrists under shoulders, knees under hips. Tabletop flat back with zero pelvic tilt.",
    sideAngleCue: "Opposite arm reaches straight forward and leg reaches straight back in a single parallel line.",
    postureCheckpoints: [
      { part: "Pelvis & Hips", cue: "Hips stay squared flat to the mat without rotating open toward the ceiling.", status: "correct" },
      { part: "Arm & Leg Line", cue: "Arm and leg reach long like reaching for opposite walls, not lifting excessively high.", status: "correct" },
      { part: "Core & Lumbar", cue: "No arching or dipping in lower back at maximum reach.", status: "correct" },
    ],
    correctFormPoints: [
      "Imagine balancing a cup of water on your lower back that must not spill.",
      "Flex back foot with heel kicking straight into the wall behind you.",
      "Hold the extension for 3 steady seconds before returning under control.",
    ],
    mistakesToAvoid: [
      "Kicking leg too high, causing lower back to hyperextend.",
      "Rotating the hip of the extended leg open.",
      "Rushing through reps without pausing to stabilize.",
    ],
    breathingGuide: "Exhale as arm and leg reach out into full extension; inhale as they return under control to all fours.",
    hormonalBenefit: "Strengthens deep multifidus muscles and prevents sacroiliac joint instability caused by cycle relaxin fluctuations.",
  },

  pilates_100: {
    id: "pilates_100",
    name: "Pilates Hundred Deep Abdominal Activation",
    subtitle: "Transverse Core & Oxygenating Circulation",
    category: "Core & Alignment",
    phase: "luteal",
    durationSec: 90,
    reps: "100 arm pumps (10 breath cycles)",
    equipment: "Mat",
    targetMuscles: ["Transverse Abdominis", "Rectus Abdominis", "Intercostals", "Pelvic Diaphragm"],
    frontVideoId: "vP3fN31n29c",
    sideVideoId: "w_pT57q6q1g",
    videoPoster: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    frontAngleCue: "Legs in tabletop (shins parallel to floor) or extended 45 degrees; arms hovering by hips.",
    sideAngleCue: "Head and shoulder blades curled off mat; lower back firmly imprinted into floor.",
    postureCheckpoints: [
      { part: "Lower Back", cue: "Lumbar spine is completely flush with the floor with zero gap.", status: "correct" },
      { part: "Arms & Hands", cue: "Arms straight and firm, pumping rhythmically up and down 6 inches.", status: "correct" },
      { part: "Gaze & Neck", cue: "Eyes focused at thighs or knees, keeping neck long and tension-free.", status: "correct" },
    ],
    correctFormPoints: [
      "Breathe rhythmically: in for 5 pumps, out for 5 pumps.",
      "Draw navel inward toward spine on every exhale.",
      "Keep legs locked in tabletop if lower back begins to arch off floor.",
    ],
    mistakesToAvoid: [
      "Straining through neck instead of curling up from the upper abs.",
      "Allowing lower back to peel off the mat.",
      "Floppy or bent elbows during the arm pumps.",
    ],
    breathingGuide: "Inhale through the nose for 5 counts; exhale through pursed lips for 5 counts.",
    hormonalBenefit: "Tones the deep abdominal wall without high-impact spinal pounding, ideal for high-progesterone luteal days.",
  },
};
