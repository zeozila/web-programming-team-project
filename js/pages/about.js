import { initPage, escapeHtml, REPO_URL } from "../lib/app.js";
import { allPhotos, photoUrl } from "../data/photos.js";
import { handleBrokenImages } from "../lib/cards.js";

initPage("about");
handleBrokenImages();

document.getElementById("repo-link").href = REPO_URL;
document.getElementById("readme-link").href = `${REPO_URL}#readme`;

document.getElementById("credits-body").innerHTML = allPhotos()
  .map(
    (photo) => `
    <tr>
      <td><img src="${photoUrl(photo.key, 330)}" alt="" loading="lazy"></td>
      <td>${escapeHtml(photo.caption)}</td>
      <td><a href="${photo.page}" target="_blank" rel="noopener">${escapeHtml(photo.author)}</a></td>
      <td>${escapeHtml(photo.license)}</td>
    </tr>`
  )
  .join("");
