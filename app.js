const APP_TITLE = "카페 창업 생존 시뮬레이터 (제작:로스터현 v1.0 Web)";

const COLORS = {
  bg: "#f3f5f2",
  surface: "#ffffff",
  surfaceAlt: "#f8faf7",
  border: "#e2e7e1",
  text: "#1e2923",
  muted: "#6b776f",
  primary: "#245c45",
  good: "#237a57",
  warning: "#c98224",
  danger: "#c34d4d",
  grid: "#e9ede8"
};

const DEFAULTS = {
  equity: 0,
  loan: 0,
  deposit: 0,
  premium: 0,
  interior: 0,
  equipment: 0,
  license: 0,
  opening_stock: 0,
  other_startup: 0,
  avg_ticket: 0,
  daily_customers: 0,
  business_days: 0,
  monthly_growth: 0,
  cogs_rate: 0,
  card_rate: 0,
  delivery_rate: 0,
  waste_rate: 0,
  other_variable_rate: 0,
  rent: 0,
  management: 0,
  payroll: 0,
  owner_salary: 0,
  utilities: 0,
  marketing: 0,
  loan_payment: 0,
  maintenance: 0,
  other_fixed: 0
};

const PRESETS = {
  "1인 개인카페": {
    equity: 60000000,
    loan: 0,
    deposit: 10000000,
    premium: 0,
    interior: 25000000,
    equipment: 15000000,
    license: 200000,
    opening_stock: 1200000,
    other_startup: 0,
    avg_ticket: 8000,
    daily_customers: 64,
    business_days: 27,
    monthly_growth: 0,
    cogs_rate: 35,
    card_rate: 2.2,
    delivery_rate: 20,
    waste_rate: 5,
    other_variable_rate: 0,
    rent: 1200000,
    management: 250000,
    payroll: 0,
    owner_salary: 2500000,
    utilities: 450000,
    marketing: 0,
    loan_payment: 0,
    maintenance: 100000,
    other_fixed: 0
  },
  "일반 개인카페": {
    equity: 80000000,
    loan: 0,
    deposit: 15000000,
    premium: 0,
    interior: 30000000,
    equipment: 20000000,
    license: 3000000,
    opening_stock: 1500000,
    other_startup: 0,
    avg_ticket: 11000,
    daily_customers: 60,
    business_days: 27,
    monthly_growth: 0,
    cogs_rate: 33,
    card_rate: 2.2,
    delivery_rate: 15,
    waste_rate: 4,
    other_variable_rate: 0,
    rent: 1500000,
    management: 300000,
    payroll: 2000000,
    owner_salary: 2500000,
    utilities: 500000,
    marketing: 0,
    loan_payment: 0,
    maintenance: 150000,
    other_fixed: 0
  },
  "저가 프랜차이즈": {
    equity: 200000000,
    loan: 0,
    deposit: 40000000,
    premium: 0,
    interior: 80000000,
    equipment: 60000000,
    license: 5000000,
    opening_stock: 3000000,
    other_startup: 0,
    avg_ticket: 4700,
    daily_customers: 450,
    business_days: 27,
    monthly_growth: 0,
    cogs_rate: 45,
    card_rate: 2.2,
    delivery_rate: 15,
    waste_rate: 5,
    other_variable_rate: 5,
    rent: 3500000,
    management: 500000,
    payroll: 6000000,
    owner_salary: 2500000,
    utilities: 1000000,
    marketing: 100000,
    loan_payment: 0,
    maintenance: 300000,
    other_fixed: 0
  }
};

const FIELD_GROUPS = [
  ["초기 자금", "오픈 전 필요한 자금과 조달 계획", [
    ["equity", "자기자본", "원"],
    ["loan", "대출금", "원"],
    ["deposit", "보증금", "원"],
    ["premium", "권리금", "원"],
    ["interior", "인테리어", "원"],
    ["equipment", "장비·집기", "원"],
    ["license", "설계·허가·교육", "원"],
    ["opening_stock", "초도 물품", "원"],
    ["other_startup", "기타 창업비", "원"]
  ]],
  ["매출 조건", "예상 고객과 객단가를 보수적으로 입력하세요", [
    ["avg_ticket", "평균 객단가", "원"],
    ["daily_customers", "하루 고객 수", "명"],
    ["business_days", "월 영업일", "일"],
    ["monthly_growth", "월 매출 성장률", "%"]
  ]],
  ["매출 연동 비용", "매출이 늘면 함께 증가하는 비용", [
    ["cogs_rate", "재료 원가율", "%"],
    ["card_rate", "결제 수수료율", "%"],
    ["delivery_rate", "배달 관련 비용률", "%"],
    ["waste_rate", "폐기·서비스율", "%"],
    ["other_variable_rate", "기타 변동비율", "%"]
  ]],
  ["월 고정비", "매출과 관계없이 매월 지출되는 비용", [
    ["rent", "임대료", "원"],
    ["management", "관리비", "원"],
    ["payroll", "직원 인건비", "원"],
    ["owner_salary", "대표자 인건비", "원"],
    ["utilities", "전기·수도·가스", "원"],
    ["marketing", "광고·마케팅", "원"],
    ["loan_payment", "대출 원리금", "원"],
    ["maintenance", "수리·소모품", "원"],
    ["other_fixed", "기타 고정비", "원"]
  ]]
];

const SCENARIOS = [
  ["낙관적", 1.2, -1, "good"],
  ["기준", 1, 0, "primary"],
  ["보수적", 0.75, 2, "warning"],
  ["위기", 0.55, 5, "danger"]
];

const percentKeys = new Set(["monthly_growth", "cogs_rate", "card_rate", "delivery_rate", "waste_rate", "other_variable_rate"]);
const form = document.querySelector("#simulator-form");
const inputs = new Map();
let currentValues = { ...DEFAULTS };
let currentResult = null;
let toastTimer = 0;

function won(value) {
  const sign = value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toLocaleString("ko-KR", { maximumFractionDigits: 0 })}원`;
}

function shortWon(value) {
  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  if (absolute >= 100000000) return `${sign}${(absolute / 100000000).toFixed(1)}억원`;
  if (absolute >= 10000) return `${sign}${Math.round(absolute / 10000).toLocaleString("ko-KR")}만원`;
  return `${sign}${Math.round(absolute).toLocaleString("ko-KR")}원`;
}

function percent(value) {
  return `${value.toFixed(1)}%`;
}

function survivalText(months) {
  if (!Number.isFinite(months)) return "지속 가능";
  if (months >= 120) return "10년 이상";
  if (months <= 0) return "즉시 부족";
  return `${months.toFixed(1)}개월`;
}

function displayValue(key, value) {
  if (percentKeys.has(key)) return `${Number(value).toLocaleString("ko-KR", { maximumFractionDigits: 2 })}`;
  return `${Math.round(Number(value)).toLocaleString("ko-KR")}`;
}

function parseNumber(text) {
  const cleaned = String(text).replaceAll(",", "").replaceAll("원", "").replaceAll("%", "").trim();
  if (!cleaned) return 0;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function calculate(values, customerMultiplier = 1, cogsDelta = 0) {
  const startupCost = ["deposit", "premium", "interior", "equipment", "license", "opening_stock", "other_startup"]
    .reduce((sum, key) => sum + values[key], 0);
  const funding = values.equity + values.loan;
  const reserve = funding - startupCost;
  const revenue = values.avg_ticket * values.daily_customers * customerMultiplier * values.business_days;
  const variableRate = Math.max(0, values.cogs_rate + cogsDelta + values.card_rate + values.delivery_rate + values.waste_rate + values.other_variable_rate);
  const variableCost = revenue * variableRate / 100;
  const fixedCost = ["rent", "management", "payroll", "owner_salary", "utilities", "marketing", "loan_payment", "maintenance", "other_fixed"]
    .reduce((sum, key) => sum + values[key], 0);
  const operatingProfit = revenue - variableCost - fixedCost;
  const profitMargin = revenue > 0 ? operatingProfit / revenue * 100 : 0;
  const contributionRate = 1 - variableRate / 100;
  const bepRevenue = contributionRate > 0 ? fixedCost / contributionRate : Infinity;
  const denominator = values.avg_ticket * Math.max(values.business_days, 1);
  const bepCustomers = denominator > 0 && Number.isFinite(bepRevenue) ? bepRevenue / denominator : Infinity;
  let survivalMonths = Infinity;
  if (reserve < 0) survivalMonths = 0;
  else if (operatingProfit < 0) survivalMonths = reserve > 0 ? reserve / Math.abs(operatingProfit) : 0;
  const recoverableInvestment = Math.max(0, startupCost - values.deposit);
  const paybackMonths = operatingProfit > 0 ? recoverableInvestment / operatingProfit : Infinity;
  const rentRate = revenue > 0 ? values.rent / revenue * 100 : 0;
  const laborRate = revenue > 0 ? (values.payroll + values.owner_salary) / revenue * 100 : 0;

  return {
    startupCost,
    funding,
    reserve,
    revenue,
    variableRate,
    variableCost,
    fixedCost,
    operatingProfit,
    profitMargin,
    bepRevenue,
    bepCustomers,
    survivalMonths,
    paybackMonths,
    rentRate,
    laborRate
  };
}

function buildForm() {
  const fragment = document.createDocumentFragment();
  FIELD_GROUPS.forEach(([title, description, fields]) => {
    const section = document.createElement("section");
    section.className = "field-group";
    section.innerHTML = `
      <div class="field-group-header">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    `;
    fields.forEach(([key, label, unit]) => {
      const row = document.createElement("div");
      row.className = "field-row";
      row.innerHTML = `
        <label for="${key}">${label}</label>
        <input id="${key}" name="${key}" inputmode="decimal" value="${displayValue(key, DEFAULTS[key])}">
        <b>${unit}</b>
      `;
      const input = row.querySelector("input");
      input.addEventListener("focus", () => {
        input.value = String(parseNumber(input.value));
        input.select();
      });
      input.addEventListener("blur", () => {
        input.value = displayValue(key, parseNumber(input.value));
      });
      input.addEventListener("input", recalculate);
      inputs.set(key, input);
      section.append(row);
    });
    fragment.append(section);
  });
  form.append(fragment);
}

function getValues() {
  const values = {};
  inputs.forEach((input, key) => {
    values[key] = Math.max(0, parseNumber(input.value));
  });
  return values;
}

function setValues(values) {
  Object.keys(DEFAULTS).forEach((key) => {
    const input = inputs.get(key);
    input.value = displayValue(key, values[key] ?? 0);
  });
  recalculate();
}

function setMetric(id, value, sub, level = "") {
  const metric = document.querySelector(`#metric-${id}`);
  metric.textContent = value;
  metric.classList.remove("good", "warning", "danger");
  if (level) metric.classList.add(level);
  document.querySelector(`#metric-${id}-sub`).textContent = sub;
}

function updateStatus(result) {
  const badge = document.querySelector("#status-badge");
  const summary = document.querySelector("#summary-text");
  let text;
  let color;
  let message;
  if (result.reserve < 0) {
    text = "초기자금 부족";
    color = COLORS.danger;
    message = `오픈 시점부터 자금이 ${shortWon(Math.abs(result.reserve))} 부족합니다.`;
  } else if (result.operatingProfit < 0) {
    text = "적자 위험";
    color = COLORS.danger;
    message = `매월 ${shortWon(Math.abs(result.operatingProfit))}의 적자가 예상됩니다. 매출 또는 비용 구조 조정이 필요합니다.`;
  } else if (result.profitMargin < 8) {
    text = "주의";
    color = COLORS.warning;
    message = "흑자는 예상되지만 수익 여유가 작아 매출 감소와 비용 상승에 취약합니다.";
  } else {
    text = "생존 가능";
    color = COLORS.good;
    message = "현재 입력 조건에서는 월 영업흑자가 예상됩니다. 보수적 시나리오도 함께 확인하세요.";
  }
  badge.textContent = text;
  badge.style.backgroundColor = color;
  summary.textContent = message;
}

function updateScenarios(values) {
  const body = document.querySelector("#scenario-body");
  const results = [];
  body.innerHTML = "";
  SCENARIOS.forEach(([name, multiplier, cogsDelta, level]) => {
    const result = calculate(values, multiplier, cogsDelta);
    results.push(result);
    const profitLevel = result.operatingProfit >= 0 ? "good" : "danger";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="${level === "primary" ? "" : level}"><strong>${name}</strong></td>
      <td>${shortWon(result.revenue)}</td>
      <td class="${profitLevel}"><strong>${shortWon(result.operatingProfit)}</strong></td>
      <td>${percent(result.profitMargin)}</td>
      <td>${Math.round(values.daily_customers * multiplier).toLocaleString("ko-KR")}명</td>
      <td>${survivalText(result.survivalMonths)}</td>
    `;
    body.append(tr);
  });

  const conservative = results[2];
  const crisis = results[3];
  let note = "";
  if (conservative.operatingProfit >= 0) {
    note = "보수적 시나리오에서도 흑자가 예상됩니다. 초기 예상 고객 수가 과대평가되지 않았는지 마지막으로 검토해 보세요.";
  } else if (conservative.survivalMonths >= 12) {
    note = `보수적 상황에서는 월 ${shortWon(Math.abs(conservative.operatingProfit))} 적자지만 운영자금으로 약 ${survivalText(conservative.survivalMonths)} 버틸 수 있습니다.`;
  } else {
    note = `보수적 상황에서 생존기간이 ${survivalText(conservative.survivalMonths)}에 불과합니다. 하루 고객 목표와 초기 운영자금을 조정하는 편이 안전합니다.`;
  }
  if (Number.isFinite(crisis.survivalMonths) && crisis.survivalMonths < 6) {
    note += " 위기 상황에 대비한 최소 6개월치 추가 예비자금도 권장됩니다.";
  }
  document.querySelector("#scenario-note").textContent = note;
}

function addRisk(risks, level, title, description) {
  risks.push({ level, title, description });
}

function updateDiagnosis(values, result) {
  const risks = [];
  let score = 100;

  if (result.reserve < 0) {
    addRisk(risks, "danger", "초기 자금이 부족합니다", `예상 창업비보다 조달자금이 ${shortWon(Math.abs(result.reserve))} 부족합니다.`);
    score -= 35;
  } else if (result.reserve < result.fixedCost * 3) {
    addRisk(risks, "danger", "운영 예비자금이 3개월 미만입니다", "오픈 지연과 초기 매출 부진을 버틸 현금이 부족합니다.");
    score -= 22;
  } else if (result.reserve < result.fixedCost * 6) {
    addRisk(risks, "warning", "운영 예비자금이 넉넉하지 않습니다", "고정비 기준 최소 6개월분의 예비자금을 검토하세요.");
    score -= 10;
  } else {
    addRisk(risks, "good", "운영 예비자금", "고정비 6개월 이상을 감당할 수 있는 수준입니다.");
  }

  if (result.operatingProfit < 0) {
    const neededCustomers = Math.max(0, result.bepCustomers - values.daily_customers);
    addRisk(risks, "danger", "기준 시나리오가 적자입니다", `손익분기점을 넘으려면 하루 약 ${neededCustomers.toFixed(1)}명의 추가 고객이 필요합니다.`);
    score -= 30;
  } else if (result.profitMargin < 8) {
    addRisk(risks, "warning", "영업이익률이 낮습니다", `현재 추정 영업이익률은 ${result.profitMargin.toFixed(1)}%입니다. 작은 비용 상승에도 적자로 전환될 수 있습니다.`);
    score -= 13;
  } else {
    addRisk(risks, "good", "기준 시나리오 영업이익", `월 ${shortWon(result.operatingProfit)}, 이익률 ${result.profitMargin.toFixed(1)}%가 예상됩니다.`);
  }

  if (result.rentRate > 15) {
    addRisk(risks, "danger", "임대료 비중이 높습니다", `매출 대비 ${result.rentRate.toFixed(1)}%입니다. 예상 매출이 빗나가면 부담이 커집니다.`);
    score -= 15;
  } else if (result.rentRate > 10) {
    addRisk(risks, "warning", "임대료 비중을 점검하세요", `매출 대비 ${result.rentRate.toFixed(1)}%입니다.`);
    score -= 7;
  }

  if (result.laborRate > 35) {
    addRisk(risks, "danger", "인건비 비중이 높습니다", `대표자 인건비 포함 매출 대비 ${result.laborRate.toFixed(1)}%입니다.`);
    score -= 15;
  } else if (result.laborRate > 28) {
    addRisk(risks, "warning", "인건비 운영계획을 점검하세요", `대표자 인건비 포함 매출 대비 ${result.laborRate.toFixed(1)}%입니다.`);
    score -= 7;
  }

  if (result.variableRate >= 55) {
    addRisk(risks, "danger", "변동비율이 매우 높습니다", `매출의 ${result.variableRate.toFixed(1)}%가 변동비로 지출됩니다.`);
    score -= 15;
  } else if (result.variableRate >= 42) {
    addRisk(risks, "warning", "원가와 수수료 부담이 큽니다", `전체 변동비율이 ${result.variableRate.toFixed(1)}%입니다.`);
    score -= 7;
  }

  const debtRatio = result.funding ? values.loan / result.funding * 100 : 0;
  if (debtRatio > 50) {
    addRisk(risks, "warning", "대출 의존도가 높습니다", `조달자금의 ${debtRatio.toFixed(1)}%가 대출입니다. 금리와 상환 일정을 별도로 검토하세요.`);
    score -= 8;
  }

  score = Math.max(0, Math.min(100, score));
  let grade = "F";
  let title = "창업 조건 재검토 필요";
  let color = COLORS.danger;
  if (score >= 85) {
    grade = "A";
    title = "비교적 안정적인 구조";
    color = COLORS.good;
  } else if (score >= 70) {
    grade = "B";
    title = "조건부 생존 가능";
    color = COLORS.primary;
  } else if (score >= 55) {
    grade = "C";
    title = "보완이 필요한 구조";
    color = COLORS.warning;
  } else if (score >= 40) {
    grade = "D";
    title = "위험도가 높은 구조";
  }

  const gradeLabel = document.querySelector("#grade-label");
  gradeLabel.textContent = grade;
  gradeLabel.style.color = color;
  document.querySelector("#grade-title").textContent = `${title} · 안전점수 ${score}점`;
  document.querySelector("#grade-desc").textContent = "수익성, 초기 유동성, 임대료, 인건비, 변동비와 대출 비중을 종합한 참고 지표입니다.";

  const list = document.querySelector("#risk-list");
  list.innerHTML = "";
  risks.slice(0, 6).forEach((risk) => {
    const item = document.createElement("article");
    item.className = "risk-item";
    item.innerHTML = `
      <div class="risk-bar" style="background:${COLORS[risk.level]}"></div>
      <div class="risk-content">
        <strong>${risk.title}</strong>
        <p>${risk.description}</p>
      </div>
    `;
    list.append(item);
  });
}

function cashFlowPoints(values) {
  const result = calculate(values);
  let cash = result.reserve;
  const points = [cash];
  const growth = values.monthly_growth / 100;
  for (let month = 1; month <= 24; month += 1) {
    const monthRevenue = result.revenue * ((1 + growth) ** (month - 1));
    const monthProfit = monthRevenue * (1 - result.variableRate / 100) - result.fixedCost;
    cash += monthProfit;
    points.push(cash);
  }
  return points;
}

function drawChart() {
  const canvas = document.querySelector("#cashflow-chart");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const points = cashFlowPoints(currentValues);
  const left = rect.width < 520 ? 54 : 76;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const plotW = rect.width - left - right;
  const plotH = rect.height - top - bottom;
  if (plotW <= 0 || plotH <= 0) return;

  let minimum = Math.min(...points, 0);
  let maximum = Math.max(...points, 0);
  if (minimum === maximum) maximum = minimum + 1;
  const padding = (maximum - minimum) * 0.12;
  minimum -= padding;
  maximum += padding;
  const xPos = (index) => left + plotW * index / 24;
  const yPos = (value) => top + (maximum - value) / (maximum - minimum) * plotH;

  ctx.font = "12px Malgun Gothic, sans-serif";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = COLORS.grid;
  ctx.fillStyle = COLORS.muted;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const value = maximum - (maximum - minimum) * i / 4;
    const y = yPos(value);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(rect.width - right, y);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(shortWon(value), left - 8, y);
  }

  const zeroY = yPos(0);
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = COLORS.danger;
  ctx.beginPath();
  ctx.moveTo(left, zeroY);
  ctx.lineTo(rect.width - right, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);

  [0, 6, 12, 18, 24].forEach((month) => {
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(`${month}개월`, xPos(month), rect.height - 18);
  });

  const lineColor = points.at(-1) >= points[0] ? COLORS.good : COLORS.danger;
  ctx.beginPath();
  ctx.moveTo(xPos(0), zeroY);
  points.forEach((value, index) => ctx.lineTo(xPos(index), yPos(value)));
  ctx.lineTo(xPos(24), zeroY);
  ctx.closePath();
  ctx.fillStyle = COLORS.surfaceAlt;
  ctx.fill();

  ctx.beginPath();
  points.forEach((value, index) => {
    const x = xPos(index);
    const y = yPos(value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 3;
  ctx.stroke();

  [0, 6, 12, 18, 24].forEach((index) => {
    const x = xPos(index);
    const y = yPos(points[index]);
    ctx.beginPath();
    ctx.fillStyle = lineColor;
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.surface;
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  ctx.fillStyle = lineColor;
  ctx.font = "700 13px Malgun Gothic, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(shortWon(points.at(-1)), xPos(24) - 4, yPos(points.at(-1)) - 14);
}

function recalculate() {
  currentValues = getValues();
  currentResult = calculate(currentValues);
  const result = currentResult;
  setMetric("revenue", shortWon(result.revenue), `하루 ${currentValues.daily_customers.toLocaleString("ko-KR")}명 x 객단가 ${currentValues.avg_ticket.toLocaleString("ko-KR")}원`);
  setMetric("profit", shortWon(result.operatingProfit), `영업이익률 ${percent(result.profitMargin)}`, result.operatingProfit >= 0 ? "good" : "danger");
  const gap = result.revenue - result.bepRevenue;
  setMetric("bep", Number.isFinite(result.bepRevenue) ? shortWon(result.bepRevenue) : "계산 불가", Number.isFinite(gap) ? `현재 매출 대비 ${shortWon(gap)}` : "변동비율이 100% 이상입니다");
  let survivalLevel = "good";
  if (Number.isFinite(result.survivalMonths)) survivalLevel = result.survivalMonths >= 6 ? "warning" : "danger";
  setMetric("survival", survivalText(result.survivalMonths), `운영 예비자금 ${shortWon(result.reserve)}`, survivalLevel);
  document.querySelector("#reserve-info").textContent = won(result.reserve);
  document.querySelector("#bep-info").textContent = Number.isFinite(result.bepCustomers) ? `하루 ${result.bepCustomers.toFixed(1)}명` : "계산 불가";
  updateStatus(result);
  updateScenarios(currentValues);
  updateDiagnosis(currentValues, result);
  drawChart();
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function saveFile() {
  const data = {
    app: APP_TITLE,
    version: 1,
    savedAt: new Date().toISOString(),
    values: getValues()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "내_카페_생존분석.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("입력한 사업 조건을 JSON으로 저장했습니다.");
}

async function loadFile(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const values = data.values ?? data;
    setValues(values);
    showToast("시뮬레이션 파일을 불러왔습니다.");
  } catch (error) {
    showToast("올바른 시뮬레이션 JSON 파일이 아닙니다.");
  }
}

function bindEvents() {
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.preset;
      setValues(PRESETS[name]);
      showToast(`${name} 예시를 불러왔습니다.`);
    });
  });
  document.querySelector("#reset-button").addEventListener("click", () => {
    setValues(DEFAULTS);
    showToast("모든 입력값을 0으로 초기화했습니다.");
  });
  document.querySelector("#save-button").addEventListener("click", saveFile);
  document.querySelector("#load-file").addEventListener("change", (event) => {
    loadFile(event.target.files[0]);
    event.target.value = "";
  });
  document.querySelectorAll(".tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tabs button").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
        tab.setAttribute("aria-selected", tab === button ? "true" : "false");
      });
      document.querySelectorAll(".tab-panel").forEach((panel) => {
        const active = panel.id === `tab-${button.dataset.tab}`;
        panel.hidden = !active;
        panel.classList.toggle("active", active);
      });
      drawChart();
    });
  });
  window.addEventListener("resize", drawChart);
}

buildForm();
bindEvents();
setValues(DEFAULTS);
