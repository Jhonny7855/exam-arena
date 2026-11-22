import type { Family } from './build'
import { num, pickWrongs } from './build'
import { pick, randInt, type Rng } from '../../lib/rng'
import { allStrings } from '../../lib/automata'

const ALPH = ['a', 'b']

function pickString(rng: Rng, maxLen: number): string {
  const pool = allStrings(ALPH, maxLen)
  return pick(rng, pool)
}

export const unit2Families: Family[] = [
  {
    id: 'u2-string-count',
    unit: 2,
    topic: 'Alphabet, strings and languages',
    subtopic: 'Counting strings of a length',
    difficulty: 'Easy',
    type: 'Application',
    count: 26,
    seconds: 40,
    tags: ['strings', 'counting'],
    gen: (rng) => {
      const k = randInt(rng, 2, 3)
      const n = randInt(rng, 2, 6)
      const alph = ALPH.slice(0, k)
      const total = Math.pow(k, n)
      const pool: [string, string][] = [
        [`${num(total - 1)}`, `Subtracting 1 would exclude one particular string, but the question asks for all strings of length ${n}, with no exclusion.`],
        [`${num(n * k)}`, `${n} × ${k} multiplies length by alphabet size; each position independently has ${k} choices, so the count is exponential.`],
        [`${num(k + n)}`, `Addition counts neither positions nor choices correctly.`],
        [`${num(Math.pow(n, k))}`, `${n}^${k} reverses the roles: it would count length-${k} strings over an alphabet of ${n} symbols.`],
        [`${num(total + 1)}`, `This adds one string beyond the ${num(total)} available; every length-${n} string is already counted once.`],
        [`${num(k * n + 1)}`, `Multiplying then adding one mixes two different rules and matches neither the product rule nor a boundary case.`],
        [`${num(total - k)}`, `This removes ${k} strings arbitrarily; no strings are excluded from the set of length-${n} strings.`],
        [`${num(Math.pow(k, n + 1))}`, `2 to the power ${n + 1} counts strings of length ${n + 1} as well, one length too many.`],
      ]
      return {
        prompt: `Let Σ = {${alph.join(', ')}}. How many distinct strings of length exactly ${n} exist over Σ?`,
        correct: `${num(total)}`,
        wrong: pickWrongs(`${num(total)}`, pool, rng, 3),
        explanation: `Each of the ${n} positions independently holds one of ${k} symbols, so there are ${k}^${n} = ${num(total)} strings. This is the product rule applied position by position.`,
        hint: 'Multiply the number of choices per position.',
        correctWhy: `Correct: ${k}^${n} = ${num(total)}.`,
      }
    },
  },
  {
    id: 'u2-total-strings',
    unit: 2,
    topic: 'Alphabet, strings and languages',
    subtopic: 'Length up to n',
    difficulty: 'Medium',
    type: 'Computation',
    count: 22,
    seconds: 55,
    tags: ['strings', 'sigma star'],
    gen: (rng) => {
      const n = randInt(rng, 2, 5)
      const total = Math.pow(2, n + 1) - 1
      return {
        prompt: `Over Σ = {a, b}, how many strings have length at most ${n} (including the empty string)?`,
        correct: `${num(total)}`,
        wrong: [
          [`${num(Math.pow(2, n))}`, `2^${n} = ${num(Math.pow(2, n))} counts only strings of length exactly ${n}, excluding all shorter strings.`],
          [`${num(Math.pow(2, n + 1))}`, `2^(${n}+1) = ${num(Math.pow(2, n + 1))} counts lengths 0 through ${n + 1}, one length too many.`],
          [`${num(Math.pow(2, n) - 1)}`, `This excludes the empty string, but ε has length 0 ≤ ${n} and must be counted.`],
          [`${num(n * 2)}`, `Multiplying length bound by alphabet size ignores the exponential growth per position.`],
        ],
        explanation: `Sum the counts for each length: Σ_{i=0}^{${n}} 2^i = 2^(${n}+1) − 1 = ${num(total)}. This geometric series includes the empty string as the i = 0 term.`,
        hint: 'Sum 2^i for i from 0 to n.',
        correctWhy: `Correct: Σ_{i=0}^{${n}} 2^i = ${num(total)}.`,
      }
    },
  },
  {
    id: 'u2-epsilon-vs-empty',
    unit: 2,
    topic: 'Alphabet, strings and languages',
    subtopic: 'Empty string versus empty language',
    difficulty: 'Easy',
    type: 'Conceptual',
    count: 20,
    seconds: 40,
    tags: ['strings', 'epsilon'],
    gen: (rng) => {
      const pairs: [string, string, string, string][] = [
        ['{ε}', '∅', 'The set {ε} contains exactly one string (the empty string), while ∅ contains no strings at all. Their cardinalities are 1 and 0.', 'ε is a string of length 0, not a language; a language is a set of strings.'],
        ['ε', '∅', 'ε is a single string of length zero, whereas ∅ is the empty language, a set with no members. They live in different universes.', 'Writing ε where a language is expected conflates a string with a set of strings.'],
        ['Σ*', 'Σ+', 'Σ* includes ε because it is the union over all i ≥ 0, while Σ+ starts at i = 1 and omits ε.', 'Σ* and Σ+ differ by exactly one string.'],
        ['L*', 'L+', 'L* = {ε} ∪ L+ by definition, so the star always includes the empty string even when ε ∉ L.', 'Only if ε ∈ L do L* and L+ coincide.'],
      ]
      const [a, b, why, extra] = pick(rng, pairs)
      const correct = a
      const wrongs: [string, string][] = [
        [b, `This is not equal to ${a}. ${why}`],
        [`{${a}}`, `Wrapping ${a} in braces changes its type or adds a level of nesting, so it is not the same object.`],
        ['They are always equal', `${why}`],
      ]
      return {
        prompt: `Which of the following is correct regarding ${a} and ${b}?`,
        correct: `${a} and ${b} are different objects: ${a} is ${a === 'ε' ? 'a string' : 'a language'}, ${b} is ${b === '∅' ? 'the empty language' : 'a language'}.`,
        wrong: wrongs.map(([t, w]) => [t, w] as [string, string]),
        explanation: `${why} ${extra}`,
        hint: 'Distinguish a string (length 0) from a set of strings (possibly empty).',
        correctWhy: `Correct: ${why}`,
      }
    },
  },
  {
    id: 'u2-concat-reverse',
    unit: 2,
    topic: 'String operations',
    subtopic: 'Reversal of concatenation',
    difficulty: 'Medium',
    type: 'Application',
    count: 24,
    seconds: 55,
    tags: ['strings', 'reversal', 'concatenation'],
    gen: (rng) => {
      const x = pickString(rng, 3) || 'a'
      const y = pickString(rng, 3) || 'b'
      const xy = x + y
      const rev = [...xy].reverse().join('')
      const revX = [...x].reverse().join('')
      const revY = [...y].reverse().join('')
      const pool: [string, string][] = [
        [`"${revX + revY}"`, `"${revX}${revY}" reverses x and y separately but keeps their order. The identity is (xy)ᴿ = yᴿxᴿ, which also swaps the order.`],
        [`"${xy}"`, `"${xy}" is xy itself; reversal changes the string unless it happens to be a palindrome.`],
        [`"${revY + x}"`, `This reverses only y and leaves x unreversed, which is not the reversal of the concatenation.`],
        [`"${y + x}"`, `This swaps the two blocks without reversing either one. (xy)ᴿ requires reversing each block as well.`],
        [`"${revX + x}"`, `This concatenates a reversed copy of x with x itself, so it doubles the length instead of reversing xy.`],
        [`"${revY + revX + 'a'}"`, `This appends an extra symbol that does not appear in xy, so the length is wrong.`],
        [`"ε"`, `ε is the empty string; reversing xy preserves its length of ${xy.length}.`],
        [`"${rev.slice(0, -1)}"`, `This drops the last symbol of the reversal, so it is one symbol too short.`],
        [`"${revY}"`, `This is only the reversal of y, dropping the reversed x entirely.`],
        [`"${rev + rev}"`, `This concatenates the reversal with itself, doubling the length of xy.`],
      ]
      return {
        prompt: `Let x = "${x}" and y = "${y}". What is (xy)ᴿ?`,
        correct: `"${rev}"`,
        wrong: pickWrongs(`"${rev}"`, pool, rng, 3),
        explanation: `(xy)ᴿ = yᴿxᴿ: reverse each part and swap their order. With x = "${x}" and y = "${y}", xy = "${xy}", so (xy)ᴿ = "${rev}".`,
        hint: 'Reverse the parts and swap their order.',
        correctWhy: `Correct: (xy)ᴿ = yᴿxᴿ = "${rev}".`,
      }
    },
  },
  {
    id: 'u2-regex-membership',
    unit: 2,
    topic: 'Regular expressions',
    subtopic: 'Membership in a regular language',
    difficulty: 'Medium',
    type: 'Analysis',
    count: 34,
    seconds: 70,
    tags: ['regex', 'membership'],
    gen: (rng) => {
      const specs: { re: string; test: (s: string) => boolean; why: string }[] = [
        {
          re: '(a ∪ b)*ab',
          test: (s) => s.endsWith('ab'),
          why: 'The expression (a ∪ b)*ab requires the string to end with the literal suffix ab, with anything before it.',
        },
        {
          re: '(a ∪ b)*aa(a ∪ b)*',
          test: (s) => s.includes('aa'),
          why: 'The expression requires the substring aa somewhere in the middle, with arbitrary strings on both sides.',
        },
        {
          re: 'b*(ab*)*',
          test: (s) => true,
          why: 'Over {a,b}, b*(ab*)* generates every string: it allows any arrangement of blocks of b separated by single a symbols.',
        },
        {
          re: '(ab)*',
          test: (s) => s.length % 2 === 0 && [...s].every((c, i) => c === (i % 2 === 0 ? 'a' : 'b')),
          why: '(ab)* generates ε, ab, abab, ababab, so every member is a repetition of the block ab.',
        },
        {
          re: 'a*b*',
          test: (s) => !/ba/.test(s),
          why: 'a*b* requires all a symbols to precede all b symbols, so any occurrence of ba violates the pattern.',
        },
        {
          re: '(a ∪ b)*b(a ∪ b)(a ∪ b)',
          test: (s) => s.length >= 3 && s[s.length - 3] === 'b',
          why: 'The expression fixes b at the third position from the end, with exactly two symbols after it.',
        },
      ]
      const spec = pick(rng, specs)
      const candidates = allStrings(ALPH, 4).filter((s) => s.length > 0)
      const members = candidates.filter(spec.test)
      const nonMembers = candidates.filter((s) => !spec.test(s))
      const askMember = rng() < 0.5 && members.length > 0
      const target = askMember ? pick(rng, members) : pick(rng, nonMembers.length ? nonMembers : candidates)
      const isMember = spec.test(target)
      return {
        prompt: `Consider the regular expression r = ${spec.re} over Σ = {a, b}. Is the string "${target}" in L(r)?`,
        correct: isMember ? 'Yes, the string belongs to L(r).' : 'No, the string does not belong to L(r).',
        wrong: [
          [
            isMember ? 'No, the string does not belong to L(r).' : 'Yes, the string belongs to L(r).',
            isMember
              ? `This is the wrong verdict. ${spec.why} The string "${target}" satisfies that pattern, so it is accepted.`
              : `This is the wrong verdict. ${spec.why} The string "${target}" violates that pattern, so it is rejected.`,
          ],
          ['The expression is not a valid regular expression.', 'The expression uses only union, concatenation, and star on alphabet symbols, which is a valid regular expression.'],
          ['Membership cannot be determined without a DFA.', 'Regular expressions have direct semantics; a DFA is one equivalent representation but is not required to decide membership.'],
        ],
        explanation: `${spec.why} Applying that test to "${target}" gives the verdict: ${isMember ? 'accepted' : 'rejected'}.`,
        hint: 'Translate the expression into a plain-language condition, then test the string against it.',
        correctWhy: `Correct: ${spec.why} "${target}" therefore ${isMember ? 'belongs to' : 'does not belong to'} L(r).`,
      }
    },
  },
  {
    id: 'u2-regex-construct',
    unit: 2,
    topic: 'Regular expression construction',
    subtopic: 'Describing a language',
    difficulty: 'Medium',
    type: 'Design',
    count: 30,
    seconds: 75,
    tags: ['regex', 'construction'],
    gen: (rng) => {
      const specs: { desc: string; re: string; wrongs: [string, string][] }[] = [
        {
          desc: 'all strings over {a, b} that end in ab',
          re: '(a ∪ b)*ab',
          wrongs: [
            ['ab(a ∪ b)*', 'This requires the string to start with ab, not end with it.'],
            ['(a ∪ b)*a(a ∪ b)*b', 'This only requires an a before a later b somewhere, not the final two symbols to be ab.'],
            ['(ab)*', 'This generates only repetitions of the block ab, which is far more restrictive than "ends in ab".'],
          ],
        },
        {
          desc: 'all strings over {a, b} containing the substring aa',
          re: '(a ∪ b)*aa(a ∪ b)*',
          wrongs: [
            ['(aa)*', 'This generates only even-length strings made purely of a symbols, not all strings containing aa.'],
            ['a*a*', 'This is equivalent to a*, which excludes every string containing b.'],
            ['(a ∪ b)*a(a ∪ b)*a', 'This requires the string to end in a and have two a symbols, which is neither necessary nor sufficient for containing aa.'],
          ],
        },
        {
          desc: 'all strings over {a, b} with an even number of a symbols',
          re: '(b*ab*ab*)*b*',
          wrongs: [
            ['(aa)*', 'This allows only strings of pure a symbols with even length, excluding all b symbols.'],
            ['(ab)*', 'This forces alternating a and b starting with a, which is much stronger than an even count of a.'],
            ['(a ∪ b)*aa(a ∪ b)*', 'This requires aa as a substring, which is unrelated to counting parity of a.'],
          ],
        },
        {
          desc: 'all strings over {a, b} that start with a and end with b',
          re: 'a(a ∪ b)*b',
          wrongs: [
            ['(a ∪ b)*ab', 'This requires ending in ab, which is stronger than starting with a and ending with b — it forces the second-to-last symbol to be a.'],
            ['ab(a ∪ b)*', 'This requires starting with ab, which forces the second symbol to be b. Strings such as aab are wrongly excluded.'],
            ['a*b*', 'This allows only a block of a followed by a block of b, excluding strings like aba.'],
          ],
        },
        {
          desc: 'all strings over {a, b} of length exactly 3',
          re: '(a ∪ b)(a ∪ b)(a ∪ b)',
          wrongs: [
            ['(a ∪ b)*', 'This generates strings of every length, not only length 3.'],
            ['(a ∪ b)(a ∪ b)', 'This generates strings of length exactly 2.'],
            ['(aaa ∪ bbb)', 'This generates only two specific strings, aaa and bbb.'],
          ],
        },
      ]
      const spec = pick(rng, specs)
      return {
        prompt: `Which regular expression describes ${spec.desc}?`,
        correct: spec.re,
        wrong: spec.wrongs,
        explanation: `The language is ${spec.desc}, and ${spec.re} generates exactly that set. The competing expressions impose a different anchor (prefix versus suffix), a different count, or a different length, so each describes a different language.`,
        hint: 'Identify whether the constraint is positional (start/end), counting, or a required substring.',
        correctWhy: `Correct: ${spec.re} matches exactly ${spec.desc}.`,
      }
    },
  },
  {
    id: 'u2-regex-equivalence',
    unit: 2,
    topic: 'Regular expressions',
    subtopic: 'Language equivalence',
    difficulty: 'Hard',
    type: 'Analysis',
    count: 24,
    seconds: 85,
    tags: ['regex', 'equivalence'],
    gen: (rng) => {
      const pairs: { a: string; b: string; same: boolean; why: string }[] = [
        { a: '(a*b*)*', b: '(a ∪ b)*', same: true, why: '(a*b*)* generates every string over {a,b}: any string splits into maximal runs that each match a*b*, and the star repeats the pattern.' },
        { a: '∅*', b: 'ε', same: true, why: '∅* = ∪_{i≥0} ∅^i, and ∅^0 = {ε}, while every higher power is empty, so ∅* = {ε}.' },
        { a: '(a ∪ b)*', b: 'a* ∪ b*', same: false, why: 'a* ∪ b* contains only strings that are all a or all b, so it excludes ab. The left side contains ab.' },
        { a: '(ab)*', b: 'a*b*', same: false, why: '(ab)* requires strict alternation starting with a, while a*b* allows any number of a then any number of b, including aa and bb.' },
        { a: '(a ∪ b)*ab', b: '(a ∪ b)*a(a ∪ b)*b', same: false, why: 'The left side requires the final two symbols to be ab; the right side only requires an a before a later b, so it accepts aba.' },
        { a: '(a*b)*', b: '(a ∪ b)*', same: true, why: '(a*b)* allows blocks of a followed by one b, repeated; concatenating such blocks can produce any string over {a,b}.' },
      ]
      const p = pick(rng, pairs)
      const labels = p.same
        ? ['They are equivalent — both denote the same language.', 'They are not equivalent — one contains a string the other does not.']
        : ['They are not equivalent — one contains a string the other does not.', 'They are equivalent — both denote the same language.']
      return {
        prompt: `Are the regular expressions ${p.a} and ${p.b} equivalent over Σ = {a, b}?`,
        correct: labels[0],
        wrong: [
          [labels[1], `This is the wrong verdict. ${p.why}`],
          ['Equivalence is undecidable for regular expressions.', 'Equivalence of regular expressions is decidable: convert both to DFAs, minimise, and compare the minimal automata up to isomorphism.'],
          ['They are equivalent only if ε is in both languages.', 'Equivalence is about the whole language, not just membership of ε. Two expressions can agree on ε and still differ on longer strings.'],
        ],
        explanation: `${p.why}`,
        hint: 'Convert both to automata and look for a distinguishing string, or reason structurally about the generated sets.',
        correctWhy: `Correct: ${p.same ? 'equivalent' : 'not equivalent'}. ${p.why}`,
      }
    },
  },
  {
    id: 'u2-pumping-choice',
    unit: 2,
    topic: 'Pumping lemma for regular languages',
    subtopic: 'Applying the pumping lemma',
    difficulty: 'Hard',
    type: 'Proof',
    count: 28,
    seconds: 95,
    tags: ['pumping lemma', 'non-regular'],
    gen: (rng) => {
      const cases: { L: string; pump: string; why: string; notRegular: boolean }[] = [
        {
          L: 'L = {aⁿbⁿ : n ≥ 0}',
          pump: 'y = aᵏ for some k ≥ 1, so xy⁰z = a^(p−k)b^p ∉ L',
          why: 'Since |xy| ≤ p, the pumped segment y lies entirely inside the initial block of a symbols. Removing it leaves unequal counts, so pumping down produces a string outside L.',
          notRegular: true,
        },
        {
          L: 'L = {w ∈ {a,b}* : w has equal numbers of a and b}',
          pump: 'y = aᵏ, so xy⁰z has fewer a than b',
          why: 'For a string a^p b^p in L, the pumped part lies in the leading a block, so pumping down breaks the equality of counts.',
          notRegular: true,
        },
        {
          L: 'L = {a^(2ⁿ) : n ≥ 0}',
          pump: 'y = aᵏ, so xy²z has length 2^m + k, which is not a power of 2',
          why: 'Lengths in L grow geometrically, but pumping changes the length by a fixed k, so for large m the new length falls strictly between consecutive powers of 2.',
          notRegular: true,
        },
        {
          L: 'L = {w : w contains an even number of a and an even number of b}',
          pump: 'No contradiction: L is regular, so the lemma holds',
          why: 'This language is recognised by a 4-state DFA tracking the parity of a and of b, so it is regular and the pumping lemma is satisfied rather than violated.',
          notRegular: false,
        },
      ]
      const c = pick(rng, cases)
      const candidates: [string, string][] = c.notRegular
        ? [
            [c.pump, `This is the correct pumping argument: ${c.why}`],
            ['y can be chosen anywhere in w, so the argument fails', 'The lemma lets you choose w but requires the argument to work for every valid decomposition. Restricting y to a known region is exactly how the proof proceeds.'],
            ['The lemma proves regularity, so it cannot be used here', 'The pumping lemma is a necessary condition: violating it proves non-regularity, which is precisely its use.'],
            ['The language is regular because a DFA can count to p', `A DFA has a fixed number of states, so it cannot count an unbounded number of symbols. ${c.why}`],
            ['The language is regular because it has a simple description', 'A short description does not imply regularity; the pumping lemma exposes the unbounded memory requirement.'],
          ]
        : [
            ['No contradiction arises because the language is regular', `This is correct: ${c.why}`],
            ['Pumping down always yields a string outside L', 'That would only hold if L were non-regular. Here every pumped string stays in L because parity is preserved by inserting a segment with even counts.'],
            ['The pumping length p does not exist for this language', 'Every regular language has a pumping length, namely the number of states in its minimal DFA.'],
            ['The lemma proves the language is not regular', `This is the wrong verdict: the language is regular, so the lemma holds rather than being violated. ${c.why}`],
            ['A finite automaton cannot recognise this language', `A small DFA does recognise it, which is exactly why it is regular. ${c.why}`],
          ]
      const correct = c.notRegular ? c.pump : candidates[0][0]
      const seenOpts = new Set([correct])
      const wrong: [string, string][] = []
      for (const [text, why] of candidates) {
        if (wrong.length >= 3) break
        if (seenOpts.has(text)) continue
        seenOpts.add(text)
        wrong.push([text, why])
      }
      return {
        prompt: `Applying the pumping lemma to ${c.L}, which statement is correct?`,
        correct,
        wrong,
        explanation: `${c.why}${c.notRegular ? ' Therefore L is not regular.' : ''}`,
        hint: 'Check whether the pumped segment can be confined to one region, and whether the resulting strings stay in L.',
        correctWhy: `Correct: ${c.why}`,
      }
    },
  },
  {
    id: 'u2-regularity-decide',
    unit: 2,
    topic: 'Closure and regularity decisions',
    subtopic: 'Deciding regularity',
    difficulty: 'Medium',
    type: 'Analysis',
    count: 26,
    seconds: 65,
    tags: ['regularity', 'closure'],
    gen: (rng) => {
      const cases: { L: string; regular: boolean; why: string }[] = [
        { L: '{w ∈ {a,b}* : w ends with aba}', regular: true, why: 'A DFA only needs to remember the last three symbols, so 2³ = 8 memory states suffice.' },
        { L: '{aⁿbⁿ : n ≥ 0}', regular: false, why: 'Matching an unbounded count of a against b needs unbounded memory, which no finite automaton has.' },
        { L: '{w ∈ {a,b}* : |w| is divisible by 3}', regular: true, why: 'A 3-state DFA tracking length modulo 3 recognises it.' },
        { L: '{aⁿ : n is prime}', regular: false, why: 'Primality of an arbitrary length cannot be tracked with finitely many states; the pumping lemma gives a contradiction.' },
        { L: 'the set of all finite languages over {a,b}', regular: true, why: 'Every finite language is regular: build an acyclic automaton whose paths spell the finitely many strings.' },
        { L: '{ww : w ∈ {a,b}* }', regular: false, why: 'The second half must exactly mirror the first, requiring unbounded memory, so the language is not regular.' },
        { L: '{w : w contains at least two a symbols}', regular: true, why: 'A 3-state DFA counting a symbols up to 2 suffices.' },
        { L: '{aᵖ : p is prime}', regular: false, why: 'The prime-length constraint is not finitely trackable; the pumping lemma shows a contradiction for large primes.' },
      ]
      const c = pick(rng, cases)
      return {
        prompt: `Is the language ${c.L} regular?`,
        correct: c.regular ? 'Yes, it is regular.' : 'No, it is not regular.',
        wrong: [
          [
            c.regular ? 'No, it is not regular.' : 'Yes, it is regular.',
            `This is the wrong verdict. ${c.why}`,
          ],
          ['It is regular but has no regular expression.', 'Kleene\'s theorem states that a language is regular exactly when some regular expression denotes it, so this combination is impossible.'],
          ['Regularity cannot be decided for this language.', `Regularity is decidable in general via automata, and here it is settled: ${c.why}`],
        ],
        explanation: `${c.why}`,
        hint: 'Ask whether a finite amount of memory suffices to decide membership.',
        correctWhy: `Correct: ${c.regular ? 'regular' : 'not regular'}. ${c.why}`,
      }
    },
  },
  {
    id: 'u2-lang-ops',
    unit: 2,
    topic: 'Language operations',
    subtopic: 'Star and plus',
    difficulty: 'Medium',
    type: 'Conceptual',
    count: 24,
    seconds: 55,
    tags: ['languages', 'kleene star'],
    gen: (rng) => {
      const specs: { L: string; q: string; a: string; wrongs: [string, string][] }[] = [
        {
          L: 'L = {a}',
          q: 'What is L*?',
          a: '{ε, a, aa, aaa, …} = a*',
          wrongs: [
            ['{a, aa, aaa, …} = a+', 'a+ excludes ε, but the Kleene star always includes the zero-fold concatenation, which is ε.'],
            ['{ε, a}', 'This stops after one repetition, but the star allows any number of repetitions.'],
            ['{ε}', 'This allows only the zero-fold case, discarding all positive repetitions.'],
          ],
        },
        {
          L: 'L = {ab}',
          q: 'What is L+?',
          a: '{ab, abab, ababab, …} = (ab)+',
          wrongs: [
            ['{ε, ab, abab, …} = (ab)*', 'This includes ε, but the plus operator starts at one repetition.'],
            ['{a, b, ab}', 'This includes the individual symbols, which are not in L+ since every member is a concatenation of whole copies of ab.'],
            ['{ab}', 'This allows only one repetition, but the plus operator allows one or more.'],
          ],
        },
        {
          L: 'L = {ε}',
          q: 'What is L*?',
          a: '{ε}',
          wrongs: [
            ['∅', 'The star of any language always contains ε, so it can never be empty.'],
            ['{ε, εε, εεε, …} which is infinite', 'Every concatenation of ε with itself is still ε, so all these strings coincide and the set has one element.'],
            ['Σ*', 'Σ* contains all strings, but L* here contains only the empty string.'],
          ],
        },
        {
          L: 'L = ∅',
          q: 'What is L*?',
          a: '{ε}',
          wrongs: [
            ['∅', '∅⁰ = {ε} by convention, so the union over all powers includes ε and L* is not empty.'],
            ['Σ*', 'Only ε is obtainable, since no positive-length concatenation of ∅ members can produce a string.'],
            ['{ε, ∅}', '∅ is a language, not a string, so it cannot be an element of a language of strings.'],
          ],
        },
      ]
      const s = pick(rng, specs)
      return {
        prompt: `Let ${s.L}. ${s.q}`,
        correct: s.a,
        wrong: s.wrongs,
        explanation: `The Kleene star is the union of all finite powers: L* = ∪_{i≥0} L^i, and L+ = ∪_{i≥1} L^i. The i = 0 power is always {ε}, which is why ε ∈ L* regardless of L. Applying that to ${s.L} gives ${s.a}.`,
        hint: 'Include the zero-fold concatenation, which is {ε}.',
        correctWhy: `Correct: ${s.a}`,
      }
    },
  },
  {
    id: 'u2-aba-count',
    unit: 2,
    topic: 'String operations',
    subtopic: 'Substring counting',
    difficulty: 'Medium',
    type: 'Computation',
    count: 22,
    seconds: 60,
    tags: ['strings', 'substrings'],
    gen: (rng) => {
      const n = randInt(rng, 5, 9)
      const pattern = pick(rng, ['aa', 'ab', 'ba', 'bb'])
      const total = Math.pow(2, n)
      const count = allStrings(ALPH, n)
        .filter((s) => s.length === n && s.includes(pattern))
        .length
      return {
        prompt: `Over Σ = {a, b}, how many strings of length ${n} contain the substring "${pattern}"?`,
        correct: `${num(count)}`,
        wrong: [
          [`${num(total - count)}`, `${total - count} is the number that avoid "${pattern}", which is the complement of what is asked.`],
          [`${num(total)}`, `${total} counts all strings of length ${n}, ignoring the substring constraint entirely.`],
          [`${num(n - 1)}`, `${n - 1} counts possible starting positions for the substring, not strings.`],
          [`${num(Math.floor(count / 2))}`, `Halving has no combinatorial basis here; inclusion–exclusion over overlap cases gives ${count}.`],
        ],
        explanation: `Counting strings that avoid "${pattern}" requires care with overlapping occurrences, so it is cleaner to enumerate or use an automaton. The verified count of length-${n} strings containing "${pattern}" is ${num(count)} out of ${num(total)} total strings.`,
        hint: 'Either count the complement carefully with overlap cases, or run the pattern-matching automaton.',
        correctWhy: `Correct: enumeration over the 2^${n} strings gives ${num(count)}.`,
      }
    },
  },
]
