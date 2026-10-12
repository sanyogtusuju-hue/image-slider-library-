
class ImageSlider {
  constructor(root) {
    this.root = root;
    this.viewport = root.querySelector(".slider__viewport");
    this.track = root.querySelector(".slider__track");
    this.prevButton = root.querySelector("[data-prev]");
    this.nextButton = root.querySelector("[data-next]");
    this.dotsContainer = root.querySelector("[data-dots]");
    this.status = root.querySelector("[data-status]");

    this.slides = Array.from(this.track.children);
    this.count = this.slides.length;
    this.index = 0;
    this.position = 1;
    this.animating = false;

    if (!this.count) return;

    if (this.count > 1) {
      this.lastClone = this.slides[this.count - 1].cloneNode(true);
      this.firstClone = this.slides[0].cloneNode(true);

      this.lastClone.setAttribute("aria-hidden", "true");
      this.firstClone.setAttribute("aria-hidden", "true");

      this.track.prepend(this.lastClone);
      this.track.append(this.firstClone);
    }

    this.createDots();
    this.bindEvents();
    this.move(false);

    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.move(false));
      this.resizeObserver.observe(this.viewport);
    }
  }

  createDots() {
    this.dots = [];

    this.slides.forEach((slide, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider__dot";
      dot.setAttribute("aria-label", `Go to image ${i + 1}`);

      dot.addEventListener("click", () => this.goTo(i));

      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    });

    this.updateControls();
  }

  bindEvents() {
    this.nextButton.addEventListener("click", () => this.next());
    this.prevButton.addEventListener("click", () => this.previous());

    this.track.addEventListener("transitionend", (event) => {
      if (
        event.target !== this.track ||
        event.propertyName !== "transform"
      ) return;

      if (this.position === this.count + 1) {
        this.position = 1;
        this.move(false);
      } else if (this.position === 0) {
        this.position = this.count;
        this.move(false);
      }

      this.animating = false;
      this.updateControls();
    });

    this.root.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") this.next();
      if (event.key === "ArrowLeft") this.previous();
    });
  }

  move(animate = true) {
    const width = this.viewport.getBoundingClientRect().width;

    this.track.style.transitionDuration = animate ? "450ms" : "0ms";
    this.track.style.transform =
      `translateX(${-this.position * width}px)`;
  }

  next() {
    if (this.animating || this.count < 2) return;

    this.animating = true;
    this.position++;
    this.index = (this.index + 1) % this.count;

    this.move();
    this.updateControls();
  }

  previous() {
    if (this.animating || this.count < 2) return;

    this.animating = true;
    this.position--;
    this.index = (this.index - 1 + this.count) % this.count;

    this.move();
    this.updateControls();
  }

  goTo(i) {
    if (
      this.animating ||
      i === this.index ||
      i < 0 ||
      i >= this.count
    ) return;

    this.index = i;
    this.position = i + 1;
    this.animating = true;

    this.move();
    this.updateControls();
  }

  updateControls() {
    this.dots.forEach((dot, i) => {
      if (i === this.index) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (this.status) {
      this.status.textContent =
        `Image ${this.index + 1} of ${this.count}`;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-slider]").forEach((slider) => {
    new ImageSlider(slider);
  });
});
