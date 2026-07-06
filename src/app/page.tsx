import Link from "next/link";

const FEATURES = [
  {
    title: "4つの理論を統合",
    body: "タイプコンパス・Big Five・エニアグラム、そして占い版では九星気学。複数の理論であなたを多面的に映し出します。",
  },
  {
    title: "結果がひと目でわかる",
    body: "タイプ・レーダーチャート・8軸のPersonaベクトルで、強みと個性を1枚に可視化します。",
  },
  {
    title: "81問・約10分・無料",
    body: "直感で答えるだけ。登録不要で、その場で結果が見られます。",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        {/* ヒーロー */}
        <header className="text-center">
          <p className="font-mono text-sm font-bold tracking-widest text-ink-muted">HPP</p>
          <h1 className="mt-4 text-3xl/tight font-bold sm:text-4xl/tight">
            4つの理論で、
            <br className="sm:hidden" />
            あなたの人格を1枚に。
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-ink-muted">
            全81問・約10分・無料。直感でお答えください。正解はありません。
          </p>
        </header>

        {/* 入り口CTA */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/diagnosis/fortune/start"
            className="group rounded-2xl border border-fortune/20 bg-fortune-soft p-6 transition-colors hover:border-fortune"
          >
            <p className="text-xs font-bold tracking-wide text-fortune">占い版</p>
            <p className="mt-2 text-lg font-bold text-fortune-deep">
              無料で占う
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              あなたの本質と運気のかたち。九星気学×性格分析で読み解きます。
            </p>
          </Link>
          <Link
            href="/diagnosis/business/start"
            className="group rounded-2xl border border-business/20 bg-business-soft p-6 transition-colors hover:border-business"
          >
            <p className="text-xs font-bold tracking-wide text-business">企業・採用版</p>
            <p className="mt-2 text-lg font-bold text-business-deep">
              無料で診断
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              採用・配属に使える人格データ。心理統計ベースで分析します。
            </p>
          </Link>
        </div>

        {/* 特徴 */}
        <section className="mt-16">
          <h2 className="text-center text-xl font-bold">HPPの特徴</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-line bg-card p-5">
                <h3 className="text-base font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 相性診断 */}
        <section className="mt-16 rounded-2xl border border-line bg-card p-6 text-center">
          <h2 className="text-xl font-bold">相性診断</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
            診断結果の共有URLを2つ組み合わせると、ふたりの相性を診断できます。
            占い版同士なら五行の相性も加味します。
          </p>
          <p className="mt-4">
            <Link
              href="/compatibility"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink px-6 text-base font-bold transition-colors hover:bg-ink hover:text-white"
            >
              相性診断を試す →
            </Link>
          </p>
        </section>

        {/* 料金 */}
        <section className="mt-16 rounded-2xl border border-line bg-card p-6 text-center">
          <h2 className="text-xl font-bold">料金</h2>
          <p className="mt-3 text-sm text-ink-muted">
            診断と結果表示はすべて無料。AI鑑定・詳細レポートなどの有料プランは近日公開予定です。
          </p>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-muted">
        © HPP — Human Persona Platform
      </footer>
    </div>
  );
}
