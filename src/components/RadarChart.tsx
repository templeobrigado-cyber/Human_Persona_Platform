// 純SVGのレーダーチャート（ライブラリ不使用・Server Componentで描画可能）

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 110;
const GRID_LEVELS = [20, 40, 60, 80, 100];

interface RadarItem {
  label: string;
  value: number; // 0〜100
}

function pointAt(index: number, total: number, distance: number): [number, number] {
  const angle = (-90 + (360 / total) * index) * (Math.PI / 180);
  return [CENTER + distance * Math.cos(angle), CENTER + distance * Math.sin(angle)];
}

function polygonPoints(total: number, distanceOf: (index: number) => number): string {
  return Array.from({ length: total }, (_, i) => pointAt(i, total, distanceOf(i)).join(",")).join(" ");
}

export function RadarChart({
  items,
  fillColor,
  title,
  secondary,
}: {
  items: RadarItem[];
  /** CSS変数を含む色指定（例: "var(--color-chart-fill)"） */
  fillColor: string;
  title: string;
  /** 2人比較用の重ね描きデータ（itemsと同じ軸順） */
  secondary?: { values: number[]; fillColor: string };
}) {
  const n = items.length;
  const description = items.map((item) => `${item.label}${item.value}`).join("、");

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${title}：${description}`}
      className="mx-auto w-full max-w-xs"
    >
      {/* グリッド */}
      {GRID_LEVELS.map((level) => (
        <polygon
          key={level}
          points={polygonPoints(n, () => (RADIUS * level) / 100)}
          fill="none"
          className="stroke-line"
          strokeWidth="1"
        />
      ))}
      {/* 軸線 */}
      {items.map((item, i) => {
        const [x, y] = pointAt(i, n, RADIUS);
        return (
          <line
            key={item.label}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            className="stroke-line"
            strokeWidth="1"
          />
        );
      })}
      {/* データ（2人目を先に描いて1人目を手前にする） */}
      {secondary && (
        <polygon
          points={polygonPoints(n, (i) => (RADIUS * secondary.values[i]) / 100)}
          fill={secondary.fillColor}
          fillOpacity="0.2"
          stroke={secondary.fillColor}
          strokeWidth="2"
          strokeDasharray="5 3"
        />
      )}
      <polygon
        points={polygonPoints(n, (i) => (RADIUS * items[i].value) / 100)}
        fill={fillColor}
        fillOpacity="0.3"
        stroke={fillColor}
        strokeWidth="2"
      />
      {items.map((item, i) => {
        const [x, y] = pointAt(i, n, (RADIUS * item.value) / 100);
        return <circle key={item.label} cx={x} cy={y} r="3" fill={fillColor} />;
      })}
      {/* ラベル */}
      {items.map((item, i) => {
        const [x, y] = pointAt(i, n, RADIUS + 22);
        return (
          <text
            key={item.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            className="fill-ink-muted"
          >
            {item.label}
          </text>
        );
      })}
    </svg>
  );
}
