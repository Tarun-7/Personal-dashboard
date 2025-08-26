import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip } from 'chart.js';

Chart.register(ArcElement, Tooltip);

const GoalProgress = ({
  netWorth,
  usdInvestments,
  rupeeInvestments,
  euroInvestments,
  goalAmount, // in INR or the used currency
  usdInrRate,
  eurInrRate,
  netWorthCurrencySymbol = '₹'
}) => {
  // Convert all to INR or common currency for the chart
  const usdInInr = +usdInvestments * +usdInrRate;
  const euroInInr = +euroInvestments * +eurInrRate;
  console.log("Euro Investments:", euroInvestments);
  console.log("EUR to INR Rate: g", eurInrRate);
  console.log("Euro Investments (INR):", euroInInr);
  const data = {
    labels: ['USD (INR)', 'INR', 'EUR (INR)'], 
    datasets: [
      {
        data: [usdInInr, rupeeInvestments, euroInInr],
        backgroundColor: [
          'rgba(203,191,43,1)', // USD
          'rgba(51,130,246,1)', // INR
          'rgba(32,178,107,1)'  // EUR
        ],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const percent = goalAmount > 0 ? Math.floor(Math.min(1, netWorth / goalAmount) * 100) : 0;

  // Format helper
  const currency = netWorthCurrencySymbol;
  const fmt = x => typeof x === 'number'
    ? x.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : x;

    const currencySymbols = ['$', '₹', '€']; // order matches dataset

    const arcLabelPlugin = {
    id: 'arcLabelPlugin',
    afterDraw: (chart) => {
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const dataset = chart.getDatasetMeta(0);
        dataset.data.forEach((arc, index) => {
        const { x, y, startAngle, endAngle, outerRadius } = arc;
        // Calculate mid angle
        const midAngle = (startAngle + endAngle) / 2;
        // Radius at 75% to put symbol midway on ring
        const radius = outerRadius * 0.75;
        // Calculate x, y coordinate on arc
        const sx = x + radius * Math.cos(midAngle);
        const sy = y + radius * Math.sin(midAngle);
        // Draw currency symbol
        ctx.fillText(currencySymbols[index], sx, sy);
        });
        ctx.restore();
    },
    };


  return (
    <div
      style={{
        width: 320,
        height: 320,
        background: 'rgba(22,26,34,0.93)',
        borderRadius: 24,
        boxShadow: '0 4px 24px 4px #12222244, 0 1.5px 4px #15905A55 inset',
        backdropFilter: 'blur(6px)',
        margin: "0 auto",
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0 0 0'
      }}
    >
      <div
        style={{
          width: 240,
          height: 240,
          position: 'relative',
        }}>
        <Doughnut
          data={data}
          options={{
            cutout: "70%",
            maintainAspectRatio: false,
            events: [],
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: ctx => {
                    if (ctx.dataIndex === 0) return `USD: ${currency}${fmt(usdInInr)}`;
                    if (ctx.dataIndex === 1) return `INR: ${currency}${fmt(rupeeInvestments)}`;
                    if (ctx.dataIndex === 2) return `EUR: ${currency}${fmt(euroInInr)}`;
                    return '';
                  }
                }
              }
            }
          }}
          plugins={[arcLabelPlugin]}
          width={240}
          height={240}
        />
        <div
          style={{
            position: "absolute",
            left: 0, top: 0, width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            pointerEvents: "none"
          }}
        >
          <span style={{
            fontSize: 40, fontWeight: 700,
            color: "#20B26B",
            letterSpacing: 0
          }}>{percent}%</span>
        </div>
      </div>

      <div style={{
        marginTop: 4,
        fontWeight: 600,
        color: "#fff",
        fontSize: 22
      }}>
        Goal: {currency}{fmt(goalAmount)}
      </div>
    </div>
  );
};

export default GoalProgress;
