(() => {
  'use strict';

  const STORAGE_KEY = 'case1021_separate_final_v1';
  const ORIGINAL_SITE = 'https://jalf2840.github.io/case102120/';
  const order = ['intro', 'presence', 'relation', 'change', 'requester', 'motive', 'review', 'reveal', 'epilogue', 'closed'];
  const questionOrder = ['presence', 'relation', 'change', 'requester', 'motive'];
  const pageNames = {
    intro: '最後の証言', presence: '目撃の記録', relation: '二人の関係',
    change: '記録の空白', requester: '匿名の依頼人', motive: '最後の謎',
    review: '証言の最終確認', reveal: '事件の真相',
    epilogue: '植木誠の後日談', closed: 'CASE CLOSED'
  };
  const questions = {
    presence: {
      eyebrow: 'RECORD 01 / SIGHTING', title: '目撃の記録',
      lead: '植木誠が確かめられなかった、たった一つのこと。資料ではなく、あなたが目にした事実を選んでください。',
      prompt: '人物Bに該当する人物を、あなたは直接確認しましたか？',
      answers: [['yes', '確認した'], ['notyet', 'まだ確認していない']],
      correct: 'yes', ok: '新たな目撃証言を受理しました。記録上にしかいなかった人物Bが、実際に確認されました。'
    },
    relation: {
      eyebrow: 'RECORD 02 / IDENTITY', title: '二人の関係',
      lead: '植木誠が資料から導いた結論を、目撃した事実と照らし合わせます。',
      prompt: '人物Aと人物Bは、どのような関係でしたか？',
      answers: [['two', '別々の人物だった'], ['same', '同じ人物の、異なる時点の姿だった'], ['unknown', '関係はわからない']],
      correct: 'same', ok: '人物Aと人物Bは同一人物であると確認されました。'
    },
    change: {
      eyebrow: 'RECORD 03 / CHANGE', title: '記録の空白',
      lead: '人物Aの記録が途切れ、人物Bの記録が始まる。その間に何が起きたのかを記してください。',
      prompt: '人物Aから人物Bへと変わる際、何が変化しましたか？',
      answers: [['name', '名前'], ['hair', '髪型'], ['place', '住んでいる場所']],
      correct: 'hair', ok: '未記録だった変化の内容が補われました。'
    },
    requester: {
      eyebrow: 'RECORD 04 / REQUESTER', title: '匿名の依頼人',
      lead: 'この事件の最初から最後まで、名前を明かさなかった人物。その正体を記してください。',
      prompt: '「人物Bを探してほしい」と依頼したのは誰でしたか？',
      answers: [['ueki', '植木誠'], ['a', '人物A本人'], ['other', '人物A・Bとは関係のない第三者']],
      correct: 'a', ok: '依頼人と人物Aの同一性が確認されました。'
    },
    motive: {
      eyebrow: 'RECORD 05 / MOTIVE', title: '最後の謎',
      lead: '依頼人は最初から人物Bの正体を知っていた。それでも、この事件を仕組んだのはなぜでしょう。',
      prompt: '匿名の依頼人が本当に確かめたかったことは？',
      answers: [['disappear', '人物Aの記録を消せるかどうか'], ['notice', '変わった自分に、大切な人が気づいてくれるかどうか'], ['skill', '探偵の推理能力が本物かどうか']],
      correct: 'notice', ok: '動機が判明しました。これで、依頼を出した理由と確認者が選ばれた理由がつながります。'
    }
  };

  const app = document.getElementById('app');
  const sideStatus = document.getElementById('side-status');
  const sideNote = document.getElementById('side-note');

  // 「現在表示している場面」と「到達済みの最も先の場面」を分けて保存する。
  // そのため、前の資料を読み返しても進行状況が巻き戻らない。
  const blank = () => ({ step: 'intro', furthest: 'intro', answers: {}, submitted: false, completedAt: null });
  let state = blank();

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && order.includes(saved.step) && saved.answers && typeof saved.answers === 'object') {
      const furthest = order.includes(saved.furthest) ? saved.furthest : saved.step;
      state = {
        step: saved.step,
        furthest,
        answers: saved.answers,
        submitted: !!saved.submitted || order.indexOf(furthest) >= order.indexOf('reveal'),
        completedAt: saved.completedAt || null
      };
    }
  } catch (_) { state = blank(); }

  const correctCount = () => questionOrder.filter(k => state.answers[k] === questions[k].correct).length;
  const furthestIndex = () => order.indexOf(state.furthest);
  const canView = (step) => {
    const index = order.indexOf(step);
    if (index < 0 || index > furthestIndex()) return false;
    if (index === 0) return true;
    const preceding = questionOrder.filter(k => order.indexOf(k) < index);
    if (!preceding.every(k => state.answers[k] === questions[k].correct)) return false;
    if (index >= order.indexOf('reveal') && !state.submitted) return false;
    if (step === 'closed' && !state.completedAt) return false;
    return true;
  };
  // 不正・古い保存データの場合は、見られる最初の場面へ戻す。
  if (!canView(state.step)) state.step = 'intro';

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* Private mode: keep playing. */ }
  }
  function move(next, extend = false) {
    if (!order.includes(next)) return;
    // 新しい場面へ進めるのは、正規の「次へ」操作からだけ。
    if (extend && order.indexOf(next) === furthestIndex() + 1) state.furthest = next;
    if (!canView(next)) return;
    state.step = next;
    persist();
    render();
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  function back() {
    const i = order.indexOf(state.step);
    if (i > 0) move(order[i - 1]);
  }
  function forwardInHistory() {
    const i = order.indexOf(state.step);
    if (i < order.length - 1) move(order[i + 1]);
  }
  function advance(next) {
    if (!order.includes(next)) return;
    move(next, true);
  }
  function historyControls() {
    const i = order.indexOf(state.step);
    const prev = i > 0;
    const next = i < order.length - 1 && canView(order[i + 1]);
    const items = order.filter(canView).map(step => `<button type="button" class="history-item ${state.step === step ? 'active' : ''}" data-action="jump" data-step="${step}" ${state.step === step ? 'aria-current="step"' : ''}>${pageNames[step]}</button>`).join('');
    return `<nav class="history-controls" aria-label="読み返し・場面移動">
      <button class="history-button" type="button" data-action="back" ${prev ? '' : 'disabled'}>← 前の場面</button>
      <span class="history-current">${String(i + 1).padStart(2,'0')} / ${String(order.length).padStart(2,'0')}</span>
      <button class="history-button" type="button" data-action="history-next" ${next ? '' : 'disabled'}>次の場面 →</button>
    </nav><details class="history-list"><summary>閲覧済みの記録から選ぶ <span aria-hidden="true">⌄</span></summary><div class="history-items">${items}</div></details><div class="reread-toolbar"><button class="reread-link" type="button" data-action="read-from-start">↺ 最初から読み返す</button><span class="reread-note">これまでの回答を消して、最初から遊び直せます</span></div>`;
  }
  const paragraphs = (...parts) => `<div class="story">${parts.map(part => `<p>${part}</p>`).join('')}</div>`;
  const paper = (id, title, inside) => `<section class="paper"><div class="paper-head"><span class="paper-id">${id}</span><span>UEKI / CASE 1021</span></div><h3>${title}</h3>${inside}</section>`;
  const buttons = (backLabel, nextLabel, nextAction, disabled = false) => `<div class="button-row"><button class="btn quiet" type="button" data-action="back">← ${backLabel}</button><button class="btn" type="button" data-action="${nextAction}" ${disabled ? 'disabled' : ''}>${nextLabel} →</button></div>`;
  const top = (eyebrow, title, lead = '') => `<div class="eyebrow overline">${eyebrow}</div><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}`;

  function intro() {
    return top('FINAL CHAPTER / PERSONAL RECORD', '最後の証言', '「CASE 1021」の調査は、まだ完了していない。') +
      paragraphs(
        '植木誠は、人物Aと人物Bの関係を調べ、一つの結論にたどり着いた。',
        'しかし、いくら資料を調べても<strong>人物Bを実際に見たという証言</strong>は見つからなかった。',
        'そして今、匿名の依頼人が指定した人物のもとへ、最後の確認書が届けられた。'
      ) +
      paper('SEALED / LAST RECORD', '最終確認書', '<dl><dt>事件番号</dt><dd>CASE 1021</dd><dt>宛先</dt><dd>おかねひろと 様</dd><dt>担当探偵</dt><dd>植木 誠</dd><dt>確認結果</dt><dd class="pending">未提出</dd></dl><hr><p>この先に記録するのは、推測ではありません。</p><p>あなたが現実で確かめたことだけを、順番に報告してください。</p>') +
      '<div class="button-row"><button class="btn" type="button" data-action="begin">最後の記録を開く →</button></div>';
  }

  function questionPage(id) {
    const q = questions[id];
    const index = questionOrder.indexOf(id) + 1;
    const chosen = state.answers[id] || '';
    const correct = chosen === q.correct;
    return `<div class="progress-top"><div class="progress-id">RECORD ${String(index).padStart(2,'0')} / 05</div><div class="progress-id">FINAL TESTIMONY</div></div><div class="progress-track"><span style="width:${index * 20}%"></span></div>` +
      top(q.eyebrow, q.title, q.lead) +
      paper('CHECK / 1021', '証言記録', '<dl><dt>証言者</dt><dd>おかねひろと</dd><dt>取扱区分</dt><dd>直接確認</dd></dl>') +
      `<section class="question-panel"><h3>${q.prompt}</h3><div class="answer-grid">${q.answers.map(([value, label], i) => `<button type="button" class="answer" aria-pressed="${chosen === value}" data-answer="${value}" ${state.submitted ? 'disabled' : ''}><span class="number">0${i+1}</span>${label}</button>`).join('')}</div>${chosen ? `<div class="feedback ${correct ? 'ok' : ''}" role="status">${correct ? q.ok : chosen === 'notyet' ? 'まだ確認していない場合、この先の記録は保留となります。' : 'これまでの調査結果と一致しません。もう一度、実際に確認したことを考えてみてください。'}</div>` : ''}</section>` +
      buttons('前の記録', index === 5 ? '証言を確認する' : '次の記録へ', 'next', !correct);
  }

  function review() {
    return top('REPORT / READY', '証言の最終確認', '五つの証言がそろった。あとは調査記録と照合し、事件の結末を明らかにするだけだ。') +
      paper('REPORT-1021 / DRAFT', '最終証言報告書', '<dl><dt>証言者</dt><dd>おかねひろと</dd><dt>人物B</dt><dd>直接確認済み</dd><dt>人物A・B</dt><dd>同一人物</dd><dt>変化</dt><dd>髪型</dd><dt>匿名の依頼人</dt><dd>人物A本人</dd><dt>依頼の目的</dt><dd>変化に気づいてもらうため</dd><dt>状態</dt><dd class="pending">提出待ち</dd></dl><hr><p class="paper-note">この報告を提出すると、事件の真相と植木誠の最後の記録が開かれます。</p>') +
      paragraphs('依頼人が残した謎に、ようやくすべての答えがそろった。') +
      buttons('証言を見直す', state.submitted ? '事件の真相へ戻る' : '最終証言を提出する', state.submitted ? 'see-reveal' : 'submit');
  }

  function reveal() {
    return top('CASE 1021 / RESOLUTION', '事件の真相', '植木探偵事務所に、一通の最終証言が届いた。') +
      paragraphs(
        '事件番号、1021。<br>植木誠はその報告書に目を通し、最初の一行で手を止めた。',
        '「……人物Bが確認された？」',
        '記録の中だけに存在していた人物Bが、実際に目撃されたという。<br>さらに、人物Aと人物Bは<strong>同じ人物</strong>だったことも確認されていた。',
        '二人を分けていたもの。それは、名前でも、居場所でもない。<br><strong>髪型だった。</strong>',
        '人物Aは、髪を切る前の彼女。<br>人物Bは、髪を切って短くなった後の彼女。',
        '「……髪を切った。それだけだったのか」',
        '人物Bの資料が先に用意されていたのは、本人が髪を切る予定を知っていたからだ。<br>まだその姿になっていない以上、人物Bについての実際の目撃証言がなかったことにも説明がつく。'
      ) +
      paper('IDENTITY / CONFIRMED', '記録の正体', '<dl><dt>人物A</dt><dd>髪を切る前の彼女</dd><dt>人物B</dt><dd>髪を切った後の彼女</dd><dt>二人の関係</dt><dd>同一人物</dd><dt>直接の目撃者</dt><dd>おかねひろと</dd></dl>') +
      paragraphs(
        'そして、最後の証言にはさらに不可解な事実が記されていた。',
        '<strong>匿名の依頼人は、人物A本人だった。</strong>',
        'つまり、依頼人も、人物Aも、人物Bも、同じ一人の人物だったのだ。',
        '植木は最初の依頼書を取り出した。<br>「人物Bを探してほしい」――そう依頼した本人こそが、これから人物Bになる人間だった。',
        '「……自分で答えを知っていたのに、わざわざ探偵に頼んだのか？」',
        'だが、報告書の最後に記された<strong>依頼の目的</strong>を読んで、植木はようやく納得した。',
        '依頼人が確かめたかったのは、人物Bの居場所ではない。<br><strong>姿を変えた自分に、大切な人が気づいてくれるかどうか。</strong>',
        'そのために、彼女は自分の変化を一件の不可解な事件として記録した。<br>調査を植木誠に任せ、最後の確認だけを、おかねひろとに託した。',
        '六組の数字に隠された名前は、偶然選ばれたものではなかった。<br>その人に、自分の変化を見つけてもらいたかったのだ。',
        '「……なるほど。最初から、そういう事件だったのか」'
      ) +
      paper('CASE 1021 / CONCLUSION', '捜査上の結論', '<p>匿名の依頼人、人物A、人物Bは同一人物である。</p><p>依頼人は、髪を切る前と後の自分を異なる記録として残し、その変化をおかねひろとに確認してもらうため、本件を仕組んだ。</p><hr><p><strong>本件のすべての疑問は、最終証言によって解消された。</strong></p>') +
      buttons('報告書へ戻る', '植木誠の後日談を読む', 'epilogue');
  }

  function epilogue() {
    return top('EPILOGUE / UEKI MAKOTO', '後日談｜植木誠の独り言', 'CASE 1021、事件終了後。') +
      paragraphs(
        '植木は、完成した報告書を机に置いた。',
        '「いやはや……」',
        '思わず、ため息がこぼれる。',
        '「行方不明者を探すつもりで調べていたら、未来の同一人物。しかも、依頼人本人だったとはね」',
        '植木は椅子の背にもたれ、報告書をもう一度めくった。',
        '「最初から全部知っているなら、俺を呼ぶ必要なんてなかったんじゃないか？」',
        'そうつぶやいて、少し考える。',
        '「……いや、違うか」',
        '依頼人が本当に欲しかったのは、調査結果ではなかった。<br>自分が変わったことを、ある一人に見つけてもらうこと。',
        'だから、最後の確認を自分で行わなかった。<br>探偵にも行わせなかった。',
        '「おかねひろと、か……」',
        '植木は封筒の宛名を見つめた。',
        '「まったく。ずいぶん手の込んだことをする依頼人だ」',
        '机の上では、壁時計が変わらず時を刻んでいる。',
        '植木は報告書を閉じ、事件番号の横に赤い印を押した。',
        '「……まあ、悪くない依頼だったな」',
        '立ち上がって、事務所の明かりを消す。',
        'ドアに手をかけたところで、植木はふと立ち止まった。'
      ) +
      `<div class="dialogue"><div class="speaker">UEKI MAKOTO</div><p>「そういえば、あの依頼人……」</p><p><strong>「髪を切ったこと、ちゃんと気づいてもらえたんだろうな。」</strong></p></div>` +
      paragraphs('少しだけ笑って、植木は事務所を後にした。') +
      buttons('真相を読み返す', state.completedAt ? 'CASE CLOSEDへ進む' : '事件記録を閉じる', state.completedAt ? 'see-closed' : 'close');
  }

  function closed() {
    const time = state.completedAt ? new Date(state.completedAt).toLocaleString('ja-JP', {timeZone:'Asia/Tokyo',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '記録済み';
    return top('CASE 1021 / COMPLETED', '事件解決', '最後の証言を受理し、すべての記録がつながった。') +
      `<div class="big-closure"><div class="label">OFFICIAL CASE REPORT</div><div class="title">CASE<br>CLOSED</div><div class="subtitle">存在しない二人目</div><div class="label" style="margin-top:25px">FINAL TESTIMONY RECEIVED</div></div>` +
      paper('REPORT-1021 / FINAL', '最終調査報告書', `<dl><dt>調査担当</dt><dd>植木 誠</dd><dt>最終確認者</dt><dd>おかねひろと</dd><dt>人物A・B</dt><dd>同一人物</dd><dt>匿名の依頼人</dt><dd>人物A本人</dd><dt>変化の内容</dt><dd>髪型</dd><dt>依頼の目的</dt><dd>変化に気づいてもらうため</dd><dt>事件の状況</dt><dd class="done">解決</dd></dl><hr><p class="paper-note">最終証言の受領：${time}（日本時間）</p><div class="paper-sign">CLOSED</div>`) +
      `<div class="dialogue"><div class="speaker">UEKI / FINAL MESSAGE</div><p>「最後の証言、確かに受け取りました。」</p><p>「俺が調べられたのは、紙の上に残された二人分の記録だけだった。」</p><p>「でも、あなたはその続きを、自分の目で確かめた。」</p><p>「以上をもって、CASE 1021 の調査を終了します。」</p><p>――植木 誠</p></div>` +
      `<div class="button-row"><button class="btn quiet" type="button" data-action="back">← 後日談へ戻る</button><button class="btn quiet" type="button" data-action="read-from-start">最初から読み返す</button><a class="btn secondary" href="${ORIGINAL_SITE}" target="_blank" rel="noopener noreferrer">本編の捜査記録 ↗</a></div>`;
  }

  function render() {
    const view = state.step === 'intro' ? intro() : questions[state.step] ? questionPage(state.step) : state.step === 'review' ? review() : state.step === 'reveal' ? reveal() : state.step === 'epilogue' ? epilogue() : closed();
    app.innerHTML = `${historyControls()}<div class="content-enter">${view}</div>`;
    const complete = state.step === 'closed';
    sideStatus.textContent = state.completedAt ? 'CASE CLOSED' : complete ? 'CASE CLOSED' : state.step === 'epilogue' ? 'REPORT RECEIVED' : state.step === 'reveal' ? 'CASE RESOLVED' : 'AWAITING TESTIMONY';
    sideNote.textContent = complete ? '事件は解決しました。' : questions[state.step] ? `証言 ${questionOrder.indexOf(state.step) + 1} / 5 を記録中。` : state.step === 'intro' ? '最後の証言を待っています。' : state.step === 'review' ? '報告書は提出待ちです。' : '事件の結末を記録しています。';
  }

  app.addEventListener('click', (e) => {
    const choice = e.target.closest('button[data-answer]');
    if (choice && questions[state.step]) {
      if (state.submitted) return; // 提出済みの回答は読み返すだけにする。
      const q = questions[state.step];
      if (!q.answers.some(([key]) => key === choice.dataset.answer)) return;
      state.answers[state.step] = choice.dataset.answer;
      persist();
      render();
      return;
    }
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'begin' && state.step === 'intro') advance('presence');
    else if (action === 'back') back();
    else if (action === 'history-next') forwardInHistory();
    else if (action === 'jump') move(btn.dataset.step);
    else if (action === 'next' && questions[state.step] && state.answers[state.step] === questions[state.step].correct) advance(order[order.indexOf(state.step) + 1]);
    else if (action === 'submit' && state.step === 'review' && correctCount() === 5) { state.submitted = true; advance('reveal'); }
    else if (action === 'see-reveal' && state.step === 'review' && state.submitted) move('reveal');
    else if (action === 'epilogue' && state.step === 'reveal') advance('epilogue');
    else if (action === 'close' && state.step === 'epilogue') { state.completedAt = state.completedAt || new Date().toISOString(); advance('closed'); }
    else if (action === 'see-closed' && state.step === 'epilogue' && state.completedAt) move('closed');
    else if (action === 'read-from-start') {
      // 回答・到達履歴・提出状態を初期化し、何も選んでいない最初の状態に戻す。
      // 本編サイトの保存データは変更しない。
      state = blank();
      persist();
      render();
      window.scrollTo({top: 0, behavior: 'instant'});
    }
  });

  render();
})();
