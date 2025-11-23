import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- Types & Data ---

// ★ここに画像のURLをまとめています。
// Googleドライブの共有リンク(誰でも閲覧可)をそのまま貼り付けても表示されるように変換処理を入れています。
const IMAGES = {
  // メインビジュアル(動画がない場合の静止画): 森・自然・癒し
  hero: "https://images.unsplash.com/photo-1511497584788-876760111969?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  // 診断結果: リラックス
  result_relax: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  // 診断結果: 髪質改善
  result_hair: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  // 診断結果: 炭酸スパ
  result_scalp: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  // 診断結果: プレミアム
  result_premium: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  // 診断結果: バランス
  result_balance: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  // フッター背景
  footer_bg: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
};

// ★Heroセクションの動画設定
const HERO_SETTINGS = {
  // 動画を使用する場合はURLを設定してください（空文字の場合は上記のhero画像が使用されます）。
  // Googleドライブの動画ファイルの共有リンクも設定可能です。
  // ※Googleドライブの動画は再生が不安定な場合があるため、本格運用の際はmp4の直リンク等を推奨します。
  videoUrl: "https://videos.pexels.com/video-files/2882118/2882118-hd_1920_1080_24fps.mp4",
  // 動画が読み込まれるまで表示する画像（IMAGESのキーを指定）
  posterKey: "hero" as keyof typeof IMAGES,
};

/**
 * Google Driveの共有リンク等を直接表示可能なURLに変換するヘルパー関数
 */
const resolveGoogleDriveUrl = (url: string, type: 'image' | 'video' = 'image') => {
  if (!url) return '';
  // Google DriveのURLパターンの場合、画像を直接表示できる形式に変換
  if (url.includes('drive.google.com')) {
    const idMatch = url.match(/\/d\/(.*?)\/|\?id=(.*?)(&|$)/);
    const id = idMatch ? (idMatch[1] || idMatch[2]) : null;
    if (id) {
      if (type === 'video') {
        // 動画の場合、ダウンロード形式のリンクに変換（videoタグのsrc用）
        return `https://drive.google.com/uc?export=download&id=${id}`;
      }
      // 画像の場合、lh3形式（CDN）に変換
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
};

const RESULTS: Record<string, ResultType> = {
  relax: {
    name: "森の深眠コース 90分",
    price: "¥13,200",
    desc: "自律神経を整え、脳疲労を解消する極上のハンドテクニック。深い眠りへ誘います。",
    reasons: ["深いリラクゼーション効果", "自律神経の調整", "眼精疲労の解消"],
    imgKey: "result_relax"
  },
  hair: {
    name: "水素髪質改善 90分",
    price: "¥11,800",
    desc: "悪玉活性酸素を除去し、髪内部の水分量を向上。うねりやパサつきを根本からケアします。",
    reasons: ["水分量アップで潤う髪へ", "うねり・パサつきの根本改善", "エイジングケア効果"],
    imgKey: "result_hair"
  },
  scalp: {
    name: "森の炭酸コース 60分",
    price: "¥9,900",
    desc: "高濃度炭酸泉が毛穴の汚れを吸着・除去。血行を促進し、健康な髪が育つ土壌を整えます。",
    reasons: ["毛穴の汚れを徹底除去", "血行促進で育毛効果", "頭皮のニオイ改善"],
    imgKey: "result_scalp"
  },
  premium: {
    name: "ララピール付きプレミアム",
    price: "¥16,500",
    desc: "韓国発の次世代ピーリング「ララピール」とヘッドスパを組み合わせた、頭皮と肌のトータルエイジングケア。",
    reasons: ["頭皮と肌の同時ケア", "低刺激で敏感肌でも安心", "最高の贅沢体験"],
    imgKey: "result_premium"
  },
  balance: {
    name: "森の深眠コース 60分",
    price: "¥8,800",
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

const Diagnosis = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0 });
  const [result, setResult] = useState<ResultType | null>(null);
  // アニメーションをリセットするためのキー
  const [animationKey, setAnimationKey] = useState(0);

  const handleAnswer = (type: 'A' | 'B' | 'C' | 'D') => {
    const newAnswers = { ...answers, [type]: answers[type] + 1 };
    setAnswers(newAnswers);
    setAnimationKey(prev => prev + 1);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      // Logic to determine result
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
          {/* Keyを変更することでアニメーションを再トリガー */}
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
            <p className="result-price">{result.price}</p>
          </div>
          <img src={resolveGoogleDriveUrl(IMAGES[result.imgKey])} alt={result.name} className="result-img" />
          <div className="result-reasons">
            <h4>おすすめの理由</h4>
            <ul>
              {result.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          <p className="result-desc">{result.desc}</p>
          <div className="result-actions">
            <a 
              href="https://beauty.hotpepper.jp/slnH000771707/" 
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

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
      <div className="faq-question">
        {question}
        <span className="faq-icon">+</span>
      </div>
      <div className="faq-answer">
        <p>{answer}</p>
      </div>
    </div>
  );
};

const App = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const posterUrl = resolveGoogleDriveUrl(IMAGES[HERO_SETTINGS.posterKey]);
  const videoUrl = resolveGoogleDriveUrl(HERO_SETTINGS.videoUrl, 'video');
  const hasVideo = !!HERO_SETTINGS.videoUrl;

  return (
    <div className={`app ${loaded ? 'loaded' : ''}`}>
      <style>{`
        :root {
          --primary: #2C5F2D;
          --secondary: #F5E6D3;
          --accent: #D4AF37;
          --text: #333;
          --white: #fff;
          --font-main: 'Noto Sans JP', sans-serif;
          --font-serif: 'Zen Old Mincho', serif;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: var(--font-main); 
          color: var(--text); 
          line-height: 1.8; 
          background: var(--white); 
          /* スマートフォンでの横揺れ防止 */
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
        
        /* 改行制御用のクラス - PCではインライン、SPではブロックで自然に改行 */
        .smart-break { display: inline-block; }
        
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
        /* アニメーションクラスが適用されたときに確実に表示させる */
        .fade-in-key { 
          animation: fadeIn 0.5s ease forwards; 
          opacity: 0; /* 初期状態を隠す */
        }
        
        /* Problems */
        .problem-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 40px; }
        .problem-card { background: #f9f9f9; padding: 30px; border-radius: 10px; text-align: center; transition: transform 0.3s; }
        .problem-card:hover { transform: translateY(-5px); }
        .problem-icon { font-size: 2.5rem; color: var(--primary); margin-bottom: 15px; }
        
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
        .result-img { width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 20px; }
        .result-reasons { background: #f9f9f9; padding: 20px; border-radius: 10px; text-align: left; margin-bottom: 20px; }
        .result-reasons h4 { color: var(--primary); border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
        .result-reasons ul li { list-style: none; position: relative; padding-left: 20px; margin-bottom: 5px; }
        .result-reasons ul li::before { content: '✓'; position: absolute; left: 0; color: var(--accent); font-weight: bold; }
        .result-actions { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        
        /* Services */
        .service-card {
          display: flex; flex-direction: column; background: var(--white);
          border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05); margin-bottom: 30px;
        }
        @media(min-width: 768px) {
          .service-card { flex-direction: row; }
          .service-card:nth-child(even) { flex-direction: row-reverse; }
          .service-img-wrap { width: 45%; }
          .service-content { width: 55%; }
        }
        .service-img-wrap { height: 250px; }
        .service-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .service-content { padding: 30px; display: flex; flex-direction: column; justify-content: center; }
        .service-title { font-family: var(--font-serif); font-size: 1.5rem; color: var(--primary); margin-bottom: 10px; }
        .service-price { color: var(--accent); font-weight: bold; font-size: 1.2rem; margin-bottom: 15px; }
        
        /* Tech Grid */
        .tech-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin-top: 40px; }
        .tech-item { background: var(--white); padding: 30px; border-top: 3px solid var(--primary); border-radius: 0 0 10px 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.05); }
        
        /* FAQ */
        .faq-item { border-bottom: 1px solid #ddd; margin-bottom: 10px; }
        .faq-question { padding: 20px; cursor: pointer; font-weight: 600; display: flex; justify-content: space-between; align-items: center; line-height: 1.5; }
        .faq-icon { font-size: 1.5rem; color: var(--primary); transition: transform 0.3s; flex-shrink: 0; margin-left: 10px; }
        .active .faq-icon { transform: rotate(45deg); }
        .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; background: #f9f9f9; }
        .active .faq-answer { max-height: 300px; padding: 20px; }
        
        /* Footer */
        footer { background: var(--primary); color: var(--white); padding: 40px 0; text-align: center; }
        .footer-info { margin-top: 20px; font-size: 0.9rem; opacity: 0.8; }
        
        /* Access Table */
        .access-grid { display: grid; grid-template-columns: 1fr; gap: 30px; margin-top: 30px; }
        @media(min-width: 768px) { .access-grid { grid-template-columns: 1fr 1fr; } }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table th, .info-table td { padding: 15px; border-bottom: 1px solid #eee; text-align: left; }
        .info-table th { width: 30%; color: var(--primary); white-space: nowrap; }
        
        .w-full { width: 100%; }
        .mt-4 { margin-top: 1rem; }
        
        /* Mobile Adjustments */
        @media (max-width: 767px) {
          .section-title { font-size: 1.8rem; }
          .diagnosis-card { padding: 25px; min-height: auto; }
          .hero h1 { font-size: 1.8rem; }
          .question-text { font-size: 1.3rem; }
          /* モバイルで改行するためのクラス */
          .sp-only { display: block; }
          /* モバイルでも中央揃えを維持 */
          .text-center-sp { text-align: center; }
        }
        @media (min-width: 768px) {
          .sp-only { display: none; }
        }
      `}</style>

      <div className="loader">
        <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', letterSpacing: '0.2em' }}>森の日々</div>
      </div>

      <header>
        <div className="container header-inner">
          <a href="#" className="logo">森の日々</a>
          <a href="https://beauty.hotpepper.jp/slnH000771707/" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
            予約する
          </a>
        </div>
      </header>

      <section className="hero">
        {hasVideo ? (
          <video
            className="hero-bg-media"
            autoPlay
            muted
            loop
            playsInline
            poster={posterUrl}
            src={videoUrl}
          />
        ) : (
          <div 
            className="hero-bg-media" 
            style={{ 
              backgroundImage: `url(${posterUrl})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
        )}
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>
            <span className="smart-break">福井市 髪質改善 &</span> <span className="smart-break">ヘッドスパ専門店</span>
          </p>
          <h1>
            <span className="smart-break">あなたの髪は、</span><br className="sp-only"/>
            <span className="smart-break">森で深呼吸する。</span>
          </h1>
          <div style={{ marginTop: '40px' }}>
            <a href="https://beauty.hotpepper.jp/slnH000771707/" target="_blank" rel="noreferrer" className="btn btn-primary">
              今すぐ予約する
            </a>
          </div>
        </div>
      </section>

      <FadeInSection className="section-padding" style={{ background: '#f9f9f9' }}>
        <div className="container">
          <div className="text-center">
            <span className="section-subtitle">PROBLEMS</span>
            <h2 className="section-title">
              <span className="smart-break">こんなお悩み</span><br className="sp-only"/>
              <span className="smart-break">ありませんか？</span>
            </h2>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <i className="fa-solid fa-spa problem-icon"></i>
              <p>頭皮のベタつきや<br/>ニオイが気になる</p>
            </div>
            <div className="problem-card">
              <i className="fa-solid fa-feather problem-icon"></i>
              <p>髪が細くなり、<br/>ボリュームが出ない</p>
            </div>
            <div className="problem-card">
              <i className="fa-solid fa-wand-magic-sparkles problem-icon"></i>
              <p>髪のパサつき・ダメージが<br/>改善しない</p>
            </div>
            <div className="problem-card">
              <i className="fa-solid fa-bed problem-icon"></i>
              <p>日々の疲れが取れず<br/>深く眠りたい</p>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection className="section-padding diagnosis-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <span className="section-subtitle">DIAGNOSIS</span>
            <h2 className="section-title">
              <span className="smart-break">あなたにピッタリの</span><br className="sp-only"/>
              <span className="smart-break">コース診断</span>
            </h2>
            <p className="text-center-sp">
              <span className="smart-break">5つの質問で、</span><br className="sp-only"/>
              <span className="smart-break">今のあなたに最適な</span><br className="sp-only"/>
              <span className="smart-break">メニューをご提案します。</span>
            </p>
          </div>
          <Diagnosis />
        </div>
      </FadeInSection>

      <FadeInSection className="section-padding">
        <div className="container">
          <div className="text-center">
            <span className="section-subtitle">WHY CHOOSE US</span>
            <h2 className="section-title">
              <span className="smart-break">森の日々だから</span><br className="sp-only"/>
              <span className="smart-break">できること</span>
            </h2>
          </div>
          <div className="tech-grid" style={{ textAlign: 'center' }}>
            <div>
              <h1 style={{ color: 'rgba(212,175,55,0.2)', fontSize: '4rem', lineHeight: 1, marginBottom: '-20px', position: 'relative', zIndex: 0 }}>01</h1>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.3rem', position: 'relative', zIndex: 1 }}>専門特化のアプローチ</h3>
              <p style={{ marginTop: '10px' }}>福井市唯一の専門店として、エビデンスに基づいた施術提案を行います。</p>
            </div>
            <div>
              <h1 style={{ color: 'rgba(212,175,55,0.2)', fontSize: '4rem', lineHeight: 1, marginBottom: '-20px', position: 'relative', zIndex: 0 }}>02</h1>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.3rem', position: 'relative', zIndex: 1 }}>先進技術×自然治癒</h3>
              <p style={{ marginTop: '10px' }}>水素・炭酸・ララピール等の最新技術と、深いリラクゼーションを融合。</p>
            </div>
            <div>
              <h1 style={{ color: 'rgba(212,175,55,0.2)', fontSize: '4rem', lineHeight: 1, marginBottom: '-20px', position: 'relative', zIndex: 0 }}>03</h1>
              <h3 style={{ color: 'var(--primary)', fontSize: '1.3rem', position: 'relative', zIndex: 1 }}>五感を癒す空間</h3>
              <p style={{ marginTop: '10px' }}>森の中にいるような香りと音、照明で、心まで解きほぐします。</p>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection className="section-padding" style={{ background: '#fcfcfc' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '50px' }}>
            <span className="section-subtitle">MENU</span>
            <h2 className="section-title">コースのご案内</h2>
          </div>
          
          <div className="service-card">
            <div className="service-img-wrap">
              <img src={resolveGoogleDriveUrl(IMAGES.result_relax)} alt="森の深眠コース" />
            </div>
            <div className="service-content">
              <h3 className="service-title">森の深眠コース</h3>
              <p className="service-price">60分 ¥8,800 / 90分 ¥13,200</p>
              <p>自律神経を整え、脳疲労を解消する極上のハンドテクニック。深い眠りへ誘います。</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-img-wrap">
              <img src={resolveGoogleDriveUrl(IMAGES.result_hair)} alt="水素髪質改善" />
            </div>
            <div className="service-content">
              <h3 className="service-title">水素髪質改善コース</h3>
              <p className="service-price">60分 ¥9,900 / 90分 ¥11,800</p>
              <p>悪玉活性酸素を除去し、髪内部の水分量を向上。うねりやパサつきを根本からケアします。</p>
            </div>
          </div>

          <div className="service-card">
            <div className="service-img-wrap">
              <img src={resolveGoogleDriveUrl(IMAGES.result_premium)} alt="ララピール付きプレミアム" />
            </div>
            <div className="service-content">
              <h3 className="service-title">ララピール付きプレミアム</h3>
              <p className="service-price">¥16,500</p>
              <p>韓国発の次世代ピーリング「ララピール」とヘッドスパを組み合わせた、頭皮と肌のトータルエイジングケア。</p>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection className="section-padding">
        <div className="container">
          <div className="text-center">
            <span className="section-subtitle">TECHNOLOGY</span>
            <h2 className="section-title">科学に基づく美しさ</h2>
          </div>
          <div className="tech-grid">
            <div className="tech-item">
              <h3><i className="fa-solid fa-droplet text-primary" style={{ marginRight: '10px' }}></i> 水素髪質改善</h3>
              <p>高濃度の水素を使用し、老化の原因となる活性酸素を水へと変換。髪の水分量を高め、しなやかで艶のある髪へ導きます。</p>
            </div>
            <div className="tech-item">
              <h3><i className="fa-solid fa-wind text-primary" style={{ marginRight: '10px' }}></i> 炭酸スパシステム</h3>
              <p>高濃度炭酸泉が毛穴の汚れを吸着・除去。血行を促進し、健康な髪が育つ土壌（頭皮）環境を整えます。</p>
            </div>
            <div className="tech-item">
              <h3><i className="fa-solid fa-star text-primary" style={{ marginRight: '10px' }}></i> ララピール</h3>
              <p>従来の「剥く」ピーリングではなく「満たす」次世代ピーリング。低刺激で敏感肌の方でも安心して受けられ、頭皮環境を劇的に改善します。</p>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection className="section-padding" style={{ background: '#F5E6D3' }}>
        <div className="container">
          <div className="text-center">
            <span className="section-subtitle">VOICE</span>
            <h2 className="section-title">お客様の声</h2>
          </div>
          <div className="tech-grid">
            <div className="tech-item" style={{ position: 'relative' }}>
              <div style={{ color: 'var(--accent)', fontSize: '2rem', marginBottom: '10px' }}>“</div>
              <p>初めて体験しましたが、開始10分で寝てしまいました。終わった後の髪の艶と、頭の軽さに驚きです。</p>
              <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}><span style={{ color: 'var(--accent)' }}>★★★★★</span> 30代女性</div>
            </div>
            <div className="tech-item" style={{ position: 'relative' }}>
              <div style={{ color: 'var(--accent)', fontSize: '2rem', marginBottom: '10px' }}>“</div>
              <p>抜け毛が気になり相談しました。マイクロスコープでの診断が丁寧で、自分に合うケアが分かりました。</p>
              <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}><span style={{ color: 'var(--accent)' }}>★★★★★</span> 40代男性</div>
            </div>
            <div className="tech-item" style={{ position: 'relative' }}>
              <div style={{ color: 'var(--accent)', fontSize: '2rem', marginBottom: '10px' }}>“</div>
              <p>水素トリートメントのおかげで、長年の悩みだったうねりが落ち着きました。毎朝のセットが楽です！</p>
              <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}><span style={{ color: 'var(--accent)' }}>★★★★★</span> 50代女性</div>
            </div>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection className="section-padding">
        <div className="container">
          <div className="text-center">
            <span className="section-subtitle">FAQ</span>
            <h2 className="section-title">よくある質問</h2>
          </div>
          <div style={{ maxWidth: '800px', margin: '40px auto 0' }}>
            <FAQItem 
              question="男性でも利用できますか？" 
              answer="はい、大歓迎です。頭皮ケアやリラクゼーション目的で多くの男性のお客様にご利用いただいております。" 
            />
            <FAQItem 
              question="メイクをしたままでも大丈夫ですか？" 
              answer="はい、基本的に問題ございません。ただし、ララピールを含むフェイシャルメニューをご希望の場合は、一部メイクオフが必要になる場合がございます。" 
            />
            <FAQItem 
              question="駐車場はありますか？" 
              answer="はい、店舗前に専用駐車場をご用意しております。" 
            />
             <FAQItem 
              question="クレジットカードは使えますか？" 
              answer="はい、各種クレジットカード、電子マネーをご利用いただけます。" 
            />
          </div>
        </div>
      </FadeInSection>

      <section className="section-padding">
        <div className="container">
          <div className="text-center">
            <span className="section-subtitle">ACCESS</span>
            <h2 className="section-title">店舗情報</h2>
          </div>
          <div className="access-grid">
            <div>
              <table className="info-table">
                <tbody>
                  <tr><th>店名</th><td>森の日々 福井店</td></tr>
                  <tr><th>住所</th><td>〒910-0125<br/>福井県福井市定正町1213(THE GATE隣接)</td></tr>
                  <tr><th>営業時間</th><td>10:00〜21:00</td></tr>
                  <tr><th>定休日</th><td>不定休</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ background: '#eee', borderRadius: '10px', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <iframe 
                src="https://maps.google.com/maps?q=%E7%A6%8F%E4%BA%95%E7%9C%8C%E7%A6%8F%E4%BA%95%E5%B8%82%E5%AE%9A%E6%AD%A3%E7%94%BA1213&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                width="100%" height="100%" style={{ border: 0, borderRadius: '10px', minHeight: '300px' }} allowFullScreen loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: `linear-gradient(rgba(44, 95, 45, 0.9), rgba(44, 95, 45, 0.9)), url(${resolveGoogleDriveUrl(IMAGES.footer_bg)}) center/cover`, color: 'white', textAlign: 'center', padding: '100px 20px' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '30px' }}>
             <span className="smart-break">本来の美しさを、</span><span className="smart-break">ここから。</span>
          </h2>
          <a href="https://beauty.hotpepper.jp/slnH000771707/" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '20px 50px', fontSize: '1.2rem' }}>
            WEB予約はこちら
          </a>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="logo" style={{ color: 'white', fontSize: '2rem' }}>森の日々</div>
          <div className="footer-info">
            <p>&copy; 2025 Mori no Hibi Fukui. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);