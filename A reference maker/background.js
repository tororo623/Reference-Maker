chrome.commands.onCommand.addListener((command) => {
  if (command === "generate-citation") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentTab = tabs[0];
      
      chrome.scripting.executeScript({
        target: {tabId: currentTab.id},
        func: getCitationWithAuthorAndTitle
      });
    });
  }
});

function getCitationWithAuthorAndTitle() {
  let authorGuess = "";
  
  const metaAuthor = document.querySelector('meta[name="author"]');
  const ogSiteName = document.querySelector('meta[property="og:site_name"]');
  const twitterSite = document.querySelector('meta[name="twitter:site"]');
  
  if (metaAuthor && metaAuthor.content) {
    authorGuess = metaAuthor.content;
  } else if (ogSiteName && ogSiteName.content) {
    authorGuess = ogSiteName.content;
  } else if (twitterSite && twitterSite.content) {
    authorGuess = twitterSite.content;
  } else {
    const titleParts = document.title.split();
    if (titleParts.length > 1) {
      authorGuess = titleParts[titleParts.length - 1].trim();
    }
  }

  const authorInput = prompt("著者名（または機関名・サイト名）を入力してください。\n※空白の場合は著者名なしで生成されます。", authorGuess);

  if (authorInput === null) return;

  const defaultTitle = document.title;
  const titleInput = prompt("記事の題名（タイトル）を確認・修正してください。", defaultTitle);

  if (titleInput === null) return;

  const url = window.location.href;
  
  const today = new Date();
  const yyyy = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  const dateStr = `${yyyy}年${m}月${d}日`;

  let citation = "";
  if (authorInput.trim() !== "") {
    citation = `${authorInput}, 「${titleInput}」, ${url},\n${dateStr}閲覧.`;
  } else {
    citation = `「${titleInput}」, ${url},\n${dateStr}閲覧.`;
  }

  navigator.clipboard.writeText(citation).then(() => {
    alert(`【コピー完了】\n\n${citation}`);
  }).catch(err => {
    alert('コピーに失敗しました: ' + err);
  });
}