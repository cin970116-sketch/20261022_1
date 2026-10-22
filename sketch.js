// 六道幼兒生活常識題目與對應的動畫圖示。
const questions = [
  { text: '吃飯前要先洗手', prompt: '小手上有泡泡！猜猜看，什麼時候要把小手洗乾淨呢？', emoji: '🧼' }, // 用肥皂提醒飯前洗手。
  { text: '早晚記得刷牙', prompt: '亮晶晶的牙刷來囉！早上和晚上，我們要做什麼讓牙齒乾乾淨淨呢？', emoji: '🪥' }, // 用牙刷提醒每天刷牙。
  { text: '玩具玩完要收好', prompt: '玩具熊玩完了，猜猜看，要把它送回哪裡休息呢？', emoji: '🧸' }, // 用玩具提醒收拾物品。
  { text: '過馬路要走斑馬線', prompt: '紅綠燈在看著大家！過馬路時，要走在哪裡才安全呢？', emoji: '🚦' }, // 用號誌提醒安全過馬路。
  { text: '紙類要放進回收桶', prompt: '紙張用完了，猜猜看，要把它放進哪一種桶子呢？', emoji: '♻️' }, // 用回收標誌提醒資源分類。
  { text: '口渴時喝白開水', prompt: '小水杯來幫忙！口渴的時候，我們喝什麼最解渴呢？', emoji: '🥤' } // 用飲水杯提醒補充水分。
];

// 設定畫面的主色，讓介面明亮且容易辨識。
const palette = {
  ink: '#183B36', // 設定主要文字顏色。
  green: '#247A5A', // 設定按鈕與正向提示顏色。
  mint: '#DFF3E8', // 設定淡綠色背景。
  paper: '#FFF9EF', // 設定畫布底色。
  orange: '#F5A34B', // 設定溫暖的強調色。
  coral: '#EF7662', // 設定錯誤與次要強調色。
  blue: '#83C9D1', // 設定卡片輔助色。
  line: '#D8E3D9' // 設定卡片邊線顏色。
};

// 保存載入中的 GIF 圖片元素。
let placements = []; // 記錄每張題目卡目前放入的答案。
let optionTargets = []; // 記錄每個答案目前所在的題目位置。
let optionOrder = []; // 記錄下方答案卡的隨機順序。
let targetRects = []; // 保存上方題目卡的位置資料。
let optionRects = []; // 保存下方答案卡的位置資料。
let currentLayout = {}; // 保存目前畫布的響應式版面資料。
let activeOption = -1; // 記錄正在拖曳的答案編號。
let submitted = false; // 記錄是否已經交卷。
let confettiPieces = []; // 保存成績達標時的彩帶粒子。
let canvasElement; // 保存 p5.js 畫布元素。

// 建立全螢幕畫布並載入六張動畫圖示。
function setup() {
  document.body.style.cssText = 'margin:0;overflow:hidden;background:#FFF9EF;touch-action:none;'; // 移除頁面邊距並停用捲動。
  canvasElement = createCanvas(windowWidth, windowHeight); // 依照瀏覽器視窗建立畫布。
  canvasElement.elt.setAttribute('aria-label', '幼兒生活常識拖曳配對測驗'); // 為畫布加入無障礙名稱。
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2)); // 限制高解析螢幕的繪圖負擔。
  textFont('Trebuchet MS, Arial, sans-serif'); // 設定清楚易讀的介面字體。
  placements = Array(questions.length).fill(-1); // 初始化六個空白作答位置。
  optionTargets = Array(questions.length).fill(-1); // 初始化六個答案的所在位置。
  optionOrder = shuffle(questions.map((question, index) => index)); // 打亂下方答案順序。
}

// 每一影格重繪背景、題目卡與互動狀態。
function draw() {
  currentLayout = calculateLayout(); // 依照目前視窗大小更新版面。
  background(palette.paper); // 填滿溫暖的底色。
  drawBackdrop(); // 繪製輕柔的點狀背景裝飾。
  drawHeader(); // 繪製測驗標題與進度提示。
  drawTargets(); // 繪製上方六個 GIF 配對目標。
  drawOptions(); // 繪製下方六個可拖曳文字答案。
  drawSubmitButton(); // 繪製作答完成後可用的交卷按鈕。
  drawActiveOption(); // 繪製跟隨游標移動的答案卡。
  if (submitted) drawResult(); // 交卷後顯示成績結果視窗。
  drawConfetti(); // 將達標彩帶繪製在成績視窗上方。
}

// 依照視窗尺寸計算目標卡、答案卡與按鈕的位置。
function calculateLayout() {
  const narrow = width < 620; // 判斷是否使用手機版欄位配置。
  const shortScreen = height < 680; // 判斷是否需要壓縮垂直留白。
  const targetTop = shortScreen ? 110 : 128; // 設定目標卡片區域的起始位置。
  const targetAreaHeight = constrain(height * (shortScreen ? 0.29 : 0.34), 158, 300); // 依照畫面高度限制題目區域。
  const targetColumns = 3; // 固定上方圖片目標為三欄。
  const targetRows = 2; // 固定上方圖片目標為兩列。
  const targetGap = narrow ? 9 : 14; // 設定圖片卡片之間的間距。
  const sidePadding = narrow ? 15 : 32; // 設定畫布左右留白。
  const targetWidth = (width - sidePadding * 2 - targetGap * (targetColumns - 1)) / targetColumns; // 計算每張圖片卡片寬度。
  const targetHeight = (targetAreaHeight - targetGap) / targetRows; // 計算每張圖片卡片高度。
  const bankHeadingY = targetTop + targetAreaHeight + (shortScreen ? 18 : 25); // 計算答案區標題位置。
  const bankTop = bankHeadingY + 20; // 計算答案卡片的起始位置。
  const bankColumns = narrow ? 2 : 3; // 手機使用兩欄，較寬畫面使用三欄。
  const bankRows = Math.ceil(questions.length / bankColumns); // 依欄數計算答案卡列數。
  const bankGap = narrow ? 9 : 13; // 設定答案卡片間距。
  const buttonHeight = 48; // 設定交卷按鈕高度。
  const buttonY = height - (shortScreen ? 59 : 68); // 將交卷按鈕固定在畫面下方。
  const bankHeight = Math.max(90, buttonY - bankTop - 17); // 計算答案卡片可使用的高度。
  const bankWidth = width - sidePadding * 2; // 計算答案區可用寬度。
  const optionWidth = (bankWidth - bankGap * (bankColumns - 1)) / bankColumns; // 計算每張答案卡片寬度。
  const optionHeight = (bankHeight - bankGap * (bankRows - 1)) / bankRows; // 計算每張答案卡片高度。
  const targetCards = questions.map((question, index) => { // 計算六張目標卡片座標。
    const column = index % targetColumns; // 取得目標卡所在欄位。
    const row = Math.floor(index / targetColumns); // 取得目標卡所在列。
    return { x: sidePadding + column * (targetWidth + targetGap), y: targetTop + row * (targetHeight + targetGap), w: targetWidth, h: targetHeight }; // 回傳目標卡的矩形範圍。
  });
  const optionCards = optionOrder.map((questionIndex, index) => { // 依照打亂後順序計算答案卡座標。
    const column = index % bankColumns; // 取得答案卡所在欄位。
    const row = Math.floor(index / bankColumns); // 取得答案卡所在列。
    return { x: sidePadding + column * (optionWidth + bankGap), y: bankTop + row * (optionHeight + bankGap), w: optionWidth, h: optionHeight, option: questionIndex }; // 回傳答案卡座標與題目編號。
  });
  return { narrow, shortScreen, targetTop, targetAreaHeight, bankHeadingY, bankTop, bankColumns, bankRows, buttonY, buttonHeight, targetCards, optionCards, sidePadding }; // 回傳本影格所需的版面資料。
}

// 繪製淡色點陣，增加畫布的層次感。
function drawBackdrop() {
  noStroke(); // 移除背景圓點的邊線。
  fill(36, 122, 90, 17); // 設定背景圓點的低透明度。
  const spacing = width < 620 ? 27 : 34; // 依照螢幕寬度調整圓點間距。
  for (let x = 12; x < width; x += spacing) { // 逐欄繪製背景圓點。
    for (let y = 15; y < height; y += spacing) { // 逐列繪製背景圓點。
      circle(x, y, 2); // 在網格交點繪製小圓點。
    }
  }
}

// 繪製標題、引導文字與目前完成數量。
function drawHeader() {
  noStroke(); // 移除標題底色的邊線。
  fill(palette.green); // 設定標題膠囊的底色。
  rect(20, 18, 92, 25, 12); // 繪製測驗類別標籤。
  fill(255); // 設定標籤文字顏色。
  textAlign(CENTER, CENTER); // 將標籤文字置中。
  textSize(12); // 設定標籤字體大小。
  text('生活小達人', 66, 30); // 顯示測驗類別名稱。
  fill(palette.ink); // 設定標題文字顏色。
  textAlign(LEFT, CENTER); // 將主標題靠左排列。
  textSize(width < 620 ? 23 : 29); // 依照螢幕寬度調整標題字體。
  text('生活常識配對挑戰', 20, 62); // 顯示測驗主標題。
  fill('#58736A'); // 設定引導文字顏色。
  textSize(width < 620 ? 12 : 14); // 依照螢幕寬度調整引導文字大小。
  text('把下方的生活好習慣，拖曳到上方正確的圖案。', 21, 87); // 說明配對方式。
  fill(palette.ink); // 設定進度文字顏色。
  textAlign(RIGHT, CENTER); // 將進度文字靠右排列。
  textSize(12); // 設定進度文字大小。
  text(`${placements.filter((option) => option !== -1).length} / 6 已完成`, width - 21, 31); // 顯示目前已完成的題數。
  textAlign(LEFT, CENTER); // 還原後續文字的預設對齊方式。
  fill(palette.ink); // 設定題目區標題顏色。
  textSize(width < 620 ? 13 : 15); // 設定題目區標題大小。
  text('① 看圖找答案', currentLayout.sidePadding, currentLayout.targetTop - 14); // 顯示上方圖片區標題。
  fill('#58736A'); // 設定答案區標題顏色。
  textSize(width < 620 ? 13 : 15); // 設定答案區標題大小。
  text('② 拖曳生活好習慣', currentLayout.sidePadding, currentLayout.bankHeadingY); // 顯示下方文字區標題。
}

// 繪製六張圖片目標卡與已放入的答案。
function drawTargets() {
  targetRects = currentLayout.targetCards; // 保存目前目標卡座標供拖曳判定。
  targetRects.forEach((card, index) => { // 逐張繪製圖片目標卡。
    const answer = placements[index]; // 取得目前放在這張卡的答案。
    const draggingThis = answer === activeOption; // 判斷答案是否正被拖曳。
    drawCardBase(card, answer !== -1 && !draggingThis); // 繪製目標卡片的底色與邊線。
    drawTargetImage(index, card); // 在目標卡片上繪製動畫圖示。
    if (answer !== -1 && !draggingThis) drawPlacedText(questions[answer].text, card); // 顯示已放入的文字答案。
    if (answer === -1 || draggingThis) drawDropHint(card); // 在空白目標上顯示拖放提示。
    fill('#A2B8AA'); // 設定卡片編號顏色。
    noStroke(); // 移除卡片編號邊線。
    textAlign(LEFT, TOP); // 將卡片編號靠左上排列。
    textSize(10); // 設定卡片編號大小。
    text(String(index + 1).padStart(2, '0'), card.x + 8, card.y + 7); // 顯示卡片編號。
  });
}

// 繪製目標卡片的圓角底色與作答狀態邊線。
function drawCardBase(card, filled) {
  const compact = card.h < 94; // 判斷小螢幕是否需要縮小圓角。
  stroke(filled ? palette.green : palette.line); // 依照作答狀態設定卡片邊線。
  strokeWeight(filled ? 2 : 1); // 已作答卡片使用較粗邊線。
  fill(filled ? '#F0FAF3' : '#FFFFFF'); // 依照作答狀態設定卡片底色。
  rect(card.x, card.y, card.w, card.h, compact ? 12 : 16); // 繪製圓角卡片。
  noStroke(); // 還原後續圖案的無邊線狀態。
}

// 將表情圖示置中繪製在上方目標卡片並播放彈跳動畫。
function drawTargetImage(index, card) {
  const size = Math.max(30, Math.min(card.w * 0.36, card.h * 0.45, 78)); // 計算動畫圖示尺寸。
  const centerX = card.x + card.w / 2; // 計算圖示的水平中心位置。
  const centerY = card.y + 10 + size / 2 + Math.sin(frameCount * 0.07 + index) * 3; // 計算上下彈跳的垂直位置。
  push(); // 保存目前繪圖狀態。
  translate(centerX, centerY); // 移動畫布原點至圖示中心。
  rotate(Math.sin(frameCount * 0.045 + index) * 0.05); // 讓圖示輕輕左右搖擺。
  scale(1 + Math.sin(frameCount * 0.07 + index) * 0.035); // 讓圖示隨彈跳微微縮放。
  textAlign(CENTER, CENTER); // 將動畫表情圖示置中。
  textSize(size * 0.72); // 依照卡片大小設定表情圖示尺寸。
  text(questions[index].emoji, 0, 0); // 繪製不依賴網路的生活主題表情圖示。
  pop(); // 還原畫布狀態供後續內容繪製。
}

// 繪製已配對文字，並依照卡片尺寸自動換行。
function drawPlacedText(label, card) {
  const imageSize = Math.max(30, Math.min(card.w * 0.36, card.h * 0.45, 78)); // 計算圖示區高度。
  fill(palette.ink); // 設定已配對文字顏色。
  textAlign(CENTER, CENTER); // 將已配對文字置中。
  textSize(card.h < 94 ? 11 : 13); // 依照卡片高度調整文字大小。
  text(label, card.x + 7, card.y + imageSize + 12, card.w - 14, Math.max(20, card.h - imageSize - 15)); // 將答案限制在卡片內。
}

// 在尚未配對的圖片卡上繪製簡短拖放提示。
function drawDropHint(card) {
  fill('#7A9486'); // 設定拖放提示文字顏色。
  textAlign(CENTER, CENTER); // 將提示文字置中。
  textSize(card.h < 94 ? 9 : 10); // 依照卡片高度調整提示大小。
  text('拖曳答案到這裡', card.x + 4, card.y + card.h - 15, card.w - 8, 14); // 顯示卡片的放置提示。
}

// 繪製下方六張可拖曳文字答案卡。
function drawOptions() {
  optionRects = currentLayout.optionCards; // 保存答案卡座標供滑鼠與觸控操作使用。
  optionRects.forEach((card, index) => { // 逐張繪製答案卡。
    const option = card.option; // 取得答案卡代表的題目編號。
    if (option === activeOption || optionTargets[option] !== -1) return; // 隱藏拖曳中或已放入目標的答案。
    const cardColors = ['#FFFFFF', '#F4FBF7', '#FFF7EA', '#F0FAFB', '#FFF5F1', '#F5F8EC']; // 設定答案卡輪替底色。
    noStroke(); // 移除答案卡片邊線。
    fill(cardColors[index % cardColors.length]); // 設定答案卡片底色。
    rect(card.x, card.y, card.w, card.h, 13); // 繪製答案卡圓角底色。
    stroke(palette.line); // 設定答案卡片邊線。
    strokeWeight(1); // 設定答案卡片邊線粗細。
    noFill(); // 讓答案卡外框保持透明填色。
    rect(card.x, card.y, card.w, card.h, 13); // 繪製答案卡片外框。
    noStroke(); // 移除文字與小圓點的邊線。
    fill([palette.green, palette.orange, palette.blue, palette.coral][index % 4]); // 設定答案卡左側識別色。
    circle(card.x + 15, card.y + card.h / 2, 8); // 繪製答案卡識別圓點。
    fill(palette.ink); // 設定答案文字顏色。
    textAlign(LEFT, CENTER); // 將答案文字靠左置中。
    textSize(card.h < 52 ? 11 : (currentLayout.narrow ? 12 : 14)); // 依照答案卡大小調整文字。
    text(questions[option].text, card.x + 27, card.y + 4, card.w - 35, card.h - 8); // 顯示可拖曳的生活常識句子。
  });
}

// 繪製交卷按鈕並依照完成狀態切換外觀。
function drawSubmitButton() {
  const complete = placements.every((option) => option !== -1); // 判斷六題是否都已放入答案。
  const buttonWidth = Math.min(250, width - 40); // 計算符合窄螢幕的按鈕寬度。
  const buttonX = (width - buttonWidth) / 2; // 將按鈕水平置中。
  const buttonY = currentLayout.buttonY; // 取得固定在底部的按鈕位置。
  noStroke(); // 移除按鈕邊線。
  fill(complete && !submitted ? palette.green : '#B8C7BE'); // 依照作答完成狀態設定按鈕顏色。
  rect(buttonX, buttonY, buttonWidth, currentLayout.buttonHeight, 15); // 繪製交卷按鈕。
  fill('#FFFFFF'); // 設定按鈕文字顏色。
  textAlign(CENTER, CENTER); // 將按鈕文字置中。
  textSize(15); // 設定按鈕文字大小。
  text(submitted ? '已交卷' : (complete ? '交卷看成績' : '完成六題後即可交卷'), width / 2, buttonY + currentLayout.buttonHeight / 2); // 顯示按鈕狀態文字。
  currentLayout.submitRect = { x: buttonX, y: buttonY, w: buttonWidth, h: currentLayout.buttonHeight }; // 保存按鈕範圍供點擊判定。
}

// 繪製游標或手指目前拖曳中的答案卡。
function drawActiveOption() {
  if (activeOption === -1 || submitted) return; // 沒有拖曳中的答案時直接結束。
  const cardWidth = Math.min(width * 0.72, currentLayout.narrow ? 260 : 340); // 計算浮動答案卡寬度。
  const cardHeight = currentLayout.narrow ? 52 : 58; // 計算浮動答案卡高度。
  const cardX = constrain(mouseX - cardWidth / 2, 8, width - cardWidth - 8); // 限制浮動答案卡不超出畫布。
  const cardY = constrain(mouseY - cardHeight / 2, 8, height - cardHeight - 8); // 限制浮動答案卡不超出畫布。
  noStroke(); // 移除浮動卡片邊線。
  fill(255, 255, 255, 235); // 設定浮動卡片的半透明底色。
  rect(cardX, cardY, cardWidth, cardHeight, 14); // 繪製跟隨游標的答案卡。
  stroke(palette.green); // 設定浮動卡片的強調邊線。
  strokeWeight(2); // 加粗浮動卡片外框。
  noFill(); // 讓浮動卡片外框保持透明填色。
  rect(cardX, cardY, cardWidth, cardHeight, 14); // 繪製浮動卡片外框。
  noStroke(); // 還原答案文字的無邊線狀態。
  fill(palette.ink); // 設定浮動答案文字顏色。
  textAlign(CENTER, CENTER); // 將浮動答案文字置中。
  textSize(14); // 設定浮動答案文字大小。
  text(questions[activeOption].text, cardX + 12, cardY + 5, cardWidth - 24, cardHeight - 10); // 顯示正在拖曳的句子。
}

// 使用滑鼠或觸控開始拖曳答案卡，或點擊交卷按鈕。
function mousePressed() {
  if (submitted) { // 判斷是否正在顯示成績結果。
    if (pointInRect(mouseX, mouseY, currentLayout.resultButton)) restartQuiz(); // 點擊再玩一次時重新開始測驗。
    return false; // 阻止結果畫面觸發其他操作。
  }
  const pressedTarget = targetRects.findIndex((card) => pointInRect(mouseX, mouseY, card)); // 尋找目前按下的圖片題目。
  if (pressedTarget !== -1) speakQuestion(pressedTarget); // 按下圖片時播放親切的語音提示。
  if (currentLayout.submitRect && pointInRect(mouseX, mouseY, currentLayout.submitRect) && placements.every((option) => option !== -1)) { // 確認按下可用的交卷按鈕。
    submitQuiz(); // 計算並顯示測驗成績。
    return false; // 阻止按鈕點擊造成畫布選取。
  }
  const bankCard = optionRects.find((card) => optionTargets[card.option] === -1 && pointInRect(mouseX, mouseY, card)); // 尋找被按下且尚未配對的答案卡。
  if (bankCard) { // 確認從答案區開始拖曳。
    activeOption = bankCard.option; // 設定目前拖曳的答案編號。
    return false; // 阻止觸控裝置的預設手勢。
  }
  const placedIndex = targetRects.findIndex((card, index) => placements[index] !== -1 && pointInRect(mouseX, mouseY, card)); // 尋找已放入目標的答案卡。
  if (placedIndex !== -1) { // 確認從上方目標開始拖曳已放入的答案。
    activeOption = placements[placedIndex]; // 取得已放入目標的答案編號。
    placements[placedIndex] = -1; // 清空舊目標以便重新配對。
    optionTargets[activeOption] = -1; // 將答案狀態更新為尚未配對。
    return false; // 阻止觸控裝置的預設手勢。
  }
  return false; // 避免畫布收到不必要的瀏覽器預設操作。
}

// 使用瀏覽器中文語音，以親切活潑的方式朗讀圖片題目。
function speakQuestion(questionIndex) {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return; // 裝置不支援語音時略過播放。
  window.speechSynthesis.cancel(); // 停止上一題語音，避免多段語音重疊。
  const message = new SpeechSynthesisUtterance(questions[questionIndex].prompt); // 建立目前圖片的口語提示。
  const chineseVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('zh-tw')) || window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith('zh')); // 優先選擇繁體中文語音。
  if (chineseVoice) message.voice = chineseVoice; // 使用裝置已安裝的中文語音。
  message.lang = 'zh-TW'; // 指定使用繁體中文發音。
  message.rate = 0.88; // 放慢語速，方便幼兒聆聽。
  message.pitch = 1.15; // 提高音調，營造親切活潑的語氣。
  message.volume = 1; // 將語音音量設定為最大。
  window.speechSynthesis.speak(message); // 播放目前圖片的語音提示。
}

// 將拖曳中的答案放入目標卡片，並處理被替換的答案。
function mouseReleased() {
  if (activeOption === -1) return false; // 沒有拖曳答案時直接結束。
  const destination = targetRects.findIndex((card) => pointInRect(mouseX, mouseY, card)); // 尋找放開位置下方的目標卡。
  if (destination !== -1) { // 確認答案放在有效目標上。
    const replacedOption = placements[destination]; // 取得目標上原有的答案。
    if (replacedOption !== -1) optionTargets[replacedOption] = -1; // 將被替換答案退回下方選項區。
    placements[destination] = activeOption; // 將正在拖曳的答案放入目標。
    optionTargets[activeOption] = destination; // 記錄答案目前所在的目標。
  }
  activeOption = -1; // 結束本次拖曳狀態。
  return false; // 阻止瀏覽器處理滑鼠放開事件。
}

// 判斷游標座標是否落在指定的矩形範圍。
function pointInRect(x, y, rect) {
  return rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h; // 回傳游標是否位於矩形內。
}

// 計算成績並在達到門檻時產生彩帶。
function submitQuiz() {
  submitted = true; // 切換到成績結果狀態。
  const correctCount = placements.filter((answer, index) => answer === index).length; // 計算配對正確的題數。
  if (correctCount / questions.length > 0.8) createConfetti(); // 成績嚴格高於百分之八十時播放彩帶。
}

// 建立多色彩帶粒子並設定各自的初始速度。
function createConfetti() {
  const colors = [palette.green, palette.orange, palette.coral, palette.blue, '#E7C94A', '#EC8DB5']; // 設定彩帶的多種顏色。
  confettiPieces = Array.from({ length: 150 }, () => ({ // 建立一百五十個彩帶粒子。
    x: random(width), // 隨機設定粒子的水平起點。
    y: random(12, Math.min(height * 0.32, 220)), // 從畫面上半部開始落下並立即呈現效果。
    vx: random(-1.8, 1.8), // 設定粒子的水平速度。
    vy: random(1.5, 5), // 設定粒子的垂直速度。
    size: random(5, 10), // 設定粒子的尺寸。
    angle: random(TWO_PI), // 設定粒子的初始旋轉角度。
    spin: random(-0.12, 0.12), // 設定粒子的旋轉速度。
    color: random(colors) // 隨機挑選粒子的顏色。
  }));
}

// 更新彩帶粒子的落下、飄動與旋轉動畫。
function drawConfetti() {
  if (!submitted || confettiPieces.length === 0) return; // 尚未達標交卷時不繪製彩帶。
  noStroke(); // 移除彩帶粒子的邊線。
  confettiPieces.forEach((piece) => { // 逐一更新每個彩帶粒子。
    piece.x += piece.vx; // 更新粒子的水平位置。
    piece.y += piece.vy; // 更新粒子的垂直位置。
    piece.vy += 0.035; // 逐漸增加粒子下落速度。
    piece.angle += piece.spin; // 更新粒子的旋轉角度。
    fill(piece.color); // 設定目前粒子的顏色。
    push(); // 保存目前繪圖座標狀態。
    translate(piece.x, piece.y); // 移動座標原點到粒子位置。
    rotate(piece.angle); // 依照動畫角度旋轉粒子。
    rect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * 0.65, 2); // 繪製旋轉中的彩帶紙片。
    pop(); // 還原畫布座標狀態。
  });
  confettiPieces = confettiPieces.filter((piece) => piece.y < height + 20); // 移除已經落出畫面的粒子。
}

// 繪製成績結果、答對題數與重新挑戰按鈕。
function drawResult() {
  const correctCount = placements.filter((answer, index) => answer === index).length; // 重新計算答對題數。
  const score = Math.round((correctCount / questions.length) * 100); // 將正確率換算成整數百分比。
  const panelWidth = Math.min(width - 36, 410); // 計算符合手機畫面的結果視窗寬度。
  const panelHeight = Math.min(height - 40, 350); // 計算符合短畫面的結果視窗高度。
  const panelX = (width - panelWidth) / 2; // 將結果視窗水平置中。
  const panelY = (height - panelHeight) / 2; // 將結果視窗垂直置中。
  noStroke(); // 移除遮罩邊線。
  fill(24, 59, 54, 105); // 設定半透明背景遮罩。
  rect(0, 0, width, height); // 遮住測驗內容以凸顯結果。
  fill('#FFFFFF'); // 設定結果面板底色。
  rect(panelX, panelY, panelWidth, panelHeight, 24); // 繪製成績結果面板。
  fill(score > 80 ? palette.green : palette.ink); // 依照成績設定分數強調色。
  textAlign(CENTER, CENTER); // 將成績內容置中。
  textSize(17); // 設定結果標題大小。
  text(score > 80 ? '太棒了，生活小達人！' : '挑戰完成！', width / 2, panelY + 43); // 顯示依成績調整的鼓勵文字。
  textSize(width < 420 ? 48 : 58); // 設定大尺寸成績字體。
  text(`${score}%`, width / 2, panelY + 112); // 顯示最終測驗百分比。
  fill('#58736A'); // 設定答對題數文字顏色。
  textSize(14); // 設定答對題數文字大小。
  text(`答對 ${correctCount} 題，共 ${questions.length} 題`, width / 2, panelY + 158); // 顯示實際答對題數。
  const itemSize = Math.min(40, (panelWidth - 54) / questions.length); // 計算六個題目結果標記的尺寸。
  const itemGap = 7; // 設定題目結果標記間距。
  const itemStartX = width / 2 - (itemSize * questions.length + itemGap * (questions.length - 1)) / 2; // 計算結果標記列的起點。
  placements.forEach((answer, index) => { // 逐題顯示答對或答錯狀態。
    fill(answer === index ? '#E0F3E6' : '#FCE9E5'); // 依照答案正確與否設定標記底色。
    circle(itemStartX + index * (itemSize + itemGap) + itemSize / 2, panelY + 204, itemSize); // 繪製每題的圓形狀態標記。
    fill(answer === index ? palette.green : palette.coral); // 依照答案正確與否設定標記文字顏色。
    textSize(12); // 設定題號標記字體大小。
    text(answer === index ? '✓' : '×', itemStartX + index * (itemSize + itemGap) + itemSize / 2, panelY + 204); // 顯示每題作答結果。
  });
  const resultButton = { x: width / 2 - 96, y: panelY + panelHeight - 66, w: 192, h: 44 }; // 計算再玩一次按鈕位置。
  currentLayout.resultButton = resultButton; // 保存按鈕位置供點擊判定。
  noStroke(); // 移除再玩一次按鈕邊線。
  fill(palette.green); // 設定再玩一次按鈕底色。
  rect(resultButton.x, resultButton.y, resultButton.w, resultButton.h, 14); // 繪製再玩一次按鈕。
  fill('#FFFFFF'); // 設定再玩一次按鈕文字顏色。
  textSize(14); // 設定再玩一次按鈕文字大小。
  text('再玩一次', width / 2, resultButton.y + resultButton.h / 2); // 顯示重新開始按鈕文字。
}

// 清除作答與彩帶狀態，重新打亂答案順序。
function restartQuiz() {
  placements = Array(questions.length).fill(-1); // 清空所有已作答目標。
  optionTargets = Array(questions.length).fill(-1); // 將所有答案放回選項區。
  optionOrder = shuffle(questions.map((question, index) => index)); // 重新打亂答案卡順序。
  activeOption = -1; // 清除拖曳中的答案狀態。
  submitted = false; // 回到尚未交卷的狀態。
  confettiPieces = []; // 清除上一輪的彩帶粒子。
}

// 視窗尺寸改變時同步調整全螢幕畫布。
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整為新的視窗尺寸。
  pixelDensity(Math.min(window.devicePixelRatio || 1, 2)); // 重新設定畫布像素密度。
}
