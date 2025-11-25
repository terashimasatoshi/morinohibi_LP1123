import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types & Data ---

const IMAGES = {
  hero: "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  result_relax: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  result_hair: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  result_premium: "https://drive.google.com/file/d/1S8aQS6VERyw1KN0ubTjMGIw9wxWb5TGD/view?usp=drive_link",
  result_scalp: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  result_balance: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  footer_bg: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  mechanism_bg: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
};

const HERO_SETTINGS = {
  videoUrl: "https://videos.pexels.com/video-files/2882118/2882118-hd_1920_1080_24fps.mp4",
  posterKey: "hero" as keyof typeof IMAGES,
};

const resolveGoogleDriveUrl = (url: string, type: 'image' | 'video' = 'image') => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/d\/(.*?)\/|\?id=(.*?)(&|$)/);
    const id = idMatch ? (idMatch[1] || idMatch[2]) : null;
    if (id) {
      if (type === 'video') {
        return `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;
      }
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
  }
  return url;
};

type Question = {
  id: number;
  text: string;
  options: { label: string; type: 'A' | 'B' | 'C' | 'D' }[];
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "今日の目的は？",
    options: [
      { label: "疲れを癒したい、リラックスしたい", type: 'A' },
      { label: "髪の悩みを本気で改善したい", type: 'B' },
      { label: "頭皮環境を整えたい", type: 'C' },
      { label: "特別なご褒美体験をしたい", type: 'D' },
    ],
  },
  {
    id: 2,
    text: "気になる髪や頭皮の悩みは？",
    options: [
      { label: "抜け毛・薄毛が気になる", type: 'A' }, 
      { label: "髪のパサつき・ダメージ", type: 'B' },
      { label: "頭皮のベタつき・臭い", type: 'C' },
      { label: "特にないが、予防したい", type: 'D' },
    ],
  },
  {
    id: 3,
    text: "どのくらいの時間をかけたい？",
    options: [
      { label: "60分でサクッと", type: 'A' },
      { label: "90分でじっくり", type: 'B' },
      { label: "時間より効果重視", type: 'C' },
    ],
  },
  {
    id: 4,
    text: "予算感は？",
    options: [
      { label: "1万円以内", type: 'A' },
      { label: "1万円前後", type: 'B' },
      { label: "1.5万円以上でも最高の体験を", type: 'C' },
    ],
  },
  {
    id: 5,
    text: "重視したいポイントは？",
    options: [
      { label: "とにかくリラックスしたい", type: 'A' },
      { label: "科学的根拠のある施術", type: 'B' },
      { label: "最新技術を試したい", type: 'C' },
      { label: "コスパ重視", type: 'D' },
    ],
  },
];

type ResultType = {
  name: string;
  price: string;
  desc: string;
  reasons: string[];
  imgKey: keyof typeof IMAGES;
  isVideo?: boolean;
};

const RESULTS: Record<string, ResultType> = {
  relax: {
    name: "森の深眠コース 90分",
    price: "詳細を見る",
    desc: "自律神経を整え、脳疲労を解消する極上のハンドテクニック。深い眠りへ誘います。",
    reasons: ["深いリラクゼーション効果", "自律神経の調整", "眼精疲労の解消"],
    imgKey: "result_relax"
  },
  hair: {
    name: "水素髪質改善 90分",
    price: "詳細を見る",
    desc: "悪玉活性酸素を除去し、髪内部の水分量を向上。うねりやパサつきを根本からケアします。",
    reasons: ["水分量アップで潤う髪へ", "うねり・パサつきの根本改善", "エイジングケア効果"],
    imgKey: "result_hair"
  },
  scalp: {
    name: "森の炭酸コース 60分",
    price: "詳細を見る",
    desc: "高濃度炭酸泉が毛穴の汚れを吸着・除去。血行を促進し、健康な髪が育つ土壌を整えます。",
    reasons: ["毛穴の汚れを徹底除去", "血行促進で育毛効果", "頭皮のニオイ改善"],
    imgKey: "result_scalp"
  },
  premium: {
    name: "ララピール付きプレミアム",
    price: "詳細を見る",
    desc: "韓国発の次世代ピーリング「ララピール」とヘッドスパを組み合わせた、頭皮と肌のトータルエイジングケア。",
    reasons: ["頭皮と肌の同時ケア", "低刺激で敏感肌でも安心", "最高の贅沢体験"],
    imgKey: "result_premium",
    isVideo: true
  },
  balance: {
    name: "森の深眠コース 60分",
    price: "詳細を見る",
    desc: "初めての方におすすめ。短時間でも十分な癒しと効果を実感できるスタンダードコース。",
    reasons: ["手軽に極上体験", "お仕事帰りにも最適", "コストパフォーマンス抜群"],
    imgKey: "result_balance"
  }
};

// --- Components ---

const FadeInSection = ({ children, className = "", style = {} }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setVisible(entry.isIntersecting));
    }, { threshold: 0.1 });

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`fade-section ${isVisible ? 'is-visible' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

const Header = () => (
  <header>
    <div className="container header-inner">
      <a href="#" className="logo">森の日々 <span style={{fontSize:'0.7em', color:'#666', fontWeight:'normal'}}>福井店</span></a>
      <a href="https://beauty.hotpepper.jp/slnH000771707/coupon/" target="_blank" rel="noreferrer" className="btn btn-primary sp-hide" style={{padding: '8px 20px', fontSize: '0.9rem'}}>
        予約する
      </a>
    </div>
  </header>
);

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrl = resolveGoogleDriveUrl(HERO_SETTINGS.videoUrl, 'video');

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
    }
  }, []);

  return (
    <div className="hero">
      {HERO_SETTINGS.videoUrl ? (
        <video 
          ref={videoRef}
          className="hero-bg-media" 
          src={videoUrl} 
          muted 
          loop 
          playsInline
          poster={resolveGoogleDriveUrl(IMAGES[HERO_SETTINGS.posterKey])}
        />
      ) : (
        <img 
          className="hero-bg-media"
          src={resolveGoogleDriveUrl(IMAGES[HERO_SETTINGS.posterKey])}
          alt="Hero Background"
        />
      )}
      <div className="hero-overlay"></div>
      <div className="hero-content container">
        <h1>
          <span className="smart-break">髪と心に、</span><br className="sp-only"/>
          <span className="smart-break">森の休息を。</span>
        </h1>
        <p style={{fontSize: '1.2rem', marginBottom: '2.5rem', lineHeight: '1.8'}}>
          福井で唯一の「深眠」ヘッドスパ。<br/>
          髪質改善と癒しの融合で、<br className="sp-only"/>本来の輝きを取り戻す。
        </p>
        <a href="https://beauty.hotpepper.jp/slnH000771707/coupon/" target="_blank" rel="noreferrer" className="btn btn-primary btn-animate" style={{padding: '18px 45px', fontSize: '1.1rem'}}>
           予約・空き状況を確認する
        </a>
      </div>
      <div className="scroll-indicator">
        <span>SCROLL</span>
        <div className="line"></div>
      </div>
    </div>
  );
};

const Problems = () => {
  return (
    <div className="container section-padding">
      <div className="text-center">
        <span className="section-subtitle">PROBLEMS</span>
        <h2 className="section-title">こんなお悩みありませんか？</h2>
      </div>
      <div className="problem-grid">
        <div className="problem-card">
          <div className="problem-icon"><i className="fa-solid fa-bed"></i></div>
          <h3>眠りが浅い・疲れが取れない</h3>
          <p>自律神経の乱れにより、脳が常に緊張状態にあるかもしれません。</p>
        </div>
        <div className="problem-card">
          <div className="problem-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
          <h3>髪のパサつき・うねり</h3>
          <p>加齢やダメージによる髪質の変化にお悩みの方へ。</p>
        </div>
        <div className="problem-card">
          <div className="problem-icon"><i className="fa-solid fa-droplet"></i></div>
          <h3>頭皮のベタつき・乾燥</h3>
          <p>頭皮環境の悪化は、将来の薄毛や白髪の原因になります。</p>
        </div>
      </div>
    </div>
  );
};

// 解決策へのブリッジ
const SolutionBridge = () => (
  <div className="container text-center" style={{paddingBottom: '60px'}}>
    <div className="bridge-line"></div>
    <h2 className="bridge-text">
      その悩み、私たちに<br className="sp-only"/>解決させてください
    </h2>
    <div className="bridge-line"></div>
  </div>
);

const WhyChooseUs = () => {
  return (
    <div style={{background: '#f9f9f9'}} className="section-padding">
      <div className="container">
        <div className="text-center">
          <span className="section-subtitle">WHY CHOOSE US</span>
          <h2 className="section-title">森の日々が選ばれる理由</h2>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-num">01</div>
            <h3>完全個室の<br/>プライベート空間</h3>
            <p>周りを気にせず、森の中にいるような静寂と癒しに包まれるひとときをご提供します。</p>
          </div>
          <div className="why-card">
            <div className="why-num">02</div>
            <h3>高濃度水素による<br/>髪質改善</h3>
            <p>活性酸素を除去し、髪の水分量を高めることで、芯から潤う艶髪へと導きます。</p>
          </div>
          <div className="why-card">
            <div className="why-num">03</div>
            <h3>スパニストによる<br/>熟練の手技</h3>
            <p>頭皮のツボや筋肉構造を熟知した専門スタッフが、コリを的確に捉えてほぐします。</p>
          </div>
          <div className="why-card">
            <div className="why-num">04</div>
            <h3>ララピール<br/>正規取扱店</h3>
            <p>第4世代ピーリングを導入。頭皮と肌を同時にケアする、トータルエイジングケアが可能です。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MechanismSection = () => {
  return (
    <div className="mechanism-container">
      <div className="mechanism-header text-center">
        <span className="section-subtitle">MECHANISM</span>
        <h2 className="section-title">
          <span className="smart-break">なぜ、森の日々で</span><br className="sp-only"/>
          <span className="smart-break">「深まる」のか</span>
        </h2>
        <p className="mechanism-intro">
          感覚的な「気持ちいい」の先にある、<br/>
          生理学的な根拠に基づいたリラクゼーションのアプローチ。
        </p>
      </div>

      <div className="mechanism-cards">
        <div className="mechanism-card">
          <div className="mech-icon-wrap">
            <i className="fa-solid fa-scale-balanced"></i>
          </div>
          <h3>自律神経のスイッチ</h3>
          <p className="mech-desc">
            現代生活で過剰になりがちな「交感神経」から、休息モードの「副交感神経」へ。
            一定のリズムと適切な圧によるタッチケアは、心拍変動（HRV）を整え、
            深いリラックス状態へと導きます。
          </p>
        </div>

        <div className="mechanism-card">
          <div className="mech-icon-wrap">
            <i className="fa-solid fa-brain"></i>
          </div>
          <h3>脳疲労へのアプローチ</h3>
          <p className="mech-desc">
            慢性的なストレスは「脳の炎症」とも呼ばれます。
            頭皮マッサージは、ストレスホルモン（コルチゾール）を抑制し、
            幸福感をもたらす神経伝達物質（セロトニン・ドーパミン）の分泌を促すことが研究で示唆されています。
          </p>
        </div>

        <div className="mechanism-card">
          <div className="mech-icon-wrap">
            <i className="fa-regular fa-lightbulb"></i>
          </div>
          <h3>「触れる」ことの科学</h3>
          <p className="mech-desc">
            皮膚は「露出した脳」とも言われます。
            安全で心地よい接触刺激は、オキシトシンの分泌を促し、
            不安感の軽減や睡眠の質のサポートに寄与します。
          </p>
        </div>
      </div>
      
      <div className="mech-note">
        <small>※上記は一般的なマッサージ療法や生理学に基づく理論的背景であり、効果には個人差があります。医療行為ではありません。</small>
      </div>
    </div>
  );
};

const SleepScienceSection = () => {
  return (
    <div className="sleep-science-bg section-padding">
      <div className="container">
         <div className="text-center" style={{marginBottom: '50px'}}>
            <span className="section-subtitle">LOGIC</span>
            <h2 className="section-title">
              <span className="smart-break">「眠くなる」には</span><br/>
              <span className="smart-break">理由がある</span>
            </h2>
         </div>
         
         <div className="science-diagram">
            {/* Step 1: Input */}
            <div className="sd-card">
               <div className="sd-icon"><i className="fa-solid fa-hand-holding-heart"></i></div>
               <h4>適切な圧とリズム</h4>
               <p>一定のリズムによる<br/>心地よい物理刺激</p>
            </div>

            <div className="sd-arrow"><i className="fa-solid fa-arrow-down"></i></div>

            {/* Step 2: Nervous System */}
            <div className="sd-card sd-highlight">
               <div className="sd-icon"><i className="fa-solid fa-leaf"></i></div>
               <h4>副交感神経の優位化</h4>
               <p>緊張モード(交感神経)から<br/>休息モードへスイッチ</p>
            </div>

            <div className="sd-arrow"><i className="fa-solid fa-arrow-down"></i></div>

            {/* Step 3: Bio Markers */}
            <div className="sd-row">
               <div className="sd-mini-card">
                  <span className="sd-trend down">▼</span>
                  <h5>コルチゾール</h5>
                  <p>ストレス<br/>ホルモン減少</p>
               </div>
               <div className="sd-mini-card">
                  <span className="sd-trend up">▲</span>
                  <h5>セロトニン</h5>
                  <p>安心感・幸福感<br/>増加</p>
               </div>
               <div className="sd-mini-card">
                  <span className="sd-trend up">▲</span>
                  <h5>脳血流</h5>
                  <p>循環改善による<br/>老廃物排出</p>
               </div>
            </div>

            <div className="sd-arrow"><i className="fa-solid fa-arrow-down"></i></div>

            {/* Step 4: Outcome */}
            <div className="sd-result">
               <h3><i className="fa-solid fa-bed"></i> 質の高い睡眠・脳疲労解消</h3>
            </div>
         </div>
      </div>
    </div>
  );
};

const LhalalaFeature = () => {
  return (
    <div className="lhalala-feature">
      <div className="lhalala-content container">
        <div className="lhalala-text">
          <span className="lhalala-badge">Brand New</span>
          <h2>
            <span className="smart-break">第4世代ピーリング</span><br/>
            <span className="smart-break" style={{fontSize:'1.2em'}}>LHALALA Peel</span>
          </h2>
          <h3>「剥く」から「満たす」へ。</h3>
          <p>
            従来のピーリングは、皮膚を剥離させることで再生を促すため、
            痛みやダウンタイムが伴いました。<br/><br/>
            韓国発の「ララピール」は、特許成分LHA（リポヒドロキシ酸）を使用し、
            角質を整えながら、肌の深層へ有効成分を浸透させて「満たす」
            次世代のトリートメントです。
          </p>
          
          <div className="lhalala-points">
            <div className="l-point">
              <span className="l-check">✓</span> 痛み・ダウンタイムなし
            </div>
            <div className="l-point">
              <span className="l-check">✓</span> 敏感肌・乾燥肌でもOK
            </div>
            <div className="l-point">
              <span className="l-check">✓</span> 頭皮と肌の同時ケア
            </div>
          </div>
          
          <div className="synergy-box">
            <h4><i className="fa-solid fa-link"></i> ヘッドスパとの相乗効果</h4>
            <p>
              頭皮と顔の皮膚は一枚で繋がっています。
              ヘッドスパで頭皮のコリをほぐし血流を促進した状態でララピールを行うことで、
              リフトアップ効果と肌の透明感が劇的に向上します。
            </p>
          </div>
        </div>
        <div className="lhalala-image">
           <img src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Lhalala Peel Aesthetic" />
        </div>
      </div>
    </div>
  );
};

const Diagnosis = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0 });
  const [result, setResult] = useState<ResultType | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const handleAnswer = (type: 'A' | 'B' | 'C' | 'D') => {
    const newAnswers = { ...answers, [type]: answers[type] + 1 };
    setAnswers(newAnswers);
    setAnimationKey(prev => prev + 1);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      let resultKey = 'balance';
      if (newAnswers.D >= 2) resultKey = 'premium';
      else if (newAnswers.B >= 2 && newAnswers.B > newAnswers.C) resultKey = 'hair';
      else if (newAnswers.C >= 2 && newAnswers.C > newAnswers.B) resultKey = 'scalp';
      else if (newAnswers.A >= 3) resultKey = 'relax';
      else if (newAnswers.A > newAnswers.B && newAnswers.A > newAnswers.C) resultKey = 'relax';
      
      setResult(RESULTS[resultKey]);
    }
  };

  const resetDiagnosis = () => {
    setStep(0);
    setAnswers({ A: 0, B: 0, C: 0, D: 0 });
    setResult(null);
    setAnimationKey(0);
  };

  return (
    <div className="diagnosis-card">
      {!result ? (
        <>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
          <div key={animationKey} className="question-area fade-in-key">
            <span className="question-number">QUESTION {step + 1}/{QUESTIONS.length}</span>
            <h3 className="question-text">{QUESTIONS[step].text}</h3>
            <div className="options-grid">
              {QUESTIONS[step].options.map((opt, idx) => (
                <button 
                  key={idx} 
                  className="option-btn"
                  onClick={() => handleAnswer(opt.type)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="result-area fade-in-key">
          <div className="result-header">
            <span className="result-label">あなたにおすすめのコース</span>
            <h3 className="result-name">{result.name}</h3>
            {/* Price removed from diagnosis result as it varies, linking to coupon instead */}
            <a href="https://beauty.hotpepper.jp/slnH000771707/coupon/" target="_blank" rel="noreferrer" className="result-price" style={{display:'block', textDecoration:'underline', cursor:'pointer', color: 'var(--primary)'}}>
                お得な価格はこちらで
            </a>
          </div>
          {result.isVideo ? (
            <video 
              src={resolveGoogleDriveUrl(IMAGES[result.imgKey], 'video')} 
              className="result-img"
              autoPlay 
              muted 
              loop 
              playsInline 
              controls
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <img src={resolveGoogleDriveUrl(IMAGES[result.imgKey])} alt={result.name} className="result-img" />
          )}
          <div className="result-reasons">
            <h4>おすすめの理由</h4>
            <ul>
              {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          <p className="result-desc">{result.desc}</p>
          <div className="result-actions">
            <a 
              href="https://beauty.hotpepper.jp/slnH000771707/coupon/" 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-primary w-full"
            >
              このコースを予約する
            </a>
            <button onClick={resetDiagnosis} className="btn btn-outline mt-4">
              診断をやり直す
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// お客様の声セクション
const Testimonials = () => {
  const voices = [
    {
      age: "30代女性",
      comment: "施術が始まってすぐに意識が飛んでしまうほど気持ちよかったです。終わった後の目の開きが全然違いました！",
      rating: 5
    },
    {
      age: "40代男性",
      comment: "仕事のストレスで眠れない日が続いていましたが、ここに来た夜は朝までぐっすり眠れました。定期的に通います。",
      rating: 5
    },
    {
      age: "20代女性",
      comment: "髪のパサつきが気になっていましたが、水素トリートメントで自分の髪じゃないくらいツヤツヤになりました。",
      rating: 5
    },
  ];

  return (
    <div className="section-padding" style={{background: '#fff'}}>
      <div className="container">
        <div className="text-center">
          <span className="section-subtitle">VOICE</span>
          <h2 className="section-title">お客様の声</h2>
        </div>
        <div className="testimonial-grid">
          {voices.map((voice, i) => (
            <div className="testimonial-card" key={i}>
               <div className="voice-stars">{'★'.repeat(voice.rating)}</div>
               <p className="voice-comment">"{voice.comment}"</p>
               <p className="voice-meta">{voice.age}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// メニューセクション
const Menu = () => {
  const menuItems = [
    {
      title: "森の深眠60分コース",
      breakdown: "診断10分・頭浸浴5分・水素洗髪&森スパ25分・LLLT5分",
    },
    {
      title: "森の深眠90分コース",
      breakdown: "診断10分・頭浸浴10分・水素洗髪&森スパ40分・LLLT5分・TR5分",
      isPopular: true
    },
    {
      title: "森の深眠90分コース extra",
      breakdown: "（森の深眠90分コースのメニューに）＋ララピール",
      isSpecial: true
    },
    {
      title: "森の炭酸60分コース",
      breakdown: "診断10分・頭浸浴5分・炭酸泉＆水素洗髪&森スパ30分・LLLT5分",
    },
    {
      title: "炭酸アーユル90",
      breakdown: "診断10分・頭浸10分・炭酸泉＆Amatorq洗髪＆スパ40分・LLLT10分TR5",
    },
    {
      title: "ディープスリープ60",
      breakdown: "頭浸浴5分・水素洗髪スパ30分・LLLT5分・髪質改善5分",
    },
    {
      title: "ディープスリープ90",
      breakdown: "診断10分・頭浸10分・水素洗髪スパ40分・LLLT5分・髪質改善10分",
    },
    {
      title: "ディープスリープ120",
      breakdown: "頭浸浴10分・洗髪スパ50分・LLLT10分・デコルテケア20分",
    },
    {
      title: "フュージョン120",
      breakdown: "頭身浴炭酸10分・アーユルヴェーダスパ50・LLLT10分・髪質改善10",
    }
  ];

  return (
    <div className="section-padding" style={{background:'#f9f9f9'}}>
      <div className="container">
        <div className="text-center">
          <span className="section-subtitle">MENU</span>
          <h2 className="section-title">メニュー</h2>
        </div>
        
        <div className="menu-list-v2">
          {menuItems.map((item, idx) => (
            <div className={`menu-item-v2 ${item.isSpecial ? 'special-item' : ''}`} key={idx}>
               {item.isPopular && <span className="menu-badge">人気No.1</span>}
               {item.isSpecial && <span className="menu-badge special">Special</span>}
               <h3 className="menu-title-v2">{item.title}</h3>
               <div className="menu-breakdown">
                 {item.breakdown.split('・').map((step, sIdx) => (
                   <span key={sIdx} className="breakdown-step">{step}</span>
                 ))}
               </div>
            </div>
          ))}
        </div>

        <div className="text-center" style={{marginTop: '50px'}}>
           <a href="https://beauty.hotpepper.jp/slnH000771707/coupon/" target="_blank" rel="noreferrer" className="btn btn-primary btn-animate">
             お得な価格はこちらで
             <i className="fa-solid fa-arrow-up-right-from-square" style={{marginLeft:'10px'}}></i>
           </a>
        </div>
      </div>
    </div>
  );
};

// アクセスセクション（Google Map）
const Access = () => {
  return (
    <div className="section-padding" style={{background: '#fff'}}>
      <div className="container">
        <div className="text-center">
          <span className="section-subtitle">ACCESS</span>
          <h2 className="section-title">アクセス</h2>
        </div>
        <div className="access-map-container" style={{maxWidth: '1000px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: '15px', overflow: 'hidden'}}>
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12892.754130611389!2d136.22490819729475!3d36.11326434672903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5ff8eb1392182131%3A0x5354c737dcf3371f!2z5qOu44Gu5pel44CF56aP5LqV5bqX6auq6LOq5pS55ZaE77yG44OY44OD44OJ44K544OR5bCC6ZaA5bqX!5e0!3m2!1sja!2sjp!4v1764067478822!5m2!1sja!2sjp" 
                width="100%" 
                height="450" 
                style={{border:0, display: 'block'}} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
        <div className="text-center" style={{marginTop: '30px'}}>
             <h3 style={{fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '10px', fontSize: '1.4rem'}}>森の日々 福井店</h3>
             <p style={{fontSize: '1rem', color: '#555'}}>福井県福井市定正町</p>
        </div>
      </div>
    </div>
  );
};

const Footer = () => (
  <footer style={{background: `linear-gradient(rgba(44,95,45,0.9), rgba(44,95,45,0.95)), url(${resolveGoogleDriveUrl(IMAGES.footer_bg)})`, backgroundSize:'cover', color:'white', padding:'60px 0 100px'}}>
    <div className="container">
      <div className="footer-content" style={{display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:'20px'}}>
         <h2 style={{fontFamily:'var(--font-serif)', fontSize:'2rem'}}>森の日々</h2>
         <p>福井県福井市定正町</p>
         <div className="footer-links">
           <a href="https://beauty.hotpepper.jp/slnH000771707/coupon/" target="_blank" rel="noreferrer" className="btn btn-primary" style={{background:'white', color:'var(--primary)'}}>Web予約はこちら</a>
         </div>
         <p style={{marginTop:'30px', fontSize:'0.8rem', opacity:0.8}}>&copy; 2024 森の日々 Fukui. All Rights Reserved.</p>
      </div>
    </div>
  </footer>
);

// ★NEW★ モバイル用フローティングアクションボタン
const FloatingAction = () => {
    return (
        <div className="floating-action sp-only">
             <a href="https://beauty.hotpepper.jp/slnH000771707/coupon/" target="_blank" rel="noreferrer" className="floating-btn">
                <span style={{fontSize: '0.8rem', opacity: 0.9}}>当日予約OK</span>
                <span style={{fontSize: '1.1rem', fontWeight: 'bold'}}>予約・空き状況を確認</span>
             </a>
        </div>
    );
};

const App = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`app ${loaded ? 'loaded' : ''}`}>
      <style>{`
        :root {
          --primary: #2C5F2D;
          --secondary: #F5E6D3;
          --accent: #D4AF37;
          --text: #333;
          --white: #fff;
          --light-gray: #f9f9f9;
          --font-main: 'Noto Sans JP', sans-serif;
          --font-serif: 'Zen Old Mincho', serif;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: var(--font-main); 
          color: var(--text); 
          line-height: 1.8; 
          background: var(--white); 
          overflow-x: hidden;
          width: 100%;
        }
        
        /* Utils */
        .container { max-width: 1000px; margin: 0 auto; padding: 0 20px; width: 100%; }
        .section-padding { padding: 80px 0; }
        .text-center { text-align: center; }
        .text-primary { color: var(--primary); }
        .text-accent { color: var(--accent); }
        .font-serif { font-family: var(--font-serif); }
        
        .smart-break { display: inline-block; }
        .sp-only { display: none; }
        .sp-hide { display: inline-block; }
        @media(max-width: 768px) { 
            .sp-only { display: block; } 
            .sp-hide { display: none; }
        }
        
        /* Buttons */
        .btn {
          display: inline-block;
          padding: 14px 35px;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
          cursor: pointer;
          border: none;
          font-size: 1rem;
          letter-spacing: 0.1em;
          text-align: center;
        }
        .btn-primary {
          background: var(--accent);
          color: var(--white);
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4); }
        .btn-outline {
          background: transparent;
          border: 2px solid var(--primary);
          color: var(--primary);
        }
        .btn-outline:hover { background: var(--primary); color: var(--white); }
        .btn-animate {
           animation: pulse 2s infinite;
        }
        @keyframes pulse {
           0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
           70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
           100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        
        /* Loader */
        .loader {
          position: fixed; inset: 0; background: var(--primary); z-index: 9999;
          display: flex; justify-content: center; align-items: center; color: white;
          transition: opacity 0.5s, visibility 0.5s;
        }
        .loaded .loader { opacity: 0; visibility: hidden; }
        
        /* Header */
        header {
          position: fixed; top: 0; width: 100%; z-index: 100;
          background: rgba(255,255,255,0.95); backdrop-filter: blur(5px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .header-inner {
          height: 70px; display: flex; justify-content: space-between; align-items: center;
        }
        .logo { font-family: var(--font-serif); font-size: 1.5rem; font-weight: bold; color: var(--primary); text-decoration: none; }
        
        /* Hero */
        .hero {
          height: 100vh; min-height: 600px; position: relative;
          display: flex; align-items: center; justify-content: center;
          text-align: center; color: var(--white);
          overflow: hidden;
        }
        .hero-bg-media {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
        }
        .hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); z-index: 1; }
        .hero-content { position: relative; z-index: 2; padding: 20px; width: 100%; }
        .hero h1 { 
          font-family: var(--font-serif); 
          font-size: clamp(1.8rem, 5vw, 4rem); 
          margin-bottom: 2rem; 
          line-height: 1.6; 
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .scroll-indicator {
          position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
          z-index: 2; display: flex; flex-direction: column; align-items: center;
          font-size: 0.8rem; letter-spacing: 0.2em; opacity: 0.8;
        }
        .scroll-indicator .line {
          width: 1px; height: 50px; background: white; margin-top: 10px;
          animation: scrollLine 2s infinite;
        }
        @keyframes scrollLine {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          51% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        
        /* Section Titles */
        .section-title {
          font-family: var(--font-serif); font-size: 2.2rem; color: var(--primary);
          margin-bottom: 1rem; display: inline-block;
          line-height: 1.4;
        }
        .section-subtitle {
          display: block; font-size: 0.9rem; color: var(--accent);
          margin-bottom: 10px; letter-spacing: 0.2em; text-transform: uppercase;
        }
        
        /* Animation */
        .fade-section { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
        .fade-section.is-visible { opacity: 1; transform: translateY(0); }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in-key { 
          animation: fadeIn 0.5s ease forwards; 
          opacity: 0; 
        }
        
        /* Problems */
        .problem-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 40px; }
        .problem-card { background: #f9f9f9; padding: 30px; border-radius: 10px; text-align: center; transition: transform 0.3s; }
        .problem-card:hover { transform: translateY(-5px); }
        .problem-icon { font-size: 2.5rem; color: var(--primary); margin-bottom: 15px; }

        /* Solution Bridge */
        .bridge-text { font-family: var(--font-serif); color: var(--primary); font-size: 1.8rem; margin: 20px 0; }
        .bridge-line { height: 50px; width: 1px; background: var(--primary); margin: 0 auto; opacity: 0.3; }

        /* Why Choose Us */
        .why-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 40px; }
        @media(min-width: 900px) { .why-grid { grid-template-columns: repeat(4, 1fr); } }
        .why-card { background: white; padding: 30px 20px; border-radius: 10px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.03); position: relative; overflow: hidden; height: 100%; }
        .why-num { font-size: 3rem; font-weight: 900; color: #f0f0f0; position: absolute; top: -10px; left: 10px; z-index: 0; font-family: var(--font-serif); }
        .why-card h3 { position: relative; z-index: 1; color: var(--primary); font-size: 1.2rem; margin-bottom: 15px; font-family: var(--font-serif); }
        .why-card p { position: relative; z-index: 1; font-size: 0.95rem; color: #666; }
        
        /* Mechanism */
        .mechanism-container { background: #f4f7f4; padding: 80px 20px; position: relative; overflow: hidden; }
        .mechanism-header { position: relative; z-index: 2; margin-bottom: 50px; }
        .mechanism-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; max-width: 1000px; margin: 0 auto; position: relative; z-index: 2; }
        .mechanism-card { background: rgba(255,255,255,0.9); padding: 40px 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; transition: transform 0.3s; }
        .mechanism-card:hover { transform: translateY(-5px); }
        .mech-icon-wrap { width: 70px; height: 70px; background: var(--secondary); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 1.8rem; }
        .mechanism-card h3 { color: var(--primary); font-family: var(--font-serif); margin-bottom: 15px; font-size: 1.3rem; }
        .mech-desc { font-size: 0.95rem; color: #555; line-height: 1.7; text-align: left; }
        .mech-note { text-align: center; margin-top: 40px; color: #888; font-size: 0.8rem; position: relative; z-index: 2; }

        /* Sleep Science */
        .sleep-science-bg { background: #fff; padding: 80px 0; border-top: 1px solid #eee; }
        .science-diagram { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .sd-card { background: white; padding: 25px; border-radius: 15px; width: 100%; max-width: 350px; text-align: center; box-shadow: 0 5px 20px rgba(0,0,0,0.08); border: 1px solid #eee; }
        .sd-highlight { border: 2px solid var(--accent); background: #fffdf5; }
        .sd-icon { font-size: 2.2rem; color: var(--primary); margin-bottom: 15px; }
        .sd-card h4 { color: var(--primary); margin-bottom: 10px; font-family: var(--font-serif); }
        .sd-arrow { font-size: 1.5rem; color: #ccc; margin: 10px 0; }
        .sd-row { display: flex; gap: 15px; width: 100%; justify-content: center; flex-wrap: wrap; }
        .sd-mini-card { background: #f9f9f9; padding: 15px; border-radius: 10px; flex: 1; min-width: 140px; text-align: center; border: 1px solid #eee; font-size: 0.9rem; }
        .sd-trend { font-weight: bold; font-size: 1.5rem; display: block; margin-bottom: 5px; }
        .sd-trend.up { color: #e74c3c; }
        .sd-trend.down { color: #3498db; }
        .sd-result { background: var(--primary); color: white; padding: 20px 50px; border-radius: 50px; margin-top: 20px; font-family: var(--font-serif); box-shadow: 0 10px 20px rgba(44,95,45,0.3); }

        /* Lhalala Feature */
        .lhalala-feature { background: linear-gradient(135deg, #fff 0%, #fefcfc 100%); padding: 100px 0; border-top: 1px solid #eee; }
        .lhalala-content { display: flex; flex-direction: column; gap: 50px; align-items: center; }
        @media(min-width: 850px) { .lhalala-content { flex-direction: row; align-items: center; } .lhalala-text { flex: 1; padding-right: 40px; } .lhalala-image { flex: 1; } }
        .lhalala-badge { background: var(--text); color: #fff; padding: 6px 12px; font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; display: inline-block; margin-bottom: 20px; }
        .lhalala-text h2 { font-family: var(--font-serif); font-size: clamp(2rem, 4vw, 3rem); margin-bottom: 25px; line-height: 1.2; color: var(--primary); }
        .lhalala-text h3 { font-size: 1.2rem; color: var(--accent); margin-bottom: 20px; letter-spacing: 0.05em; }
        .lhalala-points { margin: 30px 0; display: grid; gap: 10px; }
        .l-point { font-weight: 500; display: flex; align-items: center; }
        .l-check { color: var(--accent); margin-right: 15px; font-size: 1.2rem; }
        .synergy-box { background: white; border-left: 4px solid var(--accent); padding: 25px; border-radius: 0 10px 10px 0; margin-top: 40px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .synergy-box h4 { color: var(--primary); margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
        .lhalala-image img { width: 100%; border-radius: 20px; box-shadow: 20px 20px 0 var(--secondary), 0 10px 40px rgba(0,0,0,0.1); }
        
        /* Diagnosis */
        .diagnosis-section { background: var(--secondary); }
        .diagnosis-card {
          background: var(--white); padding: 40px; border-radius: 20px;
          box-shadow: 0 10px 30px rgba(44,95,45,0.1);
          max-width: 800px; margin: 0 auto; min-height: 450px;
          display: flex; flex-direction: column; justify-content: center;
        }
        .progress-bar-container { background: #eee; height: 5px; width: 100%; border-radius: 5px; margin-bottom: 30px; overflow: hidden; }
        .progress-bar { background: var(--accent); height: 100%; transition: width 0.3s ease; }
        
        .question-area { width: 100%; }
        .question-number { color: var(--accent); font-weight: bold; display: block; margin-bottom: 10px; }
        .question-text { font-size: 1.5rem; font-family: var(--font-serif); margin-bottom: 30px; color: var(--primary); line-height: 1.4; }
        .options-grid { display: grid; grid-template-columns: 1fr; gap: 15px; }
        @media(min-width: 600px) { .options-grid { grid-template-columns: 1fr 1fr; } }
        .option-btn {
          background: var(--white); border: 2px solid #eee; padding: 15px;
          border-radius: 10px; text-align: left; cursor: pointer; transition: all 0.2s;
          font-family: inherit; font-size: 1rem; color: var(--text); width: 100%;
        }
        .option-btn:hover { border-color: var(--primary); background: #fdfdfd; }
        
        /* Result */
        .result-area { text-align: center; width: 100%; }
        .result-label { background: var(--accent); color: var(--white); padding: 5px 15px; border-radius: 20px; font-size: 0.9rem; display: inline-block; margin-bottom: 10px; }
        .result-name { font-size: 2rem; color: var(--primary); font-family: var(--font-serif); margin-bottom: 5px; line-height: 1.3; }
        .result-price { font-size: 1.5rem; font-weight: bold; margin-bottom: 20px; }
        .result-img { width: 100%; height: 250px; object-fit: cover; border-radius: 10px; margin-bottom: 20px; border: 1px solid #eee; }
        .result-reasons { background: #f9f9f9; padding: 20px; border-radius: 10px; text-align: left; margin-bottom: 20px; }
        .result-reasons h4 { color: var(--primary); border-bottom: 1px dashed #ddd; padding-bottom: 5px; margin-bottom: 10px; font-size: 1.1rem; }
        .result-reasons ul { padding-left: 20px; }
        .result-reasons li { margin-bottom: 5px; }
        .result-desc { margin-bottom: 30px; line-height: 1.8; }

        /* Testimonials */
        .testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-top: 40px; }
        .testimonial-card { background: #fbfbfb; padding: 25px; border-radius: 15px; border: 1px solid #f0f0f0; box-shadow: 0 5px 10px rgba(0,0,0,0.02); }
        .voice-stars { color: var(--accent); margin-bottom: 10px; }
        .voice-comment { font-size: 0.95rem; color: #444; margin-bottom: 15px; font-style: italic; }
        .voice-meta { font-size: 0.8rem; color: #888; text-align: right; }

        /* Menu List V2 */
        .menu-list-v2 { max-width: 800px; margin: 0 auto; display: grid; gap: 20px; }
        .menu-item-v2 { background: #fff; padding: 25px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); position: relative; border: 1px solid #eee; }
        .menu-item-v2.special-item { border: 2px solid var(--accent); background: #fffdf5; }
        .menu-badge { position: absolute; top: -10px; left: 20px; background: var(--primary); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
        .menu-badge.special { background: var(--accent); }
        .menu-title-v2 { font-family: var(--font-serif); font-size: 1.3rem; color: var(--primary); margin-bottom: 12px; }
        .menu-breakdown { display: flex; flex-wrap: wrap; gap: 8px; }
        .breakdown-step { background: #f0f5f0; color: #444; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; display: inline-block; }
        .special-item .breakdown-step { background: rgba(212,175,55,0.1); color: #554; }

        /* Floating Action */
        .floating-action {
           position: fixed; bottom: 0; left: 0; width: 100%; z-index: 1000;
           padding: 15px 20px; background: rgba(255,255,255,0.95);
           border-top: 1px solid #eee; backdrop-filter: blur(10px);
           box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
        }
        .floating-btn {
           display: flex; flex-direction: column; align-items: center; justify-content: center;
           width: 100%; padding: 12px; background: var(--accent); color: white;
           text-decoration: none; border-radius: 10px; box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
           line-height: 1.2;
           animation: pulse 2s infinite;
        }

      `}</style>
      
      <div className={`loader ${loaded ? 'hidden' : ''}`}>
         <div style={{textAlign:'center'}}>
           <div style={{fontFamily:'var(--font-serif)', fontSize:'1.5rem', marginBottom:'10px'}}>森の日々</div>
           <div style={{fontSize:'0.8rem', letterSpacing:'0.2em'}}>LOADING...</div>
         </div>
      </div>
      
      <Header />
      <Hero />
      
      <FadeInSection>
        <Problems />
      </FadeInSection>
      
      <FadeInSection>
        <SolutionBridge />
      </FadeInSection>

      <FadeInSection>
        <WhyChooseUs />
      </FadeInSection>

      <FadeInSection>
        <MechanismSection />
      </FadeInSection>

      <FadeInSection>
        <SleepScienceSection />
      </FadeInSection>
      
      <FadeInSection>
        <LhalalaFeature />
      </FadeInSection>
      
      <div className="section-padding diagnosis-section">
        <div className="container">
          <div className="text-center">
            <span className="section-subtitle">DIAGNOSIS</span>
            <h2 className="section-title">髪質・頭皮診断</h2>
            <p style={{marginBottom: '40px'}}>いくつかの質問に答えるだけで、<br/>あなたに最適なコースをご提案します。</p>
          </div>
          <FadeInSection>
            <Diagnosis />
          </FadeInSection>
        </div>
      </div>
      
      <FadeInSection>
        <Testimonials />
      </FadeInSection>

      <FadeInSection>
        <Menu />
      </FadeInSection>

      <FadeInSection>
        <Access />
      </FadeInSection>

      <Footer />
      
      <FloatingAction />
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);