const tilForm = document.querySelector("#til-form");
const tilList = document.querySelector("#til-list");

tilForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const dateInput = document.querySelector("#til-date");
    const titleInput = document.querySelector("#til-title");
    const contentInput = document.querySelector("#til-content");

    if (!titleInput.value.trim() || !contentInput.value.trim()) {
        alert("제목과 내용을 입력해주세요! (｡•́︿•̀｡)");
        return;
    }

    const newTilItem = document.createElement("article");
    newTilItem.classList.add("til-item");

    newTilItem.innerHTML = `
        <time datetime="${dateInput.value}">${dateInput.value}</time>
        <h3>${titleInput.value}</h3>
        <p>${contentInput.value}</p>
    `;

    newTilItem.style.opacity = "0";
    newTilItem.style.transform = "translateY(20px)";
    newTilItem.style.transition = "all 0.5s";

    tilList.prepend(newTilItem);

    setTimeout(() => {
        newTilItem.style.opacity = "1";
        newTilItem.style.transform = "translateY(0)";
    }, 10);

    tilForm.reset();
});

const galleryImages = document.querySelectorAll(".gallery-grid img");

galleryImages.forEach((img) => {
    img.addEventListener("click", function () {
        this.classList.add("tumble-animation");
        setTimeout(() => {
            this.classList.remove("tumble-animation");
        }, 2000);
    });
});

const profileImage = document.querySelector(".profile-image img");

profileImage.addEventListener("click", function () {
    const modal = document.createElement("div");
    modal.classList.add("profile-modal");

    const enlargedImg = document.createElement("img");
    enlargedImg.src = this.src;
    enlargedImg.alt = this.alt;

    modal.appendChild(enlargedImg);
    document.body.appendChild(modal);

    modal.addEventListener("click", function () {
        this.remove();
    });
});

const contentSections = document.querySelectorAll(".content-section");

contentSections.forEach((section) => {
    section.addEventListener("click", function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;

        this.classList.add("shake-animation");
        setTimeout(() => {
            this.classList.remove("shake-animation");
        }, 500);
    });
});
