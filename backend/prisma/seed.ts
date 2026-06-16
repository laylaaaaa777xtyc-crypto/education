/**
 * Starter dataset，覆盖初中 15 个学科。
 * 主科教材版本（江苏地区现行）：
 *   数学 / 物理：苏科版
 *   语文：部编版（统编版）
 *   英语：译林版（牛津译林）
 *   化学：沪教版
 *   生物 / 地理 / 历史 / 道德与法治：人教版（部编版）
 *   信息科技：人教版（2022 新课标）
 *
 * 体育、音乐、美术、综合实践、劳动为首版占位内容，
 * 仅为保证学科下拉框完整，知识点较少，正式上线前需教师补充。
 *
 * 章节命名取自上述版本目录。每章 1-2 个代表性知识点。
 * 这是 MVP starter，正式上线前请让老师过一遍内容。
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type Grade = 'G7' | 'G8' | 'G9';
interface Example { question: string; answer: string; explanation?: string; }
interface KPInput {
  subjectCode: string;
  grade: Grade;
  chapter: string;
  title: string;
  summary: string;
  examples: Example[];
}

const SUBJECTS = [
  // 核心主科
  { code: 'CHINESE',   name: '语文' },
  { code: 'MATH',      name: '数学' },
  { code: 'ENGLISH',   name: '英语' },
  // 理科综合
  { code: 'PHYSICS',   name: '物理' },
  { code: 'CHEMISTRY', name: '化学' },
  { code: 'BIOLOGY',   name: '生物' },
  { code: 'GEOGRAPHY', name: '地理' },
  // 文科综合
  { code: 'HISTORY',   name: '历史' },
  { code: 'MORALITY',  name: '道德与法治' },
  // 信息类
  { code: 'INFOTECH',  name: '信息科技' },
  // 体育与艺术（首版占位，内容较少）
  { code: 'PE',        name: '体育与健康' },
  { code: 'MUSIC',     name: '音乐' },
  { code: 'ART',       name: '美术' },
  // 综合实践类（首版占位）
  { code: 'PRACTICE',  name: '综合实践活动' },
  { code: 'LABOR',     name: '劳动' },
];

// ============================================================
//                    数学（苏科版）
// ============================================================
const MATH: KPInput[] = [
  // --- G7 ---
  { subjectCode: 'MATH', grade: 'G7', chapter: '有理数',
    title: '有理数的加法法则',
    summary: '同号两数相加，取相同的符号，并把绝对值相加；\n异号两数相加，绝对值相等时和为 0；绝对值不等时，取绝对值较大数的符号，并用较大的绝对值减去较小的绝对值；\n一个数同 0 相加，仍得这个数。',
    examples: [
      { question: '计算 (-3) + (-5)', answer: '-8', explanation: '同号相加，取负号，3 + 5 = 8。' },
      { question: '计算 (-7) + 4', answer: '-3', explanation: '异号相加，|-7| > |4|，取负号，7 - 4 = 3。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '有理数',
    title: '绝对值与相反数',
    summary: '一个数 a 的绝对值是它在数轴上对应点到原点的距离，记作 |a|，|a| ≥ 0；\n互为相反数的两个数的和为 0，绝对值相等。',
    examples: [
      { question: '|-2.5| = ?', answer: '2.5' },
      { question: '若 |x| = 3，则 x = ?', answer: '±3', explanation: '正数和它的相反数的绝对值相等。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '代数式',
    title: '代数式的求值',
    summary: '把代数式中的字母用具体的数值代替，按照代数式所表示的运算关系，算出结果，叫做代数式的求值。注意字母前的负号和小括号要保留。',
    examples: [
      { question: '当 a = -2, b = 3 时，求 3a - b 的值', answer: '-9', explanation: '3 × (-2) - 3 = -6 - 3 = -9。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '代数式',
    title: '合并同类项',
    summary: '所含字母相同，并且相同字母的指数也相同的项，叫做同类项；合并同类项时，把同类项的系数相加，所得结果作为系数，字母和字母的指数保持不变。',
    examples: [
      { question: '合并同类项：3a²b - 5a²b + 2ab²', answer: '-2a²b + 2ab²' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '一元一次方程',
    title: '一元一次方程的解法',
    summary: '一般步骤：去分母 → 去括号 → 移项 → 合并同类项 → 系数化为 1。移项要变号。',
    examples: [
      { question: '解方程：3x - 5 = x + 7', answer: 'x = 6', explanation: '移项：3x - x = 7 + 5，2x = 12，x = 6。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '一元一次方程',
    title: '列方程解应用题',
    summary: '步骤：审题 → 设未知数 → 找等量关系 → 列方程 → 解方程 → 检验并作答。常见模型有行程、工程、和差倍分、利润等。',
    examples: [
      { question: '甲乙两人相距 30 km，相向而行，甲速 4 km/h，乙速 6 km/h，几小时相遇？',
        answer: '3 小时',
        explanation: '设 t 小时相遇，4t + 6t = 30，t = 3。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '二元一次方程组',
    title: '代入消元法与加减消元法',
    summary: '代入消元：把一个方程变形为 y = … 或 x = … ，代入另一个方程；\n加减消元：通过加减让某个未知数系数相同（相反），消去得到一元一次方程。',
    examples: [
      { question: '解方程组 { x + y = 7; x - y = 1 }', answer: 'x = 4, y = 3',
        explanation: '两式相加：2x = 8，x = 4；代回 y = 3。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '一元一次不等式',
    title: '不等式的基本性质',
    summary: '①不等式两边同时加（或减）同一个数（式），不等号方向不变；\n②不等式两边同时乘（或除）同一个正数，不等号方向不变；\n③不等式两边同时乘（或除）同一个负数，不等号方向改变。',
    examples: [
      { question: '解不等式 -2x + 3 ≤ 5', answer: 'x ≥ -1',
        explanation: '移项 -2x ≤ 2，两边除以 -2 要变号，x ≥ -1。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '幂的运算',
    title: '同底数幂的乘法与积的乘方',
    summary: 'a^m · a^n = a^(m+n)（同底数幂相乘，底数不变，指数相加）；\n(ab)^n = a^n · b^n（积的乘方等于乘方的积）。',
    examples: [
      { question: '计算 a³ · a²', answer: 'a⁵' },
      { question: '计算 (-2ab²)³', answer: '-8a³b⁶' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G7', chapter: '幂的运算',
    title: '乘法公式：平方差与完全平方',
    summary: '(a + b)(a - b) = a² - b²；\n(a ± b)² = a² ± 2ab + b²。',
    examples: [
      { question: '计算 (x + 3)(x - 3)', answer: 'x² - 9' },
      { question: '计算 (2x - 1)²', answer: '4x² - 4x + 1' },
    ],
  },

  // --- G8 ---
  { subjectCode: 'MATH', grade: 'G8', chapter: '全等三角形',
    title: '全等三角形的判定',
    summary: '判定方法：SSS、SAS、ASA、AAS、HL（直角三角形）。注意 SSA（边边角）一般不能判定全等。',
    examples: [
      { question: '在 △ABC 与 △DEF 中，AB = DE, ∠A = ∠D, AC = DF，是否全等？',
        answer: '全等', explanation: '满足 SAS。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G8', chapter: '勾股定理',
    title: '勾股定理及其逆定理',
    summary: '直角三角形两直角边 a、b 与斜边 c 满足 a² + b² = c²；\n逆定理：若三边满足 a² + b² = c²，则该三角形为直角三角形。',
    examples: [
      { question: '直角三角形两直角边 3 和 4，斜边长？', answer: '5' },
      { question: '判断三边 5、12、13 能否构成直角三角形',
        answer: '能', explanation: '5² + 12² = 25 + 144 = 169 = 13²。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G8', chapter: '实数与二次根式',
    title: '实数的分类与运算',
    summary: '实数包括有理数和无理数；\n二次根式 √a 要求 a ≥ 0；\n√(a²) = |a|。',
    examples: [
      { question: '化简 √18', answer: '3√2', explanation: '18 = 9 × 2，√18 = 3√2。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G8', chapter: '一次函数',
    title: '一次函数 y = kx + b 的图象与性质',
    summary: '一次函数图象是直线；\nk > 0 时函数随 x 增大而增大；k < 0 时函数随 x 增大而减小；\nb 为图象与 y 轴交点的纵坐标。',
    examples: [
      { question: '已知 y = 2x - 3，求与 x 轴交点坐标',
        answer: '(1.5, 0)', explanation: '令 y = 0：2x - 3 = 0，x = 1.5。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G8', chapter: '一次函数',
    title: '待定系数法求一次函数表达式',
    summary: '由两个已知点的坐标代入 y = kx + b，解关于 k、b 的方程组求出表达式。',
    examples: [
      { question: '已知一次函数图象经过 (1, 3) 和 (-1, -1)，求表达式',
        answer: 'y = 2x + 1',
        explanation: '代入两点解方程组得 k = 2, b = 1。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G8', chapter: '反比例函数',
    title: '反比例函数 y = k/x 的性质',
    summary: '当 k > 0 时，图象在一、三象限，在每个象限内 y 随 x 增大而减小；\n当 k < 0 时，图象在二、四象限，在每个象限内 y 随 x 增大而增大；\n图象关于原点中心对称。',
    examples: [
      { question: '反比例函数 y = -6/x 的图象在哪两个象限？',
        answer: '第二、四象限' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G8', chapter: '平行四边形',
    title: '平行四边形的判定与性质',
    summary: '性质：对边平行且相等，对角相等，对角线互相平分；\n判定：两组对边分别平行 / 一组对边平行且相等 / 对角线互相平分 / 两组对边分别相等 → 平行四边形。',
    examples: [
      { question: '已知四边形 ABCD 中 AB ∥ CD 且 AB = CD，能否判定它是平行四边形？',
        answer: '能', explanation: '一组对边平行且相等。' },
    ],
  },

  // --- G9 ---
  { subjectCode: 'MATH', grade: 'G9', chapter: '一元二次方程',
    title: '一元二次方程的解法',
    summary: '常用方法：①直接开方法（形如 (x+m)² = n）；②配方法；③公式法 x = (-b ± √(b² - 4ac)) / 2a；④因式分解法（十字相乘 / 提公因式）。',
    examples: [
      { question: '解方程 x² - 5x + 6 = 0',
        answer: 'x₁ = 2, x₂ = 3',
        explanation: '因式分解 (x-2)(x-3) = 0。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G9', chapter: '一元二次方程',
    title: '判别式 Δ = b² - 4ac',
    summary: 'Δ > 0：方程有两个不相等的实数根；\nΔ = 0：方程有两个相等的实数根；\nΔ < 0：方程无实数根。',
    examples: [
      { question: '判断 2x² - 4x + 3 = 0 的根的情况',
        answer: '无实数根',
        explanation: 'Δ = 16 - 24 = -8 < 0。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G9', chapter: '圆',
    title: '圆周角定理',
    summary: '同弧所对的圆周角等于该弧所对的圆心角的一半；同弧或等弧所对的圆周角相等；直径所对的圆周角为 90°。',
    examples: [
      { question: '在 ⊙O 中，弧 AB 所对的圆心角为 80°，求其所对圆周角',
        answer: '40°' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G9', chapter: '圆',
    title: '切线的判定与性质',
    summary: '判定：经过半径外端并且垂直于这条半径的直线是圆的切线；\n性质：圆的切线垂直于过切点的半径。',
    examples: [
      { question: '已知 OA 是 ⊙O 的半径，AB ⊥ OA 于 A，判断 AB 与 ⊙O 的位置关系',
        answer: '相切（AB 是切线）' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G9', chapter: '二次函数',
    title: '二次函数的顶点式',
    summary: 'y = a(x - h)² + k（a ≠ 0）是顶点式，顶点 (h, k)，对称轴 x = h；\na > 0 开口向上，有最小值 k；a < 0 开口向下，有最大值 k。',
    examples: [
      { question: '将 y = x² - 4x + 1 化为顶点式',
        answer: 'y = (x - 2)² - 3',
        explanation: '配方：x² - 4x + 1 = (x - 2)² - 3。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G9', chapter: '图形的相似',
    title: '相似三角形的判定与性质',
    summary: '判定：两角对应相等 / 两边成比例且夹角相等 / 三边对应成比例；\n性质：对应角相等，对应边成比例，相似比的平方等于面积比。',
    examples: [
      { question: '△ABC ∽ △DEF，相似比 2:3，△ABC 面积 12，求 △DEF 面积',
        answer: '27',
        explanation: '面积比 = 相似比² = 4:9，12 × 9/4 = 27。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G9', chapter: '锐角三角函数',
    title: '锐角三角函数的定义',
    summary: '在直角三角形中，对一个锐角 α：\nsin α = 对边 / 斜边；cos α = 邻边 / 斜边；tan α = 对边 / 邻边。\n特殊角值：sin30° = 1/2，sin45° = √2/2，sin60° = √3/2。',
    examples: [
      { question: '在 Rt△ABC 中 ∠C = 90°，AC = 3, BC = 4，求 sin A',
        answer: '4/5',
        explanation: 'AB = 5，sin A = 对边 / 斜边 = 4/5。' },
    ],
  },
  { subjectCode: 'MATH', grade: 'G9', chapter: '统计与概率',
    title: '用列表 / 树状图法求概率',
    summary: '当试验有两步或两步以上时，可以用列表或画树状图法找出所有等可能的结果，再用所求事件的结果数 / 总结果数计算概率。',
    examples: [
      { question: '抛两枚均匀硬币，求恰好出现一正一反的概率',
        answer: '1/2',
        explanation: '4 种等可能结果中正反、反正共 2 种。' },
    ],
  },
];

// ============================================================
//                    语文（部编版）
// ============================================================
const CHINESE: KPInput[] = [
  // G7
  { subjectCode: 'CHINESE', grade: 'G7', chapter: '修辞手法',
    title: '常见修辞：比喻、拟人、排比',
    summary: '比喻：用本质不同的事物作比，分明喻、暗喻、借喻；\n拟人：把物当作人来写，赋予人的动作或情感；\n排比：三个或三个以上结构相似、语气一致的句子排列起来。',
    examples: [
      { question: '判断："春天像刚落地的娃娃" 用了什么修辞？',
        answer: '比喻（明喻）' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G7', chapter: '文言文基础',
    title: '常见文言实词与一词多义',
    summary: '初中阶段常考实词如：之、其、而、以、于、为；要结合上下文判断词性和含义。',
    examples: [
      { question: '"学而时习之" 中的 "之" 指代什么？',
        answer: '指代学过的知识' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G7', chapter: '现代文阅读',
    title: '写景散文的赏析方法',
    summary: '从感官（视、听、嗅、触）、修辞（比喻、拟人）、动静结合、虚实相生、色彩描绘等角度分析，并联系作者情感。',
    examples: [
      { question: '《春》中"小草偷偷地从土里钻出来"运用了什么手法？',
        answer: '拟人',
        explanation: '"偷偷地""钻"赋予小草人的动作。' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G7', chapter: '古诗词鉴赏',
    title: '诗歌意象与意境',
    summary: '意象是诗中具体的物象（如月、雁、柳）；意境是这些意象组合传达出的整体氛围与情感。',
    examples: [
      { question: '"举头望明月，低头思故乡"中"月"的意象寄托了什么情感？',
        answer: '思乡之情' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G7', chapter: '写作',
    title: '记叙文六要素',
    summary: '时间、地点、人物、事件的起因、经过、结果。写作时要叙事完整，详略得当。',
    examples: [
      { question: '简述"运动会接力赛"一文应包含哪些要素？',
        answer: '比赛时间、地点、参赛人物、为什么参赛、比赛过程、结果与感受。' },
    ],
  },

  // G8
  { subjectCode: 'CHINESE', grade: 'G8', chapter: '说明文阅读',
    title: '说明方法及其作用',
    summary: '常见说明方法：举例子、列数字、作比较、打比方、分类别、下定义、画图表。每种方法都有让事物特征更清晰、具体或直观的作用。',
    examples: [
      { question: '"长城全长 21196 千米" 用了什么说明方法？',
        answer: '列数字',
        explanation: '用精确数字使说明对象具体可感。' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G8', chapter: '文言文基础',
    title: '常见文言虚词：之、而、以、于',
    summary: '"之"作代词、助词；"而"表并列、承接、转折；"以"作介词或连词；"于"多作介词，表处所、对象或比较。',
    examples: [
      { question: '"学而不思则罔" 中的 "而" 表示什么关系？',
        answer: '转折',
        explanation: '前后语义相对。' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G8', chapter: '议论文阅读',
    title: '议论文三要素',
    summary: '论点（明确的判断）、论据（事实或道理）、论证（用论据证明论点的过程，常见有举例、道理、对比、比喻论证）。',
    examples: [
      { question: '"近朱者赤，近墨者黑" 在议论文中常作什么用？',
        answer: '道理论据 / 比喻论证' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G8', chapter: '古诗词鉴赏',
    title: '词的常见题材与风格',
    summary: '婉约词（柳永、李清照）多写离愁别绪，语言细腻；豪放词（苏轼、辛弃疾）多写家国、历史，意境开阔。',
    examples: [
      { question: '《念奴娇·赤壁怀古》属于哪种风格？',
        answer: '豪放词',
        explanation: '苏轼咏史抒怀，气势宏大。' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G8', chapter: '写作',
    title: '记叙文的细节描写',
    summary: '细节描写包括动作、神态、语言、心理、外貌；细节要"小而真"，能突出人物个性或情感。',
    examples: [
      { question: '改写句子让其细节更生动："他生气了"',
        answer: '示例：他攥紧拳头，脸涨得通红，眼睛瞪得像要喷出火来。' },
    ],
  },

  // G9
  { subjectCode: 'CHINESE', grade: 'G9', chapter: '小说阅读',
    title: '小说三要素与人物分析',
    summary: '人物、情节、环境是小说三要素。分析人物可从外貌、语言、动作、心理、侧面烘托入手，结合时代背景。',
    examples: [
      { question: '《孔乙己》中"长衫"的细节有什么作用？',
        answer: '揭示孔乙己自命读书人的迂腐与悲剧。' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G9', chapter: '文言文基础',
    title: '文言文断句的基本方法',
    summary: '抓虚词（之乎者也）、抓对话词（曰云）、抓句式（对偶、排比）、抓语法成分；先整体读懂再断句。',
    examples: [
      { question: '为下句断句："吾尝终日而思矣不如须臾之所学也"',
        answer: '吾尝终日而思矣 / 不如须臾之所学也',
        explanation: '抓"矣"作句末助词。' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G9', chapter: '议论文阅读',
    title: '论证方法的辨析',
    summary: '举例论证（用事例）、道理论证（用名言公理）、对比论证（正反对照）、比喻论证（化抽象为形象）。',
    examples: [
      { question: '"鱼，我所欲也；熊掌，亦我所欲也" 是什么论证？',
        answer: '比喻论证 / 类比论证' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G9', chapter: '现代文阅读',
    title: '鲁迅作品的语言风格',
    summary: '语言冷峻深刻，善用反讽与白描；情感隐忍而批判性强；常用对话、神态等小细节展现人物命运。',
    examples: [
      { question: '《故乡》结尾"希望本是无所谓有，无所谓无的"传达什么？',
        answer: '对未来的辩证思考，希望需要在行动中创造。' },
    ],
  },
  { subjectCode: 'CHINESE', grade: 'G9', chapter: '写作',
    title: '议论文立意与结构',
    summary: '立意要正确、深刻、新颖；常用结构："总—分—总"，提出论点 → 分论点论证 → 总结升华。',
    examples: [
      { question: '以"坚持"为话题，列出 3 个分论点',
        answer: '示例：坚持是攀登的阶梯 / 坚持需要方法 / 坚持的最终是与自己和解。' },
    ],
  },
];

// ============================================================
//                    英语（译林版）
// ============================================================
const ENGLISH: KPInput[] = [
  // G7
  { subjectCode: 'ENGLISH', grade: 'G7', chapter: 'Unit 1 This is me',
    title: 'be 动词的用法',
    summary: 'I am、you/we/they are、he/she/it is；\n肯定句：主 + be + 表语；\n否定句：be + not；\n一般疑问句：be 提到句首。',
    examples: [
      { question: '改写为一般疑问句：He is my brother.',
        answer: 'Is he your brother?' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G7', chapter: 'Unit 4 My day',
    title: '一般现在时',
    summary: '表示经常或习惯的动作。第三人称单数动词加 s/es；\n否定：do/does + not + 动词原形；\n疑问：Do/Does + 主语 + 动词原形…？',
    examples: [
      { question: '改写否定句：She goes to school by bike.',
        answer: 'She does not (doesn\'t) go to school by bike.' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G7', chapter: 'Unit 5 Let\'s celebrate',
    title: '频度副词',
    summary: 'always (100%) > usually > often > sometimes > seldom > never (0%)。\n常放在 be 动词之后、行为动词之前。',
    examples: [
      { question: '翻译：我有时和朋友们一起踢足球。',
        answer: 'I sometimes play football with my friends.' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G7', chapter: 'Unit 6 Food and lifestyle',
    title: '可数名词与不可数名词',
    summary: '可数名词有单复数（apple → apples）；\n不可数名词无复数形式（water、bread），表数量用 a cup of / a piece of。',
    examples: [
      { question: '填空：I have two ____ of bread.',
        answer: 'pieces' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G7', chapter: 'Unit 4 Finding your way',
    title: '介词 in / on / at（时间和地点）',
    summary: '时间：at + 钟点，on + 星期 / 具体日期，in + 月份 / 年份 / 季节；\n地点：at + 较小地点，on + 街道 / 表面，in + 较大区域。',
    examples: [
      { question: '填空：We have a meeting ___ Monday morning.',
        answer: 'on' },
    ],
  },

  // G8
  { subjectCode: 'ENGLISH', grade: 'G8', chapter: 'Unit 3 A day out',
    title: '一般过去时',
    summary: '表示过去某时发生的动作或状态；动词用过去式（规则动词 +ed，不规则要背）；\n否定：didn\'t + 动词原形；疑问：Did + 主语 + 动词原形…？',
    examples: [
      { question: '改写为一般疑问句：They went to Beijing last year.',
        answer: 'Did they go to Beijing last year?' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G8', chapter: 'Unit 1 Past and present',
    title: '现在完成时',
    summary: 'have/has + 过去分词；表示过去发生但与现在有联系的动作，或从过去持续到现在的状态。常与 already / just / yet / since / for 连用。',
    examples: [
      { question: '填空：I ______ (live) here since 2018.',
        answer: 'have lived' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G8', chapter: 'Unit 1 Friends',
    title: '形容词比较级和最高级',
    summary: '比较级：er / more（两者比较）；\n最高级：est / most + the（三者及以上）；\n特殊：good→better→best, bad→worse→worst。',
    examples: [
      { question: 'Tom is ____ (tall) than Jim.',
        answer: 'taller' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G8', chapter: 'Unit 8 A green world',
    title: '被动语态（一般现在 / 过去）',
    summary: '结构：主语 + be + 过去分词 + (by + 动作执行者)；时态体现在 be 上。',
    examples: [
      { question: '改写：They built this bridge in 1990.',
        answer: 'This bridge was built in 1990 (by them).' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G8', chapter: 'Unit 5 Good manners',
    title: '反义疑问句',
    summary: '前肯后否、前否后肯；助动词 / 情态动词 / be 与主句保持时态人称一致；陈述部分含 never / few / seldom 等否定词时，附加问句用肯定。',
    examples: [
      { question: '补全：She is your teacher, ______?',
        answer: 'isn\'t she' },
    ],
  },

  // G9
  { subjectCode: 'ENGLISH', grade: 'G9', chapter: 'Unit 8 Detective stories',
    title: '宾语从句',
    summary: '由 that / if / whether / 疑问词 引导；\n时态主从一致：主句过去时，从句相应过去时态；从句用陈述语序。',
    examples: [
      { question: '合并：He asked. "Where do you live?"',
        answer: 'He asked where I lived.' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G9', chapter: 'Unit 3 Teenage problems',
    title: '状语从句（时间、条件）',
    summary: '常见连词：when / while / as / before / after（时间）；if / unless（条件）。\n主将从现：主句一般将来时，从句一般现在时。',
    examples: [
      { question: '填空：If it ___ (rain) tomorrow, I will stay at home.',
        answer: 'rains' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G9', chapter: 'Unit 4 Growing up',
    title: '定语从句',
    summary: '关系代词 who / whom / which / that / whose；\nwho、whom 指人；which 指物；that 指人或物。\n关系副词 when / where / why。',
    examples: [
      { question: '填空：This is the book ___ I bought yesterday.',
        answer: 'that / which' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G9', chapter: 'Unit 5 Art world',
    title: '非谓语动词：动名词与不定式',
    summary: '动名词 -ing：作主语、宾语、表语；like / enjoy / mind / finish + doing；\n不定式 to do：作宾语、目的状语；want / hope / decide / would like + to do。',
    examples: [
      { question: '填空：I enjoy ___ (read) novels.',
        answer: 'reading' },
    ],
  },
  { subjectCode: 'ENGLISH', grade: 'G9', chapter: 'Unit 3 Robots',
    title: '虚拟语气（if 条件句）',
    summary: '与现在事实相反：If + 主语 + 动词过去式, 主语 + would / could + 动词原形；\nbe 动词统一用 were。',
    examples: [
      { question: '完成：If I ___ (be) you, I would tell the truth.',
        answer: 'were' },
    ],
  },
];

// ============================================================
//                    物理（苏科版）
// ============================================================
const PHYSICS: KPInput[] = [
  // G8
  { subjectCode: 'PHYSICS', grade: 'G8', chapter: '声现象',
    title: '声音的三个特性',
    summary: '响度（声音的强弱，由振幅决定）；\n音调（声音的高低，由频率决定）；\n音色（声音的特色，由发声体的材料和结构决定）。',
    examples: [
      { question: '能从远处分辨出妈妈的声音，主要靠声音的什么特性？',
        answer: '音色' },
    ],
  },
  { subjectCode: 'PHYSICS', grade: 'G8', chapter: '物态变化',
    title: '六种物态变化及吸放热',
    summary: '熔化（固→液，吸热）、凝固（液→固，放热）、\n汽化（液→气，吸热）、液化（气→液，放热）、\n升华（固→气，吸热）、凝华（气→固，放热）。',
    examples: [
      { question: '冬天玻璃上出现的"窗花"属于哪种物态变化？',
        answer: '凝华',
        explanation: '水蒸气直接变成固态冰晶。' },
    ],
  },
  { subjectCode: 'PHYSICS', grade: 'G8', chapter: '光现象',
    title: '光的反射定律',
    summary: '反射光线、入射光线和法线在同一平面内；\n反射光线和入射光线分居法线两侧；\n反射角等于入射角。镜面反射 vs 漫反射。',
    examples: [
      { question: '入射角 30°，反射角是多少？',
        answer: '30°' },
    ],
  },
  { subjectCode: 'PHYSICS', grade: 'G8', chapter: '透镜及其应用',
    title: '凸透镜成像规律',
    summary: 'u > 2f：倒立缩小实像（照相机）；\nu = 2f：倒立等大实像；\nf < u < 2f：倒立放大实像（投影仪）；\nu = f：不成像；\nu < f：正立放大虚像（放大镜）。',
    examples: [
      { question: '凸透镜焦距 10 cm，物距 8 cm 时成什么像？',
        answer: '正立放大的虚像',
        explanation: 'u < f，是放大镜原理。' },
    ],
  },
  { subjectCode: 'PHYSICS', grade: 'G8', chapter: '力',
    title: '力的三要素',
    summary: '力的大小、方向、作用点称为力的三要素，都会影响力的作用效果。常用力的图示来表示。',
    examples: [
      { question: '为什么用扳手开螺帽时把柄越长越省力？',
        answer: '作用点离转轴远，相同力产生的转动效果更大。' },
    ],
  },

  // G9
  { subjectCode: 'PHYSICS', grade: 'G9', chapter: '简单机械和功',
    title: '杠杆平衡条件',
    summary: 'F₁ · L₁ = F₂ · L₂（动力 × 动力臂 = 阻力 × 阻力臂）。\n等臂杠杆：天平；省力杠杆：撬棍；费力杠杆：钓鱼竿。',
    examples: [
      { question: '动力臂 0.5 m，阻力 200 N，阻力臂 0.1 m，求动力',
        answer: '40 N',
        explanation: 'F₁ = 200 × 0.1 / 0.5 = 40 N。' },
    ],
  },
  { subjectCode: 'PHYSICS', grade: 'G9', chapter: '简单机械和功',
    title: '功与功率',
    summary: '功 W = F · s（力的方向与位移方向相同时），单位焦耳 J；\n功率 P = W / t = F · v，单位瓦特 W。',
    examples: [
      { question: '用 50 N 的力将物体匀速推动 4 m，做了多少功？',
        answer: '200 J' },
    ],
  },
  { subjectCode: 'PHYSICS', grade: 'G9', chapter: '欧姆定律',
    title: '欧姆定律 I = U / R',
    summary: '导体中的电流与电压成正比，与电阻成反比。串联电路 R = R₁ + R₂；\n并联电路 1/R = 1/R₁ + 1/R₂。',
    examples: [
      { question: '电压 6 V，电阻 3 Ω，电流多大？',
        answer: '2 A' },
    ],
  },
  { subjectCode: 'PHYSICS', grade: 'G9', chapter: '电功和电热',
    title: '电功与电功率',
    summary: '电功 W = UIt = I²Rt = U²t/R，单位 J；\n电功率 P = UI = W / t，单位 W。\n家庭电路中常用 1 kW·h = 3.6 × 10⁶ J。',
    examples: [
      { question: '一盏 220 V、100 W 的灯泡正常工作 2 小时消耗多少电能？',
        answer: '0.2 kW·h（或 720000 J）' },
    ],
  },
  { subjectCode: 'PHYSICS', grade: 'G9', chapter: '电磁转换',
    title: '电磁感应',
    summary: '闭合电路的一部分导体在磁场中做切割磁感线运动时，导体中就会产生电流——电磁感应现象。\n应用：发电机。',
    examples: [
      { question: '发电机将什么能转化为电能？',
        answer: '机械能' },
    ],
  },
];

// ============================================================
//                    化学（沪教版）
// ============================================================
const CHEMISTRY: KPInput[] = [
  { subjectCode: 'CHEMISTRY', grade: 'G9', chapter: '物质构成的奥秘',
    title: '分子、原子、离子',
    summary: '分子是保持物质化学性质的最小粒子；\n原子是化学变化中的最小粒子；\n离子是带电的原子或原子团。三者都可以构成物质。',
    examples: [
      { question: '保持水的化学性质的最小粒子是什么？',
        answer: '水分子（H₂O）' },
    ],
  },
  { subjectCode: 'CHEMISTRY', grade: 'G9', chapter: '物质构成的奥秘',
    title: '相对原子质量与化学式',
    summary: '相对原子质量 = 该原子的实际质量 / 一种碳原子质量的 1/12；\n化学式表示物质组成，下标表示原子数目，化合物中正负化合价代数和为 0。',
    examples: [
      { question: '写出二氧化碳的化学式并计算相对分子质量',
        answer: 'CO₂；44',
        explanation: '12 + 16 × 2 = 44。' },
    ],
  },
  { subjectCode: 'CHEMISTRY', grade: 'G9', chapter: '认识化学变化',
    title: '化学方程式的书写',
    summary: '步骤：写（反应物 → 生成物）、配（最小公倍数法配平）、注（条件、↑↓）、等（变 →为 =）。注意反应条件标在等号上方。',
    examples: [
      { question: '配平：H₂ + O₂ → H₂O',
        answer: '2H₂ + O₂ = 2H₂O',
        explanation: '加点燃条件。' },
    ],
  },
  { subjectCode: 'CHEMISTRY', grade: 'G9', chapter: '我们身边的物质',
    title: '氧气的性质与制取',
    summary: '物理性质：无色无味气体，不易溶于水；\n化学性质：助燃性、氧化性。\n实验室制法：2KMnO₄ →(Δ) K₂MnO₄ + MnO₂ + O₂↑（高锰酸钾分解）或 2H₂O₂ →(MnO₂) 2H₂O + O₂↑。',
    examples: [
      { question: '检验氧气常用方法是什么？',
        answer: '将带火星的木条伸入瓶中，复燃即为氧气。' },
    ],
  },
  { subjectCode: 'CHEMISTRY', grade: 'G9', chapter: '金属与矿物',
    title: '金属活动性顺序',
    summary: 'K Ca Na Mg Al Zn Fe Sn Pb (H) Cu Hg Ag Pt Au。\n①排在前面的金属能把后面的金属从其盐溶液中置换出来；\n②排在 H 前的金属能与稀盐酸 / 稀硫酸反应产生 H₂。',
    examples: [
      { question: '将铁丝放入硫酸铜溶液中，现象是什么？',
        answer: '铁丝表面出现红色物质（铜），溶液由蓝变浅绿。',
        explanation: 'Fe + CuSO₄ = FeSO₄ + Cu。' },
    ],
  },
  { subjectCode: 'CHEMISTRY', grade: 'G9', chapter: '溶解现象',
    title: '溶液与溶解度',
    summary: '溶液 = 溶质 + 溶剂；\n溶解度：一定温度下 100 g 溶剂中达到饱和状态时所溶解溶质的质量。多数固体溶解度随温度升高而增大。',
    examples: [
      { question: '20℃ 时 100 g 水中最多溶解氯化钠 36 g，氯化钠在 20℃ 的溶解度是多少？',
        answer: '36 g' },
    ],
  },
  { subjectCode: 'CHEMISTRY', grade: 'G9', chapter: '应用广泛的酸、碱、盐',
    title: '酸碱指示剂与中和反应',
    summary: '紫色石蕊：遇酸变红，遇碱变蓝；\n无色酚酞：遇酸不变色，遇碱变红。\n中和反应：酸 + 碱 → 盐 + 水，本质是 H⁺ + OH⁻ → H₂O。',
    examples: [
      { question: 'NaOH 与 HCl 反应的化学方程式',
        answer: 'NaOH + HCl = NaCl + H₂O' },
    ],
  },
  { subjectCode: 'CHEMISTRY', grade: 'G9', chapter: '应用广泛的酸、碱、盐',
    title: '常见盐及复分解反应条件',
    summary: '复分解反应：两种化合物互相交换成分生成两种新化合物。\n发生条件：生成物中有沉淀、气体或水之一。',
    examples: [
      { question: '判断 NaCl + KNO₃ 能否发生复分解反应？',
        answer: '不能',
        explanation: '没有沉淀、气体或水生成。' },
    ],
  },
];

// ============================================================
//                    生物（人教版）
// ============================================================
const BIOLOGY: KPInput[] = [
  // G7
  { subjectCode: 'BIOLOGY', grade: 'G7', chapter: '生物体的结构层次',
    title: '细胞的基本结构',
    summary: '动物细胞包括细胞膜、细胞质、细胞核；\n植物细胞还多了细胞壁、叶绿体、液泡。\n细胞核是控制中心，遗传物质 DNA 在细胞核中。',
    examples: [
      { question: '动物细胞与植物细胞最主要的三个结构差异是什么？',
        answer: '植物细胞有细胞壁、叶绿体、液泡，动物细胞没有。' },
    ],
  },
  { subjectCode: 'BIOLOGY', grade: 'G7', chapter: '生物体的结构层次',
    title: '细胞分裂、分化与生物体的层次',
    summary: '细胞分裂使数目增多，细胞分化使结构功能不同；\n人和动物体的结构层次：细胞 → 组织 → 器官 → 系统 → 生物体。',
    examples: [
      { question: '组成神经组织的细胞，是哪种细胞分化的结果？',
        answer: '神经细胞，由神经元分化而来。' },
    ],
  },
  { subjectCode: 'BIOLOGY', grade: 'G7', chapter: '生物圈中的绿色植物',
    title: '光合作用与呼吸作用',
    summary: '光合作用：CO₂ + H₂O →(光、叶绿体) 有机物 + O₂；\n呼吸作用：有机物 + O₂ → CO₂ + H₂O + 能量。\n光合作用只在含叶绿体的细胞中进行，呼吸作用在所有活细胞中进行。',
    examples: [
      { question: '夜晚卧室放过多绿植对睡眠有影响吗？为什么？',
        answer: '有影响。夜晚无光，植物只进行呼吸作用消耗 O₂，释放 CO₂。' },
    ],
  },
  { subjectCode: 'BIOLOGY', grade: 'G7', chapter: '科学探究方法',
    title: '控制变量与对照实验',
    summary: '对照实验中，只允许有一个变量不同，其余条件保持相同；\n这个不同的变量称为"自变量"，需要观察的是"因变量"。',
    examples: [
      { question: '探究"光对鼠妇分布的影响"，实验的变量是什么？',
        answer: '光照（明暗对照），其他条件如温度、湿度需保持一致。' },
    ],
  },

  // G8
  { subjectCode: 'BIOLOGY', grade: 'G8', chapter: '人体的物质和能量来源于食物',
    title: '消化系统与营养物质的吸收',
    summary: '消化系统包括消化道（口、食道、胃、小肠、大肠）和消化腺；\n小肠是营养物质吸收的主要场所，因表面积大、内表面绒毛多。',
    examples: [
      { question: '蛋白质消化的最终产物是什么？在哪里被吸收？',
        answer: '氨基酸；在小肠被吸收。' },
    ],
  },
  { subjectCode: 'BIOLOGY', grade: 'G8', chapter: '人体内的物质运输',
    title: '心脏与血液循环',
    summary: '心脏有四个腔：左心房、左心室、右心房、右心室；\n体循环：左心室 → 主动脉 → 全身 → 上下腔静脉 → 右心房；\n肺循环：右心室 → 肺动脉 → 肺 → 肺静脉 → 左心房。',
    examples: [
      { question: '肺动脉中流的是什么血？',
        answer: '静脉血。肺动脉将右心室的静脉血运到肺部进行气体交换。' },
    ],
  },
  { subjectCode: 'BIOLOGY', grade: 'G8', chapter: '人体的呼吸',
    title: '呼吸系统与气体交换',
    summary: '呼吸系统由呼吸道（鼻、咽、喉、气管、支气管）和肺组成；\n肺泡与血液之间通过扩散作用完成气体交换：O₂ 进入血液，CO₂ 排出。',
    examples: [
      { question: '为什么肺泡能高效进行气体交换？',
        answer: '肺泡数量多、壁薄（一层上皮细胞）、外面包绕大量毛细血管。' },
    ],
  },
  { subjectCode: 'BIOLOGY', grade: 'G8', chapter: '生物的遗传与变异',
    title: '基因与染色体',
    summary: 'DNA 是主要的遗传物质，DNA 上控制生物性状的小单位叫基因；\n人体细胞中有 23 对染色体（46 条），其中 1 对是性染色体（XX 或 XY）。',
    examples: [
      { question: '一对双胞胎一男一女，他们可能是同卵双胞胎吗？',
        answer: '不可能。同卵双胞胎来自同一受精卵，性染色体相同，性别一定相同。' },
    ],
  },
];

// ============================================================
//                    地理（人教版）
// ============================================================
const GEOGRAPHY: KPInput[] = [
  // G7
  { subjectCode: 'GEOGRAPHY', grade: 'G7', chapter: '地球和地球仪',
    title: '经纬网与半球划分',
    summary: '纬线：与赤道平行的圆圈，0°~90°；\n经线：连接南北两极的半圆，0°~180°。\n东西半球分界：20°W 和 160°E；南北半球分界：赤道。',
    examples: [
      { question: '某地坐标 (30°N, 120°E)，位于哪个半球？',
        answer: '北半球、东半球。',
        explanation: '30°N 在北半球；120°E 在 20°W~160°E 之间，属东半球。' },
    ],
  },
  { subjectCode: 'GEOGRAPHY', grade: 'G7', chapter: '地图',
    title: '比例尺与等高线',
    summary: '比例尺 = 图上距离 / 实地距离；比例尺越大，表示范围越小，内容越详细。\n等高线密表示坡陡，等高线疏表示坡缓；闭合等高线内部数值大为山顶，小为盆地。',
    examples: [
      { question: '比例尺 1:100000 的地图上，3cm 表示实地多少千米？',
        answer: '3 千米。',
        explanation: '3 × 100000 = 300000 cm = 3 km。' },
    ],
  },
  { subjectCode: 'GEOGRAPHY', grade: 'G7', chapter: '世界的气候',
    title: '主要气候类型与分布',
    summary: '热带：雨林（赤道附近）、草原、沙漠、季风；\n温带：地中海（30°~40°大陆西岸）、海洋性、季风、大陆性；\n寒带：苔原、冰原。',
    examples: [
      { question: '"雅典"地处地中海沿岸，气候特点是什么？',
        answer: '夏季炎热干燥，冬季温和多雨。' },
    ],
  },
  { subjectCode: 'GEOGRAPHY', grade: 'G7', chapter: '世界的居民',
    title: '人种、语言、宗教',
    summary: '三大人种：黄、白、黑；\n联合国六大工作语言：汉、英、法、俄、西、阿；\n三大宗教：基督教、伊斯兰教、佛教。',
    examples: [
      { question: '阿拉伯地区主要信仰什么宗教？说什么语言？',
        answer: '伊斯兰教；阿拉伯语。' },
    ],
  },

  // G8
  { subjectCode: 'GEOGRAPHY', grade: 'G8', chapter: '中国的疆域和行政区划',
    title: '34 个省级行政区',
    summary: '中国陆地面积约 960 万平方千米；\n34 个省级行政区：23 个省、5 个自治区、4 个直辖市、2 个特别行政区。\n首都北京。',
    examples: [
      { question: '我国领土最南端在哪个省级行政区？',
        answer: '海南省（南沙群岛的曾母暗沙）。' },
    ],
  },
  { subjectCode: 'GEOGRAPHY', grade: 'G8', chapter: '中国的自然环境',
    title: '三大阶梯地形',
    summary: '第一阶梯：青藏高原（平均海拔 4000m 以上）；\n第二阶梯：内蒙古高原、黄土高原、云贵高原、塔里木盆地等；\n第三阶梯：东北、华北、长江中下游平原。',
    examples: [
      { question: '我国地势总特征是什么？这对河流流向有何影响？',
        answer: '西高东低，呈阶梯状分布。导致大多数河流自西向东流入海洋。' },
    ],
  },
  { subjectCode: 'GEOGRAPHY', grade: 'G8', chapter: '中国的气候',
    title: '季风气候与季风区',
    summary: '冬季风：来自蒙古、西伯利亚，寒冷干燥；\n夏季风：来自太平洋（东南）和印度洋（西南），温暖湿润。\n季风区与非季风区分界线：大兴安岭—阴山—贺兰山—巴颜喀拉山—冈底斯山。',
    examples: [
      { question: '我国夏季降水的水汽主要来自何处？',
        answer: '太平洋和印度洋（夏季风带来）。' },
    ],
  },
  { subjectCode: 'GEOGRAPHY', grade: 'G8', chapter: '中国的经济发展',
    title: '农业与工业分布',
    summary: '种植业：东部季风区，南方水田为主（水稻），北方旱田为主（小麦）；\n四大工业基地：辽中南、京津唐、沪宁杭、珠三角。',
    examples: [
      { question: '京津唐工业基地的核心优势是什么？',
        answer: '丰富的煤、铁、海盐资源 + 便利的交通（铁路、海运）。' },
    ],
  },
];

// ============================================================
//                    历史（人教版/部编版）
// ============================================================
const HISTORY: KPInput[] = [
  // G7 中国古代史
  { subjectCode: 'HISTORY', grade: 'G7', chapter: '早期国家与社会变革',
    title: '西周分封制',
    summary: '目的：稳定周初的政治形势，巩固疆土。\n内容：周天子把土地和人民分给亲属、功臣，封他们为诸侯，诸侯要服从周王命令、定期朝觐、贡献财物、率兵作战。',
    examples: [
      { question: '西周分封制下，诸侯有哪些主要义务？',
        answer: '服从周王命令、定期朝觐、贡献财物、率兵作战。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G7', chapter: '统一多民族国家的建立',
    title: '秦始皇统一六国',
    summary: '公元前 221 年，秦王嬴政统一六国，建立中国第一个统一的多民族中央集权国家。\n措施：皇帝制度、郡县制、统一文字（小篆）、统一货币（圆形方孔钱）、统一度量衡、修长城。',
    examples: [
      { question: '秦始皇统一文字的字体是什么？这一措施有何意义？',
        answer: '小篆。促进了各地的文化交流，巩固了国家统一。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G7', chapter: '繁荣与开放的时代',
    title: '唐朝盛世：贞观之治与开元盛世',
    summary: '贞观之治（唐太宗）：吸取隋亡教训，虚心纳谏（魏征），完善科举制；\n开元盛世（唐玄宗）：政治清明、经济繁荣、文化昌盛。',
    examples: [
      { question: '"贞观之治"出现的根本原因是什么？',
        answer: '唐太宗吸取隋亡教训，调整统治政策，关心民生，任用贤才。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G7', chapter: '明清时期',
    title: '明清君主专制的强化',
    summary: '明太祖朱元璋：废丞相、设六部直属皇帝；设锦衣卫；\n明成祖：设东厂；\n清雍正：设军机处，标志着君主专制达到顶峰。',
    examples: [
      { question: '军机处的设立标志着什么？',
        answer: '中国封建君主专制制度达到顶峰。' },
    ],
  },

  // G8 中国近现代史
  { subjectCode: 'HISTORY', grade: 'G8', chapter: '中国开始沦为半殖民地半封建社会',
    title: '鸦片战争与《南京条约》',
    summary: '1840—1842 年第一次鸦片战争，中国战败签订《南京条约》：\n①割让香港岛；②赔款 2100 万银元；③开放广州、厦门、福州、宁波、上海五口通商；④协定关税。\n影响：中国开始沦为半殖民地半封建社会。',
    examples: [
      { question: '《南京条约》中最能反映英国发动战争目的的条款是什么？',
        answer: '开放五口通商和协定关税，便于英国打开中国市场。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G8', chapter: '近代化的早期探索',
    title: '洋务运动',
    summary: '19 世纪 60—90 年代，地主阶级洋务派"师夷长技以自强"。\n代表：曾国藩、李鸿章、左宗棠、张之洞。\n创办近代军工（江南制造总局）和民用工业（轮船招商局）。\n结果：甲午中日战争失败标志洋务运动破产。',
    examples: [
      { question: '洋务运动失败的根本原因是什么？',
        answer: '没有触动腐朽的封建制度。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G8', chapter: '中华民族的抗日战争',
    title: '抗日战争的重要事件',
    summary: '九一八事变（1931）：日本侵占东北，局部抗战开始；\n七七事变（1937）：全面抗战爆发；\n南京大屠杀（1937.12）：30 万以上同胞遇难；\n台儿庄战役、百团大战；\n1945.8.15 日本宣布无条件投降。',
    examples: [
      { question: '抗日民族统一战线初步形成的标志是什么？',
        answer: '西安事变（1936）的和平解决。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G8', chapter: '中华人民共和国的成立和巩固',
    title: '开国大典与新中国成立的意义',
    summary: '1949 年 10 月 1 日，开国大典在北京天安门举行。\n意义：①推翻了"三座大山"；②结束了百年屈辱史；③开辟了中国历史新纪元；④鼓舞了世界被压迫民族的解放斗争。',
    examples: [
      { question: '"中国人民从此站起来了"反映了新中国成立的什么意义？',
        answer: '中国人民从此成为国家的主人，结束了被压迫被剥削的历史。' },
    ],
  },

  // G9 世界史
  { subjectCode: 'HISTORY', grade: 'G9', chapter: '步入近代',
    title: '文艺复兴',
    summary: '14—17 世纪起源于意大利的思想文化运动；\n核心思想：人文主义（以人为中心，反对神学的束缚）；\n代表人物：但丁（《神曲》）、达·芬奇（《蒙娜丽莎》）、莎士比亚（《哈姆雷特》）。',
    examples: [
      { question: '文艺复兴的实质是什么？',
        answer: '资产阶级反对封建神学统治的思想解放运动。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G9', chapter: '工业革命',
    title: '第一次工业革命',
    summary: '18 世纪 60 年代—19 世纪上半叶，最先在英国发生。\n标志性发明：哈格里夫斯的珍妮纺纱机、瓦特改良蒸汽机（最重要）、史蒂芬孙的蒸汽机车。\n影响：人类进入"蒸汽时代"，确立了资本主义对世界的统治。',
    examples: [
      { question: '第一次工业革命中最重要的发明是什么？为什么？',
        answer: '瓦特改良的蒸汽机。它解决了工业发展的动力问题，使机器摆脱了自然条件的限制。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G9', chapter: '二战与冷战',
    title: '第二次世界大战的转折与结束',
    summary: '转折点：斯大林格勒保卫战（1942—1943，欧洲战场）、中途岛海战（1942，太平洋战场）。\n反法西斯同盟：1942 年《联合国家宣言》签署。\n结束：1945.5.8 德国投降；1945.9.2 日本签署投降书，二战结束。',
    examples: [
      { question: '斯大林格勒保卫战的历史意义是什么？',
        answer: '是二战中欧洲战场的转折点，扭转了苏德战场的形势。' },
    ],
  },
  { subjectCode: 'HISTORY', grade: 'G9', chapter: '二战后的世界变化',
    title: '冷战与两极格局',
    summary: '冷战开始：1947 年杜鲁门主义出台；\n经济援助：马歇尔计划；\n军事对抗：1949 年北约成立 vs 1955 年华约成立 → 两极格局形成；\n1991 年苏联解体，两极格局结束。',
    examples: [
      { question: '两极格局形成的标志是什么？',
        answer: '1955 年华沙条约组织成立，标志着以美苏为首的两大军事政治集团对峙局面正式形成。' },
    ],
  },
];

// ============================================================
//                    道德与法治（部编版）
// ============================================================
const MORALITY: KPInput[] = [
  // G7
  { subjectCode: 'MORALITY', grade: 'G7', chapter: '成长的节拍',
    title: '中学时代的特殊意义',
    summary: '中学时代是人生发展的新阶段，为未来发展奠基；\n带来新机会、新挑战，需要主动适应。',
    examples: [
      { question: '面对从小学到中学的不适应，正确做法是什么？',
        answer: '主动调整心态、学习方法，积极向老师同学求助，建立新的人际关系。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G7', chapter: '友谊的天空',
    title: '友谊的真谛',
    summary: '真正的友谊是平等的、双向的、共同成长的；\n友谊不能违背原则，不能盲目"哥们义气"。',
    examples: [
      { question: '好朋友让你帮他考试作弊，你该怎么办？',
        answer: '拒绝。真正的友谊不应建立在违背原则的基础上，应劝阻并帮助其用正确方法应对。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G7', chapter: '师长情谊',
    title: '尊师爱师与师生交往',
    summary: '尊重老师是中华民族传统美德；\n师生关系要建立在平等、信任、相互尊重的基础上，遇到矛盾应主动沟通。',
    examples: [
      { question: '老师误会了你，正确处理方式是什么？',
        answer: '主动找老师沟通澄清，礼貌地说明情况，避免对抗或赌气。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G7', chapter: '生命的思考',
    title: '生命的价值',
    summary: '生命具有独特性、不可逆性和延续性；\n每个生命都有价值，要珍爱生命、活出生命的精彩。',
    examples: [
      { question: '为什么说"生命至上"？',
        answer: '生命是不可逆的，每个生命都有不可替代的独特价值，所以一切都应以保护生命为前提。' },
    ],
  },

  // G8
  { subjectCode: 'MORALITY', grade: 'G8', chapter: '走进社会生活',
    title: '我与社会的关系',
    summary: '个人是社会的一员，人的成长离不开社会；\n人的身份是在社会关系中确立的（学生、子女、消费者等）。',
    examples: [
      { question: '"独学而无友，则孤陋而寡闻"说明了什么？',
        answer: '人的成长离不开社会，离不开与他人的交往和合作。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G8', chapter: '遵守社会规则',
    title: '法律的特征与作用',
    summary: '法律的三大特征：①由国家制定或认可；②由国家强制力保证实施；③对全体社会成员具有普遍约束力。\n作用：规范、保护。',
    examples: [
      { question: '法律与道德、校规校纪相比，最显著的区别是什么？',
        answer: '法律由国家强制力保证实施。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G8', chapter: '勇担社会责任',
    title: '责任的内涵与承担',
    summary: '责任是一个人应当做的事，或不应当做某些事；\n承担责任有代价也有回报，应主动承担、积极作为。',
    examples: [
      { question: '当个人利益与集体利益发生冲突时，应如何处理？',
        answer: '在不损害个人合法权益的前提下，自觉服从集体利益。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G8', chapter: '维护国家利益',
    title: '国家安全',
    summary: '国家安全包括政治、国土、军事、经济、文化、社会、科技、网络、生态等多领域；\n维护国家安全是每个公民的责任。',
    examples: [
      { question: '发现有人偷拍军事设施，正确做法是什么？',
        answer: '及时报警（110）或拨打国家安全机关举报受理电话 12339。' },
    ],
  },

  // G9
  { subjectCode: 'MORALITY', grade: 'G9', chapter: '富强与创新',
    title: '改革开放的伟大意义',
    summary: '1978 年党的十一届三中全会作出实行改革开放的伟大决策；\n40 多年来，使中国从"赶上时代"到"引领时代"，是当代中国最显著的特征。',
    examples: [
      { question: '改革开放是当代中国发展的什么？',
        answer: '是决定当代中国命运的关键抉择，是发展中国特色社会主义、实现中华民族伟大复兴的必由之路。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G9', chapter: '民主与法治',
    title: '全面依法治国',
    summary: '全面依法治国总目标：建设中国特色社会主义法治体系，建设社会主义法治国家。\n基本要求：科学立法、严格执法、公正司法、全民守法。',
    examples: [
      { question: '"法律面前人人平等"体现了法治的什么要求？',
        answer: '公正司法。任何组织或个人都没有超越法律的特权。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G9', chapter: '文明与家园',
    title: '中华文化与民族精神',
    summary: '中华文化源远流长、博大精深；\n中华民族精神核心：爱国主义；\n基本内涵：团结统一、爱好和平、勤劳勇敢、自强不息。',
    examples: [
      { question: '"天下兴亡，匹夫有责"体现了中华民族精神中的哪一项？',
        answer: '爱国主义。' },
    ],
  },
  { subjectCode: 'MORALITY', grade: 'G9', chapter: '和谐与梦想',
    title: '中国梦与共同富裕',
    summary: '中国梦的本质：国家富强、民族振兴、人民幸福；\n要实现共同富裕，必须坚持以人民为中心的发展思想。',
    examples: [
      { question: '实现中国梦的"两个一百年"奋斗目标是什么？',
        answer: '①建党 100 年（2021）全面建成小康社会；②建国 100 年（2049）建成富强民主文明和谐美丽的社会主义现代化强国。' },
    ],
  },
];

// ============================================================
//                    信息科技（人教版 2022 新课标）
// ============================================================
const INFOTECH: KPInput[] = [
  // G7
  { subjectCode: 'INFOTECH', grade: 'G7', chapter: '信息与信息技术',
    title: '信息的特征与信息单位',
    summary: '信息的基本特征：载体依附性、价值性、时效性、共享性。\n存储单位换算：1 字节 (B) = 8 比特 (bit)；1 KB = 1024 B；1 MB = 1024 KB；1 GB = 1024 MB。',
    examples: [
      { question: '一首 4 MB 的歌曲约等于多少 KB？',
        answer: '4096 KB（4 × 1024）。' },
    ],
  },
  { subjectCode: 'INFOTECH', grade: 'G7', chapter: '互联网与数据',
    title: 'IP 地址与域名',
    summary: 'IP 地址是互联网中每台设备的唯一标识，常见 IPv4 格式 xxx.xxx.xxx.xxx；\n域名是更便于记忆的网址形式（如 www.example.com）；\nDNS 服务器负责将域名解析成 IP 地址。',
    examples: [
      { question: '在浏览器中输入 www.baidu.com 后，能找到对应网页是因为？',
        answer: 'DNS 服务器将该域名解析成对应的 IP 地址。' },
    ],
  },
  { subjectCode: 'INFOTECH', grade: 'G7', chapter: '算法初步',
    title: '算法的概念与表示',
    summary: '算法是解决问题的清晰步骤序列；\n常见表示方法：自然语言、流程图、伪代码。\n基本特征：有穷性、确定性、可行性、输入、输出。',
    examples: [
      { question: '用算法描述"判断一个整数是否为偶数"',
        answer: '①输入整数 n；②计算 n ÷ 2 的余数 r；③若 r = 0，输出"偶数"，否则输出"奇数"。' },
    ],
  },

  // G8
  { subjectCode: 'INFOTECH', grade: 'G8', chapter: '程序设计基础',
    title: '三大基本结构',
    summary: '顺序结构：按顺序执行；\n选择结构：根据条件判断走不同分支（if-else）；\n循环结构：满足条件时重复执行（while / for）。',
    examples: [
      { question: '判断学生成绩等级（≥90 优 / ≥60 及格 / 其他不及格），应使用什么结构？',
        answer: '选择结构（多分支 if-elif-else）。' },
    ],
  },
  { subjectCode: 'INFOTECH', grade: 'G8', chapter: '数据处理',
    title: 'Excel 常用函数',
    summary: 'SUM(求和)、AVERAGE(平均值)、MAX/MIN(最值)、COUNT(计数)、IF(条件判断)。\n单元格引用：A1（相对引用）、$A$1（绝对引用）。',
    examples: [
      { question: '统计 B2:B30 中 ≥ 60 分的人数，应使用什么函数？',
        answer: 'COUNTIF(B2:B30, ">=60")。' },
    ],
  },
  { subjectCode: 'INFOTECH', grade: 'G8', chapter: '程序设计基础',
    title: '变量与赋值',
    summary: '变量是存储数据的容器，有名字和值；\n赋值符号 = 表示把右边的值赋给左边的变量；\n交换两变量值通常需引入临时变量：t = a; a = b; b = t。',
    examples: [
      { question: '执行 a=3; b=5; a=b; b=a; 后 a 和 b 的值分别是？',
        answer: 'a=5, b=5。',
        explanation: '第二步 a 已被 b 覆盖，第三步只是把 5 再赋给 b。' },
    ],
  },

  // G9
  { subjectCode: 'INFOTECH', grade: 'G9', chapter: '人工智能初步',
    title: '人工智能的基本概念',
    summary: '人工智能 (AI) 是研究让计算机模拟人类智能的学科；\n机器学习是 AI 的一个分支，让计算机从数据中"学习"规律；\n常见应用：人脸识别、语音助手、自动驾驶、推荐系统。',
    examples: [
      { question: '抖音根据你的浏览历史推荐视频，背后用了什么技术？',
        answer: '机器学习中的推荐系统。' },
    ],
  },
  { subjectCode: 'INFOTECH', grade: 'G9', chapter: '信息安全',
    title: '常见网络安全威胁与防护',
    summary: '常见威胁：计算机病毒、木马、钓鱼网站、网络诈骗、个人信息泄露。\n防护：安装杀毒软件、不点陌生链接、不在公共 WiFi 输入密码、使用强密码并定期更换。',
    examples: [
      { question: '收到"中奖了，请点击链接领取"的短信，应如何处理？',
        answer: '直接忽略或删除，不点击链接。这是典型的钓鱼诈骗。' },
    ],
  },
  { subjectCode: 'INFOTECH', grade: 'G9', chapter: '算法与数据结构',
    title: '二分查找',
    summary: '前提：数据已排序。\n步骤：每次取中间元素与目标比较，相等则找到；目标更大则在右半边继续，更小则在左半边继续。\n时间复杂度 O(log n)，比顺序查找 O(n) 快很多。',
    examples: [
      { question: '在 1024 个有序数中查找一个数，二分查找最多需要比较几次？',
        answer: '10 次。log₂(1024) = 10。' },
    ],
  },
];

// ============================================================
//          以下为首版占位学科：体育/音乐/美术/综合实践/劳动
//          内容较少，主要保证学科下拉可选，正式上线前需教师补充
// ============================================================
const PE: KPInput[] = [
  { subjectCode: 'PE', grade: 'G7', chapter: '体育与健康常识',
    title: '运动前热身的重要性',
    summary: '热身能升高体温、提高关节灵活性、调动心肺功能，降低运动损伤风险。\n常见热身：慢跑 5 分钟 + 动态拉伸（高抬腿、踢腿、扩胸）。',
    examples: [
      { question: '不热身直接进行剧烈运动，最容易出现什么问题？',
        answer: '肌肉拉伤、关节扭伤或运动中突发不适。' },
    ],
  },
  { subjectCode: 'PE', grade: 'G7', chapter: '体育与健康常识',
    title: '健康饮食与体重管理',
    summary: '均衡饮食：主食、蛋白质、蔬果合理搭配，少高糖高油食物；\nBMI = 体重(kg) / 身高²(m²)，初中生健康范围一般 18.5~24。',
    examples: [
      { question: '某同学身高 1.6 m，体重 70 kg，他的 BMI 大约是多少？是否超标？',
        answer: 'BMI ≈ 27.3，超标（超重）。' },
    ],
  },
  { subjectCode: 'PE', grade: 'G8', chapter: '体育与健康常识',
    title: '中考体育常考项目要点',
    summary: '常见项目：1000m（男）/ 800m（女）、立定跳远、引体向上 / 仰卧起坐、篮球运球。\n备考关键：循序渐进、技术动作规范、合理分配体能。',
    examples: [
      { question: '1000m 跑步中应如何分配体能？',
        answer: '前 600m 匀速跑、保留体能；最后 400m 适当提速冲刺。' },
    ],
  },
  { subjectCode: 'PE', grade: 'G9', chapter: '体育与健康常识',
    title: '运动损伤的应急处理（PRICE 原则）',
    summary: 'P (Protection 保护)、R (Rest 休息)、I (Ice 冰敷)、C (Compression 加压包扎)、E (Elevation 抬高患处)。\n24 小时内冰敷，48 小时后可热敷。',
    examples: [
      { question: '踢球时崴脚，第一时间应如何处理？',
        answer: '停止运动、坐下休息、冰敷 15-20 分钟、加压包扎并抬高患肢。' },
    ],
  },
];

const MUSIC: KPInput[] = [
  { subjectCode: 'MUSIC', grade: 'G7', chapter: '乐理基础',
    title: '简谱与五线谱基础',
    summary: '简谱用 1234567 表示 do re mi fa sol la si；\n五线谱有五条线四个间，谱号决定音名位置（高音谱号、低音谱号）。',
    examples: [
      { question: '简谱中的 "5" 对应唱名是什么？',
        answer: 'sol（嗦）。' },
    ],
  },
  { subjectCode: 'MUSIC', grade: 'G7', chapter: '中国民歌',
    title: '常见民歌风格与代表作',
    summary: '陕北信天游：高亢辽阔（《山丹丹开花红艳艳》）；\n江南小调：婉转细腻（《茉莉花》）；\n蒙古族长调：悠长舒展。',
    examples: [
      { question: '《茉莉花》代表了我国哪个地区的民歌风格？',
        answer: '江南地区，属于小调。' },
    ],
  },
  { subjectCode: 'MUSIC', grade: 'G8', chapter: '西方音乐欣赏',
    title: '古典音乐三大代表人物',
    summary: '巴赫：巴洛克时期，"音乐之父"；\n莫扎特：古典时期，神童；\n贝多芬：古典向浪漫过渡，代表作《第九交响曲》《命运》。',
    examples: [
      { question: '贝多芬的《第五交响曲》又称什么？',
        answer: '《命运交响曲》。' },
    ],
  },
  { subjectCode: 'MUSIC', grade: 'G9', chapter: '中外名曲赏析',
    title: '《义勇军进行曲》的历史与艺术价值',
    summary: '词：田汉；曲：聂耳。\n创作于 1935 年，原是电影《风云儿女》主题曲；\n1949 年被定为代国歌，2004 年正式写入宪法成为国歌。',
    examples: [
      { question: '我国国歌《义勇军进行曲》的曲作者是谁？',
        answer: '聂耳。' },
    ],
  },
];

const ART: KPInput[] = [
  { subjectCode: 'ART', grade: 'G7', chapter: '美术基础',
    title: '三原色与色彩搭配',
    summary: '美术三原色：红、黄、蓝；\n三间色：橙（红+黄）、绿（黄+蓝）、紫（蓝+红）；\n对比色搭配强烈，邻近色搭配和谐。',
    examples: [
      { question: '红色和绿色属于什么关系的颜色？',
        answer: '对比色（互补色）。' },
    ],
  },
  { subjectCode: 'ART', grade: 'G7', chapter: '中国画基础',
    title: '中国画的分类与工具',
    summary: '按题材分：人物画、山水画、花鸟画；\n按技法分：工笔（精细写实）和写意（简练抒情）；\n四大工具："文房四宝"：笔、墨、纸、砚。',
    examples: [
      { question: '齐白石的虾画风格属于工笔还是写意？',
        answer: '写意。' },
    ],
  },
  { subjectCode: 'ART', grade: 'G8', chapter: '西方美术名作',
    title: '文艺复兴三杰',
    summary: '达·芬奇：《蒙娜丽莎》《最后的晚餐》；\n米开朗基罗：《大卫》雕塑、西斯廷教堂天顶画；\n拉斐尔：《雅典学院》、众多圣母像。',
    examples: [
      { question: '《最后的晚餐》是哪位艺术家的作品？',
        answer: '达·芬奇。' },
    ],
  },
  { subjectCode: 'ART', grade: 'G9', chapter: '设计基础',
    title: '海报设计的基本原则',
    summary: '主题明确、构图简洁、色彩对比鲜明、文字层级清楚（标题 > 副标题 > 正文）。\n常用法则：黄金分割、留白、视觉中心引导。',
    examples: [
      { question: '为校运会设计海报，最关键的信息是什么？',
        answer: '比赛名称、时间、地点，需放在视觉最显眼的位置。' },
    ],
  },
];

const PRACTICE: KPInput[] = [
  { subjectCode: 'PRACTICE', grade: 'G7', chapter: '调查研究方法',
    title: '问卷调查与访谈',
    summary: '问卷调查：覆盖样本多但深度有限；\n访谈：深度好但样本少。\n设计问卷要避免引导性问题、保护受访者隐私。',
    examples: [
      { question: '"你不觉得校园食堂菜品很差吗？"这个问题为什么不合适？',
        answer: '属于引导性问题，会诱导受访者给出特定答案，违反客观调查原则。' },
    ],
  },
  { subjectCode: 'PRACTICE', grade: 'G8', chapter: '项目设计',
    title: '小组项目分工原则',
    summary: '按成员特长合理分工（如有人擅长写作、有人擅长设计、有人擅长汇报）；\n明确每人的可交付物和时间节点；\n定期同步进度。',
    examples: [
      { question: '小组项目中一名成员长期不出力，组长应如何处理？',
        answer: '先私下沟通了解原因，再调整任务难度或分工，必要时反馈给老师协调。' },
    ],
  },
  { subjectCode: 'PRACTICE', grade: 'G9', chapter: '研究性学习',
    title: '研究报告的基本结构',
    summary: '研究背景 → 研究问题 → 研究方法 → 数据与分析 → 结论与建议 → 参考文献。\n关键要求：数据真实、论证有据、结论与数据匹配。',
    examples: [
      { question: '研究报告中只有结论没有数据支撑，最大的问题是什么？',
        answer: '缺乏说服力，结论可能是主观判断而非客观规律。' },
    ],
  },
];

const LABOR: KPInput[] = [
  { subjectCode: 'LABOR', grade: 'G7', chapter: '日常生活劳动',
    title: '家务劳动的合理安排',
    summary: '常见家务：扫地、拖地、整理床铺、洗碗、洗衣服。\n合理安排：每日固定 + 周末专项，按能力分工。',
    examples: [
      { question: '初中生在家可以独立承担哪些家务？',
        answer: '整理书桌房间、洗碗、晾衣服、扫地拖地、买菜等都可以独立完成。' },
    ],
  },
  { subjectCode: 'LABOR', grade: 'G8', chapter: '生产劳动体验',
    title: '常见劳动工具的安全使用',
    summary: '使用刀具：刀刃远离自己、专人专用；\n使用电器：先断电再清理；\n使用园艺工具：佩戴手套、注意尖锐部位。',
    examples: [
      { question: '剥水果用刀时，刀刃应该朝哪个方向？',
        answer: '朝外（远离自己的方向），防止滑刀伤到手。' },
    ],
  },
  { subjectCode: 'LABOR', grade: 'G9', chapter: '职业体验与服务性劳动',
    title: '职业体验的意义',
    summary: '帮助理解不同职业的价值；\n培养劳动观念和责任感；\n为未来职业规划提供参考。',
    examples: [
      { question: '参加一次社区志愿服务后，最重要的收获应该是什么？',
        answer: '理解劳动的价值与他人的辛苦，培养责任感与同理心。' },
    ],
  },
];

const ALL_KPS: KPInput[] = [
  ...MATH, ...CHINESE, ...ENGLISH, ...PHYSICS, ...CHEMISTRY,
  ...BIOLOGY, ...GEOGRAPHY, ...HISTORY, ...MORALITY, ...INFOTECH,
  ...PE, ...MUSIC, ...ART, ...PRACTICE, ...LABOR,
];

// ============================================================
//          Demo 错题数据（仅当 --demo 时插入）
//          用于让你一登录就能看到真实使用效果，无需手动录题。
// ============================================================
type ErrorType = 'CONCEPT' | 'CALCULATION' | 'MISREAD' | 'METHOD' | 'CARELESS' | 'OTHER';
interface DemoMistake {
  subjectCode: string;
  chapterHint?: string; // 用于关联到对应的 KnowledgePoint
  originalProblem: string;
  wrongAnswer: string;
  correctAnswer: string;
  errorType: ErrorType;
  source: string;
  notes?: string;
  // 用于让复习队列显示多种状态：
  //   dueOffsetDays < 0 → 已到期可复习；> 0 → 未来到期
  dueOffsetDays: number;
  mastered?: boolean;
}

const DEMO_MISTAKES: DemoMistake[] = [
  // ---- 数学 ----
  { subjectCode: 'MATH', chapterHint: '一元二次方程',
    originalProblem: '解方程 x² - 7x + 12 = 0',
    wrongAnswer: 'x = 7 ± √(49-48)/2，无实根',
    correctAnswer: 'x₁ = 3, x₂ = 4',
    errorType: 'CALCULATION', source: '2024 苏州 G9 第一学期月考',
    notes: '判别式算错了，应该是 49-48=1，根 = (7±1)/2',
    dueOffsetDays: -1 },
  { subjectCode: 'MATH', chapterHint: '一元二次方程',
    originalProblem: '已知 x² + 2x + k = 0 有两个相等实根，求 k',
    wrongAnswer: 'k = 4',
    correctAnswer: 'k = 1',
    errorType: 'CONCEPT', source: '2024 苏州 G9 期中',
    notes: 'Δ = 0 即 b²-4ac=0，4-4k=0，k=1',
    dueOffsetDays: -2 },
  { subjectCode: 'MATH', chapterHint: '二次函数',
    originalProblem: '二次函数 y = x² - 4x + 1 的顶点坐标',
    wrongAnswer: '(2, 1)',
    correctAnswer: '(2, -3)',
    errorType: 'METHOD', source: '2024 南京 G9 第一次月考',
    notes: '配方后是 (x-2)² - 3，顶点是 (2, -3)',
    dueOffsetDays: 0 },
  { subjectCode: 'MATH', chapterHint: '圆',
    originalProblem: '⊙O 中，弧 AB 所对圆心角 100°，所对圆周角为',
    wrongAnswer: '100°',
    correctAnswer: '50°',
    errorType: 'CONCEPT', source: '苏教版练习册',
    notes: '圆周角是圆心角的一半',
    dueOffsetDays: -3 },
  { subjectCode: 'MATH', chapterHint: '勾股定理',
    originalProblem: '直角三角形两直角边 6 和 8，斜边长',
    wrongAnswer: '14',
    correctAnswer: '10',
    errorType: 'CONCEPT', source: '日常作业',
    notes: '勾股定理是 a²+b²=c² 不是 a+b=c',
    dueOffsetDays: 1 },
  { subjectCode: 'MATH', chapterHint: '一次函数',
    originalProblem: '一次函数 y = 2x - 3 与 x 轴交点坐标',
    wrongAnswer: '(0, -3)',
    correctAnswer: '(1.5, 0)',
    errorType: 'MISREAD', source: '2024 无锡 G8 期末',
    notes: '审题：是与 x 轴交点，令 y=0 而非 x=0',
    dueOffsetDays: -1, mastered: true },
  { subjectCode: 'MATH', chapterHint: '锐角三角函数',
    originalProblem: 'Rt△ABC 中 ∠C=90°, AC=3, BC=4，求 sin A',
    wrongAnswer: '3/5',
    correctAnswer: '4/5',
    errorType: 'CONCEPT', source: '2024 苏州 G9 月考',
    notes: 'sin A = 对边 / 斜边 = BC/AB = 4/5，搞反了对边邻边',
    dueOffsetDays: -4 },
  { subjectCode: 'MATH', chapterHint: '一元一次方程',
    originalProblem: '解方程 2(x-3) = 4',
    wrongAnswer: 'x = 1',
    correctAnswer: 'x = 5',
    errorType: 'CALCULATION', source: '日常作业',
    notes: '去括号忘了 2 乘 -3，应得 2x-6=4',
    dueOffsetDays: 2, mastered: true },

  // ---- 语文 ----
  { subjectCode: 'CHINESE', chapterHint: '文言文基础',
    originalProblem: '"学而时习之"中"之"的用法',
    wrongAnswer: '助词，的',
    correctAnswer: '代词，指代学过的知识',
    errorType: 'CONCEPT', source: '2024 苏州 G7 月考',
    notes: '"之"作代词时多在动词后',
    dueOffsetDays: -1 },
  { subjectCode: 'CHINESE', chapterHint: '修辞手法',
    originalProblem: '"教室里静得连一根针掉地上都能听见"用了什么修辞',
    wrongAnswer: '比喻',
    correctAnswer: '夸张',
    errorType: 'CONCEPT', source: '2024 南京 G7 期中',
    notes: '"夸张"是有意夸大或缩小，这里强调极静',
    dueOffsetDays: 0 },
  { subjectCode: 'CHINESE', chapterHint: '说明文阅读',
    originalProblem: '"长城全长 21196 千米"用了什么说明方法',
    wrongAnswer: '作比较',
    correctAnswer: '列数字',
    errorType: 'CONCEPT', source: '日常作业',
    notes: '出现精确数字基本都是"列数字"',
    dueOffsetDays: -2 },
  { subjectCode: 'CHINESE', chapterHint: '古诗词鉴赏',
    originalProblem: '"举头望明月，低头思故乡"中"月"的意象寄托什么情感',
    wrongAnswer: '团圆',
    correctAnswer: '思乡',
    errorType: 'MISREAD', source: '2024 苏州 G7 期末',
    notes: '结合下句"思故乡"即可',
    dueOffsetDays: -3, mastered: true },
  { subjectCode: 'CHINESE', chapterHint: '写作',
    originalProblem: '改写句子使描写更生动："他很生气"',
    wrongAnswer: '他非常生气',
    correctAnswer: '他攥紧拳头，脸涨得通红',
    errorType: 'METHOD', source: '日常作文',
    notes: '细节描写应包含动作、神态，不能只换程度副词',
    dueOffsetDays: 1 },

  // ---- 英语 ----
  { subjectCode: 'ENGLISH', chapterHint: '现在完成时',
    originalProblem: 'I _____ (live) here since 2018.',
    wrongAnswer: 'lived',
    correctAnswer: 'have lived',
    errorType: 'CONCEPT', source: '2024 苏州 G8 月考',
    notes: 'since 引导从过去持续到现在，用现在完成时',
    dueOffsetDays: -1 },
  { subjectCode: 'ENGLISH', chapterHint: '定语从句',
    originalProblem: 'This is the book ___ I bought yesterday.',
    wrongAnswer: 'who',
    correctAnswer: 'that / which',
    errorType: 'CONCEPT', source: '2024 南京 G9 期中',
    notes: '指物用 that/which，who 指人',
    dueOffsetDays: -2 },
  { subjectCode: 'ENGLISH', chapterHint: '状语从句（时间、条件）',
    originalProblem: 'If it _____ (rain) tomorrow, I will stay at home.',
    wrongAnswer: 'will rain',
    correctAnswer: 'rains',
    errorType: 'CONCEPT', source: '2024 苏州 G9 月考',
    notes: '主将从现：主句将来时，if 从句用一般现在时',
    dueOffsetDays: 0 },
  { subjectCode: 'ENGLISH', chapterHint: '一般过去时',
    originalProblem: 'They _____ (go) to Beijing last year.',
    wrongAnswer: 'go',
    correctAnswer: 'went',
    errorType: 'CARELESS', source: '日常作业',
    notes: 'last year 标志一般过去时，go → went',
    dueOffsetDays: -2, mastered: true },
  { subjectCode: 'ENGLISH', chapterHint: '形容词比较级和最高级',
    originalProblem: 'Tom is _____ (tall) than Jim.',
    wrongAnswer: 'more tall',
    correctAnswer: 'taller',
    errorType: 'CONCEPT', source: '2024 无锡 G8 期末',
    notes: '单音节形容词比较级加 -er，不加 more',
    dueOffsetDays: 1 },

  // ---- 物理 ----
  { subjectCode: 'PHYSICS', chapterHint: '欧姆定律',
    originalProblem: '电压 6V，电阻 3Ω，电流多大',
    wrongAnswer: '18 A',
    correctAnswer: '2 A',
    errorType: 'CONCEPT', source: '2024 苏州 G9 月考',
    notes: '欧姆定律 I=U/R 是除法，不是乘法',
    dueOffsetDays: -1 },
  { subjectCode: 'PHYSICS', chapterHint: '物态变化',
    originalProblem: '冬天玻璃上"窗花"是什么物态变化',
    wrongAnswer: '凝固',
    correctAnswer: '凝华',
    errorType: 'CONCEPT', source: '2024 南京 G8 期末',
    notes: '气态水蒸气直接变固态冰晶 → 凝华',
    dueOffsetDays: 0 },
  { subjectCode: 'PHYSICS', chapterHint: '凸透镜成像规律',
    originalProblem: '凸透镜焦距 10cm，物距 8cm 时成什么像',
    wrongAnswer: '倒立缩小实像',
    correctAnswer: '正立放大虚像',
    errorType: 'CONCEPT', source: '2024 苏州 G8 期中',
    notes: 'u<f 时是放大镜，正立放大虚像',
    dueOffsetDays: -3 },
  { subjectCode: 'PHYSICS', chapterHint: '简单机械和功',
    originalProblem: '用 50N 的力将物体匀速推动 4m，做了多少功',
    wrongAnswer: '54 J',
    correctAnswer: '200 J',
    errorType: 'METHOD', source: '日常作业',
    notes: 'W = F × s = 50 × 4 = 200J，不是加法',
    dueOffsetDays: 2 },

  // ---- 化学 ----
  { subjectCode: 'CHEMISTRY', chapterHint: '认识化学变化',
    originalProblem: '配平：H₂ + O₂ → H₂O',
    wrongAnswer: 'H₂ + O₂ = H₂O',
    correctAnswer: '2H₂ + O₂ = 2H₂O',
    errorType: 'METHOD', source: '2024 南京 G9 第一学期月考',
    notes: '反应前后原子数必须相等，O 需 2 个所以 H₂O 系数为 2',
    dueOffsetDays: -1 },
  { subjectCode: 'CHEMISTRY', chapterHint: '金属与矿物',
    originalProblem: '铁丝放入硫酸铜溶液中，现象是？',
    wrongAnswer: '铁丝变黑，溶液无变化',
    correctAnswer: '铁丝表面有红色物质，溶液由蓝变浅绿',
    errorType: 'CONCEPT', source: '2024 苏州 G9 期中',
    notes: 'Fe + CuSO₄ = FeSO₄ + Cu，置换出红色铜',
    dueOffsetDays: 0 },
  { subjectCode: 'CHEMISTRY', chapterHint: '物质构成的奥秘',
    originalProblem: '写出二氧化碳的化学式并计算相对分子质量',
    wrongAnswer: 'CO₂；28',
    correctAnswer: 'CO₂；44',
    errorType: 'CALCULATION', source: '日常作业',
    notes: '12 + 16×2 = 44，不是 12+16',
    dueOffsetDays: -2 },

  // ---- 生物 ----
  { subjectCode: 'BIOLOGY', chapterHint: '人体内的物质运输',
    originalProblem: '肺动脉中流的是什么血',
    wrongAnswer: '动脉血',
    correctAnswer: '静脉血',
    errorType: 'CONCEPT', source: '2024 苏州 G8 月考',
    notes: '动脉/静脉是看血流方向，肺动脉运的是去肺部交换的静脉血',
    dueOffsetDays: -1 },
  { subjectCode: 'BIOLOGY', chapterHint: '生物圈中的绿色植物',
    originalProblem: '夜晚卧室放过多绿植对睡眠有影响吗？为什么？',
    wrongAnswer: '没影响，植物释放氧气',
    correctAnswer: '有影响。夜晚无光，植物呼吸作用消耗 O₂，释放 CO₂',
    errorType: 'CONCEPT', source: '2024 南京 G7 期末',
    dueOffsetDays: 1 },

  // ---- 历史 ----
  { subjectCode: 'HISTORY', chapterHint: '中国开始沦为半殖民地半封建社会',
    originalProblem: '《南京条约》中最能反映英国发动战争目的的条款',
    wrongAnswer: '割让香港岛',
    correctAnswer: '开放五口通商和协定关税',
    errorType: 'CONCEPT', source: '2024 苏州 G8 月考',
    notes: '战争目的是打开市场，经济条款最能反映',
    dueOffsetDays: -1 },

  // ---- 地理 ----
  { subjectCode: 'GEOGRAPHY', chapterHint: '地球和地球仪',
    originalProblem: '某地坐标 (30°N, 120°E)，位于哪个半球',
    wrongAnswer: '北半球、西半球',
    correctAnswer: '北半球、东半球',
    errorType: 'CONCEPT', source: '2024 苏州 G7 期中',
    notes: '东西半球分界是 20°W 和 160°E，120°E 在东半球',
    dueOffsetDays: 0 },

  // ---- 道德与法治 ----
  { subjectCode: 'MORALITY', chapterHint: '遵守社会规则',
    originalProblem: '法律与道德、校规相比，最显著的区别是什么',
    wrongAnswer: '法律内容更全面',
    correctAnswer: '法律由国家强制力保证实施',
    errorType: 'CONCEPT', source: '2024 南京 G8 期末',
    notes: '法律三大特征，强制性是与其他规范的本质区别',
    dueOffsetDays: -2 },
];

async function main() {
  const isDemo = process.argv.includes('--demo');

  // 1. upsert subjects
  for (const s of SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: { name: s.name },
      create: s,
    });
  }
  const subjects = await prisma.subject.findMany();
  const codeToId = Object.fromEntries(subjects.map((s) => [s.code, s.id]));

  // 2. wipe existing knowledge points so re-running is idempotent
  await prisma.knowledgePoint.deleteMany();

  // 3. create knowledge points
  let lastKey = '';
  let order = 0;
  for (const kp of ALL_KPS) {
    const subjectId = codeToId[kp.subjectCode];
    if (!subjectId) {
      console.warn(`[skip] unknown subject ${kp.subjectCode}`);
      continue;
    }
    const key = `${kp.subjectCode}-${kp.grade}-${kp.chapter}`;
    if (key !== lastKey) {
      lastKey = key;
      order = 0;
    }
    order += 1;
    await prisma.knowledgePoint.create({
      data: {
        subjectId,
        grade: kp.grade,
        chapter: kp.chapter,
        title: kp.title,
        summary: kp.summary,
        examples: JSON.stringify(kp.examples),
        order,
      },
    });
  }

  // 4. demo data
  if (isDemo) {
    const demoPhone = '13800138000';
    const demoPasswordHash = await bcrypt.hash('demo1234', 10);

    const demoUser = await prisma.user.upsert({
      where: { phone: demoPhone },
      update: { name: '演示同学', grade: 'G9', passwordHash: demoPasswordHash },
      create: {
        phone: demoPhone,
        passwordHash: demoPasswordHash,
        name: '演示同学',
        grade: 'G9',
      },
    });

    // wipe demo user's existing mistakes (idempotent re-run)
    await prisma.mistake.deleteMany({ where: { userId: demoUser.id } });

    const now = new Date();
    let demoCount = 0;
    for (const m of DEMO_MISTAKES) {
      const subjectId = codeToId[m.subjectCode];
      if (!subjectId) continue;

      // 尝试关联到 chapterHint 对应的 KnowledgePoint
      let knowledgePointId: string | null = null;
      if (m.chapterHint) {
        const kp = await prisma.knowledgePoint.findFirst({
          where: { subjectId, chapter: m.chapterHint },
        });
        knowledgePointId = kp?.id || null;
      }

      const nextReviewAt = new Date(now);
      nextReviewAt.setDate(nextReviewAt.getDate() + m.dueOffsetDays);

      await prisma.mistake.create({
        data: {
          userId: demoUser.id,
          subjectId,
          knowledgePointId,
          originalProblem: m.originalProblem,
          wrongAnswer: m.wrongAnswer,
          correctAnswer: m.correctAnswer,
          errorType: m.errorType,
          source: m.source,
          notes: m.notes || null,
          status: m.mastered ? 'MASTERED' : 'ACTIVE',
          // 已掌握的设较大间隔，未掌握的较小
          intervalDays: m.mastered ? 30 : Math.max(1, Math.abs(m.dueOffsetDays)),
          repetitions: m.mastered ? 3 : (m.dueOffsetDays < -2 ? 1 : 0),
          easeFactor: 2.5,
          nextReviewAt,
        },
      });
      demoCount += 1;
    }

    console.log(`\n[demo] 已创建演示账号：手机号 ${demoPhone} / 密码 demo1234`);
    console.log(`[demo] 已为演示账号创建 ${demoCount} 道示例错题。`);
  }

  // 5. summary
  const counts = await prisma.knowledgePoint.groupBy({
    by: ['subjectId', 'grade'],
    _count: { _all: true },
  });
  const codeOf = Object.fromEntries(subjects.map((s) => [s.id, s.code]));
  console.log('\nSeed summary:');
  for (const c of counts) {
    console.log(`  ${codeOf[c.subjectId]} / ${c.grade}: ${c._count._all} KPs`);
  }
  console.log(`Total: ${ALL_KPS.length} KPs across ${subjects.length} subjects.`);
  if (!isDemo) {
    console.log('\nTip: 加 -- --demo 可一键创建演示账号 + 30 道示例错题。');
    console.log('     例如：npm run seed -- --demo');
  }
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
