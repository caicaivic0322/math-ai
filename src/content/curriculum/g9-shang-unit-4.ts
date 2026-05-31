import type { CurriculumSlice } from "@/types/content";

export const g9ShangUnit4Slice: CurriculumSlice = {
  grade: { id: "g9", label: "九年级", shortLabel: "九上", description: "围绕方程、函数与几何综合应用，进入中考主干能力训练阶段。" },
  volume: { id: "shang", gradeId: "g9", label: "上册", description: "以一元二次方程、函数与圆的性质为主要内容。" },
  chapter: {
    id: "g9-shang-unit-4",
    gradeId: "g9",
    volumeId: "shang",
    slug: "yuan",
    title: "第四章 圆",
    summary: "理解圆的基本性质、圆心角与弧的关系，会处理切线与圆中的基础几何问题。",
    order: 4,
    lessonIds: ["lesson-g9s4-circle-basic", "lesson-g9s4-tangent"],
    workedExampleIds: ["example-g9s4-radius", "example-g9s4-tangent"],
    quizId: "quiz-g9-shang-unit-4",
  },
  lessons: [
    { id: "lesson-g9s4-circle-basic", chapterId: "g9-shang-unit-4", slug: "yuan-de-ji-ben-xing-zhi", title: "圆的基本性质", summary: "掌握半径、直径、弦、弧及圆心角的基本关系。", learningObjectives: ["会区分半径、直径、弦。", "知道同圆或等圆中等弧对等弦。", "理解圆心角与所对弧、弦的关系。"], keyRules: ["直径是经过圆心的弦。", "同圆中等圆心角对等弧，对等弦。", "圆的半径都相等。"] , bodyBlocks:[{type:"richText",id:"g9s4-basic-context",title:"圆里最常用的是“同圆”",content:["圆中很多结论都依赖“在同一个圆里”这个前提。","看到弧、弦、圆心角时，要先确认它们是否对应。"]}], relatedExampleIds:["example-g9s4-radius"], order:1, videoPlaceholder:{title:"板书微课：圆里的弧弦角怎么连起来", durationLabel:"5 分钟", description:"建立弧、弦、圆心角的对应关系。"} },
    { id: "lesson-g9s4-tangent", chapterId: "g9-shang-unit-4", slug: "qie-xian-xing-zhi", title: "切线的性质", summary: "理解切线与半径垂直的性质，会利用切线判定与距离关系解决问题。", learningObjectives: ["知道切线与过切点半径垂直。", "会用垂直关系判断切线。", "会处理切线长相等的简单问题。"], keyRules: ["圆的切线垂直于过切点的半径。", "从圆外一点引圆的两条切线，切线长相等。"], bodyBlocks:[{type:"richText",id:"g9s4-tangent-context",title:"切线题先找半径",content:["切线题最稳的入口通常是“连接圆心和切点”。","一旦连出半径，垂直关系就能直接使用。"]}], relatedExampleIds:["example-g9s4-tangent"], order:2, videoPlaceholder:{title:"板书微课：切线题怎么找辅助线", durationLabel:"6 分钟", description:"用“连圆心到切点”打开切线题。"} },
  ],
  workedExamples: [
    { id: "example-g9s4-radius", chapterId: "g9-shang-unit-4", slug: "yuan-xin-jiao-dui-ying", title: "例题 1：圆心角与弦", summary: "利用同圆中对应关系判断线段相等。", problem: "在同圆中，若 ∠AOB = ∠COD，求弦 AB 与弦 CD 的关系。", steps: [{id:"step-1",title:"同圆对应",content:"同圆中等圆心角所对的弧相等。"}, {id:"step-2",title:"转化到弦",content:"等弧所对的弦相等。"}, {id:"step-3",title:"写结论",content:"所以 AB = CD。"}], answer:"AB = CD", commonMistakes:["忘记“同圆”前提。"], relatedLessonIds:["lesson-g9s4-circle-basic"], order:1 },
    { id: "example-g9s4-tangent", chapterId: "g9-shang-unit-4", slug: "qie-xian-yu-ban-jing", title: "例题 2：切线与半径", summary: "连接圆心到切点，利用垂直关系解题。", problem: "已知直线 l 是圆 O 的切线，切点为 A，OA=5，求 ∠OAl。", steps: [{id:"step-1",title:"找关系",content:"切线垂直于过切点半径。"}, {id:"step-2",title:"得出角度",content:"所以 OA ⟂ l，∠OAl=90°。"}], answer:"90°", commonMistakes:["知道是切线却没有联想到垂直。"], relatedLessonIds:["lesson-g9s4-tangent"], order:2 },
  ],
  quiz: {
    id: "quiz-g9-shang-unit-4",
    chapterId: "g9-shang-unit-4",
    title: "第四章单元小测",
    instructions: "共 10 题，基础 2 题、进阶 4 题、压轴 4 题，整体难度明显上调，更强调多步推理、信息提取与综合应用。",
    passingScore: 80,
    questions: [
      { id: "q1", quizId: "quiz-g9-shang-unit-4", type: "single-choice", difficulty: "basic", stem: "圆中经过圆心的弦叫做什么？", options: [{id:"a",label:"A",content:"半径"},{id:"b",label:"B",content:"直径"},{id:"c",label:"C",content:"弧"},{id:"d",label:"D",content:"切线"}], correctOptionId:"b", explanation:"经过圆心的弦叫做直径。", relatedLessonIds:["lesson-g9s4-circle-basic"] },
      { id: "q2", quizId: "quiz-g9-shang-unit-4", type: "single-choice", difficulty: "basic", stem: "圆的切线与过切点的半径位置关系如何？", options: [{id:"a",label:"A",content:"平行"},{id:"b",label:"B",content:"相交但不垂直"},{id:"c",label:"C",content:"垂直"},{id:"d",label:"D",content:"重合"}], correctOptionId:"c", explanation:"切线垂直于过切点的半径。", relatedLessonIds:["lesson-g9s4-tangent"] },
      { id: "q3", quizId: "quiz-g9-shang-unit-4", type: "fill-blank", difficulty: "advanced", stem: "若圆 O 的半径为 6，请写出它的直径，并说明同圆中所有半径有什么关系。", blanks: [{id:"diameter",prompt:"直径",hint:"直径是半径的 2 倍。",acceptableAnswers:["12"],placeholder:"请填写结果"},{id:"relation",prompt:"半径关系",hint: "先判断所用关系或方法，再同圆中的半径都相等。",acceptableAnswers:["相等"],placeholder:"请填写结果"}], explanation: "依据题目中的条件和相关性质，直径为 12，同圆中的半径都相等。", relatedLessonIds:["lesson-g9s4-circle-basic"] },
      { id: "q4", quizId: "quiz-g9-shang-unit-4", type: "single-choice", difficulty: "advanced", stem: "若在同圆中弦 AB = 弦 CD，则下列哪项一定成立？", options: [{id:"a",label:"A",content:"弧 AB = 弧 CD"},{id:"b",label:"B",content:"AB ∥ CD"},{id:"c",label:"C",content:"AB 经过圆心"},{id:"d",label:"D",content:"AB ⟂ CD"}], correctOptionId:"a", explanation:"同圆中等弦对等弧。", relatedLessonIds:["lesson-g9s4-circle-basic"] },
      { id: "q5", quizId: "quiz-g9-shang-unit-4", type: "fill-blank", difficulty: "advanced", stem: "从圆外一点 P 向圆作两条切线 PA、PB。请填写 PA 与 PB 的关系，并写出三角形 PAB 是否一定是等腰三角形。", blanks: [{id:"len",prompt:"PA 与 PB 的关系",hint:"圆外一点引圆的两条切线长相等。",acceptableAnswers:["PA=PB", "PA = PB"],placeholder:"请填写关系"},{id:"isosceles",prompt:"PAB 是否是等腰三角形",hint:"两条腰相等。",acceptableAnswers:["是"],placeholder:"请填写判断"}], explanation:"切线长相等，所以 PA=PB，△PAB 是等腰三角形。", relatedLessonIds:["lesson-g9s4-tangent"] },
      { id: "q6", quizId: "quiz-g9-shang-unit-4", type: "single-choice", difficulty: "advanced", stem: "若弦 AB 对应的圆心角为 80°，则弦 CD 对应圆心角也为 80° 时，AB 与 CD 的关系如何？", options: [{id:"a",label:"A",content:"AB > CD"},{id:"b",label:"B",content:"AB < CD"},{id:"c",label:"C",content:"AB = CD"},{id:"d",label:"D",content:"无法判断"}], correctOptionId:"c", explanation:"同圆中等圆心角对等弦，所以 AB=CD。", relatedLessonIds:["lesson-g9s4-circle-basic"] },
      { id: "q7", quizId: "quiz-g9-shang-unit-4", type: "fill-blank", difficulty: "challenge", stem: "若圆 O 的切线 l 在点 A 处与圆相切，且 OA=8。请写出 OA 与 l 的关系，并说明点 A 到圆心 O 的距离是多少。", blanks: [{id:"relation",prompt:"OA 与 l 的关系",hint:"切线与过切点半径垂直。",acceptableAnswers:["垂直", "OA⊥l", "OA ⟂ l"],placeholder:"请填写关系"},{id:"dist",prompt:"点 A 到 O 的距离",hint:"就是半径 OA。",acceptableAnswers:["8"],placeholder:"请填写结果"}], explanation:"OA 是半径，所以 OA ⟂ l，点 A 到 O 的距离为 8。", relatedLessonIds:["lesson-g9s4-tangent"] },
      { id: "q8", quizId: "quiz-g9-shang-unit-4", type: "single-choice", difficulty: "challenge", stem: "圆 O 中，若弦 AB、CD 对应的圆心角分别为 100° 和 60°，则弦的长短关系如何？", options: [{id:"a",label:"A",content:"AB > CD"},{id:"b",label:"B",content:"AB < CD"},{id:"c",label:"C",content:"AB = CD"},{id:"d",label:"D",content:"无法比较"}], correctOptionId:"a", explanation:"在同圆中，圆心角越大，对应的弦越长。", relatedLessonIds:["lesson-g9s4-circle-basic"] },
      { id: "q9", quizId: "quiz-g9-shang-unit-4", type: "fill-blank", difficulty: "challenge", stem: "若直径 AB=10，则半径是多少？再写出以 AB 为直径的圆中，过点 A 的半径长度。", blanks: [{id:"radius",prompt:"半径",hint:"直径的一半。",acceptableAnswers:["5"],placeholder:"请填写结果"},{id:"same",prompt:"过点 A 的半径长度",hint:"同圆所有半径相等。",acceptableAnswers:["5"],placeholder:"请填写结果"}], explanation:"直径是 10，所以半径为 5；经过点 A 的半径仍为 5。", relatedLessonIds:["lesson-g9s4-circle-basic"] },
      { id: "q10", quizId: "quiz-g9-shang-unit-4", type: "fill-blank", difficulty: "challenge", stem: "圆外一点 P 到圆 O 引两条切线 PA、PB。若 PA=7，请写出 PB 的长度，并说明 OA、OB 与 PA、PB 组成的两个直角三角形是否全等。", blanks: [{id:"pb",prompt:"PB 的长度",hint:"同一点引圆的两条切线长相等。",acceptableAnswers:["7"],placeholder:"请填写结果"},{id:"congruent",prompt:"两个直角三角形是否全等",hint:"有 OA=OB、PA=PB，且都是直角。",acceptableAnswers:["是"],placeholder:"请填写判断"}], explanation:"PB=7；△OAP 与 △OBP 分别有斜边半径相等、一条直角边相等，所以全等。", relatedLessonIds:["lesson-g9s4-tangent"] },
    ],
  },
};
