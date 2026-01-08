import { useState, useEffect } from "react";
import "./App.css";

/* ===== ステージ画像 ===== */
const trueStages = ["/images/trueStage.png"];
const falseStages = [
  "/images/falseStage1.png",
  "/images/falseStage2.png",
  "/images/falseStage3.png",
  "/images/falseStage4.png",
  "/images/falseStage5.png",
];

/* ===== ステージ生成 ===== */
function generateStage(forceTrue = false) {
  const hasMistake = forceTrue ? false : Math.random() < 0.5;
  const images = hasMistake ? falseStages : trueStages;
  const image = images[Math.floor(Math.random() * images.length)];
  return { hasMistake, image };
}

export default function App() {
  /* ===== state ===== */
  const [screen, setScreen] = useState("title"); // title | game | clear
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState(generateStage(true));
  const [phase, setPhase] = useState("observe"); // observe | choice
  const [timeLeft, setTimeLeft] = useState(10);

  /* ===== カウント管理（リセット仕様） ===== */
  function addCount(delta, reset = false) {
    setCount((prev) => (reset ? 0 : Math.max(0, prev + delta)));
  }

  /* ===== タイマー（観察フェーズ専用） ===== */
  useEffect(() => {
    if (screen !== "game" || phase !== "observe") return;

    const timer = setTimeout(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [screen, phase, timeLeft]);

  /* ===== フェーズ切り替え（時間切れ判定） ===== */
  useEffect(() => {
    if (timeLeft === 0 && phase === "observe") {
      setPhase("choice");
    }
  }, [timeLeft, phase]);

  /* ===== 判定 ===== */
  function judge(choice) {
    const correct =
      (choice === "right" && !stage.hasMistake) ||
      (choice === "left" && stage.hasMistake);

    const nextCount = correct ? count + 1 : 0; // 間違えたらリセット
    setCount(nextCount);

    if (nextCount >= 8) {
      setScreen("clear");
      return;
    }

    setStage(generateStage());
    setTimeLeft(10);
    setPhase("observe");
  }

  /* ===== タイトル画面 ===== */
  if (screen === "title") {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "80px",
          backgroundImage: "url('/images/start_background.png')",
          backgroundSize: "cover",
          minHeight: "100vh",
        }}
      >
        <h1>8番出口（仮）</h1>

        <div
          style={{
            display: "inline-block",
            textAlign: "left",
            margin: "30px 0",
            border: "1px solid #333",
            padding: "15px",
            background: "#eee",
            color: "black",
          }}
        >
          <h3>ご案内 Information</h3>
          <p>異変を見逃さないこと</p>
          <p>異変を見つけたら、すぐに引き返すこと</p>
          <p>異変が見つからなかったら、引き返さないこと</p>
          <p>8番出口から外に出ること</p>
        </div>

        <br />

        <button
          style={{ fontSize: "18px", padding: "10px 20px" }}
          onClick={() => {
            setCount(0);
            setStage(generateStage(true));
            setTimeLeft(10);
            setPhase("observe");
            setScreen("game");
          }}
        >
          帰宅する
        </button>
      </div>
    );
  }

  /* ===== クリア画面 ===== */
  if (screen === "clear") {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
          backgroundImage: "url('/images/clear_background.png')",
          backgroundSize: "cover",
          minHeight: "100vh",
        }}
      >
        <h1>あなたは8番出口に到達した。</h1>
        <p>その後、無事に帰宅した。</p>
        <button
          style={{ marginTop: "20px" }}
          onClick={() => setScreen("title")}
        >
          タイトルへ戻る
        </button>
      </div>
    );
  }

  /* ===== ゲーム画面 ===== */
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          fontSize: "18px",
        }}
      >
        現在位置：{count}番出口
      </div>

      <img
        src={stage.image}
        alt="stage"
        width={600}
        style={{ border: "1px solid black", marginTop: "40px" }}
      />

      {phase === "observe" && (
        <p style={{ marginTop: "20px" }}>観察中… 残り {timeLeft} 秒</p>
      )}

      {phase === "choice" && (
        <div style={{ marginTop: "20px" }}>
          <button onClick={() => judge("left")}>引き返す</button>
          <button
            onClick={() => judge("right")}
            style={{ marginLeft: "10px" }}
          >
            引き返さない
          </button>
        </div>
      )}
    </div>
  );
}