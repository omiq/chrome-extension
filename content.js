const sleep = (timeout) => new Promise((res) => setTimeout(res, timeout));

function getHeight() {
  return Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
}

async function scrollToBottom() {
  let lastScrollHeight = 0;
  let scrollHeight = getHeight();

  while (scrollHeight !== lastScrollHeight) {
    lastScrollHeight = scrollHeight;
    window.scrollTo(0, scrollHeight);
    await sleep(4000);
    scrollHeight = getHeight();
    console.log(lastScrollHeight, scrollHeight);
  }

  console.log("Reached the bottom of the page.");
  window.scrollTo(0, 0);
  await sleep(1000);
}

function* getVideos() {
  const videos = Array.from(document.querySelectorAll("ytd-playlist-video-renderer"));

  for (const video of videos) {
    const title = video.querySelector("#video-title").innerText;
    const progress = video.querySelector("ytd-thumbnail-overlay-resume-playback-renderer")?.data?.percentDurationWatched ?? 0;
    const menu = video.querySelector("ytd-menu-renderer");
    const menuButton = menu.querySelector("yt-icon-button#button");
    const isPrivate = video.querySelector("yt-formatted-string.ytd-badge-supported-renderer")?.textContent.toLowerCase() === "private";
    const url = video.querySelector("a").href;
    yield {
      container: video,
      title,
      progress,
      menu,
      menuButton,
      isPrivate,
      url
    };
  }
}

(async function exportYouTubePlaylist() {
  var json = [];
  await scrollToBottom();
  const videos = Array.from(getVideos());
  console.log(`Found ${videos.length} videos.`);

  videos.forEach(function(video) {
      var url = video.title + "   " + 'https://www.youtube.com' + video.url ;
      json.push(url);
  });

  // Create blob and object URL
  var blob = new Blob([JSON.stringify(json, null, 2)], {type : 'application/json'});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'playlist-videos.txt';

  // Append to the document for Firefox compatibility
  document.body.appendChild(link);

  // Programmatically click the link
  link.click();

  // Clean up after ourselves
  document.body.removeChild(link);
})();
